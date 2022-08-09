import { useEffect, useRef } from "react";
import * as d3 from 'd3';
import { videogames } from './videogames';

export default function TreeMap() {
    const d3Chart = useRef();

    function sumBySize(d) {
        return d.value;
    }

    useEffect(() => {
        // body and tooltip

        const height = 570;
        const width = 960;

        const data = videogames;
        const body = d3.select('body');

        // Define the div for the tooltip
        const tooltip = body
            .append('div')
            .attr('class', 'tooltip')
            .attr('id', 'tooltip')
            .style('opacity', 0);
        const svg = d3.select(d3Chart.current)
            .attr('height', height)
            .attr('width', width);

        const fader = function (color) {
            return d3.interpolateRgb(color, '#fff')(0.2);
        };

        const color = d3.scaleOrdinal().range(
            // Recreate .schemeCategory20
            [
                '#1f77b4',
                '#aec7e8',
                '#ff7f0e',
                '#ffbb78',
                '#2ca02c',
                '#98df8a',
                '#d62728',
                '#ff9896',
                '#9467bd',
                '#c5b0d5',
                '#8c564b',
                '#c49c94',
                '#e377c2',
                '#f7b6d2',
                '#7f7f7f',
                '#c7c7c7',
                '#bcbd22',
                '#dbdb8d',
                '#17becf',
                '#9edae5'
            ].map(fader)
        );

        const root = d3
            .hierarchy(data)
            .eachBefore(function (d) {
                d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
            })
            .sum(sumBySize)
            .sort(function (a, b) {
                return b.height - a.height || b.value - a.value;
            });

        // 
        const treemap = d3.treemap().size([width, height]).paddingInner(1);

        treemap(root);

        const cell = svg
            .selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('class', 'group')
            .attr('transform', function (d) {
                return 'translate(' + d.x0 + ',' + d.y0 + ')';
            });

        cell
            .append('rect')
            .attr('id', function (d) {
                return d.data.id;
            })
            .attr('class', 'tile')
            .attr('width', function (d) {
                return d.x1 - d.x0;
            })
            .attr('height', function (d) {
                return d.y1 - d.y0;
            })
            .attr('data-name', function (d) {
                return d.data.name;
            })
            .attr('data-category', function (d) {
                return d.data.category;
            })
            .attr('data-value', function (d) {
                return d.data.value;
            })
            .attr('fill', function (d) {
                return color(d.data.category);
            })
            .on('mousemove', function (event, d) {
                tooltip.style('opacity', 0.9);
                tooltip
                    .html(
                        'Name: ' +
                        d.data.name +
                        '<br>Category: ' +
                        d.data.category +
                        '<br>Value: ' +
                        d.data.value
                    )
                    .attr('data-value', d.data.value)
                    .style('left', event.pageX + 10 + 'px')
                    .style('top', event.pageY - 28 + 'px');
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0);
            });

        cell
            .append('text')
            .attr('class', 'tile-text')
            .selectAll('tspan')
            .data(function (d) {
                return d.data.name.split(/(?=[A-Z][^A-Z])/g);
            })
            .enter()
            .append('tspan')
            .attr('x', 4)
            .attr('y', function (d, i) {
                return 13 + i * 10;
            })
            .text(function (d) {
                return d;
            });

        // legend
        let categories = root.leaves().map(function (nodes) {
            return nodes.data.category;
        });
        categories = categories.filter(function (category, index, self) {
            return self.indexOf(category) === index;
        });

        const legend = d3.select('#legend');
        const legendWidth = +legend.attr('width');
        const LEGEND_OFFSET = 10;
        const LEGEND_RECT_SIZE = 15;
        const LEGEND_H_SPACING = 150;
        const LEGEND_V_SPACING = 10;
        const LEGEND_TEXT_X_OFFSET = 3;
        const LEGEND_TEXT_Y_OFFSET = -2;
        const legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

        const legendElem = legend
            .append('g')
            .attr('transform', 'translate(60,' + LEGEND_OFFSET + ')')
            .selectAll('g')
            .data(categories)
            .enter()
            .append('g')
            .attr('transform', function (d, i) {
                return (
                    'translate(' +
                    (i % legendElemsPerRow) * LEGEND_H_SPACING +
                    ',' +
                    (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
                        LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
                    ')'
                );
            });

        legendElem
            .append('rect')
            .attr('width', LEGEND_RECT_SIZE)
            .attr('height', LEGEND_RECT_SIZE)
            .attr('class', 'legend-item')
            .attr('fill', function (d) {
                return color(d);
            });

        legendElem
            .append('text')
            .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
            .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
            .text(function (d) {
                return d;
            });
    }, []);

    return (
        <div className='main'>
            <div className="container">
                <h1 id='title'>Video Game Sales</h1>
                <p id='description'>Top 100 Most Sold Video Games Grouped by Platform</p>
                <div className="visHolder">
                    <svg id='tree-map' ref={d3Chart}></svg>
                    <svg id="legend" width="500"></svg>
                </div>

            </div>

        </div>
    );
}