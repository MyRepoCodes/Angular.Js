angular.module('app.modules.popup.sendmail', [])

  .controller('PopupSendmailController',
    function ($scope, $modalInstance,LIST_IDS, API, LIST_PARTICIAPNT) {
      $scope.list_particiapnt = LIST_PARTICIAPNT;
      $scope.list_IDS = LIST_IDS;
      $scope.isLoading = false;
      $scope.statusSendMail = "";

      // notify
      function notify(listIdParticipant) {
        $scope.isLoading = true;
        listIdParticipant = listIdParticipant.split(",");
        API.sendmail({
          participantIds: listIdParticipant
        }).then(function (response) {
          $scope.statusSendMail = "success";
          $scope.isLoading = false;
          //$modalInstance.close($scope.list_IDS);
        }, function () {
          $scope.statusSendMail = "error";
          $scope.isLoading = false;
        });
      }

      // Choice user
      $scope.sendMail = function () {
        notify($scope.list_IDS);
      };

      $scope.cancel = function () {
        $modalInstance.close(false);
      };
    }
  );
