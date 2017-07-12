angular.module('app.modules.registration.bca.participant.hra', [])

.controller('RegistrationBCAParticipantHraController', function($rootScope, $scope, REGISTRATION_STATUS, security, participants, participantregistrations) {
  $scope.currentUser = security.currentUser;

  $scope.row = 0;

  $scope.params = {
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
    prescribedMedicationForHypertension: $scope.currentUser.prescribedMedicationForHypertension,
    // Row 5
    lastPhysicalExamOrCheckup: $scope.currentUser.lastPhysicalExamOrCheckup ? $scope.currentUser.lastPhysicalExamOrCheckup : undefined,
    // Row 6
    visitHealthcareProviderRoutinely: $scope.currentUser.visitHealthcareProviderRoutinely,
    // Row 8
    overallPhysicalHealth: $scope.currentUser.overallPhysicalHealth ? $scope.currentUser.overallPhysicalHealth : undefined,
  };

  // Have you been diagnosed with any of the following
  $scope.isValidRow1 = function() {
    if(!$scope.params.diabetes && !$scope.params.heartDisease && !$scope.params.cOPD && !$scope.params.condition && !$scope.params.hypertension && !$scope.params.heartAttack && !$scope.params.sleepDisorder && !$scope.params.iHNBDWAOTA && !$scope.params.highCholesterol && !$scope.params.stroke && !$scope.params.thyroidDisease) {
      return false;
    }
    return true;
  };

  // How long has it been since your last physical exam/check up with primary health care provider?
  $scope.isValidRow5 = function() {
    if($scope.params.lastPhysicalExamOrCheckup === undefined) {
      return false;
    }
    return true;
  };

  // Do you visit your healthcare provider routinely as directed for management of a diagnosed condition? (i.e. Diabetes, Hypertension, Thyroid Disease, Chronic back pain, etc.)
  $scope.isValidRow6 = function() {
    if($scope.params.recommendationForHighChrolesterol === false) {
      return false;
    }
    return true;
  };

  // How would you describe your overall physical health?
  $scope.isValidRow8 = function() {
    if($scope.params.overallPhysicalHealth === undefined) {
      return false;
    }
    return true;
  };

  $scope.submit = function(isValid) {
    $scope.showValid = true;
    $scope.row = 0;

    if(isValid && $scope.isValidRow1() && $scope.isValidRow5() && $scope.isValidRow6() && $scope.isValidRow8()) {
      $scope.showValid = false;

      // Have you been diagnosed with any of the following
      var diagnoseType = 0;
      if($scope.params.diabetes) {
        diagnoseType |= 1;
      }
      if($scope.params.heartDisease) {
        diagnoseType |= 2;
      }
      if($scope.params.cOPD) {
        diagnoseType |= 4;
      }
      if($scope.params.condition) {
        diagnoseType |= 8;
      }
      if($scope.params.hypertension) {
        diagnoseType |= 16;
      }
      if($scope.params.heartAttack) {
        diagnoseType |= 32;
      }
      if($scope.params.sleepDisorder) {
        diagnoseType |= 64;
      }
      if($scope.params.iHNBDWAOTA) {
        diagnoseType |= 128;
      }
      if($scope.params.highCholesterol) {
        diagnoseType |= 256;
      }
      if($scope.params.stroke) {
        diagnoseType |= 512;
      }
      if($scope.params.thyroidDisease) {
        diagnoseType |= 1024;
      }

      // How is your diabetes being treated?
      var diabetesTreatType = 0;
      if($scope.params.diabetesOralMedicine) {
        diabetesTreatType |= 1;
      }
      if($scope.params.diabetesInsulin) {
        diabetesTreatType |= 2;
      }
      if($scope.params.diabetesCBDO) {
        diabetesTreatType |= 4;
      }
      if($scope.params.diabetesINRDATCMD) {
        diabetesTreatType |= 8;
      }
      if($scope.params.diabetesOther) {
        diabetesTreatType |= 16;
      }

      // What was your physician’s recommendation for high cholesterol?
      var recommendationForHighChrolesterol = 0;
      if($scope.params.highCholesterolMMD) {
        recommendationForHighChrolesterol |= 1;
      }
      if($scope.params.highCholesterolExercise) {
        recommendationForHighChrolesterol |= 2;
      }
      if($scope.params.highCholesterolTM) {
        recommendationForHighChrolesterol |= 4;
      }

      // Where do you go when you need medical care?
      var medicalCarePlace = 0;
      if($scope.params.doYouNPCP) {
        medicalCarePlace |= 1;
      }
      if($scope.params.doYouNUCC) {
        medicalCarePlace |= 2;
      }
      if($scope.params.doYouNER) {
        medicalCarePlace |= 4;
      }
      if($scope.params.doYouNS) {
        medicalCarePlace |= 8;
      }
      if($scope.params.doYouNNOTA) {
        medicalCarePlace |= 16;
      }

      $scope.registrationParams.status = ($scope.registrationParams.status > REGISTRATION_STATUS.schedule ? $scope.registrationParams.status : REGISTRATION_STATUS.schedule);
      participantregistrations.put({
        id: $scope.registrationParams.id,
        status: $scope.registrationParams.status,
      }).then(function() {
        participants.patch({
          id: $scope.currentUser.id,
          diagnoseType: diagnoseType,
          diabetesTreatType: diabetesTreatType,
          prescribedMedicationForHypertension: $scope.params.prescribedMedicationForHypertension,
          recommendationForHighChrolesterol: recommendationForHighChrolesterol,
          lastPhysicalExamOrCheckup: $scope.params.lastPhysicalExamOrCheckup,
          visitHealthcareProviderRoutinely: $scope.params.visitHealthcareProviderRoutinely,
          medicalCarePlace: medicalCarePlace,
          overallPhysicalHealth: $scope.params.overallPhysicalHealth,
          status: ($scope.currentUser.status > REGISTRATION_STATUS.schedule ? $scope.currentUser.status : REGISTRATION_STATUS.schedule)
        }).then(function(response) {
          $scope.showValid = false;
          $scope.error = null;

          // Next step
          if($scope.step === REGISTRATION_STATUS.editHra) {
            $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.completed);
          } else {
            $rootScope.$broadcast('registration:step:next', REGISTRATION_STATUS.schedule);
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
