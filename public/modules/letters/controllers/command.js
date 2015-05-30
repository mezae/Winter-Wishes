'use strict';
/* global _: false */

angular.module('letters').controller('CommandController', ['$scope', '$window', '$interval', '$http', '$stateParams', '$location', 'Authentication', 'Agencies', 'socket',
    function($scope, $window, $interval, $http, $stateParams, $location, Authentication, Agencies, socket) {
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
            Agencies.query({}, function(users) {
                $scope.partners = users;
            });
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
                if (response !== 'OK') {
                    $scope.user = response;
                    $scope.fileDone = true;
                }
                $scope.alert.active = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        function findMissingFields(headers) {
            var required_fields = ['Agency Code', 'Agency Name', 'Contact Name', 'Contact E-mail', 'Accepted Children', 'Accepted Teens', 'Accepted Seniors'];
            var missing_fields = [];
            _.forEach(required_fields, function(field) {
                if (!_.includes(headers, field)) {
                    missing_fields.push(field);
                }
            });
            return missing_fields;
        }

        function processBatch(rows, headers) {
            var rowCount = rows.length;
            if (rowCount > 0) {
                var batchQuantity = rowCount > 50 ? 50 : rowCount;
                var batch = rows.splice(0, batchQuantity);

                signups({
                    headers: headers,
                    file: batch,
                    isLast: rows.length === 0
                });
            }
            return rows;
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
                        var missing_fields = findMissingFields(headers);
                        if (missing_fields.length) {
                            $scope.alert = {
                                active: true,
                                type: 'danger',
                                msg: 'Your csv file could not be uploaded. It is missing the following columns: ' + missing_fields.join(', ') + '.'
                            };
                        } else {
                            headers = headers.split(',');
                            headers = {
                                code_col: headers.indexOf('Agency Code'),
                                agency_col: headers.indexOf('Agency Name'),
                                contact_col: headers.indexOf('Contact Name'),
                                email_col: headers.indexOf('Contact E-mail'),
                                child_col: headers.indexOf('Accepted Children'),
                                teen_col: headers.indexOf('Accepted Teens'),
                                seniors_col: headers.indexOf('Accepted Seniors')
                            };

                            $scope.alert = {
                                active: true,
                                type: 'info',
                                msg: 'Great! Your tracking forms will appear shortly...'
                            };
                            $scope.oldUsers = $scope.partners.length;
                            $scope.newUsers = rows.length;

                            rows = processBatch(rows, headers);
                            $interval(function() {
                                rows = processBatch(rows, headers);
                            }, 28000, Math.ceil($scope.newUsers / 50));
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
            $scope.startSearch = false;
        };

        $scope.hideSidebar = function() {
            $scope.partner = null;
            $scope.needToUpdate = false;
            if ($scope.query.username || $scope.query.status) $scope.startSearch = true;
        };



    }
]);