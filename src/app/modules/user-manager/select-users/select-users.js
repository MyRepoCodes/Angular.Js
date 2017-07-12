angular.module('app.modules.user-manager.select-users', [])

.controller('UserManagerSelectUsersController',
    function($scope, $modalInstance, userList, data) {
        $scope.userList = [];
        $scope.selectedList = [];
        $scope.data = data;

        userList = angular.copy(userList);
        for(var i = 0; i < userList.length; i++) {
            userList[i].orderBy = i;
            $scope.userList.push(userList[i]);
        }

        // Selected user
        $scope.onSelected = function(user) {
            // Add selectedList
            if($scope.selectedList.indexOf(user) === -1) {
                $scope.selectedList.push(user);
            }
            // Remove userList
            for(var i = 0; i < $scope.userList.length; i++) {
                if($scope.userList[i] === user) {
                    $scope.userList.splice(i, 1);
                }
            }
        };

        // Unselected user
        $scope.onUnselected = function(user) {
            // Add userList
            if($scope.userList.indexOf(user) === -1) {
                $scope.userList.push(user);
                $scope.userList.sort(function(a, b) {
                    if(a['orderBy'] == b['orderBy']) {
                        return 0;
                    } else if(a['orderBy'] > b['orderBy']) {
                        return 1;
                    }
                    return -1;
                });
            }
            // Remove selectedList
            for(var i = 0; i < $scope.selectedList.length; i++) {
                if($scope.selectedList[i] === user) {
                    $scope.selectedList.splice(i, 1);
                }
            }
        };

        // Submit
        $scope.submit = function() {
            $scope.showValid = true;
            if($scope.selectedList.length > 0) {
                $scope.showValid = false;
                $modalInstance.close($scope.selectedList);
            }
        };

        $scope.cancel = function() {
            $modalInstance.close(false);
        };
    }
);
