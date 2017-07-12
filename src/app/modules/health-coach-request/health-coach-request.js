angular.module('app.modules.health-coach-request', [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.health-coach-request', {
      url: '/health-coach-request',
      views: {
        'main-content': {
          templateUrl: 'modules/health-coach-request/health-coach-request.tpl.html',
          controller: 'HealthCoachRequestController'
        }
      }
    });
})

.controller('HealthCoachRequestController', function($scope, $state, $modal, CONFIGS, ngTableParams, security, healthCoachs, healthcoachrequests) {
  // Init model
  $scope.NgTableParams = ngTableParams;
  $scope.healthCoachRequestList = [];

  $scope.filter = {
    q: undefined
  };

  $scope.loading = true;
  $scope.tableParams = new $scope.NgTableParams({
    page: 1,   // show first page
    count: CONFIGS.countPerPage,  // count per page
    filter: $scope.filter
  }, {
    //counts: [], // hide page counts control
    //total: 0,   // value less than count hide pagination
    getData: function($defer, params) {
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
              property: "healthCoachId",
              operator: "equal",
              condition: "or",
              value: security.currentUser.id
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
        if (!!filter.q) {
          params2.q = filter.q;
        }

        $scope.loading = true;
        healthcoachrequests.get(params2, headers, false).then(function(data) {
          params.total(data.totalCount);
          $scope.loading = false;

          $scope.healthCoachRequestList = [];
          for (var i = 0; i < data.list.length; i++) {
            data.list[i].reasonForRequest = utils.getReasonForRequests(data.list[i].reasonForRequest);
            data.list[i].methodOfContact = utils.getMethodOfContacts(data.list[i].methodOfContact);

            $scope.healthCoachRequestList.push(data.list[i]);
          }

          $defer.resolve($scope.healthCoachRequestList);
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

  // Assign To
  $scope.assignTo = function() {
    $scope.modal = $modal.open({
      controller: 'PopupSelectUserController',
      templateUrl: 'modules/popup/select-user/select-user.tpl.html',
      size: 'md',
      resolve: {
        API: function() {
          return healthCoachs;
        }
      }
    });
    $scope.modal.result.then(function(reload) {
      if (reload) {
        //$scope.reload();
      }
    });
  };
});
