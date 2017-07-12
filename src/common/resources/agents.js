angular.module('resources.agents', [])

  .factory('agents', function ($rootScope, $q, apiService, users, i18nNotifications) {

    // Set base url for resource (used as API endpoint)
    var resource = 'agents';

    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
    }

    $rootScope.$on('agents:list:updated', function (event, userList) {
      if (userList.length > 0) {
        service.setCurrent(userList[0]);
      }
    });

    $rootScope.$on('agents:created', function () {
      service.userList = [];
    });

    $rootScope.$on('agents:edited', function (event, agent) {
      for (var i = 0; i < service.userList.length; i++) {
        if (service.userList[i].id === agent.id) {
          service.userList[i] = agent;
          break;
        }
      }
    });

    $rootScope.$on('agents:removed', function (event, id) {
      for (var i = 0; i < service.userList.length; i++) {
        if (service.userList[i].id === id) {
          service.userList.splice(i, 1);
          break;
        }
      }
    });

    var service = {
      currentAgent: null,
      userList: [],

      find: function (id,headers) {
        var deferred = $q.defer();
        var existing = false;

        // for (var i = 0; i < service.userList.length; i++) {
        //   if (service.userList[i].id === id) {
        //     service.currentAgent = service.userList[i];
        //     deferred.resolve(service.currentAgent);
        //     existing = true;
        //     break;
        //   }
        // }

        if (!existing) {
          apiService.find(resource, id,undefined,headers).then(function (response) {
            response = response.data.data;
            service.currentAgent = response;
            deferred.resolve(service.currentAgent);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });
        }

        return deferred.promise;
      },

      get: function (params, header, loading) {
        var deferred = $q.defer();
        $rootScope.$broadcast('INFO:sortClient', params);
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
          response = response.data.data;
          var data = {
            userList: response.data,
            totalCount: response.totalCount
          };
          service.userList = data.userList;

          $rootScope.$broadcast('agents:list:updated', service.userList);
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      post: function (params,headers) {
        var deferred = $q.defer();

        apiService.post(resource, params,headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('agents:created', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      put: function (params) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;

        apiService.put(resource + '/' + id, params).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('agents:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      patch: function (params,headers) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;

        apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('agents:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },


      importMultipe: function (files) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        var apiUrl = resource + '/import';
        

        apiService.upload(apiUrl, formData).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      remove: function (id,headers) {
        var deferred = $q.defer();

        /*apiService.remove(resource, id).then(function () {
         //response = response.data;

         $rootScope.$broadcast('agents:removed');
         deferred.resolve(true);
         }, function (error) {
         error.data.status = error.status;
         deferred.reject(error.data);
         //fetchAllApiError(error);
         });*/

        var params = {
          "isDeleted": true
        };
        apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('agents:removed');
          deferred.resolve(true);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });


        return deferred.promise;
      },

      delete: function (id) {
        var deferred = $q.defer();

        apiService.remove(resource, id).then(function () {
          //response = response.data;

          $rootScope.$broadcast('agents:removed');
          deferred.resolve(true);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
        return deferred.promise;
      },

      restore: function (id) {
        var deferred = $q.defer();
        var params = {
          "isDeleted": false
        };
        apiService.put(resource + '/' + id, params).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('agents:removed');
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      downloadUsers: function (ids, loading) {
        return users.downloadUsers(resource, ids, loading);
      },

      downloadAllUser: function (params, loading) {
        return users.downloadAllUser(resource, params, loading);
      },

      downloadAllUserV2: function (params, loading) {
        return users.downloadAllUserV2(resource, params, loading);
      },

      // Set current
      setCurrent: function (agent) {
        if (service.currentAgent !== agent) {
          service.currentAgent = agent;
          $rootScope.$broadcast('agents:current:updated', service.currentAgent);
        }
      }
    };

    return service;
  });
