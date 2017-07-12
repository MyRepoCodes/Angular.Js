angular.module('app.modules.user-manager.client', [
    'app.modules.user-manager.client.create',
    'app.modules.user-manager.client.edit',
    'app.modules.user-manager.client.view',
    'app.modules.user-manager.client.download',
    'app.modules.user-manager.client.benefit-year',
    'app.modules.user-manager.client.location-item',
    'app.modules.user-manager.client.classes-of-eligible-employees-item',
  ])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.client', {
        url: '/client',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/client/client.tpl.html',
            controller: 'UserManagerClientController'
          }
        }
      });
  })

  .controller('UserManagerClientController', function ($scope, $state, $translate, $filter, $modal, CONFIGS, ngTableParams, employers,security) {

     $scope.isAdmin = security.isAdmin();
    // Permission
    $scope.isFullControl = function () {
      return true;
    };

    $scope.employerList = [];

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
    var history = {
      employerId: null,
      q: null,
      page: null,
      pageSize: null,
      refresh: false
    };
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: $scope.infoSortClient ? $scope.infoSortClient.page : 1, // show first page
      page_return: $scope.infoSortClient ? $scope.infoSortClient.page : null,
      count: $scope.infoSortClient ? $scope.infoSortClient.pageSize : 25, // count per page
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
            fields: 'id,clientName,firstName,lastName,email,totalParticipant',
            page: params.page(),
            pageSize: params.count()
          };
          var headers = {
            'X-Filter': JSON.stringify([{
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: (filter.status === 'active') ? false : true
            }])
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
            params2.q = 'firstName,lastName,clientName=' + filter.keyword;
            params2.keyword = filter.keyword;
          }

          $scope.loading = true;
          if (!history.refresh && history.q === params2.q && history.page === params2.page && history.pageSize === params2.pageSize && params2.sort === '') {
            $scope.loading = false;
            // use build-in angular sort
            var orderedData = params.sorting() ? $filter('orderBy')($scope.employerList, params.orderBy()) : $scope.employerList;
            $defer.resolve(orderedData);
          } else {
            history.q = params2.q;
            history.page = params2.page;
            history.pageSize = params2.pageSize;
            history.refresh = false;

            employers.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.employerList = data.employerList;
              $defer.resolve($scope.employerList);
            }, function (error) {
              $scope.loading = false;
            });
          }
        }

        params.data = [];
        pagination();
      }
    });

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.reload();
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


    // Edit
    $scope.edit = function (employer) {
      $state.go('loggedIn.modules.user-manager.client.edit', {
        id: employer.id
      });
    };

    // View
    $scope.viewDetail = function (employer) {
      $state.go('loggedIn.modules.user-manager.client.view', {
        id: employer.id
      });
    };

    // permanentlyDelete
    $scope.permanentlyDelete = function (employer) {
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
              message: $translate.instant('userManager.alert.removeUser')
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          employers.delete(employer.id).then(function () {
            for (var i = 0; i < $scope.employerList.length; i++) {
              if ($scope.employerList[i].id === employer.id) {
                $scope.employerList.splice(i, 1);
              }
            }
            $scope.modal = $modal.open({
              controller: 'AlertController',
              templateUrl: 'modules/alert/alert.tpl.html',
              size: 'sm',
              resolve: {
                data: function () {
                  return {
                    title: $translate.instant('userManager.alert.removeHeadingSuccess'),
                    summary: false,
                    style: 'ok',
                    message: $translate.instant('userManager.alert.removeSuccess_3', {
                      name: employer.clientName
                    })
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
                    title: $translate.instant('userManager.alert.removeHeadingFail'),
                    summary: false,
                    style: 'ok',
                    message: $translate.instant('userManager.alert.client.removeFail_1', {
                      name: employer.clientName
                    })
                  };
                }
              }
            });
          });
        }
      });
    };


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

    // InActive
    $scope.remove = function (employer) {
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
              message: $translate.instant('userManager.alert.removeUser')
            };
          }
        }
      });

      $scope.modal.result.then(function (result) {
        if (result === true) {
          employers.remove(employer.id, {
            screenName: $translate.instant('auditLogs.screenName.editClient')
          }).then(function () {
            for (var i = 0; i < $scope.employerList.length; i++) {
              if ($scope.employerList[i].id === employer.id) {
                $scope.employerList.splice(i, 1);
              }
            }
            $scope.modal = $modal.open({
              controller: 'AlertController',
              templateUrl: 'modules/alert/alert.tpl.html',
              size: 'sm',
              resolve: {
                data: function () {
                  return {
                    title: $translate.instant('userManager.alert.removeHeadingSuccess'),
                    summary: false,
                    style: 'ok',
                    message: $translate.instant('userManager.alert.removeSuccess_3', {
                      name: employer.clientName
                    })
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
                    title: $translate.instant('userManager.alert.removeHeadingFail'),
                    summary: false,
                    style: 'ok',
                    message: $translate.instant('userManager.alert.client.removeFail_1', {
                      name: employer.clientName
                    })
                  };
                }
              }
            });
          });
        }
      });
    };

    // InActive Multiple Users
    $scope.removeMultipleUsers = function () {
      $scope.modal = $modal.open({
        controller: 'UserManagerSelectUsersController',
        templateUrl: 'modules/user-manager/select-users/select-users.tpl.html',
        size: 'lg',
        resolve: {
          userList: function () {
            return $scope.employerList;
          },
          data: function () {
            return {
              title: $translate.instant('userManager.alert.deleteHeadingSelectUser'),
              button_title: $translate.instant('userManager.alert.deleteButtonSelectUser')
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
                var message = $translate.instant('userManager.alert.removeMultipleUsers', {
                  n: userList.length
                });
                if (userList.length === 1) {
                  message = $translate.instant('userManager.alert.removeUser_2', {
                    name: userList[0].clientName
                  });
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
                employers.remove(userList[0].id).then(function () {
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
                      var title = $translate.instant('userManager.alert.removeHeadingSuccess');
                      if (totalUser === 1) { // Delete 1 user
                        if (listError.length === 0) {
                          message = $translate.instant('userManager.alert.removeSuccess_1');
                        } else {
                          title = $translate.instant('userManager.alert.removeHeadingFail');
                          message = $translate.instant('userManager.alert.client.removeFail_1', {
                            name: listError[0].clientName
                          });
                        }
                      } else { // Delete n users
                        if (listError.length === 0) {
                          message = $translate.instant('userManager.alert.removeSuccess_2', {
                            n: totalUser
                          });
                        } else if (listError.length === 1) {
                          if (totalUser === 2) {
                            message = $translate.instant('userManager.alert.client.removeSuccess_1', {
                              name: listError[0].clientName
                            });
                          } else {
                            message = $translate.instant('userManager.alert.client.removeSuccess_3', {
                              n: totalUser - 1,
                              name: listError[0].clientName
                            });
                          }
                        } else {
                          if (totalUser - listError.length === 0) {
                            title = $translate.instant('userManager.alert.removeHeadingFail');
                            message = $translate.instant('userManager.alert.client.removeFail_2', {
                              n: listError.length
                            });
                          } else if (totalUser - listError.length === 1) {
                            message = $translate.instant('userManager.alert.client.removeSuccess_2', {
                              n: listError.length
                            });
                          } else {
                            message = $translate.instant('userManager.alert.client.removeSuccess_4', {
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
          employers.restore(participant.id).then(function () {

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
                    message: $translate.instant('userManager.alert.restoreSuccess_3', {
                      name: participant.firstName
                    })
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
                    message: $translate.instant('userManager.alert.participant.restoreFail_1', {
                      name: participant.firstName
                    })
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
            return $scope.employerList;
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
                var message = $translate.instant('userManager.alert.restoreMultipleUsers', {
                  n: userList.length
                });
                if (userList.length === 1) {
                  message = $translate.instant('userManager.alert.restoreUser_2', {
                    name: userList[0].firstName
                  });
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
                employers.restore(userList[0].id).then(function () {
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
                          message = $translate.instant('userManager.alert.participant.restoreFail_1', {
                            name: listError[0].firstName
                          });
                        }
                      } else { // Delete n users
                        if (listError.length === 0) {
                          message = $translate.instant('userManager.alert.restoreSuccess_2', {
                            n: totalUser
                          });
                        } else if (listError.length === 1) {
                          if (totalUser === 2) {
                            message = $translate.instant('userManager.alert.participant.restoreSuccess_1', {
                              name: listError[0].firstName
                            });
                          } else {
                            message = $translate.instant('userManager.alert.participant.restoreSuccess_3', {
                              n: totalUser - 1,
                              name: listError[0].firstName
                            });
                          }
                        } else {
                          if (totalUser - listError.length === 0) {
                            title = $translate.instant('userManager.alert.removeHeadingFail');
                            message = $translate.instant('userManager.alert.participant.restoreFail_2', {
                              n: listError.length
                            });
                          } else if (totalUser - listError.length === 1) {
                            message = $translate.instant('userManager.alert.participant.restoreSuccess_2', {
                              n: listError.length
                            });
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

    $scope.goState = function (state, infoClient) {
      $state.go(state, {
        'idClient': infoClient.id
      });
    };
  });