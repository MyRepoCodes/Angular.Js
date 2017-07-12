angular.module('resources.contacts', [])

  .factory('contacts', function ($rootScope, $q, apiService, i18nNotifications) {

    // Set base url for resource (used as API endpoint)
    var resource = 'contacts';

    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
    }

    /*$rootScope.$on('contact:list:updated', function(event, contactList) {
     if(contactList.length > 0) {
     service.setCurrent(contactList[0]);
     }
     });*/

    var service = {

      currentContact: null,
      contactList: [],

      /**
       * Contact
       * @param firstName:"firstName",
       * @param lastName:"lastName",
       * @param company:"benicomp",
       * @param dateOfBirth:"2015-01-14T17:00:00.000Z",
       * @param email:"email@gmail.com",
       * @param telephone:"(213) 213-4423",
       * @param contactType:0, -->0: phone,1: email
       * @param content:"message"
       * @returns {*}
       */
      post: function (params) {
        var deferred = $q.defer();

        apiService.post(resource, params).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },


      deleteMultiContact: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/deleteMultiContact', params).then(function (response) {
          deferred.resolve(true);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      get: function (params, headers, loading) {
        var deferred = $q.defer();

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (rs) {
          var response = rs.data.data;
          var data = {
            contactList: response.data,
            totalCount: response.totalCount
          };
          service.contactList = data.contactList;

          //$rootScope.$broadcast('contact:list:updated', service.contactList);
          deferred.resolve(data);
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

          $rootScope.$broadcast('contact:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      countunread: function (params, headers, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/countunread' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (rs) {
          var response = rs.data.data;
          deferred.resolve(response);
          $rootScope.$broadcast('contact:countunread', response);
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

          //$rootScope.$broadcast('participantSurveys:removed');
          deferred.resolve(response);
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

          //$rootScope.$broadcast('participantSurveys:removed');
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      sendMail: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/sendMail', params).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },
    };

    return service;
  });
