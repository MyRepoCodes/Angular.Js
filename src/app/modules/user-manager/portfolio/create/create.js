angular.module("app.modules.user-manager.portfolio.create", [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.portfolio.create', {
        url: '/create',
        views: {
          'manager-content@loggedIn.modules.user-manager': {
            templateUrl: 'modules/user-manager/portfolio/create/create.tpl.html',
            controller: 'UserManagerPortfolioCreateController'
          }
        }
      });
  })

  .controller('UserManagerPortfolioCreateController',
    function ($scope, $state, $translate, utils, security, portfolios) {
      $scope.row = 0;

      // Init Model
      $scope.params = {
        name: ''
      };


      // Create
      $scope.create = function (isValid) {
        $scope.showValid = true;
        if (isValid) {
          portfolios.post({
            name: $scope.params.name
          }).then(function (response) {
            $scope.showValid = false;
            $scope.error = null;
            $state.go('loggedIn.modules.user-manager.portfolio');
          }, function (err) {

          });
        }
      };

      // Cancel
      $scope.cancel = function () {
        $state.go('loggedIn.modules.user-manager.portfolio');
      };
    }
  );
