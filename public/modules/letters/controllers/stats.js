'use strict';

angular.module('letters')

.controller('SummaryController', ['$scope', '$window', '$location', '$filter', 'Authentication', 'Agencies', 'Articles',
	function($scope, $window, $location, $filter, Authentication, Agencies, Articles) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.user) $location.path('/');

		angular.element($window).on('resize', function() {
			$scope.$apply();
		});

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

			$scope.gifts = [];
			for(var i=0; i < topTen.length; i++) {
				$scope.gifts.push({name: topTen[i][0], value: topTen[i][1]});
			}

		});

}]);