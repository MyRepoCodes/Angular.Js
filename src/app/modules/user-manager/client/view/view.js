angular.module('app.modules.user-manager.client.view', [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.client.view', {
      url: '/view/:id',
      views: {
        'manager-content@loggedIn.modules.user-manager': {
          templateUrl: 'modules/user-manager/client/view/view.tpl.html',
          controller: 'UserManagerClientViewController',
          resolve: {
            userInfo: function($stateParams, employers) {
              return employers.getEmployerWithIncentive({id: $stateParams.id}).then(function(response) {
                return response;
              }, function() {
                return [];
              });
            }
          }
        }
      }
    });
})

.controller('UserManagerClientViewController', function($scope, $state, $stateParams, $translate, ERRORCODES, INCENTIVE_DEFAULTS, utils, security, employers, users, userInfo, incentives, parseIncentiveBeforePush, incentiveChangeTargetOption) {
  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
    email: false,
    username: false,
    password: false,
    dateStartError: false,
    dateEndError: false,
    dateReStartError: false,
    dateReEndError: false,
    errorMessage: null,
    errorIncentiveList: [],
    files: null,
    editable: false,
    currentIncentive: null,
    confirm: '',
    successMessage: '',
    numberOfLocations: userInfo.employerLocations.length,
    numberOfClasses: _.isArray(userInfo.classesOfEligibleEmployees) ? userInfo.classesOfEligibleEmployees.length : 0,
    // tabset
    products: {
      beniCompAdvantage: true,
      beniCompSelect: false
    },
    currentTab: 1,
    totalTab: 1,
  };

  // Init Model Default
  $scope.incentiveParams = angular.copy(INCENTIVE_DEFAULTS.incentiveParams);

  $scope.originDefaults = {
    userInfo: angular.copy(userInfo),
    incentiveParams: angular.copy($scope.incentiveParams)
  };

  // Init Model
  $scope.incentiveList = [];

  $scope.params = {
    // Profile
    clientName: userInfo.clientName,
    firstName: userInfo.firstName,
    middleName: userInfo.middleName,
    lastName: userInfo.lastName,
    position: userInfo.position,
    phoneNumber: userInfo.phoneNumber,
    email: userInfo.email,
    customerId: userInfo.customerId,
    streetAddress: userInfo.streetAddress,
    addressLine2: userInfo.addressLine2,
    city: userInfo.city,
    postalCode: userInfo.postalCode,
    state: userInfo.state,
    country: userInfo.country,
    clientUrl: userInfo.clientUrl,
    username: userInfo.username,
    password: '',
    clientLogos: userInfo.clientLogos,
    agentId: userInfo.agentId ? userInfo.agentId : undefined,
    employerLocations: userInfo.employerLocations,
    products: userInfo.products,
    // BeniComp Advantage
    enrollmentLevel: userInfo.enrollmentLevel,
    // BeniComp Select
    groupNumber: userInfo.groupNumber,
    federalId: userInfo.federalId,
    effectiveDateOfInsurance: utils.dateServerToLocalTime(userInfo.effectiveDateOfInsurance),
    enrollmentDate: utils.dateServerToLocalTime(userInfo.enrollmentDate),
    totalNumberOfEmployeesEmployed: userInfo.totalNumberOfEmployeesEmployed,
    totalNumberOfEligibleEmployees: userInfo.totalNumberOfEligibleEmployees,
    classesOfEligibleEmployees: userInfo.classesOfEligibleEmployees,
    isThereAnAgent: userInfo.isThereAnAgent,
    agentEmployer: userInfo.agentEmployer,
  };

  /*** Start Tab index ***/
  $scope.tabsets = {
    profile: {tabindex: 1, title: 'Profile', active: true, disabled: false,},
    beniCompAdvantage: {tabindex: 2, title: 'BeniComp Advantage', active: false, disabled: true,},
    beniCompSelect: {tabindex: 3, title: 'BeniComp Select', active: false, disabled: true,},
  };

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
    _.forEach($scope.params.products, function(value, key) {
      $scope.tabsets[key].disabled = true;

      // Update products env
      $scope.env.products[key] = value;

      if (!!value) {
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

  calcTotalTab();
  /*** End Tab index ***/

  // Init params for add new or update benefit year
  function initCurrentParams(currentIncentive) {
    currentIncentive.editable = true;
    currentIncentive.hasError = false;
    $scope.incentiveParams = currentIncentive;
  }

  // Init incentive list
  function initIncentiveList(incentives) {
    $scope.incentiveList = [];
    // Format
    _.forEach(angular.copy(incentives), function(incentive) {
      // Init date picker
      incentive.startDate = utils.dateServerToLocalTime(incentive.startDate);
      incentive.endDate = utils.dateServerToLocalTime(incentive.endDate);
      incentive.registerStartDate = utils.dateServerToLocalTime(incentive.registerStartDate);
      incentive.registerEndDate = utils.dateServerToLocalTime(incentive.registerEndDate);

      $scope.incentiveList.push(incentive);
    });

    // Set current params
    if ($scope.incentiveList.length > 0) {
      $scope.env.currentIncentive = $scope.incentiveList[0];
      $scope.incentiveList.push({});

      initCurrentParams($scope.env.currentIncentive);
    } else {
      $scope.env.currentIncentive = null;
    }
  }

  initIncentiveList(userInfo.incentives);

  // Cancel
  $scope.cancel = function() {
    $state.go('loggedIn.modules.user-manager.client');
  };

  // change Targets Option
  $scope.changeTargetsOption = function(value) {
    incentiveChangeTargetOption($scope.incentiveParams, value);
  };

  $scope.$watch('incentiveParams.startDate', function() {
    $scope.incentiveList = utils.sortIncentiveList($scope.incentiveList);
  });

  // Change Current Incentive
  $scope.changeCurrentIncentive = function(incentive, form) {
    if(utils.isEmptyIncentive(incentive)) {
      incentive = angular.copy($scope.originDefaults.incentiveParams);

      var firstItem = $scope.incentiveList[0];
      if (firstItem && firstItem.hasOwnProperty('startDate')) {
        incentive.startDate = utils.getFirstDayOfYear(firstItem.endDate.getFullYear() + 1);
        incentive.endDate = utils.getLastDayOfYear(firstItem.endDate.getFullYear() + 1);
        incentive.registerStartDate = utils.getFirstDayOfRegister(firstItem.endDate.getFullYear() + 1);
        incentive.registerEndDate = utils.getLastDayOfRegister(firstItem.endDate.getFullYear() + 1);
      }

      $scope.incentiveList[$scope.incentiveList.length - 1] = incentive;

      $scope.env.currentIncentive = $scope.incentiveList[$scope.incentiveList.length - 1];
      $scope.incentiveList.push({});
    } else {
      $scope.env.currentIncentive = incentive;
    }

    utils.resetForm(form);

    initCurrentParams($scope.env.currentIncentive);
  };

  $scope.preview = null;

  if(userInfo.clientLogos.length > 0) {
    employers.getLogoUrlById(userInfo.clientLogos[0]).then(function(response) {
      $scope.preview = response;
    });
  }
});
