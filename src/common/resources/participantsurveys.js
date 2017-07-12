angular.module('resources.participantsurveys', [])

  .factory('participantSurveys',
    function ($rootScope, $q, apiService, i18nNotifications) {

      // Set base url for resource (used as API endpoint)
      var resource = 'participantsurveys';

      // Set error notification if all() request fails
      function fetchAllApiError(error) {
        i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
      }

      $rootScope.$on('participantSurveys:list:updated', function (event, userList) {
        if (userList.length > 0) {
          service.setCurrent(userList[0]);
        }
      });

      $rootScope.$on('participantSurveys:created', function () {
        service.userList = [];
      });

      $rootScope.$on('participantSurveys:edited', function (event, healthCoach) {
        for (var i = 0; i < service.userList.length; i++) {
          if (service.userList[i].id === healthCoach.id) {
            service.userList[i] = healthCoach;
            break;
          }
        }
      });

      $rootScope.$on('participantSurveys:removed', function (event, id) {
        for (var i = 0; i < service.userList.length; i++) {
          if (service.userList[i].id === id) {
            service.userList.splice(i, 1);
            break;
          }
        }
      });

      var service = {
        currentHealthCoach: null,
        userList: [],

        find: function (id) {
          var deferred = $q.defer();
          var existing = false;

          for (var i = 0; i < service.userList.length; i++) {
            if (service.userList[i].id === id) {
              service.currentHealthCoach = service.userList[i];
              deferred.resolve(service.currentHealthCoach);
              existing = true;
              break;
            }
          }

          if (!existing) {
            apiService.find(resource, id).then(function (response) {
              response = response.data.data;
              service.currentHealthCoach = response;
              deferred.resolve(service.currentHealthCoach);
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
              surveysList: response.data,
              totalCount: response.totalCount
            };
            service.surveysList = data.surveysList;
            $rootScope.$broadcast('participantSurveys:list:updated', service.surveysList);
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

            $rootScope.$broadcast('participantSurveys:created', response);
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

            $rootScope.$broadcast('participantSurveys:edited', response);
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

            $rootScope.$broadcast('participantSurveys:edited', response);
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

          /*apiService.remove(resource, id).then(function() {
           //response = response.data;

           $rootScope.$broadcast('participantSurveys:removed');
           deferred.resolve(true);
           },  function(error) {
           error.data.status = error.status;
           deferred.reject(error.data);
           //fetchAllApiError(error);
           });*/

          var params = {
            "isDeleted": true
          };
          apiService.put(resource + '/' + id, params).then(function (response) {
            response = response.data.data;

            $rootScope.$broadcast('participantSurveys:removed');
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });


          return deferred.promise;
        },


        deleteMultiSurvey: function (params) {
          var deferred = $q.defer();

          apiService.post(resource + '/deleteMultiSurvey', params).then(function (response) {
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

            $rootScope.$broadcast('participantSurveys:removed');
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
          });

          return deferred.promise;
        },

        // Set current
        setCurrent: function (healthCoach) {
          if (service.currentHealthCoach !== healthCoach) {
            service.currentHealthCoach = healthCoach;
            $rootScope.$broadcast('participantSurveys:current:updated', service.currentHealthCoach);
          }
        }
      };

      return service;
    }
  );
