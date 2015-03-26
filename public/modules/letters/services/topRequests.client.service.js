'use strict';
/* global d3: false */

angular.module('letters').directive('donutChart', function() {
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
                    bottom: 30,
                    left: 55
                },
                width = element.clientWidth - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            scope.$watch('data', function(data) {
                if (data) {
                    var y = d3.scale.ordinal()
                        .domain(data.map(function(d) {
                            return d.name;
                        }))
                        .rangeRoundBands([height, 0], 0.05);

                    var x = d3.scale.linear()
                        .domain([0, d3.max(data, function(d) {
                            return d.value;
                        })])
                        .range([0, width]);

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left');

                    var chart = d3.select(element).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    chart.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    chart.selectAll('.bar')
                        .data(data)
                        .enter().append('rect')
                        .attr('class', 'bar')
                        .attr('y', function(d) {
                            return y(d.name);
                        })
                        .attr('width', function(d) {
                            return x(d.value);
                        })
                        .attr('height', y.rangeBand());

                    chart.selectAll('.btext')
                        .data(data)
                        .enter().append('text')
                        .attr('class', 'btext')
                        .attr('x', function(d) {
                            return x(d.value) - 3;
                        })
                        .attr('y', function(d) {
                            return y(d.name) + (y.rangeBand() / 2);
                        })
                        .attr('dy', '.35em')
                        .text(function(d) {
                            return d.value;
                        });
                }
            }, true);
        }
    };
});