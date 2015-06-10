'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'meanww';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils', 'btford.socket-io', 'textAngular', 'ngFileUpload'];

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
ApplicationConfiguration.registerModule('emails');
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
                templateUrl: 'modules/core/views/home.html'
            })
            .state('first', {
                url: '/settings/profile',
                templateUrl: 'modules/letters/views/firstLogin.html'
            })
            .state('confirm', {
                url: '/settings/profile/first',
                templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'modules/users/views/authentication/signin.client.view.html'
            });
    }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', '$location', '$modal', 'Authentication', 'socket',
    function($scope, $state, $location, $modal, Authentication, socket) {
        $scope.authentication = Authentication;

        $scope.isAdmin = function() {
            return $scope.authentication.user.role === 'admin';
        };

        $scope.isActive = function(route) {
            return route === $location.path();
        };

        $scope.menuOpened = false;

        $scope.toggleMenu = function(event) {
            $scope.menuOpened = !($scope.menuOpened);

            // Important part in the implementation
            // Stopping event propagation means window.onclick won't get called when someone clicks
            // on the menu div. Without this, menu will be hidden immediately
            event.stopPropagation();
        };

        window.onclick = function() {
            if ($scope.menuOpened) {
                $scope.menuOpened = false;

                // You should let angular know about the update that you have made, so that it can refresh the UI
                $scope.$apply();
            }
        };

        $scope.$on('$stateChangeSuccess', function() {
            if ($scope.authentication.user.status === 0) $scope.showTutorial();
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

.controller('ModalInstanceCtrl', ['$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'Agencies',
    function($state, $scope, $filter, $modalInstance, Authentication, Agencies) {
        $scope.user = Authentication.user;
        if ($state.current.name === 'agTracking') {
            Agencies.get({
                agencyId: $scope.user.username
            }, function(tf) {
                $scope.dueDate = $filter('date')(tf.due, 'fullDate');
            });
        }

        $scope.ok = function() {
            $modalInstance.close();
        };
    }
]);
'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
    function($scope, $location, Authentication) {
        $scope.user = Authentication.user;

        function redirect(user) {
            if (user.role === 'admin') {
                $location.path('/admin');
            } else {
                $location.path('/agency/' + user.username);
            }
        }

        // If user is signed in then redirect back home
        if ($scope.user) redirect($scope.user);
    }
]);
// 'use strict';

// // Setting up route
// angular.module('letters').config(['$stateProvider',
//     function($stateProvider) {
//         // Letters state routing
//         $stateProvider.
//         state('command', {
//             url: '/admin:status',
//             templateUrl: 'modules/letters/views/command.html'
//         }).
//         state('adminSettings', {
//             url: '/admin/settings',
//             templateUrl: 'modules/letters/views/settings.html'
//         }).
//         state('tracking', {
//             url: '/admin/agency/:articleId',
//             templateUrl: 'modules/letters/views/tracking.html'
//         }).
//         state('agTracking', {
//             url: '/agency/:articleId',
//             templateUrl: 'modules/letters/views/tracking.html'
//         }).
//         state('email', {
//             url: '/admin/email',
//             templateUrl: 'modules/letters/views/emails.html'
//         }).
//         state('etemplate', {
//             url: '/admin/email/:template',
//             templateUrl: 'modules/letters/views/etemplate.html'
//         }).
//         state('email-success', {
//             url: '/admin/emails/success',
//             templateUrl: 'modules/letters/views/esent.html'
//         }).
//         state('stats', {
//             url: '/admin/stats',
//             templateUrl: 'modules/letters/views/stats.html'
//         });
//     }
// ]);
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
'use strict';

angular.module('emails')

.controller('EmailController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Emails',
    function($scope, $http, $stateParams, $location, Authentication, Emails) {
        $scope.user = Authentication.user;

        $scope.findOne = function() {
            $scope.user = Authentication.user;

            if (!$scope.user) {
                $location.path('/');
            } else {
                $scope.etemplate = Emails.get({
                    emailId: $stateParams.template
                });
            }
        };

        //Update existing template
        $scope.saveTemplate = function() {
            $scope.success = $scope.error = null;

            Emails.update($scope.etemplate, function(response) {
                $scope.etemplate = response;
                $scope.success = true;
            }, function(response) {
                $scope.error = response;
            });
        };

        //Send e-mail based on template
        $scope.sendEmail = function() {
            $scope.error = null;
            $scope.saveTemplate();
            $http.post('/accept', $scope.etemplate).success(function(response) {
                $location.path('/admin/emails/success');
            }).error(function(response) {
                $scope.error = response;
            });
        };

    }
]);
'use strict';

//Emails service used for communicating with the emails REST endpoints
angular.module('emails').factory('Emails', ['$resource',
    function($resource) {
        return $resource('emails/:emailId/:controller', {
            emailId: '@_id'
        }, {
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
'use strict';
/* global _: false */

angular.module('letters').controller('CommandController', ['$scope', '$window', '$timeout', '$interval', '$http', '$stateParams', '$location', 'Authentication', 'Agencies', 'socket',
    function($scope, $window, $timeout, $interval, $http, $stateParams, $location, Authentication, Agencies, socket) {
        $scope.user = Authentication.user;

        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();
        if ($location.search()) $scope.query = $location.search();

        $scope.needToUpdate = false; //helps hide sidebar when it's not needed
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        $scope.updateURL = function(undo) {
            if (undo) $scope.query.status = null;
            if ($scope.query.status) {
                $location.search('status', $scope.query.status);
            } else {
                $location.search('status', null);
            }
        };

        $scope.find = function() {
            $scope.partners = [{
                username: 'Loading...',
                role: 'user'
            }];
            socket.syncUpdates('users', $scope.partners);
            Agencies.query(function(users) {
                $scope.partners = users;
            });
        };

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/signup', credentials).success(function(response) {
                console.log(response.message);
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        //Allows admin to create multiple new accounts
        function signups(file) {
            $http.post('/auth/signups', file).success(function(response) {
                if (response !== 'OK') {
                    $scope.user = response;
                    $scope.fileDone = true;
                }
                $scope.alert.active = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        function findMissingFields(headers) {
            var required_fields = ['Agency Code', 'Agency Name', 'Contact Name', 'Contact E-mail', 'Accepted Children', 'Accepted Teens', 'Accepted Seniors'];
            var missing_fields = [];
            _.forEach(required_fields, function(field) {
                if (!_.includes(headers, field)) {
                    missing_fields.push(field);
                }
            });
            return missing_fields;
        }

        function processBatch(rows, headers) {
            var rowCount = rows.length;
            if (rowCount > 0) {
                var batchQuantity = rowCount > 50 ? 50 : rowCount;
                var batch = rows.splice(0, batchQuantity);

                signups({
                    headers: headers,
                    file: batch,
                    isLast: rows.length === 0
                });
            }
            return rows;
        }

        //Allow user to upload file to add accounts in bulk
        //Makes sure CSV file includes required fields, otherwise lets user which fields are missing
        $scope.handleFileSelect = function() {
            if ($scope.file.length) {
                if ($scope.file[0].type !== 'text/csv') {
                    $scope.alert = {
                        active: true,
                        type: 'danger',
                        msg: 'Must be a csv file!'
                    };
                } else {
                    var file = $scope.file[0];
                    var reader = new FileReader();
                    reader.onload = function(file) {
                        var content = file.target.result;
                        var rows = content.split(/[\r\n|\n]+/);
                        var headers = rows.shift();
                        var missing_fields = findMissingFields(headers);
                        if (missing_fields.length) {
                            $scope.alert = {
                                active: true,
                                type: 'danger',
                                msg: 'Your csv file could not be uploaded. It is missing the following columns: ' + missing_fields.join(', ') + '.'
                            };
                        } else {
                            headers = headers.split(',');
                            headers = {
                                code_col: headers.indexOf('Agency Code'),
                                agency_col: headers.indexOf('Agency Name'),
                                contact_col: headers.indexOf('Contact Name'),
                                email_col: headers.indexOf('Contact E-mail'),
                                child_col: headers.indexOf('Accepted Children'),
                                teen_col: headers.indexOf('Accepted Teens'),
                                seniors_col: headers.indexOf('Accepted Seniors')
                            };

                            $scope.alert = {
                                active: true,
                                type: 'info',
                                msg: 'Great! Your tracking forms will appear shortly...'
                            };
                            $scope.oldUsers = $scope.partners.length;
                            $scope.newUsers = rows.length;

                            rows = processBatch(rows, headers);
                            $interval(function() {
                                rows = processBatch(rows, headers);
                            }, 28000, Math.ceil($scope.newUsers / 50));
                        }
                    };
                    reader.readAsText(file);
                    $scope.needToUpdate = false;
                }
                $scope.file[0] = undefined;
            }
        };

        //Allows user to add/update a partner
        $scope.saveAgency = function() {
            $scope.alert.active = false;
            if ($scope.isNewAgency) {
                if (_.find($scope.partners, {
                    'username': $scope.partner.username
                })) {
                    $scope.alert = {
                        active: true,
                        type: 'danger',
                        msg: $scope.partner.username + ' already exists. Please edit the existing copy to avoid duplicates.'
                    };
                } else {
                    signup($scope.partner);
                }
            } else {
                Agencies.update($scope.partner);
            }
            $scope.hideSidebar();
        };


        //Allow user to delete selected partner and all associated recipients
        $scope.deleteAgency = function(selected) {
            var confirmation = $window.prompt('Please type DELETE to remove ' + selected.agency + '.');
            if (confirmation === 'DELETE') {
                $http.delete('/agency/' + selected.username);
            }
        };

        //Show current state of partner that user wants to edit
        $scope.showSidebar = function(selected) {
            $scope.isNewAgency = selected ? false : true;
            $scope.partner = selected;
            $scope.needToUpdate = true;
            $scope.startSearch = false;
        };

        $scope.hideSidebar = function() {
            $scope.partner = null;
            $scope.needToUpdate = false;
            if ($scope.query.username || $scope.query.status) $scope.startSearch = true;
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('users');
        });

    }
]);
'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$location', '$filter', '$http', 'Authentication', 'Users', 'Agencies', 'Articles',
    function($scope, $window, $location, $filter, $http, Authentication, Users, Agencies, Articles) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.users = Agencies.query({
            role: 'admin'
        });

        $scope.viewData = function(tab) {
            $scope.setting = tab;

            $scope.calendar = {
                startDate: null,
                endDate: null,
                opened: {},
                dateFormat: 'MM/dd/yyyy',
                dateOptions: {
                    showWeeks: false
                },
                open: function($event, calID) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.calendar.opened[calID] = true;
                }
            };
        };

        $scope.saveDueDate = function() {
            var user = new Users($scope.user);
            user.$update(function(response) {
                $scope.user = response;
            }, function(response) {
                console.log(response.data.message);
            });
        };

        $scope.viewAdmins = function() {
            $scope.setting = 'admins';
            $scope.credentials = {};
        };

        $scope.viewNotifications = function() {
            $scope.setting = 'notify';
            $scope.permission = Notification.permission === 'granted';
        };

        //Helps create a downloadable csv version of the tracking form
        $scope.downloadCSV = function() {
            $scope.error = null;
            $scope.total = null;
            if ($scope.calendar.startDate && $scope.calendar.endDate) {
                if ($scope.calendar.startDate > $scope.calendar.endDate) {
                    $scope.error = 'Start date must come before or be equal to end date.';
                } else {
                    var headers = ['track', 'type', 'name', 'age', 'gender', 'gift'];
                    headers.push('flagged');
                    var csvString = headers.join(',') + '\r\n';
                    var Recipients = Articles.query({
                        start: $scope.calendar.startDate,
                        end: $scope.calendar.endDate
                    }, function() {
                        $scope.total = Recipients.length;
                        _.forEach(Recipients, function(letter) {
                            var type = letter.track.charAt(3);
                            letter.type = type === 'C' ? 'child' : (type === 'T' ? 'teen' : 'senior');
                            _.forEach(headers, function(key) {
                                var line = letter[key];
                                if (key === 'gift' && _.indexOf(letter[key], ',')) {
                                    line = '"' + letter[key] + '"';
                                }
                                csvString += line + ',';
                            });
                            csvString += '\r\n';
                        });

                        var date = $filter('date')(new Date(), 'MM-dd');
                        $scope.fileName = ('WishesToSF_' + date + '.csv');
                        var blob = new Blob([csvString], {
                            type: 'text/csv;charset=UTF-8'
                        });
                        $scope.url = $window.URL.createObjectURL(blob);
                    });
                }
            } else {
                $scope.error = 'Please enter a start date and an end date.';
            }

        };

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/newadmin', credentials).success(function(response) {
                console.log('new admin added');
                $scope.newAdmin = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        $scope.saveAdmin = function() {
            console.log($scope.credentials);
            signup($scope.credentials);
        };

        $scope.allowNotifications = function() {
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function(permission) {
                    if (permission === 'granted') {
                        $scope.permission = true;
                        var notification = new Notification('Hi there!');
                    }
                });
            }
        };

        $scope.reset = function() {
            var confirmation = $window.prompt('Please type FOREVER to wipe all data.');
            if (confirmation === 'FOREVER') {
                $http.get('/users/reset').success(function(response) {
                    // If successful we assign the response to the global user model
                    Authentication.user = response;
                    $scope.user.status = 0;
                    Users.update($scope.user);
                }).error(function(response) {
                    $scope.error = response.message;
                });
            }
        };
    }
]);
'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('ManageAdminsController', ['$scope', '$window', '$location', '$http', 'Authentication', 'Users', 'Agencies',
    function($scope, $window, $location, $http, Authentication, Users, Agencies) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.find = function() {
            $scope.credentials = {};
            $scope.alert = {
                active: false,
                type: '',
                msg: ''
            };
            $scope.users = Agencies.query({
                role: 'admin'
            });
        };

        //Allows admin to create new accounts
        $scope.addAdmin = function() {
            $http.post('/auth/newadmin', $scope.credentials).success(function(response) {
                $scope.users.push(response);
                if ($scope.alert.active) $scope.alert.active = false;
                $scope.credentials = null;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        };

        $scope.removeAdmin = function(selected) {
            var confirmation = $window.prompt('Type DELETE to remove ' + selected.username + '\'s account');
            if (confirmation === 'DELETE') {
                var oldAdmin = selected;
                selected.$remove(function() {
                    $scope.users.splice(_.findIndex($scope.users, oldAdmin), 1);
                });
            }
        };

    }
]);
'use strict';
/* global _: false */

angular.module('letters')

.controller('SummaryController', ['$scope', '$window', '$location', '$filter', 'Authentication', 'Agencies', 'Articles',
    function($scope, $window, $location, $filter, Authentication, Agencies, Articles) {
        $scope.authentication = Authentication;

        if (!$scope.authentication.user) $location.path('/');

        angular.element($window).on('resize', function() {
            $scope.$apply();
        });

        Agencies.query(function(users) {

            var names = ['Not Yet Started', 'In Progress', 'Completed', 'Submitted', 'Under Review', 'Reviewed'];
            var groups = _.countBy(users, function(form) {
                return form.status;
            });

            $scope.status = [];
            _.forEach(groups, function(c, g) {
                $scope.status.push({
                    status: g,
                    name: names[g],
                    count: c,
                    percent: (c / users.length * 100).toFixed(1) + '%'
                });
            });

        });

        Articles.query(function(useful) {
            if (useful.length > 0) {
                var counts = _.countBy(useful, function(letter) {
                    return $filter('date')(letter.updated, 'yyyy-MM-dd');
                });

                var activeDays = [];
                _.forEach(counts, function(count, date) {
                    activeDays.push(date);
                });

                activeDays = activeDays.sort(function(a, b) {
                    return b < a;
                });

                $scope.wishesAdded = [];
                var current = activeDays[0];
                var endDate = new Date();
                endDate.setDate(endDate.getDate() + 1);
                endDate = $filter('date')(endDate, 'yyyy-MM-dd');
                while (current !== endDate) {
                    $scope.wishesAdded.push({
                        date: String(current),
                        count: counts[current] ? counts[current] : 0
                    });
                    current = new Date(current);
                    current.setDate(current.getDate() + 2);
                    current = $filter('date')(current, 'yyyy-MM-dd');
                }

                var wordCounts = [];
                var fillers = ' , a, an, and, but, or, the, this, that, for, is, it, my, your, i, am, is, be, you, me, it, he, she, to, please, dont, who, what, where, when, why, how, which, with';

                _.forEach(useful, function(letter) {
                    var words = _.words(letter.gift);

                    _.forEach(words, function(word) {
                        word = word.toLowerCase();
                        if (!_.includes(fillers, word)) {
                            var cc = _.find(wordCounts, {
                                'name': word
                            });
                            if (cc) {
                                cc.value += 1;
                            } else {
                                wordCounts.push({
                                    name: word,
                                    value: 1
                                });
                            }
                        }
                    });
                });

                var sorted = _.sortBy(wordCounts, function(word) {
                    return -word.value;
                });

                $scope.gifts = _.take(sorted, 10);
            } else {
                $scope.wishesAdded = [];
                $scope.gifts = [];
            }

        });

    }
]);
'use strict';
/* global _: false */

angular.module('letters').controller('AgencyController', ['$scope', '$q', '$stateParams', '$location', '$anchorScroll', '$filter', '$timeout', '$modal', 'Authentication', 'Articles', 'Agencies', 'Users',
    function($scope, $q, $stateParams, $location, $anchorScroll, $filter, $timeout, $modal, Authentication, Articles, Agencies, Users) {
        $scope.user = Authentication.user;

        if (!$scope.user) $location.path('/');

        console.log($scope.user);

        $scope.adminView = $scope.user.role !== 'user';
        $scope.userView = $scope.user.role === 'user';
        var currentIndex = 0;

        //Helps initialize page by finding the appropriate letters
        $scope.find = function() {
            if ($scope.adminView) {
                $scope.currentAgency = Agencies.get({
                    agencyId: $stateParams.articleId
                }, function() {
                    init();
                });
            } else {
                $scope.currentAgency = $scope.user;
                init();
                Agencies.query({
                    role: 'admin'
                }, function(admin) {
                    if ($scope.currentAgency.status < 3) showCountdown(admin[0].due);
                });
            }
            console.log($scope.currentAgency);
        };

        function showCountdown(deadline) {
            var countdown = dateDiff(new Date(), new Date(deadline));
            $scope.alert = {
                active: false,
                type: null,
                msg: null
            }
            if (countdown === 14) {
                $scope.alert = {
                    type: 'warning',
                    msg: 'Two weeks left'
                };
            } else if (countdown === 7) {
                $scope.alert = {
                    type: 'warning',
                    msg: 'One week left'
                };
            } else if (countdown === 0) {
                $scope.alert = {
                    type: 'danger',
                    msg: 'Last day to submit'
                };
            } else if (countdown === 1) {
                $scope.alert = {
                    type: 'danger',
                    msg: 'One day left'
                };
            } else if (countdown < 0) {
                $scope.alert = {
                    type: 'danger',
                    msg: 'Past due -- please submit it ASAP'
                };
            } else if (countdown <= 3) {
                $scope.alert = {
                    type: 'danger',
                    msg: countdown + ' days left'
                };
            }
            $scope.alert.active = $scope.alert.msg !== null;
        }

        function init() {
            $scope.tabs = [{
                title: 'Children',
                content: $scope.currentAgency.children,
                active: false,
                minAge: 4,
                maxAge: 13
            }, {
                title: 'Teens',
                content: $scope.currentAgency.teens,
                active: false,
                minAge: 14,
                maxAge: 18
            }, {
                title: 'Seniors',
                content: $scope.currentAgency.seniors,
                active: false,
                minAge: 65,
                maxAge: 125
            }];

            $scope.activateTab($scope.currentAgency.children > 0 ? $scope.tabs[0] : ($scope.currentAgency.teens > 0 ? $scope.tabs[1] : $scope.tabs[2]));

            if ((!$scope.adminView && $scope.currentAgency.status >= 3) || ($scope.adminView && $scope.currentAgency.status === 5)) downloadCSV();
        }

        //Allows user to work on another tab
        $scope.activateTab = function(clicked, form) {
            $scope.currentTab = clicked;
            clicked.active = true;
            $scope.recipients = Articles.query({
                username: $stateParams.articleId + clicked.title.charAt(0),
                limit: 50
            }, function() {
                $scope.minAge = clicked.minAge;
                $scope.maxAge = clicked.maxAge;
                var blankRecord = _.findIndex($scope.recipients, {
                    'name': ''
                });
                currentIndex = blankRecord ? blankRecord : 0;
                updateForm(form);
            });
        };

        //Helps find how many days are left until the deadline
        function dateDiff(a, b) {
            var MS_PER_DAY = 1000 * 60 * 60 * 24;
            // Discard the time and time-zone information.
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
            return Math.floor((utc2 - utc1) / MS_PER_DAY);
        }

        //Allows admin to add a blank letter and shift everything down
        $scope.addBlank = function() {
            var letter = new Articles({
                track: $scope.current.track
            });
            letter.$save(function(response) {
                Articles.query({
                    username: $stateParams.articleId + $scope.currentTab.title.charAt(0),
                    limit: $scope.recipients.length
                }, function(letters) {
                    $scope.recipients = letters;
                });
            }, function(errorResponse) {
                console.log('response');
            });
        };

        //Allows admin to delete an existing letter and shift everything up
        //Allows user to clear the current slot
        $scope.clearForm = function(selected) {
            if ($scope.adminView) {
                selected.$remove(function(response) {
                    Articles.query({
                        username: $stateParams.articleId + $scope.currentTab.title.charAt(0),
                        limit: $scope.recipients.length
                    }, function(letters) {
                        $scope.recipients = letters;
                    });
                }, function(errorResponse) {
                    console.log('Remove Failed');
                });
            } else {
                $scope.current.name = '';
                $scope.current.age = '';
                $scope.current.gender = '';
                $scope.current.gift = '';
                $scope.current.$update();
            }
        };

        //Helps to show user appropriate age range of each recipient type
        function updateForm(form) {
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
            $scope.current = $scope.recipients[currentIndex];
            if (currentIndex % 10 === 9) {
                $location.hash(currentIndex + 1);
                $anchorScroll();
            }

            var limit = 50;
            if (currentIndex % limit === limit - 15 && $scope.recipients.length < $scope.currentTab.content) {
                $scope.loadMore(currentIndex + 15);
            }
        }

        $scope.loadMore = function(records) {
            Articles.query({
                username: $stateParams.articleId + $scope.currentTab.title.charAt(0),
                offset: records,
                limit: 50
            }, function(letters) {
                $q.all([$scope.recipients, letters]).then(function(data) {
                    $scope.recipients = data[0].concat(data[1]);
                });
            });
        };

        //Allow user to see/edit the next record if current letter is valid
        $scope.goToNext = function(form) {
            if (isValidLetter(form)) {
                if (currentIndex < $scope.recipients.length - 1) {
                    currentIndex++;
                    updateForm(form);
                } else {
                    $scope.alert = {
                        active: true,
                        type: 'info',
                        msg: 'You just entered the last letter on this page.'
                    };
                }
            }
        };

        //Allow user to see the record they selected if current letter is valid
        $scope.goToSelected = function(selected, form) {
            if (isValidLetter(form) && !form.$invalid) {
                currentIndex = selected;
                updateForm(form);
            }
        };

        //Make form more user-friendly, make required fields glow
        $scope.isUsed = function(form) {
            if ($scope.current.name) {
                $scope.blankName = false;
                form.age.$setTouched();
                form.gender.$setTouched();
                form.gift.$setTouched();
            } else {
                form.$setUntouched();
            }
        };

        //Check if age entered is within valid range
        $scope.isWithinRange = function(age) {
            age.$setValidity('inRange', $scope.current.age === null || ($scope.current.age >= $scope.minAge && $scope.current.age <= $scope.maxAge));
        };

        //Help validate user's data entry
        function isValidLetter(form) {
            //It's OK if no data was entered
            if (!$scope.current.name && !$scope.current.age && !$scope.current.gender && !$scope.current.gift) {
                return true;
            }
            //It's not OK if some fields are missing
            else if (!$scope.current.name || !$scope.current.age || !$scope.current.gender || !$scope.current.gift) {
                $scope.blankName = !$scope.current.name;
                $scope.error = 'fields cannot be left blank';
                $timeout(function() {
                    $scope.blankName = false;
                    $scope.error = null;
                }, 2000);
                return false;
            }
            //It's great when all fields are entered properly
            else {
                addRecipient(form);
                return true;
            }
        }

        //Helps update/add recipient record
        function addRecipient(form) {
            $scope.current.name = cleanText($scope.current.name, 1).trim();
            $scope.current.gender = $scope.current.gender.toUpperCase();
            $scope.current.gift = cleanText($scope.current.gift, 2);

            //update Agency status
            if ($scope.currentAgency.status === 0) {
                $scope.currentAgency.status = 1;
                var user = new Users($scope.currentAgency);
                user.$update(function(response) {
                    $scope.currentAgency = response;
                });
            }

            $scope.current.$update();
        }

        //Helps clean up sloppy user input
        function cleanText(text, priority) {
            if ((text === text.toLowerCase() || text === text.toUpperCase()) && priority === 1) {
                return text.replace(/\w\S*/g, function(txt) {
                    return _.capitalize(txt);
                });
            } else if (text === text.toUpperCase()) {
                return text.toLowerCase();
            } else {
                return text;
            }
        }

        //Allows admin to complete the review of a tracking form
        //Allows community partner to submit their completed tracking form
        $scope.confirmCompletion = function() {
            var user = null;
            if ($scope.adminView) {
                rateAgencyToComplete();
            } else {
                var dblcheck = confirm('Click OK to let the Winter Wishes Team know that your tracking form is ready. You will not be able to make any further changes.');
                if (dblcheck) {
                    $scope.currentAgency.status = 3;
                    user = new Users($scope.currentAgency);
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
            $scope.currentAgency.status = 4;
            var user = new Agencies($scope.currentAgency);
            user.$update(function(response) {
                $scope.currentAgency = response;
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
            $scope.currentAgency.status = 1;
            var user = new Agencies($scope.currentAgency);
            user.$update(function(response) {
                $scope.currentAgency = response;
            }, function(response) {
                $scope.error = response.data.message;
            });
        };

        //Helps create a downloadable csv version of the tracking form
        function downloadCSV() {
            var headers = ['track', 'name', 'age', 'gender', 'gift'];
            if ($scope.adminView) {
                headers.push('flagged');
            }
            var csvString = headers.join(',') + '\r\n';
            var Recipients = Articles.query({
                username: $stateParams.articleId
            }, function() {
                _.forEach(Recipients, function(letter) {
                    if (letter.name) {
                        _.forEach(headers, function(key) {
                            var line = letter[key];
                            if (key === 'gift' && _.indexOf(letter[key], ',')) {
                                line = '"' + letter[key] + '"';
                            }
                            csvString += line + ',';
                        });
                        csvString += '\r\n';
                    }
                });

                var date = $filter('date')(new Date(), 'MM-dd');
                $scope.fileName = ('WishesToSF_' + $scope.currentAgency.username + '_' + date + '.csv');
                var blob = new Blob([csvString], {
                    type: 'text/csv;charset=UTF-8'
                });
                $scope.url = window.URL.createObjectURL(blob);
            });

        }

        //Allows partner to let WWT know whether a gift has been received
        $scope.giftReceived = function(selected) {
            selected.received = !selected.received;
            selected.$update();
        };

        function rateAgencyToComplete() {
            var modalInstance = $modal.open({
                templateUrl: 'modules/letters/views/rating.html',
                controller: 'RatingCtrl',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    rating: function() {
                        return $scope.currentAgency.rating;
                    }
                }
            });

            modalInstance.result.then(function(result) {
                $scope.currentAgency.rating = result;
                $scope.currentAgency.status = 5;
                var user = new Agencies($scope.currentAgency);
                user.$update(function(response) {
                    $scope.currentAgency = response;
                    downloadCSV();
                }, function(response) {
                    $scope.error = response.data.message;
                });
            });
        }

    }
])

.controller('RatingCtrl', ['$scope', '$timeout', '$modalInstance', 'rating',
    function($scope, $timeout, $modalInstance, rating) {
        $scope.rating = rating;

        $scope.hoveringOver = function(value, rating) {
            $scope.overStar = value;
            $scope.desc = {
                percent: 100 * (value / 5)
            };
            switch (value) {
                case 1:
                    $scope.desc.words = 'None';
                    break;
                case 2:
                    $scope.desc.words = 'Scarce';
                    break;
                case 3:
                    $scope.desc.words = 'Some';
                    break;
                case 4:
                    $scope.desc.words = 'Good';
                    break;
                case 5:
                    $scope.desc.words = 'Great';
                    break;
            }
            $scope.active = rating;
        };

        $scope.updateOverall = function() {
            $scope.rating.overall = ($scope.rating.content + $scope.rating.decoration) / 2;
        };

        $scope.ok = function() {
            if ($scope.rating.overall > 0) {
                $modalInstance.close($scope.rating);
            } else {
                $scope.error = 'your feedback would be greatly appreciated';
                $timeout(function() {
                    $scope.error = null;
                }, 2000);
            }
        };
    }
]);
'use strict';
/* global d3: false */

angular.module('letters').directive('activity', function() {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function(scope, elem) {
            var element = elem[0];
            var margin = {
                    top: 20,
                    right: 30,
                    bottom: 40,
                    left: 40
                },
                width = element.clientWidth - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;
            var count = 0;

            scope.$watch('data', function(data) {
                if (data && count < 1) {
                    count++;
                    var parseDate = d3.time.format('%Y-%m-%d').parse;
                    var formatTime = d3.time.format('%B %e'); // Format tooltip date / time

                    data.forEach(function(d) {
                        d.date = parseDate(d.date);
                    });

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .ticks(d3.time.week, 1)
                        .tickFormat(d3.time.format('%m/%d'))
                        .orient('bottom');

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(5)
                        .tickFormat(d3.format('d'))
                        .tickSubdivide(0)
                        .orient('left');

                    var div = d3.select('body')
                        .append('div') // declare the tooltip div 
                        .attr('class', 'timeTooltip') // apply the 'tooltip' class
                        .style('opacity', 0); // set the opacity to nil

                    var line = d3.svg.line()
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y(function(d) {
                            return y(d.count);
                        });

                    x.domain(d3.extent(data, function(d) {
                        return d.date;
                    }));
                    y.domain(d3.extent(data, function(d) {
                        return d.count;
                    }));

                    var chart = d3.select(element).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    chart.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(xAxis)
                        .selectAll('text')
                        .style('text-anchor', 'end')
                        .attr('dx', '-.8em')
                        .attr('dy', '.15em')
                        .attr('transform', function(d) {
                            return 'rotate(-65)';
                        });

                    chart.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    chart.append('text')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', 0 - margin.left)
                        .attr('x', 0 - (height / 2))
                        .attr('dy', '1em')
                        .style('text-anchor', 'middle')
                        .text('# of Wishes Added');

                    chart.append('path')
                        .datum(data)
                        .attr('class', 'line')
                        .attr('d', line);

                    chart.selectAll('dot')
                        .data(data.filter(function(d) {
                            return d.count > 0;
                        }))
                        .enter().append('circle')
                        .attr('class', 'circle')
                        .attr('r', 3.5)
                        .attr('cx', function(d) {
                            return x(d.date);
                        })
                        .attr('cy', function(d) {
                            return y(d.count);
                        })

                    // Tooltip stuff after this
                    .on('mouseover', function(d) {
                        div.transition()
                            .duration(500)
                            .style('opacity', 0);
                        div.transition()
                            .duration(200)
                            .style('opacity', 0.8);
                        div.html(
                            formatTime(d.date) +
                            '<br/>Wishes Added: ' + d.count)
                            .style('left', (d3.event.pageX) + 'px')
                            .style('top', (d3.event.pageY - 28) + 'px');
                    })

                    .on('mouseout', function(d) {
                        div.transition()
                            .duration(1000)
                            .style('opacity', 0);
                    });
                }
            }, true);
        }
    };
});
'use strict';

//Letters service used for communicating with the agencies REST endpoints
angular.module('letters').factory('Agencies', ['$resource',
    function($resource) {
        return $resource('agency/:agencyId', {
            agencyId: '@username'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);


// angular.module('2meanApp')
//     .factory('User', function($resource) {
//         return $resource('/api/users/:id/:controller', {
//             id: '@_id'
//         }, {
//             changePassword: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'password'
//                 }
//             },
//             updateProfile: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'profile'
//                 }
//             },
//             get: {
//                 method: 'GET',
//                 params: {
//                     id: 'me'
//                 }
//             }
//         });
//     });
'use strict';
/* global d3: false */

angular.module('letters').directive('donut', ['$location',
    function($location) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            link: function(scope, elem) {
                var element = elem[0];
                var width = element.clientWidth,
                    height = 320,
                    radius = Math.min(width, height) / 2,
                    outerRadius = height / 2 - 20,
                    innerRadius = outerRadius / 2;

                function arcTween(arc, outerRadius, delay) {
                    return function() {
                        d3.select(this)
                            .transition()
                            .delay(delay)
                            .attrTween('d', function(d) {
                                var i = d3.interpolate(d.outerRadius, outerRadius);
                                return function(t) {
                                    d.outerRadius = i(t);
                                    return arc(d);
                                };
                            });
                    };
                }

                scope.$watch('data', function(data) {
                        if (data) {

                            var color = d3.scale.ordinal()
                                .range(['#cd4d52', '#cd884d', '#85c739', '#4d92cd', '#7b39c7']);

                            var pie = d3.layout.pie()
                                .padAngle(0.01)
                                .sort(null)
                                .value(function(d) {
                                    return d.count;
                                });

                            var arc = d3.svg.arc()
                                .padRadius(outerRadius)
                                .innerRadius(innerRadius);

                            var div = d3.select('body')
                                .append('div') // declare the tooltip div 
                                .attr('class', 'donutTooltip') // apply the 'tooltip' class
                                .style('opacity', 0); // set the opacity to nil

                            var svg = d3.select(element).append('svg')
                                .attr('width', width)
                                .attr('height', height);

                            var chart = svg.append('g')
                                .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 - 20) + ')');

                            data.forEach(function(d) {
                                d.count = +d.count;
                            });

                            var g = chart.selectAll('.arc')
                                .data(pie(data))
                                .enter().append('g')
                                .attr('class', 'arc');

                            g.append('path')
                                .each(function(d) {
                                    d.outerRadius = outerRadius - 10;
                                })
                                .attr('d', arc)
                                .style('fill', function(d) {
                                    return color(d.data.status);
                                })
                                .style('cursor', 'pointer')
                                .on('mouseover', function(d) {
                                    d3.select(this)
                                        .transition()
                                        .delay(0)
                                        .attrTween('d', function(d) {
                                            var i = d3.interpolate(d.outerRadius, outerRadius - 2);
                                            return function(t) {
                                                d.outerRadius = i(t);
                                                return arc(d);
                                            };
                                        });
                                    div.transition()
                                        .duration(0)
                                        .style('opacity', 0);
                                    div.transition()
                                        .duration(200)
                                        .style('opacity', 0.8);
                                    div.html(
                                        d.data.name + ': ' + d.data.count)
                                        .style('left', (d3.event.pageX + 14) + 'px')
                                        .style('top', (d3.event.pageY + 14) + 'px');

                                })
                                .on('mousemove', function() {
                                    div
                                        .style('left', (d3.event.pageX + 10) + 'px')
                                        .style('top', (d3.event.pageY + 16) + 'px');
                                })
                                .on('mouseout', function(d) {
                                    d3.select(this)
                                        .transition()
                                        .delay(100)
                                        .attrTween('d', function(d) {
                                            var i = d3.interpolate(d.outerRadius, outerRadius - 10);
                                            return function(t) {
                                                d.outerRadius = i(t);
                                                return arc(d);
                                            };
                                        });
                                    div.transition()
                                        .duration(1000)
                                        .style('opacity', 0);
                                })
                                .on('click', function(d) {
                                    //$location.path('/admin');
                                    window.location.href = '/#!/admin?status=' + d.data.status;
                                });

                            g.append('text')
                                .attr('transform', function(d) {
                                    return 'translate(' + arc.centroid(d) + ')';
                                })
                                .attr('dy', '.35em')
                                .style('text-anchor', 'middle')
                                .text(function(d) {
                                    return d.data.percent;
                                });

                            chart.append('text')
                                .attr('class', 'donutTitle')
                                .style('text-anchor', 'middle')
                                .text('Progress');

                            var legendContainer = svg.append('g')
                                .attr('transform', 'translate(10,' + (height - 30) + ')');

                            var legend = legendContainer.append('g')
                                .attr('class', 'legend');

                            var series = legend.selectAll('.series')
                                .data(pie(data));

                            var seriesEnter = series.enter()
                                .append('g')
                                .attr('class', 'series');

                            seriesEnter.append('circle')
                                .style('fill', function(d, i) {
                                    return color(d.data.status);
                                })
                                .attr('r', 5);

                            seriesEnter.append('text')
                                .style('fill', 'black')
                                .text(function(d) {
                                    return d.data.name;
                                })
                                .attr('text-anchor', 'start')
                                .attr('dy', '.32em')
                                .attr('dx', '8');

                            var ypos = 5,
                                newxpos = 35,
                                maxwidth = 0,
                                xpos;
                            series
                                .attr('transform', function(d, i) {
                                    var length = legendContainer.selectAll('text')[0][i].getComputedTextLength() + 28;
                                    xpos = newxpos;

                                    if (width < xpos + length) {
                                        newxpos = xpos = 35;
                                        ypos += 20;
                                    }

                                    newxpos += length;
                                    if (newxpos > maxwidth) maxwidth = newxpos;

                                    return 'translate(' + xpos + ',' + ypos + ')';
                                });
                        }
                    },
                    true);
            }
        };
    }
]);
'use strict';

//Letters service used for communicating with the letters REST endpoints
angular.module('letters').factory('Articles', ['$resource',
    function($resource) {
        return $resource('articles/:articleId/:controller', {
            articleId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
/* global io */
/* global _: false */
'use strict';

angular.module('letters')
    .factory('socket', ['socketFactory',
        function(socketFactory) {

            // socket.io now auto-configures its connection when we ommit a connection url
            var ioSocket = io('', {
                // Send auth token on connection, you will need to DI the Auth service above
                // 'query': 'token=' + Auth.getToken()
                path: '/socket.io-client'
            });

            var socket = socketFactory({
                ioSocket: ioSocket
            });

            return {
                socket: socket,

                /**
                 * Register listeners to sync an array with updates on a model
                 *
                 * Takes the array we want to sync, the model name that socket updates are sent from,
                 * and an optional callback function after new items are updated.
                 *
                 * @param {String} modelName
                 * @param {Array} array
                 * @param {Function} cb
                 */
                syncUpdates: function(modelName, array, cb) {
                    cb = cb || angular.noop;

                    /**
                     * Syncs item creation/updates on 'model:save'
                     */
                    socket.on(modelName + ':save', function(item) {
                        var oldItem = _.find(array, {
                            _id: item._id
                        });
                        var index = array.indexOf(oldItem);
                        var event = 'created';

                        // replace oldItem if it exists
                        // otherwise just add item to the collection
                        if (oldItem) {
                            array.splice(index, 1, item);
                            event = 'updated';
                        } else {
                            array.push(item);
                        }

                        if (item.status === 3) {
                            var message = item.agency + ' just submitted their tracking form.';
                            var options = {
                                body: message,
                                icon: 'http://img3.wikia.nocookie.net/__cb20141010004359/disney/images/4/49/Baymax_Armor_Wings_Render.png',
                                dir: 'ltr',
                                tag: 'submitted'
                            };
                            var notification = new Notification('Quick Update', options);

                            notification.onclick = function() {
                                window.open('https://winterwishes.herokuapp.com/#!/');
                            };
                        }


                        cb(event, item, array);
                    });

                    /**
                     * Syncs removed items on 'model:remove'
                     */
                    socket.on(modelName + ':remove', function(item) {
                        var event = 'deleted';
                        _.remove(array, {
                            _id: item._id
                        });
                        cb(event, item, array);
                    });
                },

                /**
                 * Removes listeners for a models updates on the socket
                 *
                 * @param modelName
                 */
                unsyncUpdates: function(modelName) {
                    socket.removeAllListeners(modelName + ':save');
                    socket.removeAllListeners(modelName + ':remove');
                }
            };
        }
    ]);
'use strict';
/* global d3: false */

angular.module('letters').directive('donutChart', function() {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function(scope, elem) {
            var element = elem[0];
            var margin = {
                    top: 20,
                    right: 30,
                    bottom: 30,
                    left: 55
                },
                width = element.clientWidth - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            scope.$watch('data', function(data) {
                if (data) {
                    var y = d3.scale.ordinal()
                        .domain(data.map(function(d) {
                            return d.name;
                        }))
                        .rangeRoundBands([height, 0], 0.05);

                    var x = d3.scale.linear()
                        .domain([0, d3.max(data, function(d) {
                            return d.value;
                        })])
                        .range([0, width]);

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left');

                    var chart = d3.select(element).append('svg')
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
                        .attr('y', function(d) {
                            return y(d.name);
                        })
                        .attr('width', function(d) {
                            return x(d.value);
                        })
                        .attr('height', y.rangeBand());

                    chart.selectAll('.btext')
                        .data(data)
                        .enter().append('text')
                        .attr('class', 'btext')
                        .attr('x', function(d) {
                            return x(d.value) - 3;
                        })
                        .attr('y', function(d) {
                            return y(d.name) + (y.rangeBand() / 2);
                        })
                        .attr('dy', '.35em')
                        .text(function(d) {
                            return d.value;
                        });
                }
            }, true);
        }
    };
});
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
    function($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        //         $httpProvider.interceptors.push(['$rootScope', '$q', '$cookieStore', '$location',
        //             function($rootScope, $q, $cookieStore, $location) {
        //                 return {
        //                     // Add authorization token to headers
        //                     request: function(config) {
        //                         config.headers = config.headers || {};
        //                         if ($cookieStore.get('token')) {
        //                             config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        //                         }
        //                         return config;
        //                     },

        //                     // Intercept 401s and redirect you to login
        //                     responseError: function(response) {
        //                         if (response.status === 401) {
        //                             $location.path('/login');
        //                             // remove any stale tokens
        //                             $cookieStore.remove('token');
        //                             return $q.reject(response);
        //                         } else {
        //                             return $q.reject(response);
        //                         }
        //                     }
        //                 };
        //             }
        //         ]);
        //     }
        // ]);

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
            url: '/settings/profile/edit',
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

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$state', 'Authentication',
    function($scope, $http, $state, Authentication) {
        $scope.user = Authentication.user;

        //send user to appropriate page based on role and status
        function redirect(user) {
            if (user.role === 'admin') {
                $state.go('command');
            } else {
                if (user.status === 0) {
                    $state.go('first');
                } else {
                    $state.go('agTracking', {
                        articleId: user.username
                    });
                }
            }
        }

        // If user is signed in, then redirect to appropriate page
        if ($scope.user) redirect($scope.user);

        $scope.signin = function(form) {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                Authentication.user = response;
                $scope.user = Authentication.user;
                // And redirect to appropriate page
                redirect($scope.user);
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

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
        $scope.isFirstLogin = $location.path() === '/settings/profile/first';

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
                    var newPage = $scope.isFirstLogin ? '/settings/profile' : '/';
                    $location.path(newPage);
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

        //     var currentUser = {};
        //     //if ($cookieStore.get('token')) {
        //     currentUser = Users.get();
        //     //}

        //     return {

        //         /**
        //          * Authenticate user and save token
        //          *
        //          * @param  {Object}   user     - login info
        //          * @param  {Function} callback - optional
        //          * @return {Promise}
        //          */
        //         login: function(user, callback) {
        //             console.log(user);
        //             var cb = callback || angular.noop;
        //             var deferred = $q.defer();

        //             $http.post('/auth/signin', user).
        //             success(function(data) {
        //                 console.log(data);
        //                 //$cookieStore.put('token', data.token);
        //                 currentUser = Users.get();
        //                 deferred.resolve(data);
        //                 return cb();
        //             }).
        //             error(function(err) {
        //                 this.logout();
        //                 deferred.reject(err);
        //                 return cb(err);
        //             }.bind(this));

        //             return deferred.promise;
        //         },

        //         /**
        //          * Delete access token and user info
        //          *
        //          * @param  {Function}
        //          */
        //         logout: function() {
        //             //$cookieStore.remove('token');
        //             currentUser = {};
        //         },

        //         /**
        //          * Create a new user
        //          *
        //          * @param  {Object}   user     - user info
        //          * @param  {Function} callback - optional
        //          * @return {Promise}
        //          */
        //         createUser: function(user) {
        //             //                var cb = callback || angular.noop;

        //             return Users.save(user).$promise;
        //         },

        //         /**
        //          * Change password
        //          *
        //          * @param  {String}   oldPassword
        //          * @param  {String}   newPassword
        //          * @param  {Function} callback    - optional
        //          * @return {Promise}
        //          */
        //         changePassword: function(oldPassword, newPassword, callback) {
        //             var cb = callback || angular.noop;

        //             return Users.changePassword({
        //                 id: currentUser._id
        //             }, {
        //                 oldPassword: oldPassword,
        //                 newPassword: newPassword
        //             }, function(user) {
        //                 return cb(user);
        //             }, function(err) {
        //                 return cb(err);
        //             }).$promise;
        //         },

        //         updateProfile: function(user, callback) {
        //             var cb = callback || angular.noop;

        //             return Users.updateProfile({
        //                 id: user._id
        //             }, function(user) {
        //                 return cb(user);
        //             }, function(err) {
        //                 return cb(err);
        //             }).$promise;
        //         },

        //         /**
        //          * Gets all available info on authenticated user
        //          *
        //          * @return {Object} user
        //          */
        //         getCurrentUser: function() {
        //             return currentUser;
        //         },

        //         /**
        //          * Check if a user is logged in
        //          *
        //          * @return {Boolean}
        //          */
        //         isLoggedIn: function() {
        //             return currentUser.hasOwnProperty('role');
        //         },

        //         /**
        //          * Waits for currentUser to resolve before checking if user is logged in
        //          */
        //         isLoggedInAsync: function(cb) {
        //             if (currentUser.hasOwnProperty('$promise')) {
        //                 currentUser.$promise.then(function() {
        //                     cb(true);
        //                 }).catch(function() {
        //                     cb(false);
        //                 });
        //             } else if (currentUser.hasOwnProperty('role')) {
        //                 cb(true);
        //             } else {
        //                 cb(false);
        //             }
        //         },

        //         /**
        //          * Check if a user is an admin
        //          *
        //          * @return {Boolean}
        //          */
        //         isAdmin: function() {
        //             return currentUser.role === 'admin';
        //         },

        //         /**
        //          * Get auth token
        //          */
        //         // getToken: function() {
        //         //     return $cookieStore.get('token');
        //         // }
        //     };
        // }
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