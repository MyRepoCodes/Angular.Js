angular.module('resources.portfolios', [])

  .factory('portfolios',
    function ($rootScope, $q, apiService, i18nNotifications) {

      // Set base url for resource (used as API endpoint)
      var resource = 'portfolios';

      var service = {
        portfoliosList: [],

        find: function (id) {
          var deferred = $q.defer();
          apiService.find(resource, id).then(function (response) {
            response = response.data.data;
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        },

        get: function (params, header, loading) {
          var deferred = $q.defer();

          apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
            response = response.data.data;
            var data = {
              portfoliosList: response.data,
              totalCount: response.totalCount
            };
            service.portfoliosList = data.portfoliosList;

            $rootScope.$broadcast('portfolios:list:updated', service.portfoliosList);
            deferred.resolve(data);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });

          return deferred.promise;
        },

        getAllActive: function (params, header, loading) {
          var deferred = $q.defer();

          apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
            response = response.data.data;
            var data = {
              portfoliosList: response,
              totalCount: response.length
            };

            deferred.resolve(data);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });

          return deferred.promise;
        },


        getportfoliosunassign: function (params, header, loading) {
          var deferred = $q.defer();

          apiService.get(resource + '/getportfoliosunassign' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
            response = response.data.data;
            $rootScope.$broadcast('portfolios:list:updated', response);
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

            $rootScope.$broadcast('portfolios:created', response);
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

            $rootScope.$broadcast('portfolios:edited', response);
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });

          return deferred.promise;
        },

        assignportfolio: function (params) {
          var deferred = $q.defer();
          var id = params.id;
          delete params.id;

          apiService.post(resource + '/assignportfolio/' + id, params).then(function (response) {
            response = response.data.data;

            $rootScope.$broadcast('portfolios:edited', response);
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

            $rootScope.$broadcast('portfolios:edited', response);
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

          apiService.remove(resource, id).then(function () {

            $rootScope.$broadcast('portfolios:removed');
            deferred.resolve(true);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        },


        inactive: function (id) {
          var deferred = $q.defer();
          apiService.post(resource + '/inactive/' + id).then(function (response) {
            $rootScope.$broadcast('portfolios:removed');
            deferred.resolve(true);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
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

            $rootScope.$broadcast('portfolios:removed');
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        }

      };

      return service;
    }
  );
