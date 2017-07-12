angular.module('app.modules.settings', [
  'app.modules.settings.participant',
  'app.modules.settings.default'
])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.settings', {
      url: '/settings',
      params:{viewSetting: null},
      views: {
        'main-content': {
          templateUrl: 'modules/settings/settings.tpl.html',
          controller: 'SettingsController',
          resolve: {
            init: function ($state, security) {
              return security.requestCurrentUser().then(function (currentUser) {
                return currentUser;
              });
            },
            questions: function ($state, security) {
              return security.allQuestions().then(function (questions) {
               return questions.data.data;
              });
            }
          }
        }
      }
    })

    .state('loggedIn.modules.settingsClientUrl', {
      url: '/:clientUrl/settings',
      views: {
        'main-content': {
          templateUrl: 'modules/settings/settings.tpl.html',
          controller: 'SettingsController',
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

.controller('SettingsController', function($scope, $state, $stateParams, $localStorage, security,questions) {
  
 $scope.$storage = $localStorage;
 $scope.$storage.one = questions.availableSecurityQuestions;
 $scope.$storage.two = questions.availableSecurityQuestions;
  $scope.cancel = function() {
    return $state.go('loggedIn.modules.dashboard');
  };
});
