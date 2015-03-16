'use strict';

//Letters service used for communicating with the letters REST endpoints
angular.module('letters').factory('Articles', ['$resource',
    function($resource) {
        return $resource('articles/:articleId/:controller', {
            articleId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);