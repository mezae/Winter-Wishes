'use strict';

//Letters service used for communicating with the agencies REST endpoints
angular.module('letters').factory('Agencies', ['$resource',
    function($resource) {
        return $resource('agency/:agencyId', {
            agencyId: '@username'
        }, {
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