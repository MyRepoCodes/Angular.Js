angular.module('app.modules.mail.list', [])

.factory('mailService', function ($q, mails) {
  return {
    getMails: function (fold, page, pageSize) {
      var deferred = $q.defer();

      var defaultData = {
        mailList: [],
        totalCount: 0
      };
      var params = {
        page: page,
        pageSize: pageSize,
        sort: '-createdDate',
        embed: 'sender,receiver'
      };
      var headers;
      if (fold === 'sent') {
        headers = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeletedBySender",
              operator: "equal",
              condition: "or",
              value: false
            }
          ])
        };
        mails.getSendBox(params, headers).then(function (response) {
          deferred.resolve(response);
        }, function () {
          deferred.resolve(defaultData);
        });
      } else {
        headers = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeletedByReceiver",
              operator: "equal",
              condition: "or",
              value: false
            }
          ])
        };
        mails.getInbox(params, headers).then(function (response) {
          deferred.resolve(response);
        }, function () {
          deferred.resolve(defaultData);
        });
      }

      return deferred.promise;
    }
  };
})

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.mail.list', {
      url: '/inbox/{fold}',
      views: {
        '': {
          templateUrl: 'modules/mail/list/list.tpl.html',
          controller: 'MailListController',
          resolve: {
            mailData: function ($stateParams, mailService, CONFIGS) {
              return mailService.getMails($stateParams.fold, 1, CONFIGS.countPerPage).then(function (response) {
                return response;
              });
            }
          }
        }
      }
    });
})

.controller('MailListController', function($scope, CONFIGS, $stateParams, mailService,mailData) {
  $scope.mailList = mailData.mailList;
  $scope.totalCount = mailData.totalCount;
  $scope.page = 1;
  $scope.pageSize = CONFIGS.countPerPage;
  $scope.fold = $stateParams.fold;

  function getMails() {
    mailService.getMails($stateParams.fold, $scope.page, $scope.pageSize).then(function (response) {
      $scope.mailList = response.mailList;
      $scope.totalCount = response.totalCount;
    });
  }

  $scope.refresh = function () {
    $scope.page = 1;
    $scope.pageSize = CONFIGS.countPerPage;
    getMails();
  };

  $scope.nextPage = function () {
    $scope.page++;
    getMails();
  };

  $scope.previousPage = function () {
    $scope.page--;
    getMails();
  };
});