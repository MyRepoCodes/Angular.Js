angular.module('directive.file-upload.remove-file', [])

    .directive('removeFile', function ($timeout, users, security) {
        return {
            restrict: 'AE',
            scope: {
                className: '=',
                userInfo: '='
            },
            templateUrl: 'directives/upload-file/remove-file/remove-file.tpl.html',
            controller: function ($scope, $modal, $state) {


                function removeAvatarPar(isReload) {
                    users.deleteAvatar().then(function () {
                        security.getAvatar();
                        if (isReload) {
                            $timeout(function () {
                                $state.go($state.current, {}, { reload: true });
                            }, 100);

                        }

                    }, function () {

                    });
                }

                function removeDepedent(id) {
                    if (id) {
                        users.deleteAvatarDependent(id).then(function () {

                            $timeout(function () {
                                $state.go($state.current, {}, { reload: true });
                            }, 100);

                        }, function () {

                        });
                    }

                }

                $scope.removeImage = function () {

                    $scope.modal = $modal.open({
                        controller: 'AlertController',
                        templateUrl: 'modules/alert/alert.tpl.html',
                        size: 'sm',
                        resolve: {
                            data: function () {
                                return {
                                    title: "",
                                    summary: false,
                                    style: 'yesNo',
                                    message: "Are you sure you want to delete this picture?"
                                };
                            }
                        }
                    });


                    $scope.modal.result.then(function (result) {
                        if (result === true) {

                            if ($scope.userInfo) {

                                if ($scope.userInfo.typeUser === 'Participant') {
                                    removeAvatarPar(true);
                                } else {

                                    var tmpId = "";

                                    if ($scope.userInfo.typeUser === 'Spouse' || $scope.userInfo.typeUser === 'Domestic') {
                                        tmpId = $scope.userInfo.userId;
                                    } else {
                                        tmpId = $scope.userInfo.id;
                                    }

                                    removeDepedent(tmpId, true);
                                }

                            } else {
                                removeAvatarPar(true);
                            }


                        }
                    });

                };



            },
            link: function ($scope, element, attrs) {

                // clean model
                $scope.ngModel = [];


            }
        };
    });