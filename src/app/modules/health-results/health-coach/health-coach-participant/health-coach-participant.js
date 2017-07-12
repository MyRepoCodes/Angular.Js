angular.module('app.modules.health-results.health-coach.list-participant-assign', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.health-results.list-participant-assign', {
        url: '/client/:id',
        views: {
          'main-content@loggedIn.modules': {
            templateUrl: 'modules/health-results/health-coach/health-coach-participant/health-coach-participant.tpl.html',
            controller: 'HealthResultsHealthCoachParticipantController'
          }
        }
      });
  })

  .controller('HealthResultsHealthCoachParticipantController',
    function ($scope, $state, $translate, $filter, $modal, CONFIGS, ngTableParams, healthCoachs) {

      $scope.employerList = [];
      $scope.checkState = "";

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
            healthCoachs.employers(params2, null, false, $state.params.id).then(function (data) {
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


    }
  );
