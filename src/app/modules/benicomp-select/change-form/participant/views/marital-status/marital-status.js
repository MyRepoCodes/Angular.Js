angular.module('app.modules.benicomp-select.change-form-participant.marital-status', [])

  .controller('BcsChangeFormMaritalStatusController', function ($rootScope, $scope, CHANGEFORMPARTICIPANT) {
    $scope.nameChangeConstants = CHANGEFORMPARTICIPANT;
  });
