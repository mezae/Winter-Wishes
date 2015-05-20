'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', '$location', '$modal', 'Authentication',
    function($scope, $state, $location, $modal, Authentication) {
        $scope.authentication = Authentication;

        $scope.isAdmin = function() {
            return $scope.authentication.user.role === 'admin';
        };

        $scope.isActive = function(route) {
            return route === $location.path();
        };

        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function() {
            if ($scope.authentication.user.status === 0) $scope.showTutorial();
            $scope.isCollapsed = false;
        });

        $scope.needTutorial = function() {
            var needTutorial = ['command', 'tracking', 'agTracking', 'email', 'etemplate'];
            var page = $state.current.name;
            return needTutorial.indexOf(page) >= 0;
        };

        $scope.showTutorial = function() {
            var page = $state.current.name;
            if (page === 'command') {
                $modal.open({
                    templateUrl: 'modules/core/views/adminTutorial.html',
                    controller: 'AdminModalController',
                    backdrop: 'static'
                });
            } else if (page === 'email') {
                $modal.open({
                    templateUrl: 'modules/core/views/emailTutorial.html',
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static'
                });
            } else if (page === 'etemplate') {
                $modal.open({
                    templateUrl: 'modules/core/views/etemplateTutorial.html',
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static'
                });
            } else if (page === 'tracking' || page === 'agTracking') {
                var template = $scope.isAdmin() ? 'modules/core/views/reviewTutorial.html' : 'modules/core/views/agencyTutorial.html';
                $modal.open({
                    templateUrl: template,
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static'
                });
            }
        };

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

        $scope.exit = function() {
            $modalInstance.close();
        };

        init();

    }
])

.controller('ModalInstanceCtrl', ['$state', '$scope', '$filter', '$modalInstance', 'Agencies',
    function($state, $scope, $filter, $modalInstance, Agencies) {
        if ($state.current.name === 'agTracking') {
            Agencies.query({
                role: 'admin'
            }, function(admin) {
                $scope.dueDate = $filter('date')(admin[0].due, 'fullDate');
            });
        }

        $scope.ok = function() {
            $modalInstance.close();
        };
    }
]);