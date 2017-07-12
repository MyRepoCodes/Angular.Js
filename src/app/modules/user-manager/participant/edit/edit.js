angular.module('app.modules.user-manager.participant.edit', [])

  .config(function ($stateProvider) {
    var resolve = {
      participantInfo: function ($stateParams, participants) {
        return participants.find($stateParams.id,{screenName:'Edit Participant'}).then(function (response) {
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
      .state('loggedIn.modules.user-manager.participant.edit', {
        url: '/edit/:id',
        views: {
          'manager-content@loggedIn.modules.user-manager': {
            templateUrl: 'modules/user-manager/participant/edit/edit.tpl.html',
            controller: 'UserManagerParticipantEditController',
            resolve: resolve,
          }
        }
      })
      .state('loggedIn.modules.user-manager.participant.editHasClient', {
        url: '/edit/client/:idClient/participant/:id',
        views: {
          'manager-content@loggedIn.modules.user-manager': {
            templateUrl: 'modules/user-manager/participant/edit/edit.tpl.html',
            controller: 'UserManagerParticipantEditController',
            resolve: resolve,
          }
        }
      });
  })

  .controller('UserManagerParticipantEditController', function ($scope, $state, $stateParams, $translate, $modal, ERRORCODES, BENICOMPSELECT, utils, security, participants, spouseList, employers, users, participantInfo, dependentList) {
    $scope.participantInfo = angular.copy(participantInfo);

    $scope.spouseList = (spouseList.data.length > 0) ? [spouseList.data[0]] : []; //Get one spouse active
    $scope.dependentList = dependentList.data;
    $scope.employerList = [];
    $scope.benicompSelectConstant = BENICOMPSELECT;

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      emailExist: false,
      passwordExist: false,
      usernameExist: false,
      customerIdExist: false,
      error: null,
      confirm: '',
      currentEmployer: null,
      currentClientLocation: null,
      clientLocationList: [],
      successMessage: null,
      currentEnrollmentLevel: 0,
      currentIncentive: null,
      currentBenefitYearBcs: null,
      commonMesError: null,
      // tabset
      products: {
        beniCompAdvantage: true,
        beniCompSelect: true,
      },
      currentTab: 1,
      totalTab: 1,
    };

    $scope.idClient = $state.params.idClient;

    // Init Model
    $scope.params = {
      firstName: participantInfo.firstName,
      lastName: participantInfo.lastName,
      middleName: participantInfo.middleName,
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
      customerId: participantInfo.customerId,
      participantId2: participantInfo.participantId2,
      gender: participantInfo.gender,
      username: participantInfo.username,
      password: '',
      employerId: participantInfo.employerId,
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
      annualClassesOfEligibleEmployees: participantInfo.annualClassesOfEligibleEmployees,
      benefitYearBcsId: participantInfo.benefitYearBcsId,

      primaryBeneficiaryForAdd: participantInfo.primaryBeneficiaryForAdd,
      primaryBeneficiaryRelationship: participantInfo.primaryBeneficiaryRelationship,
      contingentBeneficiaryForAdd: participantInfo.contingentBeneficiaryForAdd,
      contingentBeneficiaryRelationship: participantInfo.contingentBeneficiaryRelationship,
      screenName: 'EDIT_PARTICIPANT'

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

    // get default value for annualClassesOfEligibleEmployees
    $scope.$watchCollection('params.indexClassesOfEligibleEmployees', function (newVal, oldVal) {

      if (newVal !== oldVal) {
        if (newVal !== participantInfo.indexClassesOfEligibleEmployees) {
          $scope.params.annualClassesOfEligibleEmployees = $scope.env.currentEmployer.classesOfEligibleEmployees[newVal].currency;
        } else {
          $scope.params.annualClassesOfEligibleEmployees = participantInfo.annualClassesOfEligibleEmployees;
        }
      }

    }, true);

    $scope.isEmployerId = !!participantInfo.employerId;

    // BeniComp Advantage
    $scope.incentiveList = [];
    $scope.incentiveParams = {
      plans: {},
      planOption: 0,
    };


    function getIncentiveByEmployerId(employerId) {
      if (!employerId) {
        return;
      }

      employers.getEmployerWithIncentive({ id: employerId }).then(function (response) {
        $scope.incentiveList = response.incentives;

        // Change enrollment level
        $scope.env.currentEnrollmentLevel = response.enrollmentLevel;

        //update current Employer
        $scope.env.currentEmployer = response;

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
    $scope.update = function (isValid, nameAction) {
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
          country: "USA",
          //country: $scope.params.country,
          //phoneNumber: $scope.params.phoneNumber,
          //email: $scope.params.email,
          gender: $scope.params.gender,
          //password: !!$scope.params.password ? $scope.params.password : undefined,
          customerId: $scope.params.customerId,
          participantId2: $scope.params.participantId2,
          employerId: security.isEmployer() ? security.currentUser.id : $scope.params.employerId,
          healthCoachId: security.isHealthCoach() ? security.currentUser.id : $scope.params.healthCoachId,
          coverageLevel: $scope.params.coverageLevel, // Change "Coverage Level" to "Enrollment Level"
          clientLocation: $scope.params.clientLocation,
          products: {
            beniCompAdvantage: $scope.env.products.beniCompAdvantage ? $scope.params.products.beniCompAdvantage : false,
            beniCompSelect: $scope.env.products.beniCompSelect ? $scope.params.products.beniCompSelect : false,
          },
          incentiveAssignId: $scope.env.currentIncentive ? $scope.env.currentIncentive.id : null,
          // BeniComp Select
          effectiveDate: utils.dateToShort($scope.params.effectiveDate),
          employmentDate: utils.dateToShort($scope.params.employmentDate),
          maritalStatus: $scope.params.maritalStatus,
          numberOfDependents: $scope.params.numberOfDependents,
          indexClassesOfEligibleEmployees: $scope.params.indexClassesOfEligibleEmployees,
          annualClassesOfEligibleEmployees: parseInt($scope.params.annualClassesOfEligibleEmployees),
          benefitYearBcsId: $scope.env.currentBenefitYearBcs ? $scope.env.currentBenefitYearBcs.id : null,

          primaryBeneficiaryForAdd: $scope.params.primaryBeneficiaryForAdd,
          primaryBeneficiaryRelationship: $scope.params.primaryBeneficiaryRelationship,
          contingentBeneficiaryForAdd: $scope.params.contingentBeneficiaryForAdd,
          contingentBeneficiaryRelationship: $scope.params.contingentBeneficiaryRelationship,
        },{screenName:$translate.instant('auditLogs.screenName.editParticipant')}).then(function (response) {
          $scope.env.showValid = false;
          $scope.env.error = null;

          users.patchUserSecurity(utils.formatDataUserSecurity(participantInfo, $scope.params))
            .then(function () {

              if (nameAction === 'close') {
                if (security.isClientManager() || security.isAdmin() && $scope.idClient) {
                  $state.go('loggedIn.modules.user-manager.participantClient', { 'idClient': $scope.idClient }, { reload: true });
                } else {
                  $state.go('loggedIn.modules.user-manager.participant');
                  //$scope.goStateList();
                }
              } else {
                $scope.env.successMessage = "Update success";
              }

            }, function (err) {
              if (_.isArray(err.errors)) {
                _.forEach(err.errors, function (error) {
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
                  } else if (error.errorCode === ERRORCODES.conflict.password) {
                    $scope.env.passwordExist = true;
                    $scope.env.error = $translate.instant('server.error.409.password');
                  } else if (error.errorCode === ERRORCODES.conflict.customerId) {
                    $scope.env.customerIdExist = true;
                    $scope.env.error = $translate.instant('server.error.409.customerId');
                  }
                });
              }
            });

          //$scope.goStateList();
          /* $state.go('loggedIn.modules.user-manager.participant');*/
        }, function (err) {
          angular.forEach(err.errors, function (error) {
            if (error.errorCode === ERRORCODES.conflict.email) {
              $scope.env.emailExist = true;
              $scope.env.error = $translate.instant('server.error.409.email');
            } else if (error.errorCode === ERRORCODES.conflict.username) {
              $scope.env.usernameExist = true;
              $scope.env.error = $translate.instant('server.error.409.username');
            } else if (error.errorCode === ERRORCODES.conflict.password) {
              $scope.env.passwordExist = true;
              $scope.env.error = $translate.instant('server.error.409.password');
            } else if (error.errorCode === ERRORCODES.conflict.customerId) {
              $scope.env.customerIdExist = true;
              $scope.env.error = $translate.instant('server.error.409.customerId');
            }
          });


        });
      }
    };

    /*** Start Tab index ***/
    $scope.tabsets = {
      profile: { tabindex: 1, title: 'Participant Profile', active: true, disabled: false, },
      beniCompAdvantage: { tabindex: 2, title: 'BeniComp Advantage', active: false, disabled: true, },
      beniCompSelect: { tabindex: 3, title: 'BeniComp Select', active: false, disabled: true, },
    };

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
        if (!value && $scope.env.currentEmployer) {
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

    //cancel
    $scope.cancel = function () {
      if (security.isClientManager() || security.isAdmin() && $scope.idClient) {
        $state.go('loggedIn.modules.user-manager.participantClient', { 'idClient': $scope.idClient });
      } else {
        $state.go('loggedIn.modules.user-manager.participant');
      }

    };

    //cancel edit
    $scope.cancelEdit = function () {
      if (security.isClientManager() || security.isAdmin() && $scope.idClient) {
        $state.go('loggedIn.modules.user-manager.participantClient', { 'idClient': $scope.idClient });
      } else {
        //$scope.goStateList();
        $state.go('loggedIn.modules.user-manager.participant');
      }

    };

    /** Start Init client location **/
    function initClientLocation(employerId, clientLocation) {
      $scope.env.currentEmployer = _.findWhere($scope.employerList, { id: employerId });
      if ($scope.env.currentEmployer) {
        $scope.env.clientLocationList = $scope.env.currentEmployer.employerLocations;

        $scope.env.products.beniCompAdvantage = !!$scope.env.currentEmployer.products.beniCompAdvantage;
        $scope.env.products.beniCompSelect = !!$scope.env.currentEmployer.products.beniCompSelect;
      } else {
        $scope.env.clientLocationList = [];

        $scope.env.products.beniCompAdvantage = false;
        $scope.env.products.beniCompSelect = false;
      }

      $scope.params.clientLocation = null;
      $scope.env.currentClientLocation = null;

      if ($scope.env.clientLocationList[clientLocation] !== undefined) {
        $scope.params.clientLocation = clientLocation;
        $scope.env.currentClientLocation = $scope.env.clientLocationList[clientLocation];
      }

      calcTotalTab();

      // Get Incentive
      getIncentiveByEmployerId(employerId);

      // Get BenefitYearBcsList
      getBenefitYearBcsList(employerId);
    }

    initClientLocation(participantInfo.employerId, participantInfo.clientLocation);

    // Change employer
    $scope.changeEmployer = function (employerId) {
      if (employerId === participantInfo.employerId) {
        initClientLocation(employerId, participantInfo.clientLocation);
      } else {
        initClientLocation(employerId);
      }
    };

    $scope.$watch('params.clientLocation', function (clientLocation) {
      initClientLocation($scope.params.employerId, clientLocation);
    });
    /** End Init client location **/

    $scope.spouseListCallback = function (spouseList) {
      $scope.spouseList = spouseList;
    };

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
      $scope.env.customerIdExist = false;
      $scope.env.error = null;
      $scope.env.successMessage = null;
    }, true);

    //START: For Auto-complete
    function findInfoClient(id) {
      employers.find(id)
        .then(function (result) {
          $scope.employerList.push(result);
          $scope.paramsAutoComplete.employer = result;
          $scope.changeEmployer(result.id);
        });
    }


    $scope.paramsAutoComplete = {
      employer: null
    };
    $scope.$watch('paramsAutoComplete.employer', function (value) {
      if (!value || !value.id) {
        $scope.employerList = [];
        $scope.changeEmployer(0);
      }
    });

    $scope.findClient = function (keyword) {
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

      var params = {
        fields: 'id,clientName,firstName,lastName,employerLocations,products,groupNumber,effectiveDateOfInsurance,enrollmentDate,annualMaximum',
        q: 'clientName=' + keyword
      };

      return employers.get(params, headers, true)
        .then(function (data) {
          $scope.employerList = data.employerList;
          return data.employerList;
        });
    };
    //END: For Auto-complete


    function init() {
      if (participantInfo.employerId) {
        findInfoClient(participantInfo.employerId);
      }

    }

    init();
  });
