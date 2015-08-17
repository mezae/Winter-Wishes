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

        $scope.exitModal = function() {
            if ($scope.model.lists.B.length === $scope.required_fields.length) {
                $modalInstance.close($scope.model.lists.B);
            } else {
                $modalInstance.close();
            }
        };
    }
]);