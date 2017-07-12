angular.module('app.modules.participantsurveys.list-participantsurveys', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.list-participantsurveys', {
        url: '/participantsurveys/list',
        views: {
          'main-content': {
            templateUrl: 'modules/participantsurveys/list-participantsurveys/list-participantsurveys.tpl.html',
            controller: 'ParticipantListSurveysController'
          }
        }
      });
  })

  .controller('ParticipantListSurveysController',
  function ($scope, $state, CONFIGS, security, $modal, $translate, utils, ngTableParams, participantSurveys) {


    $scope.NgTableParams = ngTableParams;
    $scope.ids = "";
    $scope.checkboxes = { 'checked': false, items: [] };
    $scope.domain = CONFIGS.baseURL();

    $scope.surveysList = [];

    // Filter here
    $scope.filterSurvey = {
      answer: undefined,
      status: 'active'
    };

    // Paging from api
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: 1,   // show first page
      count: CONFIGS.countPerPage,  // count per page
      filter: $scope.filterSurvey
    }, {
        counts: [], // hide page counts control
        total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
          function pagination() {
            var sorting = params.sorting();
            var filter = params.filter();
            var params2 = {
              page: params.page(),
              pageSize: params.count(),
              embed: 'participant,participant.employer.clientName'
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
            if (!!filter.answer) {
              params2.q = 'surveyName,line1,line2,line3,line4,line5=' + filter.answer;
            }

            $scope.loading = true;
            participantSurveys.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;

              $scope.surveysList = data.surveysList;

              // Format data
              angular.forEach($scope.surveysList, function (item) {
                item.createdDate = utils.dateToShort(item.createdDate);
              });

              $defer.resolve($scope.surveysList);
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

    // select Status Archive
    $scope.selectStatusArchive = function (data) {
      $scope.filterSurvey.status = data;
      $scope.reload();
    };

    // Remove
    $scope.remove = function (item) {
      // Open Warning
      $scope.modal = $modal.open({
        controller: 'WarningController',
        templateUrl: 'modules/alert/warning.tpl.html',
        size: 'sm',
        resolve: {
          message: function () {
            return 'Are you sure you want to delete this survey?';
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          participantSurveys.remove(item.id).then(function () {
            for (var i = 0; i < $scope.surveysList.length; i++) {
              if ($scope.surveysList[i].id === item.id) {
                $scope.surveysList.splice(i, 1);
              }
            }
            $scope.reload();
          }, function (error) {

          });
        }
      });
    };

    // Remove Multiple
    $scope.removeMultiple = function (listID) {
      if (listID) {
        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: "Delete Survey Forms",
                summary: false,
                style: 'yesNo',
                message: "Are you sure you want to delete these Survey Forms?"
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            var object = {
              "Ids": listID.split(",")
            };
            participantSurveys.deleteMultiSurvey(object).then(function () {

              $scope.modal = $modal.open({
                controller: 'AlertController',
                templateUrl: 'modules/alert/alert.tpl.html',
                size: 'sm',
                resolve: {
                  data: function () {
                    return {
                      title: 'Success',
                      summary: false,
                      style: 'ok',
                      message: "Survey Forms Successfully Deleted"
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
                      title: 'Delete Fail',
                      summary: false,
                      style: 'ok',
                      message: "Please try again"
                    };
                  }
                }
              });
            });
          }
        });


      } else {

        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: 'Info',
                summary: false,
                style: 'ok',
                message: "Please select item."
              };
            }
          }
        });

      }
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
              message: 'Are you sure you want to restore this survey?'
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          participantSurveys.restore(participant.id).then(function () {
            for (var i = 0; i < $scope.surveysList.length; i++) {
              if ($scope.surveysList[i].id === participant.id) {
                $scope.surveysList.splice(i, 1);
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

    // Open content
    $scope.openContent = function (data) {

      //set read this item
      security.setReadNotification(participantSurveys, angular.copy(data));

      $scope.modal = $modal.open({
        controller: 'PopupShowContentController',
        templateUrl: 'modules/popup/show-content/show-content.tpl.html',
        size: 'md',
        resolve: {
          DATA: function () {
            return data;
          },
          API: function () {
            return participantSurveys;
          },
          TYPE: function () {
            return 'participantsurveys';
          }
        }
      });
      $scope.modal.result.then(function (value) {

      });
    };

    //********************************** START: Check all **********************************//

    $scope.itemChecked = function (data) {
      var _id = data.id;
      if (data.selected) {
        $scope.checkboxes.items.push(_id);
        if ($scope.checkboxes.items.length == $scope.surveysList.length) {
          $scope.checkboxes.checked = true;
        }
      } else {
        $scope.checkboxes.checked = false;
        var index = $scope.checkboxes.items.indexOf(_id);
        $scope.checkboxes.items.splice(index, 1);
      }

    };

    $scope.selectedAll = function () {
      $scope.checkboxes.items = [];
      if ($scope.checkboxes.checked) {
        $scope.checkboxes.checked = true;
        for (var i = 0; i < $scope.surveysList.length; i++) {
          $scope.checkboxes.items.push($scope.surveysList[i].id);
        }
      }
      else {
        $scope.checkboxes.checked = false;
      }
      angular.forEach($scope.surveysList, function (item) {
        item.selected = $scope.checkboxes.checked;
      });
    };

    $scope.$watch('checkboxes.items', function (value) {

      if (value && value.length !== 0) {
        $scope.ids = $scope.checkboxes.items.toString();

      } else {
        $scope.ids = "";
      }

      if ($scope.surveysList) {
        var total = $scope.surveysList.length;
        var checked = $scope.checkboxes.items.length;
        var unchecked = total - checked;
        // grayed checkbox
        angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
      }

    }, true);

    //********************************** END: Check all **********************************//

  }
  );
