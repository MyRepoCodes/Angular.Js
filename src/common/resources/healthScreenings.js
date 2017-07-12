angular.module('resources.healthScreenings', [])

.factory('healthScreenings',
  function ($rootScope, $q, apiService) {

    // Set base url for resource (used as API endpoint)
    var resource = 'healthscreenings';

    var service = {
      get: function (params, header, loading) {
        var deferred = $q.defer();

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      /**
       *
       * @param params {startTime: '2016-04-30', endTime: '2016-06-30'}
       * @param header
       * @param loading
       * @returns {*}
       */
      getEvents: function (params, header, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/getWithQuery' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, header).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      /**
       * Get Event Info By eventGoogleCalendarId
       * @param params
       * @param loading
       * @returns {*}
       */
      getByEventGoogleCalendarId: function (eventGoogleCalendarId, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/getByEventGoogleCalendarId/' + eventGoogleCalendarId + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },
      /**
       * Get All Email (Participant, Health Coach, Health Coach manager, Client Manager) By Client
       * @returns {*}
       */
      getAllEmail: function (loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/getallemail' + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;

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

      /**
       * Add, Update Event to database
       * @param params
       * @returns {*}
       */
      postEvent: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/addorupdate', params).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      /***
       * Remove Event By eventGoogleCalendarId
       * @param eventGoogleCalendarId
       * @returns {*}
       */
      removeByEventGoogleCalendarId: function (eventGoogleCalendarId) {
        var deferred = $q.defer();

        apiService.remove(resource + '/deleteByEventGoogleCalendarId', eventGoogleCalendarId).then(function (response) {
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
  }
);
