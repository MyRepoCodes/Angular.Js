angular.module('app.modules.benicomp-select.change-form-manager.view-result', [])

  .controller('ViewResultCFController', function ($scope, scope, $state, $modalInstance, $translate, data, CHANGEFORM, CHANGEFORMPARTICIPANT, CONFIGS, utils) {

    //env
    $scope.env = {
      changeFormParticipantConstants: CHANGEFORMPARTICIPANT
    };

    //init
    $scope.dataCurrentItem = data;
    $scope.tableData = [];

    //----------------------------------------START: For Full Change Form ----------------------------------------//
    $scope.generateTable = function (data) {

      $scope.tableData = [
        { label: '<b>I. Group Information</b>', value: null },
        { label: 'Group Name', value: data.groupName },
        { label: 'Group #', value: data.groupNumber },
        { label: 'Insured Name', value: utils.getFullName(data) },
        { label: 'Type Of Change Name', value: data.typeOfChangeName },

        { label: '<b>II. Insured Changes</b>', value: null }


      ];

      // insuredAndDependentInformation
      if (data.typeOfChange.insuredAndDependentInformation) {

        $scope.tableData.push(
          { label: 'Insured and Dependent Information', value: null },
          { label: 'Changes to be Made', value: data.changesToBeMadeName }
        );

        // select nameChange
        if (data.changesToBeMade.nameChange) {
          $scope.tableData.push(
            { label: 'Name Change', value: null },
            { label: 'Who is the name change for?', value: data.nameChangeValue }
          );

          // insured
          if (data.nameChange.insured) {

            var tmpNameChangeInsuredReason = utils.capitalizeFirstLetter(data.nameChangeInsuredReason);
            if (data.nameChangeInsuredReason === 'other') {
              tmpNameChangeInsuredReason += " (" + data.nameChangeInsuredReasonOther + ")";
            }

            $scope.tableData.push(
              { label: 'Insured', value: null },
              { label: 'Insured New Name', value: utils.getFullName(data.nameChangeInsuredName) },
              { label: 'Reason for Change', value: tmpNameChangeInsuredReason }
            );
          }

          // dependent
          if (data.nameChange.dependent) {

            $scope.tableData.push(
              { label: 'List Dependent', value: null },
              { label: 'How Many Dependents?', value: data.nameChangeDependentsCount }
            );

            angular.forEach(data.nameChangeDependentsList, function (item, index) {
              var tmpIndex = index + 1;
              $scope.tableData.push(
                { label: 'Dependent ' + tmpIndex + ' New Name', value: utils.getFullName(item.name) },
                { label: 'Relationship to Insured', value: item.relationshipToInsured }
              );
            });

          }


        }

        // select contactInformation
        if (data.changesToBeMade.contactInformation) {
          var tmpAddress = "";
          tmpAddress += "<p>Street Address : " + data.streetAddress + "</p>";
          tmpAddress += "<p>Address Line 2 : " + data.addressLine2 + "</p>";
          tmpAddress += "<p>City : " + data.city + "</p>";
          tmpAddress += "<p>State : " + data.state + "</p>";
          tmpAddress += "<p>Postal / Zip Code : " + data.postalCode + "</p>";
          tmpAddress += "<p>Country : " + data.country + "</p>";

          $scope.tableData.push(
            { label: 'Contact Information', value: null },
            { label: 'Change Address To', value: tmpAddress },
            { label: 'Change Phone Number To', value: data.phoneNumber }
          );

          if (data.email) {
            $scope.tableData.push(
              { label: 'Change Email Address to', value: data.email }
            );
          }
        }

        // select participantMarital
        if (data.changesToBeMade.participantMaritalStatus) {

          var tmpMaritalStatusOther = data.maritalStatus;
          if (data.maritalStatus === 'other') {
            tmpMaritalStatusOther += ' (' + data.maritalStatusOther + ')';
          }
          $scope.tableData.push(
            { label: 'Marital Status', value: null },
            { label: 'Reason for Change', value: tmpMaritalStatusOther }
          );
        }

        // select addTerminateDependent
        if (data.changesToBeMade.addTerminateDependent) {

          $scope.tableData.push(
            { label: 'Add/Terminate Dependent', value: null },
            { label: 'How Many Dependents?', value: data.addTerminateDependentCount }
          );

          angular.forEach(data.addTerminateDependentList, function (item, index) {
            var tmpIndex = index + 1;

            var tmpTarget = "";
            angular.forEach(CHANGEFORM.addTerminateDependentTarget, function (iChangeForm) {
              if (iChangeForm.id === item.target) {
                tmpTarget = iChangeForm.label;
              }
            });

            var tmpRelationshipInsured = "";
            angular.forEach(CHANGEFORM.relationshipToInsured, function (iChangeForm) {
              if (iChangeForm.id === item.relationshipToInsured) {
                tmpRelationshipInsured = iChangeForm.label;
                if (item.relationshipToInsured === 'other') {
                  tmpRelationshipInsured += " ( " + item.relationshipToInsuredOther + " )";
                }
              }
            });

            var tmpRelationshipAddTerm = "";
            angular.forEach(CHANGEFORM.terminateDependentReason.concat(CHANGEFORM.addDependentReason), function (iChangeForm) {
              if (iChangeForm.id === item.reason) {
                tmpRelationshipAddTerm = iChangeForm.label;
                if (item.reason === 'other') {
                  tmpRelationshipAddTerm += " ( " + item.reasonOther + " )";
                }
              }
            });

            $scope.tableData.push(
              { label: 'Dependent ' + tmpIndex, value: null },
              { label: 'I would like to', value: tmpTarget },
              { label: 'Effective Date', value: item.effectiveDate },
              { label: 'Dependent ' + tmpIndex + ' Name', value: utils.getFullName(item.dependentName) },
              { label: 'Dependent ' + tmpIndex + ' DOB', value: item.dependentDob },
              { label: 'Dependent ' + tmpIndex + ' Sex', value: (item.dependentSex === 1 ? "Male" : "Female") },
              { label: 'Relationship to Insured', value: tmpRelationshipInsured },
              { label: 'Relationship to ' + (item.target === 'add' ? "Addition" : "Termination"), value: tmpRelationshipAddTerm }
            );
          });
        }

        // select AD&D Beneficiary
        if (data.changesToBeMade.addBeneficiary) {

          var tmpChangesToBeMade = "";
          if (data.addbChangesToBeMade.primaryBeneficiary) {
            tmpChangesToBeMade += "<p>- Primary Beneficiary</p>";
          }
          if (data.addbChangesToBeMade.contingentBeneficiary) {
            tmpChangesToBeMade += "<p>- Contingent Beneficiary</p>";
          }
          $scope.tableData.push(
            { label: 'AD&D Beneficiary', value: null },
            { label: 'Changes to be Made ', value: tmpChangesToBeMade }
          );

          if (data.addbChangesToBeMade.primaryBeneficiary) {

            $scope.tableData.push(
              { label: 'Primary Beneficiary', value: null },
              { label: 'Current Primary Beneficiary', value: data.addbCurrentPrimaryBeneficiary },
              { label: 'New Primary Beneficiary', value: data.addbNewPrimaryBeneficiary },
              { label: 'New Primary Beneficiary DOB', value: data.addbNewPrimaryBeneficiaryDob },
              { label: 'New Primary Beneficiary SS#', value: data.addbNewPrimaryBeneficiarySsn },
              { label: 'Effective Date', value: data.addbNewPrimaryBeneficiaryEffectiveDate }
            );
          }

          if (data.addbChangesToBeMade.contingentBeneficiary) {

            $scope.tableData.push(
              { label: 'Contingent Beneficiary', value: null },
              { label: 'Current Contingent Beneficiary', value: data.addbCurrentContingentBeneficiaryName },
              { label: 'New Contingent Beneficiary', value: data.addbNewContingentBeneficiaryName },
              { label: 'New Contingent Beneficiary DOB', value: data.addbNewContingentBeneficiaryDob },
              { label: 'New Contingent Beneficiary SS#', value: data.addbNewContingentBeneficiarySsn },
              { label: 'Effective Date', value: data.addbNewContingentBeneficiaryEffectiveDate }
            );
          }

        }
      }


      // baseHealthInsuranceSPD
      if (data.typeOfChange.baseHealthInsuranceSpd) {

        $scope.tableData.push(
          { label: 'Base Health Insurance Summary Plan Description', value: null }
        );

        //Create list file
        angular.forEach(data.fileUploadSPD, function (item, index) {
          if (item.listFiles && item.listFiles.length > 0) {

            var tmpIndex = index + 1;
            var fileHtml = '';
            angular.forEach(item.listFiles, function (file, key) {
              var urlFile = CONFIGS.baseURL() + '/documents/downloadClientDocumentFile?fileNames=' + file.respondAPI.documentFilename.toString();
              fileHtml += '<img src="assets/images/185.png"><a target="_blank" href="' + urlFile + '">&nbsp;' + file.filename + ' (' + file.filesize + ')</a><br>';
            });

            $scope.tableData.push({
              label: (tmpIndex === 1) ? 'Upload Your Most Recent Summary Plan Description ' : 'Upload a ' + tmpIndex + 'rd set of files',
              value: fileHtml
            });

          }
        });
      }


      //III. Signature
      $scope.tableData.push(
        { label: '<b>III. Signature</b>', value: null },
        { label: "Insured Name", value: utils.getFullName(data) },
        { label: "Insured DOB", value: data.insuredDob },
        { label: 'Insured Last 4 Digits of SS#', value: data.ssn },
        { label: "Insured Signature", value: '<div class="img-signature"><img src="' + data.signature + '" height="130" width="309"/></div>' }
      );

      $scope.tableData.push({
        label: '<p>I understand that by signing this form I am confirming all information provided is correct and will be used by BeniComp Insurance Company moving forward.</p>',
        value: null
      });

      $scope.tableData.push(
        { label: 'Signed Date', value: data.signedDate }
      );


    }
      ;


    function renderData(data) {
      var result = angular.copy(data);

      /*-------------- convert string to array --------------*/
      result.nameChangeDependentsList = JSON.parse(result.nameChangeDependentsList);
      result.addTerminateDependentList = JSON.parse(result.addTerminateDependentList);
      result.fileUploadSPD = JSON.parse(result.fileUploadSpd);

      /*-------------- convert string to object --------------*/
      result.typeOfChange = JSON.parse(result.typeOfChange);
      result.changesToBeMade = JSON.parse(result.changesToBeMade);
      result.nameChange = JSON.parse(result.nameChange);
      result.nameChangeInsuredName = JSON.parse(result.nameChangeInsuredName);
      result.addbChangesToBeMade = JSON.parse(result.addbChangesToBeMade);


      // get Name Type of Change
      result.typeOfChangeName = "";
      if (result.typeOfChange.insuredAndDependentInformation) {
        result.typeOfChangeName += "<p>- Insured and Dependent Information</p>";
      }
      if (result.typeOfChange.baseHealthInsuranceSpd) {
        result.typeOfChangeName += "<p>- Base Health Insurance Summary Plan Description (SPD)</p>";
      }

      // get Name Changes to be Made
      result.changesToBeMadeName = "";
      if (result.changesToBeMade.nameChange) {
        result.changesToBeMadeName += "<p>- Name Change</p>";
      }
      if (result.changesToBeMade.contactInformation) {
        result.changesToBeMadeName += "<p>- Contact Information</p>";
      }
      if (result.changesToBeMade.participantMaritalStatus) {
        result.changesToBeMadeName += "<p>- Participant Marital Status</p>";
      }
      if (result.changesToBeMade.addTerminateDependent) {
        result.changesToBeMadeName += "<p>- Add/Terminate Dependent</p>";
      }
      if (result.changesToBeMade.addBeneficiary) {
        result.changesToBeMadeName += "<p>- AD&D Beneficiary</p>";
      }

      // Who is the name change for?
      result.nameChangeValue = "";
      if (result.nameChange.insured) {
        result.nameChangeValue += "<p>- Insured</p>";
      }
      if (result.nameChange.dependent) {
        result.nameChangeValue += "<p>- Dependent</p>";
      }

      return result;
    }

    //----------------------------------------END: For Full Change Form ----------------------------------------//



    //----------------------------------------START: For Participant Change Form ----------------------------------------//


    $scope.generateTableForParticipant = function (data) {

      // $scope.tableData = [
      //   { label: 'Group Name', value: data.groupName },
      //   { label: 'Group #', value: data.groupNumber },
      //   { label: 'Insured Name', value: utils.getFullName(data) },
      // ];


      if (data.objectChangeFormType) {

        // For Add Term Dependent
        if (data.addTerminateDependentCount && data.addTerminateDependentCount > 0) {

          // Add/Terminate Dependent
          if (true) {


            if (data.addTerminateDependentList && data.addTerminateDependentList[0].target === 'term') { // Terminate Dependent

              $scope.tableData.push(
                { label: '<b>Terminate Dependent</b>', value: null }
              );

              angular.forEach(data.addTerminateDependentList, function (item, index) {
                var tmpIndex = index + 1;

                var tmpTarget = "";
                angular.forEach(CHANGEFORM.addTerminateDependentTarget, function (iChangeForm) {
                  if (iChangeForm.id === item.target) {
                    tmpTarget = iChangeForm.label;
                  }
                });

                var tmpRelationshipInsured = "";
                angular.forEach(CHANGEFORM.relationshipToInsured, function (iChangeForm) {
                  if (iChangeForm.id === item.relationshipToInsured) {
                    tmpRelationshipInsured = iChangeForm.label;
                    if (item.relationshipToInsured === 'other') {
                      tmpRelationshipInsured += " ( " + item.relationshipToInsuredOther + " )";
                    }
                  }
                });

                var tmpRelationshipAddTerm = "";
                angular.forEach(CHANGEFORM.terminateDependentReason.concat(CHANGEFORM.addDependentReason), function (iChangeForm) {
                  if (iChangeForm.id === item.reason) {
                    tmpRelationshipAddTerm = iChangeForm.label;
                    if (item.reason === 'other') {
                      tmpRelationshipAddTerm += " ( " + item.reasonOther + " )";
                    }
                  }
                });

                $scope.tableData.push(
                  { label: 'Name', value: utils.getFullName(item.dependentName) },
                  { label: 'DOB', value: item.dependentDob },
                  { label: 'Sex', value: (item.dependentSex === "M" ? "Male" : "Female") }
                );


              });

            } else { //Add dependent

              $scope.tableData.push(
                { label: '<b>Add Dependent</b>', value: null },
                { label: 'How Many Dependents?', value: data.addTerminateDependentCount }
              );


              angular.forEach(data.addTerminateDependentList, function (item, index) {
                var tmpIndex = index + 1;

                var tmpTarget = "";
                angular.forEach(CHANGEFORM.addTerminateDependentTarget, function (iChangeForm) {
                  if (iChangeForm.id === item.target) {
                    tmpTarget = iChangeForm.label;
                  }
                });

                var tmpRelationshipInsured = "";
                angular.forEach(CHANGEFORM.relationshipToInsured, function (iChangeForm) {
                  if (iChangeForm.id === item.relationshipToInsured) {
                    tmpRelationshipInsured = iChangeForm.label;
                    if (item.relationshipToInsured === 'other') {
                      tmpRelationshipInsured += " ( " + item.relationshipToInsuredOther + " )";
                    }
                  }
                });

                var tmpRelationshipAddTerm = "";
                angular.forEach(CHANGEFORM.terminateDependentReason.concat(CHANGEFORM.addDependentReason), function (iChangeForm) {
                  if (iChangeForm.id === item.reason) {
                    tmpRelationshipAddTerm = iChangeForm.label;
                    if (item.reason === 'other') {
                      tmpRelationshipAddTerm += " ( " + item.reasonOther + " )";
                    }
                  }
                });


                $scope.tableData.push(
                  { label: 'Dependent ' + tmpIndex, value: null }
                );


                if (data.addTerminateDependentList[0].target !== 'term') {
                  $scope.tableData.push(
                    { label: 'Effective Date', value: item.effectiveDate }
                  );
                }

                $scope.tableData.push(
                  { label: 'Dependent ' + tmpIndex + ' Name', value: utils.getFullName(item.dependentName) },
                  { label: 'Dependent ' + tmpIndex + ' DOB', value: item.dependentDob },
                  { label: 'Dependent ' + tmpIndex + ' Sex', value: (item.dependentSex === "M" ? "Male" : "Female") }
                );

                if (data.addTerminateDependentList[0].target !== 'term') {
                  $scope.tableData.push(
                    { label: 'Relationship to Insured', value: tmpRelationshipInsured },
                    { label: 'Relationship to ' + (item.target === 'add' ? "Addition" : "Termination"), value: tmpRelationshipAddTerm }
                  );
                }

              });
            }


          }

        } else { // For update info


          if (true) {

            // Name Change
            var tmpNameChangeInsuredReason = utils.capitalizeFirstLetter($scope.env.changeFormParticipantConstants.reasonForChangeList[data.nameChangeInsuredReason]);

            $scope.tableData.push(
              { label: '<b>Name Change</b>', value: null },
              { label: 'Name', value: utils.getFullName(data.nameChangeInsuredName) }
            );

            if (data.insuredDob) {
              $scope.tableData.push(
                { label: 'Date of birth', value: data.insuredDob }
              );
            }


            if (tmpNameChangeInsuredReason) { //For submit from ChangeForm

              if (tmpNameChangeInsuredReason && data.nameChangeInsuredReason === 'other') {
                tmpNameChangeInsuredReason += " (" + data.nameChangeInsuredReasonOther + ")";
              }

              $scope.tableData.push(
                { label: 'Reason for Change', value: tmpNameChangeInsuredReason }
              );


              // Contact Information
              if (data.objectChangeFormType === 1 || data.objectChangeFormType === 2) {
                $scope.tableData.push(
                  { label: '<b>Contact Information</b>', value: null }
                );

                if (data.objectChangeFormType === 1) {
                  var tmpAddress = "";
                  tmpAddress += "<p>Street Address : " + data.streetAddress + "</p>";
                  tmpAddress += "<p>Address Line 2 : " + data.addressLine2 + "</p>";
                  tmpAddress += "<p>City : " + data.city + "</p>";
                  tmpAddress += "<p>State : " + data.state + "</p>";
                  tmpAddress += "<p>Postal / Zip Code : " + data.postalCode + "</p>";
                  tmpAddress += "<p>Country : " + data.country + "</p>";

                  $scope.tableData.push(
                    { label: 'Address', value: tmpAddress }
                  );
                }

                $scope.tableData.push(
                  { label: 'Change Phone Number To', value: data.phoneNumber }
                );

                if (data.email) {
                  $scope.tableData.push(
                    { label: 'Change Email Address to', value: data.email }
                  );
                }

              }

              // Marital Status
              if (data.objectChangeFormType === 1) {

                var tmpMaritalStatusOther = $scope.env.changeFormParticipantConstants.maritalStatusList[data.maritalStatus];
                if (data.maritalStatus === 'other') {
                  tmpMaritalStatusOther += ' (' + data.maritalStatusOther + ')';
                }
                $scope.tableData.push(
                  { label: '<b>Marital Status</b>', value: null },
                  { label: 'Reason for Change', value: tmpMaritalStatusOther }
                );
              }

              // AD&D Beneficiary
              if (data.objectChangeFormType === 1) {

                $scope.tableData.push(
                  { label: '<b>AD&D Beneficiary</b>', value: null }
                );

                if (true) { //Primary Beneficiary

                  $scope.tableData.push(
                    { label: 'Primary Beneficiary', value: null },
                    { label: 'Name', value: data.addbCurrentPrimaryBeneficiary },
                    { label: 'DOB', value: data.addbNewPrimaryBeneficiaryDob },
                    { label: 'SS#', value: data.addbNewPrimaryBeneficiarySsn },
                    { label: 'Effective Date', value: data.addbNewPrimaryBeneficiaryEffectiveDate }
                  );
                }

                if (true) { //Contingent Beneficiary

                  $scope.tableData.push(
                    { label: 'Contingent Beneficiary', value: null },
                    { label: 'Name', value: data.addbCurrentContingentBeneficiaryName },
                    { label: 'DOB', value: data.addbNewContingentBeneficiaryDob },
                    { label: 'SS#', value: data.addbNewContingentBeneficiarySsn },
                    { label: 'Effective Date', value: data.addbNewContingentBeneficiaryEffectiveDate }
                  );
                }

              }


            } else { //For submit from Profile


              // Contact Information
              if (data.objectChangeFormType === 1) {
                $scope.tableData.push(
                  { label: '<b>Contact Information</b>', value: null }
                );

                if (data.objectChangeFormType === 1) {
                  var tmpAddress2 = "";
                  tmpAddress2 += "<p>Street Address : " + data.streetAddress + "</p>";
                  tmpAddress2 += "<p>Address Line 2 : " + data.addressLine2 + "</p>";
                  tmpAddress2 += "<p>City : " + data.city + "</p>";
                  tmpAddress2 += "<p>State : " + data.state + "</p>";
                  tmpAddress2 += "<p>Postal / Zip Code : " + data.postalCode + "</p>";
                  tmpAddress2 += "<p>Country : " + data.country + "</p>";

                  $scope.tableData.push(
                    { label: 'Address', value: tmpAddress2 }
                  );
                }

                $scope.tableData.push(
                  { label: 'Change Phone Number To', value: data.phoneNumber }
                );

                if (data.email) {
                  $scope.tableData.push(
                    { label: 'Change Email Address to', value: data.email }
                  );
                }

              }


            } // End For submit from Profile

          }





        }


      }



      $scope.tableData.push({
        label: '<p>I understand that by checking this box I am confirming all information provided is correct and will be used by BeniComp Insurance Company moving forward.</p>',
        value: null
      });

      $scope.tableData.push(
        { label: 'Signed Date', value: data.signedDate }
      );


    };


    function renderDataForParticipant(data) {
      var result = angular.copy(data);

      /*-------------- convert string to array --------------*/
      //result.nameChangeDependentsList = JSON.parse(result.nameChangeDependentsList);
      result.addTerminateDependentList = JSON.parse(result.addTerminateDependentList);


      /*-------------- convert string to object --------------*/
      result.nameChangeInsuredName = JSON.parse(result.nameChangeInsuredName);

      return result;
    }

    //----------------------------------------END: For Participant Change Form ----------------------------------------//




    // function action
    $scope.runAction = function (actionName) {
      var dataPost = "";
      if (actionName === "download") {
        dataPost = data.documentId;
      }

      if (actionName === "accept") {
        dataPost = [];
        data['fromViewResult'] = true;
        dataPost.push(data);
      }

      scope.selectAction(actionName, dataPost);
    };

    function init() {

      if (data.objectChangeFormType) {
        $scope.generateTableForParticipant(renderDataForParticipant(data));
      } else {
        $scope.generateTable(renderData(data));
      }


    }

    init();
  })
  ;