angular.module('app.alert.warning', [])

.controller('WarningController',
    function($scope, $modalInstance, message) {
        $scope.title = '';
        $scope.message = '';

        if(typeof message === 'string') {
            $scope.title = 'WARNING!';
            $scope.message = message;
        } else if(typeof message === 'object') {
            $scope.title = message.title;
            $scope.message = message.content;
        }

        $scope.ok = function() {
            $modalInstance.close(true);
        };

        $scope.cancel = function() {
            $modalInstance.close(false);
        };
    }
);
