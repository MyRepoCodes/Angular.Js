angular.module('directive.bca-benefit-year-input', [])

.value('bcaBenefitYearInputId', 0)

/***
 * <bca-benefit-year-input data-form="form" data-ng-model="model" data-env="env" data-row="row" data-tabindex="tabindex"></bca-benefit-year-input>
 * element total: 4
 * tabindex total: 1
 *
 * $scope.bcaBYModel = {
*   list: {
*     data: [],
*   },
*   compare: {
*     data: [],
*   },
*   newItem: [],
*   updateItem: [],
*   errorList: [],
* };
 */
.directive('bcaBenefitYearInput', function($timeout, utils, incentives, bcaBenefitYearInputId, incentiveChangeTargetOption, COMPARE) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
    },
    templateUrl: 'directives/form-input/bca-benefit-year-input/bca-benefit-year-input.tpl.html',
    controller: function($scope) {
      // Int model
      $scope.params = null;
      $scope.errors = {
        startDate: false,
        endDate: false,
        registerStartDate: false,
        registerEndDate: false,
      };
      $scope.clientIncentivesTargets = COMPARE.clientIncentivesTargets;

      $scope.getLabel = function(by) {
        if (by && by.startDate && by.endDate) {
          var startDate = utils.dateServerToLocalTime(by.startDate);
          var endDate = utils.dateServerToLocalTime(by.endDate);
          return new Date(startDate).format('mm/dd/yyyy') + ' - ' + new Date(endDate).format('mm/dd/yyyy');
        }

        return 'Add Benefit Year';
      };

      $scope.isEmpty = function(by) {
        if (_.isEmpty(by) || !by.startDate || !by.hasOwnProperty('startDate')) {
          return true;
        }

        return false;
      };

      // Change Current
      $scope.changeParams = function(by) {
        if ($scope.isEmpty(by)) {
          by = {
            startDate: new Date(new Date().getFullYear() + 1, 0, 1),
            endDate: new Date(new Date().getFullYear() + 1, 11, 31),
            registerStartDate: new Date(new Date().getFullYear() + 1, 0, 1),
            registerEndDate: new Date(new Date().getFullYear() + 1, 0, 15),
            plans: {},
            targetsOption: 0,
            bodyMassIndexReward: {goal: 24.9, singleAmount: 400, familyAmount: 800, typesTime: 1},
            bloodSugarReward: {goal: 100, singleAmount: 400, familyAmount: 800, typesTime: 1},
            nicotinUseReward: {goal: 'No', singleAmount: 400, familyAmount: 800, typesTime: 1},
            healthCoachingReward: {goal: 'Yes', singleAmount: 400, familyAmount: 800, typesTime: 1},
            bloodPressureReward: {systolicGoal: 120, diastolicGoal: 80, singleAmount: 400, familyAmount: 800, typesTime: 1},
            ldlCholesterolReward: {goal: 100, singleAmount: 400, familyAmount: 800, typesTime: 1},
            participationReward: {goal: 'Yes', singleAmount: 400, familyAmount: 800, typesTime: 1},
            healthRiskAssessmentReward: {goal: 'Yes', singleAmount: 400, familyAmount: 800, typesTime: 1},
            a1cReward: {goal: 5.7, singleAmount: 400, familyAmount: 800, typesTime: 1},
            waistCircumferenceReward: {goalMale: 40, goalFemale: 35, singleAmount: 400, familyAmount: 800, typesTime: 1},
          };

          var firstItem = $scope.ngModel.list.data[0];
          if (firstItem && firstItem.hasOwnProperty('startDate')) {
            by.startDate = utils.getFirstDayOfYear(firstItem.endDate.getFullYear() + 1);
            by.endDate = utils.getLastDayOfYear(firstItem.endDate.getFullYear() + 1);
            by.registerStartDate = utils.getFirstDayOfRegister(firstItem.endDate.getFullYear() + 1);
            by.registerEndDate = utils.getLastDayOfRegister(firstItem.endDate.getFullYear() + 1);
          }

          $scope.ngModel.list.data[$scope.ngModel.list.data.length - 1] = by;
          $scope.params = $scope.ngModel.list.data[$scope.ngModel.list.data.length - 1];
          $scope.params.hasError = false;

          $scope.ngModel.list.data.push({});
        } else {
          $scope.params = by;
        }

        utils.resetForm($scope.form);
      };

      // Remove by form list
      $scope.removeBY = function(by) {
        function removeBY(by) {
          var pos = $scope.ngModel.list.data.indexOf(by);
          $scope.ngModel.list.data.splice(pos, 1);
          if ($scope.params == by) {
            if ($scope.ngModel.list.data.length > 1) {
              $scope.changeParams($scope.ngModel.list.data[0]);
            } else {
              $scope.params = null;
              $scope.ngModel.list.data = [];
            }
          }
        }

        if (by.id) {
          incentives.remove(by.id).then(function() {
            removeBY(by);
          }, function(error) {

          });
        } else {
          removeBY(by);
        }
      };

      $scope.addBY = function() {
        $scope.ngModel.list.data.push({});
        $scope.changeParams({});
      };

      // Change Targets Option
      $scope.changeTargetsOption = function(value) {
        incentiveChangeTargetOption($scope.params, value);
      };

      // Check validate
      function validate(by) {
        var isValid = true;

        if (!utils.isDate(by.startDate)) {
          isValid = false;
          $scope.errors.startDate = true;
        }
        if (!utils.isDate(by.endDate)) {
          isValid = false;
          $scope.errors.endDate = true;
        }
        if (new Date(by.startDate) >= new Date(by.endDate)) {
          isValid = false;
          $scope.errors.endDate = true;
        }

        if (!utils.isDate(by.registerStartDate)) {
          isValid = false;
          $scope.errors.registerStartDate = true;
        }
        if (!utils.isDate(by.registerEndDate)) {
          isValid = false;
          $scope.errors.registerEndDate = true;
        }
        if (new Date(by.registerStartDate) >= new Date(by.registerEndDate)) {
          isValid = false;
          $scope.errors.registerEndDate = true;
        }

        if (isValid) {
          by.hasError = false;
        } else {
          by.hasError = true;
        }

        // Check Duplicate
        if (!by.hasError) {
          _.forEach($scope.ngModel.list.data, function(item) {
            if (by != item && !$scope.isEmpty(item)) {
              var t = new Date(by.startDate.format('yyyy-mm-dd')).getTime();
              var s = new Date(item.startDate.format('yyyy-mm-dd')).getTime();
              var e = new Date(item.endDate.format('yyyy-mm-dd')).getTime();
              if (s <= t && t <= e) {
                by.hasError = true;
                isValid = false;
                $scope.errors.startDate = true;
              }
            }
          });
        }

        return isValid;
      }

      function isModify(item) {
        var by = _.find($scope.ngModel.compare.data, function(it) {
          return it.id == item.id;
        });

        function isPlanModify(a, b) {
          if (_.isEmpty(a) && _.isEmpty(b)) {
            return false;
          }

          return !_.isEqual(a, b);
        }

        if (by) {
          var bodyMassIndex = (by.clientIncentive & 1) === 1;
          var bloodSugar = (by.clientIncentive & 2) === 2;
          var nicotinUse = (by.clientIncentive & 4) === 4;
          var healthCoaching = (by.clientIncentive & 8) === 8;
          var bloodPressure = (by.clientIncentive & 16) === 16;
          var ldlCholesterol = (by.clientIncentive & 32) === 32;
          var participation = (by.clientIncentive & 64) === 64;
          var healthRiskAssessment = (by.clientIncentive & 128) === 128;
          var a1c = (by.clientIncentive & 256) === 256;
          var waistCircumference = (by.clientIncentive & 512) === 512;

          return (utils.dateToShort(by.startDate) != utils.dateToShort(item.startDate) ||
          utils.dateToShort(by.endDate) != utils.dateToShort(item.endDate) ||
          utils.dateToShort(by.registerStartDate) != utils.dateToShort(item.registerStartDate) ||
          utils.dateToShort(by.registerEndDate) != utils.dateToShort(item.registerEndDate) ||
          isPlanModify(by.plans, item.plans) ||
          by.planOption != item.planOption ||
          by.targetsOption != item.targetsOption ||
          by.clientIncentive != item.clientIncentive ||
          (a1c && !_.isEqual(by.a1cReward, item.a1cReward)) ||
          (bloodPressure && !_.isEqual(by.bloodPressureReward, item.bloodPressureReward)) ||
          (bloodSugar && !_.isEqual(by.bloodSugarReward, item.bloodSugarReward)) ||
          (bodyMassIndex && !_.isEqual(by.bodyMassIndexReward, item.bodyMassIndexReward)) ||
          (healthCoaching && !_.isEqual(by.healthCoachingReward, item.healthCoachingReward)) ||
          (healthRiskAssessment && !_.isEqual(by.healthRiskAssessmentReward, item.healthRiskAssessmentReward)) ||
          (ldlCholesterol && !_.isEqual(by.ldlCholesterolReward, item.ldlCholesterolReward)) ||
          (nicotinUse && !_.isEqual(by.nicotinUseReward, item.nicotinUseReward)) ||
          (participation && !_.isEqual(by.participationReward, item.participationReward)) ||
          (waistCircumference && !_.isEqual(by.waistCircumferenceReward, item.waistCircumferenceReward)));
        }

        return false;
      }

      // Reset Environments
      function resetEnvironments() {
        $scope.errors.startDate = false;
        $scope.errors.endDate = false;
        $scope.errors.registerStartDate = false;
        $scope.errors.registerEndDate = false;
      }

      // Resort
      function sortList() {
        $scope.ngModel.list.data = utils.sortIncentiveList($scope.ngModel.list.data);
      }

      $scope.$watch('params.startDate', function() {
        sortList();
      });

      $scope.$watch('params', function() {
        resetEnvironments();
        if (!!$scope.params) {
          validate($scope.params);
        }
      }, true);

      $scope.$watch('ngModel.list', function() {
        var newItem = [];
        var updateItem = [];
        var errorList = [];
        _.forEach($scope.ngModel.list.data, function(by) {
          if (!$scope.isEmpty(by)) {
            var item = angular.copy(by);

            /*if (item.nicotinUseReward.goal === 'No') {
              item.nicotinUseReward.goal = false;
            } else {
              item.nicotinUseReward.goal = true;
            }*/
            item.nicotinUseReward.goal = false;

            /*if (item.participationReward.goal === 'Yes') {
              item.participationReward.goal = false;
            } else {
              item.participationReward.goal = true;
            }*/
            item.participationReward.goal = false;

            /*if (item.healthCoachingReward.goal === 'Yes') {
              item.healthCoachingReward.goal = false;
            } else {
              item.healthCoachingReward.goal = true;
            }*/
            item.healthCoachingReward.goal = false;

            /*if (item.healthRiskAssessmentReward.goal === 'Yes') {
              item.healthRiskAssessmentReward.goal = false;
            } else {
              item.healthRiskAssessmentReward.goal = true;
            }*/
            item.healthRiskAssessmentReward.goal = false;

            item.startDate = utils.dateToShort(item.startDate);
            item.endDate = utils.dateToShort(item.endDate);
            item.registerStartDate = utils.dateToShort(item.registerStartDate);
            item.registerEndDate = utils.dateToShort(item.registerEndDate);

            delete item.hasError;
            delete item.createdDate;
            delete item.modifiedDate;
            delete item.isDeleted;

            if (!!by.hasOwnProperty('id') && !!by.id) {
              item.id = by.id;
              if (isModify(item)) {
                updateItem.push(item);
              }
            } else {
              newItem.push(item);
            }

            if (!validate(by)) {
              errorList.push(by);
            }
          }
        });

        $scope.ngModel.newItem = newItem;
        $scope.ngModel.updateItem = updateItem;
        $scope.ngModel.errorList = errorList;
      }, true);

      $scope.$watch('ngModel.compare', function() {
        if ($scope.ngModel.list.data.length > 0) {
          sortList();
          $scope.changeParams($scope.ngModel.list.data[0]);
        }
      }, true);
    },
    link: function ($scope, $element, $attrs) {
      $scope.inputId = bcaBenefitYearInputId++;

      $scope.row = 'bcaBenefitYear_' + $scope.inputId;
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

      $timeout(function() {
        utils.resetForm($scope.form);
      });
    }
  };
});
