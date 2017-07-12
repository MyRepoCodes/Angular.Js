angular.module('app.modules.claims.submit-claims', [
    'app.modules.claims.submit-claims.participant'

  ])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.submit-claims', {
        url: '/submit-claims',
        views: {
          'main-content': {
            templateUrl: 'modules/claims/submit-claims/submit-claims.tpl.html',
            controller: 'submitClaimsController'
          }
        }
      });
  })

  .controller('submitClaimsController',
    function ($scope, $state) {

      $scope.goToClaim = function () {
        $state.go('loggedIn.modules.submit-claims-participant');
      };

    }
  );
