'use strict';

(function() {
    // Authentication controller Spec
    describe('AuthenticationController', function() {
        // Initialize global variables
        var AuthenticationController,
            scope,
            $httpBackend,
            $stateParams,
            $location;

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

        // Load the main application module
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

            // Initialize the Authentication controller
            AuthenticationController = $controller('AuthenticationController', {
                $scope: scope
            });

            $httpBackend.whenGET(/\.html$/).respond('');
        }));


        it('$scope.signin() should login with a correct user and password', function() {
            $httpBackend.when('POST', '/auth/signin').respond(200, {
                username: 'AAA',
                role: 'admin',
                status: 0
            });

            scope.signin();
            $httpBackend.flush();

            expect(scope.user).toEqual({
                username: 'AAA',
                role: 'admin',
                status: 0
            });
        });

        it('$scope.signin() should login and redirect admin to command center', function() {
            $httpBackend.when('POST', '/auth/signin').respond(200, {
                username: 'AAA',
                role: 'admin',
                status: 0
            });

            scope.signin();
            $httpBackend.flush();

            expect($location.url()).toEqual('/admin');
        });

        it('$scope.signin() should login and redirect first-time user to contact info verification', function() {
            $httpBackend.when('POST', '/auth/signin').respond(200, {
                username: 'EMN',
                role: 'user',
                status: 0
            });

            scope.signin();
            $httpBackend.flush();

            expect($location.url()).toEqual('/settings/profile');
        });

        it('$scope.signin() should login and redirect user to tracking form', function() {
            $httpBackend.when('POST', '/auth/signin').respond(200, {
                username: 'EMN',
                role: 'user',
                status: 1
            });

            scope.signin();
            $httpBackend.flush();

            expect($location.url()).toEqual('/agency/EMN');
        });

        it('$scope.signin() should fail to log in with nothing', function() {
            $httpBackend.expectPOST('/auth/signin').respond(400, {
                'message': 'Missing credentials'
            });

            scope.signin();
            $httpBackend.flush();

            expect(scope.error).toEqual('Missing credentials');
        });

        it('$scope.signin() should fail to log in with wrong credentials', function() {
            // Foo/Bar combo assumed to not exist
            scope.user = 'Foo';
            scope.credentials = 'Bar';

            $httpBackend.expectPOST('/auth/signin').respond(400, {
                'message': 'Unknown user'
            });

            scope.signin();
            $httpBackend.flush();

            expect(scope.error).toEqual('Unknown user');
        });
    });
}());