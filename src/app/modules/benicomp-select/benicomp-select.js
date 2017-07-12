angular.module('app.modules.benicomp-select', [
  'app.modules.benicomp-select.ec',
  'app.modules.benicomp-select.direct-deposit',
  'app.modules.benicomp-select.privacy-authorization-form',
  'app.modules.benicomp-select.change-form-all',
  'app.modules.benicomp-select.change-form-participant',
  'app.modules.benicomp-select.change-form-manager',
  'app.modules.benicomp-select.direct-deposit-manager',
  'app.modules.benicomp-select.privacy-authorization-form-manager',
])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.benicomp-select', {
      url: '/benicomp-select',
      views: {
        'main-content': {
          templateUrl: 'modules/benicomp-select/benicomp-select.tpl.html',
          controller: 'BeniCompSelectController'
        }
      }
    });
})

.controller('BeniCompSelectController', function ($scope, $state) {

});
