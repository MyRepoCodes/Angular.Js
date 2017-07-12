angular.module("app.modules.user-manager.participant.create", [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.participant.create', {
        url: '/create',
        views: {
          'manager-content@loggedIn.modules.user-manager': {
            templateUrl: 'modules/user-manager/participant/create/create.tpl.html',
            controller: 'UserManagerParticipantCreateController',
          }
        }
      });
  })

  .controller('UserManagerParticipantCreateController', function ($scope, $state, $modal, $translate, STATES, CONFIGS, ERRORCODES, BENICOMPSELECT, utils, users, security, participants, employers) {
    $scope.templateUrl = CONFIGS.baseURL() + '/participants/import/template';
    $scope.statesList = STATES.list;
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
      currentEnrollmentLevel: 0,
      currentIncentive: null,
      currentBenefitYearBcs: null,
      // tabset
      products: {
        beniCompAdvantage: true,
        beniCompSelect: false
      },
      currentTab: 1,
      totalTab: 1,
    };

    // Init Model
    $scope.params = {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: null,
      ssn: '',
      streetAddress: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      state: '',
      country: security.currentUser.country ? security.currentUser.country : $scope.countries[0],
      phoneNumber: '',
      employerId: undefined,

      customerId: "",
      coverageLevel: 0,
      status: 0,
      diagnoseType: 0,
      diabetesTreatType: 0,
      prescribedMedicationForHypertension: false,
      recommendationForHighChrolesterol: 0,
      lastPhysicalExamOrCheckup: 0,
      visitHealthcareProviderRoutinely: false,
      edicalCarePlace: 0,
      overallPhysicalHealth: 0,
      healthCoachId: "",
      gender: null,
      email: "",
      maritalStatus: null,
      numberOfDependents: 0,
      // BeniComp Advantage
      clientLocation: null,
      products: {
        beniCompAdvantage: false,
        beniCompSelect: false,
      },
      incentiveAssignId: null,
      // BeniComp Select
      groupNumber: '',
      effectiveDate: null,
      employmentDate: null,
      indexClassesOfEligibleEmployees: null,
      annualClassesOfEligibleEmployees: null,
      benefitYearBcsId: null,

      primaryBeneficiaryForAdd: null,
      primaryBeneficiaryRelationship: null,
      contingentBeneficiaryForAdd: null,
      contingentBeneficiaryRelationship: null,
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

    // Create
    function createNewPar() {
      participants.post({
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
        phoneNumber: $scope.params.phoneNumber,
        email: $scope.params.email,
        customerId: $scope.params.customerId,
        gender: $scope.params.gender,
        employerId: $scope.params.employerId,
        healthCoachId: security.isHealthCoach() ? security.currentUser.id : null,
        country: "USA",
        status: 0,
        diagnoseType: 0,
        diabetesTreatType: 0,
        prescribedMedicationForHypertension: false,
        recommendationForHighChrolesterol: 0,
        lastPhysicalExamOrCheckup: 0,
        visitHealthcareProviderRoutinely: false,
        edicalCarePlace: 0,
        overallPhysicalHealth: 0,
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

      },{screenName:$translate.instant('auditLogs.screenName.addParticipant')}).then(function (response) {
        $scope.env.showValid = false;
        $scope.env.error = null;
        $scope.goStateList();
        /*$state.go('loggedIn.modules.user-manager.participant');*/
      }, function (err) {
        if (_.isArray(err.errors)) {
          _.forEach(err.errors, function (error) {
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
        }
      });
    }

    $scope.create = function (form) {
      $scope.env.showValid = true;
      $scope.env.row = 0;
      if (form.$valid) {
        if ($scope.params.email) {
          users.checkEmailExist({ 'email': $scope.params.email })
            .then(function (response) {
              $scope.env.emailExist = response;

              if (!response) { //next step
                createNewPar();
              }

            });
        } else {

          createNewPar();
        }


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
    $scope.continue = function (form) {
      if (form.$valid) {
        setCurrentTabIndex($scope.env.currentTab + 1);
      }

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

    // Cancel
    $scope.cancel = function () {
      $state.go('loggedIn.modules.user-manager.participant');
    };

    // Import file
    $scope.importFiles = function ($element) {
      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'UserManagerParticipantUploadConfirmController',
          templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            },
            type: function () {
              return "";
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {
            participants.import($element.files).then(function () {
              $element.value = "";
              $state.go('loggedIn.modules.user-manager.participant');
            }, function (error) {
              var message = error.errors[0].errorMessage;
              $scope.openError(message);
              $element.value = "";
            });
          } else {
            $element.value = "";
          }
        });
      } else {
        $element.value = "";
      }
    };

    /** Start Init client location **/
    function initClientLocation(employerId, clientLocation) {

      $scope.params.employerId = employerId;

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

    // Change employer
    $scope.changeEmployer = function (employerId) {

      initClientLocation(employerId);
    };

    // get default value for annualClassesOfEligibleEmployees
    $scope.$watchCollection('params.indexClassesOfEligibleEmployees', function (newVal, oldVal) {
      if (newVal || newVal === 0) {
        $scope.params.annualClassesOfEligibleEmployees = $scope.env.currentEmployer.classesOfEligibleEmployees[newVal].currency;
      }

    }, true);

    $scope.$watch('params.clientLocation', function (clientLocation) {
      initClientLocation($scope.params.employerId, clientLocation);
    });
    /** End Init client location **/

    // Clear validation
    $scope.$watch('params', function () {
      $scope.env.emailExist = false;
      $scope.env.error = null;
    }, true);

    //START: For Auto-complete
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
        fields: 'id,clientName,firstName,lastName,employerLocations,products,groupNumber,effectiveDateOfInsurance,enrollmentDate,annualMaximum,classesOfEligibleEmployees',
        q: 'clientName=' + keyword
      };

      return employers.getAutoComplete(params, headers, true)
        .then(function (data) {
          $scope.employerList = data.employerList;

          return data.employerList;
        });
    };
    //END: For Auto-complete

  });
