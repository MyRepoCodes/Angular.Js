angular.module('resources.health-coachs', [])

  .factory('healthCoachs', function ($rootScope, $q, apiService, users, i18nNotifications) {

    // Set base url for resource (used as API endpoint)
    var resource = 'healthcoaches';

    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
    }

    $rootScope.$on('healthCoachs:list:updated', function (event, userList) {
      if (userList && userList.length > 0) {
        service.setCurrent(userList[0]);
      }
    });

    $rootScope.$on('healthCoachs:created', function () {
      service.userList = [];
    });

    $rootScope.$on('healthCoachs:edited', function (event, healthCoach) {
      for (var i = 0; i < service.userList.length; i++) {
        if (service.userList[i].id === healthCoach.id) {
          service.userList[i] = healthCoach;
          break;
        }
      }
    });

    $rootScope.$on('healthCoachs:removed', function (event, id) {
      for (var i = 0; i < service.userList.length; i++) {
        if (service.userList[i].id === id) {
          service.userList.splice(i, 1);
          break;
        }
      }
    });

    var service = {
      currentHealthCoach: null,
      userList: [],

      find: function (id) {
        var deferred = $q.defer();
        var existing = false;

        for (var i = 0; i < service.userList.length; i++) {
          if (service.userList[i].id === id) {
            service.currentHealthCoach = service.userList[i];
            deferred.resolve(service.currentHealthCoach);
            existing = true;
            break;
          }
        }

        if (!existing) {
          apiService.find(resource, id).then(function (response) {
            response = response.data.data;
            service.currentHealthCoach = response;
            deferred.resolve(service.currentHealthCoach);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });
        }

        return deferred.promise;
      },

      get: function (params, headers, loading) {
        var deferred = $q.defer();
        $rootScope.$broadcast('INFO:sortClient', params);
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          response = response.data.data;
          var data = {
            userList: response.data,
            totalCount: response.totalCount
          };
          service.userList = data.userList;
          $rootScope.$broadcast('healthCoachs:list:updated', service.userList);
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getAllWithFilter: function (params, headers, loading) {
        var deferred = $q.defer();
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          response = response.data.data;
          var data = {
            userList: response,
            totalCount: response.length
          };
          service.userList = data.userList;
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getAll: function (loading) {
        var deferred = $q.defer();

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;
          var data = {
            userList: response,
            totalCount: response.length
          };
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },


      employers: function (params, headers, loading, id) {
        var deferred = $q.defer();


        apiService.get(resource + '/employers' + (id ? '/' + id : "") + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          response = response.data;
          var data = {
            employerList: response.data,
            totalCount: response.data.length
          };
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      post: function (params) {
        var deferred = $q.defer();

        apiService.post(resource, params).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('healthCoachs:created', response);
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

          $rootScope.$broadcast('healthCoachs:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      patch: function (params) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;

        apiService.put(resource + '/' + id, params).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('healthCoachs:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      remove: function (id) {
        var deferred = $q.defer();

        /*apiService.remove(resource, id).then(function() {
         //response = response.data;
  
         $rootScope.$broadcast('healthCoachs:removed');
         deferred.resolve(true);
         },  function(error) {
         error.data.status = error.status;
         deferred.reject(error.data);
         //fetchAllApiError(error);
         });*/


        var params = {
          "isDeleted": true
        };
        apiService.put(resource + '/' + id, params).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('healthCoachs:removed');
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

          $rootScope.$broadcast('healthCoachs:removed');
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

          $rootScope.$broadcast('healthCoachs:removed');
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

      downloadAllUserV2: function (params, loading) {
        return users.downloadAllUserV2(resource, params, loading);
      },

      // Set current
      setCurrent: function (healthCoach) {
        if (service.currentHealthCoach !== healthCoach) {
          service.currentHealthCoach = healthCoach;
          $rootScope.$broadcast('healthCoachs:current:updated', service.currentHealthCoach);
        }
      }
    };

    return service;
  });
