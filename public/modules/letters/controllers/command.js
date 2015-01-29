'use strict';

angular.module('letters').controller('ArticlesController', 
	['$scope', '$modal', '$http', '$stateParams', '$location', 'Authentication', 'Agencies', 'Articles', 'Users',
	function($scope, $modal, $http, $stateParams, $location, Authentication, Agencies, Articles, Users) {
		$scope.user = Authentication.user;
		if (!$scope.user) $location.path('/');

		$scope.turn = false;
		$scope.needToUpdate = false;           //helps hide sidebar when it's not needed
		$scope.activateAlert = false;
		$scope.alerts = {};

		$scope.find = function() {
			$scope.articles = Agencies.query();
			document.getElementById('the_file').addEventListener('change', fileInfo, false);
		};

		$scope.closeAlert = function() {
			$scope.activateAlert = false;
		};

		$scope.signup = function(credentials) {
			$http.post('/auth/signup', credentials).success(function(response) {
				$scope.articles.push(response);
				console.log(credentials.username + ' created');
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
					$scope.alerts = {type: 'danger', msg: 'Your csv file could not be uploaded. It is missing the following columns: ' + missing_fields.join(', ') + '.'};
					$scope.activateAlert = true;
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
						if($scope.articles.filter(function (recs) {return recs.username === record[code_col];}).length === 0) {
							var newPartner = {
								username: 	record[code_col],
								agency: 	record[agency_col],
								contact: 	record[contact_col],
								email: 		record[email_col],
								children: 	Number(record[child_col]),
								teens: 		Number(record[teen_col]),
								seniors: 	Number(record[seniors_col])
							};
							$scope.signup(newPartner);
						}
					}
					$scope.alerts = {type: 'success', msg: 'Your csv file was uploaded successfully.'};
					$scope.activateAlert = true;
				}
			};
			reader.readAsText(file);
		};

		//Allows user to add/update a partner
		$scope.saveAgency = function() {
			if($scope.isNewAgency) {
				if($scope.articles.filter(function (recs) {return recs.username === $scope.article.username;}).length === 0) {
					$scope.signup($scope.article);
				}
				else {
					$scope.alerts = {type: 'danger', msg: $scope.article.username + ' already exists. Please edit the existing copy to avoid duplicates.'};
			  		$scope.activateAlert = true;	
				}
			}
			else {
				$scope.article.$update(function(article) {
					console.log(article.username + ' was updated');
				}, function(errorResponse) {
					console.log(errorResponse.data.message);
				});
			}
			$scope.hideSidebar();
		};


		//Allow user to delete selected partner and all associated recipients
		$scope.deleteAgency = function(selected) {
			var confirmation = null;
			if(selected.username === 'AAA') {
				confirmation = prompt('Please type DELETE to remove all accounts.');
				if(confirmation === 'DELETE') {
					for(var i=1; i<$scope.articles.length; i++) {
						$scope.articles[i].$remove();
					}
				}
			}
			else {
				confirmation = prompt('Please type DELETE to remove ' + selected.username + '.');
				if(confirmation === 'DELETE') {
					selected.$remove(function() {
						$scope.articles.splice($scope.articles.indexOf(selected), 1);
					}, function(errorResponse) {
						console.log('Failure to delete');
					});
				}
			}
		};

		/* 
		*	Helper Functions 
		*/

		//Show current state of partner that user wants to edit
		$scope.showSidebar = function(selected) {
			$scope.isNewAgency = selected ? false : true;
			$scope.article = selected;
			$scope.needToUpdate = true;
		};

		$scope.hideSidebar = function() {
			$scope.article = null;
			$scope.needToUpdate = false;
		};

		//Show admin the selected partner's page
		$scope.viewAgency = function(selected) {
			$location.path('/admin/agency/' + selected._id);
		};

	}
]);