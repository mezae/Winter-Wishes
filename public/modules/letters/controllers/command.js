'use strict';

angular.module('letters').controller('ArticlesController', 
	['$scope', '$modal', '$http', '$stateParams', '$location', '$filter', 'Authentication', 'Agencies', 'Articles', 'Users',
	function($scope, $modal, $http, $stateParams, $location, $filter, Authentication, Agencies, Articles, Users) {
		$scope.user = Authentication.user;
		if (!$scope.user) $location.path('/');
		
		$scope.needToUpdate = false;		//helps hide sidebar when it's not needed
		$scope.alert = {active: false};

		$scope.find = function() {
			$scope.partners = Agencies.query();
			document.getElementById('the_file').addEventListener('change', fileInfo, false);
		};

		//Allows user to add create new accounts, consider moving to backend
		function signup(credentials) {
			$http.post('/auth/signup', credentials).success(function(response) {
				$scope.partners.push(response);
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		//Check out the file the user is trying to upload
		function fileInfo(e){
		  $scope.file = e.target.files[0];
		  if ($scope.file.name.split('.')[1].toUpperCase() !== 'CSV'){
			alert('Must be a csv file!');
			e.target.parentNode.reset();
			return;
		  }
		  else {
			document.getElementById('filename').value = $scope.file.name;
		  }
		}

		//Allow user to upload file to add partners in bulk
		//Makes sure CSV file includes required fields, otherwise lets user which fields are missing
		$scope.handleFileSelect = function(){
			var file = $scope.file;
			var reader = new FileReader();
			reader.onload = function(file) {
				$scope.needToUpdate = false;
				var content = file.target.result;
				var rows = content.split(/[\r\n|\n]+/);
				var headers = rows[0].split(',');
				var required_fields = ['Agency Code', 'Agency Name', 'Contact Name', 'Contact E-mail', 'Accepted Children', 'Accepted Teens', 'Accepted Seniors'];
				var missing_fields = [];

				for(var i = 0; i < required_fields.length; i++) {
					if(headers.indexOf(required_fields[i]) === -1) {
						missing_fields.push(required_fields[i]);
					}
				}

				if(missing_fields.length > 0) {
					$scope.alert = {active: true, type: 'danger', msg: 'Your csv file could not be uploaded. It is missing the following columns: ' + missing_fields.join(', ') + '.'};
				}
				else {
					var code_col	= headers.indexOf('Agency Code');
					var agency_col	= headers.indexOf('Agency Name');
					var contact_col	= headers.indexOf('Contact Name');
					var email_col	= headers.indexOf('Contact E-mail');
					var child_col	= headers.indexOf('Accepted Children');
					var teen_col	= headers.indexOf('Accepted Teens');
					var seniors_col	= headers.indexOf('Accepted Seniors');
				  
					for(var i=1; i<rows.length; i++){
						var record = rows[i].split(',');
						if($filter('filter')($scope.partners, {username: record[code_col]}).length === 0) {
							var newPartner = {
								username: 	record[code_col],
								agency: 	record[agency_col],
								contact: 	record[contact_col],
								email: 		record[email_col],
								children: 	Number(record[child_col]),
								teens: 		Number(record[teen_col]),
								seniors: 	Number(record[seniors_col])
							};
							signup(newPartner);
						}
					}
					$scope.alert = {active: true, type: 'success', msg: 'Your csv file was uploaded successfully.'};
				}
			};
			reader.readAsText(file);
		};

		//Allows user to add/update a partner
		$scope.saveAgency = function() {
			if($scope.isNewAgency) {
				if($filter('filter')($scope.partners, {username: $scope.partner.username}).length === 0) {
					signup($scope.partner);
				}
				else {
					$scope.alert = {active: true, type: 'danger', msg: $scope.partner.username + ' already exists. Please edit the existing copy to avoid duplicates.'};
				}
			}
			else {
				$scope.partner.$update(function(partner) {
					console.log(partner.username + ' was updated');
				}, function(errorResponse) {
					console.log(errorResponse.data.message);
				});
			}
			$scope.hideSidebar();
		};


		//Allow user to delete selected partner and all associated recipients
		$scope.deleteAgency = function(selected) {
			var confirmation = prompt('Please type DELETE to remove ' + selected.agency + '.');
			if(confirmation === 'DELETE') {
				selected.$remove(function() {
					$scope.partners.splice($scope.partners.indexOf(selected), 1);
				}, function(errorResponse) {
					console.log('Remove Failed');
				});
			}
		};

		//Show current state of partner that user wants to edit
		$scope.showSidebar = function(selected) {
			$scope.isNewAgency = selected ? false : true;
			$scope.partner = selected;
			$scope.needToUpdate = !$scope.needToUpdate;
		};

		$scope.hideSidebar = function() {
			$scope.partner = null;
			$scope.needToUpdate = false;
		};

	}
]);