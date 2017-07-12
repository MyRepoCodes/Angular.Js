angular.module('directive.annual-max-input', [])

.value('annualMaxInputId', 0)

/***
 * <annual-max-input data-form="form" data-ng-model="model" data-control-label="Annual Max" data-env="env" data-row="row" data-tabindex="tabindex" required readonly></annual-max-input>
 * element total: 1
 * tabindex total: 1
 */
.directive('annualMaxInput', function(utils, $timeout, annualMaxInputId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
    },
    templateUrl: 'directives/form-input/annual-max-input/annual-max-input.tpl.html',
    controller: function($scope) {
      $scope.annualMaxList = [5000, 10000, 15000, 20000, 25000, 35000, 50000, 75000, 100000, 200000];
    },
    link: function($scope, $element, $attrs) {
      $scope.inputId = annualMaxInputId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.controlLabel = $attrs.controlLabel;

      $scope.row = 'annual_max_' + $scope.inputId;
      if ($attrs.hasOwnProperty('row')) {
        $scope.row = $attrs.row;
        $attrs.$observe('row', function(newVal) {
          $scope.row = newVal;
        });
      }

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

      $timeout(function() {
        utils.resetForm($scope.form);
      });
    }
  };
});