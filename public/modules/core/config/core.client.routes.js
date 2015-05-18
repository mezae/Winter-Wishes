'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'modules/core/views/home.html'
            })
            .state('first', {
                url: '/settings/profile',
                templateUrl: 'modules/letters/views/firstLogin.html'
            })
            .state('confirm', {
                url: '/settings/profile/first',
                templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'modules/users/views/authentication/signin.client.view.html'
            });
    }
]);