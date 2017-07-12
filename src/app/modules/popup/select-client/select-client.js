angular.module('app.modules.popup.select-client', [])

.controller('PopupSelectClientController',
    function($scope, $modalInstance, clientList) {
        $scope.clientList = clientList;
        $scope.select_client = $scope.clientList[0];

        // Choice user
        $scope.submit = function(user) {
            $modalInstance.close(user);
        };

        $scope.cancel = function() {
            $modalInstance.close(false);
        };
    }
);
