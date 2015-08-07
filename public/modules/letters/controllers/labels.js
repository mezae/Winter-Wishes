'use strict';
/* global _: false */

angular.module('letters').controller('LabelController', ['$scope', '$q', '$window', '$timeout', '$interval', '$http', '$stateParams', '$location', '$modal', 'Authentication', 'Agencies',
    function($scope, $q, $window, $timeout, $interval, $http, $stateParams, $location, $modal, Authentication, Agencies) {
        $scope.user = Authentication.user;

        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        function initRecs(code, types) {
		    var lame = '<td class="lame"></td>';
		    for (var type in types) {
		    	var contents = '<table><tr>';
		        _.forEach(_.range(1, types[type] + 1), function(num) {
		            var letter = code + type + _.padLeft(num, 3, '0');
		            contents += '<td>'+ letter + '</td>';
		            if (num % 80 === 0 || num === types[type]) {
		                contents += '</table><footer></footer>';
		                contents += '<table><tr>';
		            }
		            else if (num % 4 === 0) {
		                contents += '</tr>';
		            }
		            else {
		                contents += lame;
		            }
		        });
		    }
		    return contents;
		}

        $scope.writeServiceLetter = function(file) {
            $http.post('/users/pdf', file, {
                responseType: 'arraybuffer'
            }).success(function(data) {
                var file = new Blob([data], {
                    type: 'application/pdf'
                });
                var fileURL = $window.URL.createObjectURL(file);
                $window.open(fileURL);
            });
        };

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

                headers = {
                    code_col: headers.indexOf(csvheaders[0].label),
                    child_col: headers.indexOf(csvheaders[1].label),
                    teen_col: headers.indexOf(csvheaders[2].label),
                    seniors_col: headers.indexOf(csvheaders[3].label)
                };

                var content = '';
			    _.forEach(rows, function(row) {
			        var record = row.split(',');
			        var code = record[headers.code_col];
			        var children = record[headers.child_col] ? parseInt(record[headers.child_col], 10) : 0;
			        var teens = record[headers.teen_col] ? parseInt(record[headers.teen_col], 10) : 0;
			        var seniors = record[headers.seniors_col] ? parseInt(record[headers.seniors_col], 10) : 0;

			        content += initRecs(code, {'C': children, 'T': teens, 'S': seniors}, []);
			    });

                $scope.writeServiceLetter({content: content});

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