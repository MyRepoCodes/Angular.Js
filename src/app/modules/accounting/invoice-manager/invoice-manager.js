angular.module('app.modules.accounting.invoice-manager', [
  'app.modules.accounting.invoice-manager.upload',
  'app.modules.accounting.invoice-manager.invoice-history'
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.invoice-manager', {
        url: '/invoice-manager',
        views: {
          'main-content': {
            templateUrl: 'modules/accounting/invoice-manager/invoice-manager.tpl.html',
            controller: 'InvoiceManagerController'
          }
        }
      });
  })

  .controller('InvoiceManagerController',
  function ($scope, $state, CONFIGS, security, $modal, $translate, ngTableParams, spoolers, utils) {

    $scope.NgTableParams = ngTableParams;
    $scope.ids = "";
    $scope.domain = CONFIGS.baseURL();
    $scope.checkboxes = { 'checked': false, items: [] };
    $scope.listData = [];

    // Permission
    $scope.isFullControl = function () {
      return true;
    };

    // List action download
    $scope.listActionDownload = [
      { value: 'pdf', text: "Download as PDF" },
      { value: 'downloadAsExcel', text: "Download as Excel" },
      { value: 'rff', text: "Download Request for Funding Reports" },
      { value: 'dxportToQuickbooksOnline', text: "Export to Quickbooks Online" },
    ];

    // Filter here
    $scope.filter = {
      answer: undefined,
      status: 'active'
    };

    // Paging from api
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: 1,   // show first page
      count: CONFIGS.countPerPage,  // count per page
      filter: $scope.filter,
      sorting: { 'createdDate': 'desc' }
    }, {
        //counts: [], // hide page counts control
        //total: 1,  // value less than count hide pagination
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

            // Filter
            if (!!filter.answer) {
              params2.q = 'groupNumber,clientName,fileName=' + filter.answer;
            }

            $scope.loading = true;
            spoolers.getWithFileName(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;

              $scope.listData = data.data;

              // Format data
              angular.forEach($scope.listData, function (item) {
                item.dateOfBirth = utils.parseDateOfBirthToDatePacker(item.dateOfBirth);
                item.createdDate = utils.dateToShort(item.createdDate);
              });

              $defer.resolve($scope.listData);
            }, function (error) {
              $scope.loading = false;
            });
          }

          params.data = [];
          pagination();
          resetCheckBox();
        }
      });

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.reload();
    };

    // select Status Archive
    $scope.selectStatusArchive = function (data) {
      $scope.filter.status = data;
      //$scope.reload();
    };

    // Open content
    $scope.openContent = function (data) {
      if (data && data.id) {
        $state.go('loggedIn.modules.invoice-history', { spoolerID: data.id });
      }
    };

    //********************************** START: Check all **********************************//

    $scope.itemCheckedInvoice = function (data) {
      var _id = data.id;
      if (data.selected) {
        $scope.checkboxes.items.push(_id);
        if ($scope.checkboxes.items.length == $scope.listData.length) {
          $scope.checkboxes.checked = true;
        }
      } else {
        $scope.checkboxes.checked = false;
        var index = $scope.checkboxes.items.indexOf(_id);
        $scope.checkboxes.items.splice(index, 1);
      }

    };

    $scope.selectedAllInvoice = function () {
      $scope.checkboxes.items = [];
      if ($scope.checkboxes.checked) {
        $scope.checkboxes.checked = true;
        for (var i = 0; i < $scope.listData.length; i++) {
          $scope.checkboxes.items.push($scope.listData[i].id);
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

      } else {
        $scope.ids = "";
      }

      if ($scope.listData) {
        var total = $scope.listData.length;
        var checked = $scope.checkboxes.items.length;
        var unchecked = total - checked;
        // grayed checkbox
        angular.element(document.getElementById("select_all_invoice")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
      }

    }, true);

    function resetCheckBox() {
      $scope.checkboxes = { 'checked': false, items: [] };
    }

    //********************************** END: Check all **********************************//



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
              message: "Are you sure you want to delete this Spooler ?"
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          spoolers.remove(admin.id).then(function () {

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
                    message: 'Deleted Spooler successfully.'
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
                    message: 'Unable to delete this Spooler.',
                  };
                }
              }
            });
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
                title: "Delete This Spooler",
                summary: false,
                style: 'yesNo',
                message: "Are you sure you want to delete these Spoolers ?"
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            var object = {
              "Ids": listID.split(",")
            };
            spoolers.deleteMulti(object).then(function () {

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
                      message: "Spoolers Successfully Deleted"
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
                message: "Please select item."
              };
            }
          }
        });

      }
    };



    // permanentlyDelete
    $scope.permanentlyDelete = function (dataItem) {
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
              message: "Are you sure you want to permanently delete this Spooler?"
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          spoolers.delete(dataItem.id).then(function () {
  
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
                    message: 'Deleted Spooler successfully.'
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
                    message: 'Unable to delete this Spooler.',
                  };
                }
              }
            });
          });
        }
      });
    };

    // Restore
    $scope.restore = function (dataItem) {
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
              message: 'Are you sure you want to restore this Spooler ?',
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          spoolers.restore(dataItem.id).then(function () {

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
                    message: 'Restore the Spooler successfully.',
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
                    message: 'Unable to restore the Spooler.',
                  };
                }
              }
            });
          });
        }
      });
    };

    // Restore Multiple Users
    $scope.restoreMultipleUsers = function (listID) {
      if (listID) {
        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: "Restore This Spooler",
                summary: false,
                style: 'yesNo',
                message: "Are you sure you want to restore these Spoolers ?"
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            var object = {
              "Ids": listID.split(",")
            };
            spoolers.restoreMulti(object).then(function () {

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
                      message: "Spoolers Successfully Restored"
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
                      title: 'Restored Fail',
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
  });

