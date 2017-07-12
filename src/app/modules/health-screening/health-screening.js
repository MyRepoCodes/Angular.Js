angular.module('app.modules.health-screening', [
  'app.modules.health-screening.extensions',
  'app.modules.health-screening.client',
  'app.modules.health-screening.participant'
])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.health-screening', {
      url: '/health-screening',
      views: {
        'main-content': {
          templateUrl: 'modules/health-screening/health-screening.tpl.html',
          controller: 'HealthScreeningController'
        }
      }
    });
})

.controller('HealthScreeningController', function ($scope, $state) {
  $scope.ctrlClientFn = function (arg) {
    //console.log('ctrlClientFn');
  };
});
