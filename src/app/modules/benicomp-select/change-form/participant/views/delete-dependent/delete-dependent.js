angular.module('app.modules.benicomp-select.change-form-participant.delete-dependent', [])

  .controller('BcsChangeFormDeleteDependentController', function ($scope, $state, $modalInstance, $modal, utils, security, spouses, dependents, ObjectChangeForms, DATA) {

    // COMMON
    $scope.data = DATA;
    $scope.type = 3;

    if ($scope.data.typeUser === 'Child') {
      $scope.type = 3;
    } else if ($scope.data.typeUser === 'Spouse' || $scope.data.typeUser === 'Domestic') {
      $scope.type = 2;
    }

    $scope.env = {
      row: 0,
      showValid: false
    };

    // Init Model
    $scope.params = {
      // ---------Group Information
      groupName: security.currentUser.employer.clientName,
      groupNumber: security.currentUser.employer.groupNumber,
      firstName: security.currentUser.firstName,
      lastName: security.currentUser.lastName,
      middleName: security.currentUser.middleName,

      // ---------Type
      objectChangeFormType: $scope.type,
      submissionForId: $scope.data.id,


      // Add/Terminate Dependent
      addTerminateDependentCount: 1,
      addTerminateDependentList: [
        {
          target: "term",
          effectiveDate: utils.getCurrentDateString(),
          dependentName: {
            firstName: $scope.data.firstName,
            lastName: $scope.data.lastName,
            middleName: $scope.data.middleName
          },
          dependentDob: utils.dateToString($scope.data.dateOfBirth),
          dependentSex: $scope.data.gender,
          relationshipToInsured: ($scope.type === 2 ? "spouse" : "child"),
          relationshipToInsuredOther: "",
          id: $scope.data.id,
          reason: "",
          reasonOther: ""
        }
      ],


      // Signature
      insuredDob: utils.parseDateOfBirthToDatePacker(security.currentUser.dateOfBirth),
      checkBoxAgree: false,
      signedDate: null,
    };



    // Function delete
    function deleteOneDependent(data) {

      if ($scope.type === 2) { //term a spouse
        spouses.remove(data.id)
          .then(function () {
            
            $scope.cancel();

            $state.go($state.current, {}, { reload: true });

            $modal.open({
              controller: 'AlertController',
              templateUrl: 'modules/alert/alert.tpl.html',
              size: 'sm',
              resolve: {
                data: function () {
                  return {
                    title: 'Deleted the dependent',
                    summary: false,
                    style: 'ok',
                    message: 'Please allow 24 hours before submitting claims so that these changes will take effect.'
                  };
                }
              }
            });

          }, function (error) {

            $scope.env.showValid = false;
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

      } else { //term a dependent

        dependents.remove(data.id)
          .then(function () {

            $scope.cancel();
            $state.go($state.current, {}, { reload: true });

            $modal.open({
              controller: 'AlertController',
              templateUrl: 'modules/alert/alert.tpl.html',
              size: 'sm',
              resolve: {
                data: function () {
                  return {
                    title: 'Deleted the dependent',
                    summary: false,
                    style: 'ok',
                    message: 'Please allow 24 hours before submitting claims so that these changes will take effect.'
                  };
                }
              }
            });
          }, function (error) {
            $scope.env.showValid = false;
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


      }
    }

    $scope.deleteDependent = function (isValid, data) {

      $scope.env.showValid = true;
      if (isValid) {
        //Check agree
        if ($scope.params.checkBoxAgree) {
          deleteOneDependent(data);

          // For store all changes
          postDataSubmitChangeForm($scope.params);
        }
      }

    };


    // Fuction close modal
    $scope.cancel = function () {

      $scope.env.showValid = false;

      $modalInstance.close(false);
    };


    //-------------------------START: FOR SUBMIT CHANGE FORM-------------------------//


    function createDataPost(data) {

      /*-------------- change date to short date --------------*/

      // --- for tab signature
      data.insuredDob = utils.dateToString(data.insuredDob);
      data.signedDate = utils.dateToString(data.signedDate);


      /*-------------- convert array to string --------------*/
      data.addTerminateDependentList = JSON.stringify(data.addTerminateDependentList);

      delete data.checkBoxAgree;

      return data;
    }

    function postDataSubmitChangeForm(data) {
      var objectPost = createDataPost(angular.copy(data));

      ObjectChangeForms.post(objectPost)
        .then(function (result) {
          
          //$scope.env.showValid = false;
          //$modalInstance.close(true);
          //$state.go("loggedIn.modules.change-form-confirmation-page");

          // $modal.open({
          //   controller: 'AlertController',
          //   templateUrl: 'modules/alert/alert.tpl.html',
          //   size: 'sm',
          //   resolve: {
          //     data: function () {
          //       return {
          //         title: '',
          //         summary: false,
          //         style: 'ok',
          //         message: '<p>Thank you for your submission. Your changes will be reviewed within 24 business hours and your portal updated accordingly. If you have any questions, please contact Customer Service at <span class="color-blue-light">866-797-3343</span>. Thank You.</p>'
          //       };
          //     }
          //   }
          // });

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

    $scope.delete = function (data) {

      $scope.env.showValid = true;

      //Check agree
      if (!$scope.params.checkBoxAgree) {
        //TO DO
      } else {

        postDataSubmitChangeForm(data);

      }

    };


    //-------------------------END: FOR SUBMIT CHANGE FORM-------------------------//



  });
