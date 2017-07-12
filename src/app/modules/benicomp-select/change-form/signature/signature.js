angular.module('app.modules.benicomp-select.change-form-all.signature', [])

.controller('BcsCfStController', function ($rootScope, $scope) {
  $scope.env = {
    row: 0,
    showValid: false,
    signature: null,
  };

  $scope.continue = function(isValid) {
    $scope.env.showValid = true;
    if (isValid) {
      $scope.env.showValid = false;

      if (typeof $scope.env.signature === 'function' && !$scope.env.signature().isEmpty) {
        $scope.params.signature = $scope.env.signature().dataUrl;

        $scope.submit($scope.params);
      }
    }
  };

  $scope.previous = function() {
    $scope.env.showValid = false;
    $rootScope.$broadcast('bcs:cf:step:next', 1);
  };
});
