angular.module('app.modules.health-results.coach', [])

.controller('HealthCoachController', function($scope, $modalInstance, $timeout, PATTERNREGEXS, security, utils, healthcoachrequests) {
  // Pattern Regex
  $scope.patternRegexs = PATTERNREGEXS;

  $scope.currentUser = security.currentUser;
  $scope.step = 1;

  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
  };

  $scope.params = {
    nutritionCoaching: false,
    fitnessCoaching: false,
    healthResultsExplanation: false,
    healthAlertNotification: false,
    phone: false,
    email: false,
    beniCompPulsePortal: true,
    phoneNumber: $scope.currentUser.phoneNumber ? $scope.currentUser.phoneNumber : "",
    emailAddress: $scope.currentUser.email ? $scope.currentUser.email : "",
    comments: ''
  };

  // Check email valid
  $scope.validEmail = function() {
    if ($scope.params.email) {
      return !!$scope.params.emailAddress;
    }
    return true;
  };

  // Get
  function getReasonForRequest() {
    var reasonForRequest = null;
    if ($scope.params.nutritionCoaching) {
      reasonForRequest |= 1;
    }
    if ($scope.params.fitnessCoaching) {
      reasonForRequest |= 2;
    }
    if ($scope.params.healthResultsExplanation) {
      reasonForRequest |= 4;
    }
    if ($scope.params.healthAlertNotification) {
      reasonForRequest |= 8;
    }

    return reasonForRequest;
  }

  function getMethodOfContact() {
    var methodOfContact = null;
    if ($scope.params.phone) {
      methodOfContact |= 1;
    }
    if ($scope.params.email) {
      methodOfContact |= 2;
    }
    if ($scope.params.beniCompPulsePortal) {
      methodOfContact |= 4;
    }

    return methodOfContact;
  }

  $scope.validReasonForRequest = function() {
    if (getReasonForRequest() === null) {
      return false;
    }

    return true;
  };

  // Submit
  $scope.submit = function(isValid) {
    $scope.env.showValid = true;
    var reasonForRequest = getReasonForRequest();
    var methodOfContact = getMethodOfContact();

    if (isValid && $scope.validEmail() && reasonForRequest !== null) {
      healthcoachrequests.post({
        reasonForRequest: reasonForRequest,
        methodOfContact: methodOfContact,
        phone: $scope.params.phoneNumber,
        email: $scope.params.emailAddress,
        comments: $scope.params.comments,
        //status: 0,
        participantId: security.currentUser.id
      }).then(function(response) {
        $scope.env.showValid = false;

        // Next form
        $scope.step = 2;
        $timeout(function() {
          $modalInstance.close(true);
        }, 3000);

      }, function(error) {
      });
    }
  };

  $scope.$watch('params.phone', function(newVal) {
    if (newVal === false) {
      $scope.params.phoneNumber = $scope.currentUser.phoneNumber ? $scope.currentUser.phoneNumber : "";
    }
  });

  $scope.$watch('params.email', function(newVal) {
    if (newVal === false) {
      $scope.params.emailAddress = $scope.currentUser.email ? $scope.currentUser.email : "";
    }
  });

  $scope.cancel = function() {
    $modalInstance.close(false);
  };
});
