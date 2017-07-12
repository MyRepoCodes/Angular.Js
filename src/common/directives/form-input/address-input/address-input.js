angular.module('directive.address-input', [])

.value('addressInputId', 0)

/***
 * <address-input data-form="form" data-ng-params="params" data-control-label="name" data-env="env" data-row="row" data-tabindex="tabindex" required readonly></address-input>
 * element total: 6
 * tabindex total: 1
 */
.directive('addressInput', function($timeout, STATES, utils, addressInputId) {
  return {
    restrict: 'EA',
    scope: {
      form: '=form',
      params: '=ngParams',
      env: '=env',
    },
    templateUrl: 'directives/form-input/address-input/address-input.tpl.html',
    link: function ($scope, $element, $attrs) {
      $scope.statesList = STATES.list;
      $scope.countries = STATES.countries;
      $scope.inputId = addressInputId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.controlLabel = $attrs.controlLabel;

      $scope.row = $attrs.row;
      $attrs.$observe('row', function(newVal) {
        $scope.row = newVal;
      });

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