angular.module('app.alert.termination-date', [])

.controller('TerminationDateController', function($scope, $modalInstance) {
  $scope.env = {
    row: 0,
    showValid: false,
  };

  $scope.params = {
    terminationDate: null,
  };

  // Return Termination Date
  $scope.save = function(isValid) {
    $scope.env.showValid = true;
    $scope.env.row = 0;
    if (isValid) {
      $modalInstance.close($scope.params.terminationDate);
    }
  };

  $scope.cancel = function() {
    $modalInstance.close(false);
  };
});
