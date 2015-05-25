'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$modal', '$location', '$filter', '$http', 'Authentication', 'Users', 'Agencies', 'Articles',
    function($scope, $window, $modal, $location, $filter, $http, Authentication, Users, Agencies, Articles) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.users = Agencies.query({
            role: 'admin'
        });

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

        $scope.reset = function() {
            var confirmation = $window.prompt('Please type FOREVER to wipe all data.');
            if (confirmation === 'FOREVER') {
                $http.get('/users/reset').success(function(response) {
                    // If successful we assign the response to the global user model
                    Authentication.user = response;
                    $scope.user.status = 0;
                    Users.update($scope.user);
                }).error(function(response) {
                    $scope.error = response.message;
                });
            }
        };

        $scope.allowNotifications = function() {
            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
            }

            // Let's check whether notification permissions have alredy been granted
            else if (Notification.permission === "granted") {
                // If it's okay let's create a notification
                var notification = new Notification("Hi there!");
            }

            // Otherwise, we need to ask the user for permission
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function(permission) {
                    // If the user accepts, let's create a notification
                    if (permission === "granted") {
                        var notification = new Notification("Hi there!");
                    }
                });
            }

            // At last, if the user has denied notifications, and you 
            // want to be respectful there is no need to bother them any more.
        };
    }
]);