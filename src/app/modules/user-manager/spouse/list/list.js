angular.module("app.modules.user-manager.spouse-list", [
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.spouse-list', {
        url: '/spouse-list',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/spouse/list/list.tpl.html',
            controller: 'UserManagerSpouseController'
          }
        }
      })

      .state('loggedIn.modules.user-manager.spouseClient', {
        url: '/client/:idClient/spouse/all/',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/spouse/list/list.tpl.html',
            controller: 'UserManagerSpouseController'
          }
        }
      })

      .state('loggedIn.modules.user-manager.participant-spouse-list', {
        url: '/participant/:participantId/spouse-all',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/spouse/list/list.tpl.html',
            controller: 'UserManagerSpouseController'
          }
        }
      });
  }
  )

  .controller('UserManagerSpouseController',
  function ($scope, $state, security, $translate, $filter, $modal, CONFIGS, ngTableParams, participants, employers, spouses) {
    //int env
    $scope.isClickButtonClearFilter = false;
    $scope.employerList = [];
    $scope.listUsers = [];
    $scope.idClient = $state.params.idClient ? $state.params.idClient : null;

    $scope.env = {
      isOpenSelectClient: false
    };


    //Check have ParticipantID
    $scope.idParticipant = null;
    if ($state.params.participantId) {
      $scope.idParticipant = $state.params.participantId;
    }

    // Permission
    $scope.isFullControl = function () {
      if (security.isAdmin() || security.isClientManager() || security.isAgentTheAgent() || security.isHealthCoachManager()) {
        return true;
      } else {
        return false;
      }
    };


    // Init model
    $scope.NgTableParams = ngTableParams;

    // Filter here
    $scope.filter = {
      keyword: undefined,
      lastName: undefined,
      firstName: undefined,
      clientName: undefined,
      username: undefined,
      email: undefined,
      active: true,
      incentiveSelected: null,
      userType: 'spouse',
      employerId: $scope.idClient
    };

    // Paging from api
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: $scope.infoSortClient ? $scope.infoSortClient.page : 1,   // show first page
      page_return: $scope.infoSortClient ? $scope.infoSortClient.page : null,
      count: ($scope.infoSortClient && $scope.infoSortClient.pageSize) ? $scope.infoSortClient.pageSize : 10,  // count per page
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
                  value: !filter.active
                }
              ])
            };

            // incentive
            if (!!filter.incentiveSelected) {
              params2.incentiveId = filter.incentiveSelected.id;
            }

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
              params2.q = 'firstName,lastName, email=' + filter.keyword;
              params2.keyword = filter.keyword;
            }

            $scope.loading = true;

            if ($scope.idParticipant) { //Filter follow Participant
              params2['id_participant'] = $scope.idParticipant;

              participants.getListSpouse(params2, headers, false).then(function (data) {
                params.total(data.totalCount);
                $scope.loading = false;
                $scope.listUsers = data.data;
                $defer.resolve($scope.listUsers);
              }, function (error) {
                $scope.loading = false;
              });

            } else if (filter.employerId) { //Filter follow client

              employers.getSpouse(filter.employerId, params2, headers, false).then(function (data) {
                params.total(data.totalCount);
                $scope.loading = false;
                $scope.listUsers = data.data;
                $defer.resolve($scope.listUsers);
              }, function (error) {
                $scope.loading = false;
              });

            } else {
              spouses.get(params2, headers, false).then(function (data) {
                params.total(data.totalCount);
                $scope.loading = false;
                $scope.listUsers = data.data;
                $defer.resolve($scope.listUsers);
              }, function (error) {
                $scope.loading = false;
              });
            }


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

    $scope.changeCurrentIncentive = function (data) {

      $scope.filter.incentiveSelected = data;
    };

    function resetTable() {
      $scope.tableParams.$params.page_return = 1;
    }

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.reload();
    };

    // Edit
    $scope.edit = function (item) {
      $state.go('loggedIn.modules.user-manager.spouses.edit', { id: item.id });
    };

    // InActive
    $scope.remove = function (admin) {
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
          spouses.remove(admin.id).then(function () {
            for (var i = 0; i < $scope.listUsers.length; i++) {
              if ($scope.listUsers[i].id === admin.id) {
                $scope.listUsers.splice(i, 1);
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
                    message: $translate.instant('userManager.alert.removeSuccess_3', { name: admin.firstName })
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
                    message: $translate.instant('userManager.alert.admin.removeFail_1', { name: admin.firstName })
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
            return $scope.listUsers;
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
                var message = $translate.instant('userManager.alert.removeMultipleUsers', { n: userList.length });
                if (userList.length === 1) {
                  message = $translate.instant('userManager.alert.removeUser_2', { name: userList[0].firstName });
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
                spouses.remove(userList[0].id).then(function () {
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
                          message = $translate.instant('userManager.alert.admin.removeFail_1', { name: listError[0].firstName });
                        }
                      } else { // Delete n users
                        if (listError.length === 0) {
                          message = $translate.instant('userManager.alert.removeSuccess_2', { n: totalUser });
                        } else if (listError.length === 1) {
                          if (totalUser === 2) {
                            message = $translate.instant('userManager.alert.admin.removeSuccess_1', { name: listError[0].firstName });
                          } else {
                            message = $translate.instant('userManager.alert.admin.removeSuccess_3', {
                              n: totalUser - 1,
                              name: listError[0].firstName
                            });
                          }
                        } else {
                          if (totalUser - listError.length === 0) {
                            title = $translate.instant('userManager.alert.removeHeadingFail');
                            message = $translate.instant('userManager.alert.admin.removeFail_2', { n: listError.length });
                          } else if (totalUser - listError.length === 1) {
                            message = $translate.instant('userManager.alert.admin.removeSuccess_2', { n: listError.length });
                          } else {
                            message = $translate.instant('userManager.alert.admin.removeSuccess_4', {
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

    // Delete
    $scope.permanentlyDelete = function (admin) {
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
          spouses.delete(admin.id).then(function () {
            for (var i = 0; i < $scope.listUsers.length; i++) {
              if ($scope.listUsers[i].id === admin.id) {
                $scope.listUsers.splice(i, 1);
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
                    message: $translate.instant('userManager.alert.removeSuccess_3', { name: admin.firstName })
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
                    message: $translate.instant('userManager.alert.admin.removeFail_1', { name: admin.firstName })
                  };
                }
              }
            });
          });
        }
      });
    };

    // Restore
    $scope.restore = function (info) {
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
          spouses.restore(info).then(function () {
            for (var i = 0; i < $scope.listUsers.length; i++) {
              if ($scope.listUsers[i].id === info.id) {
                $scope.listUsers.splice(i, 1);
              }
            }
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
                    message: $translate.instant('userManager.alert.restoreSuccess_3', { name: info.firstName })
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
                    message: $translate.instant('userManager.alert.participant.restoreFail_1', { name: info.firstName })
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
            return $scope.listUsers;
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
                var message = $translate.instant('userManager.alert.restoreMultipleUsers', { n: userList.length });
                if (userList.length === 1) {
                  message = $translate.instant('userManager.alert.restoreUser_2', { name: userList[0].firstName });
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
                spouses.restore(userList[0]).then(function () {
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
                          message = $translate.instant('userManager.alert.participant.restoreFail_1', { name: listError[0].firstName });
                        }
                      } else { // Delete n users
                        if (listError.length === 0) {
                          message = $translate.instant('userManager.alert.restoreSuccess_2', { n: totalUser });
                        } else if (listError.length === 1) {
                          if (totalUser === 2) {
                            message = $translate.instant('userManager.alert.participant.restoreSuccess_1', { name: listError[0].firstName });
                          } else {
                            message = $translate.instant('userManager.alert.participant.restoreSuccess_3', {
                              n: totalUser - 1,
                              name: listError[0].firstName
                            });
                          }
                        } else {
                          if (totalUser - listError.length === 0) {
                            title = $translate.instant('userManager.alert.removeHeadingFail');
                            message = $translate.instant('userManager.alert.participant.restoreFail_2', { n: listError.length });
                          } else if (totalUser - listError.length === 1) {
                            message = $translate.instant('userManager.alert.participant.restoreSuccess_2', { n: listError.length });
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
    $scope.selectStatus = function (data) {
      if (data === 'active') {
        $scope.filter.active = true;
      } else {
        $scope.filter.active = false;
      }

      //reset store sort
      $scope.resetInfoSort();

      $scope.reload();
    };

    // select User type
    $scope.selectUserType = function (data) {
      $scope.filter.userType = data;

      if (data === 'participant') {

        if ($scope.idClient) {
          $state.go('loggedIn.modules.user-manager.participantClient', { 'idClient': $scope.idClient });
        } else {
          $state.go('loggedIn.modules.user-manager.participant');
        }

      }

    };

    // Listening
    $scope.$on('spouses:list:updated', function () {
      // Update
    });


    //Clear filterEmployerClear
    $scope.filterEmployerClear = function () {

      $scope.currEmployer = null;
      $scope.filter.clientName = undefined;
      $scope.filter.employerId = null;
      $scope.isClickButtonClearFilter = true;

      //reset store sort
      $scope.resetInfoSort();

      if ($state.current.name === "loggedIn.modules.user-manager.spouseClient") {
        $state.go('loggedIn.modules.user-manager.spouse-list');
      }
    };



    //START: For Auto-complete
    $scope.paramsAutoComplete = {
      employer: null
    };
    $scope.$watch('paramsAutoComplete.employer', function (value) {
      if (!value || !value.id) {
        $scope.employerList = [];
        //$scope.changeEmployer(0);
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


    $scope.choiceEmployer = function (employer) {

      //only reset when change current user
      if ($scope.currEmployer) {

        if ($scope.infoSort && $scope.infoSort.clientId && $scope.infoSort.clientId !== $scope.currEmployer.id) {
          resetTable();
          $scope.resetInfoSort();
        }

      }

      if (security.isClientManager() || security.isAdmin()) {
        $state.go('loggedIn.modules.user-manager.spouseClient', { 'idClient': employer.id });
      }
      $scope.currEmployer = employer;
      $scope.filter.clientName = employer.clientName;
      $scope.filter.employerId = employer.id;

    };


    function findEmployer(idClient) {

      if ((security.isClientManager() || security.isAdmin()) && !!$scope.idClient) {
        employers.getEmployerWithIncentive({ id: idClient })
          .then(function (result) {
            $scope.employerList.push(result);
            $scope.currEmployer = result;
            $scope.currEmployer['id'] = idClient;
            $scope.choiceEmployer($scope.currEmployer);
          });
      }
    }
    function init() {

      if ($scope.idClient) {
        findEmployer($scope.idClient);
      }

    }

    init();

  });
