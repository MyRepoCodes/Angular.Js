angular.module('app.modules.benicomp-select.change-form-participant', [
  'app.modules.benicomp-select.change-form-participant.name-change',
  'app.modules.benicomp-select.change-form-participant.contact-information',
  'app.modules.benicomp-select.change-form-participant.marital-status',
  'app.modules.benicomp-select.change-form-participant.add-beneficiary',
  'app.modules.benicomp-select.change-form-participant.delete-dependent',
  'app.modules.benicomp-select.change-form-participant.add-dependent',
  'app.modules.benicomp-select.change-form-participant.edit-user',
])

  .config(function ($stateProvider) {

    var resolve = {
      deps: ['$ocLazyLoad', function ($ocLazyLoad) {
        return [];
      }],

      spouseList: function ($stateParams, security) {

        return security.getListSpouseActive().then(function (response) {
          return response;
        });
      },

      dependentList: function ($stateParams, security) {
        return security.getDependents().then(function (response) {
          return response;
        });
      },
    };

    $stateProvider
      .state('loggedIn.modules.changeForm', {
        url: '/change-form/:type/:id',
        views: {
          'main-content': {
            templateUrl: 'modules/benicomp-select/change-form/participant/change-form.tpl.html',
            controller: 'BcsChangFormController',
            resolve: resolve,
          }
        }
      });
  })

  .controller('BcsChangFormController', function ($scope, $q, $state, security, utils, $modal, ObjectChangeForms, users, spouses, participants, dependents, CHANGEFORMPARTICIPANT, spouseList, dependentList) {

    $scope.type = 1;

    $scope.id = $state.params.id ? $state.params.id : null;
    $scope.currentInfo = security.currentUser;


    if ($state.params.type) {
      if ($state.params.type === 'Child') {
        $scope.type = 3;
      } else if ($state.params.type === 'Spouse' || $state.params.type === 'Domestic') {
        $scope.type = 2;
      } else {
        $scope.type = 1;
        $scope.id = security.currentUser.id;
      }
    }



    if ($scope.id) {

      // For dependent
      if ($scope.type === 3) {
        angular.forEach(dependentList, function (item) {
          if (item.id === $scope.id) {
            $scope.currentInfo = item;
          }
        });
      }

      // For spouse & Domestic
      else if ($scope.type === 2) {

        angular.forEach(spouseList, function(item){
          if(item.id === $scope.id){
            $scope.currentInfo = item;
          }  
        });
        
      } else {

      }

    }


    $scope.env = {
      row: 0,
      showValid: false
    };

    // Init Model
    $scope.params = {
      // ---------Insured info
      groupName: security.currentUser.employer.clientName,
      groupNumber: security.currentUser.employer.groupNumber,
      firstName: security.currentUser.firstName,
      lastName: security.currentUser.lastName,
      middleName: security.currentUser.middleName,

      // ---------Type
      objectChangeFormType: $scope.type,
      submissionForId: $scope.id,

      //Name Change
      nameChangeInsuredName: {
        firstName: $scope.currentInfo.firstName,
        lastName: $scope.currentInfo.lastName,
        middleName: $scope.currentInfo.middleName
      },
      nameChangeInsuredReason: "M",
      nameChangeInsuredReasonOther: "",

      //Contact info
      streetAddress: $scope.currentInfo.streetAddress,
      addressLine2: $scope.currentInfo.addressLine2,
      city: $scope.currentInfo.city,
      postalCode: $scope.currentInfo.postalCode,
      state: $scope.currentUser.employer.state,
      country: $scope.currentInfo.country,
      phoneNumber: $scope.currentInfo.phoneNumber,
      email: $scope.currentInfo.email,


      // Participant Marital Status
      maritalStatus: $scope.currentInfo.maritalStatus,
      maritalStatusOther: "",

      //AD&D Beneficiary
      addbCurrentPrimaryBeneficiary: $scope.currentInfo.primaryBeneficiaryForAdd ? $scope.currentInfo.primaryBeneficiaryForAdd : "",
      addbNewPrimaryBeneficiaryDob: $scope.currentInfo.primaryBeneficiaryDob ? utils.parseDateOfBirthToDatePacker($scope.currentInfo.primaryBeneficiaryDob) : "",
      addbNewPrimaryBeneficiarySsn: $scope.currentInfo.primaryBeneficiarySsn ? $scope.currentInfo.primaryBeneficiarySsn : "",
      addbNewPrimaryBeneficiaryEffectiveDate: $scope.currentInfo.primaryBeneficiaryEffectiveDate ? utils.parseDateOfBirthToDatePacker($scope.currentInfo.primaryBeneficiaryEffectiveDate) : "",

      addbCurrentContingentBeneficiaryName: $scope.currentInfo.contingentBeneficiaryForAdd ? $scope.currentInfo.contingentBeneficiaryForAdd : "",
      addbNewContingentBeneficiaryDob: $scope.currentInfo.contingentBeneficiaryDob ? utils.parseDateOfBirthToDatePacker($scope.currentInfo.contingentBeneficiaryDob) : "",
      addbNewContingentBeneficiarySsn: $scope.currentInfo.contingentBeneficiarySsn ? $scope.currentInfo.contingentBeneficiarySsn : "",
      addbNewContingentBeneficiaryEffectiveDate: $scope.currentInfo.contingentBeneficiaryEffectiveDate ? utils.parseDateOfBirthToDatePacker($scope.currentInfo.contingentBeneficiaryEffectiveDate) : "",

      // Signature
      checkBoxAgree: false,
      signedDate: null,
    };


    //-------------------------START: FOR SUBMIT CHANGE FORM-------------------------//
    function createDataPost(data) {

      /*-------------- change date to short date --------------*/


      // -- for AD&D Beneficiary
      data.addbNewPrimaryBeneficiaryDob = utils.dateToString(data.addbNewPrimaryBeneficiaryDob);
      data.addbNewPrimaryBeneficiaryEffectiveDate = utils.dateToString(data.addbNewPrimaryBeneficiaryEffectiveDate);
      data.addbNewContingentBeneficiaryDob = utils.dateToString(data.addbNewContingentBeneficiaryDob);
      data.addbNewContingentBeneficiaryEffectiveDate = utils.dateToString(data.addbNewContingentBeneficiaryEffectiveDate);

      // --- for tab signature
      data.signedDate = utils.dateToString(data.signedDate);


      /*-------------- convert Object to string --------------*/
      data.nameChangeInsuredName = JSON.stringify(data.nameChangeInsuredName);

      //check email not change
      if (data.email === $scope.currentInfo.email) {
        data.email = null;
      }


      delete data.checkBoxAgree;

      return data;
    }


    function postDataSubmitChangeForm(data) {
      var objectPost = createDataPost(angular.copy(data));

      ObjectChangeForms.post(objectPost)
        .then(function (result) {

          //$state.go("loggedIn.modules.change-form-confirmation-page");

        }, function (error) {

          // $modal.open({
          //   controller: 'AlertController',
          //   templateUrl: 'modules/alert/alert.tpl.html',
          //   size: 'sm',
          //   resolve: {
          //     data: function () {
          //       return {
          //         title: 'Submit Fail',
          //         summary: false,
          //         style: 'ok',
          //         message: utils.formatErrors(error.errors)
          //       };
          //     }
          //   }
          // });

        });
    }

    $scope.submit = function (isValid, data) {

      $scope.env.showValid = true;

      //Check agree
      if (!$scope.params.checkBoxAgree) {

        //to do

      } else { //Check data

        //Check Email
        if ($scope.params.email !== $scope.currentInfo.email) {
          users.checkEmailExist({ 'email': $scope.params.email })
            .then(function (response) {
              $scope.env.isEmailExists = response;

              if (!response) { //next step
                postDataSubmitChangeForm(data);
              }

            });
        } else {
          postDataSubmitChangeForm(data);
        }

      }

    };
    //-------------------------END: FOR SUBMIT CHANGE FORM-------------------------//





    //------------- For individual Change Form

    // Action Updating Marital Status
    function updatingMaritalStatus(promises, promise, data) {

      promise = participants.updateInfo({
        id: data.submissionForId,
        maritalStatus: (data.maritalStatus === 'other') ? "O" : data.maritalStatus
      }).then(function (response) {
        security.currentUser = security.updateCurrentUser(response, "maritalStatus");
        return true;
      }, function (error) {
        return error.errors;
      });
      promises.push(promise);

    }

    //update name
    function updateName(promises, promise, data) {

      var objectUpdate = {
        id: data.submissionForId,
        firstName: data.nameChangeInsuredName.firstName,
        middleName: data.nameChangeInsuredName.middleName,
        lastName: data.nameChangeInsuredName.lastName
      };

      if (data.objectChangeFormType === 3) { // For dependent

        promise = dependents.updateInfo(objectUpdate)
          .then(function (response) {
            return true;
          }, function (error) {
            return error.errors;
          });

      } else if (data.objectChangeFormType === 2) { // For spouse
        if (data.phoneNumber) {
          objectUpdate['phoneNumber'] = data.phoneNumber;
        }

        if (data.email) {
          objectUpdate['email'] = data.email;
        }

        promise = spouses.updateInfo(objectUpdate)
          .then(function (response) {
            return true;
          }, function (error) {
            return error.errors;
          });

      } else { // For Participant

        promise = participants.updateInfo(objectUpdate)
          .then(function (response) {
            security.currentUser = security.updateCurrentUser(response, 'name');
            return true;
          }, function (error) {
            return error.errors;
          });

      }

      promises.push(promise);
    }

    // Action Updating AD&D Beneficiary
    function updatingADDBeneficiary(promises, promise, data) {

      var objectUpdate = {};

      if (data.addbCurrentPrimaryBeneficiary) {
        objectUpdate['primaryBeneficiaryForAdd'] = data.addbCurrentPrimaryBeneficiary;
      }

      if (data.addbNewPrimaryBeneficiarySsn) {
        objectUpdate['primaryBeneficiarySsn'] = data.addbNewPrimaryBeneficiarySsn ? utils.ssnFormatSubmit(data.addbNewPrimaryBeneficiarySsn) : null;
      }

      if (data.addbNewPrimaryBeneficiaryDob) {
        objectUpdate['primaryBeneficiaryDob'] = data.addbNewPrimaryBeneficiaryDob ? utils.parseDateOfBirthBeforePush(data.addbNewPrimaryBeneficiaryDob) : null;
      }


      if (data.addbNewPrimaryBeneficiaryEffectiveDate) {
        //objectUpdate['primaryBeneficiaryEffectiveDate'] = data.addbNewPrimaryBeneficiaryEffectiveDate ? utils.parseDateOfBirthBeforePush(data.addbNewPrimaryBeneficiaryEffectiveDate) : null;
      }

      if (data.addbCurrentContingentBeneficiaryName) {
        objectUpdate['contingentBeneficiaryForAdd'] = data.addbCurrentContingentBeneficiaryName;
      }

      if (data.addbNewContingentBeneficiarySsn) {
        objectUpdate['contingentBeneficiarySsn'] = data.addbNewContingentBeneficiarySsn ? utils.ssnFormatSubmit(data.addbNewContingentBeneficiarySsn) : null;
      }

      if (data.addbNewContingentBeneficiaryDob) {
        objectUpdate['contingentBeneficiaryDob'] = data.addbNewContingentBeneficiaryDob ? utils.parseDateOfBirthBeforePush(data.addbNewContingentBeneficiaryDob) : null;
      }

      if (data.addbNewContingentBeneficiaryEffectiveDate) {
        //objectUpdate['contingentBeneficiaryEffectiveDate'] = data.addbNewContingentBeneficiaryEffectiveDate ? utils.parseDateOfBirthBeforePush(data.addbNewContingentBeneficiaryEffectiveDate) : null;
      }


      objectUpdate['id'] = data.submissionForId;

      promise = participants.updateInfo(objectUpdate)
        .then(function (response) {
          security.currentUser = security.updateCurrentUser(response);
          return true;
        }, function (error) {
          return error.errors;
        });
      promises.push(promise);


    }

    // Action Updating Contact Information
    function actionAcceptUpdatingContactInformation(promises, promise, data) {

      var objectSecurity = {
        userId: security.currentUser.userId,
        newPhone: data.phoneNumber
      };

      if (data.email && $scope.currentInfo.email !== data.email) {
        objectSecurity['newEmail'] = data.email;
      }

      promise = users.patchUserSecurity(objectSecurity)
        .then(function () {
          return true;
        }, function (error) {
          return error.errors;
        });
      promises.push(promise);

      promise = participants.updateInfo({
        id: data.submissionForId,
        streetAddress: data.streetAddress,
        addressLine2: data.addressLine2,
        city: data.city,
        postalCode: data.postalCode,
        state: data.state,
        country: "USA"
      }).then(function (response) {

        security.currentUser = security.updateCurrentUser(response, "contactInformation");
        return true;
      }, function (err) {
        return err.errors;
      });
      promises.push(promise);

    }

    // Function Update Info 
    function updateInfo(data) {
      var promises = [];
      var promise = "";

      updateName(promises, promise, data);

      if (data.objectChangeFormType === 1) {

        actionAcceptUpdatingContactInformation(promises, promise, data);
        updatingMaritalStatus(promises, promise, data);
        updatingADDBeneficiary(promises, promise, data);

      }


      //return promise
      $q.all(promises).then(function (result) {

        var listError = "";
        angular.forEach(result, function (item) {
          if (item !== true) {
            angular.forEach(item, function (error) {
              listError += "<p>- " + error.errorMessage + "</p>";
            });
          }
        });

        if (listError) { //have some error

          $state.reload();

          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Submit Error',
                  summary: false,
                  style: 'ok',
                  message: "<p>Most of the data has been updated, but some error: </p>" + listError
                };
              }
            }
          });



        } else { //all sucess

          //$state.reload();

          users.getCurrentMe({ embed: 'employer' })
            .then(function (response) {
              security.currentUser = security.updateCurrentUser(response);
              $state.go("loggedIn.modules.profile");
            });



          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Profile Updated',
                  summary: false,
                  style: 'ok',
                  message: "Please allow 24 hours before submitting claims so that these changes will take effect."
                };
              }
            }
          });
        }


      }, function (errors) {

        var listError = "";
        angular.forEach(errors, function (item) {
          angular.forEach(item, function (err) {
            listError += "<p>" + err.errorMessage + "</p>";
          });
        });

        $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: 'Submit Error',
                summary: false,
                style: 'ok',
                message: listError
              };
            }
          }
        });


      });
    }

    $scope.updateInfo = function (isValid, data) {

      $scope.env.showValid = true;

      //Check agree
      if (!$scope.params.checkBoxAgree) {

        //to do

      } else { //Check data

        //Check Email
        if ($scope.params.email !== $scope.currentInfo.email) {
          users.checkEmailExist({ 'email': $scope.params.email })
            .then(function (response) {
              $scope.env.isEmailExists = response;

              if (!response) { //next step
                updateInfo(data);

                postDataSubmitChangeForm(data);
              }
            });
        } else {
          updateInfo(data);

          postDataSubmitChangeForm(data);
        }

      }

    };


    // Function init
    function init() {

    }

    init();
  });
