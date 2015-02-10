'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', '$modal', 'Authentication',
	function($scope, $location, $modal, Authentication) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		var isAdmin = $scope.authentication.user.username === 'AAA' ? true : false;

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.showTutorial = function () {
			if($location.path() === '/admin') {
				$modal.open({
					templateUrl: 'modules/core/views/adminTutorial.html',
					controller: 'AdminModalController',
					backdrop: 'static'
				});
			}
			else if($location.path() === '/admin/email') {
				$modal.open({
					templateUrl: 'modules/core/views/emailTutorial.html',
					controller: 'ModalInstanceCtrl',
					backdrop: 'static'
				});
			}
			else if($location.path().indexOf('/admin/email/') >= 0) {
				$modal.open({
					templateUrl: 'modules/core/views/etemplateTutorial.html',
					controller: 'ModalInstanceCtrl',
					backdrop: 'static'
				});
			}
			else if($location.path().indexOf('agency') >= 0) {
				var template = isAdmin ? 'modules/core/views/reviewTutorial.html' : 'modules/core/views/agencyTutorial.html';
				$modal.open({
					templateUrl: template,
					controller: 'ModalInstanceCtrl',
					backdrop: 'static'
				});
			}
			else {
				$modal.open({
					size: 'sm',
					templateUrl: 'modules/core/views/noTutorial.html',
					controller: 'ModalInstanceCtrl'
				});
			}
		};

		if(!isAdmin && $scope.authentication.user.status === 0) $scope.showTutorial();
	}
])

.controller('AdminModalController', ['$scope', '$modalInstance', '$filter', 'Authentication', 'Users',
  
  function($scope, $modalInstance, $filter, Authentication, Users) {

  	function init() {
		$scope.user = Authentication.user;
		$scope.dueDate = $filter('date')($scope.user.due, 'MM/dd/yy');
	}

	$scope.saveDueDate = function() {
		$scope.user.due = $scope.dueDate;
		var user = new Users($scope.user);
		user.$update(function(response) {
			Authentication.user = response;
			init();
		}, function(response) {
			console.log(response.data.message);
		});
	};

	$scope.open = function($event) {
	  $event.preventDefault();
	  $event.stopPropagation();
	  $scope.opened = true;
	};

	$scope.minDate = new Date();

	$scope.dateOptions = {
	  showWeeks: false
	};

	$scope.exit = function () {
	  $modalInstance.close();
	};

	init();

}])

.controller('ModalInstanceCtrl', 
  ['$scope', '$filter', '$modalInstance', 'Agencies',
  function($scope, $filter, $modalInstance, Agencies) {
  	Agencies.query(function(users) {
  		var admin = $filter('filter')(users, {username: 'AAA'});
		$scope.dueDate = $filter('date')(admin[0].due, 'fullDate');
	});

	$scope.ok = function () {
	  $modalInstance.close();
	};
}]);