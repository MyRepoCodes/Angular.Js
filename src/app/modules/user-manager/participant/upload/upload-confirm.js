angular.module('app.modules.user-manager.participant.upload-confirm', [])

    .controller('UserManagerParticipantUploadConfirmController',
    function ($scope, $modalInstance, files, type) {
        var fArray = [];
        for (var i = 0; i < files.length; i++) {
            fArray.push(files[i].name);
        }

        $scope.fileList = fArray.join(', ');

        //init text
        $scope.contentText = {
            title: "Upload Multiple Participants",
            summary: "Click below to confirm the participant upload."
        };

        if (type === 'agents') {
            $scope.contentText = {
                title: "Upload Multiple Agents",
                summary: "Click below to confirm the agents upload."
            };
        }

        else if (type === 'healthCoachs') {
            $scope.contentText = {
                title: "Upload Multiple Health Coaches",
                summary: "Click below to confirm the health coaches upload."
            };
        }

        else if (type === 'clients') {
            $scope.contentText = {
                title: "Upload Multiple Clients",
                summary: "Click below to confirm the clients upload."
            };
        }

        else if (type === 'invoice') {
            $scope.contentText = {
                title: "Upload File Invoice",
                summary: "Click below to confirm the upload."
            };
        }

        $scope.ok = function () {
            $modalInstance.close(true);
        };

        $scope.cancel = function () {
            $modalInstance.close(false);
        };
    }
    );
