'use strict';

angular.module('letters')

.controller('SummaryController', ['$scope', '$location', '$filter', 'Authentication', 'Agencies', 'Articles',
	function($scope, $location, $filter, Authentication, Agencies, Articles) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.user) $location.path('/');

		$scope.partners = Agencies.query(function() {

			var donut = c3.generate({
				bindto: '#donut',
				data: {
					columns: [
						['NotYetStarted', $filter('filter')($scope.partners, {status: 0}).length],
						['InProgress', $filter('filter')($scope.partners, {status: 1}).length],
						['Submitted', $filter('filter')($scope.partners, {status: 3}).length],
						['UnderReview', $filter('filter')($scope.partners, {status: 4}).length],
						['Reviewed', $filter('filter')($scope.partners, {status: 5}).length]
					],
					type : 'donut',
					colors: {
						Reviewed: '#428bca',
						UnderReview: '#5bc0de',
						Submitted: '#5cb85c',
						InProgress: '#f0ad4e',
						NotYetStarted: '#d9534f'
					}
				},
				tooltip: {
					format: {
						value: function (value, ratio, id) {
							return value;
						}
					}
				},
				donut: {
					title: 'Progress'
				}
			});
		});

		$scope.letters = Articles.query(function() {
			var useful = $filter('filter')($scope.letters, {updated: '!' + null});
			var counts = {};
			useful.forEach(function(letter) {
				var date = $filter('date')(letter.updated, 'yyyy-MM-dd');
				counts[date] = (counts[date] || 0)+1; 
			});
			var values = Object.keys(counts);
			var frequency = ['Wishes Added'];
			for(var key in counts) {
					frequency.push(counts[key]);
			}
			values.unshift('x');

			var timeline = c3.generate({
				bindto: '#timeline',
				data: {
					x: 'x',
					columns: [
						values,
						frequency
					]
				},
				axis: {
					x: {
						type: 'timeseries',
						tick: {
							format: '%m/%d/%y'
						}
					}
				}
			});

			var wordCounts = { };
			var fillers = ' , a, an, and, but, or, the, for, is, it, my, your, i, am, is, be, you, me, it, he, she, to, please, dont';

			useful.forEach(function(rec) {
				var words = rec.gift.replace(/[\.,-\/#\?!$%\^&\*;:{}=\-_'"`~()]/g, '').split(/\b/);

				for(var i = 0; i < words.length; i++) {
					if(fillers.indexOf(words[i]) === -1) {
						wordCounts[words[i].toLowerCase()] = (wordCounts[words[i].toLowerCase()] || 0) + 1;
					}
				}
			});

			var sortable = [];
			for (var word in wordCounts) {
				sortable.push([word, wordCounts[word]]);
			}
			sortable.sort(function(b, a) {return a[1] - b[1];});
			var topTen = sortable.slice(0, 10);

			var data = [];
			for(var i=0; i < topTen.length; i++) {
				data.push({name: topTen[i][0], value: topTen[i][1]});
			}

			var margin = {top: 20, right: 30, bottom: 30, left: 55},
			width = 550 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

			var y = d3.scale.ordinal()
				.domain(data.map(function(d) { return d.name; }))
				.rangeRoundBands([height, 0], 0.05);

			var x = d3.scale.linear()
				.domain([0, d3.max(data, function(d) { return d.value; })])
				.range([0, width]);

			var yAxis = d3.svg.axis()
					.scale(y)
					.orient('left');

			var chart = d3.select('.common')
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
				.attr('y', function(d) { return y(d.name); })
				.attr('width', function(d) { return x(d.value); })
				.attr('height', y.rangeBand());
			
			chart.selectAll('.btext')
					.data(data)
					.enter().append('text')
					.attr('class', 'btext')
					.attr('x', function(d) { return x(d.value) - 3; })
					.attr('y', function(d) { return y(d.name) + (y.rangeBand()/2); })
					.attr('dy', '.35em')
					.text(function(d) { return d.value; });
			});

}]);