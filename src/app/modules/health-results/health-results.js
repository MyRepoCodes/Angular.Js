angular.module('app.modules.health-results', [
  'app.modules.health-results.participant',
  'app.modules.health-results.client',
  'app.modules.health-results.admin',
  'app.modules.health-results.health-coach',
  'app.modules.health-results.coach',
  'app.modules.health-results.clinical-director',
  'app.modules.health-results.improvement-testimonial',
  'app.modules.health-results.progress-bar',
  'app.modules.health-results.import',
])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.health-results', {
      url: '/health-results',
      views: {
        'main-content': {
          templateUrl: 'modules/health-results/health-results.tpl.html',
          controller: 'HealthResultsController'
        }
      }
    });
})

.controller('HealthResultsController', function($scope, $state, security) {

});
