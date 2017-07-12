angular.module('directive.pv-profile', [])

  /***
   * <pv-profile data-info="params" data-current-user="'currentUser'" data-avatar="avatar" data-no-pulseid="'00'" data-type="Participant"></pv-profile>
   */
  .directive('pvProfile', function (utils, $timeout, IMAGECONFIGS) {
    return {
      restrict: 'EA',
      scope: {
        type: '=',
        info: '=',
        noPulseid: '=',
        avatar: '=',
        currentUser: '=',
        editInfo: '&'
      },
      templateUrl: 'directives/participant-view/profile/profile.tpl.html',
      controller: function ($scope, $modal, $state) {
        //init
        $scope.env = {
        };


        $scope.info['fullName'] = utils.getFullName($scope.info);
        $scope.info['typeUser'] = $scope.type;
        $scope.info['noPulseid'] = $scope.noPulseid;
        $scope.info['avatar'] = $scope.avatar;
        $scope.info['phoneNumber'] = utils.phoneNumberFormat($scope.info.phoneNumber);

        // editProfile
        $scope.editProfile = function (data) {

          var resolve = {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
              return [];
            }],

            spouseList: function ($stateParams, security) {

              return security.getListSpouseActive().then(function (response) {
                return response;
              });
            },

            DATA: function () {
              return data;
            },

            dependentList: function ($stateParams, security) {
              return security.getDependents({screenName:'Edit Participant'}).then(function (response) {
                return response;
              });
            },
          };

          $scope.modal = $modal.open({
            controller: 'BcsChangeFormEditUserController',
            templateUrl: 'modules/benicomp-select/change-form/participant/views/edit-user/edit-user.tpl.html',
            resolve: resolve
          });
          $scope.modal.result.then(function (result) {
            
          });

        };


        // delete spouse or dependent
        $scope.deleteTheDependent = function (data) {

          $scope.modal = $modal.open({
            controller: 'BcsChangeFormDeleteDependentController',
            templateUrl: 'modules/benicomp-select/change-form/participant/views/delete-dependent/delete-dependent.tpl.html',
            resolve: {
              DATA: function () {
                return data;
              }
            }
          });
          $scope.modal.result.then(function (result) {
            if (result === true) {
              //$state.go('loggedIn.modules.changeForm');
            }
          });
        };




        // Upload file
        $scope.uploadImage = {
          file: undefined,
          fileTypes: ['jpg', 'png'],
          idInput: $scope.type + "-" + $scope.noPulseid + "-id",
          idButton: $scope.type + "-" + $scope.noPulseid + "-id-button",
        };
        $scope.$watch('uploadImage.file', function () {
          if (angular.isArray($scope.uploadImage.file) && $scope.uploadImage.file.length > 0) {
            var file = $scope.uploadImage.file[$scope.uploadImage.file.length - 1];
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
                    return $scope.type;
                  }
                }
              });
              $scope.modal.result.then(function (value) {
                $scope.uploadImage.file = undefined;
                $scope.avatar = value;
                resetInputFile($scope.uploadImage.idInput);
              });

            });
          }
        }, true);

        // function reset input file
        function resetInputFile(idInput) {
          var control = angular.element('#' + idInput);
          control.replaceWith(control = control.clone(true));
        }

      },
      link: function ($scope, $element, $attrs) {


      }
    };
  });