angular.module('resources.spouses', [])

  .factory('spouses', function ($q, apiService, participants, utils) {

    // Set base url for resource (used as API endpoint)
    var resource = 'spouses';

    var service = {
      find: function (id) {
        var deferred = $q.defer();

        apiService.find(resource, id).then(function (response) {
          response = response.data.data;
          deferred.resolve(apiService.format(response));
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      get: function (params, headers, loading) {
        var deferred = $q.defer();

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          response = response.data.data;
          deferred.resolve(apiService.format(response));
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      getByParticipantId: function (participantId, loading) {
        var deferred = $q.defer();

        var headers = {
          'X-Filter': JSON.stringify([
            {
              property: 'participantId',
              operator: 'equal',
              condition: 'or',
              value: participantId
            }
          ])
        };

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), null, headers).then(function (response) {
          response = response.data.data;
          if (response.length > 0) {
            deferred.resolve(apiService.format(response[0]));
          } else {
            deferred.resolve(null);
          }
        }, function () {
          deferred.resolve(null);
        });

        return deferred.promise;
      },

      post: function (params) {
        var deferred = $q.defer();

        apiService.post(resource, params).then(function (response) {
          response = response.data.data;
          deferred.resolve(apiService.format(response));
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
          deferred.resolve(apiService.format(response));
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
          deferred.resolve(apiService.format(response));
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      updateInfo: function (params) {
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


      restore: function (info) {
        var deferred = $q.defer();

        // check have spouse active
        var paramsObject = {
          id_participant: info.participantId
        };

        var headersObject = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: false
            }
          ])
        };

        participants.getListSpouse(paramsObject, headersObject)
          .then(function (resSpouseActive) {
            if (resSpouseActive.totalCount > 0) {
              deferred.reject([{
                errorMessage: "Please remove current spouse active"
              }]);
            } else {

              var params = {
                "isDeleted": false
              };

              var id = info.id;
              apiService.put(resource + '/' + id, params).then(function (response) {
                response = response.data.data;

                deferred.resolve(response);
              }, function (error) {
                error.data.status = error.status;
                deferred.reject(error.data);
              });

            }

          });



        return deferred.promise;
      },

      delete: function (id) {
        var deferred = $q.defer();
        apiService.remove(resource, id).then(function () {
          deferred.resolve(true);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

    };

    return service;
  });
