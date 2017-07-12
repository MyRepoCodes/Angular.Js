angular.module('app.modules.audit-logs.all-logs.popup-log', [])
  .controller('PopupLog', function ($rootScope, $scope, $modalStack, $modalInstance, data) {

    $scope.try = function () {
      var ele = angular.element(document.getElementsByClassName("modal-dialog")).css({
        'top': $scope.tableCSS.top,
        'left': $scope.tableCSS.left,
        'position': $scope.tableCSS.position
      });
    };

    $rootScope.$on('$locationChangeStart', function ($event) {
      $modalInstance.close();
    });

    $scope.cancel = function () {
      $modalInstance.close(true);
    };
  });