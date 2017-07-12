angular.module('directive.file-upload', [
    'directive.file-upload.remove-file'
])

    .factory('uploads', function ($http) {
        var resource = 'upload';

        var service = {
            upload: function () {

            }
        };
    })

    .directive('fileUpload', function ($timeout) {
        return {
            restrict: 'AE',
            scope: {
                ngModel: '=',
                fileTypes: '=',
                idInput: '=',
                className: '=',
                idButton: '='
            },
            templateUrl: 'directives/upload-file/upload-file.tpl.html',
            controller: function ($scope, $modal, $state) {
                //int 
                $scope.idInput = $scope.idInput;
                $scope.idButton = $scope.idButton;
            },
            link: function ($scope, element, attrs) {

                // clean model
                $scope.ngModel = [];

                // file size
                $scope.maxSize = 0;
                if (!attrs.maxSize) {
                    $scope.maxSize = 4; // Mb
                } else {
                    $scope.maxSize = parseFloat(attrs.maxSize);
                }

                // file types
                if (!$scope.fileTypes) {
                    $scope.fileTypes = ['jpg', 'png'];
                }

                $scope.max = $scope.maxSize;
                $scope.maxSize = $scope.maxSize * 1048576; // 1Mb = 1048576 byte;

                // get element
                element = element[0];

                // init event handlers
                function dragEnterLeave(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }

                // add event listener
                element.addEventListener("dragenter", dragEnterLeave, false);
                element.addEventListener("dragleave", dragEnterLeave, false);
                element.addEventListener("dragover", function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }, false);
                element.addEventListener("drop", function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    var transfers = evt.dataTransfer.files;
                    if (transfers.length > 0) {
                        var arrayFiles = [];
                        for (var i = 0; i < transfers.length; i++) {
                            var file = transfers[i];
                            if (checkFileSize(file, $scope.maxSize) && checkFileType(file, $scope.fileTypes)) {
                                arrayFiles.push(transfers[i]);
                            }
                        }
                        upload(arrayFiles);
                    }
                }, false);

                // Upload file
                function upload(arrayFiles) {
                    if (arrayFiles.length > 0) {
                        pushFile(arrayFiles[0]);

                        var newArrayFiles = [];
                        for (var fileIndex = 1; fileIndex < arrayFiles.length; fileIndex++) {
                            newArrayFiles.push(arrayFiles[fileIndex]);
                        }
                        upload(newArrayFiles);
                    }
                }

                function pushFile(file) {
                    $scope.$apply(function () {
                        if (!$scope.ngModel) {
                            $scope.ngModel = [];
                        }
                        $scope.ngModel.push(file);
                    });
                }


                // $timeout(function () {
                //     if (document.getElementById($scope.idButton) !== null) {
                //         document.getElementById($scope.idButton).addEventListener('click', function (e) {
                //             e.preventDefault();
                //             document.getElementById($scope.idInput).click();
                //         });
                //     }
                // }, 500);

               
                $scope.clickIcon = function(){
                   document.getElementById($scope.idInput).click(); 
                };

                // fn set files
                $scope.setFiles = function (element) {

                    // Turn the FileList object into an Array
                    var arrayFiles = [];
                    for (var i = 0; i < element.files.length; i++) {
                        var file = element.files[i];
                        if (checkFileSize(file, $scope.maxSize) && checkFileType(file, $scope.fileTypes)) {
                            arrayFiles.push(file);
                        }
                    }
                    upload(arrayFiles);

                    $scope.progressVisible = false;
                };

                // fn upload file
                $scope.uploadFile = function () {
                    var fd = new FormData();

                    for (var i in scope.ngModel) {
                        fd.append("uploadedFile", scope.ngModel[i]);
                    }

                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener("progress", uploadProgress, false);
                    xhr.addEventListener("load", uploadComplete, false);
                    xhr.addEventListener("error", uploadFailed, false);
                    xhr.addEventListener("abort", uploadCanceled, false);
                    xhr.open("POST", "/fileupload");

                    $scope.progressVisible = true;
                    xhr.send(fd);
                };

                // fn upload progress
                function uploadProgress(evt) {
                    $scope.$apply(function () {
                        if (evt.lengthComputable) {
                            $scope.progress = Math.round(evt.loaded * 100 / evt.total);
                        } else {
                            $scope.progress = 'Unable to compute...';
                        }
                    });
                }

                // fn upload complete
                function uploadComplete(evt) {
                    /* This event is raised when the server send back a response */
                    alert(evt.target.responseText);
                }

                // fn upload fail
                function uploadFailed(evt) {
                    alert("There was an error attempting to upload the file.");
                }

                // fn upload cancel
                function uploadCanceled(evt) {
                    $scope.$apply(function () {
                        $scope.progressVisible = false;
                    });
                    alert("The upload has been cancelled by the user or the browser dropped the connection.");
                }

                // check file size with max size
                function checkFileSize(file, maxSize) {
                    if (file.size < maxSize) {
                        return true;
                    }
                    alert('File "' + file.name + '" has size larger than ' + ($scope.maxSize / 1048576) + 'Mb. Please try with a smaller file.');
                    return false;
                }

                // check file type
                function checkFileType(file, types) {
                    for (var i = 0; i < types.length; i++) {
                        if (file.name.toLowerCase().indexOf(types[i].toLowerCase()) !== -1) {
                            return true;
                        }
                    }
                    alert('File "' + file.name + '" is not supported. Please try with a file from the supported types.');
                    return false;
                }
            }
        };
    }
    );