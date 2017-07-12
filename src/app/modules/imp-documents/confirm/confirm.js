angular.module('app.modules.imp-documents.confirm', [])

.controller('ImpDocumentsConfirmController',
    function($scope, $modalInstance, data, files, employers) {
        $scope.title = data.title;
        $scope.summary = data.summary;
        $scope.uploadedFor = null;

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

        $scope.api = employers;

    }
);