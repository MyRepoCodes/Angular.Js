angular.module('directive.marital-status', [])

.value('maritalStatusId', 0)

/***
 * <marital-status data-form="form" data-ng-model="model" data-control-label="arital Status" data-env="env" data-row="row" data-tabindex="tabindex" required></marital-status>
 * element total: 1
 * tabindex total: 1
 */
.directive('maritalStatus', function(maritalStatusId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env'
    },
    templateUrl: 'directives/form-input/marital-status/marital-status.tpl.html',
    controller: function($scope) {
      if (_.isNumber($scope.ngModel)) {
        $scope.ngModel = $scope.ngModel.toString();
      }
    },
    link: function($scope, $element, $attrs) {
      $scope.inputId = maritalStatusId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.controlLabel = $attrs.controlLabel;

      $scope.maritalStatusList = {
        'S': 'Single',
        'M': 'Married',
        'P': 'Domestic Partnership',
        'D': 'Divorced',
        'W': 'Widowed',
      };

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
    }
  };
});