angular.module('directive.participant-dependent-item', [])

.value('participantDependentItemId', 0)

/***
 * <participant-dependent-item data-form="form" data-ng-model="model" data-index="{{ $index+1 }}" data-env="env" data-tabindex="tabindex"></participant-dependent-item>
 * element total: 2
 */

.directive('participantDependentItem', function (participantDependentItemId, utils) {
  return {
    restrict: 'EA',
    require: 'ngModel',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
      elementIndex: '@index',
    },
    templateUrl: 'directives/form-input/participant-dependent-item/participant-dependent-item.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.inputId = participantDependentItemId++;
      $scope.elementIndex = parseInt($scope.elementIndex);
      $scope.prefix = 'participant_dependent_item_' + $scope.inputId + '_';

      $scope.tabindex = 0;
      if ($attrs.hasOwnProperty('tabindex')) {
        $scope.tabindex = parseInt($attrs.tabindex);
        $attrs.$observe('tabindex', function(newVal) {
          $scope.tabindex = parseInt(newVal);
        });
      }

      // Init model
      if (_.isObject($scope.ngModel[$scope.elementIndex - 1])) {
        $scope.params = $scope.ngModel[$scope.elementIndex - 1];
        $scope.params.dateOfBirth = utils.parseDateOfBirthToDatePacker($scope.params.dateOfBirth);
      } else {
        $scope.params = {
          firstName: '',
          lastName: '',
          middleName: '',
          dateOfBirth: '',
          gender: null,
        };
      }

      $scope.ngModel[$scope.elementIndex - 1] = $scope.params;
    }
  };
});