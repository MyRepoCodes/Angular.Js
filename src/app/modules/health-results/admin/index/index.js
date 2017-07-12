angular.module('app.modules.health-results.admin.list', [])

  .config(function ($stateProvider) {
      $stateProvider
        .state('loggedIn.modules.health-results.list', {
          url: '/list',
          views: {
            'manager-content': {
              templateUrl: 'modules/health-results/admin/index/index.tpl.html',
              controller: 'HealthResultsAdminIndexController'
            }
          }
        });
    }
  )

  .controller('HealthResultsAdminIndexController', function ($scope, $state, $translate, $filter, $modal, CONFIGS, ngTableParams, employers) {

    $scope.employerList = [];

    // Init model
    $scope.NgTableParams = ngTableParams;

    //update view on parent
    $scope.$parent.env.currentPage = 0;

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
          var filter = params.filter();
          var params2 = {
            fields: 'id,clientName,firstName,lastName,email,totalHealthResult',
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
            params2.q = 'firstName,lastName,clientName=' + filter.keyword;
          }

          $scope.loading = true;
          if (!history.refresh && history.q === params2.q && history.page === params2.page && history.pageSize === params2.pageSize && params2.sort === '') {
            $scope.loading = false;
            // use build-in angular sort
            var orderedData = params.sorting() ? $filter('orderBy')($scope.employerList, params.orderBy()) : $scope.employerList;
            $defer.resolve(orderedData);
          } else {
            history.q = params2.q;
            history.page = params2.page;
            history.pageSize = params2.pageSize;
            history.refresh = false;

            employers.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.employerList = data.employerList;
              $defer.resolve($scope.employerList);
            }, function (error) {
              $scope.loading = false;
            });
          }
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
    $scope.viewHeathResult = function (item) {
      $state.go('public.healthresultadmin', {IdClient: item.id});
    };
  });
