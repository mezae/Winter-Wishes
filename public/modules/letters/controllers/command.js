'use strict';

angular.module('letters').controller('ArticlesController', ['$scope', '$window', '$modal', '$http', '$stateParams', '$location', '$filter', 'Authentication', 'Agencies', 'Articles', 'Users',
    function($scope, $window, $modal, $http, $stateParams, $location, $filter, Authentication, Agencies, Articles, Users) {
        $scope.user = Authentication.user;
        if (!$scope.user) $location.path('/');

        $scope.needToUpdate = false; //helps hide sidebar when it's not needed
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        $scope.find = function() {
            $scope.partners = Agencies.query();
        };

        //Allows user to add create new accounts, consider moving to backend
        function signup(credentials) {
            $http.post('/auth/signup', credentials).success(function(response) {
                $scope.partners.push(response);
            }).error(function(response) {
                $scope.error = response.message;
            });
        }

        $scope.fileInfo = function(element) {
            $scope.$apply(function() {
                $scope.file = element.files[0];
                if ($scope.file) {
                    if ($scope.file.name.split('.')[1].toUpperCase() !== 'CSV') {
                        alert('Must be a csv file!');
                        $scope.file = null;
                        return;
                    }
                }
            });
        };

        //Allow user to upload file to add partners in bulk
        //Makes sure CSV file includes required fields, otherwise lets user which fields are missing
        $scope.handleFileSelect = function() {
            var file = $scope.file;
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
                    headers = headers.split(',');
                    var code_col = headers.indexOf('Agency Code');
                    var agency_col = headers.indexOf('Agency Name');
                    var contact_col = headers.indexOf('Contact Name');
                    var email_col = headers.indexOf('Contact E-mail');
                    var child_col = headers.indexOf('Accepted Children');
                    var teen_col = headers.indexOf('Accepted Teens');
                    var seniors_col = headers.indexOf('Accepted Seniors');

                    _.forEach(rows, function(row) {
                        var record = row.split(',');
                        if (!_.includes($scope.partners, record[code_col])) {
                            var newPartner = {
                                username: record[code_col],
                                agency: record[agency_col],
                                contact: record[contact_col],
                                email: record[email_col],
                                children: parseInt(record[child_col], 10),
                                teens: parseInt(record[teen_col], 10),
                                seniors: parseInt(record[seniors_col], 10)
                            };
                            signup(newPartner);
                        }
                    });
                    $scope.alert = {
                        active: true,
                        type: 'success',
                        msg: 'Your csv file was uploaded successfully.'
                    };
                }
            };
            reader.readAsText(file);
            $scope.needToUpdate = false;
            $scope.file = null;
        };

        //Allows user to add/update a partner
        $scope.saveAgency = function() {
            $scope.alert.active = false;
            var lettersTotal = 0;
            _.forEach([$scope.partner.children, $scope.partner.teens, $scope.partner.seniors], function(type) {
                if (type) {
                    lettersTotal += type;
                }
            });
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
                    $scope.partner.$update(function(partner) {
                        console.log(partner.username + ' was updated');
                    }, function(errorResponse) {
                        console.log(errorResponse.data.message);
                    });
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
                selected.$remove(function() {
                    $scope.partners.splice($scope.partners.indexOf(selected), 1);
                }, function(errorResponse) {
                    console.log('Remove Failed');
                });
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

    }
]);