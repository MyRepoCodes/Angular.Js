angular.module('app.modules.health-results.admin', [
  'app.modules.health-results.admin.list',
])

  .controller('HealthResultsAdminController', function ($scope, $state) {
    $scope.env = {
      currentPage: 0
    };

    $scope.setCurrentPage = function (currentPage) {
      $scope.env['currentPage'] = currentPage;

      if (currentPage === 1) {
        $state.go('loggedIn.modules.health-results.import');
      }

      if (currentPage === 0) {
        $state.go('loggedIn.modules.health-results.list');
      }
    };

    //init()
    $scope.setCurrentPage(0);

  });
