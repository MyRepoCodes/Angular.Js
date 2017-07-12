angular.module('app.modules.accounting.invoice-manager.invoice-history', [])

  .config(function ($stateProvider) {

    var resolve = {
      SPOOLERINFO: function ($stateParams, spoolers) {
        return spoolers.find($stateParams.spoolerID).then(function (response) {
          return response;
        }, function () {
          return {};
        });
      }
    };

    $stateProvider
      .state('loggedIn.modules.invoice-history', {
        url: '/invoice-history/:spoolerID',
        views: {
          'main-content': {
            templateUrl: 'modules/accounting/invoice-manager/invoice-history/invoice-history.tpl.html',
            controller: 'InvoiceHistoryController',
            resolve: resolve
          }
        }
      });
  })

  .controller('InvoiceHistoryController',
  function ($scope, $state, CONFIGS, security, $modal, $translate, ngTableParams, SPOOLERINFO, spoolers, utils) {

    $scope.spoolerInfo = SPOOLERINFO;
    $scope.NgTableParams = ngTableParams;

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
      filter: $scope.filterSurvey,
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
            if (!!filter.answer) {
              params2.q = 'covCat,participantId,depName,claimNbr=' + filter.answer;
            }

            $scope.loading = true;
            spoolers.getWithClaims($scope.spoolerInfo.id, params2, headers, false).then(function (data) {
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
        }
      });

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.reload();
    };

    $scope.goParent = function () {
      if ($scope.isAdmin) {
        $state.go('loggedIn.modules.invoice-manager');
      }
    };


    // Open content
    $scope.openContent = function (data) {

      //set read this item
      security.setReadNotification(spoolers, angular.copy(data));


      // open modal
      $scope.modal = $modal.open({
        controller: 'PopupShowContentController',
        templateUrl: 'modules/popup/show-content/show-content.tpl.html',
        size: 'md',
        resolve: {
          DATA: function () {
            return data;
          },
          API: function () {
            return spoolers;
          },
          TYPE: function () {
            return 'contact';
          }
        }
      });
      $scope.modal.result.then(function (value) {
        $scope.reload();
      });
    };


    /*********************************** START: LABEL FORM ***********************************/
    //Define value label
    $scope.envLabelClaim = {
      isOpen: false
    };
    $scope.listLabel = [
      { id: 1, name: "claimNbr", label: "Claim Number", value: true },
      { id: 2, name: "covCat", label: "Cov Cat", value: false },
      { id: 3, name: "participantId", label: "Participant Id", value: true },
      { id: 4, name: "depName", label: "Dep Name", value: true },
      { id: 5, name: "dateOfService", label: "Date Of Service", value: true },
      { id: 6, name: "charge", label: "Charge", value: true },
      { id: 7, name: "payee", label: "Payee(s)", value: false },
      { id: 8, name: "payAmount", label: "Pay Amount", value: true }
    ];

    /*********************************** END: LABEL FORM ***********************************/

  });
