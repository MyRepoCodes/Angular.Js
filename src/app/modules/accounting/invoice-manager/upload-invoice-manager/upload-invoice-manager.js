angular.module('app.modules.accounting.invoice-manager.upload', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.invoice-manager-upload', {
        url: '/invoice-manager-upload',
        views: {
          'main-content': {
            templateUrl: 'modules/accounting/invoice-manager/upload-invoice-manager/upload-invoice-manager.tpl.html',
            controller: 'UploadInvoiceManagerController'
          }
        }
      });
  })

  .controller('UploadInvoiceManagerController',
  function ($scope, $state, CONFIGS, security, $modal, $translate, spoolers, utils) {

    //Data of File Type 
    var _listFileTypes_ = {
      'luminXSpoolerTXTFile': 'LuminX Spooler TXT File'
    };

    $scope.env = {

      fileTypeSelected: null,
      listFileTypes: _listFileTypes_,

    };



    $scope.importFiles = function ($element) {

      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'UserManagerParticipantUploadConfirmController',
          templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            },
            type: function () {
              return "invoice";
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {
            spoolers.import($element.files).then(function (data) {
              $scope.resultUploadFileClient = data;
              $element.value = "";
              
            }, function (error) {
              var message = error.errors[0].errorMessage;
              $element.value = "";
              $scope.openError(message);
            });

          } else {
            $element.value = "";
          }
        });
      }

    };



    $scope.selectFileType = function (data) {

    };

  });
