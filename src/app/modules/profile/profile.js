angular.module('app.modules.profile', [
  'app.modules.profile.default',
  'app.modules.profile.spouse',
  'app.modules.profile.participant',
])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.profile', {
      url: '/profile',
      params:{viewProfile: null},
      views: {
        'main-content': {
          templateUrl: 'modules/profile/profile.tpl.html',
          controller: 'ProfileController',
          resolve: {
            init: function($state, security) {
              return security.requestCurrentUser().then(function(currentUser) {
                return currentUser;
              });
            }
          }
        }
      }
    })

    .state('loggedIn.modules.profileClientUrl', {
      url: '/:clientUrl/profile',
      views: {
        'main-content': {
          templateUrl: 'modules/profile/profile.tpl.html',
          controller: 'ProfileController',
          resolve: {
            init: function($state, security) {
              return security.requestCurrentUser().then(function(currentUser) {
                return currentUser;
              });
            }
          }
        }
      }
    });
})

.controller('ProfileController', function($scope, $state, $stateParams, security) {
  if (security.isParticipant() && $stateParams.clientUrl) {
    $state.go('loggedIn.modules.profileClientUrl', {clientUrl: $stateParams.clientUrl});
  }

  $scope.cancel = function() {
    return $state.go('loggedIn.modules.dashboard');
  };
});
