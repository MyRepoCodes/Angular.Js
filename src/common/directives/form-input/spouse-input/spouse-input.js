angular.module('directive.spouse-input', [])

/***
 * <spouse-input data-form="form" data-participant-info="participantInfo" data-status="status" data-spouse-info="spouseInfo" data-callback="callback" data-env="env"></spouse-input>
 */
  .directive('spouseInput', function() {
    return {
      restrict: 'EA',
      scope: {
        form: '=',
        participantInfo: '=',
        status: '=',
        spouseInfo: '=',
        env: '=',
        callback: '&'
      },
      templateUrl: 'directives/form-input/spouse-input/spouse-input.tpl.html',
      controller: function($scope, $modal, $state) {
        $scope.createOrUpdateSpouse = function() {
          $scope.modal = $modal.open({
            controller: 'SpouseCreateOrUpdateController',
            templateUrl: 'modules/user-manager/spouse/createOrUpdate.tpl.html',
            size: 'md',
            resolve: {
              participantId: function() {
                return $scope.participantInfo.id;
              },
              maritalStatus: function() {
                return $scope.status;
              },
              spouseInfo: function() {
                return $scope.spouseInfo;
              }
            }
          });
          $scope.modal.result.then(function(spouseInfo) {
            if (spouseInfo) {
              $scope.spouseInfo = spouseInfo;
              $scope.callback()(spouseInfo);
            }
          });
        };



        // Open confirm
        $scope.openConfirm = function() {

          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            resolve: {
              data: function () {
                return {
                  title: '',
                  summary: false,
                  style: 'yesNo',
                  message: 'Would you like to make changes to your profile?',
                  title_button_ok: 'Proceed to Change Form',
                  title_button_cancel: 'Cancel'
                };
              }
            }
          });
          $scope.modal.result.then(function (result) {
            if (result === true) {
              $state.go('loggedIn.modules.changeForm');
            }
          });
        };
      },
      link: function($scope, $element, $attrs) {
        $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      }
    };
  });