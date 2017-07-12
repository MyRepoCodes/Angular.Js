angular.module('security.find-account', [])

    .config(function ($stateProvider) {

        $stateProvider
            .state('findAccountForm', {
                parent: 'blank-default',
                url: '/find-account',
                views: {
                    'header': {
                        templateUrl: 'header/header.tpl.html',
                        controller: 'HeaderController'
                    },
                    'middle-container': {
                        templateUrl: 'security/find-account/find-account.tpl.html',
                        controller: 'FindAccountController'
                    },
                    'footer': {
                        templateUrl: 'footer/footer.tpl.html'
                    }
                }
            })

            .state('findAccountFormClientUrl', {
                parent: 'blank-default',
                url: '/:clientUrl/find-account',
                views: {
                    'header': {
                        templateUrl: 'header/header.tpl.html',
                        controller: 'HeaderController'
                    },
                    'middle-container': {
                        templateUrl: 'security/find-account/find-account.tpl.html',
                        controller: 'FindAccountController',
                        resolve: {
                            init: function ($location, $stateParams, security) {
                                return security.findEmployerByUrl($stateParams.clientUrl).then(function (employerInfo) {
                                    if (employerInfo) {
                                        security.getBrandByClientUrl($stateParams.clientUrl);
                                        return employerInfo;
                                    } else {
                                        $location.path('/find-account');
                                    }
                                });
                            }
                        }
                    },
                    'footer': {
                        templateUrl: 'footer/footer.tpl.html'
                    }
                }
            });

    })

    .controller('FindAccountController',
    function ($scope, $state, $timeout, $cookieStore, $stateParams, $translate, $stickies, DATECONFIGS,$localStorage,security) {
        $scope.brand = security.brand;
        $scope.currentClient = security.currentClient;

        $scope.error = "";
        $scope.env = {
            isAlreadyCreated: false
        };

        // The model for this form
        $scope.params = {
            lastname: '',
            dateofbirth: '',
            ssn: ''
        };

        // Save
        $scope.submit = function () {
            $scope.showValid = true;
            $scope.$storage = $localStorage;
            $scope.error = "";
            if ($scope.findAccountForm.$valid) {
                // handle date of birth
                var dateofbirth = new Date($scope.params.dateofbirth).format('mmddyyyy');
                security.findAccount({
                    lastname: $scope.params.lastname,
                    dateofbirth: dateofbirth,
                    ssn: $scope.params.ssn
                }).then(function (res) {

                    if (res.isAlreadyCreated) { //have created account
                        $scope.env.isAlreadyCreated = true;

                    } else {

                   $scope.$storage.one =  res.availableSecurityQuestions.securityQuestions;
                    $scope.$storage.two = res.availableSecurityQuestions.securityQuestions;

                        $scope.env.isAlreadyCreated = false;

                        if ($stateParams.clientUrl) {
                            $state.go('usernameFormClientUrl', { clientUrl: $stateParams.clientUrl });
                        } else {
                            $state.go('usernameForm');
                        }
                    }

                    $scope.showValid = false;
                }, function (error) {

                    $scope.env.isAlreadyCreated = false;

                    if (error.status === 500) {
                        $scope.error = $translate.instant('server.error.500');
                    } else {
                        $scope.error = $translate.instant('findAccount.notFound');
                    }
                });
            }
        };

        // Date picker
        $scope.opened = false;
        $scope.dateOptions = DATECONFIGS.dateOptions;

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            if (!$scope.params.dateofbirth) {
                $scope.params.dateofbirth = DATECONFIGS.dateStart;
                $timeout(function () {
                    $scope.findAccountForm.dateOfBirth.$setViewValue($scope.findAccountForm.dateOfBirth.$viewValue);
                }, 100);
            }

            $scope.opened = true;
        };

        $scope.$on('security:brand:updated', function (event, brand) {
            $scope.brand = brand;
        });
    }
    );
