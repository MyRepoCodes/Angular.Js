angular.module("app.modules.health-coaching.assign", [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.health-coaching.assign', {
        url: '/assign',
        views: {
          'main-content': {
            templateUrl: 'modules/health-coaching/health-coach-assign/health-coach-assign.tpl.html',
            controller: 'HealthCoachingAssignController'
          }
        }
      });
  })

  .controller('HealthCoachingAssignController',
    function ($scope, $state, $modal, CONFIGS, ngTableParams, security, utils, participants, healthCoachs, healthcoachrequests) {


    }
  );