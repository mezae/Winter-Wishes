'use strict';

angular.module('emails')

.controller('EmailsController', ['$scope', '$window', '$location', 'Authentication', 'Emails',
    function($scope, $window, $location, Authentication, Emails) {

        $scope.find = function() {
            $scope.user = Authentication.user;

            if (!$scope.user || $scope.user.role === 'user') {
                $location.path('/');
            } else {
                $scope.emails = Emails.query();
                $scope.needToUpdate = false;
            }
        };

        //Create new template or save existing template
        $scope.createTemplate = function() {
            var email = new Emails($scope.etemplate);
            email.$save(function(template) {
                $scope.emails.push(template);
                $scope.hideSidebar();
            });
        };

        //Allow user to delete selected partner and all associated recipients
        $scope.deleteTemplate = function(selected) {
            var confirmation = $window.prompt('Please type DELETE to remove the ' + selected.title + ' template.');
            if (confirmation === 'DELETE') {
                selected.$remove(function(template) {
                    _.remove($scope.emails, selected);
                });
            }
        };

        //Show current state of template that user wants to edit
        $scope.showSidebar = function(selected) {
            $scope.etemplate = selected;
            $scope.needToUpdate = true;
        };

        //Hide sidebar and clear variables
        $scope.hideSidebar = function() {
            $scope.etemplate = null;
            $scope.needToUpdate = false;
        };

    }
]);