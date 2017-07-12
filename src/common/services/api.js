angular.module('services.api', [
  'restangular',
  'services.i18nNotifications',
  'app.utils',
])

  .factory('apiService', function (Restangular, i18nNotifications, $cookieStore, $rootScope, CONFIGS, utils) {
    var baseUrl = CONFIGS.baseURL();

    // Global configuration for Restangular API connection.
    Restangular.setBaseUrl(baseUrl);
    Restangular.setFullResponse(true);
    Restangular.setDefaultHttpFields({withCredentials: false, cache: false, timeout: 60000}); // 60 second
    //Restangular.setMethodOverriders(["put", "patch"]);

    Restangular.addResponseInterceptor(function (data, operation, what, url, response2, deferred) {
      $rootScope.$broadcast('API:loading:ended');

      var responseArr = [];
      if (data instanceof ArrayBuffer) {
        responseArr['data'] = data;
      } else {
        responseArr = data;
      }

      return responseArr;
    });

    Restangular.addRequestInterceptor(function (element, operation, what, url, $localStorage) {
      // Not cache
      if (operation === 'get') {
        Restangular.setDefaultRequestParams({ver: Math.random()});
      } else {
        Restangular.setDefaultRequestParams({ver: undefined});
      }

      var data = {
        element: element,
        operation: operation,
        what: what,
        url: url
      };

      if (what.indexOf('loadingSpinnerNotShowing') === -1) {
        $rootScope.$broadcast('API:loading:started', data);
      }

      //check token expires
      if(localStorage["ngStorage-refreshToken"]){
        var refreshToken = JSON.parse(localStorage["ngStorage-refreshToken"]);
        var timeNowGMT = new Date().toGMTString();
        var timestampNow = parseInt(new Date(timeNowGMT).getTime()/1000);
        var timestampIssued = parseInt(new Date(refreshToken["issued"]).getTime()/1000);

        if(timestampNow - timestampIssued + 120 > parseInt(refreshToken["expires_in"]) ){ // 120s : refresh Token before 2 mins
          $rootScope.$broadcast('API:refresh:token', refreshToken);
        }
      }



    });

    Restangular.setErrorInterceptor(function (response, deferred, responseHandler) {
      $rootScope.$broadcast('API:loading:ended');

      //console.log("Response received with HTTP error code: " + response.status);

      return true; // error not handled
    });

    var service = {
      authToken: '',
      defaultHeaders: {},
      all: function (resource, queryParams) {
        if (queryParams === undefined) {
          return Restangular.all(resource).getList();
        } else {
          return Restangular.all(resource).getList(queryParams);
        }
      },

      find: function (resource, id, queryParams,headers) {
        return Restangular.one(resource, id).get(queryParams,headers);
      },

      post: function (resource, subElement, elementToPost, queryParams, headers) {       
        if (queryParams === undefined) {          
          headers = elementToPost;      
          elementToPost = subElement;
          return Restangular.all(resource).post(elementToPost,{}, headers);
        } else {
          return Restangular.one(resource).post(subElement, elementToPost, queryParams, headers);
        }
      },

      postFormData: function (resource, formData) {
        return Restangular.all(resource)
          .withHttpConfig({transformRequest: angular.identity})
          .post(formData);
      },

      upload: function (resource, formData) {
        return Restangular.all(resource)
          .withHttpConfig({transformRequest: angular.identity, timeout: 100000}) // 100 second
          .post(formData, undefined, {'Content-Type': undefined});
      },

      download: function (resource, subElement, queryParams) {
        if (queryParams === undefined) {
          queryParams = subElement;
          return Restangular
            .withConfig(function (Config) {
              Config.setFullResponse(true);
            })
            .one(resource)
            .withHttpConfig({responseType: 'arraybuffer'})
            .get(queryParams);
        } else {
          return Restangular
            .withConfig(function (Config) {
              Config.setFullResponse(true);
            })
            .all(resource)
            .withHttpConfig({responseType: 'arraybuffer'})
            .customGET(subElement, queryParams);
        }
      },

      get: function (resource, queryParams, headers, subElement, rq1, rq2) {
        if (subElement) {
          return Restangular
            .withConfig(function (Config) {
              Config.setFullResponse(true);
            })
            .all(resource).customGET(subElement, queryParams, headers);
        } else {
          return Restangular
            .withConfig(function (Config) {
              Config.setFullResponse(true);
            })
            .one(resource).get(queryParams, headers);
        }
      },

      put: function (resource, elementToPost, subElement, queryParams, headers) {
        return Restangular.one(resource).customPUT(elementToPost, subElement, queryParams, headers);
      },

      putFormData: function (resource, formData) {
        return Restangular.all(resource)
          .withHttpConfig({transformRequest: angular.identity})
          .customPUT(formData);
      },

      patch: function (resource, object, queryParams, headers) {
        return Restangular.one(resource).patch(object, queryParams, headers);
      },

      remove: function (resource, subElement, queryParams, headers) {
        return Restangular.one(resource, subElement).remove(queryParams, headers);
      },
      removeData: function (resource, body) {
        return Restangular.all(resource).customOperation("remove", null, null, body);
      },

      setAuthTokenHeader: function (authToken) {
        service.authToken = authToken;
        service.defaultHeaders = {Authorization: 'Bearer ' + authToken};
        Restangular.setDefaultHeaders(service.defaultHeaders);
      },

      getUrl: function (resource) {
        return baseUrl + '/' + resource + '?api_key=' + encodeURIComponent(service.authToken) + '&ver=' + Math.random();
      },

      getBaseUrl: function () {
        return baseUrl;
      },

      // Reformat
      format: function(response) {
        var output;

        function format(input) {
          if (input.hasOwnProperty('dateOfBirth')) {
            input.dateOfBirth = utils.dateServerToLocalTime(input.dateOfBirth);
          }

          return input;
        }

        if (_.isArray(response)) {
          output = [];
          _.forEach(response, function(item) {
            output.push(format(item));
          });
        } else if (_.isObject(response)) {
          output = format(response);
        } else {
          output = response;
        }

        return output;
      }
    };

    return service;
  });
