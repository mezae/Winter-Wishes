'use strict';

angular.module('letters').controller('MappingModalCtrl', ['$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'arrays',
    function($state, $scope, $filter, $modalInstance, Authentication, arrays) {
        $scope.user = Authentication.user;
        $scope.required_fields = arrays.required_fields;
        $scope.model = {
            lists: {
                A: [],
                B: []
            }
        };

        for (var i = 0; i < arrays.headers.length; ++i) {
            var field = $scope.required_fields[i];
            var isValidColumn = arrays.headers.indexOf(field);
            if (isValidColumn > -1) {
                $scope.model.lists.B.push({label: arrays.headers[isValidColumn]});
            } else {
                $scope.model.lists.A.push({label: arrays.headers[i]});
            }
        }

        // $scope.create = function() {
        //     var article = new Mapping({
        //         type: arrays.type,
        //         map: $scope.model.lists.B
        //     });
        //     article.$save(function(response) {
        //         console.log('map saved');
        //     }, function(errorResponse) {
        //         $scope.error = errorResponse.data.message;
        //     });
        // };

        // $scope.getMapping = function() {
        //     if ($scope.model.lists.B.length) {
        //         $scope.model.lists.A = $scope.model.lists.A.concat($scope.model.lists.B);
        //     }
        //     $scope.model.lists.B = [];
        //     Mapping.query(function(map) {
        //         var index = _.findIndex(map, {
        //             'type': arrays.type
        //         });
        //         var savedMap = map[index].map;
        //         for (var i = 0; i < $scope.required_fields.length; i++) {
        //             var isValidColumn = _.findIndex($scope.model.lists.A, {
        //                 'label': savedMap[i].label
        //             });
        //             if (isValidColumn > -1) {
        //                 $scope.model.lists.B.push(savedMap[i]);
        //                 $scope.model.lists.A.splice(isValidColumn, 1);
        //             }
        //         }
        //         if ($scope.model.lists.B.length < $scope.required_fields.length) {
        //             console.log('some required fields appear to be missing from your csv file');
        //         } else {
        //             $scope.isSavedMapping = true;
        //         }

        //     });
        // };

        $scope.exitModal = function() {
            if ($scope.model.lists.B.length === $scope.required_fields.length) {
                $modalInstance.close($scope.model.lists.B);
            } else {
                $modalInstance.close();
            }
        };
    }
]);