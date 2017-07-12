angular.module('app.modules.user-manager.client.classes-of-eligible-employees-item', [])

.value('classesOfEligibleEmployeesItemId', 0)

/***
 * <classes-of-eligible-employees-item data-form="form" data-params="params" data-index="{{ $index+1 }}" data-env="env" data-tabindex="tabindex" readonly></classes-of-eligible-employees-item>
 * element total: 2
 * tabindex total: 1
 */

.directive('classesOfEligibleEmployeesItem', function (classesOfEligibleEmployeesItemId, BENICOMPSELECT) {
  return {
    restrict: 'EA',
    scope: {
      parentParams: '=params',
      env: '=env',
      form: '=form',
      elementIndex: '@index',
    },
    templateUrl: 'modules/user-manager/client/classes-of-eligible-employees-item/classes-of-eligible-employees-item.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.inputId = classesOfEligibleEmployeesItemId++;
      $scope.elementIndex = parseInt($scope.elementIndex);
      $scope.prefix = 'classes_of_eligible_employees_item_' + $scope.inputId + '_';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.benicompSelectConstant = BENICOMPSELECT;

      $scope.tabindex = 0;
      if ($attrs.hasOwnProperty('tabindex')) {
        $scope.tabindex = parseInt($attrs.tabindex);
        $attrs.$observe('tabindex', function(newVal) {
          $scope.tabindex = parseInt(newVal);
        });
      }

      if ($scope.readonly) {
        $attrs.$observe('readonly', function(newVal) {
          if (newVal === 'true') {
            $scope.readonly = true;
          } else if (newVal === 'false') {
            $scope.readonly = false;
          }
        });
      }

      if (!_.isArray($scope.parentParams.classesOfEligibleEmployees)) {
        $scope.parentParams.classesOfEligibleEmployees = [];
      }

      // Init model
      if (_.isObject($scope.parentParams.classesOfEligibleEmployees[$scope.elementIndex - 1])) {
        $scope.params = $scope.parentParams.classesOfEligibleEmployees[$scope.elementIndex - 1];
      } else {
        $scope.params = {
          name: '',
          currency: '',
        };
      }

      $scope.parentParams.classesOfEligibleEmployees[$scope.elementIndex - 1] = $scope.params;
    }
  };
});