angular.module('app.modules.claims.submit-claims.participant', [
  'app.modules.claims.submit-claims.participant.claim-item',
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.submit-claims-participant', {
        url: '/submit-claims-participant',
        views: {
          'main-content': {
            templateUrl: 'modules/claims/submit-claims/participant/participant.tpl.html',
            controller: 'ParticipantClaimsController',
          }
        },
        resolve: {
          deps: ['$ocLazyLoad',
            function ($ocLazyLoad) {
              return [];
            }]
        }
      });
  })

  .controller('ParticipantClaimsController',
  function ($scope, $state, PATTERNREGEXS, DATECONFIGS, apiService, $timeout, security, utils, employers, CONFIGS, benicompclaims, $modal) {
    $scope.patternRegexs = PATTERNREGEXS;
    $scope.dateOptions = DATECONFIGS.dateOptions;
    $scope.currentUser = security.currentUser;
    $scope.currentEmployer = security.currentUser.employer;
    $scope.step = 0;
    $scope.claimantList = [];
    $scope.tableData = [];
    $scope.respondAPI = null;

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      currentClaimant: null,
      amountTotal: 0,
      groupFileUploadSelected: null,
      isDeleteClaim: false,
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

    // Participant's name
    if (!$scope.currentUser.isLocked) {
      $scope.claimantList.push({
        name: {
          firstName: $scope.currentUser.firstName,
          middleName: $scope.currentUser.middleName,
          lastName: $scope.currentUser.lastName,
        },
        id: security.currentUser.id,
        gender: security.currentUser.gender,
        relationship: 1,
        dateOfBirth: utils.dateServerToLocalTime($scope.currentUser.dateOfBirth),
      });
    }

    // Spouse's name
    security.getListSpouseActive().then(function (listSpouse) {
      var spouse = listSpouse[0];
      if (spouse && !spouse.isLocked) {
        $scope.claimantList.push({
          name: {
            firstName: spouse.firstName,
            middleName: spouse.middleName,
            lastName: spouse.lastName
          },
          id: spouse.id,
          relationship: 2,
          gender: spouse.gender,
          dateOfBirth: utils.dateServerToLocalTime(spouse.dateOfBirth),
        });

      }

      // Dependent's name
      security.getListDependentsActive().then(function (dependents) {

        _.forEach(dependents, function (dependent) {

          if (!dependent.isLocked) {
            $scope.claimantList.push({
              name: {
                firstName: dependent.firstName,
                middleName: dependent.middleName,
                lastName: dependent.lastName
              },
              id: dependent.id,
              gender: dependent.gender,
              relationship: 3,
              dateOfBirth: utils.dateServerToLocalTime(dependent.dateOfBirth),
            });
          }

        });

      });
    });

    //$scope.env.currentClaimant = $scope.claimantList[0];

    // Init Model
    $scope.params = {
      // Participant Tab
      groupName: $scope.currentEmployer.clientName,
      groupNumber: $scope.currentEmployer.groupNumber,
      firstName: $scope.currentUser.firstName,
      middleName: $scope.currentUser.middleName,
      lastName: $scope.currentUser.lastName,
      ssn: $scope.currentUser.ssn ? $scope.currentUser.ssn.slice(5, 9) : "",
      insuredBirthdate: utils.dateServerToLocalTime($scope.currentUser.dateOfBirth),
      email: $scope.currentUser.email,
      claimantName: $scope.env.currentClaimant ? $scope.env.currentClaimant.name : null,
      claimantGender: $scope.env.currentClaimant ? $scope.env.currentClaimant.gender : null,
      claimantId: $scope.env.currentClaimant ? $scope.env.currentClaimant.id : null,
      relationship: $scope.env.currentClaimant ? $scope.env.currentClaimant.relationship : null,
      claimantBirthdate: $scope.env.currentClaimant ? $scope.env.currentClaimant.dateOfBirth : null,
      // Claims Tab
      numberOfClaimItems: 1,
      claimItems: [],
      fileUploadReceipts: [{
        "listFiles": []
      }],
      listItem: [],
      dateTemp: utils.dateServerToLocalTime(utils.getCurrentDateString()),
      checkBoxAgree: false,
    };

    // Item = {model:{}}
    $scope.claimItemList = [];

    // Add Claim Item
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
        if ($scope.params.numberOfClaimItems >= 50) {

          $modal.open({
            controller: 'ErrorController',
            templateUrl: 'modules/alert/error.tpl.html',
            size: 'sm',
            resolve: {
              message: function () {
                return "Only allow max 50 claim items.";
              }
            }
          });
        } else {
          $scope.params.numberOfClaimItems += 1;
        }

      }

    };

    // End Add Claim Item

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
            value: '$' + claim.amountOfExpenseDollars
          });
          $scope.tableData.push({
            label: 'Amount Eligible for Reimbursement by BeniComp Select',
            value: '$' + claim.amountEligibleDollars
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
        value: null
      });

      $scope.tableData.push({
        label: 'Date',
        value: new Date(data.dateTemp).format('mmm dd, yyyy')
      });

      $scope.tableData.push({
        label: '<div>I understand that checking this box constitutes as my legal signature.</div>',
        value: null
      });

      $scope.tableData.push({
        label: 'Administered by: BeniComp, Inc., 8310 Clinton Park Drive, Fort Wayne, IN 46825 - Phone: (260) 482-7400 Fax: (260) 483-6255',
        value: null
      });

    };

    // Select claimant
    $scope.selectClaimant = function (claimant) {
      $scope.params.claimantName = claimant.name;
      $scope.params.claimantGender = claimant.gender;
      $scope.params.claimantId = claimant.id;
      $scope.params.relationship = claimant.relationship;
      $scope.params.claimantBirthdate = claimant.dateOfBirth;
    };

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

        //$scope.generateTable(angular.copy($scope.params));
      }
    };

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

    $scope.submitAddClaims = function (isValid) {
      $scope.env.showValid = true;
      if (isValid && $scope.params.checkBoxAgree && $scope.params.fileUploadReceipts[0].listFiles.length > 0) {

        $scope.params.listItem = createListItem($scope.params.fileUploadReceipts);

        $scope.env.showValid = false;
        $scope.env.row = 0;

        // Go to top
        angular.element('html').animate({ scrollTop: 100 }, "slow");
        /* Firefox*/
        angular.element('body').animate({ scrollTop: 100 }, "slow");
        /* Chorme*/

        $scope.step = 2;

        var params = angular.copy($scope.params);
        params.claimItems = createListClaimsView($scope.claimItemList);
        $scope.generateTable(params);
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

    // Save to DB
    $scope.submitReview = function () {
      var params = angular.copy($scope.params);

      // Change name from dateTemp to date
      params.date = utils.dateToShort(params.dateTemp);
      delete params.dateTemp;

      // Format date
      params.insuredBirthdate = utils.dateToShort(params.insuredBirthdate);
      params.claimantBirthdate = utils.dateToShort(params.claimantBirthdate);

      //UPDATE claim Items
      //params.claimItems = _.extend({}, claimItemList);
      params.claimItems = createListClaims($scope.claimItemList);


      var objectPost = {
        'claimData': JSON.stringify(params),
        'ListFile': params.listItem,
        'participantId': security.currentUser.id,
        'status': 4,
        'email': params.email,
        'relationship': params.relationship,
        'ssn': params.ssn,
        'isDownloaded': false,

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

      benicompclaims.post(objectPost).then(function (result) {
        $scope.respondAPI = result;
        $scope.step = 3;
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
      _.forEach($scope.claimItemList, function (item) {
        var claimItem = item.model;

        //amountTotal += parseFloat(claimItem.amountOfExpenseDollars + '.' + claimItem.amountOfExpenseCents);
        amountEligibleDollars = parseInt(claimItem.amountEligibleDollars);
        if (_.isNaN(amountEligibleDollars)) {
          amountEligibleDollars = 0;
        }
    
        amountTotal += parseFloat(amountEligibleDollars);
      });

      $scope.env.amountTotal = amountTotal;
    }, true);


    /*** Start Upload file ***/
    $timeout(function () {
      claimUpload('file_element_0', CONFIGS.baseURL(), apiService.defaultHeaders);
    });

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
          'queueSizeLimit': 999999,
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

  });
