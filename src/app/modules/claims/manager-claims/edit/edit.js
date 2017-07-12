/**********************
 *
 * NOTE:  ADMIN & Partcipant USE
 *
 **********************/

angular.module('app.modules.claims.manager-claims.edit', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.manager-claims.edit', {
        url: '/edit/:id',
        views: {
          'main-content@loggedIn.modules': {
            templateUrl: 'modules/claims/submit-claims/participant/participant.tpl.html',
            controller: 'ClaimsManagerEditController',
            resolve: {
              claimInfo: function ($state, $stateParams, benicompclaims, participants) {
                return benicompclaims.find($stateParams.id, { embed: 'participant' }).then(function (claimInfo) {
                  return claimInfo;
                }, function () {
                  $state.go('loggedIn.modules.manager-claims');
                });
              },
              deps: ['$ocLazyLoad',
                function ($ocLazyLoad) {
                  return [];
                }]
            }
          }
        }
      });
  })

  .controller('ClaimsManagerEditController', function ($scope, $state, $timeout, $stateParams, $modal, utils, CONFIGS, apiService, benicompclaims, claimInfo, spouses, dependents) {
    $scope.step = 0;
    $scope.claimantList = [];


    // Environments
    $scope.env = {
      tmpClaimant: null,
      row: 0,
      showValid: false,
      currentClaimant: null,
      signature: null,
      amountTotal: 0,
      isAdminEdit: true
    };

    $scope.typeOfClaimItemList = {
      1: 'Dental',
      2: 'Vision',
      3: 'Pharmacy',
      4: 'Medical'
    };

    $scope.relationshipList = {
      1: 'Self',
      2: 'Spouse',
      3: 'Child',
      4: 'Other'
    };


    // Init Model

    $scope.params = {
      // Participant Tab
      groupName: claimInfo.claimData.groupName,
      groupNumber: claimInfo.claimData.groupNumber,
      firstName: claimInfo.claimData.firstName,
      middleName: claimInfo.claimData.middleName,
      lastName: claimInfo.claimData.lastName,
      ssn: claimInfo.claimData.ssn,
      insuredBirthdate: utils.dateServerToLocal(claimInfo.claimData.insuredBirthdate),
      email: claimInfo.claimData.email,
      claimantName: {
        firstName: claimInfo.claimData.claimantName.firstName,
        middleName: claimInfo.claimData.claimantName.middleName,
        lastName: claimInfo.claimData.claimantName.lastName
      },
      claimantId: claimInfo.claimData.claimantId,
      relationship: claimInfo.claimData.relationship,
      claimantBirthdate: utils.dateServerToLocal(claimInfo.claimData.claimantBirthdate),
      // Claims Tab
      fileUploadReceipts: createDataEditFileReceiptsClaim(claimInfo.claimData.fileUploadReceipts),
      numberOfClaimItems: claimInfo.claimData.numberOfClaimItems,
      claimItems: claimInfo.claimData.claimItems,
      dateTemp: null,
      signature: claimInfo.claimData.signature,
    };

    $scope.paramEdit = {
      date: utils.dateServerToLocal(claimInfo.claimData.date)
    };

    //$scope.claimItemList = createDataClaimForEdit(_.values($scope.params.claimItems));
    $scope.claimItemList = createDataClaimForEdit($scope.params.claimItems);

    function createDataClaimForEdit(data) {
      var result = [];
      angular.forEach(data, function (item) {
        var tmpItem = [];
        tmpItem['model'] = item;
        result.push(tmpItem);
      });

      return result;
    }

    //*************************** Add Claim Item ***************************//
    function addClaimItemDefault() {
      var item = {
        model: {
          typeOfClaimItem: 1,
          providerOfServices: '',
          dateIncurred: utils.getCurrentDateString(),
          amountOfExpenseDollars: '',
          amountOfExpenseCents: '',
          amountEligibleDollars: '',
          amountEligibleCents: '',
          files: [],
        }
      };
      $scope.claimItemList.push(item);
    }

    function addClaimItemByLength(length) {
      if ($scope.claimItemList.length == length) {
        return;
      }

      if ($scope.claimItemList.length < length) { // Add
        addClaimItemDefault();
      } else if ($scope.claimItemList.length > length) { // Remove
        $scope.claimItemList.splice($scope.claimItemList.length - 1);
      }
      addClaimItemByLength(length);
    }

    $scope.$watch('params.numberOfClaimItems', function (newLength) {
      addClaimItemByLength(newLength);
    });

    // Remove by callback
    $scope.removeClaimItem = function (claimItem) {

      if ($scope.claimItemList.length > 1) {

        _.forEach($scope.claimItemList, function (item) {
          if (item.model == claimItem) {
            $scope.claimItemList.splice($scope.claimItemList.indexOf(item), 1);
            $scope.params.numberOfClaimItems = $scope.claimItemList.length;

            //update data for Model
            //$scope.params.fileUploadReceipts = $scope.claimItemList;


            return true;
          }
        });


      } else {

        $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: 'Remove Fail',
                summary: false,
                style: 'ok',
                message: "Must have at least one claim"
              };
            }
          }
        });

        return false;
      }


    };

    $scope.addRemoveClaim = function (action, data) {
      if (action === 'add') {
        $scope.params.numberOfClaimItems += 1;
      }

    };
    //*************************** End Add Claim Item ***************************//

    $scope.generateTable = function (data) {
      $scope.tableData = [
        { label: 'Group Name', value: data.groupName },
        { label: 'Group #', value: data.groupNumber },
        { label: 'Insured\'s Name', value: utils.getFullName(data) },
        { label: 'Insured\'s Birthdate', value: new Date(utils.dateServerToLocal(data.insuredBirthdate)).format('mmm dd, yyyy') },
        { label: 'Insured\'s Email', value: data.email },
        { label: 'Insured\'s Last 4 digits of SS#', value: data.ssn },
        { label: 'Claimant\'s Name', value: data.claimantName.firstName + ' ' + (data.claimantName.middleName ? data.claimantName.middleName + " " : "") + data.claimantName.lastName },
        { label: 'Relationship to Insured', value: $scope.relationshipList[data.relationship] },
        { label: 'Claimant\'s Birthdate', value: new Date(utils.dateServerToLocal(data.claimantBirthdate)).format('mmm dd, yyyy') },
        { label: 'Number of Claim Items', value: data.numberOfClaimItems }
      ];

      angular.forEach(data.claimItems, function (claim, key) {

        if (claim) {
          var idClaim = parseInt(key) + 1;
          $scope.tableData.push({ label: 'Claim Item ' + idClaim, value: '' });
          $scope.tableData.push({
            label: 'Type of Claim Item',
            value: utils.getTypeOfClaimItem(claim.typeOfClaimItem)
          });
          $scope.tableData.push({
            label: 'Provider of Services',
            value: claim.providerOfServices
          });
          $scope.tableData.push({
            label: 'Date Incurred',
            value: new Date(utils.dateServerToLocalTime(claim.dateIncurred)).format('mmm dd, yyyy')
          });
          $scope.tableData.push({
            label: 'Amount of Expense',
            value: '$' + claim.amountOfExpenseDollars + '.' + claim.amountOfExpenseCents
          });
          $scope.tableData.push({
            label: 'Amount Eligible for Reimbursement by BeniComp Select',
            value: '$' + claim.amountEligibleDollars + '.' + claim.amountEligibleCents
          });
        }

      });

      //Supporting Documentation Upload
      $scope.tableData.push({
        label: '<div class="mf_section_title">Supporting Documentation Upload</div><br/><div class="mf_section_content">NOTE: If the receipts and bills are all on one supporting document then please only upload the document once. You can choose or take a photo with your smartphone or tablet or upload files from your computer.</div>',
        value: null
      });

      //Create list file
      angular.forEach(data.fileUploadReceipts, function (item, index) {
        if (item.listFiles && item.listFiles.length > 0) {

          var tmpIndex = index + 1;
          var fileHtml = '';
          angular.forEach(item.listFiles, function (file, key) {
            var urlFile = CONFIGS.baseURL() + '/benicompclaimfiles/download?filenames=' + file.respondAPI.toString();
            fileHtml += '<img src="assets/images/185.png"><a target="_blank" href="' + urlFile + '">&nbsp;' + file.filename + ' (' + file.filesize + ')</a><br>';
          });

          $scope.tableData.push({
            label: (tmpIndex === 1) ? 'Upload receipts and bills including supporting documentation with each claim item.' : 'Upload a ' + tmpIndex + 'rd set of files',
            value: fileHtml
          });

        }
      });

      //WARNING
      $scope.tableData.push({
        label: '<div class="mf_section_content">I certify that the above statements are true and hereby authorize any physician, hospital, employer, union, HMO, insurance company or prepayment organization to give the claims administrator any additional information required in connection with this Claim for Medical Reimbursement Insurance Benefits. A photocopy of this authorization shall be as valid as the original.<br><br>WARNING: FOR YOUR PROTECTION CALIFORNIA LAW REQUIRES THE FOLLOWING TO APPEAR ON THIS FORM. ANY PERSON WHO KNOWINGLY PRESENTS A FALSE OR FRAUDULENT CLAIM FOR THE PAYMENT OF A LOSS IS GUILTY OF A CRIME AND MAY BE SUBJECT TO FINES AND CONFINEMENT IN STATE PRISON.</div>',
        value: null,
        class: 'row-white'
      });

      $scope.tableData.push({
        label: 'Date',
        value: new Date($scope.paramEdit.date).format('mmm dd, yyyy'),
        class: 'row-white'
      });

      $scope.tableData.push({
        label: '<div>I understand that checking this box constitutes as my legal signature.</div>',
        value: null
      });

      $scope.tableData.push({
        label: 'Administered by: BeniComp, Inc., 8310 Clinton Park Drive, Fort Wayne, IN 46825 - Phone: (260) 482-7400 Fax: (260) 483-6255',
        value: null,
        class: 'row-white'
      });
    };

    // Select claimant
    $scope.selectClaimant = function (claimant) {
      $scope.params.claimantName = claimant.name;
      $scope.params.claimantId = claimant.id;
      $scope.params.relationship = claimant.relationship;
      $scope.params.claimantBirthdate = claimant.dateOfBirth;
    };

    // get List Claimant
    function getListClaimant(idParticipant) {

      // Participant's name
      $scope.claimantList.push({
        name: {
          firstName: claimInfo.claimData.firstName,
          middleName: claimInfo.claimData.middleName,
          lastName: claimInfo.claimData.lastName,
        },
        id: idParticipant,
        relationship: 1,
        dateOfBirth: utils.dateServerToLocal(claimInfo.claimData.insuredBirthdate),
      });


      if (idParticipant) {

        //Spouse's name
        spouses.getByParticipantId(idParticipant)
          .then(function (spouse) {

            if (spouse && !spouse.isLocked) {
              $scope.claimantList.push({
                name: {
                  firstName: spouse.firstName,
                  middleName: spouse.middleName,
                  lastName: spouse.lastName
                },
                id: spouse.id,
                relationship: 2,
                dateOfBirth: utils.dateServerToLocal(spouse.dateOfBirth),
              });

            }

            // Dependent's name
            dependents.getByParticipantId(idParticipant)
              .then(function (dependents) {

                _.forEach(dependents, function (dependent) {

                  if (!dependent.isLocked) {
                    $scope.claimantList.push({
                      name: {
                        firstName: dependent.firstName,
                        middleName: dependent.middleName,
                        lastName: dependent.lastName
                      },
                      id: dependent.id,
                      relationship: 3,
                      dateOfBirth: utils.dateServerToLocal(dependent.dateOfBirth),
                    });
                  }

                });

                // Add current Claimant
                $scope.env.currentClaimant = {
                  name: {
                    firstName: claimInfo.claimData.claimantName.firstName,
                    middleName: claimInfo.claimData.claimantName.middleName,
                    lastName: claimInfo.claimData.claimantName.lastName
                  },
                  id: claimInfo.claimData.claimantId,
                  relationship: claimInfo.claimData.relationship,
                  dateOfBirth: utils.dateServerToLocal(claimInfo.claimData.claimantBirthdate),
                };

              });

          });

      }


    }

    function createListItem(data) {
      var result = [];
      var pageNumber = 1; // number 1 for form submit
      var currentDate = utils.getCurrentDateString('yyyymmdd');

      angular.forEach(data, function (item) {

        angular.forEach(item.listFiles, function (claimItem) {

          angular.forEach(claimItem.respondAPI, function (item) {
            pageNumber += 1;
            var tmpItem = {
              "Filename": item,
              "CurrentDate": currentDate,
              "PageNumber": ('00' + pageNumber).slice(-3)
            };

            result.push(tmpItem);
          });
        });
      });

      return result;
    }

    // Submit
    $scope.submitProfile = function (isValid) {
      $scope.env.showValid = true;
      if (isValid) {
        $scope.env.showValid = false;
        $scope.env.row = 0;

        // Go to top
        angular.element('html').animate({ scrollTop: 100 }, "slow");
        /* Firefox*/
        angular.element('body').animate({ scrollTop: 100 }, "slow");
        /* Chorme*/

        $scope.step = 1;


      }
    };

    $scope.submitAddClaims = function (isValid) {
      $scope.env.showValid = true;

      var params = null;
      if ($scope.isParticipant) {

        if (isValid && $scope.params.checkBoxAgree &&
          $scope.params.fileUploadReceipts[0].listFiles.length > 0) {

          $scope.env.showValid = false;
          $scope.env.row = 0;

          // Go to top
          angular.element('html').animate({ scrollTop: 100 }, "slow");
          /* Firefox*/
          angular.element('body').animate({ scrollTop: 100 }, "slow");
          /* Chorme*/

          $scope.step = 2;

          params = angular.copy($scope.params);
          params.claimItems = createListClaimsView($scope.claimItemList);
          $scope.generateTable(params);
        }

      } else { //For admin edit

        if (isValid && $scope.params.checkBoxAgree && $scope.params.fileUploadReceipts[0].listFiles.length > 0) {

          $scope.env.showValid = false;
          $scope.env.row = 0;
          $scope.step = 2;

          params = angular.copy($scope.params);
          params.claimItems = createListClaimsView($scope.claimItemList);
          $scope.generateTable(params);
        }

      }


    };

    function createListClaims(data) {
      var claimItemList = [];

      angular.forEach(data, function (item) {
        var claimItem = item.model;
        // Format date
        claimItem.dateIncurred = utils.dateToShort(claimItem.dateIncurred);
        claimItemList.push(claimItem);
      });

      return claimItemList;
    }

    function createListClaimsView(data) {
      var claimItemList = [];

      angular.forEach(data, function (item) {
        var claimItem = item.model;
        claimItemList.push(claimItem);
      });

      return claimItemList;
    }

    $scope.submitReview = function () {
      $scope.params.listItem = createListItem($scope.params.fileUploadReceipts);

      var params = angular.copy($scope.params);

      // Change name from dateTemp to date
      params.date = utils.dateToShort($scope.paramEdit.date);
      delete params.dateTemp;

      // Format date
      params.insuredBirthdate = utils.dateToShort(params.insuredBirthdate);
      params.claimantBirthdate = utils.dateToShort(params.claimantBirthdate);

      params.claimItems = createListClaims($scope.claimItemList);

      var objectPUT = {
        'id': claimInfo.id,
        'claimData': JSON.stringify(params),
        'ListFile': params.listItem,
        'participantId': claimInfo.participantId,
        'status': claimInfo.status,
        'email': params.email,
        'relationship': params.relationship,
        'ssn': params.ssn,
        'isDownloaded': params.isDownloaded,

        'groupName': params.groupName,
        'groupNumber': params.groupNumber,

        'insuredFirstName': params.firstName,
        'insuredMiddleName': params.middleName,
        'insuredLastName': params.lastName,
        'insuredBirthdate': params.insuredBirthdate,

        'ClaimFirstName': params.claimantName.firstName,
        'claimMiddleName': params.claimantName.middleName,
        'ClaimLastName': params.claimantName.lastName,
        'claimantBirthdate': params.claimantBirthdate

      };


      benicompclaims.put(objectPUT)
        .then(function (result) {

          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Success',
                  summary: false,
                  style: 'ok',
                  message: "Update Successful"
                };
              }
            }
          });
          $scope.modal.result.then(function () {

            if ($scope.isParticipant) {
              $state.go('loggedIn.modules.bcs-par-claims');
            } else {
              $state.go('loggedIn.modules.manager-claims');
            }

          });

        }, function (err) {

          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Update Fail',
                  summary: false,
                  style: 'ok',
                  message: "Please try again"
                };
              }
            }
          });

        });

    };

    // Previous
    $scope.previous = function (step) {
      // Go to top
      angular.element('html').animate({ scrollTop: 100 }, "slow");
      /* Firefox*/
      angular.element('body').animate({ scrollTop: 100 }, "slow");
      /* Chorme*/

      $scope.step = step;
    };

    // Update amount total
    $scope.$watch('claimItemList', function () {
      var amountTotal = 0;
      var amountEligibleDollars = 0;
      var amountEligibleCents = 0;
      _.forEach($scope.claimItemList, function (item) {
        var claimItem = item.model;
        if (claimItem) {
          //amountTotal += parseFloat(claimItem.amountOfExpenseDollars + '.' + claimItem.amountOfExpenseCents);
          amountEligibleDollars = parseInt(claimItem.amountEligibleDollars);
          if (_.isNaN(amountEligibleDollars)) {
            amountEligibleDollars = 0;
          }
          amountEligibleCents = parseInt(claimItem.amountEligibleCents);
          if (_.isNaN(amountEligibleCents)) {
            amountEligibleCents = 0;
          }
          amountTotal += parseFloat(amountEligibleDollars + '.' + amountEligibleCents);
        }

      });

      $scope.env.amountTotal = amountTotal;
    }, true);


    /*** Start Upload file ***/
    $timeout(function () {
      //claimUpload('file_element_upload_receipts', CONFIGS.baseURL(), apiService.defaultHeaders);
    });

    //create file
    $timeout(function () {
      angular.forEach($scope.params.fileUploadReceipts, function (item, keyItem) {

        var id = keyItem;
        claimUpload('file_element_' + id, CONFIGS.baseURL(), apiService.defaultHeaders);

        angular.forEach(item.listFiles, function (file, keyIndex) {
          createOneFile(file, keyIndex, keyItem);
        });

      });
    }, 200);


    function createDataEditFileReceiptsClaim(dataFiles) {
      var tmpFiles = [];
      angular.forEach(dataFiles, function (file, keyItem) {
        file['documentFilename'] = Math.floor((Math.random() * 100) + 1) + '-' + file.filename;
        tmpFiles.push(file);
      });

      return tmpFiles;
    }

    $scope.removeGroupFileUploadReceipts = function (data, index) {
      $scope.params.fileUploadReceipts.splice(index, 1);
    };


    $scope.deleteFile = function (documentFilename, holder_id, indexGroup) {
      $("#" + holder_id).fadeOut("slow", function () {
        $(this).remove();
      });

      angular.forEach($scope.params.fileUploadReceipts[indexGroup].listFiles, function (item, key) {
        if (item.documentFilename === documentFilename) {
          $scope.params.fileUploadReceipts[indexGroup].listFiles.splice(key, 1);
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
        $scope.params.fileUploadReceipts.push({ "listFiles": [] });

        $timeout(function () {
          var id = $scope.params.fileUploadReceipts.length - 1;
          claimUpload('file_element_' + id, CONFIGS.baseURL(), apiService.defaultHeaders);
        }, 100);
      }
    };

    function createOneFile(data, keyIndex, keyItem) { //For Edit


      var queue_item_id = "uploadifive-file_element_" + keyItem + "-file-" + 'response' + keyIndex;

      var tmpHTML = '<div class="uploadifive-queue-item-response" id="' + queue_item_id + '">';
      tmpHTML += "<a class=\"close\" onclick=\"angular.element(this).scope().deleteFile('" + data.documentFilename + "','" + queue_item_id + "', " + keyItem + ")\">" +
        "<img border=\"0\" src=\"assets/images/icons/delete.png\" /></a>";
      tmpHTML += '<div><span class="filename">';
      tmpHTML += '<img align="absmiddle" class="file_attached" src="assets/images/icons/attach.gif"><a href="' + CONFIGS.baseURL() + '/benicompclaimfiles/download?filenames=' + data.respondAPI.toString() + '">' + data.filename + ' (' + data.filesize + ')</a></span>';
      tmpHTML += '<span class="fileinfo"> - Responsed</span></div>';
      tmpHTML += '<div class="progress" style="display: none;"><div class="progress-bar"></div></div></div>';


      angular.element('#file_element_' + keyItem + '_queue').append(tmpHTML);
    }

    function claimUpload(elementId, baseUrl, defaultHeaders) {
      var resource = baseUrl + '/benicompclaimfiles/upload';

      if (is_support_html5_uploader()) {
        $('#' + elementId).uploadifive({
          'uploadScript': resource,
          'buttonText': '<span>Upload Files</span>',
          'removeCompleted': false,
          'formData': {},
          'auto': true,
          'multi': true,
          'queueSizeLimit': 9999,
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
              $.postMessage({ mf_iframe_height: $('body').outerHeight(true) }, '*', parent);
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
              $scope.params.fileUploadReceipts[$scope.env.groupFileUploadSelected].listFiles.push({
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
              $.postMessage({ mf_iframe_height: $('body').outerHeight(true) }, '*', parent);
            }

          }
        });
      }
    }

    /*** End Upload file ***/



    function init() {
      getListClaimant(claimInfo.participantId);
    }

    init();
  }
  );
