angular.module('app.modules.registration.bcs.participant.enrollment-card', [])

.controller('EnrollmentEnrollmentCardController', function($rootScope, $scope, STATES, utils, security, participants) {
  $scope.stateList = STATES.list;
  $scope.typeOfParticipantList = {
    1: 'Employee',
    2: 'Surviving Spouse',
    3: 'Retiree',
    4: 'Board Member'
  };

  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
    error: null,
  };

  // Init model
  $scope.params = $scope.globalParams.ec;

  $scope.localStep = 0;

  // Submit
  $scope.submitParticipant = function(form) {
    $scope.env.row = 0;
    $scope.env.showValid = true;
    if (form.$valid) {
      participants.patch({
        id: security.currentUser.id,
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        dateOfBirth: utils.parseDateOfBirthBeforePush($scope.params.dateOfBirth),
        ssn: $scope.params.ssn,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        state: $scope.params.state,
        country: $scope.params.country,
        phoneNumber: $scope.params.phoneNumber,
        email: $scope.params.email,
        gender: $scope.params.gender,
        employmentDate: utils.dateToShort($scope.params.employmentDate),
        annualMax: $scope.params.annualMax,
      }).then(function(response) {
        security.updateCurrentUser(response);
        
        $scope.env.showValid = false;
        $scope.localStep = 1;
      });
    }
  };

  $scope.submitDependent = function(signature, form) {
    $scope.env.row = 0;
    $scope.env.showValid = true;
    if (form.$valid && !signature.isEmpty) {
      $scope.params.signature = signature.dataUrl;

      participants.patch({
        id: security.currentUser.id,
        maritalStatus: $scope.params.maritalStatus,
        numberOfDependents: $scope.params.numberOfDependents,
      }).then(function(response) {
        security.updateCurrentUser(response);

        $scope.env.showValid = false;
        $rootScope.$broadcast('enrollment:step:next', 1);
      });
    }
  };

  // Previous Profile
  $scope.previous = function(signature) {
    if (!signature.isEmpty) {
      $scope.params.signature = signature.dataUrl;
    }

    $scope.localStep = 0;
    $scope.env.showValid = false;
  };
});
