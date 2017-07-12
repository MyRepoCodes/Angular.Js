angular.module('app.modules.claims.manager-claims', [
  'app.modules.claims.manager-claims.edit',
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.manager-claims', {
        url: '/manager-claims',
        views: {
          'main-content': {
            templateUrl: 'modules/claims/manager-claims/manager-claims.tpl.html',
            controller: 'ClaimsManagerController'
          }
        }
      });
  })

  .controller('ClaimsManagerController', function ($scope, $timeout, $state, CONFIGS, security, $modal, $translate, ngTableParams, benicompclaims, utils) {
    $scope.NgTableParams = ngTableParams;
    $scope.ids = "";
    $scope.domain = CONFIGS.baseURL() + '/benicompclaims/generateClaim?ids=';
    $scope.checkboxes = {'checked': false, items: []};
    $scope.claimsList = [];

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
          params2.embed = 'participant';
          benicompclaims.get(params2, headers, false).then(function (data) {
            params.total(data.totalCount);
            $scope.loading = false;

            $scope.claimsList = [];
            _.forEach(data.claimsList, function (item) {
              item.claimData = JSON.parse(item.claimData);
              item.createdDate = utils.dateServerToLocalTime(item.createdDate);

              $scope.claimsList.push(item);
            });

            $defer.resolve($scope.claimsList);
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

    // update status
    $scope.updateStatus = function (data) {
      var tempData = {
        id: data.id,
        status: data.status
      };
      benicompclaims.put(tempData).then(function (result) {
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
              title: "Remove Claim",
              summary: false,
              style: 'yesNo',
              message: "Do you want remove this claim ?"
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          benicompclaims.remove(claimItem.id).then(function () {
            for (var i = 0; i < $scope.claimsList.length; i++) {
              if ($scope.claimsList[i].id === claimItem.id) {
                $scope.claimsList.splice(i, 1);
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
                    message: "You had removed success"
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
                title: "Remove Claims",
                summary: false,
                style: 'yesNo',
                message: "Do you want remove the claim ?"
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            var object = {
              "Ids": listID.split(",")
            };
            benicompclaims.deleteMultiClaim(object).then(function () {

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
                      message: "You had removed success"
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
                message: "Please select claim."
              };
            }
          }
        });

      }
    };

    // view result
    $scope.viewResult = function (data) {
      $scope.modal = $modal.open({
        controller: 'ViewClaimController',
        templateUrl: 'modules/claims/view-claim/view-claim.tpl.html',
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
              title: "Download Claims",
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
            $scope.ids = "";
            $scope.checkboxes.items = [];
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
      if (data.selected) {
        $scope.checkboxes.items.push(_id);
        if ($scope.checkboxes.items.length == $scope.claimsList.length) {
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
        for (var i = 0; i < $scope.claimsList.length; i++) {
          $scope.checkboxes.items.push($scope.claimsList[i].id);
        }
      }
      else {
        $scope.checkboxes.checked = false;
      }
      angular.forEach($scope.claimsList, function (item) {
        item.selected = $scope.checkboxes.checked;
      });
    };

    $scope.$watch('checkboxes.items', function (value) {

      if (value && value.length !== 0) {
        $scope.ids = $scope.checkboxes.items.toString();

      } else {
        $scope.ids = "";
      }

      if ($scope.claimsList) {
        var total = $scope.claimsList.length;
        var checked = $scope.checkboxes.items.length;
        var unchecked = total - checked;
        // grayed checkbox
        angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
      }

    }, true);

    /********************************** END: Check all **********************************/



    // Edit
    $scope.edit = function (item) {
      $state.go('loggedIn.modules.manager-claims.edit', {id: item.id});
    };


    /*********************************** START: LABEL FORM ***********************************/
    //Define value label
    $scope.envLabelClaim = {
      isOpen: false
    };
    $scope.listLabel = [
      {id: 1, name: "entryNumberSubmitted", label: "Entry #", value: true},
      {id: 2, name: "groupName", label: "Group Name", value: false},
      {id: 3, name: "groupNumber", label: "Group #", value: false},
      {id: 4, name: "createdDate", label: "Created Date", value: true},
      {id: 5, name: "insuredFirstName", label: "Insured First Name", value: false},
      {id: 6, name: "insuredMiddleName", label: "Insured Middle Name", value: false},
      {id: 7, name: "insuredLastName", label: "Insured Last Name", value: false},
      {id: 8, name: "insuredBirthdate", label: "Insured Birthdate", value: false},
      {id: 9, name: "claimFirstName", label: "Claimant First Name", value: true},
      {id: 10, name: "claimMiddleName", label: "Claimant Middle Name", value: false},
      {id: 11, name: "claimLastName", label: "Claimant Last Name", value: true},
      {id: 12, name: "claimantBirthdate", label: "Claimant Birthdate", value: false},
      {id: 13, name: "email", label: "Email", value: false},
      {id: 14, name: "relationship", label: "Relationship", value: false},
      {id: 15, name: "ssn", label: "SSN", value: false},
      {id: 17, name: "isDownloaded", label: "Download", value: true},
      {id: 16, name: "status", label: "Status", value: true}
    ];

    /*********************************** END: LABEL FORM ***********************************/
  });
