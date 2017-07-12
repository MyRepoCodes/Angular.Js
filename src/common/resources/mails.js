angular.module('resources.mails', [])

.factory('mails', function ($rootScope, $q, apiService, i18nNotifications) {
  // Set base url for resource (used as API endpoint)
  var resource = 'mailmessages';

  function formatResponse(mails) {
    var results = [];

    _.forEach(mails, function (mail) {
      var from = '';
      if (mail.sender) {
        from = mail.sender.email;
      }
      var to = {name: '', email: ''};
      if (mail.receiver) {
        to.name = mail.sender.userName;
        to.email = mail.receiver.email;
      }
      results.push({
        id: mail.id,
        subject: mail.subject,
        from: from,
        avatar: apiService.getBaseUrl() + '/users/avatar?key=' + mail.senderId,//'assets/images/default-profile.png',
        to: [to],
        attach: [
          //{"name": "c1.jpg", "url": "img/c1.jpg"},
        ],
        content: mail.body,
        date: mail.createdDate, //"18:00 6/15/2014",
        //label: 'work',
        //fold: 'starred' | 'important' | 'trash' | 'draft' | 'sent',
        fold: !!mail.isDeleted ? 'trash' : '',
        state: !mail.isRead ? 'unread' : 'read',
        senderId: mail.senderId,
        receiverId: mail.receiverId,
        isRead: mail.isRead,
      });
    });

    return results;
  }

  $rootScope.$on('mails:list:updated', function (event, mailList) {

  });

  $rootScope.$on('mails:created', function () {

  });

  $rootScope.$on('mails:edited', function (event, mail) {
    for (var i = 0; i < service.mailList.length; i++) {
      if (service.mailList[i].id === mail.id) {
        service.mailList[i] = mail;
        break;
      }
    }
  });

  $rootScope.$on('mails:removed', function (event, id) {
    for (var i = 0; i < service.mailList.length; i++) {
      if (service.mailList[i].id === id) {
        service.mailList.splice(i, 1);
        break;
      }
    }
  });

  var service = {
    currentMail: null,
    mailList: [],

    find: function (id, params) {
      var deferred = $q.defer();

      apiService.find(resource, id, params).then(function (response) {
        response = response.data.data;
        var data = formatResponse([response]);
        deferred.resolve(data[0]);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    getInbox: function (params, header, loading) {
      var deferred = $q.defer();

      apiService.get(resource + '/GetEmailInboxCurrentUser' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
        response = response.data.data;
        var data = {
          mailList: formatResponse(response.data),
          totalCount: response.totalCount
        };
        deferred.resolve(data);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    getSendBox: function (params, header, loading) {
      var deferred = $q.defer();

      apiService.get(resource + '/GetEmailSendboxCurrentUser' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
        response = response.data.data;
        var data = {
          mailList: formatResponse(response.data),
          totalCount: response.totalCount
        };
        deferred.resolve(data);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    getSuggestMail: function (keyword, header, loading) {
      var deferred = $q.defer();
      var params = {
        keyword: keyword
      };

      apiService.get(resource + '/SuggestMail' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
        response = response.data.data;
        deferred.resolve(response);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    post: function (params) {
      var deferred = $q.defer();

      apiService.post(resource, params).then(function (response) {
        response = response.data.data;

        $rootScope.$broadcast('mails:created', response);
        deferred.resolve(response);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    put: function (params) {
      var deferred = $q.defer();
      var id = params.id;
      delete params.id;

      apiService.put(resource + '/' + id, params).then(function (response) {
        response = response.data.data;
        deferred.resolve(response);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    patch: function (params) {
      var deferred = $q.defer();
      var id = params.id;
      delete params.id;

      apiService.put(resource + '/' + id, params).then(function (response) {
        response = response.data.data;
        deferred.resolve(response);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    delete: function (id) {
      var deferred = $q.defer();

      apiService.remove(resource, id).then(function () {
        deferred.resolve(true);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    deleteByCurrentUser: function (id) {
      var deferred = $q.defer();

      apiService.remove(resource + '/deleteByCurrentUser', id).then(function () {
        deferred.resolve(true);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    deleteByCurrentUserFromInbox: function (id) {
      var deferred = $q.defer();

      apiService.remove(resource + '/deleteByCurrentUserFromInbox', id).then(function () {
        deferred.resolve(true);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    deleteByCurrentUserFromSendbox: function (id) {
      var deferred = $q.defer();

      apiService.remove(resource + '/deleteByCurrentUserFromSendbox', id).then(function () {
        deferred.resolve(true);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    sendMulti: function (params) {
      var deferred = $q.defer();

      apiService.post(resource + '/SendMulti', params).then(function (response) {
        response = response.data.data;

        $rootScope.$broadcast('mails:created', response);
        deferred.resolve(response);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },
  };

  return service;
});