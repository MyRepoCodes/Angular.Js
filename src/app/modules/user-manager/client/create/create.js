angular.module('app.modules.user-manager.client.create', [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.client.create', {
      url: '/create',
      views: {
        'manager-content@loggedIn.modules.user-manager': {
          templateUrl: 'modules/user-manager/client/create/create.tpl.html',
          controller: 'UserManagerClientCreateController'
        }
      }
    });
})

.controller('UserManagerClientCreateController', function($scope, $state, $translate, IMAGECONFIGS, DATECONFIGS, ERRORCODES, utils, security, STATES, employers, incentives, benefityearbcs) {
  $scope.dateOptions = DATECONFIGS.dateOptionsDefault;
  $scope.isAdmin = security.isAdmin();

  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
    email: false,
    username: false,
    password: false,
    errorMessage: null,
    files: null,
    numberOfLocations: 0,
    numberOfClasses: 0,
    isipAllowed: false,
    // tabset
    products: {
      beniCompAdvantage: true,
      beniCompSelect: false
    },
    currentTab: 1,
    totalTab: 1,
  };

  // Init Model
  $scope.incentiveList = [];
  $scope.addBenefitLabel = 'Add Benefit Year';

  $scope.params = {
    clientName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    position: '',
    phoneNumber: '',
    email: '',
    customerId: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    state: '',
    country: security.currentUser.country ? security.currentUser.country : $scope.countries[0],
    clientUrl: '',
    username: '',
    password: '',
    fee: 10,
    clientLogos: [],
    employerLocations: [],
    isipAllowed: false,
    products: {
      beniCompAdvantage: false,
      beniCompSelect: false
    },
    registrationClosedMessage: '',
    // BeniComp Advantage
    enrollmentLevel: 0,
    // BeniComp Select
    groupNumber: '',
    federalId: '',
    effectiveDateOfInsurance: undefined,
    enrollmentDate: undefined,
    totalNumberOfEmployeesEmployed: undefined,
    totalNumberOfEligibleEmployees: undefined,
    classesOfEligibleEmployees: [],
    isThereAnAgent: 0,
    agentEmployer: {
      clientName: '',
      firstName: '',
      middleName: '',
      stateLicenseNumber: '',
      phoneNumber: '',
      nameOfFirm: '',
      streetAddress: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
      taxpayerIdNumber: '',
      emailAddress: '',
    }
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

  /*** Start Benefit Year BCA ***/
  $scope.bcaBYModel = {
    list: {
      data: [],
    },
    compare: {
      data: [],
    },
    newItem: [],
    updateItem: [],
    errorList: [],
  };

  function createBcaBenefitYear(list, employerId) {
    if (list[0]) {
      var item = list[0];
      item.employerId = employerId;
      incentives.post(item).then(function() {
        list.splice(0, 1);
        createBcaBenefitYear(list, employerId);
      }, function() {
        list.splice(0, 1);
        createBcaBenefitYear(list, employerId);
      });
    }
  }
  /*** End Benefit Year BCA ***/

  /*** Start Benefit Year BCS ***/
  $scope.bcsBYModel = {
    list: {
      data: [],
    },
    compare: {
      data: [],
    },
    newItem: [],
    updateItem: [],
    errorList: [],
  };

  function createBcsBenefitYear(list, employerId) {
    if (list[0]) {
      var item = list[0];
      item.employerId = employerId;
      benefityearbcs.post(item).then(function() {
        list.splice(0, 1);
        createBcsBenefitYear(list, employerId);
      }, function() {
        list.splice(0, 1);
        createBcsBenefitYear(list, employerId);
      });
    }
  }
  /*** End Benefit Year BCS ***/

  // Create
  $scope.create = function(isValid) {
    $scope.env.showValid = true;

    if(isValid) {
      // BeniComp Advantage Benefit Year
      if ($scope.params.products.beniCompAdvantage) {
        if ($scope.bcaBYModel.errorList.length > 0) {
          return false;
        }
      }

      // BeniComp Select Benefit Year
      if ($scope.params.products.beniCompSelect) {
        if ($scope.bcsBYModel.errorList.length > 0) {
          return false;
        }
      }

      var i, employerLocations = [], classesOfEligibleEmployees = [];

      for (i = 0; i < $scope.env.numberOfLocations; i++) {
        employerLocations.push($scope.params.employerLocations[i]);
      }

      for (i = 0; i < $scope.env.numberOfClasses; i++) {
        classesOfEligibleEmployees.push($scope.params.classesOfEligibleEmployees[i]);
      }

      employers.post({
        clientName: $scope.params.clientName,
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        position: $scope.params.position,
        phoneNumber: $scope.params.phoneNumber,
        email: $scope.params.email,
        customerId: $scope.params.customerId,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        state: $scope.params.state,
        //country: $scope.params.country,
        country: 'USA',
        clientUrl: $scope.params.clientUrl,
        username: $scope.params.username,
        password: $scope.params.password,
        fee: $scope.params.fee,
        clientLogos: $scope.params.clientLogos,
        agentId: security.isAgentTheAgent() ? security.currentUser.id : undefined,
        employerLocations: employerLocations,
        products: $scope.params.products,
        //isipAllowed: $scope.params.isipAllowed,
        registrationClosedMessage: $scope.params.registrationClosedMessage,
        // BeniComp Advantage
        enrollmentLevel: $scope.params.enrollmentLevel,
        // BeniComp Select
        groupNumber: $scope.params.groupNumber,
        federalId: $scope.params.federalId,
        effectiveDateOfInsurance: utils.dateToShort($scope.params.effectiveDateOfInsurance),
        enrollmentDate: utils.dateToShort($scope.params.enrollmentDate),
        totalNumberOfEmployeesEmployed: $scope.params.totalNumberOfEmployeesEmployed,
        totalNumberOfEligibleEmployees: $scope.params.totalNumberOfEligibleEmployees,
        classesOfEligibleEmployees: classesOfEligibleEmployees,
        isThereAnAgent: $scope.params.isThereAnAgent,
        agentEmployer: $scope.params.agentEmployer,
      },{screenName:$translate.instant('auditLogs.screenName.addClient')}).then(function(response) {
        $scope.env.showValid = false;
        $scope.env.errorMessage = null;

        if ($scope.params.products.beniCompAdvantage) {
          createBcaBenefitYear($scope.bcaBYModel.newItem, response.id);
        }

        if ($scope.params.products.beniCompSelect) {
          createBcsBenefitYear($scope.bcsBYModel.newItem, response.id);
        }

        $state.go('loggedIn.modules.user-manager.client');
      }, function(err) {
        angular.forEach(err.errors, function(error) {
          if(error.errorCode === ERRORCODES.conflict.email) {
            $scope.env.email = true;
            $scope.env.errorMessage = $translate.instant('server.error.409.email');
          } else if(error.errorCode === ERRORCODES.conflict.username) {
            $scope.env.username = true;
            $scope.env.errorMessage = $translate.instant('server.error.409.username');
          }
        });

        //show error of API
        if(!$scope.env.errorMessage) {
          $scope.env.errorMessage = '';
          angular.forEach(err.errors, function(error) {
            $scope.env.errorMessage += error.errorMessage;
          });
        }
      });
    }
  };

  // Cancel
  $scope.cancel = function() {
    $state.go('loggedIn.modules.user-manager.client');
  };

  // Resize image before upload
  function resizeImage(files, pos, rs, cb) {
    pos = pos | 0;

    if(!!files[pos]) {
      utils.resizeImage(files[pos], IMAGECONFIGS.logo.maxWidth, IMAGECONFIGS.logo.maxHeight).then(function(file) {
        rs.push(file);
        if(!!files[pos + 1]) {
          resizeImage(files, pos + 1, rs, cb);
        } else {
          cb(rs);
        }
      });
    } else {
      cb([]);
    }
  }

  // Upload logo
  $scope.uploadFiles = function($element) {
    if($element.files.length > 0) {
      resizeImage($element.files, 0, [], function(files) {
        employers.uploadLogos(files).then(function(response) {
          $scope.params.clientLogos = response;
          if(response.length > 0) {
            employers.getLogoUrlById(response[0]).then(function(response) {
              $scope.preview = response;
            });
          }
        });
      });
    } else {
      //$scope.params.clientLogos = [];
      //$scope.preview = null;
    }
  };

  // Reset Environments
  function resetEnvironments() {
    $scope.env.email = false;
    $scope.env.username = false;
    $scope.env.password = false;

    $scope.env.errorMessage = null;
  }

  $scope.$watch('params', function() {
    resetEnvironments();
  }, true);
});
