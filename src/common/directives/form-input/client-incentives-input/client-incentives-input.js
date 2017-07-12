/***
 * a1cReward: Generous: ≥ 6.5, Standard: 5.7- 6.4, NIH: < 5.7
 * waistCircumferenceReward: NIH: ≤ 40 (male) ≤ 35 (female), Standard: ≤ 40 (male) ≤ 35 (female), Generous: ≤ 40 (male) ≤ 35 (female)
 **/
angular.module('directive.client-incentives-input', [])

.value('clientIncentivesInputId', 0)

.factory('parseIncentiveBeforePush', function(utils) {
  return function(incentiveParams) {
    var incentive = angular.copy(incentiveParams);

    if(incentive.nicotinUseReward.goal === 'No') {
      incentive.nicotinUseReward.goal = false;
    } else {
      incentive.nicotinUseReward.goal = true;
    }

    if(incentive.participationReward.goal === 'Yes') {
      incentive.participationReward.goal = false;
    } else {
      incentive.participationReward.goal = true;
    }

    if(incentive.healthCoachingReward.goal === 'Yes') {
      incentive.healthCoachingReward.goal = false;
    } else {
      incentive.healthCoachingReward.goal = true;
    }

    if(incentive.healthRiskAssessmentReward.goal === 'Yes') {
      incentive.healthRiskAssessmentReward.goal = false;
    } else {
      incentive.healthRiskAssessmentReward.goal = true;
    }

    incentive.startDate = utils.dateToShort(incentive.startDate);
    incentive.endDate = utils.dateToShort(incentive.endDate);
    incentive.registerStartDate = utils.dateToShort(incentive.registerStartDate);
    incentive.registerEndDate = utils.dateToShort(incentive.registerEndDate);
    delete incentive.hasError;
    delete incentive.editable;
    delete incentive.createdDate;
    delete incentive.modifiedDate;
    delete incentive.isDeleted;

    return incentive;
  };
})

.factory('incentiveChangeTargetOption', function() {
  return function(incentiveParams, option) {
    if (option === 0) {
      incentiveParams.bodyMassIndexReward.goal = 24.9;
      incentiveParams.bloodPressureReward.systolicGoal = 120;
      incentiveParams.bloodPressureReward.diastolicGoal = 80;
      incentiveParams.bloodSugarReward.goal = 100;
      incentiveParams.ldlCholesterolReward.goal = 100;
      incentiveParams.nicotinUseReward.goal = 'No';
      incentiveParams.participationReward.goal = 'No';
      incentiveParams.healthCoachingReward.goal = 'No';
      incentiveParams.healthRiskAssessmentReward.goal = 'No';
      incentiveParams.a1cReward.goal = 5.7;
      incentiveParams.waistCircumferenceReward.goalMale = 40;
      incentiveParams.waistCircumferenceReward.goalFemale = 35;
    } else if (option === 1) {
      incentiveParams.bodyMassIndexReward.goal = 27.5;
      incentiveParams.bloodPressureReward.systolicGoal = 130;
      incentiveParams.bloodPressureReward.diastolicGoal = 85;
      incentiveParams.bloodSugarReward.goal = 115;
      incentiveParams.ldlCholesterolReward.goal = 130;
      incentiveParams.nicotinUseReward.goal = 'No';
      incentiveParams.participationReward.goal = 'No';
      incentiveParams.healthCoachingReward.goal = 'No';
      incentiveParams.healthRiskAssessmentReward.goal = 'No';
      incentiveParams.a1cReward.goal = 6.1;
      incentiveParams.waistCircumferenceReward.goalMale = 40;
      incentiveParams.waistCircumferenceReward.goalFemale = 35;
    } else if (option === 2) {
      incentiveParams.bodyMassIndexReward.goal = 29.9;
      incentiveParams.bloodPressureReward.systolicGoal = 140;
      incentiveParams.bloodPressureReward.diastolicGoal = 90;
      incentiveParams.bloodSugarReward.goal = 126;
      incentiveParams.ldlCholesterolReward.goal = 160;
      incentiveParams.nicotinUseReward.goal = 'No';
      incentiveParams.participationReward.goal = 'No';
      incentiveParams.healthCoachingReward.goal = 'No';
      incentiveParams.healthRiskAssessmentReward.goal = 'No';
      incentiveParams.a1cReward.goal = 6.4;
      incentiveParams.waistCircumferenceReward.goalMale = 40;
      incentiveParams.waistCircumferenceReward.goalFemale = 35;
    }

    return incentiveParams;
  };
})

/***
 * <client-incentives-input data-form="form" data-ng-model="incentive" data-control-label="Client Incentives" data-env="env" data-row="row" data-tabindex="tabindex" readonly></client-incentives-input>
 * element total: 1
 * tabindex total: 1
 */
.directive('clientIncentivesInput', function($timeout, clientIncentivesInputId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
    },
    templateUrl: 'directives/form-input/client-incentives-input/client-incentives-input.tpl.html',
    controller: function($scope) {
      var loaded = false;

      $scope.typesTimeList = [
        {value: 0, label: 'Month'},
        {value: 1, label: 'Year'},
      ];

      $scope.params = {};

      function enableLoaded() {
        $timeout(function() {
          loaded = true;
        });
      }

      function initParams() {
        loaded = false;

        /*** Init params ***/
        $scope.params.bodyMassIndex = ($scope.ngModel.clientIncentive & 1) === 1;
        $scope.params.bloodSugar = ($scope.ngModel.clientIncentive & 2) === 2;
        $scope.params.nicotinUse = ($scope.ngModel.clientIncentive & 4) === 4;
        $scope.params.healthCoaching = ($scope.ngModel.clientIncentive & 8) === 8;
        $scope.params.bloodPressure = ($scope.ngModel.clientIncentive & 16) === 16;
        $scope.params.ldlCholesterol = ($scope.ngModel.clientIncentive & 32) === 32;
        $scope.params.participation = ($scope.ngModel.clientIncentive & 64) === 64;
        $scope.params.healthRiskAssessment = ($scope.ngModel.clientIncentive & 128) === 128;
        $scope.params.a1c = ($scope.ngModel.clientIncentive & 256) === 256;
        $scope.params.waistCircumference = ($scope.ngModel.clientIncentive & 512) === 512;

        /*** Init model default ***/
        // Override bodyMassIndexReward
        if ($scope.ngModel.bodyMassIndexReward.goal === 0 || $scope.params.bodyMassIndex === false) {
          $scope.ngModel.bodyMassIndexReward.goal = 24.9;
          $scope.ngModel.bodyMassIndexReward.singleAmount = 400;
          $scope.ngModel.bodyMassIndexReward.familyAmount = 800;
        }
        $scope.ngModel.bodyMassIndexReward.typesTime = parseInt($scope.ngModel.bodyMassIndexReward.typesTime);

        // Override bloodSugarReward
        if ($scope.ngModel.bloodSugarReward.goal === 0 || $scope.params.bloodSugar === false) {
          $scope.ngModel.bloodSugarReward.goal = 100;
          $scope.ngModel.bloodSugarReward.singleAmount = 400;
          $scope.ngModel.bloodSugarReward.familyAmount = 800;
        }
        $scope.ngModel.bloodSugarReward.typesTime = parseInt($scope.ngModel.bloodSugarReward.typesTime);

        // Override nicotinUseReward
        if ($scope.params.nicotinUse === false) {
          $scope.ngModel.nicotinUseReward.singleAmount = 400;
          $scope.ngModel.nicotinUseReward.familyAmount = 800;
        }
        $scope.ngModel.nicotinUseReward.goal = 'No';
        $scope.ngModel.nicotinUseReward.typesTime = parseInt($scope.ngModel.nicotinUseReward.typesTime);

        // Override healthCoachingReward
        if ($scope.params.healthCoaching === false) {
          $scope.ngModel.healthCoachingReward.singleAmount = 400;
          $scope.ngModel.healthCoachingReward.familyAmount = 800;
        }
        $scope.ngModel.healthCoachingReward.goal = 'Yes';
        $scope.ngModel.healthCoachingReward.typesTime = parseInt($scope.ngModel.healthCoachingReward.typesTime);

        // Override bloodPressureReward
        if ($scope.ngModel.bloodPressureReward.systolicGoal === 0 || $scope.params.bloodPressure === false) {
          $scope.ngModel.bloodPressureReward.systolicGoal = 120;
          $scope.ngModel.bloodPressureReward.diastolicGoal = 80;
          $scope.ngModel.bloodPressureReward.singleAmount = 400;
          $scope.ngModel.bloodPressureReward.familyAmount = 800;
        }
        $scope.ngModel.bloodPressureReward.typesTime = parseInt($scope.ngModel.bloodPressureReward.typesTime);

        // Override ldlCholesterolReward
        if ($scope.ngModel.ldlCholesterolReward.goal === 0 || $scope.params.ldlCholesterol === false) {
          $scope.ngModel.ldlCholesterolReward.goal = 100;
          $scope.ngModel.ldlCholesterolReward.singleAmount = 400;
          $scope.ngModel.ldlCholesterolReward.familyAmount = 800;
        }
        $scope.ngModel.ldlCholesterolReward.typesTime = parseInt($scope.ngModel.ldlCholesterolReward.typesTime);

        // Override participationReward
        $scope.ngModel.participationReward.goal = 'Yes';
        $scope.ngModel.participationReward.typesTime = parseInt($scope.ngModel.participationReward.typesTime);

        // Override healthRiskAssessmentReward
        if ($scope.params.healthRiskAssessment === false) {
          $scope.ngModel.healthRiskAssessmentReward.singleAmount = 400;
          $scope.ngModel.healthRiskAssessmentReward.familyAmount = 800;
        }
        $scope.ngModel.healthRiskAssessmentReward.goal = 'Yes';
        $scope.ngModel.healthRiskAssessmentReward.typesTime = parseInt($scope.ngModel.healthRiskAssessmentReward.typesTime);

        // Override a1CReward
        if ($scope.ngModel.a1cReward.goal === 0 || $scope.params.a1c === false) {
          $scope.ngModel.a1cReward.goal = 5.7;
          $scope.ngModel.a1cReward.singleAmount = 400;
          $scope.ngModel.a1cReward.familyAmount = 800;
        }
        $scope.ngModel.a1cReward.typesTime = parseInt($scope.ngModel.a1cReward.typesTime);

        // Override waistCircumferenceReward
        if ($scope.ngModel.waistCircumferenceReward.goalMale === 0 || $scope.ngModel.waistCircumferenceReward.goalFemale === 0 || $scope.params.waistCircumference === false) {
          $scope.ngModel.waistCircumferenceReward.goalMale = 40;
          $scope.ngModel.waistCircumferenceReward.goalFemale = 35;
          $scope.ngModel.waistCircumferenceReward.singleAmount = 400;
          $scope.ngModel.waistCircumferenceReward.familyAmount = 800;
        }
        $scope.ngModel.waistCircumferenceReward.typesTime = parseInt($scope.ngModel.waistCircumferenceReward.typesTime);

        enableLoaded();
      }

      $scope.$watch('ngModel', function() {
        initParams();
      });

      $scope.$watch('params', function() {
        if (!loaded) {
          return false;
        }

        var clientIncentive = null;
        if ($scope.params.bodyMassIndex) {
          clientIncentive |= 1;
        }
        if ($scope.params.bloodSugar) {
          clientIncentive |= 2;
        }
        if ($scope.params.nicotinUse) {
          clientIncentive |= 4;
        }
        if ($scope.params.healthCoaching) {
          clientIncentive |= 8;
        }
        if ($scope.params.bloodPressure) {
          clientIncentive |= 16;
        }
        if ($scope.params.ldlCholesterol) {
          clientIncentive |= 32;
        }
        if ($scope.params.participation) {
          clientIncentive |= 64;
        }
        if ($scope.params.healthRiskAssessment) {
          clientIncentive |= 128;
        }
        if ($scope.params.a1c) {
          clientIncentive |= 256;
        }
        if ($scope.params.waistCircumference) {
          clientIncentive |= 512;
        }

        $scope.ngModel.clientIncentive = clientIncentive;
      }, true);
    },
    link: function($scope, $element, $attrs) {
      $scope.inputId = clientIncentivesInputId++;
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
    }
  };
});