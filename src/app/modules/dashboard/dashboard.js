angular.module("app.modules.dashboard", [
  'app.modules.dashboard.progress-bar',
  'app.modules.dashboard.popup',
  'app.modules.dashboard.participant',
  'app.modules.dashboard.client',
  'app.modules.dashboard.agent',
  'app.modules.dashboard.health-coach',
  'app.modules.dashboard.health-coach-manager',
  'app.modules.dashboard.client-manager',
  'app.modules.dashboard.clinical-director',
  'app.modules.dashboard.admin',
  'app.modules.dashboard.superadmin'
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.dashboard', {
        url: '/dashboard/:type',
        views: {
          'main-content': {
            templateUrl: 'modules/dashboard/dashboard.tpl.html',
            controller: 'DashboardController'
          }
        },
        resolve: {
          deps: ['uiLoad', 'JQ_CONFIG', '$ocLazyLoad',
            function (uiLoad, JQ_CONFIG, $ocLazyLoad) {
              return uiLoad.load([
                JQ_CONFIG.d3,
                JQ_CONFIG.nvD3
              ]).then(
                function () {
                  return $ocLazyLoad.load([
                    'nvd3'
                  ]);
                }
              );
            }]
        }
      })

      .state('loggedIn.modules.dashboardClientUrl', {
        url: '/:clientUrl/dashboard/:type',
        views: {
          'main-content': {
            templateUrl: 'modules/dashboard/dashboard.tpl.html',
            controller: 'DashboardController'
          }
        },
        resolve: {
          deps: ['uiLoad', 'JQ_CONFIG', '$ocLazyLoad',
            function (uiLoad, JQ_CONFIG, $ocLazyLoad) {
              return uiLoad.load([
                JQ_CONFIG.d3,
                JQ_CONFIG.nvD3
              ]).then(
                function () {
                  return $ocLazyLoad.load([
                    'nvd3'
                  ]);
                }
              );
            }]
        }
      });
  })

  .controller('DashboardController',
    function ($rootScope, $scope, $state, $timeout, security) {
      $scope.currentType = $state.params.type;

      if(!$scope.currentType){
        if($scope.isParticipantHaveBeniCompAdvantage()){
          $state.go('loggedIn.modules.dashboard', {type: 'bca'});
        }else if($scope.isParticipantHaveBeniCompSelect()){
          $state.go('loggedIn.modules.dashboard', {type: 'bcs'});
        }else {

        }
      }

      //Fix change state follow row
      if (security.isClientManager() || security.isHealthCoachManager()) {
        $state.go('loggedIn.modules.user-manager');
      }

      //Fix change state follow row
      if (security.isEmployer() || security.isHealthCoach()) {
        $state.go('loggedIn.modules.participant');
      }  
      // Fix cookie IE
      $timeout(function () {
        if (!$rootScope.isReload) {
          $state.go($state.current, {}, {reload: true});
          $rootScope.isReload = true;
        }
      }, 200);
    }
  );