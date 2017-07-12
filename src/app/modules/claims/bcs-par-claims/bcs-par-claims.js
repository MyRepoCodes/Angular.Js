angular.module('app.modules.claims.bcs-par-claims', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.bcs-par-claims', {
        url: '/bcs-par-claims',
        views: {
          'main-content': {
            templateUrl: 'modules/claims/bcs-par-claims/bcs-par-claims.tpl.html',
            controller: 'BCSParClaimsController'
          }
        }
      });
  })

  .controller('BCSParClaimsController',
    function ($scope, $state, $modal, CONFIGS, utils, ngTableParams, benicompclaims, security) {
      $scope.NgTableParams = ngTableParams;

      // Filter here
      $scope.filter = {
        typePage: 'ClaimsHistory',
        keyword: ""
      };


      // Paging from api
      $scope.loading = true;
      $scope.tableParams = new $scope.NgTableParams({
        page: 1,   // show first page
        count: CONFIGS.countPerPage,  // count per page
        filter: $scope.filter
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
            };

            var headers = {
              'X-Filter': JSON.stringify([
                {
                  property: 'isDeleted',
                  operator: 'equal',
                  condition: 'or',
                  value: false
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

            //params2['typePage'] = filter.typePage;

            // Filter
            if (!!filter.keyword) {
              params2.q = 'claimFirstName,claimLastName=' + filter.keyword;
              //params2.customSearch = filter.keyword;
            }


            $scope.loading = true;
            benicompclaims.getAllClaimWithTypePage(params2, headers, false).then(function (data) {
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

      $scope.changeFilter = function (key, value) {
        $scope.filter[key] = value;
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

      // Edit
      $scope.edit = function (item) {
        $state.go('loggedIn.modules.manager-claims.edit', {id: item.id});
      };

    });
