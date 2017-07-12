angular.module('app.modules.user-manager.client.benefit-year', [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.client.benefit-year', {
      url: '/edit/:id/benefit-year',
      views: {
        'main-content@loggedIn.modules': {
          templateUrl: 'modules/user-manager/client/benefit-year/benefit-year.tpl.html',
          controller: 'UserManagerClientBenefitYearController',
          resolve: {
            userInfo: function($stateParams, employers) {
              return employers.getEmployerWithIncentive({
                id: $stateParams.id,
                //registerStartYear: (new Date().getFullYear())
              }).then(function(response) {
                var incentives = [];
                _.forEach(response.incentives, function(incentive) {
                  var clientIncentiveParams = {
                    bodyMassIndex: (incentive.clientIncentive & 1) === 1,
                    bloodSugar: (incentive.clientIncentive & 2) === 2,
                    nicotinUse: (incentive.clientIncentive & 4) === 4,
                    healthCoaching: (incentive.clientIncentive & 8) === 8,
                    bloodPressure: (incentive.clientIncentive & 16) === 16,
                    ldlCholesterol: (incentive.clientIncentive & 32) === 32,
                    participation: (incentive.clientIncentive & 64) === 64,
                    healthRiskAssessment: (incentive.clientIncentive & 128) === 128
                  };
                  incentive.clientIncentiveParams = clientIncentiveParams;

                  var plans = {
                    plan1: {isSelected: false, familyAmount: 0, singleAmount: 0},
                    plan2: {isSelected: false, familyAmount: 0, singleAmount: 0},
                    plan3: {isSelected: false, familyAmount: 0, singleAmount: 0},
                    plan4: {isSelected: false, familyAmount: 0, singleAmount: 0}
                  };
                  _.forEach(incentive.plans, function(item) {
                    if(item.planOption === 1) {
                      plans.plan1.isSelected = true;
                      plans.plan1.familyAmount = item.familyAmount;
                      plans.plan1.singleAmount = item.singleAmount;
                    }
                    if(item.planOption === 2) {
                      plans.plan2.isSelected = true;
                      plans.plan2.familyAmount = item.familyAmount;
                      plans.plan2.singleAmount = item.singleAmount;
                    }
                    if(item.planOption === 4) {
                      plans.plan3.isSelected = true;
                      plans.plan3.familyAmount = item.familyAmount;
                      plans.plan3.singleAmount = item.singleAmount;
                    }
                    if(item.planOption === 8) {
                      plans.plan4.isSelected = true;
                      plans.plan4.familyAmount = item.familyAmount;
                      plans.plan4.singleAmount = item.singleAmount;
                    }
                  });
                  incentive.plans = plans;

                  // Override bodyMassIndexReward
                  if(incentive.bodyMassIndexReward.goal === 0 || clientIncentiveParams.bodyMassIndex === false) {
                    incentive.bodyMassIndexReward.goal = 24.9;
                    incentive.bodyMassIndexReward.singleAmount = 400;
                    incentive.bodyMassIndexReward.familyAmount = 800;
                  }
                  incentive.bodyMassIndexReward.typesTime = parseInt(incentive.bodyMassIndexReward.typesTime);

                  // Override bloodSugarReward
                  if(incentive.bloodSugarReward.goal === 0 || clientIncentiveParams.bloodSugar === false) {
                    incentive.bloodSugarReward.goal = 100;
                    incentive.bloodSugarReward.singleAmount = 400;
                    incentive.bloodSugarReward.familyAmount = 800;
                  }
                  incentive.bloodSugarReward.typesTime = parseInt(incentive.bloodSugarReward.typesTime);

                  // Override nicotinUseReward
                  if(clientIncentiveParams.nicotinUse === false) {
                    incentive.nicotinUseReward.singleAmount = 400;
                    incentive.nicotinUseReward.familyAmount = 800;
                  }
                  incentive.nicotinUseReward.goal = 'No';
                  incentive.nicotinUseReward.typesTime = parseInt(incentive.nicotinUseReward.typesTime);

                  // Override healthCoachingReward
                  if(clientIncentiveParams.healthCoaching === false) {
                    incentive.healthCoachingReward.singleAmount = 400;
                    incentive.healthCoachingReward.familyAmount = 800;
                  }
                  incentive.healthCoachingReward.goal = 'Yes';
                  incentive.healthCoachingReward.typesTime = parseInt(incentive.healthCoachingReward.typesTime);

                  // Override bloodPressureReward
                  if(incentive.bloodPressureReward.systolicGoal === 0 || clientIncentiveParams.bloodPressure === false) {
                    incentive.bloodPressureReward.systolicGoal = 120;
                    incentive.bloodPressureReward.diastolicGoal = 80;
                    incentive.bloodPressureReward.singleAmount = 400;
                    incentive.bloodPressureReward.familyAmount = 800;
                  }
                  incentive.bloodPressureReward.typesTime = parseInt(incentive.bloodPressureReward.typesTime);

                  // Override ldlCholesterolReward
                  if(incentive.ldlCholesterolReward.goal === 0 || clientIncentiveParams.ldlCholesterol === false) {
                    incentive.ldlCholesterolReward.goal = 100;
                    incentive.ldlCholesterolReward.singleAmount = 400;
                    incentive.ldlCholesterolReward.familyAmount = 800;
                  }
                  incentive.ldlCholesterolReward.typesTime = parseInt(incentive.ldlCholesterolReward.typesTime);

                  // Override participationReward
                  incentive.participationReward.typesTime = parseInt(incentive.participationReward.typesTime);

                  // Override healthRiskAssessmentReward
                  if(clientIncentiveParams.healthRiskAssessment === false) {
                    incentive.healthRiskAssessmentReward.singleAmount = 400;
                    incentive.healthRiskAssessmentReward.familyAmount = 800;
                    incentive.healthRiskAssessmentReward.goal = 'Yes';
                  }
                  incentive.healthRiskAssessmentReward.typesTime = parseInt(incentive.healthRiskAssessmentReward.typesTime);

                  incentives.push(incentive);
                });
                response.incentives = incentives;

                return response;
              }, function() {
                return {};
              });
            }
          }
        }
      }
    });
})

.controller('UserManagerClientBenefitYearController', function($scope, $state, $stateParams, userInfo) {
  $scope.incentiveList = angular.copy(userInfo.incentives);

  // Go to preview
  $scope.cancel = function() {
    $state.go('loggedIn.modules.user-manager.client.edit', {id: $stateParams.id});
  };
});
