'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('ManageAdminsController', ['$scope', '$window', '$location', '$http', 'Authentication', 'Users', 'Agencies',
    function($scope, $window, $location, $http, Authentication, Users, Agencies) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.find = function() {
            $scope.credentials = {};
            $scope.users = Agencies.query({
                role: 'admin'
            });
        };

        //Allows admin to create new accounts
        $scope.addAdmin = function() {
            $http.post('/auth/newadmin', $scope.credentials).success(function(response) {
                console.log('new admin added');
                $scope.newAdmin = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        };

        $scope.removeAdmin = function(selected) {
            var confirmation = $window.prompt('Are you sure?');
            if (confirmation === 'DELETE') {
                var oldAdmin = selected;
                selected.$remove();
            }
        };

    }
]);