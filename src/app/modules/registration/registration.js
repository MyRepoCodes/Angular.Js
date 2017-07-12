angular.module('app.modules.registration', [
  'app.modules.registration.bca',
  'app.modules.registration.bcs',
])

.config(function($stateProvider) {
  var views = {
    'main-content': {
      templateUrl: 'modules/registration/registration.tpl.html',
      controller: 'RegistrationController'
    }
  };

  var resolve = {
    deps: ['$ocLazyLoad',
      function($ocLazyLoad) {
        return [];
      }]
  };

  $stateProvider
    // For Participant
    .state('loggedIn.modules.registrationClientUrl', {
      url: '/:clientUrl/registration/:type',
      views: views,
      resolve: resolve
    })

    // For Participant - Client
    .state('loggedIn.modules.registration', {
      url: '/registration/:type',
      views: views,
      resolve: resolve
    });
})

.controller('RegistrationController', function($scope, $state) {

  $scope.currentType = $state.params.type;
  
});
