angular.module('app.modules.audit-logs.all-logs.view-logs', [])
  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.audit-logs.all-logs.view-logs', {
        url: '/view-logs',
        views: {
          'manager-content': {
            templateUrl: 'modules/audit-logs/all-logs/view-logs/view-logs.tpl.html',
            controller: 'ViewLogsController'
          }
        }
      });
  })

  .controller('ViewLogsController', function ($scope, $state, security, ngTableParams, auditLogs) {  
    
 
    // Init model
    $scope.NgTableParams = ngTableParams;
    $scope.tableParams = new $scope.NgTableParams({
      page: $scope.infoSortClient ? $scope.infoSortClient.page : 1, // show first page
      page_return: $scope.infoSortClient ? $scope.infoSortClient.page : null,
      count: $scope.infoSortClient ? $scope.infoSortClient.pageSize : 25, // count per page
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

    $scope.dateRange = {
      startDate: null,
      endDate: null
    };

    $scope.dateRangeOptions = {
      locale: {
        format: 'DD/MM/YYYY'
      },
      eventHandlers: {
        'apply.daterangepicker': function () {       
        }
      }
    };
  });