angular.module('app.modules.server', [
  'app.modules.server.maintenance',

])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.server', {
        url: '/server',
        views: {
          'main-content': {
            templateUrl: 'modules/server/server.tpl.html',
            controller: 'ServerController'
          }
        }
      });
  })

  .controller('ServerController', function ($scope, $state, security) {
    
  });