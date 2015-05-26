'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$location', '$filter', '$http', 'Authentication', 'Users', 'Agencies', 'Articles',
    function($scope, $window, $location, $filter, $http, Authentication, Users, Agencies, Articles) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.users = Agencies.query({
            role: 'admin'
        });

        $scope.viewData = function(tab) {
            $scope.setting = tab;

            $scope.calendar = {
                startDate: null,
                endDate: null,
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
        };

        $scope.saveDueDate = function() {
            var user = new Users($scope.user);
            user.$update(function(response) {
                $scope.user = response;
            }, function(response) {
                console.log(response.data.message);
            });
        };

        $scope.viewAdmins = function() {
            $scope.setting = 'admins';
            $scope.credentials = {};
        };

        $scope.viewNotifications = function() {
            $scope.setting = 'notify';
            $scope.permission = Notification.permission === 'granted';
        };

        //Helps create a downloadable csv version of the tracking form
        $scope.downloadCSV = function() {
            $scope.error = null;
            $scope.total = null;
            if ($scope.calendar.startDate && $scope.calendar.endDate) {
                if ($scope.calendar.startDate > $scope.calendar.endDate) {
                    $scope.error = 'Start date must come before or be equal to end date.';
                } else {
                    var headers = ['track', 'type', 'name', 'age', 'gender', 'gift'];
                    headers.push('flagged');
                    var csvString = headers.join(',') + '\r\n';
                    var Recipients = Articles.query({
                        start: $scope.calendar.startDate,
                        end: $scope.calendar.endDate
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

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/newadmin', credentials).success(function(response) {
                console.log('new admin added');
                $scope.newAdmin = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        $scope.saveAdmin = function() {
            console.log($scope.credentials);
            signup($scope.credentials);
        };

        $scope.allowNotifications = function() {
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function(permission) {
                    if (permission === 'granted') {
                        $scope.permission = true;
                        var notification = new Notification('Hi there!');
                    }
                });
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
    }
]);