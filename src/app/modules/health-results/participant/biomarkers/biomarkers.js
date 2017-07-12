angular.module('app.modules.health-results.participant.biomarkers', [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.health-results.biomarkers', {
      url: '/biomarkers',
      views: {
        'main-content@loggedIn.modules': {
          templateUrl: 'modules/health-results/participant/biomarkers/biomarkers.tpl.html',
          controller: 'HealthResultsBiomarkersController'
        }
      }
    });
})

.controller('HealthResultsBiomarkersController', function($scope, $modal, utils, LABVALUES, security, participants, participantregistrations) {
  $scope.rewardInfo = security.rewardInfo;
  $scope.isHealthStatusNeedsAttention = false;
  $scope.healthList = [];
  $scope.expression = 'all';
  $scope.registerInfo = null;
  $scope.registerDate = null;
  $scope.currentHealthResult = null;

  function initHealthResult() {
    if(security.currentUser.healthResult) {
      $scope.currentHealthResult = utils.convertBMIGeneral(security.currentUser.healthResult);
      //Create item healthResult A_G_Ratio
      var tmpAGRatioValue = ($scope.currentHealthResult.albumin / $scope.currentHealthResult.globulin).toFixed(2);
      $scope.currentHealthResult['A_G_Ratio'] = $.isNumeric(tmpAGRatioValue) ? tmpAGRatioValue : null ;


      for (var key in LABVALUES) {
        if ($scope.currentHealthResult[key] !== undefined && key !== 'smokerResponse') {
          var item = angular.copy(LABVALUES[key]);
          item.value = $scope.currentHealthResult[key];
          //remove health result have value 0 , N/A, null
          if (item.value !== 0 && item.value !== null || item.isShowValue0) {
            $scope.healthList.push(item);
            if(utils.biomarkerIsDanger(item, security)) {
              $scope.isHealthStatusNeedsAttention = true;
            }
          }
        }
      }

      // Add bloodPressure
      /*var item1 = angular.copy(LABVALUES['systolic']);
       item1.value = $scope.currentHealthResult['systolic1'] + '/' + $scope.currentHealthResult['diastolic1'];
       $scope.healthList.push(item1);

       var item2 = angular.copy(LABVALUES['bloodPressure']);
       item2.value = $scope.currentHealthResult['systolic2'] + '/' + $scope.currentHealthResult['diastolic2'];
       $scope.healthList.push(item2);*/
    }
  }

  // Participant registered?
  if (security.currentUser.incentiveAssignId) {
    participantregistrations.getByQuery({
      participantId: security.currentUser.id,
      incentiveId: security.currentUser.incentiveAssignId,
    }).then(function(response) {
      if (response.length > 0) {
        $scope.registerInfo = response[0];
        $scope.registerDate = $scope.registerInfo.createdDate;
      }
    });
  }

  initHealthResult();

  $scope.openHealthCoachForm = function() {
    $scope.modal = $modal.open({
      controller: 'HealthCoachController',
      templateUrl: 'modules/health-results/coach/coach.tpl.html',
      backdrop: 'static'
    });
  };

  // GetMyRewards
  function getMyRewards() {
    participants.getMyRewards().then(function(rs) {
      $scope.rewardInfo.totalReward = rs.totalRewardsEarned;
      $scope.rewardInfo.totalReal = rs.totalPossibleRewards;
      $scope.rewardInfo.totalPassed = rs.metabolicSyndromePassed;
    });
  }

  getMyRewards();
});
