angular.module("app.modules.user-manager.portfolio", [
    'app.modules.user-manager.portfolio.create',
    'app.modules.user-manager.portfolio.edit'
  ])

  .config(function ($stateProvider) {
      $stateProvider
        .state('loggedIn.modules.user-manager.portfolio', {
          url: '/portfolio',
          views: {
            'manager-content': {
              templateUrl: 'modules/user-manager/portfolio/portfolio.tpl.html',
              controller: 'UserManagerPortfolioController'
            }
          }
        });
    }
  )

  .controller('UserManagerPortfolioController',
    function ($scope, $state, $translate, $filter, $modal, utils, CONFIGS, ngTableParams, portfolios) {
      // Permission
      $scope.isFullControl = function () {
        return true;
      };

      $scope.portfoliosList = [];

      // Init model
      $scope.NgTableParams = ngTableParams;

      // Filter here
      $scope.filter = {
        keyword: undefined,
        status: "active",
        email: undefined
      };

      // Paging from api
      $scope.loading = true;
      $scope.tableParams = new $scope.NgTableParams({
        page: 1,   // show first page
        count: 25,  // count per page
        filter: $scope.filter
      }, {
        //counts: [], // hide page counts control
        //total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
          function pagination() {
            var sorting = params.sorting();
            var filter = params.filter();
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
              params2.q = 'name=' + filter.keyword;
            }

            $scope.loading = true;
            portfolios.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.portfoliosList = data.portfoliosList;
              $defer.resolve($scope.portfoliosList);
            }, function (error) {
              $scope.loading = false;
            });
          }

          params.data = [];
          pagination();
        }
      });

      // Reload current page
      $scope.reload = function () {
        $scope.tableParams.reload();
      };

      // Edit
      $scope.edit = function (admin) {
        $state.go('loggedIn.modules.user-manager.portfolio.edit', {id: admin.id});
      };

      // Remove
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
                message: $translate.instant('userManager.alert.removePortfolio')
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            portfolios.inactive(admin.id).then(function () {
              for (var i = 0; i < $scope.portfoliosList.length; i++) {
                if ($scope.portfoliosList[i].id === admin.id) {
                  $scope.portfoliosList.splice(i, 1);
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
                      message: $translate.instant('userManager.alert.removeSuccess_3', {name: admin.name})
                    };
                  }
                }
              });
              $scope.modal.result.then(function () {
                $scope.reload();
              });
            }, function (errors) {
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
                      message: utils.formatErrors(errors.errors)
                    };
                  }
                }
              });
            });
          }
        });
      };

      // Delete on database
      $scope.delete = function (admin) {
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
                message: $translate.instant('userManager.alert.removePortfolio')
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            portfolios.remove(admin.id).then(function () {
              for (var i = 0; i < $scope.portfoliosList.length; i++) {
                if ($scope.portfoliosList[i].id === admin.id) {
                  $scope.portfoliosList.splice(i, 1);
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
                      message: $translate.instant('userManager.alert.removeSuccess_3', {name: admin.name})
                    };
                  }
                }
              });
              $scope.modal.result.then(function () {
                $scope.reload();
              });
            }, function (errors) {
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
                      message: utils.formatErrors(errors.errors)
                    };
                  }
                }
              });
            });
          }
        });
      };

      // Delete Multiple Users
      $scope.removeMultipleUsers = function () {
        $scope.modal = $modal.open({
          controller: 'UserManagerSelectUsersController',
          templateUrl: 'modules/user-manager/select-users/select-users.tpl.html',
          size: 'lg',
          resolve: {
            userList: function () {
              return $scope.portfoliosList;
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
            $scope.modal.result.then(function (ok) {
              var listError = [];
              var totalUser = 0;

              function removeUser(userList) {
                if (!!userList[0]) {
                  portfolios.remove(userList[0].id).then(function () {
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
                            message = $translate.instant('userManager.alert.admin.removeFail_1', {name: listError[0].firstName});
                          }
                        } else { // Delete n users
                          if (listError.length === 0) {
                            message = $translate.instant('userManager.alert.removeSuccess_2', {n: totalUser});
                          } else if (listError.length === 1) {
                            if (totalUser === 2) {
                              message = $translate.instant('userManager.alert.admin.removeSuccess_1', {name: listError[0].firstName});
                            } else {
                              message = $translate.instant('userManager.alert.admin.removeSuccess_3', {
                                n: totalUser - 1,
                                name: listError[0].firstName
                              });
                            }
                          } else {
                            if (totalUser - listError.length === 0) {
                              title = $translate.instant('userManager.alert.removeHeadingFail');
                              message = $translate.instant('userManager.alert.admin.removeFail_2', {n: listError.length});
                            } else if (totalUser - listError.length === 1) {
                              message = $translate.instant('userManager.alert.admin.removeSuccess_2', {n: listError.length});
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
            portfolios.restore(participant.id).then(function () {
              for (var i = 0; i < $scope.portfoliosList.length; i++) {
                if ($scope.portfoliosList[i].id === participant.id) {
                  $scope.portfoliosList.splice(i, 1);
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
              return $scope.portfoliosList;
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
                  portfolios.restore(userList[0].id).then(function () {
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

      // Listening
      $scope.$on('portfolios:list:updated', function () {
        // Update
      });
    }
  );
