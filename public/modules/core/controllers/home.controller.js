'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
    function($scope, $location, Authentication) {
        $scope.user = Authentication.user;

        function redirect(user) {
            if (user.username === 'AAA') {
                $location.path('/admin');
            } else {
                $location.path('/agency/' + user._id);
            }
        }

        // If user is signed in then redirect back home
        if ($scope.user) redirect($scope.user);
    }
]);