angular.module('resources.audit-logs', [])
  .factory('auditLogs', function ($rootScope, $q, apiService, i18nNotifications, CONFIGS, utils) {
    // Set base url for resource (used as API endpoint)
    var resource = 'logs';
    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
    }
    var service = {
      currentEmployer: null,
      employerList: [],

      getAllAuditLogs: function (params, headers, loading) {
        var deferred = $q.defer();
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          var data = response;
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
        return deferred.promise;
      },
      auditDetails: function(params, headers, loading){       
        var deferred = $q.defer();
        apiService.get(resource+'/'+'detail' + (loading === false ? '?loadingSpinnerNotShowing' : ''),params,headers).then(function(response){
           var data = response;
           deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
         return deferred.promise;
      },
      loginLogs: function(params, headers, loading){      
        var deferred = $q.defer();
        apiService.get('logins' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          var data = response;
          deferred.resolve(data);
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
