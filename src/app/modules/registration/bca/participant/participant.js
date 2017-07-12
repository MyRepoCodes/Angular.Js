angular.module('app.modules.registration.bca.participant', [
  'app.modules.registration.bca.participant.hra',
  'app.modules.registration.bca.participant.register',
  'app.modules.registration.bca.participant.schedule',
  'app.modules.registration.bca.participant.complete',
])

.controller('RegistrationBCAParticipantController', function($rootScope, $scope, $state, security, REGISTRATION_STATUS, employers, incentives, participantregistrations) {
  $scope.currentYear = new Date().getFullYear();
  $scope.currentUser = security.currentUser;
  $scope.currentEmployer = $scope.currentUser.employer;
  $scope.registrationStatus = REGISTRATION_STATUS;

  $scope.clientName = $scope.currentUser.employer.clientName;

  $scope.currentIncentive = null;
  $scope.registrationParams = {
    id: null,
    status: REGISTRATION_STATUS.register,
    participantId: $scope.currentUser.id,
    incentiveId: null,
  };

  // Environments
  $scope.env = {
    registerStartDate: null,
    registerEndDate: null,
    startDate: null,
    endDate: null,
    opening: false,
  };
  $scope.step = REGISTRATION_STATUS.register;

  function initEnv(incentive) {
    if(incentive) {
      $scope.env.registerStartDate = new Date(incentive.registerStartDate);
      $scope.env.registerEndDate = new Date(incentive.registerEndDate);
      $scope.env.startDate = new Date(incentive.startDate);
      $scope.env.endDate = new Date(incentive.endDate);

      $scope.registrationParams.incentiveId = incentive.id;

      participantregistrations.getByQuery({
        participantId: $scope.currentUser.id,
        incentiveId: incentive.id,
      }).then(function(response) {
        if(response.length > 0) {
          $scope.registrationParams.id = response[0].id;
          $scope.registrationParams.status = response[0].status;

          $scope.step = response[0].status;
        } else {
          $scope.step = REGISTRATION_STATUS.register;
        }
      });
    }
  }

  security.getCurrentBenefitYearBca().then(function(currentBenefitYearBca) {
    $scope.currentIncentive = currentBenefitYearBca;
    initEnv($scope.currentIncentive);

    security.checkBenefitYearBcaOpening().then(function(isOpen) {
      $scope.env.opening = isOpen;
    });
  });

  /*if ($scope.currentUser.incentiveAssignId) {
    incentives.find($scope.currentUser.incentiveAssignId).then(function(response) {
      $scope.currentIncentive = response;
      initEnv($scope.currentIncentive);
    });
  }*/

  $scope.$on('registration:step:next', function(event, step) {
    $scope.step = step;
  });

  // Go to complete
  $scope.cancel = function() {
    $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.completed);
  };
});
