angular.module('app.modules.popup.show-content', [])

.controller('PopupShowContentController', function($scope, $timeout, $modalInstance, DATA, TYPE, API) {
  $scope.type = TYPE;
  $scope.data = DATA;
  $scope.isLoading = true;

  $scope.cancel = function() {
    $modalInstance.close(false);
  };

  $timeout(function() {
    $scope.isLoading = false;
  }, 200);

  //************************ START: for contact ************************//
  // Send Email reply
  $scope.sendEmail = function(info, contentSendEmail) {
    $scope.statusSendMail = '';
    $scope.errors = '';
    var params = {
      contactId: info.id,
      subject: contentSendEmail.subject,
      content: contentSendEmail.content
    };

    API.sendMail(params)
      .then(function(data) {
        $scope.statusSendMail = "Send E-mail success";
      }, function(err) {
        $scope.errors = err.errors[0].errorMessage;
       });
  };
  //************************ END: for contact ************************//

});
