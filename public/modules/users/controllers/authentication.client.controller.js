'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
    function($scope, $http, $location, Authentication) {
        $scope.user = Authentication.user;

        function redirect(user) {
            if (user.username === 'AAA') {
                $location.path('/admin');
            } else {
                if (!user.zip) {
                    $location.path('/first');
                } else {
                    $location.path('/agency/' + user.username);
                }
            }
        }

        // If user is signed in then redirect back home
        if ($scope.user) redirect($scope.user);

        $scope.signin = function(form) {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                Authentication.user = response;
                // And redirect to appropriate page
                redirect(response);
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        // $scope.signin = function(form) {
        //     $scope.submitted = true;

        //     if (form) {
        //         console.log('yes');
        //         Authentication.login($scope.credentials)
        //             .then(function() {
        //                 console.log($scope.user);
        //                 // Logged in, redirect to home
        //                 var newURL = $scope.isAdmin ? '/admin' : '/';
        //                 $location.path(newURL);
        //             })
        //             .catch(function(err) {
        //                 $scope.errors.other = err.message;
        //             });
        //     }
        // };

        $scope.signup = function() {
            $http.post('/auth/signup', $scope.credentials).success(function(response) {
                console.log('profile created');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

    }
]);