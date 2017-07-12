angular.module('app.modules.user-manager.client-manager.download', [])

.config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.client-manager.download', {
        url: '/download',
        views: {
          'manager-content@loggedIn.modules.user-manager': {
            templateUrl: 'modules/user-manager/client-manager/download/download.tpl.html',
            controller: 'UserManagerClientManagerDownloadController'
          }
        }
      });
  }
)

.controller('UserManagerClientManagerDownloadController', function ($scope, $state, $filter, $modal, CONFIGS, ngTableParams, clientManagers, $translate) {
  $scope.clientManagerList = [];

  // Init model
  $scope.NgTableParams = ngTableParams;

  // Environments
  $scope.env = {
    searchFields: 'firstName,lastName',
  };

  // Filter here
  $scope.filter = {
    search: undefined,
    lastName: undefined,
    firstName: undefined,
    email: undefined
  };

  // Paging from api
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
          page: params.page(),
          pageSize: params.count()
        };

        var headers = {
          /*'X-Filter': JSON.stringify([
            {
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: (filter.status === 'active') ? false : true
            }
          ])*/
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
        if (!!filter.search) {
          params2.q = $scope.env.searchFields + '=' + filter.search;
        }

        $scope.loading = true;
        clientManagers.get(params2, headers, false).then(function (data) {
          params.total(data.totalCount);
          $scope.loading = false;
          $scope.clientManagerList = data.clientManagerList;
          $defer.resolve($scope.clientManagerList);
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

  // Download all user
  $scope.downloadUsers = function() {
    var params = _.clone($scope.filter);
    if (!!params.search) {
      params.q = $scope.env.searchFields + '=' + params.search;
    }
    delete params.search;
    clientManagers.downloadAllUserV2(params);
  };

  // Download single user
  $scope.downloadUser = function(user) {
    clientManagers.downloadUsers(user.userId);
  };
});
