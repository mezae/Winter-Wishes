'use strict';

//Letters service used for communicating with the agencies REST endpoints
angular.module('letters').factory('Agencies', ['$resource',
	function($resource) {
		return $resource('agency/:agencyId', {agencyId: '@_id'}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);