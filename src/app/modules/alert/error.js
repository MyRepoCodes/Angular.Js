angular.module('app.alert.error', [])

.controller('ErrorController',
    function($scope, $modalInstance, message) {
        $scope.error = message;

        $scope.ok = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }
);
