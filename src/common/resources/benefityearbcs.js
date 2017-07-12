angular.module('resources.benefityearbcs', [])

.factory('benefityearbcs', function($rootScope, $q, apiService) {
  // Set base url for resource (used as API endpoint)
  var resource = 'benefityearbcs';

  var service = {
    find: function(id) {
      var deferred = $q.defer();

      apiService.find(resource, id).then(function(response) {
        response = response.data.data;
        service.currentIncentive = response;
        deferred.resolve(service.currentIncentive);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    get: function(params, header, loading) {
      var deferred = $q.defer();

      apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function(response) {
        response = response.data.data;
        var data = {
          incentiveList: response.data,
          totalCount: response.totalCount
        };
        service.incentiveList = data.incentiveList;
        deferred.resolve(data);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    post: function(params) {
      var deferred = $q.defer();

      apiService.post(resource, params).then(function(response) {
        response = response.data.data;

        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    put: function(params) {
      var deferred = $q.defer();
      var id = params.id;
      delete params.id;

      apiService.put(resource + '/' + id, params).then(function(response) {
        response = response.data.data;

        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    remove: function(id) {
      var deferred = $q.defer();

      apiService.remove(resource, id).then(function() {
        deferred.resolve(true);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    }
  };

  return service;
});
