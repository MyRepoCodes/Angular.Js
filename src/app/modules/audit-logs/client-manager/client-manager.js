angular.module('app.modules.audit-logs.client-manager',[])
.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.audit-logs.client-manager', {
      url: '/client-manager',
      views: {
        'manager-content': {
          templateUrl: 'modules/audit-logs/client-manager/client-manager.tpl.html',
          controller: 'ClientLogsController'
        }
      }
    });
})

.controller('ClientLogsController',function($scope,$state,security,ngTableParams,auditLogs){  

    // Init model
    $scope.NgTableParams = ngTableParams;
    $scope.tableParams = new $scope.NgTableParams({            
    page: $scope.infoSortClient ? $scope.infoSortClient.page : 1,   // show first page
    page_return: $scope.infoSortClient ? $scope.infoSortClient.page : null,
    count: $scope.infoSortClient ? $scope.infoSortClient.pageSize : 25,  // count per page
    filter: $scope.filter
  }, {
    //counts: [], // hide page counts control
    //total: 1,  // value less than count hide pagination
    getData: function ($defer, params) {     
      function pagination() {
        var sorting = params.sorting();       
        var filter = params.filter();
        var headers = {};
        
        $scope.loading = true;  
          auditLogs.getAllAuditLogs({}, headers, false).then(function (data) {
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
});