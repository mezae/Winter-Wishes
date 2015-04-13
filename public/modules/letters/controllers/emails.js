'use strict';

angular.module('letters')

.controller('EmailsController', ['$scope', '$modal', '$http', '$stateParams', '$location', '$filter', 'Authentication', 'Agencies', 'Articles', 'Users',
	function($scope, $modal, $http, $stateParams, $location, $filter, Authentication, Agencies, Articles, Users) {
		$scope.user = Authentication.user;

		if (!$scope.user) $location.path('/');

		$scope.etemplate = $filter('filter')($scope.user.acceptance, {title: $stateParams.template})[0];
		var templateIndex = $scope.user.acceptance.indexOf($scope.etemplate);
		$scope.needToUpdate = false;

		//Send e-mail based on template
		$scope.sendEmail = function() {
			$scope.error = null;
			$scope.saveTemplate();
			$http.post('/accept', $scope.user.acceptance[templateIndex]).success(function(response) {
				$location.path('/admin/emails/success');
			}).error(function(response) {
				$scope.error = response.data.message;
			});
		};

		//Create new template or save existing template
		$scope.saveTemplate = function() {
			$scope.success = $scope.error = null;
			if(templateIndex > -1) {
				$scope.user.acceptance[templateIndex] = $scope.etemplate;
			}
			else {
				$scope.user.acceptance.push($scope.etemplate);
			}

			var user = new Users($scope.user);
			user.$update(function(response) {
				$scope.user = response;
				$scope.success = true;
				if($location.path() === '/admin/email') {
					$scope.hideSidebar();
				}
			}, function(response) {
				$scope.error = response.data.message;
			});
		};

		//Show current state of template that user wants to edit
		$scope.showSidebar = function(selected) {
			$scope.etemplate = selected;
			templateIndex = $scope.user.acceptance.indexOf($scope.etemplate);
			$scope.needToUpdate = true;
		};

		//Hide sidebar and clear variables
		$scope.hideSidebar = function() {
			$scope.etemplate = null;
			templateIndex = null;
			$scope.needToUpdate = false;
		};

		//Allow user to delete selected partner and all associated recipients
		$scope.deleteAgency = function(selected) {
			var confirmation = prompt('Please type DELETE to remove the ' + selected.title + ' template.');
			if(confirmation === 'DELETE') {
				$scope.user.acceptance.splice($scope.user.acceptance.indexOf(selected), 1);
				var user = new Users($scope.user);
				user.$update(function(response) {
					$scope.user = response;
					$scope.success = true;
				}, function(response) {
					$scope.error = response.data.message;
				});
			}
		};

}]);