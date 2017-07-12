angular.module('app.sidebar', [
  'app.sidebar.item'
])

  .controller('SidebarController', function ($rootScope, $scope, $state, $modal, $stateParams, $translate, IMAGECONFIGS, users, REGISTRATION_STATUS, utils, security) {
    // Available For Participant
    if ($stateParams.clientUrl) {
      $scope.clientUrl = $stateParams.clientUrl;
    } else {
      $scope.clientUrl = false;
    }





    $scope.goDashboard = function (type) {
      if (security.isParticipant() && $stateParams.clientUrl) {
        $state.go('loggedIn.modules.dashboardClientUrl', { clientUrl: $stateParams.clientUrl, type: type });
      } else {
        $state.go('loggedIn.modules.dashboard', { type: type });
      }
    };

    $scope.goRegistration = function (isMobile, type) {

      if (!!isMobile) {
        $state.go('loggedIn.modules.registration', { type: type });
      } else if (security.isParticipant() && $stateParams.clientUrl) {
        $state.go('loggedIn.modules.registrationClientUrl', { clientUrl: $stateParams.clientUrl, type: type });
      } else {
        $state.go('loggedIn.modules.registration', { type: type });
      }
    };

    $scope.goImpDocuments = function () {
      if (security.isParticipant() && $stateParams.clientUrl) {
        $state.go('loggedIn.modules.imp-documentsClientUrl', { clientUrl: $stateParams.clientUrl });
      } else {
        if (security.isAdmin()) {
          $state.go('loggedIn.modules.imp-documents.client');
        } else {
          $state.go('loggedIn.modules.imp-documents');
        }

      }
    };

    $scope.goProfile = function () {
      if (security.isParticipant() && $stateParams.clientUrl) {
        $state.go('loggedIn.modules.profileClientUrl', { clientUrl: $stateParams.clientUrl });
      } else {
        $state.go('loggedIn.modules.profile');
      }
    };

    // Upload file
    $scope.uploadParams = {
      file: undefined,
      fileTypes: ['jpg', 'png'],
      idInput: "sidebar-main-id",
      idButton: "sidebar-main-button",
    };
    $scope.$watch('uploadParams.file', function () {
      if (angular.isArray($scope.uploadParams.file) && $scope.uploadParams.file.length > 0) {
        var file = $scope.uploadParams.file[$scope.uploadParams.file.length - 1];
        utils.resizeImage(file, IMAGECONFIGS.avatar.maxWidth, IMAGECONFIGS.avatar.maxHeight).then(function (file) {
          $scope.modal = $modal.open({
            controller: 'SidebarAvatarController',
            templateUrl: 'modules/sidebar/sidebar-avatar.tpl.html',
            size: 'lg',
            resolve: {
              deps: ['$ocLazyLoad',
                function ($ocLazyLoad) {
                  return $ocLazyLoad.load('ngImgCrop');
                }],
              scope: function () {
                return $scope;
              },
              file: function () {
                return file;
              },
              TYPE: function () {
                return "Participant";
              }
            }
          });
          $scope.modal.result.then(function (value) {
            $scope.uploadParams.file = undefined;
            resetInputFile($scope.uploadParams.idInput);
          });

        });
      }
    }, true);

    // Avatar
    $scope.avatar = security.avatar;
    $scope.$on('security:avatar:update', function () {
      $scope.avatar = security.avatar;
    });

    // Brand
    $scope.brand = security.brand;
    $scope.$on('security:brand:updated', function () {
      $scope.brand = security.brand;
    });


    // Count contact
    $scope.countContact = 0;
    if (security.countContactUnread) {
      $scope.countContact = security.countContactUnread;
    }
    $scope.$on('contact:countunread', function (event, response) {
      $scope.countContact = response;
    });

    // For all notifications
    var tmpAllNotifications = {
      "total": 0,
      "countContact": 0,
      "countSurvey": 0,
      "countObjectChangeForm": 0,
      "countDirectDeposit": 0,
      "countPrivacyAuthorizationForm": 0
    };

    $scope.allNotifications = security.allNotification ? security.allNotification : tmpAllNotifications;
    $rootScope.$on('getAllNotifications:updated', function (event, data) {
      $scope.allNotifications = data;

      //Fix not two way binding
      if (data.total) {
        angular.element(".count-notif-total").css("display", "block");
        if (angular.element(".count-notif-total") && angular.element(".count-notif-total")[0]) {
          angular.element(".count-notif-total")[0].innerHTML = data.total;
        }
      } else {
        angular.element(".count-notif-total").css("display", "none");
      }



    });

    // Notification
    $scope.badgeNotif = null;
    $scope.badgeMessage = '';

    function setNotification(notificationList) {
      var total = 0;
      var message = [];
      for (var i = 0; i < notificationList.length; i++) {
        total += notificationList[i].documents.length;
        if (security.isParticipant()) {
          message.push(notificationList[i].uploadedBy + ' uploaded ' + notificationList[i].documents.length + ' documents.');
        } else {
          message.push(notificationList[i].uploadedBy + ' uploaded ' + notificationList[i].documents.length + ' documents for ' + notificationList[i].uploadedFor);
        }
      }

      //PD-1589
      // --------- START: PLEASE DON'T REMOVE IT ---------//
      //$scope.badgeNotif = (total > 0 ? total : null);
      //$scope.badgeMessage = message.join('<br>');
      $scope.badgeNotif = null;
      $scope.badgeMessage = '';

      // --------- END: PLEASE DON'T REMOVE IT ---------//


    }

    if (security.notifications) {
      setNotification(security.notifications);
    }

    $scope.$on('documents:notifications', function (event, response) {
      //setNotification(response);

      //pinesNotifications.notify({
      //    title: false,
      //    text: $scope.badgeMessage,
      //    hide: false,
      //    closer: false,
      //    sticker: false,
      //    type: 'info'
      //});
    });

    $scope.$on('documents:notifications:removed', function () {
      $scope.badgeNotif = null;
      $scope.badgeMessage = '';
    });

    // function reset input file
    function resetInputFile(idInput) {
      var control = angular.element('#' + idInput);
      control.replaceWith(control = control.clone(true));
    }

  })

  .controller('SidebarAvatarController', function ($scope, $timeout, $modalInstance, utils, IMAGECONFIGS, security, users, scope, file, TYPE) {

    $scope.myImage = '';
    $scope.myCroppedImage = '';
    $scope.fileImage = file;
    $scope.TYPE = TYPE ? TYPE : "";

    // Upload file
    $scope.uploadParams = {
      file: undefined,
      fileTypes: ['jpg', 'png'],
      idInput: "sidebar-id",
      idButton: "sidebar-id-button",
    };


    $scope.$watch('uploadParams.file', function () {
      if (angular.isArray($scope.uploadParams.file) && $scope.uploadParams.file.length > 0) {
        var file = $scope.uploadParams.file[$scope.uploadParams.file.length - 1];


        utils.resizeImage(file, IMAGECONFIGS.avatar.maxWidth, IMAGECONFIGS.avatar.maxHeight).then(function (file) {
          $scope.convertFile(file);
        });
      }
    }, true);

    $scope.convertFile = function (file) {

      $scope.fileImage = file;

      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function ($scope) {
          $scope.myImage = evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
    $timeout(function () {
      $scope.convertFile(file);
    }, 200);


    function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1]);
      }
      else {
        byteString = unescape(dataURI.split(',')[1]);
      }


      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], { type: mimeString });
    }


    // Submit
    $scope.submit = function (value) {
      var result = "";
      var blob = dataURItoBlob(value);
      var fd = new FormData();
      fd.append('file', blob);

      if ($scope.TYPE === 'Spouse' || $scope.TYPE === 'Domestic') {
        users.uploadImageForUser(scope.info.userId, fd)
          .then(function (data) {
            result = data;

            $scope.uploadParams.file = undefined;
            resetInputFile($scope.uploadParams.idInput);
            $scope.uploadSuccess(result);
          });
      }


      if ($scope.TYPE === 'Child') {
        users.uploadImageForUser(scope.info.id, fd)
          .then(function (data) {
            result = data;

            $scope.uploadParams.file = undefined;
            resetInputFile($scope.uploadParams.idInput);
            $scope.uploadSuccess(result);
          });
      }

      if ($scope.TYPE === 'Participant') {
        result = security.uploadAvatar(fd);

        $scope.uploadParams.file = undefined;
        resetInputFile($scope.uploadParams.idInput);
        $scope.uploadSuccess(result);
      }



    };

    $scope.cancel = function () {
      $modalInstance.close(false);
      resetInputFile($scope.uploadParams.idInput);
    };
    $scope.uploadSuccess = function (data) {
      $modalInstance.close(data);
      resetInputFile($scope.uploadParams.idInput);
    };

    // function reset input file
    function resetInputFile(idInput) {
      var control = angular.element('#' + idInput);
      control.replaceWith(control = control.clone(true));
    }
  })

  .controller('SidebarParticipantController', function ($scope, security) {
    $scope.hasRegistrationDisable = true;

    security.checkBenefitYearBcsDisable().then(function (response) {
      $scope.hasRegistrationDisable = response;
    });
  });
