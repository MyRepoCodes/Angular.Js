angular.module('app.modules.health-results.client', [])

  .controller('HealthResultsClientController',
    function ($scope, $state, $translate, $filter, $modal, CONFIGS, utils, ngTableParams, healthresultreports) {

      $scope.listData = [];

      // Init model
      $scope.NgTableParams = ngTableParams;

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
            var params2 = {
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


            $scope.loading = true;
            healthresultreports.get(null, null, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.listData = utils.convertHealthResultReport(data.listData);
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

    }
  );
