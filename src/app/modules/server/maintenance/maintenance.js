angular.module("app.modules.server.maintenance", [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.server.maintenance', {
        url: '/maintenance',
        views: {
          'manager-content': {
            templateUrl: 'modules/server/maintenance/maintenance.tpl.html',
            controller: 'ServerMaintenanceController'
          }
        }
      });
  }
  )

  .controller('ServerMaintenanceController',
  function ($scope, $state, $translate, $filter, $timeout, $modal, apiService, systemconfigurations, utils, CONFIGS) {

    //init Param
    $scope.env = {
      successMessage: "",
      baseURL: CONFIGS.baseURL()
    };

    $scope.params = {
      isMaintenance: false,
      reasons: "PULSE is currently undergoing maintenance. In the meantime take a stroll outside and enjoy the day",
      isHaveImage: true,
      file: {
        documentFilename: "default",
        respondAPI: "",
        filename: "default",
        filesize: 0
      }
    };

    function getInfoMaintaining() {
      systemconfigurations.getOne()
        .then(function (response) {
          console.log(response);

          if (response.configName === "isMaintaining") {
            if (response.configValue === 'true') {
              $scope.params.isMaintenance = true;

              if (response.extraData) {
                var tmpContent = JSON.parse(response.extraData);

                $scope.params.reasons = tmpContent.reasons;
                $scope.params.isHaveImage = tmpContent.isHaveImage;

                if (tmpContent.isHaveImage && tmpContent.file) {
                  createOneFile(tmpContent.file);
                }


              }


            } else {
              createOneFile($scope.params.file);
            }
          }

        }, function (err) {

        });

    }

    function buildObjectForAPI(data) {

      var result = {
        "configName": "isMaintaining",
        "configValue": data.isMaintenance + ""
      };

      if (data.isMaintenance) {
        result["extraData"] = JSON.stringify(data);
      } else {
        result["extraData"] = null;
        
      }

      return result;
    }
    $scope.submit = function (data) {
      $scope.env.successMessage = "";
      systemconfigurations.post(buildObjectForAPI(data))
        .then(function (response) {
          $scope.env.successMessage = "Update successful";
        }, function (err) {
          $scope.env.successMessage = err;
        });

    };

    function init() {
      getInfoMaintaining();
    }

    init();

    /*** Start Upload file ***/
    $timeout(function () {
      claimUpload('file_element', CONFIGS.baseURL(), apiService.defaultHeaders);

    });


    $scope.deleteFile = function (documentFilename, holder_id, indexGroup) {
      $("#" + holder_id).fadeOut("slow", function () {
        $(this).remove();
      });

      $('#file_element').uploadifive('clearQueue');

      // ADD TO MODEL
      $scope.params.isHaveImage = false;

    };


    function createOneFile(data) { //For Edit


      var queue_item_id = "uploadifive-file_element_-file-response";

      var tmpHTML = '<div class="uploadifive-queue-item-response" id="' + queue_item_id + '">';
      tmpHTML += "<a class=\"close\" onclick=\"angular.element(this).scope().deleteFile('" + data.documentFilename + "','" + queue_item_id + "')\">" +
        "<img border=\"0\" src=\"assets/images/icons/delete.png\" /></a>";
      tmpHTML += '<div><span class="filename">';

      if (data.filesize) {
        tmpHTML += '<img align="absmiddle" class="file_attached" src="assets/images/icons/attach.gif"><a target="_blank" href="' + CONFIGS.baseURL() + '/systemconfigurations/maintainanceLogo">' + data.filename + ' (' + data.filesize + ')</a></span>';
      } else {
        tmpHTML += '<img align="absmiddle" class="file_attached" src="assets/images/icons/attach.gif">' + data.filename + '</span>';
      }

      tmpHTML += '<span class="fileinfo"> - Responsed</span></div>';
      tmpHTML += '<div class="progress" style="display: none;"><div class="progress-bar"></div></div></div>';


      angular.element('#file_element_queue').append(tmpHTML);
    }

    function deleteFileResponse(holder_id) {

      $("#" + holder_id).fadeOut("slow", function () {
        $(this).remove();
      });

    }


    //Check if HTML5 uploader is supported by the browser
    function is_support_html5_uploader() {
      if (window.File && window.FileList && window.Blob && (window.FileReader || window.FormData)) {
        return true;
      } else {
        return false;
      }
    }

    /** File Upload Functions **/
    function claimUpload(elementId, baseUrl, defaultHeaders) {
      var resource = baseUrl + '/systemconfigurations/uploadMaintainanceLogo';

      if (is_support_html5_uploader()) {
        $('#' + elementId).uploadifive({
          'uploadScript': resource,
          'buttonText': '<span>Upload Files</span>',
          'removeCompleted': false,
          'formData': {},
          'auto': true,
          'multi': false,
          'queueSizeLimit': 1,
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

              var documentFilename = Math.floor((Math.random() * 100) + 1) + '-' + file.name;
              deleteFileResponse('uploadifive-file_element_-file-response');

              // ADD TO MODEL
              $scope.params.isHaveImage = true;
              $scope.params.file = {
                documentFilename: response_json.data.documentFilename,
                respondAPI: response_json.data,
                filename: file.name,
                filesize: utils.formatSizeUnits(file.size)
              };

              var remove_link = "<a class=\"close\" onclick=\"angular.element(this).scope().deleteFile('" + documentFilename + "','" + queue_item_id + "', " + $scope.env.groupFileUploadSelected + ")\"><img border=\"0\" src=\"assets/images/icons/delete.png\" /></a>";

              $("#" + queue_item_id + " a.close").replaceWith(remove_link);
              $("#" + queue_item_id + ' span.filename').prepend('<img align="absmiddle" class="file_attached" src="assets/images/icons/attach.gif">');
            } else {

              // ADD TO MODEL
              $scope.params.isHaveImage = false;
              $scope.params.file = null;


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
