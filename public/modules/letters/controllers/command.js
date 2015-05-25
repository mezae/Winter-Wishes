'use strict';
/* global _: false */

angular.module('letters').controller('CommandController', ['$scope', '$window', '$http', '$stateParams', '$location', 'Authentication', 'Agencies', 'socket',
    function($scope, $window, $http, $stateParams, $location, Authentication, Agencies, socket) {
        $scope.user = Authentication.user;

        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();
        if ($location.search()) $scope.query = $location.search();

        $scope.needToUpdate = false; //helps hide sidebar when it's not needed
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        $scope.updateURL = function(undo) {
            if (undo) $scope.query.status = null;
            if ($scope.query.status) {
                $location.search('status', $scope.query.status);
            } else {
                $location.search('status', null);
            }
        };

        $scope.find = function() {
            if ($scope.user.status > 0) {
                Agencies.query({}, function(users) {
                    $scope.partners = users;
                    socket.syncUpdates('users', $scope.partners);
                });
            }
        };

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/signup', credentials).success(function(response) {
                console.log('new partner added');
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        //Allows admin to create multiple new accounts
        function signups(file) {
            $http.post('/auth/signups', file).success(function(response) {
                $scope.user = response;
                $scope.find();
                $scope.alert.active = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        //Allow user to upload file to add accounts in bulk
        //Makes sure CSV file includes required fields, otherwise lets user which fields are missing
        $scope.handleFileSelect = function() {
            if ($scope.file.length) {
                if ($scope.file[0].type !== 'text/csv') {
                    $scope.alert = {
                        active: true,
                        type: 'danger',
                        msg: 'Must be a csv file!'
                    };
                } else {
                    var file = $scope.file[0];
                    var reader = new FileReader();
                    reader.onload = function(file) {
                        var content = file.target.result;
                        var rows = content.split(/[\r\n|\n]+/);
                        var headers = rows.shift();
                        var required_fields = ['Agency Code', 'Agency Name', 'Contact Name', 'Contact E-mail', 'Accepted Children', 'Accepted Teens', 'Accepted Seniors'];
                        var missing_fields = [];

                        _.forEach(required_fields, function(field) {
                            if (!_.includes(headers, field)) {
                                missing_fields.push(field);
                            }
                        });

                        if (missing_fields.length) {
                            $scope.alert = {
                                active: true,
                                type: 'danger',
                                msg: 'Your csv file could not be uploaded. It is missing the following columns: ' + missing_fields.join(', ') + '.'
                            };
                        } else {
                            $scope.alert = {
                                active: true,
                                type: 'info',
                                msg: 'Great! Your tracking forms will appear shortly...'
                            };
                            signups({
                                file: content
                            });
                        }
                    };
                    reader.readAsText(file);
                    $scope.needToUpdate = false;
                }
                $scope.file[0] = undefined;
            }
        };

        //Allows user to add/update a partner
        $scope.saveAgency = function() {
            $scope.alert.active = false;
            if (typeof $scope.partner.children === 'undefined') $scope.partner.children = 0;
            if (typeof $scope.partner.teens === 'undefined') $scope.partner.teens = 0;
            if (typeof $scope.partner.seniors === 'undefined') $scope.partner.seniors = 0;
            var lettersTotal = $scope.partner.children + $scope.partner.teens + $scope.partner.seniors;
            if (lettersTotal > 0) {
                if ($scope.isNewAgency) {
                    if (_.find($scope.partners, {
                        'username': $scope.partner.username
                    })) {
                        $scope.alert = {
                            active: true,
                            type: 'danger',
                            msg: $scope.partner.username + ' already exists. Please edit the existing copy to avoid duplicates.'
                        };
                    } else {
                        signup($scope.partner);
                    }
                } else {
                    Agencies.update($scope.partner);
                }
                $scope.hideSidebar();
            } else {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: 'A tracking form must include at least one letter.'
                };
            }
        };


        //Allow user to delete selected partner and all associated recipients
        $scope.deleteAgency = function(selected) {
            var confirmation = $window.prompt('Please type DELETE to remove ' + selected.agency + '.');
            if (confirmation === 'DELETE') {
                $http.delete('/agency/' + selected.username);
            }
        };

        //Show current state of partner that user wants to edit
        $scope.showSidebar = function(selected) {
            $scope.isNewAgency = selected ? false : true;
            $scope.partner = selected;
            $scope.needToUpdate = true;
        };

        $scope.hideSidebar = function() {
            $scope.partner = null;
            $scope.needToUpdate = false;
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('users');
        });

    }
]);