'use strict';
/* global _: false */
/* global LZString: false */

angular.module('letters').controller('LabelController', ['$scope', '$q', '$window', '$timeout', '$interval', '$http', '$stateParams', '$location', '$modal', 'Authentication', 'Agencies',
    function($scope, $q, $window, $timeout, $interval, $http, $stateParams, $location, $modal, Authentication, Agencies) {
        $scope.user = Authentication.user;

        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.fileURLs = [];
        $scope.hideDropzone = false;
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        $scope.writeServiceLetter = function(file) {
            $http.post('/users/pdf', file, {
                responseType: 'arraybuffer'
            }).success(function(data) {
                var file = new Blob([data], {
                    type: 'application/pdf'
                });
                $scope.fileURLs.push($window.URL.createObjectURL(file));
                //$window.open($scope.fileURL);
            });
        };

        function initRecs(code, types, last) {
            var contents = '';
            for (var type in types) {
                    contents += '<table><tr>';
                    _.forEach(_.range(1, types[type] + 1), function(num) {
                        var letter = code + type + _.padLeft(num, 3, '0');
                        contents += '<td>'+ letter + '</td>';
                        //complete the table row if total number is not divisible by four
                        if (num % 4 === 0 || num === types[type]) {
                            contents += '</tr>';
                            if (num !== types[type]) {
                                contents += '<tr>';
                            }
                        }
                        if (num !== types[type] && num % 80 === 0) contents += '</table><p></p><table><tr>';
                    });
                    contents += '</table>';
                //avoid adding extra page
                if (!last) contents += '<p></p>';
            }
            return contents;
        }

        function proccessFile(headers, rows) {
            var required_fields = ['Agency Code', 'Accepted Children', 'Accepted Teens', 'Accepted Seniors'];
            var modal = $modal.open({
                templateUrl: 'modules/letters/views/fileuploadmodal.html',
                controller: 'MappingModalCtrl',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    arrays: function() {
                        return {
                            type: 'Accepted',
                            required_fields: required_fields,
                            headers: headers
                        };
                    }
                }
            });

            modal.result.then(function(csvheaders) {
                $scope.alert = {
                    active: true,
                    type: 'info',
                    msg: 'Great! Your tracking labels will appear shortly...'
                };

                $scope.hideDropzone = true;

                headers = {
                    code_col: headers.indexOf(csvheaders[0].label),
                    child_col: headers.indexOf(csvheaders[1].label),
                    teen_col: headers.indexOf(csvheaders[2].label),
                    seniors_col: headers.indexOf(csvheaders[3].label)
                };

                var content = '';
                var page = 1;
                var i = 0;
                $interval(function() {
                    $scope.alert.active = false;
                    var limit = page * 40 < rows.length ? page * 40 : rows.length - 1;
                    for (i; i <= limit; i++) {
                        var record = rows[i].split(',');
                        var code = record[headers.code_col];
                        var children = record[headers.child_col] ? parseInt(record[headers.child_col], 10) : 0;
                        var teens = record[headers.teen_col] ? parseInt(record[headers.teen_col], 10) : 0;
                        var seniors = record[headers.seniors_col] ? parseInt(record[headers.seniors_col], 10) : 0;
                        var last = i === limit || (i > 0 && i % 40 === 0);
                        var types = {};
                        if (children) types['C'] = children;
                        if (teens) types['T'] = teens;
                        if (seniors) types['S'] = seniors;
                        content += initRecs(code, types, last);
                        if (last) {
                            $scope.writeServiceLetter({content: LZString.compressToEncodedURIComponent(content), page: page});
                            content = '';
                            page++;
                        }
                    }
                }, 7000, Math.ceil(rows.length/40));
                

            });
        }

        //Allow user to upload file to add accounts in bulk
        //Makes sure CSV file includes required fields, otherwise lets user which fields are missing
        $scope.handleFileSelect = function(files) {
            if (files.length === 0) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: 'Must be a csv file!'
                };
            } else {
                var file = files[0];
                var reader = new FileReader();
                reader.onload = function(file) {
                    var content = file.target.result;
                    var rows = content.split(/[\r\n|\n]+/);
                    var headers = rows.shift();
                    headers = headers.split(',');
                    proccessFile(headers, rows);
                };
                reader.readAsText(file);
                files[0] = undefined;
            }
        };

    }
    ]);