angular.module('app.modules.health-results.import.confirm', [])

.controller('HealthResultsImportConfirmController', function($scope, $modalInstance, files) {
  var fArray = [];
  for (var i = 0; i < files.length; i++) {
    fArray.push(files[i].name);
  }

  $scope.fileList = fArray.join(', ');

  $scope.ok = function() {
    $modalInstance.close(true);
  };

  $scope.cancel = function() {
    $modalInstance.close(false);
  };
});
