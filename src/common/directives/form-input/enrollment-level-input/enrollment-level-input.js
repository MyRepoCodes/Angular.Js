angular.module('directive.enrollment-level-input', [])

.value('enrollmentLevelInputId', 0)

/***
 * <enrollment-level-input data-form="form" data-ng-model="model" data-control-label="Enrollment Level Options" data-env="env" data-row="row" data-tabindex="tabindex" required readonly></enrollment-level-input>
 * element total: 1
 * tabindex total: 1
 */
.directive('enrollmentLevelInput', function(PATTERNREGEXS, utils, $timeout, enrollmentLevelInputId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
    },
    templateUrl: 'directives/form-input/enrollment-level-input/enrollment-level-input.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.patternRegexs = PATTERNREGEXS;
      $scope.inputId = enrollmentLevelInputId++;
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