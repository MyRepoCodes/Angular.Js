angular.module('app.modules.health-results.health-coach', [
    'app.modules.health-results.health-coach.list-participant-assign'
  ])

  .controller('HealthResultsHealthCoachController',
    function ($scope, $state, $translate, $filter, $modal, CONFIGS, ngTableParams, healthCoachs) {

      $scope.employerList = [];

      // Init model
      $scope.NgTableParams = ngTableParams;

      // Filter here
      $scope.filter = {
        keyword: undefined,
        lastName: undefined,
        firstName: undefined,
        status: "active",
        email: undefined
      };

      // Paging from api
      var history = {
        employerId: null,
        q: null,
        page: null,
        pageSize: null,
        refresh: false
      };
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
            healthCoachs.employers(params2, null, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.employerList = data.employerList;
              $defer.resolve($scope.employerList);
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


      // Function view heath Result
      /*$scope.viewHeathResult = function (item) {
        $state.go('loggedIn.modules.health-results.list-participant-assign', {id: item.employerId});
      };*/

      $scope.viewHeathResult = function (item) {
        $state.go('public.healthresultadmin', {IdClient: item.employerId});
      };
    }
  );
