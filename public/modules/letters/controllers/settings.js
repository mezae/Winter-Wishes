'use strict';
/* global _: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$modal', '$location', '$filter', 'Authentication', 'Articles',
    function($scope, $window, $modal, $location, $filter, Authentication, Articles) {
        $scope.user = Authentication.user;
        if (!$scope.user) $location.path('/').replace();

        $scope.startDate = null;
        $scope.endDate = null;

        $scope.calendar = {
            opened: {},
            dateFormat: 'MM/dd/yyyy',
            dateOptions: {
                showWeeks: false
            },
            open: function($event, calID) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.calendar.opened[calID] = true;
            }
        };

        //Helps create a downloadable csv version of the tracking form
        $scope.downloadCSV = function() {
            $scope.error = null;
            $scope.total = null;
            if ($scope.startDate && $scope.endDate) {
                if ($scope.startDate > $scope.endDate) {
                    $scope.error = 'Start date must come before or be equal to end date.';
                } else {
                    var headers = ['track', 'type', 'name', 'age', 'gender', 'gift'];
                    headers.push('flagged');
                    var csvString = headers.join(',') + '\r\n';
                    var Recipients = Articles.query({
                        start: $scope.startDate,
                        end: $scope.endDate
                    }, function() {
                        $scope.total = Recipients.length;
                        _.forEach(Recipients, function(letter) {
                            var type = letter.track.charAt(3);
                            letter.type = type === 'C' ? 'child' : (type === 'T' ? 'teen' : 'senior');
                            _.forEach(headers, function(key) {
                                var line = letter[key];
                                if (key === 'gift' && _.indexOf(letter[key], ',')) {
                                    line = '"' + letter[key] + '"';
                                }
                                csvString += line + ',';
                            });
                            csvString += '\r\n';
                        });

                        var date = $filter('date')(new Date(), 'MM-dd');
                        $scope.fileName = ('WishesToSF_' + date + '.csv');
                        var blob = new Blob([csvString], {
                            type: 'text/csv;charset=UTF-8'
                        });
                        $scope.url = $window.URL.createObjectURL(blob);
                    });
                }
            } else {
                $scope.error = 'Please enter a start date and an end date.';
            }

        };
    }
]);