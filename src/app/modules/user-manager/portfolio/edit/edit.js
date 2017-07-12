angular.module("app.modules.user-manager.portfolio.edit", [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.portfolio.edit', {
        url: '/edit/:id',
        views: {
          'manager-content@loggedIn.modules.user-manager': {
            templateUrl: 'modules/user-manager/portfolio/edit/edit.tpl.html',
            controller: 'UserManagerPortfolioEditController',
            resolve: {
              data: function ($stateParams, portfolios) {
                return portfolios.find($stateParams.id).then(function (response) {
                  return response;
                }, function () {
                  return {};
                });
              }
            }
          }
        }
      });
  })

  .controller('UserManagerPortfolioEditController',
    function ($scope, $state, $stateParams, $translate, utils, security, portfolios, data) {
      $scope.row = 0;

      // Init Model
      $scope.dataClone = angular.copy(data);
      $scope.params = {
        name: data.name
      };

      // Update
      $scope.update = function (isValid) {
        $scope.showValid = true;
        if (isValid) {
          portfolios.patch({
            id: $stateParams.id,
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
