angular.module('app.modules.user-manager.health-coach-manager', [
  'app.modules.user-manager.health-coach-manager.create',
  'app.modules.user-manager.health-coach-manager.edit',
  'app.modules.user-manager.health-coach-manager.download'
])

.config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.health-coach-manager', {
        url: '/health-coach-manager',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/health-coach-manager/health-coach-manager.tpl.html',
            controller: 'UserManagerHealthCoachManagerController'
          }
        }
      });
  }
)

.controller('UserManagerHealthCoachManagerController', function ($scope, $state, $filter, $modal, $translate, CONFIGS, ngTableParams,security,healthCoachManagers) {
  // Permission
  $scope.isFullControl = function () {
    return true;
  };
  $scope.isAdmin = security.isAdmin();


  $scope.healthCoachManagerList = [];

  // Init model
  $scope.NgTableParams = ngTableParams;

  // Filter here
  $scope.filter = {
    keyword: $scope.infoSortClient ? $scope.infoSortClient.keyword : undefined,
    lastName: undefined,
    firstName: undefined,
    status: "active",
    email: undefined
  };

  // Paging from api
  $scope.loading = true;
  $scope.tableParams = new $scope.NgTableParams({
    page: $scope.infoSortClient ? $scope.infoSortClient.page : 1,   // show first page
    page_return: $scope.infoSortClient ? $scope.infoSortClient.page : null,
    count: $scope.infoSortClient ? $scope.infoSortClient.pageSize : 25,  // count per page
    filter: $scope.filter
  }, {
    //counts: [], // hide page counts control
    //total: 1,  // value less than count hide pagination
    getData: function ($defer, params) {
      function pagination() {
        var sorting = params.sorting();
        if (!Object.keys(sorting).length) {
          if ($scope.infoSortClient && $scope.infoSortClient.sort) {
            if ($scope.infoSortClient.sort[0] === '-') {
              sorting[$scope.infoSortClient.sort.substr(1)] = 'desc';
            } else if ($scope.infoSortClient.sort[0] === '+') {
              sorting[$scope.infoSortClient.sort.substr(1)] = 'asc';
            } else {
              sorting[$scope.infoSortClient.sort] = 'asc';
            }
          }
        }

        var filter = params.filter();
        var tmpPage = $scope.tableParams.$params.page_return;
        if (tmpPage && params.page() === 1) {
          params.page(tmpPage);
        }

        if ($scope.infoSortClient && $scope.infoSortClient.pageSize !== params.count()) {
          resetTable();
          params.page(1);
        }

        var params2 = {
          page: params.page(),
          pageSize: params.count()
        };
        var headers = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: (filter.status === 'active') ? false : true
            }
          ])
        };

        // Sort
        for (var s in sorting) {
          if (sorting[s] === 'asc') {
            params2.sort = s;
          } else if (sorting[s] === 'desc') {
            params2.sort = '-' + s;
          }
          break;
        }

        // Filter
        if (!!filter.keyword) {
          params2.q = 'firstName,lastName=' + filter.keyword;
          params2.keyword = filter.keyword;
        }

        $scope.loading = true;
        healthCoachManagers.get(params2, headers, false).then(function (data) {
          params.total(data.totalCount);
          $scope.loading = false;
          $scope.healthCoachManagerList = data.healthCoachManagerList;
          $defer.resolve($scope.healthCoachManagerList);
        }, function (error) {
          $scope.loading = false;
        });
      }

      params.data = [];
      pagination();
    }
  });

  $scope.$watchCollection('filter.keyword', function (newVal, oldVal) {
    if (!oldVal || newVal && oldVal && newVal !== oldVal) {
      resetTable();
      $scope.resetInfoSortClient();
    }
  });
  $scope.$watchCollection('filter.status', function (newVal, oldVal) {
    if (newVal && oldVal && newVal !== oldVal) {
      resetTable();
      $scope.resetInfoSortClient();
    }
  });

  function resetTable() {
    $scope.tableParams.$params.page_return = 1;
  }

  // Reload current page
  $scope.reload = function () {
    $scope.tableParams.reload();
  };

  // Edit
  $scope.edit = function (healthCoachManager) {
    $state.go('loggedIn.modules.user-manager.health-coach-manager.edit', {id: healthCoachManager.id});
  };

  // permanentlyDelete
  $scope.permanentlyDelete = function (healthCoachManager) {
    // Open Warning
    $scope.modal = $modal.open({
      controller: 'WarningController',
      templateUrl: 'modules/alert/warning.tpl.html',
      size: 'sm',
      resolve: {
        message: function () {
          return 'Are you sure you want to delete this health coach manager?';
        }
      }
    });
    $scope.modal.result.then(function (result) {
      if (result === true) {
        healthCoachManagers.delete(healthCoachManager.id,{screenName:$translate.instant('auditLogs.screenName.editHealthCoachManager')}).then(function () {
          for (var i = 0; i < $scope.healthCoachManagerList.length; i++) {
            if ($scope.healthCoachManagerList[i].id === healthCoachManager.id) {
              $scope.healthCoachManagerList.splice(i, 1);
            }
          }
          $scope.reload();
        }, function (error) {

        });
      }
    });
  };


  // InActive
  $scope.remove = function (healthCoachManager) {
    // Open Warning
    $scope.modal = $modal.open({
      controller: 'WarningController',
      templateUrl: 'modules/alert/warning.tpl.html',
      size: 'sm',
      resolve: {
        message: function () {
          return 'Are you sure you want to delete this health coach manager?';
        }
      }
    });
    $scope.modal.result.then(function (result) {
      if (result === true) {
        healthCoachManagers.remove(healthCoachManager.id,{screenName:$translate.instant('auditLogs.screenName.editHealthCoachManager')}).then(function () {
          for (var i = 0; i < $scope.healthCoachManagerList.length; i++) {
            if ($scope.healthCoachManagerList[i].id === healthCoachManager.id) {
              $scope.healthCoachManagerList.splice(i, 1);
            }
          }
          $scope.reload();
        }, function (error) {

        });
      }
    });
  };

  // Restore
  $scope.restore = function (participant) {
    $scope.modal = $modal.open({
      controller: 'AlertController',
      templateUrl: 'modules/alert/alert.tpl.html',
      size: 'sm',
      resolve: {
        data: function () {
          return {
            title: $translate.instant('alert.waring.heading'),
            summary: false,
            style: 'yesNo',
            message: $translate.instant('userManager.alert.restoreUser')
          };
        }
      }
    });
    $scope.modal.result.then(function (result) {
      if (result === true) {
        healthCoachManagers.restore(participant.id).then(function () {

          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: $translate.instant('userManager.alert.restoreHeadingSuccess'),
                  summary: false,
                  style: 'ok',
                  message: $translate.instant('userManager.alert.restoreSuccess_3', {name: participant.firstName})
                };
              }
            }
          });
          $scope.modal.result.then(function () {
            $scope.reload();
          });
        }, function () {
          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: $translate.instant('userManager.alert.restoreHeadingFail'),
                  summary: false,
                  style: 'ok',
                  message: $translate.instant('userManager.alert.participant.restoreFail_1', {name: participant.firstName})
                };
              }
            }
          });
        });
      }
    });
  };

  // Restore Multiple Users
  $scope.restoreMultipleUsers = function () {
    $scope.modal = $modal.open({
      controller: 'UserManagerSelectUsersController',
      templateUrl: 'modules/user-manager/select-users/select-users.tpl.html',
      size: 'lg',
      resolve: {
        userList: function () {
          return $scope.healthCoachManagerList;
        },
        data: function () {
          return {
            title: $translate.instant('userManager.alert.restoreHeadingSelectUser'),
            button_title: $translate.instant('userManager.alert.restoreButtonSelectUser')
          };
        }
      }
    });
    $scope.modal.result.then(function (userList) {
      if (!!userList) {
        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              var message = $translate.instant('userManager.alert.restoreMultipleUsers', {n: userList.length});
              if (userList.length === 1) {
                message = $translate.instant('userManager.alert.restoreUser_2', {name: userList[0].firstName});
              }
              return {
                title: $translate.instant('alert.waring.heading'),
                summary: false,
                style: 'yesNo',
                message: message
              };
            }
          }
        });
        $scope.modal.result.then(function (ok) {
          var listError = [];
          var totalUser = 0;

          function removeUser(userList) {
            if (!!userList[0]) {
              healthCoachManagers.restore(userList[0].id).then(function () {
                userList.splice(0, 1);
                removeUser(userList);
              }, function () {
                listError.push(userList[0]);

                userList.splice(0, 1);
                removeUser(userList);
              });
            } else {
              $scope.modal = $modal.open({
                controller: 'AlertController',
                templateUrl: 'modules/alert/alert.tpl.html',
                size: 'sm',
                resolve: {
                  data: function () {
                    var message = '';
                    var title = $translate.instant('userManager.alert.restoreHeadingSuccess');
                    if (totalUser === 1) { // Delete 1 user
                      if (listError.length === 0) {
                        message = $translate.instant('userManager.alert.restoreSuccess_1');
                      } else {
                        title = $translate.instant('userManager.alert.restoreHeadingFail');
                        message = $translate.instant('userManager.alert.participant.restoreFail_1', {name: listError[0].firstName});
                      }
                    } else { // Delete n users
                      if (listError.length === 0) {
                        message = $translate.instant('userManager.alert.restoreSuccess_2', {n: totalUser});
                      } else if (listError.length === 1) {
                        if (totalUser === 2) {
                          message = $translate.instant('userManager.alert.participant.restoreSuccess_1', {name: listError[0].firstName});
                        } else {
                          message = $translate.instant('userManager.alert.participant.restoreSuccess_3', {
                            n: totalUser - 1,
                            name: listError[0].firstName
                          });
                        }
                      } else {
                        if (totalUser - listError.length === 0) {
                          title = $translate.instant('userManager.alert.removeHeadingFail');
                          message = $translate.instant('userManager.alert.participant.restoreFail_2', {n: listError.length});
                        } else if (totalUser - listError.length === 1) {
                          message = $translate.instant('userManager.alert.participant.restoreSuccess_2', {n: listError.length});
                        } else {
                          message = $translate.instant('userManager.alert.participant.restoreSuccess_4', {
                            n1: totalUser - listError.length,
                            n2: listError.length
                          });
                        }
                      }
                    }

                    return {
                      title: title,
                      summary: false,
                      style: 'ok',
                      message: message
                    };
                  }
                }
              });
              $scope.modal.result.then(function () {
                if (totalUser !== listError.length) {
                  history.refresh = true;
                  $scope.reload();
                }
              });
            }
          }

          if (ok === true) {
            totalUser = userList.length;
            removeUser(userList);
          }
        });
      }
    });
  };

  // select Status Archive
  $scope.selectStatusArchive = function (data) {
    $scope.filter.status = data;
    $scope.reload();
  };
        //audit logs

    $scope.auditLog = function (userId, userName) {
      $state.go('loggedIn.modules.audit-logs.all-logs', {
        "userId": userId,
        "name": userName
      });
    };

    //Login logs

    $scope.loginLog = function (userId,userName) {
      $state.go('loggedIn.modules.audit-logs.login-logs', {
        "userId": userId,
        "name": userName
      });
    };

  // Listening
  $scope.$on('healthCoachManagers:list:updated', function () {
    // Update
  });
});
