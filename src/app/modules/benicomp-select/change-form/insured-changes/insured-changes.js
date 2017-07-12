angular.module('app.modules.benicomp-select.change-form-all.insured-changes', [])

  .controller('BcsCfIcController', function ($rootScope, $scope, $timeout, CONFIGS, CHANGEFORM, apiService, users, security, utils) {
    $scope.env = {
      row: 0,
      showValid: false,
      isEmailExists: false,
      dependentSpouseList: [],
      currentDependentSpouseSelected : null,
      typeOfChange: "",
      nameChangeDependentsCount: CHANGEFORM.nameChangeDependentsCount,
      relationshipToInsured: CHANGEFORM.relationshipToInsured,
      terminateDependentReason: CHANGEFORM.terminateDependentReason,
      addDependentReason: CHANGEFORM.addDependentReason,

      addTerminateDependentTarget: CHANGEFORM.addTerminateDependentTarget,
      sexList: CHANGEFORM.sexList,
      dependentList: null,
      dependentSelect: null,
      maritalStatusList: CHANGEFORM.maritalStatusList
    };

    /*** Init check typeOfChange ***/
    function checkTypeOfChange(typeOfChangeNumber) {

      angular.forEach($scope.changeFormConstants.typeOfChange, function (item) {
        $scope.env.typeOfChange[item.name] = (typeOfChangeNumber & item.value) === item.value;
      });

    }

    $scope.continue = function (isValid) {
      $scope.env.showValid = true;

      if (isValid) {

        // check email
        if ($scope.params.typeOfChange.insuredAndDependentInformation &&
          $scope.params.changesToBeMade.contactInformation &&
          $scope.params.email !== $scope.currentUser.email) {

          users.checkEmailExist({'email': $scope.params.email})
            .then(function (response) {
              $scope.env.isEmailExists = response;

              if (!response) {

                if ($scope.changesToBeMadeIsValid($scope.params) &&
                  $scope.addBeneficiaryChangesToBeMadeIsValid($scope.params) &&
                  $scope.whoIsTheNameChangeIsValid($scope.params)) {
                  $scope.env.showValid = false;
                  // Next step
                  $rootScope.$broadcast('bcs:cf:step:next', 2);
                }

              }

            });

        } else {

          if ($scope.changesToBeMadeIsValid($scope.params) &&
            $scope.addBeneficiaryChangesToBeMadeIsValid($scope.params) &&
            $scope.whoIsTheNameChangeIsValid($scope.params)) {
            $scope.env.showValid = false;
            // Next step
            $rootScope.$broadcast('bcs:cf:step:next', 2);
          }

        }

      }


    };

    $scope.previous = function () {
      $scope.env.showValid = false;
      $rootScope.$broadcast('bcs:cf:step:next', 0);
    };


    //----------------check validation

    //check email exist
    $scope.emailIsExists = function (params) {
      $scope.env.isEmailExists = false;
      // select this group
      if (params.typeOfChange.insuredAndDependentInformation && params.changesToBeMade.contactInformation) {
        if (params.email !== $scope.currentUser.email) {

          return users.checkEmailExist({'email': params.email})
            .then(function (response) {
              $scope.env.isEmailExists = response;
              return response;
            });

        } else {
          return false;
        }
      } else {
        return false;
      }

    };

    // Changes to be Made
    $scope.changesToBeMadeIsValid = function (params) {
      if (params.typeOfChange.insuredAndDependentInformation) {

        if (params.changesToBeMade.nameChange ||
          params.changesToBeMade.contactInformation ||
          params.changesToBeMade.participantMaritalStatus ||
          params.changesToBeMade.addTerminateDependent ||
          params.changesToBeMade.addBeneficiary
        ) {
          return true;
        } else {
          return false;
        }

      } else {
        return true;
      }
    };

    // Who is the name change for?
    $scope.whoIsTheNameChangeIsValid = function (params) {
      if (params.changesToBeMade.nameChange) {
        if (params.nameChange.insured ||
          params.nameChange.dependent
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }

    };

    // AD&D Beneficiary check "Changes to be Made"
    $scope.addBeneficiaryChangesToBeMadeIsValid = function (params) {
      if (params.changesToBeMade.addBeneficiary) {

        if (params.addbChangesToBeMade.primaryBeneficiary ||
          params.addbChangesToBeMade.contingentBeneficiary
        ) {
          return true;
        } else {
          return false;
        }

      } else {
        return true;
      }
    };

    $scope.getNumber = function (num) {
      return new Array(num);
    };


    //Watch params
    $scope.$watch("params", function (value) {

      //Get list dependents
      if (value && value.changesToBeMade.nameChange && value.nameChange.dependent) {
        if (!$scope.env.dependentList) {
          $scope.env.dependentList = [];
          security.getDependents().then(function (dependentList) {
            $scope.env.dependentList = dependentList;
          });
        }
      }
    }, true);


    //---------------------Function

    // Select claimant
    $scope.selectDependentSpouse = function (index, claimant) {
      $scope.params.addTerminateDependentList[index].dependentName = claimant.name;
      $scope.params.addTerminateDependentList[index].dependentDob = claimant.dateOfBirth;
      $scope.params.addTerminateDependentList[index].dependentSex = claimant.gender;
      $scope.params.addTerminateDependentList[index].relationshipToInsured = claimant.relationship;
      $scope.params.addTerminateDependentList[index].id = claimant.id;
    };


    //select dependent
    $scope.selectDependent = function (data) {

      var tmpIsExist = _.find($scope.params.nameChangeDependentsList, function (item) {
        return item.id == data.id;
      });

      if (!tmpIsExist) {
        var tmpObject = {
          name_old: {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName
          },
          id: data.id,
          name: {
            firstName: "",
            lastName: "",
            middleName: ""
          },
          relationshipToInsured: "spouse"
        };

        $scope.params.nameChangeDependentsList.push(tmpObject);

        $scope.params.nameChangeDependentsCount = $scope.params.nameChangeDependentsList.length;
      }

    };

    // START: LIST Dependent + Spouse

    // Spouse's name
    security.getSpouse().then(function (spouse) {

      if (spouse) {
        $scope.env.dependentSpouseList.push({
          name: {
            firstName: spouse.firstName,
            middleName: spouse.middleName,
            lastName: spouse.lastName
          },
          id: spouse.id,
          relationship: "spouse",
          gender: (spouse.gender === 'F') ? 0 : 1,
          dateOfBirth: utils.dateServerToLocalTime(spouse.dateOfBirth),
        });

      }

      // Dependent's name
      security.getDependents().then(function (dependents) {

        _.forEach(dependents, function (dependent) {
          $scope.env.dependentSpouseList.push({
            name: {
              firstName: dependent.firstName,
              middleName: dependent.middleName,
              lastName: dependent.lastName
            },
            id: dependent.id,
            gender: (dependent.gender === 'F') ? 0 : 1,
            relationship: "child",
            dateOfBirth: utils.dateServerToLocalTime(dependent.dateOfBirth),
          });
        });

      });
    });

    // END: LIST Dependent + Spouse

    //remove select dependent
    $scope.removeSelectDependent = function (data) {
      var tmpResult = [];
      angular.forEach($scope.params.nameChangeDependentsList, function (item) {
        if (item.id !== data.id) {
          tmpResult.push(item);
        }
      });

      $scope.params.nameChangeDependentsList = tmpResult;
      $scope.params.nameChangeDependentsCount = $scope.params.nameChangeDependentsList.length;

    };



    /******************** Start Upload file ********************/
    $scope.$watch("params.typeOfChange.baseHealthInsuranceSpd", function (value) {
      if (value) {
        $timeout(function () {
          claimUpload('file_element_0', CONFIGS.baseURL(), apiService.defaultHeaders);
        });
      }
    });


    $scope.removeGroupFileUploadReceipts = function (data, index) {
      $scope.params.fileUploadSPD.splice(index, 1);
    };

    $scope.deleteFile = function (documentFilename, holder_id, indexGroup) {
      $("#" + holder_id).fadeOut("slow", function () {
        $(this).remove();
      });

      angular.forEach($scope.params.fileUploadSpd[indexGroup].listFiles, function (item, key) {
        if (item.documentFilename === documentFilename) {
          $scope.params.fileUploadSpd[indexGroup].listFiles.splice(key, 1);
        }
      });
    };

    //Check if HTML5 uploader is supported by the browser
    function is_support_html5_uploader() {
      if (window.File && window.FileList && window.Blob && (window.FileReader || window.FormData)) {
        return true;
      } else {
        return false;
      }
    }

    /** File Upload Functions **/

    $scope.uploadAnotherFile = function (action, data) {
      if (action === 'selected') {
        $scope.env.groupFileUploadSelected = data;
      }

      if (action === 'add') {
        $scope.params.fileUploadSpd.push({"listFiles": []});

        $timeout(function () {
          var id = $scope.params.fileUploadSpd.length - 1;
          claimUpload('file_element_' + id, CONFIGS.baseURL(), apiService.defaultHeaders);
        }, 100);
      }
    };

    function claimUpload(elementId, baseUrl, defaultHeaders) {
      var resource = baseUrl + '/documents/uploadClientDocumentFile';

      if (is_support_html5_uploader()) {
        $('#' + elementId).uploadifive({
          'uploadScript': resource,
          'buttonText': '<span>Upload Files</span>',
          'removeCompleted': false,
          'formData': {},
          'auto': true,
          'multi': true,
          'queueSizeLimit': 5,
          'queueID': elementId + "_queue",
          'onSetRequestHeader': function (xhr) {
            for (var name in defaultHeaders) {
              xhr.setRequestHeader(name, defaultHeaders[name]);
            }
          },
          'onAddQueueItem': function (file) {
            var file_block_or_allow = 'b';
            var file_type_limit_exts = 'php,php3,php4,php5,phtml,exe,pl,cgi,html,htm,js';
            var file_type_limit_exts_array = file_type_limit_exts.split(',');

            var uploaded_file_ext = file.name.split('.').pop().toLowerCase();

            var file_exist_in_array = false;
            $.each(file_type_limit_exts_array, function (index, value) {
              if (value === uploaded_file_ext) {
                file_exist_in_array = true;
              }
            });

            if ((file_block_or_allow === 'b' && file_exist_in_array === true) || (file_block_or_allow === 'a' && file_exist_in_array === false)) {
              $("#" + file.queueItem.attr('id')).addClass('error');
              $("#" + file.queueItem.attr('id') + ' span.fileinfo').text(" - Error. This file type is not allowed.");
            }

            if ($("html").hasClass("embed")) {
              $.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent);
            }
          },
          'onUploadComplete': function (file, response) {
            var is_valid_response = false;
            var response_json;
            try {
              response_json = jQuery.parseJSON(response);
              is_valid_response = true;
            } catch (e) {
              is_valid_response = false;
              alert(response);
            }
            var queue_item_id = file.queueItem.attr('id');

            if (is_valid_response === true && response_json.errors === null) {
              // Add file to ngModel
              var documentFilename = Math.floor((Math.random() * 100) + 1) + '-' + file.name;
              $scope.params.fileUploadSpd[$scope.env.groupFileUploadSelected].listFiles.push({
                documentFilename: documentFilename,
                respondAPI: response_json.data,
                filename: file.name,
                filesize: utils.formatSizeUnits(file.size)
              });

              var remove_link = "<a class=\"close\" onclick=\"angular.element(this).scope().deleteFile('" + documentFilename + "','" + queue_item_id + "', " + $scope.env.groupFileUploadSelected + ")\"><img border=\"0\" src=\"assets/images/icons/delete.png\" /></a>";

              $("#" + queue_item_id + " a.close").replaceWith(remove_link);
              $("#" + queue_item_id + ' span.filename').prepend('<img align="absmiddle" class="file_attached" src="assets/images/icons/attach.gif">');
            } else {
              $("#" + queue_item_id).addClass('error');
              $("#" + queue_item_id + " a.close").replaceWith('<img style="float: right" border="0" src="assets/images/icons/exclamation.png" />');
              $("#" + queue_item_id + " span.fileinfo").text(" - Error! Unable to upload");
            }

            if ($("html").hasClass("embed")) {
              $.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent);
            }
          }
        });
      }
    }

    /******************** End Upload file ********************/


    function init() {
      checkTypeOfChange($scope.params.typeOfChangeNumber);
    }

    init();
  });
