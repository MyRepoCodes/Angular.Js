angular.module('app.modules.benicomp-select.privacy-authorization-form-manager', [
  "app.modules.benicomp-select.privacy-authorization-form.view-result"
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.privacy-authorization-form-manager', {
        url: '/privacy-authorization-form-manager',
        views: {
          'main-content': {
            templateUrl: 'modules/benicomp-select/privacy-authorization-form/manager/manager.tpl.html',
            controller: 'PrivacyAuthorizationFormManagerController'
          }
        }
      });
  })

  .controller('PrivacyAuthorizationFormManagerController', function ($scope, $timeout, $state, CONFIGS, security, $modal, $translate, ngTableParams, PrivacyAuthorizationForms, utils) {
    $scope.NgTableParams = ngTableParams;
    $scope.ids = "";
    $scope.checkboxes = {'checked': false, items: []};
    $scope.listIDDocuments = "";
    $scope.checkboxesDocuments = {'checked': false, items: []};
    $scope.listData = [];
    $scope.domain = CONFIGS.baseURL() + '/documents/download?documentIds=';

    // Filter here
    $scope.filterSurvey = {
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
            embed: ''
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

          if (!params2.sort) {
            sorting['createdDate'] = 'desc';
            params2.sort = '-createdDate';
          }

          // Filter
          if (!!filter.answer) {
            params2.customSearch = filter.answer;
          }

          $scope.loading = true;
          PrivacyAuthorizationForms.get(params2, headers, false).then(function (data) {
            params.total(data.totalCount);
            $scope.listData = data.data;
            $scope.loading = false;

            //reset
            resetCheckBox();


            $defer.resolve($scope.listData);
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

    // reset check box
    function resetCheckBox() {
      $scope.ids = "";
      $scope.checkboxes = {'checked': false, items: []};
      $scope.listIDDocuments = "";
      $scope.checkboxesDocuments = {'checked': false, items: []};
    }

    // update status
    $scope.updateStatus = function (data) {
      var tempData = {
        id: data.id,
        status: data.status
      };
      PrivacyAuthorizationForms.put(tempData).then(function (result) {
        $scope.reload();
      }, function (err) {
      });
    };

    $scope.remove = function (claimItem) {
      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: 'sm',
        resolve: {
          data: function () {
            return {
              title: "Delete Privacy Authorization Form",
              summary: false,
              style: 'yesNo',
              message: "Are you sure you want to delete this Privacy Authorization Form?"
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          PrivacyAuthorizationForms.remove(claimItem.id).then(function () {
            for (var i = 0; i < $scope.listData.length; i++) {
              if ($scope.listData[i].id === claimItem.id) {
                $scope.listData.splice(i, 1);
              }
            }
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
                    message: "Privacy Authorization Forms successfully deleted"
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
                    title: 'Remove Fail',
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
    };

    // Remove Multiple Users
    $scope.removeMultiple = function (listID) {
      if (listID) {


        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: "Delete Privacy Authorization Forms",
                summary: false,
                style: 'yesNo',
                message: "Are you sure you want to delete these Privacy Authorization Forms?"
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            var object = {
              "Ids": listID.split(",")
            };
            PrivacyAuthorizationForms.deleteMulti(object).then(function () {

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
                      message: "Privacy Authorization Forms successfully deleted"
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
                      title: 'Remove Fail',
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
                message: "Please select Privacy Authorization Form."
              };
            }
          }
        });

      }
    };

    // view result
    $scope.viewResult = function (data) {

      //set read this item
      security.setReadNotification(PrivacyAuthorizationForms, angular.copy(data));

      $scope.modal = $modal.open({
        controller: 'ViewResultPAFController',
        templateUrl: 'modules/benicomp-select/privacy-authorization-form/view-result/view-result.tpl.html',
        size: 'lg',
        resolve: {
          data: function () {
            return data;
          }
        }
      });
    };

    $scope.downloadClaims = function (listID) {

      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: 'sm',
        resolve: {
          data: function () {
            return {
              title: "Download Privacy Authorization Form",
              summary: false,
              style: 'yesNo',
              message: "Would you like to continue ?"
            };
          }
        }
      });
      $scope.modal.result
        .then(function (result) {
          if (result === true) {
            resetCheckBox();
            window.open($scope.domain + listID, '_blank');
            $timeout(function () {
              $scope.reload();
            }, 2000);
          }
        });


    };


    /********************************** START: Check all **********************************/

    $scope.itemChecked = function (data) {
      var _id = data.id;
      var _documentId = data.documentId;
      if (data.selected) {
        $scope.checkboxes.items.push(_id);
        $scope.checkboxesDocuments.items.push(_documentId);

        if ($scope.checkboxes.items.length == $scope.listData.length) {
          $scope.checkboxes.checked = true;
        }
      } else {
        $scope.checkboxes.checked = false;
        var index = $scope.checkboxes.items.indexOf(_id);
        $scope.checkboxes.items.splice(index, 1);
        $scope.checkboxesDocuments.items.splice(index, 1);
      }

    };

    $scope.selectedAll = function () {
      $scope.checkboxes.items = [];
      $scope.checkboxesDocuments.items = [];

      if ($scope.checkboxes.checked) {
        $scope.checkboxes.checked = true;
        for (var i = 0; i < $scope.listData.length; i++) {
          $scope.checkboxes.items.push($scope.listData[i].id);
          $scope.checkboxesDocuments.items.push($scope.listData[i].documentId);
        }
      }
      else {
        $scope.checkboxes.checked = false;
      }
      angular.forEach($scope.listData, function (item) {
        item.selected = $scope.checkboxes.checked;
      });
    };

    $scope.$watch('checkboxes.items', function (value) {

      if (value && value.length !== 0) {
        $scope.ids = $scope.checkboxes.items.toString();
        $scope.listIDDocuments = $scope.checkboxesDocuments.items.toString();

      } else {
        $scope.ids = "";
        $scope.listIDDocuments = "";
      }

      if ($scope.listData) {
        var total = $scope.listData.length;
        var checked = $scope.checkboxes.items.length;
        var unchecked = total - checked;
        // grayed checkbox
        angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
      }

    }, true);

    /********************************** END: Check all **********************************/


    /*********************************** START: LABEL FORM ***********************************/
    //Define value label
    $scope.listLabel = [
      {id: 1, name: "createdDate", label: "Created Date", active: true},
      {id: 2, name: "firstName", label: "Insured's First Name", active: true},
      {id: 3, name: "lastName", label: "Insured's Last Name", active: true},
      {id: 4, name: "isDownloaded", label: "Status", active: true}
    ];

    /*********************************** END: LABEL FORM ***********************************/
  });
