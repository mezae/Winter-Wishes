'use strict';

// Setting up route
angular.module('letters').config(['$stateProvider',
    function($stateProvider) {
        // Letters state routing
        $stateProvider.
        state('command', {
            url: '/admin:status',
            templateUrl: 'modules/letters/views/command.html'
        }).
        state('adminSettings', {
            url: '/admin/settings',
            templateUrl: 'modules/letters/views/settings.html'
        }).
        state('manageAdmins', {
            url: '/admin/settings/manage',
            templateUrl: 'modules/letters/views/settings.manage-admins.html'
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
            templateUrl: 'modules/emails/views/emails.html'
        }).
        state('etemplate', {
            url: '/admin/email/:template',
            templateUrl: 'modules/emails/views/etemplate.html'
        }).
        state('email-success', {
            url: '/admin/emails/success',
            templateUrl: 'modules/emails/views/esent.html'
        }).
        state('stats', {
            url: '/admin/stats',
            templateUrl: 'modules/letters/views/stats.html'
        });
    }
]);