angular.module('app.modules.health-results.participant', [
  'app.modules.health-results.participant.biomarkers',
  'app.modules.health-results.participant.metabolic-syndrome'
])

  .controller('HealthResultsParticipantController', function ($scope, $state, $modal, $timeout, LABVALUES, security, utils) {
    $scope.rewardInfo = security.rewardInfo;
    $scope.isHealthStatusNeedsAttention = false;
    $scope.healthList = [];
    $scope.expression = 'all';
    $scope.isEmpty = false;

    $scope.currentHealthResult = utils.convertBMIGeneral(security.currentUser.healthResult);

    // Init
    if (security.currentUser.healthResult) {
      for (var key in LABVALUES) {
        if (security.currentUser.healthResult[key] !== undefined && key !== 'smokerResponse') {
          var item = angular.copy(LABVALUES[key]);
          item.value = security.currentUser.healthResult[key];

          //remove health result have value 0 , N/A, null
          if (item.value !== 0 && item.value !== null || item.isShowValue0) {
            $scope.healthList.push(item);
            if(utils.biomarkerIsDanger(item, security)){
              $scope.isHealthStatusNeedsAttention = true;
            }
          }

        }
      }
    } else {
      $scope.isEmpty = true;
    }

    $scope.openHealthCoachForm = function () {
      $scope.modal = $modal.open({
        controller: 'HealthCoachController',
        templateUrl: 'modules/health-results/coach/coach.tpl.html',
        backdrop: 'static'
      });
    };
  })

  .filter('filterHealthList', function (utils, security) {
    return function (array, expression) {
      function isDanger(item) {
        return utils.biomarkerIsDanger(item, security);
      }

      if (expression !== 'all' && expression !== 'alpha' && expression !== 'reverse') {
        var healthList = [];
        var i;
        if (expression === 'in') {
          for (i = 0; i < array.length; i++) {
            if (!isDanger(array[i])) {
              healthList.push(array[i]);
            }
          }
        } else if (expression === 'out') {
          for (i = 0; i < array.length; i++) {
            if (isDanger(array[i])) {
              healthList.push(array[i]);
            }
          }
        }

        return healthList;
      }

      if (expression === 'alpha') {
        return array.sort(function (a, b) {
          if (a.biomarker < b.biomarker) {
            return -1;
          }
          if (a.biomarker > b.biomarker) {
            return 1;
          }
          return 0;
        });
      }

      if (expression === 'reverse') {
        return array.sort(function (a, b) {
          if (a.biomarker < b.biomarker) {
            return 1;
          }
          if (a.biomarker > b.biomarker) {
            return -1;
          }
          return 0;
        });
      }

      return array;
    };
  });
