angular.module('app.modules.benicomp-select.change-form-all.confirmation-page', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.change-form-confirmation-page', {
        url: '/change-form-confirmation',
        views: {
          'main-content': {
            templateUrl: 'modules/benicomp-select/change-form/confirmation-page/confirmation-page.tpl.html',
          }
        }
      });
  });
