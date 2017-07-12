angular.module('app.modules.registration.bcs.participant', [
  'app.modules.registration.bcs.participant.breadcrumb',
  'app.modules.registration.bcs.participant.enrollment-card',
  'app.modules.registration.bcs.participant.direct-deposit',
  'app.modules.registration.bcs.participant.privacy-authorization-form',
])

  .controller('RegistrationBCSParticipantController', function ($scope, security, utils) {
    $scope.currentYear = new Date().getFullYear();
    $scope.currentUser = security.currentUser;
    $scope.currentEmployer = $scope.currentUser.employer;
    $scope.clientName = $scope.currentUser.employer.clientName;
    $scope.currentBenefitYearBcs = null;
    $scope.spouseInfo = null;
    $scope.dependentList = [];

    // Environments
    $scope.currentStep = 0;
    $scope.env = {
      step: 0,
      opening: false,
    };

    security.getCurrentBenefitYearBcs().then(function (currentBenefitYearBcs) {
      $scope.currentBenefitYearBcs = currentBenefitYearBcs;

      security.checkBenefitYearBcsOpening().then(function (isOpen) {
        $scope.env.opening = isOpen;
      });
    });

    security.getSpouse().then(function (spouseInfo) {
      $scope.spouseInfo = spouseInfo;
    });

    security.getDependents().then(function (dependentList) {
      $scope.dependentList = dependentList;
    });

    var ssn = security.currentUser.ssn;
    var lastSsn = utils.getLast4DigitsOfSSN(ssn);

    // Init Model
    $scope.globalParams = {};
    $scope.globalParams['ec'] = {
      // Participant
      groupName: security.currentUser.employer.clientName,
      groupNumber: security.currentUser.employer.groupNumber,
      employmentDate: utils.dateServerToLocalTime(security.currentUser.employmentDate),
      effectiveDate: utils.dateServerToLocalTime(security.currentUser.employer.effectiveDateOfInsurance),
      //annualMax: security.currentUser.annualMax,
      annualClassesOfEligibleEmployees: security.currentUser.annualClassesOfEligibleEmployees,
      firstName: security.currentUser.firstName,
      lastName: security.currentUser.lastName,
      middleName: security.currentUser.middleName,
      dateOfBirth: utils.parseDateOfBirthToDatePacker(security.currentUser.dateOfBirth),
      ssn: ssn,
      streetAddress: security.currentUser.streetAddress,
      addressLine2: security.currentUser.addressLine2,
      city: security.currentUser.city,
      postalCode: security.currentUser.postalCode,
      state: $scope.currentUser.employer.state,
      country: security.currentUser.country,
      phoneNumber: security.currentUser.phoneNumber,
      email: security.currentUser.email,
      gender: security.currentUser.gender,
      emailConsent: false,
      typeOfParticipant: '',
      // Dependent
      maritalStatus: security.currentUser.maritalStatus,
      numberOfDependents: security.currentUser.numberOfDependents,
      primaryBeneficiaryForAdd: security.currentUser.primaryBeneficiaryForAdd,
      primaryBeneficiaryRelationship: security.currentUser.primaryBeneficiaryRelationship,
      primaryBeneficiarySsn: '',
      primaryBeneficiaryAddress: {
        state: $scope.currentUser.employer.state,
      },
      contingentBeneficiaryForAdd: security.currentUser.contingentBeneficiaryForAdd,
      contingentBeneficiaryRelationship: security.currentUser.contingentBeneficiaryRelationship,
      contingentBeneficiarySsn: '',
      contingentBeneficiaryAddress: {
        state: $scope.currentUser.employer.state,
      },
      signature: '',
      signedDate: null,

    };

    $scope.globalParams['dd'] = {
      groupName: security.currentUser.employer.clientName ? security.currentUser.employer.clientName : "",
      groupNumber: security.currentUser.employer.groupNumber ? security.currentUser.employer.groupNumber : "",
      firstName: security.currentUser.firstName ? security.currentUser.firstName : "",
      lastName: security.currentUser.lastName ? security.currentUser.lastName : "",
      middleName: security.currentUser.middleName ? security.currentUser.middleName : "",
      ssn: lastSsn,
      email: security.currentUser.email,
      homePhoneNumber: security.currentUser.phoneNumber,
      daytimePhoneNumber: '',
      choiceType: 1,
      changeEffectiveDate: '',
      cancelEffectiveDate: '',
      bankName: '',
      accountType: '',
      routing: '',
      accountNumber: '',
      fileUploadVoidedChecks: [{
        "listFiles": []
      }],
      signature: '',
      signedDate: null,


    };

    $scope.globalParams['pa'] = {
      groupName: security.currentUser.employer.clientName,
      groupNumber: security.currentUser.employer.groupNumber,
      firstName: security.currentUser.firstName,
      lastName: security.currentUser.lastName,
      middleName: security.currentUser.middleName,
      dateOfBirth: utils.parseDateOfBirthToDatePacker(security.currentUser.dateOfBirth),
      ssn: lastSsn,
      email: security.currentUser.email,
      name1: {},
      multipleIndividuals: 0,
      name2: {},
      name3: {},
      signature: '',
      signedDate: null,
    };

    $scope.spouseCallback = function (spouseInfo) {
      $scope.spouseInfo = spouseInfo;
      security.updateSpouse(spouseInfo);
    };

    $scope.dependentCallback = function (dependentList) {
      $scope.dependentList = dependentList;
      security.updateDependents(dependentList);
    };

    $scope.$watch('dependentList', function () {
      $scope.globalParams.ec.numberOfDependents = $scope.dependentList.length;
    }, true);

    $scope.$on('enrollment:step:next', function (event, step) {
      $scope.env.step = step;
      $scope.currentStep = step;
    });
  })
;
