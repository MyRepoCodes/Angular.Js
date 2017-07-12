angular.module('security.forgot-username', [])

    .config(function ($stateProvider) {

        $stateProvider
            .state('forgotUsernameForm', {
                parent: 'blank-default',
                url: '/forgot-username',
                views: {
                    'header': {
                        templateUrl: 'header/header.tpl.html',
                        controller: 'HeaderController'
                    },
                    'middle-container': {
                        templateUrl: 'security/forgot/username/forgot-username.tpl.html',
                        controller: 'ForgotUsernameController'
                    },
                    'footer': {
                        templateUrl: 'footer/footer.tpl.html'
                    }
                }
            })

            .state('forgotUsernameFormClientUrl', {
                parent: 'blank-default',
                url: '/:clientUrl/forgot-username',
                views: {
                    'header': {
                        templateUrl: 'header/header.tpl.html',
                        controller: 'HeaderController'
                    },
                    'middle-container': {
                        templateUrl: 'security/forgot/username/forgot-username.tpl.html',
                        controller: 'ForgotUsernameController',
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

    .controller('ForgotUsernameController',
    function ($scope, $state, $translate, utils, security) {
        $scope.brand = security.brand;

        // Any error message from failing login
        $scope.error = null;
        $scope.success = null;

        $scope.info = {
            email: ''
        };

        $scope.resetForm = function () {
            // Reset your model data
            $scope.info = {
                email: ''
            };

            // Reset all errors
            for (var att in $scope.forgotUsernameForm.$error) {
                if ($scope.forgotUsernameForm.$error.hasOwnProperty(att)) {
                    $scope.forgotUsernameForm.$setValidity(att, true);
                }
            }

            // Reset validation's state
            $scope.forgotUsernameForm.$setPristine(true);
        };

        // Check email valid
        $scope.validEmail = function () {
            return utils.validEmail($scope.info.email);
        };

        $scope.submit = function () {
            $scope.showValid = true;

            $scope.error = null;
            $scope.success = null;

            if ($scope.forgotUsernameForm.$valid && $scope.validEmail()) {
                security.forgetUsername($scope.info.email).then(function (response) {
                    $scope.success = "Check your email for your username";
                    $scope.error = null;
                    $scope.showValid = false;

                    $scope.resetForm();
                }, function (error) {
                    $scope.success = null;
                    $scope.error = error.error;
                    if (error.status === 404) {
                        $scope.error = $translate.instant('forgot.username.error');
                    } else {
                        $scope.error = $translate.instant('forgot.username.500');
                    }
                });
            }
            // Email invalid
            if (!$scope.validEmail()) {
                $scope.error = $translate.instant('forgot.username.invalid');
            }
        };

        $scope.$on('security:brand:updated', function (event, brand) {
            $scope.brand = brand;
        });
    }
    );
