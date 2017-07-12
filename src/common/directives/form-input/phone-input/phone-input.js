angular.module('directive.phone-input', [])

.value('phoneInputId', 0)

/***
 * <phone-input data-form="form" data-ng-model="model" is-show-full="false" data-control-label="Phone" data-env="env" data-row="row" data-tabindex="tabindex" required readonly></phone-input>
 * element total: 1
 * tabindex total: 1
 */
.directive('phoneInput', function(PATTERNREGEXS, utils, $timeout, phoneInputId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
    },
    templateUrl: 'directives/form-input/phone-input/phone-input.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.patternRegexs = PATTERNREGEXS;
      $scope.inputId = phoneInputId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.controlLabel = $attrs.controlLabel;
      $scope.isShowFull = $attrs.isShowFull ? $attrs.isShowFull : "false";

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