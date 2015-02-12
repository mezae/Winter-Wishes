
'use strict';

(function() {
	// Articles Controller Spec
	describe('ArticlesController', function() {
		// Initialize global variables
		var ArticlesController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Articles controller.
			ArticlesController = $controller('ArticlesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one user object fetched from XHR', inject(function(Agencies) {
			// Create sample article using the Articles service
			var sampleUser = new Agencies({
				username: 	'AAA',
				agency: 	'American Astronauts Agency',
				contact: 	'Elmer Meza',
				email: 		'meza.elmer@gmail.com',
				children: 	14,
				teens: 		12,
				seniors: 	0
			});

			// Create a sample articles array that includes the new article
			var sampleUsers = [sampleUser];

			// Set GET response
			$httpBackend.expectGET('agency').respond(sampleUsers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.partners).toEqualData(sampleUsers);
		}));

		it('$scope.showSidebar() should make sidebar show up', inject(function(Agencies) {
			scope.showSidebar();
			expect(scope.needToUpdate).toEqual(true);
		}));

		it('$scope.hideSidebar() should clear selected partner and hide sidebar', inject(function(Agencies) {
			scope.hideSidebar();
			expect(scope.partner).toEqual(null);
			expect(scope.needToUpdate).toEqual(false);
		}));




	});
}());