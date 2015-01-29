'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('letters').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);