'use strict';

angular.module('letters').controller('AgencyController', 
	['$scope', '$stateParams', '$location', '$filter' ,'$modal', 'Authentication', 'Articles', 'Agencies', 'Users',
	function($scope, $stateParams, $location, $filter, $modal, Authentication, Articles, Agencies, Users) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.user) $location.path('/');

		$scope.adminView = $scope.authentication.user.username === 'AAA' ? true : false;
		$scope.minAge = null;
		$scope.maxAge = null; 
		$scope.allValid = true;
		$scope.blankName = false;
		$scope.invalidGender = false;
		$scope.invalidAge = false;
		$scope.currentIndex = 0;
		$scope.activateAlert = false;
		$scope.recipients = null;
		$scope.tabs = [];
		var Recipients = null;
		var blankRecords = null;
		var due = null;

		//Helps initialize page by finding the appropriate letters
		$scope.find = function() {
			$scope.letters = Articles.query(function() {
				if($scope.adminView) {
					$scope.currentAgency = Agencies.get({agencyId: $stateParams.articleId}, function() {
						due = $filter('date')(Authentication.user.due, 'MM/dd/yy');
						init();
					});
				}
				else {
					$scope.currentAgency = $scope.authentication.user;
					Agencies.query(function(admin) {
						due = $filter('date')(admin[0].due, 'MM/dd/yy');
						init();
					});
				}
			});
		};

		function init() {
			Recipients = $filter('filter')($scope.letters, {track: $scope.currentAgency.username});
					var myChildren = $filter('filter')(Recipients, {track: $scope.currentAgency.username + 'C'});
					var myTeens = $filter('filter')(Recipients, {track: $scope.currentAgency.username + 'T'});
					var mySeniors = $filter('filter')(Recipients, {track: $scope.currentAgency.username + 'S'});

					$scope.tabs = [
						{ title:'Children', content: myChildren, active: false },
						{ title:'Teens', content: myTeens, active: false },
						{ title:'Seniors', content: mySeniors, active: false }
					];

					$scope.activateTab(myChildren.length > 0 ? $scope.tabs[0] : (myTeens.length > 0 ? $scope.tabs[1] : $scope.tabs[2]));

					if(!$scope.adminView && $scope.currentAgency.status >= 3) downloadCSV();
		}
		
		//Allows user to work on another tab
		$scope.activateTab = function(clicked) {
			clicked.active = true;
			$scope.recipients = clicked.content;
			blankRecords = $filter('filter')($scope.recipients, {name: ''});
			$scope.currentIndex = blankRecords.length > 0 ? $scope.recipients.indexOf(blankRecords[0]) : 0;
			updateForm();
		};

		//Allows user to close an alert
		$scope.closeAlert = function() {
			$scope.activateAlert = false;
		};

		//Helps find how many days are left until the deadline
		function dateDiff(a, b) {
			var MS_PER_DAY = 1000 * 60 * 60 * 24;
			// Discard the time and time-zone information.
			var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
			var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
			return Math.floor((utc2 - utc1) / MS_PER_DAY);
		}

		//Allows user to clear the current slot
		$scope.clearForm = function() {
			$scope.current.name = '';
			$scope.current.age = '';
			$scope.current.gender = '';
			$scope.current.gift = '';
			$scope.current.$update();
		};

		//Helps to show user appropriate age range of each recipient type
		function updateForm() {
			$scope.current = $scope.recipients[$scope.currentIndex];
			if($scope.current.track.match(/^...C/)) {
				$scope.minAge = 4;
				$scope.maxAge = 13;
			}
			else if($scope.current.track.match(/^...T/)) {
				$scope.minAge = 14;
				$scope.maxAge = 18;
			}
			else if($scope.current.track.match(/^...S/)) {
				$scope.minAge = 65;
				$scope.maxAge = 125;
			}
		};

		//Allow user to see/edit the next record
		$scope.goToNext = function(form) {
			checkForm(form);
			if($scope.allValid) {
				addRecipient(form);
				if($scope.currentIndex < $scope.recipients.length - 1) {
					$scope.currentIndex++;
					updateForm();
				}
			}
		};

		//Allow user to see the record they selected
		$scope.goToSelected = function(selected, form) {
			checkForm(form);
			if($scope.allValid) {
				addRecipient(form);
				$scope.currentIndex = $scope.recipients.indexOf(selected);
				updateForm();
			}
		};

		//Help validate user's data entry
		function checkForm(form) {
			$scope.blankName = !form.$pristine && !$scope.current.name ? true : false;
			$scope.invalidAge = !form.age.$pristine && ($scope.current.age < $scope.minAge || $scope.current.age > $scope.maxAge) ? true : false;
			if(!form.gender.$pristine) {
				$scope.invalidGender = $scope.current.gender.match(/^[fmFM]$/) ? false : true;
			}
			$scope.allValid = $scope.blankName || $scope.invalidGender || $scope.invalidAge ? false : true;
			//Require all fields
			if(!form.$pristine && (!$scope.current.name || !$scope.current.age || !$scope.current.gender || !$scope.current.gift)) {
				$scope.allValid = false;
			}
			//Allow user to proceed if he/she clears all fields
			if(!$scope.current.name && !$scope.current.age && !$scope.current.gender && !$scope.current.gift) {
				$scope.blankName = false;
				$scope.invalidGender = false;
				$scope.invalidAge = false;
				$scope.allValid = true;
			}
		}

		//Helps update/add recipient record
		function addRecipient(form) {
			if(!form.$pristine && ($scope.current.name || (!$scope.current.name && !$scope.current.age && !$scope.current.gender && !$scope.current.gift))){
				$scope.current.name = cleanText($scope.current.name, 1).trim();
				$scope.current.gender = $scope.current.gender.toUpperCase();
				$scope.current.gift = cleanText($scope.current.gift, 2);

				//update Agency status
				if(!$scope.adminView) {
					blankRecords = $filter('filter')(Recipients, {updated: ''});
					$scope.currentAgency.status = blankRecords.length > 0 ? 1 : 2;
					var user = new Users($scope.currentAgency);
					user.$update(function(response) {
						$scope.currentAgency = response;
					}, function(response) {
						$scope.error = response.data.message;
					});
				}

				$scope.current.$update();
				console.log('saved');

				form.$setPristine();
			}
		}

		//Helps clean up sloppy user input
		function cleanText(text, priority) {
			if((text === text.toLowerCase() || text === text.toUpperCase()) && priority === 1) {
				return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
			}
			else if(text === text.toUpperCase()) {
				return text.toLowerCase();
			}
			else {
				return text;
			}
		}

		//Allows partner to submit their completed tracking form
		//Allows admin to complete the review of a tracking form
		$scope.confirmCompletion = function () {
			var dblcheck = null;
			if($scope.adminView) {
				dblcheck = confirm('Click OK to confirm that you have reviewed this tracking form.');
				if(dblcheck) {
					$scope.currentAgency.status = 5;
					var user = new Users($scope.currentAgency);
					user.$update(function(response) {
						console.log(response);
						$scope.currentAgency = response;
						downloadCSV();
					}, function(response) {
						$scope.error = response.data.message;
					});
				}
			}
			else {
				dblcheck = confirm('Click OK to let the Winter Wishes Team know that your tracking form is ready. You will not be able to make any further changes.');
				if(dblcheck) {
					$scope.currentAgency.status = 3;
					var user = new Users($scope.currentAgency);
					user.$update(function(response) {
						$scope.currentAgency = response;
						downloadCSV();
					}, function(response) {
						$scope.error = response.data.message;
					});
				}
			}
		};

		//Allows admin to start the review of a tracking form
		$scope.startReview = function() {
			console.log($scope.currentAgency);
			$scope.currentAgency.status = 4;
			var user = new Agencies($scope.currentAgency);
			user.$update(function(response) {
				$scope.currentAgency = response;
				console.log($scope.currentAgency);
			}, function(response) {
				$scope.error = response.data.message;
			});
		};

		//Allows admin to flag sub par letters during review
		$scope.flagLetter = function(selected) {
			selected.flagged = !selected.flagged;
			selected.$update();
		};

		//Allows admin to reject a tracking form with many sub par letters
		$scope.returnLetters = function() {
			console.log($scope.currentAgency);
			$scope.currentAgency.status = 1;
			var user = new Users($scope.currentAgency);
			user.$update(function(response) {
				console.log(response);
				$scope.currentAgency = response;
				console.log($scope.currentAgency);
			}, function(response) {
				$scope.error = response.data.message;
			});
		};

		//Helps create a downloadable csv version of the tracking form
		function downloadCSV() {
			var headers = ['track', 'name', 'age', 'gender', 'gift'];
			if($scope.adminView) {headers.push('flagged');}
			var csvString= headers.join(',') + '\r\n';
			for (var i=0; i < Recipients.length; i++) {
				if(Recipients[i]['name']) {
					for(var key in headers) {
						var line = Recipients[i][headers[key]];
						if(key === 4) {
							if(Recipients[i][headers[key]].indexOf(',') !== -1) {
								line = '"' + Recipients[i][headers[key]] + '"';
							}
						}
						csvString += line + ',';
					}
					csvString += '\r\n';
				}
			}

			var date = new Date();
			var stamp = (date.getMonth() + 1) + '-' + date.getDate();
			$scope.fileName = ( 'WishesToSF_' + stamp + '.csv' );
			var blob = new Blob([csvString], { type: 'text/csv;charset=UTF-8' }); 
			$scope.url = window.URL.createObjectURL( blob );
		}

		//Allows partner to let WWT know whether a gift has been received
		$scope.giftReceived = function(selected) {
			selected.received = !selected.received;
			selected.$update();
		};

/*
		//
		//$scope.countdown = dateDiff(new Date(), new Date(due));

		if($scope.countdown === 14) {
			$scope.alert = {type: 'warning', msg: 'Two weeks left'};
		}
		else if($scope.countdown === 7) {
			$scope.alert = {type: 'warning', msg: 'One week left'};
		}
		else if($scope.countdown === 0) {
			$scope.alert = {type: 'danger', msg: 'Last day to submit'};
		}
		else if($scope.countdown === 1) {
			$scope.alert = {type: 'danger', msg: 'One day left'};
		}
		else if($scope.countdown < 0) {
			$scope.alert = {type: 'danger', msg: 'Past due -- please submit it ASAP'};
		}
		else if($scope.countdown <= 3) {
			$scope.alert = {type: 'danger', msg: $scope.countdown + ' days left'};
		}

		$scope.activateAlert = $scope.alert === null ? false : true;

			});
		});
	}]
)*/


}]);