/**
 * <claim-item data-form="form" data-ng-model="objectModel" data-remove="remove" data-index="index" data-env="env" data-tabindex="tabindex"></claim-item>
 */
angular.module('app.modules.claims.submit-claims.participant.claim-item', [])

  .value('claimItemId', 0)

  .directive('claimItem', function (DATECONFIGS, PATTERNREGEXS, CONFIGS, $timeout, apiService, utils, claimItemId) {
    return {
      require: 'ngModel',
      restrict: 'EA',
      scope: {
        form: '=form',
        ngModel: '=ngModel',
        elementIndex: '@index',
        env: '=env',
        remove: '&'
      },
      templateUrl: 'modules/claims/submit-claims/participant/claim-item/claim-item.tpl.html',
      controller: function ($scope) {

        // init env
        $scope._env = {
          isErrorAmount: false,
          dateOptions: {
            'show-weeks': false,
            'format-month': 'MM',
            "max-date": "'" + utils.getCurrentDateString() + "'",
            'min-date': "'1900-01-01'"
          }
        };

        // Init model
        if (_.isEmpty($scope.ngModel)) {
          $scope.ngModel.typeOfClaimItem = 1;
          $scope.ngModel.providerOfServices = '';
          $scope.ngModel.dateIncurred = utils.getCurrentDateString();
          $scope.ngModel.amountOfExpenseDollars = '';
          $scope.ngModel.amountEligibleDollars = '';
          $scope.ngModel.files = [];
        } else {
          $scope.ngModel = createDataEditClaimItem($scope.ngModel);
        }

        // Check amount
        $scope.$watchGroup(['ngModel.amountOfExpenseDollars', 'ngModel.amountEligibleDollars'],
          function (newVal, oldVal) {
            if (newVal[0] && newVal[1]) {
              var tmpAmountOfExpense = parseFloat(newVal[0]);
              var tmpAmountEligible = parseFloat(newVal[1]);

              if (tmpAmountOfExpense < tmpAmountEligible) {
                $scope._env.isErrorAmount = true;
              } else {
                $scope._env.isErrorAmount = false;
              }

            } else {
              $scope._env.isErrorAmount = false;
            }

          });

        //create data for edit claim item
        function createDataEditClaimItem(claimItem) {

          var tmpFiles = [];
          claimItem['dateIncurred'] = utils.dateServerToLocalTime(claimItem.dateIncurred);
          angular.forEach(claimItem.files, function (file) {
            file['documentFilename'] = Math.floor((Math.random() * 100) + 1) + '-' + file.filename;
            tmpFiles.push(file);
          });

          claimItem['files'] = tmpFiles;

          return claimItem;
        }
      },
      link: function ($scope, $element, $attrs) {
        $scope.patternRegexs = PATTERNREGEXS;
        $scope.dateOptions = DATECONFIGS.dateOptions;
        $scope.claimItemList = $scope.$parent.claimantList;

        $scope.inputId = claimItemId++;

        $scope.tabindex = 0;
        if ($attrs.hasOwnProperty('tabindex')) {
          $scope.tabindex = parseInt($attrs.tabindex);
          $attrs.$observe('tabindex', function (newVal) {
            $scope.tabindex = parseInt(newVal);
          });
        }

        // Temp model
        $scope.temps = {
          fileRequire: ''
        };

        // Check file require
        $scope.$watch('ngModel.files', function (newVal) {
          if (newVal.length > 0) {
            $scope.temps.fileRequire = 1;
          } else {
            $scope.temps.fileRequire = '';
          }
        }, true);

        // Callback
        $scope.removeClaimItem = function () {
          $scope.remove()($scope.ngModel);
        };

        //create file
        angular.forEach($scope.ngModel.files, function (item, keyItem) {
          createOneFile(item, keyItem);
        });



        /*** Start Upload file ***/
        $timeout(function () {
          //claimUpload('file_element_' + $scope.inputId, CONFIGS.baseURL(), apiService.defaultHeaders);
        });

        $scope.deleteFile = function (documentFilename, holder_id) {
          $("#" + holder_id).fadeOut("slow", function () {
            $(this).remove();
          });

          // Remove from ngModel
          for (var i = 0; i < $scope.ngModel.files.length; i++) {
            if ($scope.ngModel.files[i].documentFilename === documentFilename) {
              $scope.ngModel.files.splice(i, 1);
              break;
            }
          }
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

        function createOneFile(data, keyItem) {

          var queue_item_id = "uploadifive-file_element_" + $scope.inputId + "-file-" + 'response' + keyItem;

          var tmpHTML = '<div class="uploadifive-queue-item-response" id="' + queue_item_id + '">';
          tmpHTML += "<a class=\"close\" onclick=\"angular.element(this).scope().deleteFile('" + data.documentFilename + "','" + queue_item_id + "')\">" +
            "<img border=\"0\" src=\"assets/images/icons/delete.png\" /></a>";
          tmpHTML += '<div><span class="filename">';
          tmpHTML += '<img align="absmiddle" class="file_attached" src="assets/images/icons/attach.gif"><a href="' + CONFIGS.baseURL() + '/benicompclaimfiles/download?filenames=' + data.respondAPI.toString() + '">' + data.filename + ' (' + data.filesize + ')</a></span>';
          tmpHTML += '<span class="fileinfo"> - Responsed</span></div>';
          tmpHTML += '<div class="progress" style="display: none;"><div class="progress-bar"></div></div></div>';

          $element.find('.file_queue').append(tmpHTML);
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
                  $scope.ngModel.files.push({
                    documentFilename: response_json.data.documentFilename,
                    respondAPI: response_json.data,
                    filename: file.name,
                    filesize: utils.formatSizeUnits(file.size)
                  });

                  var remove_link = "<a class=\"close\" onclick=\"angular.element(this).scope().deleteFile('" + response_json.data.documentFilename + "','" + queue_item_id + "')\"><img border=\"0\" src=\"assets/images/icons/delete.png\" /></a>";

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
      }
    };
  });