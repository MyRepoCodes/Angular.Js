angular.module('app.modules.benicomp-select.change-form-all', [
  'app.modules.benicomp-select.change-form-all.group-information',
  'app.modules.benicomp-select.change-form-all.insured-changes',
  'app.modules.benicomp-select.change-form-all.signature',
  'app.modules.benicomp-select.change-form-all.confirmation-page'
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.changeFormAll', {
        url: '/change-form-all',
        views: {
          'main-content': {
            templateUrl: 'modules/benicomp-select/change-form/change-form.tpl.html',
            controller: 'BcsCfController',
            resolve: {
              deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                return [];
              }]
            }
          }
        }
      });
  })

  .controller('BcsCfController', function ($scope, $state, security, utils, $modal, ObjectChangeForms, CHANGEFORM) {

    $scope.changeFormConstants = CHANGEFORM;

    $scope.step = 0;

    $scope.$on('bcs:cf:step:next', function (event, step) {
      $scope.step = step;
    });


    var ssn = security.currentUser.ssn;
    var lastSsn = utils.getLast4DigitsOfSSN(ssn);


    // Init Model
    $scope.params = {
      // ---------Group Information
      groupName: security.currentUser.employer.clientName,
      groupNumber: security.currentUser.employer.groupNumber,
      firstName: security.currentUser.firstName,
      lastName: security.currentUser.lastName,
      middleName: security.currentUser.middleName,
      typeOfChange: {
        insuredAndDependentInformation: false,
        baseHealthInsuranceSpd: false
      },
      // ---------Insured change
      //Changes to be Made
      changesToBeMade: {
        nameChange: false,
        contactInformation: false,
        participantMaritalStatus: false,
        addTerminateDependent: false,
        addBeneficiary: false
      },

      //Name Change
      nameChange: {
        insured: false,
        dependent: false
      },

      //Name Change Insured
      nameChangeInsuredName: {
        firstName: security.currentUser.firstName,
        lastName: security.currentUser.lastName,
        middleName: security.currentUser.middleName
      },
      nameChangeInsuredReason: "marriage",
      nameChangeInsuredReasonOther: "",

      //Name Change Dependents
      nameChangeDependentsCount: 1,
      nameChangeDependentsList: [],

      // Participant Marital Status
      maritalStatus: "married",
      maritalStatusOther: "",

      // Add/Terminate Dependent
      addTerminateDependentCount: 1,
      addTerminateDependentList: [
        {
          target: "add",
          effectiveDate: "",
          dependentName: {
            firstName: "",
            lastName: "",
            middleName: ""
          },
          dependentDob: "",
          dependentSex: 0,
          relationshipToInsured: "spouse",
          relationshipToInsuredOther: "",
          id: "",
          reason: "other",
          reasonOther: ""
        }
      ],


      // AD&D Beneficiary
      addbChangesToBeMade: {
        primaryBeneficiary: false,
        contingentBeneficiary: false,
      },
      addbCurrentPrimaryBeneficiary: security.currentUser.primaryBeneficiaryForAdd ? security.currentUser.primaryBeneficiaryForAdd : "",
      addbNewPrimaryBeneficiary: "",
      addbNewPrimaryBeneficiaryDob: "",
      addbNewPrimaryBeneficiarySsn: "",
      addbNewPrimaryBeneficiaryEffectiveDate: "",

      addbCurrentContingentBeneficiaryName: "",
      addbNewContingentBeneficiaryName: "",
      addbNewContingentBeneficiaryDob: "",
      addbNewContingentBeneficiarySsn: "",
      addbNewContingentBeneficiaryEffectiveDate: "",

      //Contact info
      streetAddress: security.currentUser.streetAddress,
      addressLine2: security.currentUser.addressLine2,
      city: security.currentUser.city,
      postalCode: security.currentUser.postalCode,
      state: $scope.currentUser.employer.state,
      country: security.currentUser.country,
      phoneNumber: security.currentUser.phoneNumber,
      email: security.currentUser.email,

      // Signature
      insuredDob: utils.parseDateOfBirthToDatePacker(security.currentUser.dateOfBirth),
      fileUploadSpd: [{
        "listFiles": []
      }],
      ssn: lastSsn,
      signature: '',
      signedDate: null,
    };

    function createDataPost(data) {

      /*-------------- change date to short date --------------*/
      // --- for Add/Terminate Dependent
      angular.forEach(data.addTerminateDependentList, function (item, key) {
        data.addTerminateDependentList[key].effectiveDate = utils.dateToString(data.addTerminateDependentList[key].effectiveDate);
        data.addTerminateDependentList[key].dependentDob = utils.dateToString(data.addTerminateDependentList[key].dependentDob);
      });

      // -- for AD&D Beneficiary
      data.addbNewPrimaryBeneficiaryDob = utils.dateToString(data.addbNewPrimaryBeneficiaryDob);
      data.addbNewPrimaryBeneficiaryEffectiveDate = utils.dateToString(data.addbNewPrimaryBeneficiaryEffectiveDate);
      data.addbNewContingentBeneficiaryDob = utils.dateToString(data.addbNewContingentBeneficiaryDob);
      data.addbNewContingentBeneficiaryEffectiveDate = utils.dateToString(data.addbNewContingentBeneficiaryEffectiveDate);

      // --- for tab signature
      data.insuredDob = utils.dateToString(data.insuredDob);
      data.signedDate = utils.dateToString(data.signedDate);


      /*-------------- convert array to string --------------*/
      data.nameChangeDependentsList = JSON.stringify(data.nameChangeDependentsList);
      data.addTerminateDependentList = JSON.stringify(data.addTerminateDependentList);
      data.fileUploadSpd = JSON.stringify(data.fileUploadSpd);


      /*-------------- convert Object to string --------------*/
      data.typeOfChange = JSON.stringify(data.typeOfChange);
      data.changesToBeMade = JSON.stringify(data.changesToBeMade);
      data.nameChange = JSON.stringify(data.nameChange);
      data.nameChangeInsuredName = JSON.stringify(data.nameChangeInsuredName);
      data.addbChangesToBeMade = JSON.stringify(data.addbChangesToBeMade);

      //data.addbCurrentContingentBeneficiaryName = JSON.stringify(data.addbCurrentContingentBeneficiaryName);
      //data.addbNewContingentBeneficiaryName = JSON.stringify(data.addbNewContingentBeneficiaryName);

      //check email not change
      if (data.email === security.currentUser.email) {
        data.email = null;
      }

      return data;
    }

    $scope.submit = function (data) {
      var objectPost = createDataPost(angular.copy($scope.params));

      ObjectChangeForms.post(objectPost)
        .then(function (result) {

          $state.go("loggedIn.modules.change-form-confirmation-page");

        }, function (error) {

          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Submit Fail',
                  summary: false,
                  style: 'ok',
                  message: utils.formatErrors(error.errors)
                };
              }
            }
          });

        });

    };

  });
