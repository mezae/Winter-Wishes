'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'meanww';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('letters');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		})
		.state('admin', {
			url: '/admin',
			templateUrl: 'modules/letters/views/command.html'
		});
	}
]);
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
				});
			}
			else if($location.path() === '/admin/email') {
				$modal.open({
					templateUrl: 'modules/core/views/emailTutorial.html',
					controller: 'ModalInstanceCtrl',
				});
			}
			else if($location.path().indexOf('agency') >= 0) {
				var template = isAdmin ? 'modules/core/views/reviewTutorial.html' : 'modules/core/views/agencyTutorial.html';
				$modal.open({
					templateUrl: template,
					controller: 'ModalInstanceCtrl'
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
  	Agencies.query(function(admin) {
  		var admin = $filter('filter')(admin, {username: 'AAA'});
		$scope.dueDate = $filter('date')(admin[0].due, 'fullDate');
	});

	$scope.ok = function () {
	  $modalInstance.close();
	};
}]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('core').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

'use strict';

// Allows user to download csv file
angular.module('letters').config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|chrome-extension):/);
}]);
'use strict';

// Setting up route
angular.module('letters').config(['$stateProvider',
	function($stateProvider) {
		// Letters state routing
		$stateProvider.
		state('command', {
			url: '/admin',
			templateUrl: 'modules/letters/views/command.html'
		}).
		state('tracking', {
			url: '/admin/agency/:articleId',
			templateUrl: 'modules/letters/views/tracking.html'
		}).
		state('agTracking', {
			url: '/agency/:articleId',
			templateUrl: 'modules/letters/views/tracking.html'
		}).
		state('email', {
			url: '/admin/email',
			templateUrl: 'modules/letters/views/emails.html'
		}).
		state('etemplate', {
			url: '/admin/email/:template',
			templateUrl: 'modules/letters/views/etemplate.html'
		}).
		state('email-success', {
			url: '/admin/emails/success',
			templateUrl: 'modules/letters/views/esent.html'
		}).
		state('stats', {
			url: '/admin/stats',
			templateUrl: 'modules/letters/views/stats.html'
		});
	}
]);
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
'use strict';

angular.module('letters')

.controller('EmailsController', ['$scope', '$modal', '$http', '$stateParams', '$location', '$filter' , 'Authentication', 'Agencies', 'Articles', 'Users',
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
'use strict';

angular.module('letters')

.controller('SummaryController', ['$scope', '$location', '$filter', 'Authentication', 'Agencies', 'Articles',
	function($scope, $location, $filter, Authentication, Agencies, Articles) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.user) $location.path('/');

		$scope.partners = Agencies.query(function() {

			var donut = c3.generate({
				bindto: '#donut',
				data: {
					columns: [
						['NotYetStarted', $filter('filter')($scope.partners, {status: 0}).length],
						['InProgress', $filter('filter')($scope.partners, {status: 1}).length],
						['Submitted', $filter('filter')($scope.partners, {status: 3}).length],
						['UnderReview', $filter('filter')($scope.partners, {status: 4}).length],
						['Reviewed', $filter('filter')($scope.partners, {status: 5}).length]
					],
					type : 'donut',
					colors: {
						Reviewed: '#428bca',
						UnderReview: '#5bc0de',
						Submitted: '#5cb85c',
						InProgress: '#f0ad4e',
						NotYetStarted: '#d9534f'
					}
				},
				tooltip: {
					format: {
						value: function (value, ratio, id) {
							return value;
						}
					}
				},
				donut: {
					title: 'Progress'
				}
			});
		});

		$scope.letters = Articles.query(function() {
			var useful = $filter('filter')($scope.letters, {updated: '!' + null});
			var counts = {};
			useful.forEach(function(letter) {
				var date = $filter('date')(letter.updated, 'yyyy-MM-dd');
				counts[date] = (counts[date] || 0)+1; 
			});
			var values = Object.keys(counts);
			var frequency = ['Wishes Added'];
			for(var key in counts) {
					frequency.push(counts[key]);
			}
			values.unshift('x');

			var timeline = c3.generate({
				bindto: '#timeline',
				data: {
					x: 'x',
					columns: [
						values,
						frequency
					]
				},
				axis: {
					x: {
						type: 'timeseries',
						tick: {
							format: '%m/%d/%y'
						}
					}
				}
			});

			var wordCounts = { };
			var fillers = ' , a, an, and, but, or, the, for, is, it, my, your, i, am, is, be, you, me, it, he, she, to, please, dont';

			useful.forEach(function(rec) {
				var words = rec.gift.replace(/[\.,-\/#\?!$%\^&\*;:{}=\-_'"`~()]/g, '').split(/\b/);

				for(var i = 0; i < words.length; i++) {
					if(fillers.indexOf(words[i]) === -1) {
						wordCounts[words[i].toLowerCase()] = (wordCounts[words[i].toLowerCase()] || 0) + 1;
					}
				}
			});

			var sortable = [];
			for (var word in wordCounts) {
				sortable.push([word, wordCounts[word]]);
			}
			sortable.sort(function(b, a) {return a[1] - b[1];});
			var topTen = sortable.slice(0, 10);

			var data = [];
			for(var i=0; i < topTen.length; i++) {
				data.push({name: topTen[i][0], value: topTen[i][1]});
			}

			var margin = {top: 20, right: 30, bottom: 30, left: 55},
			width = 550 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

			var y = d3.scale.ordinal()
				.domain(data.map(function(d) { return d.name; }))
				.rangeRoundBands([height, 0], 0.05);

			var x = d3.scale.linear()
				.domain([0, d3.max(data, function(d) { return d.value; })])
				.range([0, width]);

			var yAxis = d3.svg.axis()
					.scale(y)
					.orient('left');

			var chart = d3.select('.common')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			chart.append('g')
					.attr('class', 'y axis')
					.call(yAxis);

			chart.selectAll('.bar')
				.data(data)
				.enter().append('rect')
				.attr('class', 'bar')
				.attr('y', function(d) { return y(d.name); })
				.attr('width', function(d) { return x(d.value); })
				.attr('height', y.rangeBand());
			
			chart.selectAll('.btext')
					.data(data)
					.enter().append('text')
					.attr('class', 'btext')
					.attr('x', function(d) { return x(d.value) - 3; })
					.attr('y', function(d) { return y(d.name) + (y.rangeBand()/2); })
					.attr('dy', '.35em')
					.text(function(d) { return d.value; });
			});

}]);
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
'use strict';

//Letters service used for communicating with the letters REST endpoints
angular.module('letters').factory('Articles', ['$resource',
	function($resource) {
		return $resource('articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('letters').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if($scope.authentication.user) redirect($scope.authentication.user);

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				// And redirect to appropriate page
				redirect(response);
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
		
		function redirect(user) {
			if(user.username === 'AAA') {
				$location.path('/admin');
			}
			else {
				$location.path('/agency/' + user._id);
			}
		}

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
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);