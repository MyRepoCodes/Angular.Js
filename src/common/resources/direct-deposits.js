angular.module('resources.direct-deposits', [])

  .factory('DirectDeposits', function ($rootScope, $q, apiService) {

    // Set base url for resource (used as API endpoint)
    var resource = 'directdeposits';

    var service = {
      /***
       * Get a specific entity by id
       * @param id
       * @param params {embed:''}
       * @param loading
       * @returns {deferred.promise|{then, catch, finally}}
       */
      find: function (id, params) {
        var deferred = $q.defer();
        apiService.find(resource, id, params).then(function (response) {
          response = response.data.data;

          response.claimData = JSON.parse(response.claimData);

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

          $rootScope.$broadcast('directdeposits:created', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      deleteMulti: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/deleteMulti', params).then(function (response) {
          deferred.resolve(true);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
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

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },


      remove: function (id) {
        var deferred = $q.defer();

        var params = {
          "isDeleted": true
        };
        apiService.put(resource + '/' + id, params).then(function (response) {
          response = response.data.data;
          deferred.resolve(true);
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

        apiService.patch(resource + '/' + id, params).then(function (response) {
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
