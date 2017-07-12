angular.module("app.modules.health-coaching.list", [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.health-coaching.list', {
        url: '/list',
        views: {
          'manager-content': {
            templateUrl: 'modules/health-coaching/health-coach-list/health-coach-list.tpl.html',
            controller: 'HealthCoachingListController'
          }
        }
      });
  })

  .controller('HealthCoachingListController',
    function ($scope, $state, $modal, CONFIGS, ngTableParams, $filter, security, utils, participants, healthCoachs) {

      // Permission
      $scope.isFullControl = function () {
        if (security.isHealthCoachManager()) {
          return true;
        } else {
          return false;
        }
      };

      // Init model
      $scope.NgTableParams = ngTableParams;
      $scope.participantList = [];

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
        getData: function ($defer, params) {
          function pagination() {
            var sorting = params.sorting();
            var filter = params.filter();
            var params2 = {
              page: params.page(),
              pageSize: params.count(),
              embed: 'HealthCoach'
            };
            var headers = {};

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
              //params2.q = 'firstName,lastName,username,clientName=' + filter.keyword;
              params2.q = filter.keyword;
            }

            $scope.loading = true;
            participants.getallhaveHealthResult(params2, headers, false).then(function (data) {

              params.total(data.totalCount);
              $scope.loading = false;
              $scope.participantList = [];
              for (var i = 0; i < data.participantList.length; i++) {
                data.participantList[i].clientName = $scope.currEmployer ? $scope.currEmployer.clientName : "";
                $scope.participantList.push(data.participantList[i]);
              }
              // use build-in angular sort
              var orderedData = params.sorting() ? $filter('orderBy')($scope.participantList, params.orderBy()) : $scope.participantList;
              $defer.resolve(orderedData);

              $defer.resolve($scope.healthCoachRequestList);
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

     

      $scope.assignTo = function (request) {
        $scope.modal = $modal.open({
          controller: 'PopupSelectUserController',
          templateUrl: 'modules/popup/select-user/select-user.tpl.html',
          size: 'md',
          resolve: {
            API: function () {
              return healthCoachs;
            }
          }
        });
        $scope.modal.result.then(function (userInfo) {
          if (userInfo) {
            assignTo(request, userInfo);
          }
        });
      };

    }
  );