angular.module('resources.health-coach-managers', [])

.factory('healthCoachManagers', function($rootScope, $q, apiService, users, i18nNotifications) {

  // Set base url for resource (used as API endpoint)
  var resource = 'healthcoachmanagers';

  // Set error notification if all() request fails
  function fetchAllApiError(error) {
    i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
  }

  $rootScope.$on('healthCoachManagers:list:updated', function(event, healthCoachManagerList) {
    if(healthCoachManagerList.length > 0) {
      service.setCurrent(healthCoachManagerList[0]);
    }
  });

  $rootScope.$on('healthCoachManagers:created', function() {
    service.healthCoachManagerList = [];
  });

  $rootScope.$on('healthCoachManagers:edited', function(event, healthCoachManager) {
    for(var i = 0; i < service.healthCoachManagerList.length; i++) {
      if(service.healthCoachManagerList[i].id === healthCoachManager.id) {
        service.healthCoachManagerList[i] = healthCoachManager;
        break;
      }
    }
  });

  $rootScope.$on('healthCoachManagers:removed', function(event, id) {
    for(var i = 0; i < service.healthCoachManagerList.length; i++) {
      if(service.healthCoachManagerList[i].id === id) {
        service.healthCoachManagerList.splice(i, 1);
        break;
      }
    }
  });

  var service = {
    currentHealthCoachManager: null,
    healthCoachManagerList: [],

    find: function(id) {
      var deferred = $q.defer();
      var existing = false;

      for(var i = 0; i < service.healthCoachManagerList.length; i++) {
        if(service.healthCoachManagerList[i].id === id) {
          deferred.resolve(service.healthCoachManagerList[i]);
          existing = true;
          break;
        }
      }

      if(!existing) {
        apiService.find(resource, id).then(function(response) {
          response = response.data.data;
          service.healthCoachManagerList = response;
          deferred.resolve(service.healthCoachManagerList);
        }, function(error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
      }

      return deferred.promise;
    },

    get: function(params, heades, loading) {
      var deferred = $q.defer();
      $rootScope.$broadcast('INFO:sortClient', params);
      apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, heades).then(function(response) {
        response = response.data.data;
        var data = {
          healthCoachManagerList: response.data,
          totalCount: response.totalCount
        };
        service.healthCoachManagerList = data.healthCoachManagerList;

        $rootScope.$broadcast('healthCoachManagers:list:updated', service.healthCoachManagerList);
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

        $rootScope.$broadcast('healthCoachManagers:created', response);
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

        $rootScope.$broadcast('healthCoachManagers:edited', response);
        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
        //fetchAllApiError(error);
      });

      return deferred.promise;
    },

    patch: function(params,heades) {
      var deferred = $q.defer();
      var id = params.id;
      delete params.id;

      apiService.put(resource + '/' + id, params,undefined,undefined,heades).then(function(response) {
        response = response.data.data;

        $rootScope.$broadcast('healthCoachManagers:edited', response);
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

      /*apiService.remove(resource, id).then(function(response) {
       //response = response.data;

       $rootScope.$broadcast('healthCoachManagers:removed');
       deferred.resolve(true);
       }, function(error) {
       error.data.status = error.status;
       deferred.reject(error.data);
       //fetchAllApiError(error);
       });*/


      var params = {
        "isDeleted": true
      };
      apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function(response) {
        response = response.data.data;

        $rootScope.$broadcast('healthCoachManagers:removed');
        deferred.resolve(true);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });


      return deferred.promise;
    },

    delete: function(id,headers) {
      var deferred = $q.defer();

      apiService.remove(resource, id,headers).then(function(response) {
        //response = response.data;

        $rootScope.$broadcast('healthCoachManagers:removed');
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

        $rootScope.$broadcast('healthCoachManagers:removed');
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
    setCurrent: function(healthCoachManager) {
      if(service.currentHealthCoachManager !== healthCoachManager) {
        service.currentHealthCoachManager = healthCoachManager;
        $rootScope.$broadcast('healthCoachManagers:current:updated', service.currentHealthCoachManager);
      }
    }
  };

  return service;
});
