'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$state', 'Authentication',
    function($scope, $http, $state, Authentication) {
        $scope.user = Authentication.user;

        //send user to appropriate page based on role and status
        function redirect(user) {
            if (user.role === 'admin') {
                $state.go('command');
            } else {
                if (user.status === 0) {
                    $state.go('first');
                } else {
                    $state.go('agTracking', {
                        articleId: user.username
                    });
                }
            }
        }

        // If user is signed in, then redirect to appropriate page
        if ($scope.user) redirect($scope.user);

        $scope.signin = function(form) {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                Authentication.user = response;
                $scope.user = Authentication.user;
                // And redirect to appropriate page
                redirect($scope.user);
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

    }
]);