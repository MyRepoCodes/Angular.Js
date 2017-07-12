angular.module('app.modules.registration.bca.participant.schedule', [])

.controller('RegistrationBCAParticipantScheduleController', function($rootScope, $scope, $state, REGISTRATION_STATUS, security, participants, participantregistrations) {
  $scope.currentUser = security.currentUser;

  $scope.submit = function(isValid) {
    $scope.showValid = true;

    if(isValid) {
      $scope.registrationParams.status = REGISTRATION_STATUS.completed;
      participantregistrations.put({
        id: $scope.registrationParams.id,
        status: $scope.registrationParams.status,
      }).then(function() {
        $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.completed);

        /*participants.patch({
          id: $scope.currentUser.id,
          status: REGISTRATION_STATUS.completed
        }).then(function(response) {
          $scope.showValid = false;
          $scope.error = null;
          // Next step
          $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.completed);

          // Update current user
          security.updateCurrentUser(response);
        }, function(error) {
          $scope.error = error.error;
        });*/

      }, function(error) {

      });
    }
  };
});
