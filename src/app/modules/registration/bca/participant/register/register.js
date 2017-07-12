angular.module('app.modules.registration.bca.participant.register', [])

.controller('RegistrationBCAParticipantRegisterController', function($rootScope, $scope, $state, DATECONFIGS, STATES, QUESTIONS, REGISTRATION_STATUS, utils, security, i18nNotifications, participants, participantregistrations) {
  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function(notification) {
    i18nNotifications.remove(notification);
  };

  $scope.statesList = STATES.list;
  $scope.countries = ['United States'];

  $scope.currentUser = security.currentUser;

  $scope.registrationStatus = REGISTRATION_STATUS;

  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
    confirm: '',
    agree: false,
    clientLocationList: $scope.currentUser.employer.employerLocations,
    currentEnrollmentLevel: $scope.currentUser.employer.enrollmentLevel,
  };

  // User information
  var dateOfBirth = $scope.currentUser.dateOfBirth ? $scope.currentUser.dateOfBirth : DATECONFIGS.dateStart;
  $scope.params = {
    firstName: $scope.currentUser.firstName ? $scope.currentUser.firstName : '',
    middleName: $scope.currentUser.middleName ? $scope.currentUser.middleName : '',
    lastName: $scope.currentUser.lastName ? $scope.currentUser.lastName : '',
    ssn: $scope.currentUser.ssn ? $scope.currentUser.ssn : '',
    dateOfBirth: utils.parseDateOfBirthToDatePacker(dateOfBirth),
    gender: $scope.currentUser.gender,
    streetAddress: $scope.currentUser.streetAddress ? $scope.currentUser.streetAddress : '',
    addressLine2: $scope.currentUser.addressLine2 ? $scope.currentUser.addressLine2 : '',
    city: $scope.currentUser.city ? $scope.currentUser.city : '',
    postalCode: $scope.currentUser.postalCode ? $scope.currentUser.postalCode : '',
    state: $scope.currentUser.state ? $scope.currentUser.state : '',
    country: $scope.currentUser.country ? $scope.currentUser.country : $scope.countries[0],
    phoneNumber: $scope.currentUser.phoneNumber ? $scope.currentUser.phoneNumber : '',
    email: $scope.currentUser.email ? $scope.currentUser.email : '',
    participantType: $scope.currentUser.participantType,
    coverageLevel: $scope.currentUser.coverageLevel,
    clientLocation: $scope.currentUser.clientLocation,
  };

  // Submit
  $scope.submit = function(isValid) {
    $scope.env.row = 0;
    $scope.env.showValid = true;
    if(isValid) {
      var params = angular.copy($scope.params);
      params['id'] = $scope.currentUser.id;
      params['dateOfBirth'] = utils.parseDateOfBirthBeforePush($scope.params.dateOfBirth);
      params['country'] = 'USA';
      params['status'] = ($scope.currentUser.status > REGISTRATION_STATUS.hra ? $scope.currentUser.status : REGISTRATION_STATUS.hra);
      delete  params['coverageLevel']; // This field will not be an "editable" field. In other words, the participant cannot change this field. It is for viewing purposes only.

      var reApi;
      $scope.registrationParams.status = ($scope.registrationParams.status > REGISTRATION_STATUS.hra ? $scope.registrationParams.status : REGISTRATION_STATUS.hra);
      if($scope.registrationParams.id) {
        reApi = participantregistrations.put({
          id: $scope.registrationParams.id,
          status: $scope.registrationParams.status
        });
      } else {
        delete $scope.registrationParams.id;
        reApi = participantregistrations.post($scope.registrationParams);
      }
      reApi.then(function(response) {
        $scope.registrationParams.id = response.id;

        participants.patch(params).then(function(response) {
          $scope.env.showValid = false;
          $scope.error = null;
          // Next step
          if($scope.step === REGISTRATION_STATUS.editRegister) {
            $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.completed);
          } else {
            $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.hra);
          }

          // Update current user
          security.updateCurrentUser(response);
        }, function(error) {
          $scope.error = error.error;
        });

      }, function(error) {
        $scope.error = error.error;
      });
    }
  };
});
