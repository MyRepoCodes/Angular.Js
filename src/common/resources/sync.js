angular.module('resources.sync', [])

  .factory('sync', function ($rootScope, $q, apiService, users, i18nNotifications, utils) {

    // Set base url for resource (used as API endpoint)
    var resource = 'sync';

    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
    }


    var service = {
      data: [],

      find: function (id) {
        var deferred = $q.defer();

        apiService.find(resource, id).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },


      get: function (params, headers, loading) {
        var deferred = $q.defer();


        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (rs) {
          var response = rs.data.data;
          var data = {
            data: response.data,
            totalCount: response.totalCount
          };
          service.data = data.data;

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getOne: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (rs) {
          var response = rs.data.data;
          var data = {
            data: response.data,
            totalCount: response.totalCount
          };
          service.data = data.data;
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

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      // Inactive
      remove: function (id, terminationDate) {
        var deferred = $q.defer();

        var params = {
          isDeleted: true,
          terminationDate: terminationDate ? utils.dateToISOString(terminationDate) : undefined,
        };
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
          //response = response.data;

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

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      import: function (files) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        apiService.upload(resource + '/upload', formData).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      }



    };

    return service;
  });
