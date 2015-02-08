'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.user = Authentication.user;

		function redirect(user) {
			if(user.username === 'AAA') {
				$location.path('/admin');
			}
			else {
				$location.path('/agency/' + user._id);
			}
		}

		// If user is signed in then redirect back home
		if($scope.user) redirect($scope.user);

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				Authentication.user = response;
				// And redirect to appropriate page
				redirect(response);
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				console.log('profile created');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		/*
		$scope.credentials = {};
		$scope.credentials.email = 'meza.elmer@gmail.com';
		$scope.credentials.username = 'AAA';
		$scope.credentials.password = 'volunteer87';
		$scope.credentials.agency = 'New York Cares';
		$scope.credentials.acceptance[0] = {
			title: 'Acceptance',
			description: 'Let accepted agencies know the good news and how they can get started',
			subject: 'Winter Wishes 2015 Acceptance',
			message: 'Dear {{partner}},\n\nCongratulations! Your agency has been accepted for {{letters}}.\n\nTo access your tracking form:\nGo to the <a href=\"http://localhost:3000/#!/\">Winter Wishes homepage</a>.\nUsername: {{user}}\nPassword: {{pass}}\n\nSincerely,\nThe Winter Wishes Team'
		}
		$scope.credentials.acceptance[1] = {
			title: 'Reminder',
			description: 'let agencies know that the deadline is coming up',
			subject: 'Winter Wishes 2015 Reminder',
			message: 'Insert message here'
		}
		$scope.signup();
		*/
	}
]);