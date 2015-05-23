'use strict';

angular.module('emails')

.controller('EmailController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Emails',
    function($scope, $http, $stateParams, $location, Authentication, Emails) {
        $scope.user = Authentication.user;

        $scope.findOne = function() {
            $scope.user = Authentication.user;

            if (!$scope.user) {
                $location.path('/');
            } else {
                $scope.etemplate = Emails.get({
                    emailId: $stateParams.template
                });
            }
        };

        //Update existing template
        $scope.saveTemplate = function() {
            $scope.success = $scope.error = null;

            Emails.update($scope.etemplate, function(response) {
                $scope.etemplate = response;
                $scope.success = true;
            }, function(response) {
                $scope.error = response;
            });
        };

        //Send e-mail based on template
        $scope.sendEmail = function() {
            $scope.error = null;
            $scope.saveTemplate();
            $http.post('/accept', $scope.etemplate).success(function(response) {
                $location.path('/admin/emails/success');
            }).error(function(response) {
                $scope.error = response;
            });
        };

    }
]);