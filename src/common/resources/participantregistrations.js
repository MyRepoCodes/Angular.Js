angular.module('resources.participantregistrations', [])

.factory('participantregistrations', function($rootScope, $q, apiService) {

  // Set base url for resource (used as API endpoint)
  var resource = 'participantregistrations';

  var service = {
    find: function(id) {
      var deferred = $q.defer();

      apiService.find(resource, id).then(function(response) {
        response = response.data.data;
        service.currentEmployer = response;
        deferred.resolve(service.currentEmployer);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    get: function(params, headers, loading) {
      var deferred = $q.defer();

      apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function(response) {
        response = response.data.data;

        deferred.resolve(response);
      }, function(error) {
        error.data.status = error.status;
        deferred.reject(error.data);
      });

      return deferred.promise;
    },

    // api/participantregistrations/getByQuery?participantId=24ea8eb5-e7d4-447a-911f-ce7378a4825c&incentiveId=a93b0d3f-15f3-4f11-b12e-d79baa96e4dd
    getByQuery: function(params, headers, loading) {
      var deferred = $q.defer();

      apiService.get(resource + '/getByQuery' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function(response) {
        response = response.data.data;

        deferred.resolve(response);
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

    patch: function(params) {
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
    },
  };

  return service;
});
