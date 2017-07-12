angular.module("app.modules.health-coach-manager", [])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.health-coach-manager', {
      url: '/health-coach-manager',
      views: {
        'main-content': {
          templateUrl: 'modules/health-coach-manager/health-coach-manager.tpl.html',
          controller: 'HealthCoachManagerController'
        }
      }
    });
})

.controller('HealthCoachManagerController', function ($scope, $state, $translate, $filter, $modal, $timeout, CONFIGS, ngTableParams, security, participants, employers) {
  // Permission
  $scope.isFullControl = function () {
    if (security.isAdmin() || security.isClientManager() || security.isAgentTheAgent()) {
      return true;
    } else { //isClinicalDirector || isHealthCoachManager
      return false;
    }
  };

  $scope.participantList = [];
  $scope.employerList = [];

  // Init model
  $scope.NgTableParams = ngTableParams;
  $scope.currEmployer = null;

  $scope.currentStatusParticipant = "active";

  // Filter here
  $scope.filter = {
    keyword: undefined,
    lastName: undefined,
    firstName: undefined,
    clientName: undefined,
    username: undefined,
    email: undefined,
    active: true,
    employerId: undefined
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
          clientId: filter.employerId,
          isDeleted: 0,// filter.active ? 0 : 1,
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
          params2.q = filter.keyword;
        }

        $scope.loading = true;
        if (!history.refresh && history.employerId === filter.employerId && history.q === params2.q && history.page === params2.page && history.pageSize === params2.pageSize && params2.sort === '') {
          $scope.loading = false;
          // use build-in angular sort
          var orderedData = params.sorting() ? $filter('orderBy')($scope.participantList, params.orderBy()) : $scope.participantList;
          $defer.resolve(orderedData);
        } else {
          history.employerId = filter.employerId;
          history.q = params2.q;
          history.page = params2.page;
          history.pageSize = params2.pageSize;
          history.refresh = false;

          participants.get(params2, undefined, false).then(function(data) {
            $scope.loading = false;

            params.total(data.totalCount);
            $scope.participantList = data.participantList;

            // use build-in angular sort
            var orderedData = params.sorting() ? $filter('orderBy')($scope.participantList, params.orderBy()) : $scope.participantList;
            $defer.resolve(orderedData);
          }, function () {
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

  // Init
  function getEmployers() {
    employers.all(undefined, false).then(function (data) {
      $scope.employerList = data.employerList;
    });
  }

  function init() {
    getEmployers();
  }

  init();
});
