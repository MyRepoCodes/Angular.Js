angular.module('app.modules.mail.detail', [])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.mail.detail', {
      url: '/{:fold}/{:mailId}',
      views: {
        '': {
          templateUrl: 'modules/mail/detail/detail.tpl.html',
          controller: 'MailDetailController',
          resolve: {
            mailInfo:function ($stateParams, mails) {
              var params = {
                embed: 'sender,receiver'
              };
              return mails.find($stateParams.mailId, params).then(function(mail){
                return mail;
              }, function () {
                return false;
              });
            }
          }
        }
      }
    });
})

.controller('MailDetailController',  function($scope, $state, mails, mailInfo, $stateParams) {
  $scope.mailInfo = mailInfo;
  $scope.fold = $stateParams.fold;
  
  // Init Model
  $scope.params = {
    subject: mailInfo.subject,
    body: '',
    receiverId: mailInfo.receiverId
  };

  // Update mail read
  if (!mailInfo.isRead) {
    mails.patch({id: mailInfo.id, isRead: true});
  }

  if (mailInfo === false) {
    $state.go('loggedIn.modules.mail.list', {fold: $scope.fold});
  }

  $scope.deleteMail = function () {
    var API;
    if ($scope.fold === 'sent') {
      API = mails.deleteByCurrentUserFromSendbox;
    } else {
      API = mails.deleteByCurrentUserFromInbox;
    }

    API($scope.mailInfo.id).then(function () {
      $state.go('loggedIn.modules.mail.list', {fold: $scope.fold});
    }, function () {
      $state.go('loggedIn.modules.mail.list', {fold: $scope.fold});
    });
  };

  $scope.setBody = function ($element, event) {
    $scope.params.body = angular.element($element).html();
  };

  $scope.sendReply = function () {
    mails.post($scope.params).then(function (response) {
      $state.go('loggedIn.modules.mail.list', {fold: 'sent'});
    }, function (error) {
    });
  };
});