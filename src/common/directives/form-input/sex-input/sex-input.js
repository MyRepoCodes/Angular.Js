angular.module('directive.sex-input', [])

.value('sexInputId', 0)

/***
 * <sex-input data-form="form" data-ng-model="model" data-control-label="Sex" data-env="env" data-row="row" data-tabindex="tabindex" required readonly></sex-input>
 * element total: 1
 * tabindex total: 1
 */
.directive('sexInput', function(utils, $timeout, sexInputId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
    },
    templateUrl: 'directives/form-input/sex-input/sex-input.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.inputId = sexInputId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.controlLabel = $attrs.controlLabel;

      $scope.row = 'sex_' + $scope.inputId;
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