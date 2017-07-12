angular.module('app.modules.registration.bca.participant.complete', [])

.controller('RegistrationBCAParticipantCompleteController', function($rootScope, $scope, $state, utils, STATES, REGISTRATION_STATUS, security, participants) {
  $scope.statesList = STATES.list;
  $scope.countries = ['United States'];

  $scope.currentUser = security.currentUser;

  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
    confirm: '',
    clientLocationList: $scope.currentUser.employer.employerLocations,
    currentEnrollmentLevel: $scope.currentUser.employer.enrollmentLevel,
  };

  $scope.getCurrentState = function(state) {
    var s = _.find($scope.statesList, function(s) {
      if(s.abbreviation == state) {
        return s;
      }
    });
    return s ? s.name : '';
  };

  // Register
  function initOriginRegisterParams() {
    $scope.originRegisterParams = {
      firstName: $scope.currentUser.firstName ? $scope.currentUser.firstName : '',
      middleName: $scope.currentUser.middleName ? $scope.currentUser.middleName : '',
      lastName: $scope.currentUser.lastName ? $scope.currentUser.lastName : '',
      ssn: $scope.currentUser.ssn ? $scope.currentUser.ssn : '',
      gender: $scope.currentUser.gender,
      streetAddress: $scope.currentUser.streetAddress ? $scope.currentUser.streetAddress : '',
      addressLine2: $scope.currentUser.addressLine2 ? $scope.currentUser.addressLine2 : '',
      city: $scope.currentUser.city ? $scope.currentUser.city : '',
      postalCode: $scope.currentUser.postalCode ? $scope.currentUser.postalCode : '',
      state: $scope.currentUser.state,
      country: $scope.currentUser.country ? $scope.currentUser.country : $scope.countries[0],
      telephone: $scope.currentUser.phoneNumber ? $scope.currentUser.phoneNumber : '',
      email: $scope.currentUser.email ? $scope.currentUser.email : '',
      dateOfBirth: $scope.currentUser.dateOfBirth ? new Date(utils.parseDateOfBirthToDatePacker($scope.currentUser.dateOfBirth)) : '',
      participantType: $scope.currentUser.participantType,
      coverageLevel: $scope.currentUser.coverageLevel,
      clientLocation: $scope.currentUser.clientLocation,
    };
  }

  initOriginRegisterParams();

  function initRegisterParams() {
    $scope.registerParams = angular.copy($scope.originRegisterParams);
  }

  initRegisterParams();

  $scope.editRegister = function(form) {
    $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.editRegister);
  };

  // Hra
  function initOriginHraParams() {
    $scope.originHraParams = {
      // Row 1 - Have you been diagnosed with any of the following?
      diabetes: ($scope.currentUser.diagnoseType & 1) === 1,
      heartDisease: ($scope.currentUser.diagnoseType & 2) === 2,
      cOPD: ($scope.currentUser.diagnoseType & 4) === 4,
      condition: ($scope.currentUser.diagnoseType & 8) === 8,
      hypertension: ($scope.currentUser.diagnoseType & 16) === 16,
      heartAttack: ($scope.currentUser.diagnoseType & 32) === 32,
      sleepDisorder: ($scope.currentUser.diagnoseType & 64) === 64,
      iHNBDWAOTA: ($scope.currentUser.diagnoseType & 128) === 128,
      highCholesterol: ($scope.currentUser.diagnoseType & 256) === 256,
      stroke: ($scope.currentUser.diagnoseType & 512) === 512,
      thyroidDisease: ($scope.currentUser.diagnoseType & 1024) === 1014,
      // Row 2 - How is your diabetes being treated?
      diabetesOralMedicine: ($scope.currentUser.diabetesTreatType & 1) === 1,
      diabetesInsulin: ($scope.currentUser.diabetesTreatType & 2) === 2,
      diabetesCBDO: ($scope.currentUser.diabetesTreatType & 4) === 4,
      diabetesINRDATCMD: ($scope.currentUser.diabetesTreatType & 8) === 8,
      diabetesOther: ($scope.currentUser.diabetesTreatType & 16) === 16,
      // Row 4 - What was your physician’s recommendation for high cholesterol?
      highCholesterolMMD: ($scope.currentUser.recommendationForHighChrolesterol & 1) === 1,
      highCholesterolExercise: ($scope.currentUser.recommendationForHighChrolesterol & 2) === 2,
      highCholesterolTM: ($scope.currentUser.recommendationForHighChrolesterol & 4) === 4,
      // Row 7 - Where do you go when you need medical care?
      doYouNPCP: ($scope.currentUser.medicalCarePlace & 1) === 1,
      doYouNUCC: ($scope.currentUser.medicalCarePlace & 2) === 2,
      doYouNER: ($scope.currentUser.medicalCarePlace & 4) === 4,
      doYouNS: ($scope.currentUser.medicalCarePlace & 8) === 8,
      doYouNNOTA: ($scope.currentUser.medicalCarePlace & 16) === 16,
      // Row 3
      prescribedMedicationForHypertension: $scope.currentUser.prescribedMedicationForHypertension ? 1 : 0,
      // Row 5
      lastPhysicalExamOrCheckup: $scope.currentUser.lastPhysicalExamOrCheckup,
      // Row 6
      visitHealthcareProviderRoutinely: $scope.currentUser.visitHealthcareProviderRoutinely ? 1 : 0,
      // Row 8
      overallPhysicalHealth: $scope.currentUser.overallPhysicalHealth,
    };
  }

  initOriginHraParams();

  function initHraParams() {
    $scope.hraParams = angular.copy($scope.originHraParams);
  }

  initHraParams();

  $scope.editHra = function(form) {
    $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.editHra);
  };
});
