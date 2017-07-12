angular.module('app.modules.registration.bcs.participant.direct-deposit', [])

  .controller('EnrollmentDirectDepositController', function ($rootScope, $scope, security, utils, $timeout, $modal, CONFIGS, apiService, DIRECTDEPOSIT, DirectDeposits) {

    $scope.directDepositConstants = DIRECTDEPOSIT;

    $scope.accountTypeList = {
      1: 'Checking',
      2: 'Savings',
    };

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      signature: null,
    };

    // Init model
    $scope.params = $scope.globalParams.dd;

    //Fix email
    if (!$scope.params.email) {
      $scope.params.email = $scope.globalParams.ec.email;
    }

    //Fix phone
    if (!$scope.params.homePhoneNumber) {
      $scope.params.homePhoneNumber = $scope.globalParams.ec.phoneNumber;
    }


    //create data for Post to server
    function createDataPost(params) {

      if ($scope.params.choiceType === 2) {
        params.changeEffectiveDate = utils.dateToShort(params.changeEffectiveDate);
        params.cancelEffectiveDate = "";
      } else if ($scope.params.choiceType === 3) {
        params.cancelEffectiveDate = utils.dateToShort(params.cancelEffectiveDate);
        params.changeEffectiveDate = "";
      } else {
        params.cancelEffectiveDate = "";
        params.changeEffectiveDate = "";
      }
      params.fileUploadVoidedChecks = JSON.stringify(params.fileUploadVoidedChecks);
      params.signedDate = utils.dateToShort(params.signedDate);

      return params;

    }

    $scope.submit = function (isValid) {
      $scope.env.showValid = true;
      $scope.env.row = 0;
      if (isValid && typeof $scope.env.signature === 'function' && !$scope.env.signature().isEmpty) {
        $scope.params.signature = $scope.env.signature().dataUrl;


        var objectPost = createDataPost(angular.copy($scope.params));

        DirectDeposits.post(objectPost).then(function (result) {

          $scope.env.showValid = false;
          $rootScope.$broadcast('enrollment:step:next', 2);

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


      }
    };

    // Enrollment Card
    $scope.previous = function () {
      if (typeof $scope.env.signature === 'function' && !$scope.env.signature().isEmpty) {
        $scope.params.signature = !$scope.env.signature().dataUrl;
      }

      $scope.env.row = 0;
      $scope.env.showValid = false;
      $rootScope.$broadcast('enrollment:step:next', 0);
    };


    /*** Start Upload file ***/
    $scope.$watch("currentStep", function (value) {
      if (value === 1) {
        $timeout(function () {
          claimUpload('file_element_0', CONFIGS.baseURL(), apiService.defaultHeaders);
        });
      }
    });

    $scope.removeGroupFileUploadReceipts = function (data, index) {
      $scope.params.fileUploadVoidedChecks.splice(index, 1);
    };

    $scope.deleteFile = function (documentFilename, holder_id, indexGroup) {
      $("#" + holder_id).fadeOut("slow", function () {
        $(this).remove();
      });

      angular.forEach($scope.params.fileUploadVoidedChecks[indexGroup].listFiles, function (item, key) {
        if (item.documentFilename === documentFilename) {
          $scope.params.fileUploadVoidedChecks[indexGroup].listFiles.splice(key, 1);
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
        $scope.params.fileUploadVoidedChecks.push({"listFiles": []});

        $timeout(function () {
          var id = $scope.params.fileUploadVoidedChecks.length - 1;
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
              $scope.params.fileUploadVoidedChecks[$scope.env.groupFileUploadSelected].listFiles.push({
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

    /*** End Upload file ***/


  });
