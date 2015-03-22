'use strict';
/* global d3: false */

angular.module('letters').directive('activity', function() {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function(scope, elem) {
            var element = elem[0];
            var margin = {
                    top: 20,
                    right: 30,
                    bottom: 40,
                    left: 40
                },
                width = element.clientWidth - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            scope.$watch('data', function(data) {
                if (data) {
                    var parseDate = d3.time.format('%Y-%m-%d').parse;
                    var formatTime = d3.time.format('%B %e'); // Format tooltip date / time

                    data.forEach(function(d) {
                        d.date = parseDate(d.date);

                    });

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .ticks(d3.time.week, 1)
                        .tickFormat(d3.time.format('%m/%d'))
                        .orient('bottom');

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(5)
                        .tickFormat(d3.format('d'))
                        .tickSubdivide(0)
                        .orient('left');



                    var div = d3.select('body')
                        .append('div') // declare the tooltip div 
                        .attr('class', 'tooltip') // apply the 'tooltip' class
                        .style('opacity', 0); // set the opacity to nil



                    var line = d3.svg.line()
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y(function(d) {
                            return y(d.count);
                        });

                    x.domain(d3.extent(data, function(d) {
                        return d.date;
                    }));
                    y.domain(d3.extent(data, function(d) {
                        return d.count;
                    }));

                    var chart = d3.select(element).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    chart.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(xAxis);

                    // text label for the x axis
                    chart.append('text')
                        .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + margin.bottom) + ')')
                        .style('text-anchor', 'middle')
                        .text('Date');

                    chart.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    chart.append('text')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', 0 - margin.left)
                        .attr('x', 0 - (height / 2))
                        .attr('dy', '1em')
                        .style('text-anchor', 'middle')
                        .text('# of Wishes Added');

                    chart.append('path')
                        .datum(data)
                        .attr('class', 'line')
                        .attr('d', line);

                    chart.selectAll('dot')
                        .data(data.filter(function(d) {
                            return d.count > 0;
                        }))
                        .enter().append('circle')
                        .attr('class', 'circle')
                        .attr('r', 3)
                        .attr('cx', function(d) {
                            return x(d.date);
                        })
                        .attr('cy', function(d) {
                            return y(d.count);
                        })

                    // Tooltip stuff after this
                    .on('mouseover', function(d) {
                        div.transition()
                            .duration(500)
                            .style('opacity', 0);
                        div.transition()
                            .duration(200)
                            .style('opacity', .9);
                        div.html(
                            formatTime(d.date) +
                            '<br/>Wishes Added: ' + d.count)
                            .style('left', (d3.event.pageX) + 'px')
                            .style('top', (d3.event.pageY - 28) + 'px');
                    });

                }
            }, true);
        }
    };
});