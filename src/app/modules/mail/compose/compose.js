angular.module('app.modules.mail.compose', [])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.mail.compose', {
      url: '/compose',
      views: {
        '': {
          templateUrl: 'modules/mail/compose/compose.tpl.html',
          controller: 'MailNewController'
        }
      }
    });
})

.controller('MailNewController',  function($scope, $state, mails) {
  // Init Model
  $scope.params = {
    to: [],
    subject: 'Subject',
    body: 'Go ahead&hellip;',
    //receiverId: '10ca420d-4720-44e6-87a7-e14771909517',
  };
  $scope.tolist = [];

  $scope.sendMail = function (isValid) {
    $scope.showValid = true;
    if (isValid) {
      var receiverIds = [];
      _.forEach($scope.params.to, function (mail) {
        receiverIds.push(mail.id);
      });
      receiverIds = _.unique(receiverIds);
      mails.sendMulti({
        subject: $scope.params.subject,
        body: $scope.params.body,
        receiverIds: receiverIds,
      }).then(function (response) {
        $scope.showValid = false;
        $state.go('loggedIn.modules.mail.list', {fold: 'sent'});
      }, function (error) {
      });
    }
  };

  $scope.setBody = function ($element, event) {
    $scope.params.body = angular.element($element).html();
  };

  $scope.addNew = function () {
    $state.reload();
  };

  var hasSuggest = false;

  function suggestMails($selectElement, $inputElement, keyword) {
    var inputWidth = $inputElement.width();
    hasSuggest = true;
    mails.getSuggestMail(keyword, undefined, false).then(function (response) {
      $scope.tolist = [];
      _.forEach(response, function (mail) {
        $scope.tolist.push({id: mail.id, name: mail.userName, email: mail.email});
      });
      if (angular.isArray($scope.params.to)) {
        $scope.tolist = $scope.params.to.concat($scope.tolist);
      }
      // Update chosen
      $selectElement.trigger('chosen:updated');
      $inputElement.val(keyword);
      $inputElement.width(inputWidth);

      hasSuggest = false;
    }, function () {
      hasSuggest = false;
    });
  }

  $scope.setSuggestMails = function ($element, event) {
    var input = angular.element('input', $element);
    var select = angular.element('select', $element);
    var keyword = input.val();
    if (keyword.length >= 2 && !hasSuggest) {
      suggestMails(select, input, keyword);
    }
  };
});