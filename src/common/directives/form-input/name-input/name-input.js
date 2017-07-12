angular.module('directive.name-input', [])

.value('nameInputId', 0)

/***
 * <name-input data-form="form" data-ng-params="params" data-control-label="name" data-env="env" data-row="row" data-tabindex="tabindex" required readonly></name-input>
 * element total: 3
 * tabindex total: 1
 */
.directive('nameInput', function($timeout, utils, nameInputId) {
  return {
    restrict: 'EA',
    scope: {
      form: '=form',
      params: '=ngParams',
      env: '=env',
    },
    templateUrl: 'directives/form-input/name-input/name-input.tpl.html',
    link: function ($scope, $element, $attrs) {
      $scope.inputId = nameInputId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.controlLabel = $attrs.controlLabel;

      $scope.row = 'name_' + $scope.inputId;
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