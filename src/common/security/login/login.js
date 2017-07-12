angular.module('security.login', [])

  .config(function ($stateProvider) {

    $stateProvider
      .state('loginForm', {
        parent: 'blank-default',
        url: '/login',
        views: {
          'header': {
            templateUrl: 'header/header.tpl.html',
            controller: 'HeaderController'
          },
          'middle-container': {
            templateUrl: 'security/login/login.tpl.html',
            controller: 'LoginController'
          },
          'footer': {
            templateUrl: 'footer/footer.tpl.html'
          }
        }
      })

      .state('loginFormClientUrl', {
        parent: 'blank-default',
        url: '/:clientUrl/login',
        views: {
          'header': {
            templateUrl: 'header/header.tpl.html',
            controller: 'HeaderController'
          },
          'middle-container': {
            templateUrl: 'security/login/login.tpl.html',
            controller: 'LoginController',
            resolve: {
              init: function ($stateParams, security) {
                security.getBrandByClientUrl($stateParams.clientUrl);
              }
            }
          },
          'footer': {
            templateUrl: 'footer/footer.tpl.html'
          }
        }
      });

  })

  .controller('LoginController',
  function ($scope, $state, $cookieStore, $localStorage, $stateParams, $translate, $stickies, CONFIGS, security) {

    security.requestCurrentUser().then(function (user) {
      if (user) {
        authToken = $cookieStore.get('userId_' + user.userId);
        if (authToken) {

          $state.go('loggedIn.modules.dashboard');
        } else {
          $state.go('questionFrom');
        }
      }
    });


    $scope.brand = security.brand;

    $scope.type = $state.params.type ? $state.params.type : null;

    $scope.env = {
      isClickButtonLogin: false,
      stickiesLogin: $stickies.get('login'),
      step: 0
    };

    // The model for this form
    $scope.user = {
      username: '',
      password: ''
    };

    // The model for change Passwork
    $scope.paramsChangePass = {
      password: '',
      confirm: '',
    };

    // Any error message from failing login
    $scope.authError = null;
    $scope.authReason = null;
    $scope.sticky = $stickies.get('login');

    // Remove sticky
    $scope.$on('stickies:remove', function (event, sticky) {
      if (sticky.key === 'login') {
        $scope.sticky = null;
      }
    });

    $scope.$watch('user', function () {
      if (!!$scope.user.username && !!$scope.user.password) {
        $scope.removeSticky('login');
      }
    }, true);

    // login
    $scope.login = function (isValid) {

      $scope.showValid = true;
      $scope.authError = "";
      $scope.env.stickiesLogin = $stickies.get('login');
      if (isValid) {

        $scope.env.isClickButtonLogin = true;
        security.login($scope.user.username, $scope.user.password)
          .then(function (loggedIn) {           
            $scope.showValid = false;
            $scope.env.isClickButtonLogin = false;
            $scope.$storage = $localStorage;
            $scope.$storage.question = loggedIn.securityQuestions;
            var authToken = $cookieStore.get('authToken');
            if (loggedIn.roles[0] === 'Participant') {
              if ($cookieStore.get('userId_' + loggedIn.userId)) {
                // call service to validate cookies 
                var answerValidation = $cookieStore.get('userId_' + loggedIn.userId);

                security.validateQuestion(authToken, answerValidation.answertext, answerValidation.questionId, true)
                  .then(function (res) {
                    if (res.data.data.code === 401) {
                      $cookieStore.remove('userId_' + loggedIn.userId);
                      $state.go('questionFrom');
                    } else {
                      $state.go('loggedIn.modules.dashboard');
                    }
                  }, function (err) {
                    $state.go('questionFrom');
                  });
              } else {
                if ($stateParams.clientUrl) {
                  $state.go('clientUrl', { clientUrl: $stateParams.clientUrl }, { reload: true });
                } else {
                  $state.go('questionFrom');
                }
              }

            } else {
              $state.go('loggedIn.modules.dashboard');
            }


            // if (loggedIn.isNeedToChangePassword) {
            //   $scope.env.step = 1;
            // } else {
            //   if ($stateParams.clientUrl) {
            //     $state.go('clientUrl', { clientUrl: $stateParams.clientUrl }, { reload: true });
            //   } else {
            //     $state.go('init', {}, { reload: true });
            //   }
            // }



          }, function (error) {
            $scope.env.isClickButtonLogin = false;
            if (error.error_description === "1005") { //account inactive
              $scope.authError = $translate.instant('login.error.inactiveUser');

              // Send alert to login page
              if ($state.current.name !== 'loginForm' || $state.current.name !== 'loginFormClientUrl') {
                $stickies.set('login', $translate.instant('login.error.inactiveUser'), 'danger');
              }

            } else if (error.error_description === "1009") { //account inactive
              $scope.env.step = 2;
              $scope.infoMaintenance = JSON.parse(error.fullError.error_uri);

            } else {
              $scope.authError = error.error_description; //$translate.instant('login.error.invalidCredentials');

              // Send alert to login page
              if ($state.current.name !== 'loginForm' || $state.current.name !== 'loginFormClientUrl') {
                $stickies.set('login', $translate.instant('login.error.invalidCredentials'), 'danger');
              }
            }


          });
      }
    };


    // Change Password
    $scope.changePassword = function (isValid, data) {

      $scope.showValid = true;
      if (isValid) {

        $scope.env.isClickButtonLogin = true;

        security.changePasswordMe({
          oldPassword: $scope.user.password,
          newPassword: data.password
        }).then(function (response) {
          $scope.env.inforChangePassword = "Change password success!";
          $scope.showValid = false;
          $scope.env.isClickButtonLogin = false;
          $scope.env.step = 0;


          if ($stateParams.clientUrl) {
            $state.go('clientUrl', { clientUrl: $stateParams.clientUrl }, { reload: true });
          } else {
            $state.go('init', {}, { reload: true });
          }


        }, function (error) {
          $scope.env.inforChangePassword = "Change password fail!";
          $scope.env.isClickButtonLogin = false;
        });

      }
    };

    $scope.$on('security:brand:updated', function (event, brand) {
      $scope.brand = brand;
    });

    $scope.$on('response:authorized:error', function (event, rejection) {
      if (rejection.config.url.indexOf('authenticate') > -1) {
        $scope.authError = $translate.instant('login.error.invalidCredentials');

        // Send alert to login page
        if ($state.current.name !== 'loginForm' || $state.current.name !== 'loginFormClientUrl') {
          $stickies.set('login', $translate.instant('login.error.invalidCredentials'), 'danger');
        }
      }
    });

  }
  );
