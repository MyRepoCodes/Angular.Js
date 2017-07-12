angular.module('resources.systemconfigurations', [])

  .factory('systemconfigurations',
  function ($rootScope, $q, apiService, i18nNotifications) {

    // Set base url for resource (used as API endpoint)
    var resource = 'systemconfigurations';

    var service = {

      get: function (params, header, loading) {
        var deferred = $q.defer();
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
          response = response.data.data;
          var data = {
            adminList: response.data,
            totalCount: response.totalCount
          };

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getOne: function (loading) {
        var deferred = $q.defer();
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;
          if (response.length > 0) {
            response = response[0];
          }
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

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },


    };

    return service;
  }
  );
