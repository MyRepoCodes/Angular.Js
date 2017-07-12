angular.module('directive.select-files', [])

.value('selectFileId', 0)

/***
 * <select-files-upload data-ng-model="model" data-upload-url="uploadUrl"></select-files-upload>
 */
.directive('selectFilesUpload', function ($timeout, apiService, utils, selectFileId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      ngModel: '=ngModel',
      uploadUrl: '=uploadUrl'
    },
    templateUrl: 'directives/select-files/select-files-upload.tpl.html',
    controller: function ($scope) {
      if (typeof $scope.$parent.selectFileId === "number") {
        $scope.selectFileId = $scope.$parent.selectFileId;

      } else {
        $scope.selectFileId = selectFileId++;
      }
    },
    link: function ($scope, $element, $attrs) {
      $timeout(function () {
        claimUpload('file_element_' + $scope.selectFileId, $scope.uploadUrl , apiService.defaultHeaders);
      });

      $scope.deleteFile = function (documentFilename, holder_id) {
        $("#" + holder_id).fadeOut("slow", function () {
          $(this).remove();
        });

        // Remove from params
        for (var i = 0; i < $scope.ngModel.length; i++) {
          if ($scope.ngModel[i].documentFilename === documentFilename) {
            $scope.ngModel.splice(i, 1);
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
      function check_upload_queue(element_id, is_multi, queue_limit, alert_message) {
        //check for queue limit
        if (is_multi === true) {
          var queue_children = $("#" + element_id + "_queue").children().not('.uploadifyError');
          if (queue_children.length > queue_limit) {
            alert(alert_message);

            for (var i = 0; i <= queue_children.length; i++) {
              if (i >= queue_limit) {
                $("#" + element_id).uploadifyCancel(queue_children.eq(i).attr('id').slice(-6));
              }
            }
          }
        }
      }

      function claimUpload(elementId, uploadUrl, defaultHeaders) {
        if (is_support_html5_uploader()) {
          $('#' + elementId).uploadifive({
            'uploadScript': uploadUrl,
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
                // Add file to params
                $scope.ngModel.push({
                  documentFilename: response_json.data.documentFilename,
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
                $.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent);
              }
            }
          });
        } else if ($.browser.flash === true) {
          $('#' + elementId).uploadify({
            'uploader': 'assets/plugins/uploadify/uploadify.swf',
            'script': uploadUrl,
            'cancelImg': 'assets/images/icons/stop.png',
            'removeCompleted': false,
            'displayData': 'percentage',
            'scriptData': {},
            'fileExtBlocked': 'php,php3,php4,php5,phtml,exe,pl,cgi,html,htm,js',
            'auto': true,
            'multi': true,
            'queueSizeLimit': 5,
            'onQueueFull': function (event, queueSizeLimit) {
              alert('This field is limited to maximum 5 files.');
            },
            'queueID': elementId + "_queue",
            'buttonImg': 'assets/images/upload_button.png',
            'onSetRequestHeader': function (xhr) {
              for (var name in defaultHeaders) {
                xhr.setRequestHeader(name, defaultHeaders[name]);
              }
            },
            'onError': function (event, ID, fileObj, errorObj) {
              if (errorObj.type === 'file_size_limited') {
                $('#' + elementId + ID + " span.percentage").text(' - Error. Maximum 2MB allowed.');
              } else if (errorObj.type === 'file_type_blocked') {
                $('#' + elementId + ID + " span.percentage").text(" - Error. This file type is not allowed.");
              }

            },
            'onSelectOnce': function (event, data) {
              check_upload_queue(elementId, true, 5, 'This field is limited to maximum 5 files.');

              if ($("html").hasClass("embed")) {
                $.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent);
              }
            },
            'onAllComplete': function (event, data) {
              if ($("html").hasClass("embed")) {
                $.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent);
              }
            },
            'onComplete': function (event, ID, fileObj, response, data) {
              var is_valid_response = false;
              var response_json;
              try {
                response_json = jQuery.parseJSON(response);
                is_valid_response = true;
              } catch (e) {
                is_valid_response = false;
                alert(response);
              }

              var queue_item_id = fileObj.queueItem.attr('id');
              if (is_valid_response === true && response_json.errors === null) {
                // Add file to params
                $scope.ngModel.push({
                  documentFilename: response_json.data.documentFilename,
                  filename: fileObj.name,
                  filesize: fileObj.size
                });

                var remove_link = "<a onclick=\"angular.element(this).scope().deleteFile('" + response_json.data.documentFilename + "','" + queue_item_id + "')\"><img border=\"0\" src=\"assets/images/icons/delete.png\" /></a>";
                $('#' + elementId + " > div.cancel > a").replaceWith(remove_link);
                $('#' + elementId + " > span.fileName").prepend('<img align="absmiddle" class="file_attached" src="assets/images/icons/attach.gif">');
              } else {
                $('#' + elementId).addClass('uploadifyError');
                $('#' + elementId + " div.cancel > a ").replaceWith('<img border="0" src="assets/images/icons/exclamation.png" />');
                $('#' + elementId + " span.percentage").text(" - Error! Unable to upload");
              }

              if ($("html").hasClass("embed")) {
                $.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent);
              }
            }
          });
        }
      }
    }
  };
})

/***
 * <select-files form="form" data-ng-model="model"  data-upload-url="uploadUrl" values="objectValues" row="row" tabindex="tabindexStar" control-label="name"></select-files>
 * element total: 1
 */
.directive('selectFiles', function (selectFileId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      uploadUrl: '=uploadUrl',
      objectValues: '=values'
    },
    templateUrl: 'directives/select-files/select-files.tpl.html',
    controller: function ($scope) {
      $scope.selectFileId = selectFileId++;
    },
    link: function ($scope, $element, $attrs) {
      $scope.controlLabel = $attrs.controlLabel;
      $scope.tabindexStart = $attrs.tabindex;
      $scope.currentRow = $attrs.row;
      $scope.required = ($attrs.required === undefined ? false : true);

      // Temp model
      $scope.temps = {
        fileRequire: ''
      };

      // Check file require
      $scope.$watch('ngModel', function (newVal) {
        if (newVal.length > 0) {
          $scope.temps.fileRequire = 1;
        } else {
          $scope.temps.fileRequire = '';
        }
      }, true);
    }
  };
});
