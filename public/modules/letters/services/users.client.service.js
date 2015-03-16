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

// angular.module('2meanApp')
//     .factory('User', function($resource) {
//         return $resource('/api/users/:id/:controller', {
//             id: '@_id'
//         }, {
//             changePassword: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'password'
//                 }
//             },
//             updateProfile: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'profile'
//                 }
//             },
//             get: {
//                 method: 'GET',
//                 params: {
//                     id: 'me'
//                 }
//             }
//         });
//     });