angular.module("app.modules.health-coaching", [
    'app.modules.health-coaching.list',
    'app.modules.health-coaching.assign'
  ])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.health-coaching', {
        url: '/health-coaching',
        views: {
          'main-content': {
            templateUrl: 'modules/health-coaching/health-coaching.tpl.html',
            controller: 'HealthCoachingController'
          }
        }
      });
  })

  .controller('HealthCoachingController',
    function ($scope, $state, security) {

      if (security.isHealthCoachManager()) {
        $scope.currentState = 'loggedIn.modules.health-coaching.list';

      } else if (security.isHealthCoach()) {
        $scope.currentState = 'loggedIn.modules.health-coaching.list';

      }
      $state.go($scope.currentState);

    }
  );