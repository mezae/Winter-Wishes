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

            var status = _.countBy($scope.partners, function(tf) {
                return tf.status;
            });

            var donut = c3.generate({
                bindto: '#donut',
                data: {
                    columns: [
                        ['NotYetStarted', status[0]],
                        ['InProgress', status[1]],
                        ['Submitted', status[3]],
                        ['UnderReview', status[4]],
                        ['Reviewed', status[5]]
                    ],
                    type: 'donut',
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
                        value: function(value, ratio, id) {
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
            var useful = $filter('filter')($scope.letters, {
                updated: '!' + null
            });

            var counts = _.countBy(useful, function(letter) {
                return $filter('date')(letter.updated, 'yyyy-MM-dd');
            });

            var values = ['x'];
            var frequency = ['Wishes Added'];
            _.forEach(counts, function(count, date) {
                values.push(date);
                frequency.push(count);
            });

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
                            format: '%m/%d'
                        }
                    }
                }
            });

            var wordCounts = [];
            var fillers = ' , a, an, and, but, or, the, for, is, it, my, your, i, am, is, be, you, me, it, he, she, to, please, dont';

            _.forEach(useful, function(letter) {
                var words = _.words(letter.gift);

                _.forEach(words, function(word) {
                    word = word.toLowerCase();
                    if (!_.includes(fillers, word)) {
                        var cc = _.find(wordCounts, {
                            'name': word
                        });
                        if (cc) {
                            cc.value += 1;
                        } else {
                            wordCounts.push({
                                name: word,
                                value: 1
                            });
                        }
                    }
                });
            });

            var sorted = _.sortBy(wordCounts, function(word) {
                return -word.value;
            });

            $scope.gifts = _.take(sorted, 10);

        });

    }
]);