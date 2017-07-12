angular.module('directive.enrollment-level-detail-input', [])

.value('enrollmentLevelInputDetailId', 0)

/***
 * <enrollment-level-detail-input data-form="form" data-ng-model="model" data-option="option" data-control-label="Enrollment Level" data-env="env" data-row="row" data-tabindex="tabindex" required disabled></enrollment-level-detail-input>
 * element total: 1
 */
.directive('enrollmentLevelDetailInput', function($timeout, utils, enrollmentLevelInputDetailId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
      option: '=option',

    },
    templateUrl: 'directives/form-input/enrollment-level-detail-input/enrollment-level-detail-input.tpl.html',
    controller: function($scope) {
      $scope.params = {
        ngModel0: $scope.ngModel,
        ngModel1: $scope.ngModel,
        ngModel2: $scope.ngModel,
        ngModel3: $scope.ngModel,
      };
    },
    link: function($scope, $element, $attrs) {
      $scope.enrollmentLevelInputDetailId = enrollmentLevelInputDetailId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.disabled = $attrs.hasOwnProperty('disabled') && $attrs.disabled !== 'false';
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

      $timeout(function() {
        utils.resetForm($scope.form);
      });

      $scope.$watch('option', function() {
        if ($scope.option === 0 && $scope.ngModel > 4) {
          $scope.params['ngModel' + $scope.option] = 0;
        }
        if ($scope.option === 1 && $scope.ngModel > 3) {
          $scope.params['ngModel' + $scope.option] = 0;
        }
        if ($scope.option === 2 && $scope.ngModel > 2) {
          $scope.params['ngModel' + $scope.option] = 0;
        }
        if ($scope.option === 3 && $scope.ngModel > 1) {
          $scope.params['ngModel' + $scope.option] = 0;
        }
      });
      
      $scope.$watch('params', function() {
        $scope.ngModel = $scope.params['ngModel' + $scope.option];
      }, true);
    }
  };
})

/***
* <enrollment-level-detail-view data-ng-model="model" data-option="option" data-control-label="Enrollment Level"></enrollment-level-detail-view>
*/
.directive('enrollmentLevelDetailView', function() {
  return {
    restrict: 'EA',
    scope: {
      ngModel: '=ngModel',
      env: '=env',
      option: '=option',

    },
    templateUrl: 'directives/form-input/enrollment-level-detail-input/enrollment-level-detail-view.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.controlLabel = $attrs.controlLabel;
    }
  };
});