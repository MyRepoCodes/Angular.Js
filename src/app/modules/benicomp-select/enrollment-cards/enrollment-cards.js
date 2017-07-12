angular.module('app.modules.benicomp-select.ec', [])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.enrollmentCards', {
      url: '/enrollment-cards',
      views: {
        'main-content': {
          templateUrl: 'modules/benicomp-select/enrollment-cards/enrollment-cards.tpl.html',
          controller: 'BeniCompSelectECController'
        }
      }
    });
})

.controller('BeniCompSelectECController', function ($scope, $state, STATES) {
  $scope.stateList = STATES.list;
  $scope.annualMaximumList = {
    1: '$5,000',
    2: '$10,000',
    3: '$15,000',
    4: '$20,000',
    5: '$25,000',
    6: '$35,000',
    7: '$50,000',
    8: '$75,000',
    9: '$100,000',
    10: '$200,000'
  };
  $scope.typeOfParticipantList = {
    1: 'Employee',
    2: 'Surviving Spouse',
    3: 'Retiree',
    4: 'Board Member'
  };

  $scope.step = 0;

  $scope.env = {
    row: 0,
    showValid: false,
  };

  // Init Model
  $scope.params = {
    // Participant Information
    state: '',
    groupName: '',
    groupNumber: '',
    employmentDate: '',
    effectiveDate: '',
    annualMaximum: '',
    firstNameOfInsured: '',
    lastNameOfInsured: '',
    dateOfBirth: '',
    gender: null,
    socialSecurityNumber: '',
    email: '',
    emailConsent: false,
    typeOfParticipant: '',
    saveAndResume: false
    // Additional Information
  };

  // Change state
  $scope.changeState = function(state) {
    if (state) {
      $scope.params.state = state;
    }
  };

  $scope.continue = function(isValid) {
    $scope.env.showValid = true;
    if (isValid) {
      $scope.env.showValid = false;
      $scope.env.row = 0;
      $scope.step = 1;
    }
  };

  $scope.previous = function() {
    $scope.env.showValid = false;
    $scope.env.row = 0;
    $scope.step = 0;
  };
});
