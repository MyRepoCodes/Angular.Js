angular.module('app.modules.settings.participant', [])

  .controller('SettingsParticipantController', function ($scope,$stateParams, $state, $translate,$cookieStore, $modal, IMAGECONFIGS, ERRORCODES, security, utils, QUESTIONS, users, participants, $localStorage,apiService) {
    $scope.currentUser = security.currentUser;
    $scope.currentEmployer = security.currentUser.employer;
    $scope.spouseInfo = null;
    $scope.dependentList = [];
    $scope.currentBenefitYearBcs = null;
    $scope.currentUser = security.currentUser;
    $scope.$storage = $localStorage;
    if ($stateParams.viewSetting) {
      var authToken = $cookieStore.get('authToken');
      // Set the Request Header 'Authorization'
      apiService.setAuthTokenHeader(authToken);


      //Get currentUser
      apiService.get('users/auth?loadingSpinnerNotShowing&ver=' + Math.random(), undefined, {
        screenName: $translate.instant('auditLogs.screenName.mySetting')
      }).then(function (res) {}, function (error) {});
    }

    security.getSpouse().then(function (spouseInfo) {
      $scope.spouseInfo = spouseInfo;
    });

    security.getDependents().then(function (dependentList) {
      $scope.dependentList = dependentList;
    });

    security.getCurrentBenefitYearBcs().then(function (currentBenefitYearBcs) {
      $scope.currentBenefitYearBcs = currentBenefitYearBcs;
    });

    $scope.questions1 = $scope.$storage.one;
    $scope.questions2 = $scope.$storage.two;

    $scope.oldQuestionSecurity = {
      question1: false,
      question2: false
    };

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
      clientLocationList: $scope.currentEmployer.employerLocations,
      products: $scope.currentUser.products,
      currentEnrollmentLevel: $scope.currentEmployer.enrollmentLevel,
      currentTab: 1,
      totalTab: 1,
    };

    // Init Model
    $scope.params = {
      firstName: $scope.currentUser.firstName,
      middleName: $scope.currentUser.middleName,
      lastName: $scope.currentUser.lastName,
      dateOfBirth: utils.parseDateOfBirthToDatePacker($scope.currentUser.dateOfBirth),
      ssn: $scope.currentUser.ssn,
      gender: $scope.currentUser.gender,
      phoneNumber: $scope.currentUser.phoneNumber,
      email: $scope.currentUser.email,
      streetAddress: $scope.currentUser.streetAddress,
      addressLine2: $scope.currentUser.addressLine2,
      city: $scope.currentUser.city,
      postalCode: $scope.currentUser.postalCode,
      state: $scope.currentUser.state,
      country: $scope.currentUser.country,
      coverageLevel: $scope.currentUser.coverageLevel,
      clientLocation: $scope.currentUser.clientLocation,
      // BeniComp Select
      groupNumber: $scope.currentEmployer.groupNumber,
      effectiveDate: utils.dateServerToLocalTime($scope.currentEmployer.effectiveDateOfInsurance),
      annualMaximum: $scope.currentEmployer.annualMaximum,
      employmentDate: utils.dateServerToLocalTime($scope.currentUser.employmentDate),
      maritalStatus: $scope.currentUser.maritalStatus,
      numberOfDependents: $scope.currentUser.numberOfDependents,
      indexClassesOfEligibleEmployees: $scope.currentUser.indexClassesOfEligibleEmployees,
      annualClassesOfEligibleEmployees: $scope.currentUser.annualClassesOfEligibleEmployees,

      primaryBeneficiaryForAdd: $scope.currentUser.primaryBeneficiaryForAdd,
      primaryBeneficiaryRelationship: $scope.currentUser.primaryBeneficiaryRelationship,
      contingentBeneficiaryForAdd: $scope.currentUser.contingentBeneficiaryForAdd,
      contingentBeneficiaryRelationship: $scope.currentUser.contingentBeneficiaryRelationship,
    };

    $scope.paramsQuestionSecurity = {
      question1: $scope.currentUser.securityQuestions[0].questionId,
      answer1: '',
      question2: $scope.currentUser.securityQuestions[1].questionId,
      answer2: ''
    };

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
      if (group == 1) {
        $scope.questions2 = $scope.$storage.two.filter(function (v, i) {
          return $scope.paramsQuestionSecurity.question1 !== v.questionID;
        });
      } else {
        $scope.questions1 = $scope.$storage.one.filter(function (v, i) {
          return $scope.paramsQuestionSecurity.question2 !== v.questionID;
        });
      }
    };

    function paramsPassword() {
      $scope.paramsChangePassword = {
        oldPassword: '',
        password: '',
        confirmPassword: ''
      };
    }

    // Open confirm
    $scope.openConfirm = function () {

      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        resolve: {
          data: function () {
            return {
              title: '',
              summary: false,
              style: 'yesNo',
              message: 'Would you like to make changes to your profile?',
              title_button_ok: 'Proceed to Change Form',
              title_button_cancel: 'Cancel'
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          $state.go('loggedIn.modules.changeForm');
        }
      });
    };

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

    // Update
    function patchMeSecurity() {

    }

    $scope.update = function (form) {
      $scope.env.showValid = true;
      notify();
      var changed = utils.hasChanged($scope.params, $scope.original);
      var isValidQuestionSecurity = isValidationQuestionSecurity($scope.paramsQuestionSecurity);

      var changedPassword = false;
      if ($scope.paramsChangePassword.oldPassword !== '' && $scope.paramsChangePassword.password !== '' && $scope.paramsChangePassword.confirmPassword !== '') {
        changedPassword = utils.hasChanged($scope.paramsChangePassword, $scope.originalChangePassword);
      }

      if (($scope.oldQuestionSecurity.question1.QuestionId === $scope.paramsQuestionSecurity.question1 && !$scope.paramsQuestionSecurity.answer1) && ($scope.oldQuestionSecurity.question2.QuestionId === $scope.paramsQuestionSecurity.question2 && !$scope.paramsQuestionSecurity.answer2)) {
        if (!changedPassword) {
          return $scope.env.success = $translate.instant('profile.message.noChange');
        }
      }

      if (!$scope.paramsChangePassword.oldPassword) {
        $scope.updateRequired = true;
        return $scope.env.error = $translate.instant('password.oldPassword');
      }


      if (!isValidQuestionSecurity) { // Question Security don't validation
        $scope.env.error = $translate.instant('server.questionSecurity.validation');
      } else { //validation Question Security
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

            users.updateQuestionSecurity(dataPost).then(function (res) {

              $scope.env.showValid = false;
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
          }).then(function (response) {
            $scope.env.inforChangePassword = "Change password success!";

            $scope.env.showValid = false;
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

      }
    };

    /*** Start Tab index ***/
    $scope.tabsets = {
      profile: {
        tabindex: 1,
        title: 'Password & Question',
        active: true,
        disabled: false,
      },
    };

    // Set current tabindex
    function setCurrentTabIndex(tabindex) {
      _.forEach($scope.tabsets, function (value) {
        if (value.tabindex == tabindex) {
          if (!value.disabled) {
            value.active = true;
          } else {
            tabindex = (tabindex >= 3) ? 1 : (tabindex + 1);
            setCurrentTabIndex(tabindex);
            return;
          }
        } else {
          value.active = false;
        }
      });
      $scope.env.currentTab = tabindex;
    }

    // Calculator total tab and set current Tab
    function calcTotalTab() {
      $scope.env.totalTab = 1;
      _.forEach($scope.env.products, function (value, key) {
        if (value) {
          $scope.env.totalTab++;
        }
        $scope.tabsets[key].disabled = !value;
      });
      if ($scope.env.currentTab > $scope.env.totalTab) {
        $scope.env.currentTab = $scope.env.totalTab;
      }
      setCurrentTabIndex($scope.env.currentTab);
    }

    // Continue
    $scope.continue = function (isValid) {
      setCurrentTabIndex($scope.env.currentTab + 1);
    };

    // Click on tab
    $scope.selectTab = function (tabindex) {
      setCurrentTabIndex(tabindex);
    };
    /*** End Tab index ***/

    // Init Tabs
    function initTab() {
      _.forEach($scope.currentEmployer.products, function (value, key) {
        if ($scope.env.products.hasOwnProperty(key)) {
          $scope.env.products[key] = value && $scope.env.products[key];
        }
      });
      //calcTotalTab();
    }

    initTab();

    // Function int
    function int() {
      notify();
      paramsPassword();
    }

    int();

    $scope.spouseCallback = function (spouseInfo) {
      $scope.spouseInfo = spouseInfo;
      security.updateSpouse(spouseInfo);
    };

    $scope.dependentCallback = function (dependentList) {
      $scope.dependentList = dependentList;
      security.updateDependents(dependentList);
    };

    $scope.$watch('dependentList', function () {
      $scope.params.numberOfDependents = $scope.dependentList.length;
    }, true);

    // Clear environment
    $scope.$watch('params', function () {
      $scope.env.emailExist = false;
      $scope.env.passwordExist = false;

      $scope.env.error = null;
      $scope.env.success = null;
      $scope.env.inforChangePassword = null;
    }, true);
  });