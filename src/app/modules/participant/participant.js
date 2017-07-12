angular.module('app.modules.participant', [
  'app.modules.user-manager.participant.upload-confirm',
  'app.modules.user-manager.select-users',
  'app.modules.participant.create',
  'app.modules.participant.edit'
])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.participant', {
      url: '/participant',
      views: {
        'main-content': {
          templateUrl: 'modules/participant/participant.tpl.html',
          controller: 'ParticipantController'
        }
      }
    });
})

.controller('ParticipantController', function($scope, $state, $translate, $filter, $modal, $timeout, CONFIGS, ngTableParams, security, participants) {
  // Check permission
  if (!(security.isEmployer() || security.isHealthCoach())) {
    $state.go('loggedIn.modules.dashboard');
  }

  // Permission
  $scope.isFullControl = function() {
    if (security.isEmployer()) {
      return true;
    } else { //isHealthCoach
      return false;
    }
  };

  $scope.participantList = [];

  // Init model
  $scope.NgTableParams = ngTableParams;

  // Filter here
  $scope.filter = {
    keyword: undefined,
    lastName: undefined,
    status: "active",
    firstName: undefined,
    email: undefined
  };

  // Paging from api
  var history = {
    q: null,
    page: null,
    pageSize: null,
    status: "active",
    refresh: false
  };
  $scope.loading = true;
  $scope.tableParams = new $scope.NgTableParams({
    page: 1,   // show first page
    count: 25,  // count per page
    filter: $scope.filter
  }, {
    //counts: [], // hide page counts control
    //total: 100,  // value less than count hide pagination
    getData: function($defer, params) {
      function pagination() {
        var sorting = params.sorting();
        var filter = params.filter();
        var params2 = {
          isDeleted: (filter.status === 'active') ? 0 : 1,
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

        $scope.loading = true;
        if (!history.refresh && history.q === params2.q && history.page === params2.page && history.pageSize === params2.pageSize && history.status === filter.status) {
          $scope.loading = false;
          // use build-in angular sort
          $scope.participantList = params.sorting() ? $filter('orderBy')($scope.participantList, params.orderBy()) : $scope.participantList;
          $defer.resolve($scope.participantList);
        } else {
          history.q = params2.q;
          history.page = params2.page;
          history.pageSize = params2.pageSize;
          history.refresh = false;
          history.status = filter.status;

          participants.get(params2, undefined, false).then(function(data) {
            params.total(data.totalCount);
            $scope.loading = false;

            // use build-in angular sort
            $scope.participantList = params.sorting() ? $filter('orderBy')(data.participantList, params.orderBy()) : data.participantList;
            $defer.resolve($scope.participantList);
          }, function(error) {
            $scope.loading = false;
          });
        }
      }

      params.data = [];
      pagination();
    }
  });

  // Reload current page
  $scope.reload = function() {
    $scope.tableParams.reload();
  };

  // Edit
  $scope.edit = function(participant) {
    $state.go('loggedIn.modules.participant.edit', {id: participant.id});
  };

  function inActiveSingleParticipant(participant, terminationDate) {
    participants.remove(participant.id).then(function() {
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
          data: function() {
            return {
              title: $translate.instant('userManager.alert.removeHeadingSuccess'),
              summary: false,
              style: 'ok',
              message: $translate.instant('userManager.alert.removeSuccess_3', {name: participant.firstName})
            };
          }
        }
      });
      $scope.modal.result.then(function() {
        $scope.reload();
      });
    }, function() {
      $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: 'sm',
        resolve: {
          data: function() {
            return {
              title: $translate.instant('userManager.alert.removeHeadingFail'),
              summary: false,
              style: 'ok',
              message: $translate.instant('userManager.alert.participant.removeFail_1', {name: participant.firstName})
            };
          }
        }
      });
    });
  }

  // Remove
  $scope.remove = function(participant) {
    $scope.modal = $modal.open({
      controller: 'AlertController',
      templateUrl: 'modules/alert/alert.tpl.html',
      size: 'sm',
      resolve: {
        data: function() {
          return {
            title: $translate.instant('alert.waring.heading'),
            summary: false,
            style: 'yesNo',
            message: $translate.instant('userManager.alert.removeUser')
          };
        }
      }
    });
    $scope.modal.result.then(function(result) {
      if (result === true) {
        $modal.open({
          controller: 'TerminationDateController',
          templateUrl: 'modules/alert/termination-date.tpl.html',
          size: 'sm'
        }).result.then(function (terminationDate) {
          if (terminationDate !== false) {
            inActiveSingleParticipant(participant, terminationDate);
          }
        });
      }
    });
  };

  // Delete Multiple Users
  $scope.removeMultipleUsers = function() {
    $scope.modal = $modal.open({
      controller: 'UserManagerSelectUsersController',
      templateUrl: 'modules/user-manager/select-users/select-users.tpl.html',
      size: 'lg',
      resolve: {
        userList: function() {
          return $scope.participantList;
        },
        data: function() {
          return {
            title: $translate.instant('userManager.alert.deleteHeadingSelectUser'),
            button_title: $translate.instant('userManager.alert.deleteButtonSelectUser')
          };
        }
      }
    });
    $scope.modal.result.then(function(userList) {
      if (!!userList) {
        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function() {
              var message = $translate.instant('userManager.alert.removeMultipleUsers', {n: userList.length});
              if (userList.length === 1) {
                message = $translate.instant('userManager.alert.removeUser_2', {name: userList[0].firstName});
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
        $scope.modal.result.then(function(ok) {
          var listError = [];
          var totalUser = 0;

          function removeUser(userList) {
            if (!!userList[0]) {
              participants.remove(userList[0].id).then(function() {
                userList.splice(0, 1);
                removeUser(userList);
              }, function() {
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
                  data: function() {
                    var message = '';
                    var title = $translate.instant('userManager.alert.removeHeadingSuccess');
                    if (totalUser === 1) { // Delete 1 user
                      if (listError.length === 0) {
                        message = $translate.instant('userManager.alert.removeSuccess_1');
                      } else {
                        title = $translate.instant('userManager.alert.removeHeadingFail');
                        message = $translate.instant('userManager.alert.participant.removeFail_1', {name: listError[0].firstName});
                      }
                    } else { // Delete n users
                      if (listError.length === 0) {
                        message = $translate.instant('userManager.alert.removeSuccess_2', {n: totalUser});
                      } else if (listError.length === 1) {
                        if (totalUser === 2) {
                          message = $translate.instant('userManager.alert.participant.removeSuccess_1', {name: listError[0].firstName});
                        } else {
                          message = $translate.instant('userManager.alert.participant.removeSuccess_3', {
                            n: totalUser - 1,
                            name: listError[0].firstName
                          });
                        }
                      } else {
                        if (totalUser - listError.length === 0) {
                          title = $translate.instant('userManager.alert.removeHeadingFail');
                          message = $translate.instant('userManager.alert.participant.removeFail_2', {n: listError.length});
                        } else if (totalUser - listError.length === 1) {
                          message = $translate.instant('userManager.alert.participant.removeSuccess_2', {n: listError.length});
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
              $scope.modal.result.then(function() {
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
  $scope.restore = function(participant) {
    $scope.modal = $modal.open({
      controller: 'AlertController',
      templateUrl: 'modules/alert/alert.tpl.html',
      size: 'sm',
      resolve: {
        data: function() {
          return {
            title: $translate.instant('alert.waring.heading'),
            summary: false,
            style: 'yesNo',
            message: $translate.instant('userManager.alert.restoreUser')
          };
        }
      }
    });
    $scope.modal.result.then(function(result) {
      if (result === true) {
        participants.restore(participant.id).then(function() {
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
              data: function() {
                return {
                  title: $translate.instant('userManager.alert.restoreHeadingSuccess'),
                  summary: false,
                  style: 'ok',
                  message: $translate.instant('userManager.alert.restoreSuccess_3', {name: participant.firstName})
                };
              }
            }
          });
          $scope.modal.result.then(function() {
            $scope.reload();
          });
        }, function() {
          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function() {
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
  $scope.restoreMultipleUsers = function() {
    $scope.modal = $modal.open({
      controller: 'UserManagerSelectUsersController',
      templateUrl: 'modules/user-manager/select-users/select-users.tpl.html',
      size: 'lg',
      resolve: {
        userList: function() {
          return $scope.participantList;
        },
        data: function() {
          return {
            title: $translate.instant('userManager.alert.restoreHeadingSelectUser'),
            button_title: $translate.instant('userManager.alert.restoreButtonSelectUser')
          };
        }
      }
    });
    $scope.modal.result.then(function(userList) {
      if (!!userList) {
        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function() {
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
        $scope.modal.result.then(function(ok) {
          var listError = [];
          var totalUser = 0;

          function removeUser(userList) {
            if (!!userList[0]) {
              participants.restore(userList[0].id).then(function() {
                userList.splice(0, 1);
                removeUser(userList);
              }, function() {
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
                  data: function() {
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
              $scope.modal.result.then(function() {
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
  $scope.selectStatusArchive = function(data) {
    $scope.filter.status = data;
    $scope.reload();
  };

  // Listening
  $scope.$on('participants:list:updated', function() {
    // Update
  });
});
