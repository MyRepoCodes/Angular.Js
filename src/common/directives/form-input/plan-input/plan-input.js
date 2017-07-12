angular.module('directive.plan-input', [])

.value('planInputId', 0)

/***
 * <plan-input data-form="form" data-ng-model="plans" data-plan-option="planOption" data-control-label="Benefit Plan Options" ddata-env="env" data-row="row" data-reload="true" data-tabindex="tabindex" readonly></plan-input>
 * max element total: 12
 * tabindex total: 1
 */
.directive('planInput', function (planInputId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      planOption: '=planOption',
      env: '=env',
      reload: '@reload'
    },
    templateUrl: 'directives/form-input/plan-input/plan-input.tpl.html',
    controller: function($scope) {
      function init() {
        $scope.plans = {
          plan1: {isSelected: false, familyAmount: 0, singleAmount: 0},
          plan2: {isSelected: false, familyAmount: 0, singleAmount: 0},
          plan3: {isSelected: false, familyAmount: 0, singleAmount: 0},
          plan4: {isSelected: false, familyAmount: 0, singleAmount: 0}
        };

        _.forEach($scope.ngModel, function(value) {
          if (value.planOption === 1) {
            $scope.plans.plan1.isSelected = true;
            $scope.plans.plan1.familyAmount = value.familyAmount ? value.familyAmount : 0;
            $scope.plans.plan1.singleAmount = value.singleAmount ? value.singleAmount : 0;
          }
          if (value.planOption === 2) {
            $scope.plans.plan2.isSelected = true;
            $scope.plans.plan2.familyAmount = value.familyAmount ? value.familyAmount : 0;
            $scope.plans.plan2.singleAmount = value.singleAmount ? value.singleAmount : 0;
          }
          if (value.planOption === 4) {
            $scope.plans.plan3.isSelected = true;
            $scope.plans.plan3.familyAmount = value.familyAmount ? value.familyAmount : 0;
            $scope.plans.plan3.singleAmount = value.singleAmount ? value.singleAmount : 0;
          }
          if (value.planOption === 8) {
            $scope.plans.plan4.isSelected = true;
            $scope.plans.plan4.familyAmount = value.familyAmount ? value.familyAmount : 0;
            $scope.plans.plan4.singleAmount = value.singleAmount ? value.singleAmount : 0;
          }
        });
      }

      init();

      if ($scope.reload === "true") {
        $scope.$watch('ngModel', function(ngModel) {
          if (_.isArray(ngModel)) {
            init();
          }
        });
      }
    },
    link: function($scope, $element, $attrs) {
      $scope.inputId = planInputId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
      $scope.controlLabel = $attrs.controlLabel;

      $scope.row = 'plans_' + $scope.inputId;
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

      $scope.$watch('plans', function(newPlans) {
        // plans
        var plans = [];
        _.forEach(newPlans, function(item, key) {
          if (item.isSelected) {
            var planOption = 1;
            if (key === 'plan1') {
              planOption = 1;
            } else if (key === 'plan2') {
              planOption = 2;
            } else if (key === 'plan3') {
              planOption = 4;
            } else {
              planOption = 8;
            }
            plans.push({
              planOption: planOption,
              singleAmount: item.singleAmount ? item.singleAmount : 0,
              familyAmount: item.familyAmount ? item.familyAmount : 0
            });
          }
        });
        $scope.ngModel = plans;

        // planOption
        var planOption = null;
        if (newPlans.plan1.isSelected) {
          planOption |= 1;
        }
        if (newPlans.plan2.isSelected) {
          planOption |= 2;
        }
        if (newPlans.plan3.isSelected) {
          planOption |= 4;
        }
        if (newPlans.plan4.isSelected) {
          planOption |= 8;
        }
        $scope.planOption = planOption;
      }, true);
    }
  };
});