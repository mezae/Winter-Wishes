'use strict';
/* global _: false */

angular.module('letters')

.controller('SummaryController', ['$scope', '$window', '$location', '$filter', 'Authentication', 'Agencies', 'Articles',
    function($scope, $window, $location, $filter, Authentication, Agencies, Articles) {
        $scope.authentication = Authentication;

        if (!$scope.authentication.user) $location.path('/');

        angular.element($window).on('resize', function() {
            $scope.$apply();
        });

        $scope.partners = Agencies.query(function() {


            var names = ['Not Yet Started', 'In Progress', 'Completed', 'Submitted', 'Under Review', 'Reviewed'];
            var groups = _.countBy($scope.partners, function(tf) {
                return tf.status;
            });

            $scope.status = [];
            _.forEach(groups, function(c, g) {
                $scope.status.push({
                    status: g,
                    name: names[g],
                    count: c,
                    percent: (c / $scope.partners.length * 100).toFixed(1) + '%'
                });
            });

        });

        $scope.letters = Articles.query(function() {
            var useful = $filter('filter')($scope.letters, {
                updated: '!' + null
            });

            var counts = _.countBy(useful, function(letter) {
                return $filter('date')(letter.updated, 'yyyy-MM-dd');
            });

            var activeDays = [];
            _.forEach(counts, function(count, date) {
                activeDays.push(date);
            });

            activeDays = activeDays.sort(function(a, b) {
                return b < a;
            });

            $scope.wishesAdded = [];
            var current = activeDays[0];
            var endDate = new Date();
            endDate.setDate(endDate.getDate() + 1);
            endDate = $filter('date')(endDate, 'yyyy-MM-dd');
            while (current !== endDate) {
                $scope.wishesAdded.push({
                    date: current,
                    count: counts[current] ? counts[current] : 0
                });
                current = new Date(current);
                current.setDate(current.getDate() + 2);
                current = $filter('date')(current, 'yyyy-MM-dd');
            }

            var wordCounts = [];
            var fillers = ' , a, an, and, but, or, the, this, that, for, is, it, my, your, i, am, is, be, you, me, it, he, she, to, please, dont, who, what, where, when, why, how, which, with';

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