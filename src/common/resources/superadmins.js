angular.module('resources.superadmins', [])

  .factory('superadmins',
    function ($rootScope, $q, apiService, i18nNotifications) {

      // Set base url for resource (used as API endpoint)
      var resource = 'superadmins';
      var resourceUser = 'users';

      // Set error notification if all() request fails
      function fetchAllApiError(error) {
        i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
      }

      $rootScope.$on('superadmins:list:updated', function (event, adminList) {
        if (adminList.length > 0) {
          service.setCurrent(adminList[0]);
        }
      });

      $rootScope.$on('superadmins:created', function () {
        service.adminList = [];
      });

      $rootScope.$on('superadmins:edited', function (event, admin) {
        for (var i = 0; i < service.adminList.length; i++) {
          if (service.adminList[i].id === admin.id) {
            service.adminList[i] = admin;
            break;
          }
        }
      });

      $rootScope.$on('superadmins:removed', function (event, id) {
        for (var i = 0; i < service.adminList.length; i++) {
          if (service.adminList[i].id === id) {
            service.adminList.splice(i, 1);
            break;
          }
        }
      });

      var service = {
        currentAdmin: null,
        adminList: [],

        find: function (id) {
          var deferred = $q.defer();
          var existing = false;

          for (var i = 0; i < service.adminList.length; i++) {
            if (service.adminList[i].id === id) {
              service.currentAdmin = service.adminList[i];
              deferred.resolve(service.currentAdmin);
              existing = true;
              break;
            }
          }

          if (!existing) {
            apiService.find(resource, id).then(function (response) {
              response = response.data.data;
              service.currentAdmin = response;
              deferred.resolve(service.currentAdmin);
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
              adminList: response.data,
              totalCount: response.totalCount
            };
            service.adminList = data.adminList;

            $rootScope.$broadcast('superadmins:list:updated', service.adminList);
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

            $rootScope.$broadcast('superadmins:created', response);
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

            $rootScope.$broadcast('superadmins:edited', response);
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

            $rootScope.$broadcast('superadmins:edited', response);
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });

          return deferred.promise;
        },

        patchUserSecurity: function (params) {
          var deferred = $q.defer();
          var id = params.userId;
          delete params.userId;

          apiService.put(resourceUser + '/' + id + '/changesecurity', params).then(function (response) {
            response = response.data.data;
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

          /*apiService.remove(resource, id).then(function () {
           //response = response.data;

           $rootScope.$broadcast('admins:removed');
           deferred.resolve(true);
           }, function (error) {
           error.data.status = error.status;
           deferred.reject(error.data);
           //fetchAllApiError(error);
           });
           */

          var params = {
            "isDeleted": true
          };
          apiService.put(resource + '/' + id, params).then(function (response) {
            response = response.data.data;

            $rootScope.$broadcast('superadmins:removed');
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

            $rootScope.$broadcast('admins:removed');
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

            $rootScope.$broadcast('superadmins:removed');
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        },

        // Set current
        setCurrent: function (admin) {
          if (service.currentAdmin !== admin) {
            service.currentAdmin = admin;
            $rootScope.$broadcast('superadmins:current:updated', service.currentAdmin);
          }
        }
      };

      return service;
    }
  );
