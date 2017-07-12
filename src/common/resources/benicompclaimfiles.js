angular.module('resources.benicompclaimfiles', [])

.factory('benicompclaimfiles', function ($rootScope, $q, apiService, i18nNotifications) {

  // Set base url for resource (used as API endpoint)
  var resource = 'benicompclaimfiles';

  var service = {
    remove: function (id) {
      var deferred = $q.defer();

      apiService.remove(resource, id).then(function () {
        deferred.resolve(true);
      }, function (error) {
        error.data.status = error.status;
        deferred.reject(error.data);
        //fetchAllApiError(error);
      });

      return deferred.promise;
    }
  };

  return service;
});
