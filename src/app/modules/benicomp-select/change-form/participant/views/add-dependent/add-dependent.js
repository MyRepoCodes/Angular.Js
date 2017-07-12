angular.module('app.modules.benicomp-select.change-form-participant.add-dependent', [])

  .controller('BcsChangeFormAddDependentController', function ($scope, $state, $modalInstance, $q, utils, security, $modal,$translate, spouses, dependents, CHANGEFORM, CHANGEFORMPARTICIPANT, ObjectChangeForms) {

    $scope.currentSpouseActiveList = [];
    $scope.env = {
      row: 0,
      showValid: false,
      nameChangeDependentsCount: CHANGEFORM.nameChangeDependentsCount,
      relationshipToInsured: CHANGEFORM.relationshipToInsured,
      terminateDependentReason: CHANGEFORM.terminateDependentReason,
      addDependentReason: CHANGEFORM.addDependentReason,

      addTerminateDependentTarget: CHANGEFORM.addTerminateDependentTarget,
      sexList: CHANGEFORMPARTICIPANT.sexList,
      dependentList: null,
      dependentSelect: null,
      maritalStatusList: CHANGEFORM.maritalStatusList
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
      objectChangeFormType: 3,
      submissionForId: null,


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
          dependentSex: "M",
          relationshipToInsured: "spouse",
          relationshipToInsuredOther: "",
          id: "",
          reason: "other",
          reasonOther: ""
        }
      ],


      // Signature
      insuredDob: utils.parseDateOfBirthToDatePacker(security.currentUser.dateOfBirth),
      checkBoxAgree: false,
      signedDate: null,
    };

    // Function add New Dependent
    function validationData(data) {
      angular.forEach(data.addTerminateDependentList, function (item, key) {
        data.addTerminateDependentList[key].target = "add";
        data.addTerminateDependentList[key].effectiveDate = utils.dateToString(data.addTerminateDependentList[key].effectiveDate);
        data.addTerminateDependentList[key].dependentDob = utils.dateToString(data.addTerminateDependentList[key].dependentDob);
      });

      return data;
    }

    function addNewDependent(data) {

      var promises = [];
      var promise = "";

      $scope.env.showValid = false;

      angular.forEach(data.addTerminateDependentList, function (item, index) {
        if (item.target === 'add') {
          var objectPost = {
            dateOfBirth: utils.getDateStringToNumber(item.dependentDob),
            participantId: security.currentUser.id,
            gender: (item.dependentSex === 1) ? "M" : ((item.dependentSex === "M") ? "M" : "F"),
            ssn: "",
            email: "",
            firstName: item.dependentName.firstName,
            middleName: item.dependentName.middleName,
            lastName: item.dependentName.lastName
          };

          if (item.relationshipToInsured === 'spouse') { //add new spouse

            if ($scope.currentSpouseActiveList.length > 0) { //If exist spouse active --> don't allow add new spouse
              promise = [{
                errorMessage: "Please remove current spouse"
              }];
            } else {
              $scope.currentSpouseActiveList.push(objectPost);
              promise = spouses.post(objectPost)
                .then(function (response) {

                  return true;
                }, function (error) {
                  return error.errors;
                });
            }


          } else if (item.relationshipToInsured === 'child') { //add new dependent
            promise = dependents.post(objectPost)
              .then(function (response) {
                return true;
              }, function (error) {
                return error.errors;
              });
          }

          promises.push(promise);
        }
      });


      //return promise
      $q.all(promises).then(function (result) {

        $scope.cancel();
        $state.go($state.current, {}, { reload: true });

        var listError = "";
        angular.forEach(result, function (item) {
          if (item !== true) {
            angular.forEach(item, function (error) {
              listError += "<p>- " + error.errorMessage + "</p>";
            });
          }
        });

        if (listError) { //have some error
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

          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Added the dependent',
                  summary: false,
                  style: 'ok',
                  message: "Please allow 24 hours before submitting claims so that these changes will take effect."
                };
              }
            }
          });
        }


      }, function (errors) {


        $scope.cancel();
        $state.go($state.current, {}, { reload: true });


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

    $scope.addDependent = function (isValid, data) {

      $scope.env.showValid = true;
      if (isValid) {

        //Check agree
        if ($scope.params.checkBoxAgree) {
          addNewDependent(validationData(data));

          // For store all changes
          postDataSubmitChangeForm($scope.params);
        }
      }

    };

    // Function Cancel
    $scope.cancel = function () {
      $scope.env.showValid = false;
      $modalInstance.close(false);
    };

    //-------------------------START: FOR SUBMIT CHANGE FORM-------------------------//
    function createDataPost(data) {

      /*-------------- change date to short date --------------*/
      // --- for Add/Terminate Dependent
      angular.forEach(data.addTerminateDependentList, function (item, key) {
        data.addTerminateDependentList[key].target = "add";
        data.addTerminateDependentList[key].effectiveDate = utils.dateToString(data.addTerminateDependentList[key].effectiveDate);
        data.addTerminateDependentList[key].dependentDob = utils.dateToString(data.addTerminateDependentList[key].dependentDob);
      });

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

      ObjectChangeForms.post(objectPost,{screenName:$translate.instant('auditLogs.screenName.addDependent')})
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

    $scope.submit = function (isValid, data) {

      $scope.env.showValid = true;
      if (isValid) {

        //Check agree
        if (!$scope.params.checkBoxAgree) {
          //TO DO
        } else {

          postDataSubmitChangeForm(data);

        }

      }


    };

    $scope.getNumber = function (num) {
      return new Array(num);
    };
    //-------------------------END: FOR SUBMIT CHANGE FORM-------------------------//

    //get list spouse active
    security.getListSpouseActive().then(function (res) {
      $scope.currentSpouseActiveList = res;

    });


    function init() {

    }

    init();
  });
