'use strict';
/* global d3: false */

angular.module('letters').directive('donut', ['$location',
    function($location) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            link: function(scope, elem) {
                var element = elem[0];
                var width = element.clientWidth,
                    height = 320,
                    radius = Math.min(width, height) / 2,
                    outerRadius = height / 2 - 20,
                    innerRadius = outerRadius / 2;

                function arcTween(arc, outerRadius, delay) {
                    return function() {
                        d3.select(this)
                            .transition()
                            .delay(delay)
                            .attrTween('d', function(d) {
                                var i = d3.interpolate(d.outerRadius, outerRadius);
                                return function(t) {
                                    d.outerRadius = i(t);
                                    return arc(d);
                                };
                            });
                    };
                }

                scope.$watch('data', function(data) {
                        if (data) {

                            var color = d3.scale.ordinal()
                                .range(['#cd4d52', '#cd884d', '#85c739', '#4d92cd', '#7b39c7']);

                            var pie = d3.layout.pie()
                                .padAngle(0.01)
                                .sort(null)
                                .value(function(d) {
                                    return d.count;
                                });

                            var arc = d3.svg.arc()
                                .padRadius(outerRadius)
                                .innerRadius(innerRadius);

                            var div = d3.select('body')
                                .append('div') // declare the tooltip div 
                                .attr('class', 'donutTooltip') // apply the 'tooltip' class
                                .style('opacity', 0); // set the opacity to nil

                            var svg = d3.select(element).append('svg')
                                .attr('width', width)
                                .attr('height', height);

                            var chart = svg.append('g')
                                .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 - 20) + ')');

                            data.forEach(function(d) {
                                d.count = +d.count;
                            });

                            var g = chart.selectAll('.arc')
                                .data(pie(data))
                                .enter().append('g')
                                .attr('class', 'arc');

                            g.append('path')
                                .each(function(d) {
                                    d.outerRadius = outerRadius - 10;
                                })
                                .attr('d', arc)
                                .style('fill', function(d) {
                                    return color(d.data.status);
                                })
                                .style('cursor', 'pointer')
                                .on('mouseover', function(d) {
                                    d3.select(this)
                                        .transition()
                                        .delay(0)
                                        .attrTween('d', function(d) {
                                            var i = d3.interpolate(d.outerRadius, outerRadius - 2);
                                            return function(t) {
                                                d.outerRadius = i(t);
                                                return arc(d);
                                            };
                                        });
                                    div.transition()
                                        .duration(0)
                                        .style('opacity', 0);
                                    div.transition()
                                        .duration(200)
                                        .style('opacity', 0.8);
                                    div.html(
                                        d.data.name + ': ' + d.data.count)
                                        .style('left', (d3.event.pageX + 14) + 'px')
                                        .style('top', (d3.event.pageY + 14) + 'px');

                                })
                                .on('mousemove', function() {
                                    div
                                        .style('left', (d3.event.pageX + 10) + 'px')
                                        .style('top', (d3.event.pageY + 16) + 'px');
                                })
                                .on('mouseout', function(d) {
                                    d3.select(this)
                                        .transition()
                                        .delay(100)
                                        .attrTween('d', function(d) {
                                            var i = d3.interpolate(d.outerRadius, outerRadius - 10);
                                            return function(t) {
                                                d.outerRadius = i(t);
                                                return arc(d);
                                            };
                                        });
                                    div.transition()
                                        .duration(1000)
                                        .style('opacity', 0);
                                })
                                .on('click', function(d) {
                                    //$location.path('/admin');
                                    window.location.href = '/#!/admin?status=' + d.data.status;
                                });

                            g.append('text')
                                .attr('transform', function(d) {
                                    return 'translate(' + arc.centroid(d) + ')';
                                })
                                .attr('dy', '.35em')
                                .style('text-anchor', 'middle')
                                .text(function(d) {
                                    return d.data.percent;
                                });

                            chart.append('text')
                                .attr('class', 'donutTitle')
                                .style('text-anchor', 'middle')
                                .text('Progress');

                            var legendContainer = svg.append('g')
                                .attr('transform', 'translate(10,' + (height - 30) + ')');

                            var legend = legendContainer.append('g')
                                .attr('class', 'legend');

                            var series = legend.selectAll('.series')
                                .data(pie(data));

                            var seriesEnter = series.enter()
                                .append('g')
                                .attr('class', 'series');

                            seriesEnter.append('circle')
                                .style('fill', function(d, i) {
                                    return color(d.data.status);
                                })
                                .attr('r', 5);

                            seriesEnter.append('text')
                                .style('fill', 'black')
                                .text(function(d) {
                                    return d.data.name;
                                })
                                .attr('text-anchor', 'start')
                                .attr('dy', '.32em')
                                .attr('dx', '8');

                            var ypos = 5,
                                newxpos = 35,
                                maxwidth = 0,
                                xpos;
                            series
                                .attr('transform', function(d, i) {
                                    var length = legendContainer.selectAll('text')[0][i].getComputedTextLength() + 28;
                                    xpos = newxpos;

                                    if (width < xpos + length) {
                                        newxpos = xpos = 35;
                                        ypos += 20;
                                    }

                                    newxpos += length;
                                    if (newxpos > maxwidth) maxwidth = newxpos;

                                    return 'translate(' + xpos + ',' + ypos + ')';
                                });
                        }
                    },
                    true);
            }
        };
    }
]);