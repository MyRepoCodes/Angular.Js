angular.module("app.modules.participant.create", [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.participant.create', {
      url: '/create',
      views: {
        'main-content@loggedIn.modules': {
          templateUrl: 'modules/participant/create/create.tpl.html',
          controller: 'ParticipantCreateController'
        }
      }
    });
})

.controller('ParticipantCreateController', function($scope, $state, $translate, $modal, STATES, CONFIGS, DATECONFIGS, ERRORCODES, utils, security, participants, employers) {
  $scope.templateUrl = CONFIGS.baseURL() + '/participants/import/templatev4';
  $scope.statesList = STATES.list;
  $scope.countries = ['United States'];
  $scope.dateOptions = DATECONFIGS.dateOptions;

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
      beniCompSelect: false,
    },
    currentTab: 1,
    totalTab: 1,
  };

  // Init Model
  $scope.params = {
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: DATECONFIGS.dateStart,
    ssn: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    state: '',
    country: security.currentUser.country ? security.currentUser.country : $scope.countries[0],
    phoneNumber: '',
    email: '',
    beniCompID: '',
    gender: null,
    maritalStatus: null,
    // BeniComp Advantage
    coverageLevel: 0,
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
    benefitYearBcsId: null,
  };

  $scope.$watch('env.currentEmployer', function(employer) {
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
    $scope.env.currentIncentive = null;
    $scope.incentiveParams.plans = {};
    $scope.incentiveParams.planOption = 0;

    employers.getEmployerWithIncentive({id: employerId}).then(function(response) {
      $scope.incentiveList = response.incentives;

      // Change enrollment level
      $scope.env.currentEnrollmentLevel = response.enrollmentLevel;
    });
  }

  // Select incentive
  $scope.selectIncentive = function(incentiveId) {
    $scope.env.currentIncentive = _.findWhere($scope.incentiveList, {id: incentiveId});
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

    employers.getBenefitYearBcs(employerId).then(function(response) {
      $scope.benefitYearBcsList = response;

      // Select current benefitYearBcs
      $scope.selectBenefitYearBcs($scope.params.benefitYearBcsId);
    });
  }

  $scope.selectBenefitYearBcs = function(benefitYearBcsId) {
    $scope.env.currentBenefitYearBcs = _.findWhere($scope.benefitYearBcsList, {id: benefitYearBcsId});
  };
  // End BeniComp Select

  // Create
  $scope.create = function(isValid) {
    $scope.env.showValid = true;
    $scope.env.row = 0;
    if (isValid) {
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
        country: "USA",
        phoneNumber: $scope.params.phoneNumber,
        email: $scope.params.email,
        beniCompID: $scope.params.beniCompID,
        gender: $scope.params.gender,
        employerId: security.isEmployer() ? security.currentUser.id : undefined,
        healthCoachId: security.isHealthCoach() ? security.currentUser.id : undefined,
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
        indexClassesOfEligibleEmployees: $scope.params.indexClassesOfEligibleEmployees,
        benefitYearBcsId: $scope.env.currentBenefitYearBcs ? $scope.env.currentBenefitYearBcs.id : null,
      }).then(function(response) {
        $scope.env.showValid = false;
        $scope.env.error = null;
        $state.go('loggedIn.modules.participant');
      }, function(error) {
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
    profile: {tabindex: 1, title: 'Participant Profile', active: true, disabled: false,},
    beniCompAdvantage: {tabindex: 2, title: 'BeniComp Advantage', active: false, disabled: true,},
    beniCompSelect: {tabindex: 3, title: 'BeniComp Select', active: false, disabled: true,},
  };

  // Set current tabindex
  function setCurrentTabIndex(tabindex) {
    _.forEach($scope.tabsets, function(value) {
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
    _.forEach($scope.env.products, function(value, key) {
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
  $scope.continue = function(isValid) {
    setCurrentTabIndex($scope.env.currentTab + 1);
  };

  // Click on tab
  $scope.selectTab = function(tabindex) {
    setCurrentTabIndex(tabindex);
  };

  // Update tabs
  $scope.$watch('params.products', function() {
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

  initClientLocation();

  // Cancel
  $scope.cancel = function() {
    $state.go('loggedIn.modules.participant');
  };

  // Import file
  $scope.importFiles = function($element) {
    if ($element.files.length > 0) {
      $scope.modal = $modal.open({
        controller: 'UserManagerParticipantUploadConfirmController',
        templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
        size: 'md',
        resolve: {
          files: function() {
            return $element.files;
          },
          type : function() {
            return "";
          }
        }
      });
      $scope.modal.result.then(function(confirm) {
        if (confirm) {
          participants.import($element.files).then(function(data) {
            $element.value = "";
            if (data.conflicts && data.conflicts.length !== 0) {
              var message = "";
              angular.forEach(data.conflicts, function(item, key) {
                message += item + "<br/>";
              });
              $scope.openError(message);

            } else {
              $state.go('loggedIn.modules.participant');
            }
          }, function(error) {
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

  // Clear validation
  $scope.$watch('params', function() {
    $scope.env.emailExist = false;
    $scope.env.error = null;
  }, true);
});
