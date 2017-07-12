angular.module('app.alert.upload-confirm', [])

.controller('AlertUploadConfirmController',
    function($scope, $modalInstance, data, files) {
        $scope.title = data.title;
        $scope.summary = data.summary;

        var fArray = [];
        for(var i = 0; i < files.length; i++) {
            fArray.push(files[i].name);
        }

        $scope.fileList = fArray.join(', ');

        $scope.ok = function() {
            $modalInstance.close(true);
        };

        $scope.cancel = function() {
            $modalInstance.close(false);
        };
    }
);
