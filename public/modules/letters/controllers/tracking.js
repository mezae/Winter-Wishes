'use strict';

angular.module('letters').controller('AgencyController', ['$scope', '$stateParams', '$location', '$filter', '$timeout', '$modal', 'Authentication', 'Articles', 'Agencies', 'Users',
    function($scope, $stateParams, $location, $filter, $timeout, $modal, Authentication, Articles, Agencies, Users) {
        $scope.user = Authentication.user;

        if (!$scope.user) $location.path('/');

        $scope.adminView = $scope.user.role === 'admin';
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
                Agencies.query(function(users) {
                    var admin = _.find(users, {
                        'username': 'AAA'
                    });
                    var due = $filter('date')(admin.due, 'MM/dd/yy');

                    if ($scope.currentAgency.status < 3) showCountdown(admin.due);
                });
            }
        };

        function showCountdown(deadline) {
            var countdown = dateDiff(new Date(), new Date(deadline));
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
            $scope.alert.active = $scope.alert.msg.length;
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
            clicked.active = true;
            $scope.recipients = Articles.query({
                username: $stateParams.articleId + clicked.title.charAt(0)
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
                $scope.find();
            }, function(errorResponse) {
                console.log('response');
            });
        };

        //Allows admin to delete an existing letter and shift everything up
        //Allows user to clear the current slot
        $scope.clearForm = function(selected) {
            if ($scope.adminView) {
                selected.$remove(function(response) {
                    $scope.find();
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
        }

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
                console.log(csvString);
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