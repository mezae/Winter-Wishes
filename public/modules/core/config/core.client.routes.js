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
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		})
		.state('admin', {
			url: '/admin',
			templateUrl: 'modules/letters/views/command.html'
		});
	}
]);