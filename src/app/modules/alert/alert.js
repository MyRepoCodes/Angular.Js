angular.module('app.alert', [
  'app.alert.error',
  'app.alert.warning',
  'app.alert.upload-confirm',
  'app.alert.termination-date',
])

.controller('AlertController', function($scope, $modalInstance, data) {
  $scope.title = data.title;
  $scope.summary = data.summary;
  $scope.message = data.message;
  $scope.style = data.style;
  $scope.style = data.style;
  $scope.title_button_ok = data.title_button_ok ? data.title_button_ok : "Yes";
  $scope.title_button_cancel = data.title_button_cancel ? data.title_button_cancel : "No";

  $scope.ok = function() {
    $modalInstance.close(true);
  };

  $scope.cancel = function() {
    $modalInstance.close(false);
  };
});
