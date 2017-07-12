angular.module('resources.clinical-directors', [])

  .factory('clinicalDirectors',
    function ($rootScope, $q, apiService, i18nNotifications) {

      // Set base url for resource (used as API endpoint)
      var resource = 'clinicaldirectors';

      // Set error notification if all() request fails
      function fetchAllApiError(error) {
        i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
      }

      $rootScope.$on('clinicalDirectors:list:updated', function (event, clinicalDirectorList) {
        if (clinicalDirectorList.length > 0) {
          service.setCurrent(clinicalDirectorList[0]);
        }
      });

      $rootScope.$on('clinicalDirectors:created', function () {
        service.clinicalDirectorList = [];
      });

      $rootScope.$on('clinicalDirectors:edited', function (event, clinicalDirector) {
        for (var i = 0; i < service.clinicalDirectorList.length; i++) {
          if (service.clinicalDirectorList[i].id === clinicalDirector.id) {
            service.clinicalDirectorList[i] = clinicalDirector;
            break;
          }
        }
      });

      $rootScope.$on('clinicalDirectors:removed', function (event, id) {
        for (var i = 0; i < service.clinicalDirectorList.length; i++) {
          if (service.clinicalDirectorList[i].id === id) {
            service.clinicalDirectorList.splice(i, 1);
            break;
          }
        }
      });

      var service = {
        currentClinicalDirector: null,
        clinicalDirectorList: [],

        find: function (id) {
          var deferred = $q.defer();
          var existing = false;

          for (var i = 0; i < service.clinicalDirectorList.length; i++) {
            if (service.clinicalDirectorList[i].id === id) {
              service.currentClinicalDirector = service.clinicalDirectorList[i];
              deferred.resolve(service.currentClinicalDirector);
              existing = true;
              break;
            }
          }

          if (!existing) {
            apiService.find(resource, id).then(function (response) {
              response = response.data.data;
              service.currentClinicalDirector = response;
              deferred.resolve(service.currentClinicalDirector);
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

          apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
            response = response.data.data;
            var data = {
              clinicalDirectorList: response.data,
              totalCount: response.totalCount
            };
            service.clinicalDirectorList = data.clinicalDirectorList;

            $rootScope.$broadcast('clinicalDirectors:list:updated', service.clinicalDirectorList);
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

            $rootScope.$broadcast('clinicalDirectors:created', response);
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

            $rootScope.$broadcast('clinicalDirectors:edited', response);
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

            $rootScope.$broadcast('clinicalDirectors:edited', response);
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

           $rootScope.$broadcast('clinicalDirectors:removed');
           deferred.resolve(true);
           }, function (error) {
           error.data.status = error.status;
           deferred.reject(error.data);
           //fetchAllApiError(error);
           });*/

          var params = {
            "isDeleted": true
          };
          apiService.put(resource + '/' + id, params).then(function (response) {
            response = response.data.data;

            $rootScope.$broadcast('clinicalDirectors:removed');
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

            $rootScope.$broadcast('clinicalDirectors:removed');
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

            $rootScope.$broadcast('clinicalDirectors:removed');
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        },

        // Set current
        setCurrent: function (clinicalDirector) {
          if (service.currentClinicalDirector !== clinicalDirector) {
            service.currentClinicalDirector = clinicalDirector;
            $rootScope.$broadcast('clinicalDirectors:current:updated', service.currentClinicalDirector);
          }
        }
      };

      return service;
    }
  );
