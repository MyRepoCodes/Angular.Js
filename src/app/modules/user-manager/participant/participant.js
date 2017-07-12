angular.module('app.modules.user-manager.participant', [
  'app.modules.user-manager.participant.upload-confirm',
  'app.modules.user-manager.participant.create',
  'app.modules.user-manager.participant.edit',
  'app.modules.user-manager.participant.download'
])
  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.participant', {
        url: '/participant',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/participant/participant.tpl.html',
            controller: 'UserManagerParticipantController'
          }
        }
      })
      .state('loggedIn.modules.user-manager.participantClient', {
        url: '/client/:idClient/participant/all/',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/participant/participant.tpl.html',
            controller: 'UserManagerParticipantController'
          }
        }
      });
  }
  )

  .controller('UserManagerParticipantController', function ($scope, $state, $translate, $filter, $modal, $timeout, utils, CONFIGS, ngTableParams, security, participants, employers) {  

    $scope.isAdmin = security.isAdmin();
    // Permission
    $scope.isFullControl = function () {
      if (security.isAdmin() || security.isClientManager() || security.isAgentTheAgent()) {
        return true;
      } else { //isClinicalDirector || ishealthcoachmanager
        return false;
      }
    };

    $scope.env = {
      isOpenSelectClient: false
    };

    $scope.idClient = $state.params.idClient;

    $scope.participantList = [];
    $scope.employerList = [];
    $scope.isClickButtonClearFilter = false;

    // Init model
    $scope.NgTableParams = ngTableParams;
    $scope.currEmployer = null;

    $scope.currentStatusParticipant = "active";

    // Filter here
    $scope.filter = {
      keyword: $scope.infoSort ? $scope.infoSort.keyword : null,
      lastName: undefined,
      firstName: undefined,
      clientName: undefined,
      username: undefined,
      email: undefined,
      active: true,
      incentiveSelected: null,
      userType: 'participant',
      employerId: $scope.idClient
    };

    // Paging from api
    var history = {
      employerId: null,
      q: null,
      keyword: null,
      page: null,
      pageSize: null,
      refresh: false
    };
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: $scope.infoSort ? $scope.infoSort.page : 1,   // show first page
      page_return: $scope.infoSort ? $scope.infoSort.page : null,
      count: $scope.infoSort ? $scope.infoSort.pageSize : 10,  // count per page
      filter: $scope.filter
    }, {
        //counts: [], // hide page counts control
        //total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
          function pagination() {
            var sorting = params.sorting();
            if (!Object.keys(sorting).length) {
              if ($scope.infoSort && $scope.infoSort.sort) {
                if ($scope.infoSort.sort[0] === '-') {
                  sorting[$scope.infoSort.sort.substr(1)] = 'desc';
                } else if ($scope.infoSort.sort[0] === '+') {
                  sorting[$scope.infoSort.sort.substr(1)] = 'asc';
                } else {
                  sorting[$scope.infoSort.sort] = 'asc';
                }
              }
            }

            var filter = params.filter();

            var tmpPage = $scope.tableParams.$params.page_return;
            if (tmpPage && params.page() === 1) {
              params.page(tmpPage);
            }

            if ($scope.infoSort && $scope.infoSort.pageSize !== params.count()) {
              resetTable();
              params.page(1);
            }

            var params2 = {
              clientId: filter.employerId,
              isDeleted: filter.active ? 0 : 1,
              page: params.page(),
              pageSize: params.count()
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
              params2.q = filter.keyword;
            }

            // incentive
            if (!!filter.incentiveSelected) {
              params2.incentiveId = filter.incentiveSelected.id;
            }

            $scope.loading = true;
            if (!history.refresh && history.employerId === filter.employerId &&
              history.keyword === params2.keyword &&
              history.page === params2.page &&
              history.pageSize === params2.pageSize &&
              params2.sort === '') {
              $scope.loading = false;
              // use build-in angular sort
              $scope.participantList = params.sorting() ? $filter('orderBy')($scope.participantList, params.orderBy()) : $scope.participantList;
              $defer.resolve($scope.participantList);
            } else {
              history.employerId = filter.employerId;
              //history.q = params2.q;

              if (history.keyword === params2.keyword) {
                history.page = params2.page;
              } else {
                params.page(1);
                params2.page = params.page();
                history.page = params.page();
              }
              history.keyword = params2.q;

              history.pageSize = params2.pageSize;
              history.refresh = false;

              participants.get(params2, undefined, false).then(function (data) {
                $scope.loading = false;

                params.total(data.totalCount);
                $scope.participantList = data.participantList;

                // use build-in angular sort
                $scope.participantList = params.sorting() ? $filter('orderBy')($scope.participantList, params.orderBy()) : $scope.participantList;
                $defer.resolve($scope.participantList);
              }, function () {
                $scope.loading = false;
              });
            }
          }

          params.data = [];

          if ((security.isClientManager() || security.isAdmin()) && $state.current.name === "loggedIn.modules.user-manager.participantClient") {
            if ($scope.employerList && $scope.employerList.length !== 0) {
              pagination();
            }
          } else {
            pagination();
          }
        }
      });

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.reload();
    };

    $scope.$watchCollection('filter.keyword', function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        resetTable();
        $scope.resetInfoSort();
      }
    });

    // Init
    function getEmployers() {
      employers.getList().then(function (employerList) {
        $scope.employerList = employerList;
        if ((security.isClientManager() || security.isAdmin()) && !!$scope.idClient) {
          var tempObject = utils.findObjectByElement($scope.employerList, "id", $scope.idClient);
          if (tempObject) {
            $scope.choiceEmployer(tempObject);
          }
        }
      });
    }

    //getEmployers();

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

    function resetTable() {
      $scope.tableParams.$params.page_return = 1;
    }

    //audit logs

    $scope.auditLog = function(userId,userName){       
       $state.go('loggedIn.modules.audit-logs.all-logs',{"userId":userId,"name":userName});
    };

      //Login logs
    $scope.loginLog = function (userId,userName) {
      $state.go('loggedIn.modules.audit-logs.login-logs', {
        "userId": userId,
        "name": userName      
      });
    };



    // Edit
    $scope.edit = function (participant) {
      if (security.isClientManager() || security.isAdmin() && $scope.filter.employerId) {
        $state.go('loggedIn.modules.user-manager.participant.editHasClient', {
          idClient: $scope.filter.employerId,
          id: participant.id
        });
      } else {
        $state.go('loggedIn.modules.user-manager.participant.edit', { id: participant.id });
      }
    };

    // permanentlyDelete
    $scope.permanentlyDelete = function (participant) {
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
          participants.delete(participant.id).then(function () {
            for (var i = 0; i < $scope.participantList.length; i++) {
              if ($scope.participantList[i].id === participant.id) {
                $scope.participantList.splice(i, 1);
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
                    message: $translate.instant('userManager.alert.removeSuccess_3', { name: participant.firstName })
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
                    message: $translate.instant('userManager.alert.participant.removeFail_1', { name: participant.firstName })
                  };
                }
              }
            });
          });
        }
      });
    };

    // permanently Delete  Multiple Users
    $scope.permanentlyDeleteMultipleUsers = function () {
      $scope.modal = $modal.open({
        controller: 'UserManagerSelectUsersController',
        templateUrl: 'modules/user-manager/select-users/select-users.tpl.html',
        size: 'lg',
        resolve: {
          userList: function () {
            return $scope.participantList;
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
                participants.delete(userList[0].id).then(function () {
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
                          message = $translate.instant('userManager.alert.participant.removeFail_1', { name: listError[0].firstName });
                        }
                      } else { // Delete n users
                        if (listError.length === 0) {
                          message = $translate.instant('userManager.alert.removeSuccess_2', { n: totalUser });
                        } else if (listError.length === 1) {
                          if (totalUser === 2) {
                            message = $translate.instant('userManager.alert.participant.removeSuccess_1', { name: listError[0].firstName });
                          } else {
                            message = $translate.instant('userManager.alert.participant.removeSuccess_3', {
                              n: totalUser - 1,
                              name: listError[0].firstName
                            });
                          }
                        } else {
                          if (totalUser - listError.length === 0) {
                            title = $translate.instant('userManager.alert.removeHeadingFail');
                            message = $translate.instant('userManager.alert.participant.removeFail_2', { n: listError.length });
                          } else if (totalUser - listError.length === 1) {
                            message = $translate.instant('userManager.alert.participant.removeSuccess_2', { n: listError.length });
                          } else {
                            message = $translate.instant('userManager.alert.participant.removeSuccess_4', {
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

    function inActiveSingleParticipant(participant, terminationDate) {
      participants.remove(participant.id, terminationDate,{screenName:$translate.instant('auditLogs.screenName.userManager')}).then(function () {
        for (var i = 0; i < $scope.participantList.length; i++) {
          if ($scope.participantList[i].id === participant.id) {
            $scope.participantList.splice(i, 1);
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
                message: $translate.instant('userManager.alert.removeSuccess_3', { name: participant.firstName })
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
                message: $translate.instant('userManager.alert.participant.removeFail_1', { name: participant.firstName })
              };
            }
          }
        });
      });
    }

    // InActive
    $scope.remove = function (participant) {
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
          $modal.open({
            controller: 'TerminationDateController',
            templateUrl: 'modules/alert/termination-date.tpl.html',
            size: 'sm'
          }).result.then(function (terminationDate) {
            if (terminationDate !== false) {
              resetTable();
              $scope.resetInfoSort();
              inActiveSingleParticipant(participant, terminationDate);
            }
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
            return $scope.participantList;
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
                  message = $translate.instant('userManager.alert.removeUser_2', { name: userList[0].clientName });
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
                participants.remove(userList[0].id).then(function () {
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
                          message = $translate.instant('userManager.alert.client.removeFail_1', { name: listError[0].clientName });
                        }
                      } else { // Delete n users
                        if (listError.length === 0) {
                          message = $translate.instant('userManager.alert.removeSuccess_2', { n: totalUser });
                        } else if (listError.length === 1) {
                          if (totalUser === 2) {
                            message = $translate.instant('userManager.alert.client.removeSuccess_1', { name: listError[0].clientName });
                          } else {
                            message = $translate.instant('userManager.alert.client.removeSuccess_3', {
                              n: totalUser - 1,
                              name: listError[0].clientName
                            });
                          }
                        } else {
                          if (totalUser - listError.length === 0) {
                            title = $translate.instant('userManager.alert.removeHeadingFail');
                            message = $translate.instant('userManager.alert.client.removeFail_2', { n: listError.length });
                          } else if (totalUser - listError.length === 1) {
                            message = $translate.instant('userManager.alert.client.removeSuccess_2', { n: listError.length });
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

    // Restore Multiple Users
    $scope.restoreMultipleUsers = function () {
      $scope.modal = $modal.open({
        controller: 'UserManagerSelectUsersController',
        templateUrl: 'modules/user-manager/select-users/select-users.tpl.html',
        size: 'lg',
        resolve: {
          userList: function () {
            return $scope.participantList;
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
                participants.restore(userList[0].id).then(function () {
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
          participants.restore(participant.id).then(function () {
            for (var i = 0; i < $scope.participantList.length; i++) {
              if ($scope.participantList[i].id === participant.id) {
                $scope.participantList.splice(i, 1);
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
                    message: $translate.instant('userManager.alert.restoreSuccess_3', { name: participant.firstName })
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
                    message: $translate.instant('userManager.alert.participant.restoreFail_1', { name: participant.firstName })
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
            return $scope.participantList;
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
                participants.restore(userList[0].id).then(function () {
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



    $scope.choiceEmployer = function (employer) {

      //only reset when change current user
      if ($scope.currEmployer) {

        if ($scope.infoSort && $scope.infoSort.clientId && $scope.infoSort.clientId !== $scope.currEmployer.id) {
          resetTable();
          $scope.resetInfoSort();
        }

      }

      if (security.isClientManager() || security.isAdmin()) {
        $state.go('loggedIn.modules.user-manager.participantClient', { 'idClient': employer.id });
      }
      $scope.currEmployer = employer;
      $scope.filter.clientName = employer.clientName;
      $scope.filter.employerId = employer.id;

    };

    $scope.changeCurrentIncentive = function (data) {

      $scope.filter.incentiveSelected = data;
    };

    $scope.filterEmployerClear = function () {

      $scope.currEmployer = null;
      $scope.filter.clientName = undefined;
      $scope.filter.employerId = null;
      $scope.isClickButtonClearFilter = true;

      //reset store sort
      $scope.resetInfoSort();

      if ($state.current.name === "loggedIn.modules.user-manager.participantClient") {
        $state.go('loggedIn.modules.user-manager.participant');
      }
    };

    // select User type
    $scope.selectUserType = function (data) {
      $scope.filter.userType = data;

      if (data === 'spouse') {

        if ($scope.idClient) {
          $state.go('loggedIn.modules.user-manager.spouseClient', { 'idClient': $scope.idClient });
        } else {
          $state.go('loggedIn.modules.user-manager.spouse-list');
        }

      }

    };

    // select Status
    $scope.selectStatusParticipant = function (data) {
      if (data === 'active') {
        $scope.filter.active = true;
      } else {
        $scope.filter.active = false;
      }
      //reset store sort
      $scope.resetInfoSort();

      $scope.reload();
    };

    // Listening
    $scope.$on('participants:list:updated', function () {
      // Update
    });

    // Go to page Spouse
    $scope.goToPageSpouse = function (data) {
      $state.go("loggedIn.modules.user-manager.participant-spouse-list", { participantId: data.id });
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

    function init() {

      if ($scope.idClient) {
        findEmployer($scope.idClient);
      }

    }

    init();

  });
