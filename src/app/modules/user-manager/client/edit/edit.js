angular.module('app.modules.user-manager.client.edit', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.client.edit', {
        url: '/edit/:id',
        views: {
          'manager-content@loggedIn.modules.user-manager': {
            templateUrl: 'modules/user-manager/client/edit/edit.tpl.html',
            controller: 'UserManagerClientEditController',
            resolve: {
              userInfo: function ($stateParams, employers) {
                return employers.getEmployerWithIncentive({ id: $stateParams.id }, { screenName: 'EDIT CLIENT' }).then(function (response) {
                  return response;
                }, function () {
                  return [];
                });
              }
            }
          }
        }
      });
  })

  .controller('UserManagerClientEditController', function ($scope, $state, $stateParams, $translate, $timeout, IMAGECONFIGS, DATECONFIGS, ERRORCODES, REGISTRATION_CLOSE_MESSAGE, utils, security, employers, users, userInfo, incentives, benefityearbcs) {
    $scope.dateOptions = DATECONFIGS.dateOptionsDefault;

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
      files: null,
      confirm: '',
      successMessage: '',
      numberOfLocations: userInfo.employerLocations.length,
      numberOfClasses: _.isArray(userInfo.classesOfEligibleEmployees) ? userInfo.classesOfEligibleEmployees.length : 0,
      //isipAllowed: false,
      // tabset
      products: {
        beniCompAdvantage: true,
        beniCompSelect: false
      },
      currentTab: 1,
      totalTab: 1,
      isHiddenTab: false,
    };

    $scope.originDefaults = {
      userInfo: angular.copy(userInfo),
    };

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
      fee: userInfo.fee ? userInfo.fee : 10,
      password: '',
      clientLogos: userInfo.clientLogos,
      agentId: userInfo.agentId ? userInfo.agentId : undefined,
      employerLocations: userInfo.employerLocations,
      products: userInfo.products,
      registrationClosedMessage: userInfo.registrationClosedMessage ? userInfo.registrationClosedMessage : REGISTRATION_CLOSE_MESSAGE,
      // BeniComp Advantage
      enrollmentLevel: userInfo.enrollmentLevel,
      // BeniComp Select
      groupNumber: userInfo.groupNumber,
      federalId: userInfo.federalId,
      effectiveDateOfInsurance: utils.dateServerToLocalTime(userInfo.effectiveDateOfInsurance),
      //enrollmentDate: utils.dateServerToLocalTime(userInfo.enrollmentDate),
      totalNumberOfEmployeesEmployed: userInfo.totalNumberOfEmployeesEmployed,
      totalNumberOfEligibleEmployees: userInfo.totalNumberOfEligibleEmployees,
      classesOfEligibleEmployees: userInfo.classesOfEligibleEmployees,
      isThereAnAgent: userInfo.isThereAnAgent,
      agentEmployer: userInfo.agentEmployer,
      //isipAllowed: userInfo.isipAllowed,
      screenName: 'EDIT CLIENT'
    };

    /*** Start Tab index ***/
    $scope.tabsets = {
      profile: { tabindex: 1, title: 'Profile', active: true, disabled: false, },
      beniCompAdvantage: { tabindex: 2, title: 'BeniComp Advantage', active: false, disabled: true, },
      beniCompSelect: { tabindex: 3, title: 'BeniComp Select', active: false, disabled: true, },
      report: { tabindex: 4, title: 'Report', active: true, disabled: false },
    };

    function setCurrentTabIndex(tabindex) {
      _.forEach($scope.tabsets, function (value) {
        if (value.tabindex == tabindex) {
          if (!value.disabled) {
            value.active = true;
          } else {
            tabindex = (tabindex >= 4) ? 1 : (tabindex + 1);
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
      _.forEach($scope.params.products, function (value, key) {
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

    function getBcaBYList() {
      employers.getEmployerWithIncentive({ id: $stateParams.id }).then(function (response) {
        var list = [];
        _.forEach(response.incentives, function (item) {
          item.startDate = utils.dateServerToLocalTime(item.startDate);
          item.endDate = utils.dateServerToLocalTime(item.endDate);
          item.registerStartDate = utils.dateServerToLocalTime(item.registerStartDate);
          item.registerEndDate = utils.dateServerToLocalTime(item.registerEndDate);
          list.push(item);
        });
        $scope.bcaBYModel.list.data = list;
        $scope.bcaBYModel.compare.data = angular.copy(list);
      });
    }

    getBcaBYList();

    function updateOrNewBcaBenefitYear(list) {
      if (list[0]) {
        var item = list[0];
        var API;
        if (item.id) {// Update
          API = incentives.put(item);
        } else {// Add New
          item.employerId = $stateParams.id;
          API = incentives.post(item);
        }
        API.then(function () {
          list.splice(0, 1);
          updateOrNewBcaBenefitYear(list);
        }, function () {
          list.splice(0, 1);
          updateOrNewBcaBenefitYear(list);
        });
      } else {
        getBcaBYList();
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

    function getBcsBYList() {
      employers.getBenefitYearBcs($stateParams.id).then(function (response) {
        $scope.bcsBYModel.list.data = response;
        $scope.bcsBYModel.compare.data = angular.copy(response);
      });
    }

    getBcsBYList();

    function updateOrNewBcsBenefitYear(list) {
      if (list[0]) {
        var item = list[0];
        var API;
        if (item.id) {// Update
          API = benefityearbcs.put(item);
        } else {// Add New
          item.employerId = $stateParams.id;
          API = benefityearbcs.post(item);
        }
        API.then(function () {
          list.splice(0, 1);
          updateOrNewBcsBenefitYear(list);
        }, function () {
          list.splice(0, 1);
          updateOrNewBcsBenefitYear(list);
        });
      } else {
        getBcsBYList();
      }
    }
    /*** End Benefit Year BCS ***/

    function updateUserInfo(nameAction) {
      var i, employerLocations = [], classesOfEligibleEmployees = [];

      for (i = 0; i < $scope.env.numberOfLocations; i++) {
        employerLocations.push($scope.params.employerLocations[i]);
      }

      for (i = 0; i < $scope.env.numberOfClasses; i++) {
        classesOfEligibleEmployees.push($scope.params.classesOfEligibleEmployees[i]);
      }

      employers.patch({
        id: $stateParams.id,
        clientName: $scope.params.clientName,
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        fee: $scope.params.fee,
        position: $scope.params.position,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        state: $scope.params.state,
        country: 'USA',
        clientUrl: $scope.params.clientUrl,
        customerId: $scope.params.customerId,
        clientLogos: $scope.params.clientLogos,
        agentId: security.isAgentTheAgent() ? security.currentUser.id : $scope.params.agentId,
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
        //enrollmentDate: utils.dateToShort($scope.params.enrollmentDate),
        totalNumberOfEmployeesEmployed: $scope.params.totalNumberOfEmployeesEmployed,
        totalNumberOfEligibleEmployees: $scope.params.totalNumberOfEligibleEmployees,
        classesOfEligibleEmployees: classesOfEligibleEmployees,
        isThereAnAgent: $scope.params.isThereAnAgent,
        agentEmployer: $scope.params.agentEmployer,
      }, { screenName: $translate.instant('auditLogs.screenName.editClient') }).then(function (response) {
        $scope.env.showValid = false;
        $scope.env.errorMessage = null;

        users.patchUserSecurity(utils.formatDataUserSecurity(userInfo, $scope.params)).then(function () {
          //$scope.goStateList();
          $timeout(function () {
            if (nameAction === 'close') {
              $scope.goStateList();
            } else {
              $scope.env.successMessage = "Update success";
            }


          }, 1000);
        }, function (err) {
          angular.forEach(err.errors, function (error) {
            if (error.errorCode === ERRORCODES.conflict.email) {
              $scope.env.email = true;
              $scope.env.errorMessage = $translate.instant('server.error.409.email');
            } else if (error.errorCode === ERRORCODES.conflict.username) {
              $scope.env.username = true;
              $scope.env.errorMessage = $translate.instant('server.error.409.username');
            }
          });

        });
      }, function (err) {
        angular.forEach(err.errors, function (error) {
          if (error.errorCode === ERRORCODES.conflict.email) {
            $scope.env.email = true;
            $scope.env.errorMessage = $translate.instant('server.error.409.email');
          } else if (error.errorCode === ERRORCODES.conflict.username) {
            $scope.env.username = true;
            $scope.env.errorMessage = $translate.instant('server.error.409.username');
          }
        });
      });
    }

    // Update
    $scope.update = function (isValid, nameAction) {
      $scope.env.showValid = true;

      if (isValid) {
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

        if ($scope.params.products.beniCompAdvantage) {
          var bcaBYModelList = $scope.bcaBYModel.newItem.concat($scope.bcaBYModel.updateItem);
          if (bcaBYModelList.length > 0) {
            updateOrNewBcaBenefitYear(bcaBYModelList);
          }
        }

        if ($scope.params.products.beniCompSelect) {
          var list = $scope.bcsBYModel.newItem.concat($scope.bcsBYModel.updateItem);
          if (list.length > 0) {
            updateOrNewBcsBenefitYear(list);
          }
        }

        updateUserInfo(nameAction);
      }
    };

    // Cancel
    $scope.cancel = function () {
      $state.go('loggedIn.modules.user-manager.client');
    };

    // Resize image before upload
    function resizeImage(files, pos, rs, cb) {
      pos = pos | 0;

      if (!!files[pos]) {
        utils.resizeImage(files[pos], IMAGECONFIGS.logo.maxWidth, IMAGECONFIGS.logo.maxHeight).then(function (file) {
          rs.push(file);
          if (!!files[pos + 1]) {
            resizeImage(files, pos + 1, rs, cb);
          } else {
            cb(rs);
          }
        });
      } else {
        cb([]);
      }
    }

    $scope.preview = null;
    // Upload logo
    $scope.uploadFiles = function ($element) {
      if ($element.files.length > 0) {
        resizeImage($element.files, 0, [], function (files) {
          employers.uploadLogos(files).then(function (response) {
            $scope.params.clientLogos = response;
            if (response.length > 0) {
              employers.getLogoUrlById(response[0]).then(function (response) {
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

    if (userInfo.clientLogos.length > 0) {
      employers.getLogoUrlById(userInfo.clientLogos[0]).then(function (response) {
        $scope.preview = response;
      });
    }

    // Reset Environments
    function resetEnvironments() {
      $scope.env.email = false;
      $scope.env.username = false;
      $scope.env.password = false;

      $scope.env.errorMessage = null;
      $scope.env.successMessage = null;
    }

    $scope.$watch('params', function () {
      resetEnvironments();
    }, true);

    $scope.goToBenefitYear = function () {
      $state.go('loggedIn.modules.user-manager.client.benefit-year', { id: $stateParams.id });
    };
  });
