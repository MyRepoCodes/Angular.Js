angular.module('app.modules.settings.default', [])

  .controller('SettingsDefaultController', function ($scope, $stateParams, $state, $localStorage, $cookieStore, $translate, $modal, IMAGECONFIGS, ERRORCODES, security, utils,
    QUESTIONS, participants, employers, agents, users, healthCoachs, superadmins, healthCoachManagers, clientManagers, clinicalDirectors, admins, apiService) {
    $scope.currentUser = security.currentUser;
    $scope.$storage = $localStorage;


    $scope.questions1 = $scope.$storage.one;
    $scope.questions2 = $scope.$storage.two;


    $scope.oldQuestionSecurity = {
      question1: false,
      question2: false
    };

    if ($stateParams.viewSetting) {
      var authToken = $cookieStore.get('authToken');
      // Set the Request Header 'Authorization'
      apiService.setAuthTokenHeader(authToken);

      //Get currentUser
      apiService.get('users/auth?loadingSpinnerNotShowing&ver=' + Math.random(), undefined, {
        screenName: $translate.instant('auditLogs.screenName.mySetting')
      }).then(function (res) {}, function (error) {});
    }
    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      emailExist: false,
      passwordExist: false,
      usernameExist: false,
      error: null,
      success: null,
      inforChangePassword: null,
    };

    var API = participants;
    if (security.isAdmin()) {
      API = admins;
    } else if (security.isSuperAdmin()) {
      API = superadmins;
    } else if (security.isClinicalDirector()) {
      API = clinicalDirectors;
    } else if (security.isClientManager()) {
      API = clientManagers;
    } else if (security.isHealthCoachManager()) {
      API = healthCoachManagers;
    } else if (security.isHealthCoach()) {
      API = healthCoachs;
    } else if (security.isAgentTheAgent()) {
      API = agents;
    } else if (security.isEmployer()) {
      API = employers;
    } else if (security.isParticipant()) {
      API = participants;
    }

    // Init Model
    $scope.params = {
      firstName: $scope.currentUser.firstName,
      middleName: $scope.currentUser.middleName,
      lastName: $scope.currentUser.lastName,
      phoneNumber: $scope.currentUser.phoneNumber,
      email: $scope.currentUser.email,
      streetAddress: $scope.currentUser.streetAddress,
      addressLine2: $scope.currentUser.addressLine2,
      city: $scope.currentUser.city,
      postalCode: $scope.currentUser.postalCode,
      state: $scope.currentUser.state,
      country: $scope.currentUser.country
    };


    if ($scope.currentUser.securityQuestions.length > 0) {
      $scope.paramsQuestionSecurity = {
        question1: $scope.currentUser.securityQuestions[0].questionId,
        answer1: '',
        question2: $scope.currentUser.securityQuestions[1].questionId,
        answer2: ''
      };
    }

    if ($scope.currentUser.securityQuestions.length > 0) {
      $scope.oldQuestionSecurity = {
        question1: {
          QuestionId: $scope.currentUser.securityQuestions.length > 0 ? angular.copy($scope.currentUser.securityQuestions[0].questionId) : "",
          QuestionText: $scope.currentUser.securityQuestions.length > 0 ? angular.copy($scope.currentUser.securityQuestions[0].question) : ""
        },
        question2: {
          QuestionId: $scope.currentUser.securityQuestions.length > 0 ? angular.copy($scope.currentUser.securityQuestions[1].questionId) : "",
          QuestionText: $scope.currentUser.securityQuestions.length > 0 ? angular.copy($scope.currentUser.securityQuestions[1].question) : ""
        }
      };
    }

    $scope.change = function (group) {
      if ($scope.currentUser.securityQuestions.length > 0) {
        if (group == 1) {
          $scope.questions2 = $scope.$storage.two.filter(function (v, i) {
            return $scope.paramsQuestionSecurity.question1 !== v.questionID;
          });
        } else {
          $scope.questions1 = $scope.$storage.one.filter(function (v, i) {
            return $scope.paramsQuestionSecurity.question2 !== v.questionID;
          });
        }
      }
    };

    function paramsPassword() {
      $scope.paramsChangePassword = {
        oldPassword: '',
        password: '',
        confirmPassword: ''
      };
    }

    function notify() {
      $scope.env.success = null;
      $scope.env.inforChangePassword = null;
      $scope.env.error = null;
    }


    $scope.original = angular.copy($scope.params);
    $scope.originalChangePassword = angular.copy($scope.paramsChangePassword);

    function isValidationQuestionSecurity(dataQuestion) {
      var result = false;

      // update
      if ($scope.currentUser.securityQuestions.length > 0) {
        if ($scope.oldQuestionSecurity.question1.QuestionId === dataQuestion.question1 && !dataQuestion.answer1) {
          dataQuestion.answer1 = null;
        } else {
          dataQuestion.answer1 = dataQuestion.answer1 ? dataQuestion.answer1 : "";
        }

        if ($scope.oldQuestionSecurity.question2.QuestionId === dataQuestion.question2 && !dataQuestion.answer2) {
          dataQuestion.answer2 = null;
        } else {
          dataQuestion.answer2 = dataQuestion.answer2 ? dataQuestion.answer2 : "";
        }
      }

      if ($scope.currentUser.securityQuestions.length > 0) {
        if (dataQuestion.question1 === '' && dataQuestion.question2 === '' &&
          dataQuestion.answer1 === '' && dataQuestion.answer2 === '') {
          result = true;
        }

        if (dataQuestion.question1 !== '' && dataQuestion.question2 !== '' &&
          dataQuestion.answer1 !== '' && dataQuestion.answer2 !== '') {
          result = true;
        }
        return result;
      }
    }


    // Update
    $scope.update = function (form) {
     $scope.env.showValid = true;
      notify();
      var changed = utils.hasChanged($scope.params, $scope.original);
      var isValidQuestionSecurity;
      if($scope.currentUser.securityQuestions.length > 0){
          isValidQuestionSecurity = isValidationQuestionSecurity($scope.paramsQuestionSecurity);
      } else {
        isValidQuestionSecurity = true;
      }     

      
      var changedPassword = false;
      if ($scope.paramsChangePassword.oldPassword !== '' && $scope.paramsChangePassword.password !== '' && $scope.paramsChangePassword.confirmPassword !== '') {
        changedPassword = utils.hasChanged($scope.paramsChangePassword, $scope.originalChangePassword);
      }


   if($scope.currentUser.securityQuestions.length > 0){
      if (($scope.oldQuestionSecurity.question1.QuestionId === $scope.paramsQuestionSecurity.question1 && !$scope.paramsQuestionSecurity.answer1) && ($scope.oldQuestionSecurity.question2.QuestionId === $scope.paramsQuestionSecurity.question2 && !$scope.paramsQuestionSecurity.answer2)) {
        if (!changedPassword) {
          return $scope.env.success = $translate.instant('profile.message.noChange');
        }
      }
   }


      if (!$scope.paramsChangePassword.oldPassword) {
        $scope.updateRequired = true;
        return $scope.env.error = $translate.instant('password.oldPassword');
      }

      if (!isValidQuestionSecurity) { // Question Security don't validation
        $scope.env.error = $translate.instant('server.questionSecurity.validation');
      } else {
        //validation Question Security      
        //For question security
        if ($scope.paramsQuestionSecurity.question1 !== '' && $scope.paramsQuestionSecurity.question2 !== '' &&
          $scope.paramsQuestionSecurity.answer1 !== '' && $scope.paramsQuestionSecurity.answer2 !== '') {

          if ($scope.paramsQuestionSecurity.answer1 !== null || $scope.paramsQuestionSecurity.answer2 !== null) {
            var dataPost = {
              SecurityQuestions: ([{
                  QuestionId: $scope.paramsQuestionSecurity.question1,
                  Answer: ($scope.paramsQuestionSecurity.answer1 === null) ? null : $scope.paramsQuestionSecurity.answer1.toString()
                },
                {
                  QuestionId: $scope.paramsQuestionSecurity.question2,
                  Answer: ($scope.paramsQuestionSecurity.answer2 === null) ? null : $scope.paramsQuestionSecurity.answer2.toString()
                }
              ])
            };

            users.updateQuestionSecurity(dataPost, {
              screenName: $translate.instant('auditLogs.screenName.mySetting')
            }).then(function (res) {
              $scope.env.success = $translate.instant('server.questionSecurity.success');

              // Go to top
              angular.element('html').animate({
                scrollTop: 100
              }, "slow");
              /* Firefox*/
              angular.element('body').animate({
                scrollTop: 100
              }, "slow");
              /* Chorme*/
            });
          }
        }
        //For user security
        if (form.$valid && changedPassword) {
          security.changePasswordMe({
            oldPassword: $scope.paramsChangePassword.oldPassword,
            newPassword: $scope.paramsChangePassword.password
          }, {
            screenName: $translate.instant('auditLogs.screenName.mySetting')
          }).then(function (response) {
            $scope.env.inforChangePassword = "Change password success!";

            // Go to top
            angular.element('html').animate({
              scrollTop: 100
            }, "slow");
            /* Firefox*/
            angular.element('body').animate({
              scrollTop: 100
            }, "slow");
            /* Chorme*/

          }, function (error) {
            $scope.env.inforChangePassword = "Change password fail!";
          });
        } else if (!changedPassword) {
          utils.resetForm(form);
        }

        //For user info
        if (form.$valid && changed) {
          API.put({
            id: security.currentUser.id,
            firstName: $scope.params.firstName,
            middleName: $scope.params.middleName,
            lastName: $scope.params.lastName,
            streetAddress: $scope.params.streetAddress,
            addressLine2: $scope.params.addressLine2,
            city: $scope.params.city,
            postalCode: $scope.params.postalCode,
            state: $scope.params.state,
            //country: $scope.params.country
            country: "USA"
          }).then(function (response) {
            var currentUser = angular.copy($scope.currentUser);

            users.patchMeSecurity(utils.formatDataMeSecurity(currentUser, $scope.params)).then(function () {
              $scope.env.showValid = false;
              $scope.env.error = null;
              $scope.env.success = $translate.instant('profile.message.success');

              // Fix for email
              response['email'] = $scope.params.email;

              // Update params
              $scope.original = angular.copy($scope.params);
              security.currentUser = security.updateCurrentUser(response);

              // Reset form
              utils.resetForm(form);

              // Go to top
              angular.element('html').animate({
                scrollTop: 100
              }, "slow");
              /* Firefox*/
              angular.element('body').animate({
                scrollTop: 100
              }, "slow");
              /* Chorme*/

            }, function (err) {

              angular.forEach(err.errors, function (error) {
                if (error.errorCode === ERRORCODES.conflict.email) {
                  $scope.env.emailExist = true;
                  $scope.env.error = $translate.instant('server.error.409.email');
                } else if (error.errorCode === ERRORCODES.conflict.username) {
                  $scope.env.usernameExist = true;
                  $scope.env.error = $translate.instant('server.error.409.username');
                }
              });

            });
          }, function (error) {
            $scope.env.error = error.error;
            $scope.env.success = null;
            if (error.errorCode === ERRORCODES.conflict.email) {
              $scope.env.emailExist = true;
              $scope.env.error = $translate.instant('server.error.409.email');
            } else if (error.errorCode === ERRORCODES.conflict.password) {
              $scope.env.passwordExist = true;
              $scope.env.error = $translate.instant('server.error.409.password');
            }
          });
        } else if (!changed && !changedPassword) {
          $scope.env.success = $translate.instant('profile.message.noChange');

          // Reset form
          utils.resetForm(form);
        } else if (!changed && changedPassword) {
          paramsPassword();
          // Reset form
          utils.resetForm(form);
        }
      }
    };

    // Function int
    function int() {
      notify();
      paramsPassword();
    }

    int();

    // Clear environment
    $scope.$watch('params', function () {
      $scope.env.emailExist = false;
      $scope.env.passwordExist = false;

      $scope.env.error = null;
      $scope.env.success = null;
      $scope.env.inforChangePassword = null;
    }, true);

    /*** Start Tab index ***/
    $scope.tabsets = {
      profile: {
        tabindex: 1,
        title: 'Profile',
        active: true,
        disabled: false,
      }
    };
  });
