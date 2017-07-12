/***
 * Reference
 * http://www.codeproject.com/Articles/986631/Google-Calendar-API-with-JavaScript
 * https://github.com/gaslight/letsgitlunch/tree/master/bower_components/angular-googleapi
 */
angular.module('app.modules.health-screening.extensions.gapi', [
  'ui.calendar'
])

.service('GApiBuilder', function ($q) {
  this.loadClientCallbacks = [];

  this.build = function (requestBuilder, responseTransformer) {
    return function (args) {
      var deferred = $q.defer();
      var response;
      var request = requestBuilder(args);
      request.execute(function (resp, raw) {
        if (resp.error) {
          deferred.reject(resp.error);
        } else {
          response = responseTransformer ? responseTransformer(resp) : resp;
          deferred.resolve(response);
        }
      });
      return deferred.promise;
    };
  };

  this.afterClientLoaded = function (callback) {
    this.loadClientCallbacks.push(callback);
  };

  this.runClientLoadedCallbacks = function () {
    for (var i = 0; i < this.loadClientCallbacks.length; i++) {
      this.loadClientCallbacks[i]();
    }
  };
})

.service('GCalendarService', function (GApiBuilder, $rootScope) {
  this.loaded = false;
  var self = this;
  var itemExtractor = function (resp) {
    return resp.items;
  };

  /**
   * Load calender Api
   */
  GApiBuilder.afterClientLoaded(function () {
    gapi.client.load('calendar', 'v3', function () {
      self.listEvents = GApiBuilder.build(gapi.client.calendar.events.list, itemExtractor);
      self.listCalendars = GApiBuilder.build(gapi.client.calendar.calendarList.list, itemExtractor);
      self.createEvent = GApiBuilder.build(gapi.client.calendar.events.insert);
      self.deleteEvent = GApiBuilder.build(gapi.client.calendar.events.delete);
      self.patchEvent = GApiBuilder.build(gapi.client.calendar.events.patch);
      self.updateEvent = GApiBuilder.build(gapi.client.calendar.events.update);
      self.getEvent = GApiBuilder.build(gapi.client.calendar.events.get);

      self.loaded = true;
      $rootScope.$broadcast('GCalendar:loaded');
    });
  });
})

.service('GDriverService', function (GApiBuilder, $rootScope, $q) {
  this.loaded = false;
  var self = this;

  /**
   * Load drive Api
   */
  GApiBuilder.afterClientLoaded(function () {
    gapi.client.load('drive', 'v2', function () {
      /**
       * Insert a new permission.
       *
       * @param {String} fileId ID of the file to insert permission for.
       * @param {String} value User or group e-mail address, domain name or {@code null} "default" type.
       * @param {String} type The value "user", "group", "domain" or "default".
       * @param {String} role The value "owner", "writer" or "reader".
       */
      self.insertPermissions = GApiBuilder.build(gapi.client.drive.permissions.insert);
      self.request = GApiBuilder.build(gapi.client.request);

      self.loaded = true;
      $rootScope.$broadcast('GDriver:loaded');
    });
  });

  /**
   * Insert new file to google drive
   *
   * @param {File} fileData File object to read data from.
   * @param {Function} callback Function to call when the request is complete.
   */
  self.insertFile = function (fileData) {
    var deferred = $q.defer();
    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
      var contentType = fileData.type || 'application/octet-stream';
      var metadata = {'title': fileData.fileName, 'mimeType': contentType};
      var base64Data = btoa(reader.result);
      var multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;

      self.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
      }).then(function (response) {
        deferred.resolve(response);
      }, function (error) {
        deferred.reject(error);
      });
    };

    return deferred.promise;
  };

  /***
   * Insert file and permission
   * @param fileData
   */
  self.insertAndSharing = function (fileData, emails) {
    var deferred = $q.defer();

    function insertPermissions(file, emails) {
      if (emails[0]) {
        var email = emails[0];
        emails.splice(0, 1);
        self.insertPermissions({'fileId': file.id, 'resource': {'value': email, 'type': 'user', 'role': 'reader'}}).then(function (response) {
          insertPermissions(file, emails);
        }, function () {
          insertPermissions(file, emails);
        });
      } else {
        // End loop and return
        deferred.resolve(file);
        $rootScope.$broadcast('API:loading:ended');
      }
    }

    // Start loading
    $rootScope.$broadcast('API:loading:started', {});

    // Upload file to google drive then set permission
    self.insertFile(fileData).then(function (file) {
      insertPermissions(file, emails);
    }, function (error) {
      deferred.reject(error);
      $rootScope.$broadcast('API:loading:ended');
    });

    return deferred.promise;
  };
})

.provider('GAuthorize', function () {
  this.configure = function (conf) {
    this.config = conf;
  };

  this.$get = function ($q, $timeout, GApiBuilder, $rootScope) {
    var config = this.config;
    var deferred = $q.defer();
    var authenticated = false;
    var service = {
      /***
       * Is authenticated
       */
      isAuthenticated: function () {
        return !!authenticated;
      },

      /***
       * OAuth2 functions
       */
      handleClientLoad: function () {
        deferred = $q.defer();

        gapi.client.setApiKey(config.apiKey);
        //$timeout(service.checkAuth, 1);
        $timeout(function () {
          gapi.auth.authorize({client_id: config.clientId, scope: config.scopes, immediate: true}, service.handleAuthResult);
        }, 1);

        return deferred.promise;
      },

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      handleAuthClick: function () {
        deferred = $q.defer();

        gapi.auth.authorize({client_id: config.clientId, scope: config.scopes, immediate: false}, service.handleAuthResult);

        return deferred.promise;
      },

      /**
       * Check if current user has authorized this application.
       */
      checkAuth: function () {
        deferred = $q.defer();

        gapi.auth.authorize({client_id: config.clientId, scope: config.scopes, immediate: true}, service.handleAuthResult);

        return deferred.promise;
      },

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      handleAuthResult: function (authResult) {
        if (authResult && !authResult.error) {
          authenticated = true;
          GApiBuilder.runClientLoadedCallbacks();

          $rootScope.$broadcast('google:authenticated', authResult);
          deferred.resolve(authResult);
        } else {
          authenticated = false;
          deferred.reject(authResult.error);
        }
      },

      /***
       * Get User Profile
       * @returns {*}
       */
      getTheUserProfile: function () {
        deferred = $q.defer();

        gapi.client.load('plus', 'v1').then(function () {
          var request = gapi.client.plus.people.get({
            'userId': 'me'
          });
          request.then(function (response) {
            response = response.result;

            var email = '';
            if (response['emails']) {
              for (var i = 0; i < response['emails'].length; i++) {
                if (response['emails'][i]['type'] == 'account') {
                  email = response['emails'][i]['value'];
                }
              }
            }

            response.email = email;

            deferred.resolve(response);
          }, function (reason) {
            deferred.reject(reason.result.error);
          });
        });

        return deferred.promise;
      },

      /***
       * Logout
       */
      logout: function () {
        if (authenticated) {
          gapi.auth.signOut();
        }
      }
    };

    return service;
  };
});
