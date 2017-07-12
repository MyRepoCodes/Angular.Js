angular.module('resources.health-topics', [])

  .factory('healthTopics',
    function ($rootScope, $q, apiService) {

      // Set base url for resource (used as API endpoint)
      var resource = 'healthtopics';

      $rootScope.$on('healthtopics:list:updated', function (event, healthTopicsList) {
        if (healthTopicsList.length > 0) {
          service.setCurrent(healthTopicsList[0]);
        }
      });

      $rootScope.$on('healthTopics:created', function () {

      });

      $rootScope.$on('healthTopics:edited', function (event, healthTopics) {
        for (var i = 0; i < service.healthTopicsList.length; i++) {
          if (service.healthTopicsList[i].id === healthTopics.id) {
            service.healthTopicsList[i] = healthTopics;
            break;
          }
        }
      });

      $rootScope.$on('healthTopics:removed', function (event, id) {
        for (var i = 0; i < service.healthTopicsList.length; i++) {
          if (service.healthTopicsList[i].id === id) {
            service.healthTopicsList.splice(i, 1);
            break;
          }
        }
      });

      var service = {
        currentHealthTopics: null,
        healthTopicsList: [],

        find: function (id) {
          var deferred = $q.defer();
          var existing = false;

          for (var i = 0; i < service.healthTopicsList.length; i++) {
            if (service.healthTopicsList[i].id === id) {
              service.currentHealthTopics = service.healthTopicsList[i];
              deferred.resolve(service.currentHealthTopics);
              existing = true;
              break;
            }
          }

          if (!existing) {
            apiService.find(resource, id).then(function (response) {
              response = response.data.data;
              service.currentHealthTopics = response;
              deferred.resolve(service.currentHealthTopics);
            }, function (error) {
              error.data.status = error.status;
              deferred.reject(error.data);
            });
          }

          return deferred.promise;
        },

        get: function (params, headers, loading) {
          var deferred = $q.defer();

          apiService.get(resource, params, headers).then(function (response) {
            response = response.data.data;
            var data = {
              healthTopicList: response.data,
              totalCount: response.totalCount
            };
            service.healthTopicsList = data.healthTopicList;

            $rootScope.$broadcast('healthTopics:list:updated', service.healthTopicList);
            deferred.resolve(data);
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

            $rootScope.$broadcast('healthTopics:created', response);
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

            $rootScope.$broadcast('healthTopics:edited', response);
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

          apiService.put(resource + '/' + id, params).then(function (response) {
            response = response.data.data;

            $rootScope.$broadcast('healthTopics:edited', response);
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        },

        remove: function (id) {
          var deferred = $q.defer();

          apiService.remove(resource, id).then(function () {
            //response = response.data;

            $rootScope.$broadcast('healthTopics:removed');
            deferred.resolve(true);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        },

        // Set current
        setCurrent: function (healthTopics) {
          if (service.currentHealthTopics !== healthTopicsList) {
            service.currentHealthTopics = healthTopicsList;
            $rootScope.$broadcast('healthTopics:current:updated', service.currentHealthTopics);
          }
        }
      };

      return service;
    }
  );
