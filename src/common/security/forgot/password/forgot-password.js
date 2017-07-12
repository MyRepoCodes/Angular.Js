angular.module('security.forgot-password', [])

  .config(function ($stateProvider) {

    $stateProvider
      .state('forgotPasswordForm', {
        parent: 'blank-default',
        url: '/forgot-password',
        views: {
          'header': {
            templateUrl: 'header/header.tpl.html',
            controller: 'HeaderController'
          },
          'middle-container': {
            templateUrl: 'security/forgot/password/forgot-password.tpl.html',
            controller: 'ForgotPasswordController'
          },
          'footer': {
            templateUrl: 'footer/footer.tpl.html'
          }
        }
      })

      .state('forgotPasswordFormClientUrl', {
        parent: 'blank-default',
        url: '/:clientUrl/forgot-password',
        views: {
          'header': {
            templateUrl: 'header/header.tpl.html',
            controller: 'HeaderController'
          },
          'middle-container': {
            templateUrl: 'security/forgot/password/forgot-password.tpl.html',
            controller: 'ForgotPasswordController',
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

  .controller('ForgotPasswordController',
  function ($scope, $state, $stateParams, $translate, QUESTIONS, security, $cookies, $cookieStore, $timeout, _) {
    $scope.brand = security.brand;  

    if (document.cookie && document.cookie.indexOf('ishelping=true') != -1) {
      $scope.isHelp = true;
    } else {
      $scope.isHelp = false;
    }


    $scope.countSubmitQuestion = 0;


    // Any error message from failing login
    $scope.error = null;
    $scope.reason = null;
    $scope.success = null;

    $scope.step = 1;
   // $scope.questions = _.union(QUESTIONS.questions1, QUESTIONS.questions2);

    $scope.param1 = {
      username: ''
    };

    $scope.param2 = {
      question: '',
      answer: ''
    };

    // Check username
    $scope.submitStep1 = function () {
      $scope.showValid1 = true;

      $scope.error = null;
      $scope.reason = null;
      $scope.success = null;

      if ($scope.forgotPasswordForm1.$valid) {
        security.forgetPassword($scope.param1.username).then(function (response) {
          $scope.error = null;
          $scope.showValid1 = false;

          if (response.code === 1) {// Exist question

            //overwrite question
            $scope.questions = [
              {
                question: response.question1,
                question1Id: response.question1Id
              },
              {
                question: response.question2,
                question1Id: response.question2Id
              }
            ];


            $scope.step = 2;
          } else {

            /*if ($stateParams.clientUrl) {
             $state.go('forgotUsernameFormClientUrl', {clientUrl: $stateParams.clientUrl});
             } else {
             $state.go('forgotUsernameForm');
             }*/

            security.forgetPasswordWithEmail($scope.param1.username)
              .then(function (response) {
                $scope.error = null;
                $scope.showValid1 = false;
                $scope.success = response;
              }, function () {
                $scope.error = error.error;
                $scope.success = null;
                $scope.error = $translate.instant('security.reason.username');
              });
          }
        }, function (error) {
          $scope.error = error.error;
          $scope.success = null;
          $scope.error = $translate.instant('security.reason.username');
        });
      }
    };

    // Check secret question
    $scope.submitStep2 = function () {

      $scope.error = null;
      $scope.reason = null;
      $scope.success = null;

      $scope.showValid2 = true;
      if ($scope.forgotPasswordForm2.$valid) {
          security.forgetPasswordWidthQuestion($scope.param1.username, $scope.param2.question, $scope.param2.answer.toString()).then(function (response) {
          $scope.error = null; $scope.questions = _.union(QUESTIONS.questions1, QUESTIONS.questions2);
          $scope.showValid2 = false;
          /*if ($stateParams.clientUrl) {
            $state.go('findAccountFormClientUrl', {clientUrl: $stateParams.clientUrl});
          } else {
            $state.go('findAccountForm');
          }*/
          $scope.step = 3;
          $scope.success = "A new password has been sent to your email. Please check your email to login.";
        }, function (error) {
          $scope.countSubmitQuestion += 1;
          if ($scope.countSubmitQuestion > 4) {
            $scope.isHelp = true;

            var now = new Date();
            var exp = new Date(now.getTime() + 10 * 60 * 1000);
            document.cookie = 'ishelping=true; expires=' + exp.toUTCString();
          }
          $scope.error = error.error;
          $scope.success = null;
          $scope.error = $translate.instant('security.reason.question');
        });
      }
    };


    $scope.$on('security:brand:updated', function (event, brand) {
      $scope.brand = brand;
    });
  }
  );
