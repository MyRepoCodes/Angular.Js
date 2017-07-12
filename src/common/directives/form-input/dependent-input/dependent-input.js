angular.module('directive.dependent-input', [])

/***
 * <dependent-input data-form="form" data-participant-info="participantInfo" data-dependent-List="dependentList" data-callback="callback" data-env="env"></dependent-input>
 */
.directive('dependentInput', function() {
  return {
    restrict: 'EA',
    scope: {
      form: '=',
      participantInfo: '=',
      dependentList: '=',
      env: '=',
      callback: '&'
    },
    templateUrl: 'directives/form-input/dependent-input/dependent-input.tpl.html',
    controller: function($scope, $modal, $state, dependents) {
      $scope.scopeParent = $scope.$parent;
      $scope.createOrUpdateDependent = function() {
        $scope.modal = $modal.open({
          controller: 'ManageDependentController',
          templateUrl: 'modules/user-manager/dependent/manage-dependent/manage-dependent.tpl.html',
          size: 'md',
          resolve: {
            participantInfo: function() {
              return $scope.participantInfo;
            }
          }
        });
        $scope.modal.result.then(function(dependentList) {
          $scope.dependentList = dependentList;
          $scope.callback()(dependentList);
        }, function() {
          dependents.getByParticipantId($scope.participantId).then(function(dependentList) {
            $scope.dependentList = dependentList;
            $scope.callback()(dependentList);
          });
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