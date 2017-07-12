angular.module("app.modules.participant.edit", [])

  .config(function ($stateProvider) {
    var resolve = {
      participantInfo: function ($stateParams, participants) {
        return participants.find($stateParams.id).then(function (response) {
          return response;
        }, function () {
          return {};
        });
      },

      spouseList: function ($stateParams, participants) {
        var params = {
          id_participant: $stateParams.id
        };

        var headers = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: false
            }
          ])
        };

        return participants.getListSpouse(params, headers).then(function (response) {
          return response;
        });
      },

      dependentList: function ($stateParams, participants) {
        var params = {
          id_participant: $stateParams.id,
          page: 1,
          count: 999,
        };

        var headers = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: false
            }
          ])
        };

        return participants.getListDependents(params, headers).then(function (response) {
          return response;
        });
      },


    };

    $stateProvider
      .state('loggedIn.modules.participant.edit', {
        url: '/edit/:id/',
        views: {
          'main-content@loggedIn.modules': {
            templateUrl: 'modules/participant/edit/edit.tpl.html',
            controller: 'ParticipantEditController',
            resolve: resolve,
          }
        }
      });
    /*.state('loggedIn.modules.participant.editClient', {
      url: '/client/:idClient/edit/:id/',
      views: {
        'main-content@loggedIn.modules': {
          templateUrl: 'modules/participant/edit/edit.tpl.html',
          controller: 'ParticipantEditController',
          resolve: resolve,
        }
      }
    });*/
  })

  .controller('ParticipantEditController', function ($scope, $state, $stateParams, $translate, $modal, ERRORCODES, BENICOMPSELECT, utils, security, participants, spouseList, employers, users, participantInfo, dependentList) {
    $scope.participantInfo = angular.copy(participantInfo);

    $scope.spouseList = (spouseList.data.length > 0) ? [spouseList.data[0]] : []; //Get one spouse active
    $scope.dependentList = dependentList.data;

    $scope.isEmployer = security.isEmployer();

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      emailExist: false,
      passwordExist: false,
      usernameExist: false,
      error: null,
      confirm: '',
      currentClientLocation: null,
      clientLocationList: [],
      currentEnrollmentLevel: 0,
      currentIncentive: null,
      currentBenefitYearBcs: null,
      // tabset
      products: {
        beniCompAdvantage: false,
        beniCompSelect: false
      },
      currentTab: 1,
      totalTab: 1,
    };

    // Init Model
    $scope.params = {
      firstName: participantInfo.firstName,
      middleName: participantInfo.middleName,
      lastName: participantInfo.lastName,
      dateOfBirth: utils.parseDateOfBirthToDatePacker(participantInfo.dateOfBirth),
      ssn: participantInfo.ssn,
      streetAddress: participantInfo.streetAddress,
      addressLine2: participantInfo.addressLine2,
      city: participantInfo.city,
      postalCode: participantInfo.postalCode,
      state: participantInfo.state,
      country: participantInfo.country,
      phoneNumber: participantInfo.phoneNumber,
      email: participantInfo.email,
      beniCompID: participantInfo.beniCompID,
      gender: participantInfo.gender,
      employerId: participantInfo.employerId ? participantInfo.employerId : undefined,
      healthCoachId: participantInfo.healthCoachId ? participantInfo.healthCoachId : undefined,
      maritalStatus: participantInfo.maritalStatus,
      numberOfDependents: participantInfo.numberOfDependents,
      // BeniComp Advantage
      coverageLevel: participantInfo.coverageLevel,
      clientLocation: participantInfo.clientLocation,
      products: participantInfo.products,
      incentiveAssignId: participantInfo.incentiveAssignId,
      // BeniComp Select
      groupNumber: '',
      effectiveDate: utils.dateServerToLocalTime(participantInfo.effectiveDate),
      employmentDate: utils.dateServerToLocalTime(participantInfo.employmentDate),
      indexClassesOfEligibleEmployees: participantInfo.indexClassesOfEligibleEmployees,
      benefitYearBcsId: participantInfo.benefitYearBcsId,
    };

    $scope.$watch('env.currentEmployer', function (employer) {
      if (_.isObject(employer)) {
        $scope.params.groupNumber = employer.groupNumber;
        if (!$scope.params.effectiveDate) {
          $scope.params.effectiveDate = utils.dateServerToLocalTime(employer.effectiveDateOfInsurance);
        }
      } else {
        $scope.params.groupNumber = '';
      }
    }, true);

    // BeniComp Advantage
    $scope.incentiveList = [];
    $scope.incentiveParams = {
      plans: {},
      planOption: 0
    };

    function getIncentiveByEmployerId(employerId) {
      if (!employerId) {
        return;
      }

      employers.getEmployerWithIncentive({ id: employerId }).then(function (response) {
        $scope.incentiveList = response.incentives;

        // Change enrollment level
        $scope.env.currentEnrollmentLevel = response.enrollmentLevel;

        // Select current incentive
        $scope.selectIncentive($scope.params.incentiveAssignId);
      });
    }

    // Select incentive
    $scope.selectIncentive = function (incentiveId) {
      $scope.env.currentIncentive = _.findWhere($scope.incentiveList, { id: incentiveId });
      if ($scope.env.currentIncentive) {
        $scope.incentiveParams.plans = $scope.env.currentIncentive.plans;
        $scope.incentiveParams.planOption = $scope.env.currentIncentive.planOption;
      } else {
        $scope.incentiveParams.plans = {};
        $scope.incentiveParams.planOption = 0;
      }
    };
    // End BeniComp Advantage

    // BeniComp Select
    $scope.benefitYearBcsList = [];
    function getBenefitYearBcsList(employerId) {
      if (!employerId) {
        return;
      }

      employers.getBenefitYearBcs(employerId).then(function (response) {
        $scope.benefitYearBcsList = response;

        // Select current benefitYearBcs
        $scope.selectBenefitYearBcs($scope.params.benefitYearBcsId);
      });
    }

    $scope.selectBenefitYearBcs = function (benefitYearBcsId) {
      $scope.env.currentBenefitYearBcs = _.findWhere($scope.benefitYearBcsList, { id: benefitYearBcsId });
    };
    // End BeniComp Select

    // Update
    $scope.update = function (isValid) {
      $scope.env.showValid = true;
      $scope.env.row = 0;
      if (isValid) {
        participants.put({
          id: $stateParams.id,
          firstName: $scope.params.firstName,
          middleName: $scope.params.middleName,
          lastName: $scope.params.lastName,
          dateOfBirth: utils.parseDateOfBirthBeforePush($scope.params.dateOfBirth),
          ssn: utils.ssnFormatSubmit($scope.params.ssn),
          streetAddress: $scope.params.streetAddress,
          addressLine2: $scope.params.addressLine2,
          city: $scope.params.city,
          postalCode: $scope.params.postalCode,
          state: $scope.params.state,
          //country: $scope.params.country,
          country: "USA",
          //phoneNumber: '(' + $scope.params.phoneNumber_1 + ') ' + $scope.params.phoneNumber_2 + '-' + $scope.params.phoneNumber_3,
          //phoneNumber: $scope.params.phoneNumber,
          //email: $scope.params.email,
          gender: $scope.params.gender,
          beniCompID: "",
          employerId: security.isEmployer() ? security.currentUser.id : $scope.params.employerId,
          healthCoachId: security.isHealthCoach() ? security.currentUser.id : $scope.params.healthCoachId,
          coverageLevel: $scope.params.coverageLevel, // Change "Coverage Level" to "Enrollment Level"
          clientLocation: $scope.params.clientLocation,
          products: {
            beniCompAdvantage: $scope.env.products.beniCompAdvantage ? $scope.params.products.beniCompAdvantage : false,
            beniCompSelect: $scope.env.products.beniCompSelect ? $scope.params.products.beniCompSelect : false
          },
          incentiveAssignId: $scope.env.currentIncentive ? $scope.env.currentIncentive.id : null,
          // BeniComp Select
          effectiveDate: utils.dateToShort($scope.params.effectiveDate),
          employmentDate: utils.dateToShort($scope.params.employmentDate),
          maritalStatus: $scope.params.maritalStatus,
          numberOfDependents: $scope.params.numberOfDependents,
          indexClassesOfEligibleEmployees: $scope.params.indexClassesOfEligibleEmployees,
          benefitYearBcsId: $scope.env.currentBenefitYearBcs ? $scope.env.currentBenefitYearBcs.id : null,
        }).then(function (response) {
          $scope.env.showValid = false;
          $scope.env.error = null;

          users.patchUserSecurity(utils.formatDataUserSecurity(participantInfo, $scope.params)).then(function () {
            $state.go('loggedIn.modules.participant');
          }, function (err) {
            $scope.env.error = err.error;
            angular.forEach(err.errors, function (error) {
              if (error.errorCode === ERRORCODES.conflict.email) {
                $scope.env.emailExist = true;

                if (error.errorMessage === "Email cannot be null or empty.") {
                  $scope.env.error = 'Please fill the email';
                } else {
                  $scope.env.error = $translate.instant('server.error.409.email');
                }
              } else if (error.errorCode === ERRORCODES.conflict.username) {
                $scope.env.usernameExist = true;
                $scope.env.error = $translate.instant('server.error.409.username');
              }
            });

          });

        }, function (error) {
          $scope.env.error = error.error;
          if (error.errorCode === ERRORCODES.conflict.email) {
            $scope.env.emailExist = true;
            $scope.env.error = $translate.instant('server.error.409.email');
          }
        });
      }
    };

    /*** Start Tab index ***/
    $scope.tabsets = {
      profile: { tabindex: 1, title: 'Participant Profile', active: true, disabled: false, },
      beniCompAdvantage: { tabindex: 2, title: 'BeniComp Advantage', active: false, disabled: true, },
      beniCompSelect: { tabindex: 3, title: 'BeniComp Select', active: false, disabled: true, },
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
        $scope.tabsets[key].disabled = true;

        // Update products params
        if (!value) {
          $scope.params.products[key] = false;
        }

        if (!!value && !!$scope.params.products[key]) {
          $scope.tabsets[key].disabled = false;
          $scope.env.totalTab++;
        }
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

    // Update tabs
    $scope.$watch('params.products', function () {
      calcTotalTab();
    }, true);
    /*** End Tab index ***/

    /** Start Init client location **/
    function initClientLocation(clientLocation) {
      $scope.env.clientLocationList = security.currentUser.employerLocations;
      $scope.env.products.beniCompAdvantage = !!security.currentUser.products.beniCompAdvantage;
      $scope.env.products.beniCompSelect = !!security.currentUser.products.beniCompSelect;

      $scope.params.clientLocation = null;
      $scope.env.currentClientLocation = null;

      if ($scope.env.clientLocationList[clientLocation] !== undefined) {
        $scope.params.clientLocation = clientLocation;
        $scope.env.currentClientLocation = $scope.env.clientLocationList[clientLocation];
      }

      calcTotalTab();

      // Get Incentive
      getIncentiveByEmployerId(security.currentUser.id);


      // Get BenefitYearBcsList
      getBenefitYearBcsList(security.currentUser.id);
    }

    initClientLocation(participantInfo.clientLocation);

    //cancel
    $scope.cancel = function () {
      $state.go('loggedIn.modules.participant');
    };


    // Spouse 
    $scope.spouseListCallback = function (spouseList) {
      $scope.spouseList = spouseList;
    };

    // Dependent
    $scope.dependentCallback = function (dependentList) {
      $scope.dependentList = dependentList;
    };

    $scope.$watch('dependentList', function () {
      $scope.params.numberOfDependents = $scope.dependentList.length;
    }, true);

    // Clear validation
    $scope.$watch('params', function () {
      $scope.env.emailExist = false;
      $scope.env.passwordExist = false;
      $scope.env.usernameExist = false;
      $scope.env.error = null;
    }, true);
  });
