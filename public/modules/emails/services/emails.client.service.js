'use strict';

//Emails service used for communicating with the emails REST endpoints
angular.module('emails').factory('Emails', ['$resource',
    function($resource) {
        return $resource('emails/:emailId/:controller', {
            emailId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);