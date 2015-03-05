'use strict';

(function() {
    // Agency Controller Spec
    describe('AgencyController', function() {
        // Initialize global variables
        var AgencyController,
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

            // Initialize the Agency controller.
            AgencyController = $controller('AgencyController', {
                $scope: scope,
            });
        }));

        it('$scope.find() should create an array with at least one user object fetched from XHR', inject(function(Agencies, Articles) {
            // Create sample article using the Agency service
            var sampleAdmin = new Agencies({
                _id: '525a8422f6d0f87f0e407a01',
                username: 'AAA',
                agency: 'American Astronauts Agency',
                contact: 'Elmer Meza',
                email: 'meza.elmer@gmail.com',
                children: 0,
                teens: 0,
                seniors: 0,
                due: new Date('2015-02-14T05:00:00Z'),
                roles: ['admin']
            });

            var sampleUser = new Agencies({
                _id: '525a8422f6d0f87f0e407u02',
                username: 'EMN',
                agency: 'European Maritime Nooks',
                contact: 'Elmer Meza',
                email: 'test@gmail.com',
                children: 0,
                teens: 0,
                seniors: 0,
                roles: ['user']
            });

            var suLetter1 = new Articles({
                _id: '525a8422f6d0f87f0e407l01',
                track: 'EMN001'
            });

            var suLetter2 = new Articles({
                _id: '525a8422f6d0f87f0e407l02',
                track: 'EMN002'
            });

            // Create a sample articles array that includes the new article
            var sampleUsers = [sampleAdmin, sampleUser];
            var sampleLetters = [suLetter1, suLetter2];

            // Set GET response
            $httpBackend.expectGET('articles').respond(sampleLetters);
            $httpBackend.expectGET('agency').respond(sampleUsers);

            // Run controller functionality
            scope.user = sampleUsers[0];
            console.log(scope.user.roles);
            scope.find();

            $httpBackend.flush();

            // Test scope value
            expect(scope.partners).toEqualData(sampleUsers);
        }));

    });
}());