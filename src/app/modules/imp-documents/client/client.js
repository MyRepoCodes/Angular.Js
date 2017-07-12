angular.module('app.modules.imp-documents.client', [])

.config(function($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.imp-documents.client', {
        url: '/client',
        views: {
          'manager-content': {
            templateUrl: 'modules/imp-documents/client/client.tpl.html',
            controller: 'ImpDocumentsClientController'
          }
        }
      });
  }
)

.controller('ImpDocumentsClientController', function($scope, $state, $filter, $translate, $modal, CONFIGS, utils, ngTableParams, security, documents) {
  // Check permission
  if (!security.isClientManager() && !security.isAdmin()) {
    $state.go('loggedIn.modules.imp-documents.participant');
  }
  
  $scope.employerList = [];

  // Init model
  $scope.NgTableParams = ngTableParams;

  // Filter here
  $scope.filter = {
    keyword: undefined
  };

  // Paging from api
  var history = {
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
    getData: function($defer, params) {
      function pagination() {
        var sorting = params.sorting();
        var filter = params.filter();
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

        // Filter
        if (!!filter.keyword) {
          params2.q = 'clientName=' + filter.keyword;
        }

        $scope.loading = true;
        documents.getEmployers(params2, false).then(function(data) {
            params.total(data.totalCount);
            $scope.loading = false;
            $scope.employerList = data.employerList;
            $defer.resolve($scope.employerList);
          }, function(error) {
            $scope.loading = false;
          });
      }

      params.data = [];
      pagination();
    }
  });

  // Reload current page
  $scope.reload = function() {
    $scope.tableParams.reload();
  };

  $scope.goClientDetail = function(client) {
    $state.go('loggedIn.modules.imp-documents.client.list', {id: client.userId, name: client.name});
  };
});
