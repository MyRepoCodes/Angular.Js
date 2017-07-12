angular.module('resources.client-managers', [])

.factory('clientManagers', function($rootScope, $q, apiService, users, i18nNotifications) {

  // Set base url for resource (used as API endpoint)
  var resource = 'clientmanagers';

  // Set error notification if all() request fails
  function fetchAllApiError(error) {
    i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
  }

  $rootScope.$on('clientManagers:list:updated', function(event, clientManagerList) {
    if(clientManagerList.length > 0) {
      service.setCurrent(clientManagerList[0]);
    }
  });

  $rootScope.$on('clientManagers:created', function() {
    service.clientManagerList = [];
  });

  $rootScope.$on('clientManagers:edited', function(event, clientManager) {
    for(var i = 0; i < service.clientManagerList.length; i++) {
      if(service.clientManagerList[i].id === clientManager.id) {
        service.clientManagerList[i] = clientManager;
        break;
      }
    }
  });

  $rootScope.$on('clientManagers:removed', function(event, id) {
    for(var i = 0; i < service.clientManagerList.length; i++) {
      if(service.clientManagerList[i].id === id) {
        service.clientManagerList.splice(i, 1);
        break;
      }
    }
  });

  var service = {
    currentClientManager: null,
    clientManagerList: [],

    find: function(id,headers) {
      var deferred = $q.defer();
      var existing = false;

      // for(var i = 0; i < service.clientManagerList.length; i++) {
      //   if(service.clientManagerList[i].id === id) {
      //     service.currentClientManager = service.clientManagerList[i];
      //     deferred.resolve(service.currentClientManager);
      //     existing = true;
      //     break;
      //   }
      // }

      if(!existing) {
        apiService.find(resource, id,undefined,headers).then(function(response) {
          response = response.data.data;
          service.currentClientManager = response;
          deferred.resolve(service.currentClientManager);
        }, function(error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
      }

      return deferred.promise;
    },

    get: function(params, headers, loading) {
      var deferred = $q.defer();
      $rootScope.$broadcast('INFO:sortClient', params);
      apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function(response) {
        response = response.data.data;
        var data = {
          clientManagerList: response.data,
          totalCount: response.totalCount
        };
        service.clientManagerList = data.clientManagerList;

        $rootScope.$broadcast('clientManagers:list:updated', service.clientManagerList);
        deferred.resolve(data);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
        //fetchAllApiError(error);
      });

      return deferred.promise;
    },

    post: function(params,headers) {
      var deferred = $q.defer();

      apiService.post(resource, params,headers).then(function(response) {
        response = response.data.data;

        $rootScope.$broadcast('clientManagers:created', response);
        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
        //fetchAllApiError(error);
      });

      return deferred.promise;
    },

    put: function(params) {
      var deferred = $q.defer();
      var id = params.id;
      delete params.id;

      apiService.put(resource + '/' + id, params).then(function(response) {
        response = response.data.data;

        $rootScope.$broadcast('clientManagers:edited', response);
        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
        //fetchAllApiError(error);
      });

      return deferred.promise;
    },

    patch: function(params,headers) {
      var deferred = $q.defer();
      var id = params.id;
      delete params.id;

      apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function(response) {
        response = response.data.data;

        $rootScope.$broadcast('clientManagers:edited', response);
        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
        //fetchAllApiError(error);
      });

      return deferred.promise;
    },

    remove: function(id,headers) {
      var deferred = $q.defer();

      /*apiService.remove(resource, id).then(function() {
       //response = response.data;

       $rootScope.$broadcast('clientManagers:removed');
       deferred.resolve(true);
       },  function(error) {
       error.data.status = error.status;
       deferred.reject(error.data);
       //fetchAllApiError(error);
       });*/

      var params = {
        "isDeleted": true
      };
      apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function(response) {
        response = response.data.data;

        $rootScope.$broadcast('clientManagers:removed');
        deferred.resolve(true);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });


      return deferred.promise;
    },

    delete: function(id) {
      var deferred = $q.defer();

      apiService.remove(resource, id).then(function() {
        //response = response.data;

        $rootScope.$broadcast('clientManagers:removed');
        deferred.resolve(true);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
        //fetchAllApiError(error);
      });

      return deferred.promise;
    },

    restore: function(id) {
      var deferred = $q.defer();
      var params = {
        "isDeleted": false
      };
      apiService.put(resource + '/' + id, params).then(function(response) {
        response = response.data.data;

        $rootScope.$broadcast('clientManagers:removed');
        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    downloadUsers: function(ids, loading) {
      return users.downloadUsers(resource, ids, loading);
    },

    downloadAllUser: function(params, loading) {
      return users.downloadAllUser(resource, params, loading);
    },

    downloadAllUserV2: function(params, loading) {
      return users.downloadAllUserV2(resource, params, loading);
    },

    // Set current
    setCurrent: function(clientManager) {
      if(service.currentClientManager !== clientManager) {
        service.currentClientManager = clientManager;
        $rootScope.$broadcast('clientManagers:current:updated', service.currentClientManager);
      }
    }
  };

  return service;
});
