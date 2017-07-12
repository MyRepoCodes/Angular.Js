angular.module('resources.participants', [])

  .factory('participants', function ($rootScope, $q, apiService, users, i18nNotifications, utils) {

    // Set base url for resource (used as API endpoint)
    var resource = 'participants';

    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
    }

    $rootScope.$on('participants:list:updated', function (event, participantList) {
      if (participantList.length > 0) {
        service.setCurrent(participantList[0]);
      }
    });

    $rootScope.$on('participants:created', function () {

    });

    $rootScope.$on('participants:imported', function () {

    });

    $rootScope.$on('participants:edited', function (event, participant) {
      for (var i = 0; i < service.participantList.length; i++) {
        if (service.participantList[i].id === participant.id) {
          service.participantList[i] = participant;
          break;
        }
      }
    });

    $rootScope.$on('participants:removed', function (event, id) {
      for (var i = 0; i < service.participantList.length; i++) {
        if (service.participantList[i].id === id) {
          service.participantList.splice(i, 1);
          break;
        }
      }
    });

    var service = {
      currentParticipant: null,
      participantList: [],

      find: function (id, headers) {

        var deferred = $q.defer();

        apiService.find(resource, id, undefined, headers).then(function (response) {
          response = response.data.data;
          service.currentParticipant = response;
          deferred.resolve(service.currentParticipant);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      // api/participants/getParticipantsV2?page=1&search=Michelle&sort=-lastName&clientId=A5E5A85E-0A71-469B-B881-F6676FB53E51&isRegistered=false&isHealthResult=true&coverageLevel=0
      // api/participants/getParticipantsV2?page=1&q=Michelle&sort=-lastName&clientId=A5E5A85E-0A71-469B-B881-F6676FB53E51&isRegistered=false&isHealthResult=true&coverageLevel=0
      get: function (params, headers, loading) {
        var deferred = $q.defer();

        $rootScope.$broadcast('INFO:sort', params);

        apiService.get(resource + '/getParticipantsV2' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (rs) {
          var response = rs.data.data;
          var data = {
            participantList: response.data,
            totalCount: response.totalCount
          };
          service.participantList = data.participantList;

          $rootScope.$broadcast('participants:list:updated', service.participantList);
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getAllHealthResultForOneParticipants: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + params.participantID + '/withhealthresult' + (loading === false ? '&loadingSpinnerNotShowing' : '')).then(function (rs) {
          var response = rs.data.data;
          var data = {
            participantList: response.data,
            totalCount: response.totalCount
          };
          service.participantList = data.participantList;

          deferred.resolve(data);

        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      getOne: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (rs) {
          var response = rs.data.data;
          var data = {
            participantList: response.data,
            totalCount: response.totalCount
          };
          service.participantList = data.participantList;
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getall: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + "/withhealthresult", params).then(function (rs) {
          var response = rs.data.data;
          var data = {
            participantList: response,
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

      getallhaveHealthResult: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + "/havehealthresult", params).then(function (rs) {
          var response = rs.data.data;
          var data = {
            participantList: response.data,
            totalCount: response.totalCount
          };
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getallMetabolic: function (params, loading) {
        var deferred = $q.defer();

        params = { embed: 'healthresults,employer.clientName' };
        apiService.get(resource + "/metabolic", params).then(function (rs) {
          var response = rs.data.data;
          var data = {
            participantList: response,
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

      getHealthResult: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/healthresult' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getMyRewards: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/me/rewards' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      sync: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/sync', params).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      post: function (params, headers) {
        var deferred = $q.defer();
        apiService.post(resource, params, headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('participants:created', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      sendmail: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/sendmail', params).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },


      sendMailToHealthCoach: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/sendMailToHealthCoach', params).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      put: function (params, headers) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;

        apiService.put(resource + '/' + id, params, undefined, undefined, headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('participants:edited', response);
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

          $rootScope.$broadcast('participants:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      updateInfo: function (params, headers) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;
        console.log(headers, 'headers');
        // patch: function (resource, object, queryParams, headers) {
        apiService.patch(resource + '/' + id, params, undefined, headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('participants:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      // Inactive
      remove: function (id, terminationDate, headers) {
        var deferred = $q.defer();

        var params = {
          isDeleted: true,
          terminationDate: terminationDate ? utils.dateToISOString(terminationDate) : undefined,
        };
        apiService.put(resource + '/' + id, params, undefined, undefined, headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('participants:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      delete: function (id) {
        var deferred = $q.defer();

        apiService.remove(resource, id).then(function () {
          //response = response.data;

          $rootScope.$broadcast('participants:removed');
          deferred.resolve(true);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
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

          $rootScope.$broadcast('participants:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      import: function (files) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        //apiService.upload(resource + '/import', formData).then(function(response) {
        apiService.upload(resource + '/importv5', formData).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('participants:imported');
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      importParticipantForClientId: function (files, clientId, incentiveId) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        var apiUrl = resource + '/importv5/' + clientId;
        if (incentiveId) {
          apiUrl += '/incentives/' + incentiveId;
        }

        apiService.upload(apiUrl, formData).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('participants:imported');
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      importParticipantForClients: function (files, headers) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        var apiUrl = resource + '/importForClients';

        apiService.upload(apiUrl, formData).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      importHealthresult: function (files, clientID) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        apiService.upload(resource + '/healthresult/importv2/employer/' + clientID, formData).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('participants:imported');
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      /**
       * Upload for a Employer
       * @param files input
       * @param incentive obiect
       * @returns {*}
       */
      importHealthResultByIncentive: function (files, incentive, fileFormat) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        var tmpPath = '/healthresult/importv2/employer/';
        if (fileFormat === 'parkview') {
          tmpPath = '/healthresult/importParkview/employer/';
        }

        apiService.upload(resource + tmpPath + incentive.employerId + '/incentives/' + incentive.id, formData).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      /**
       * Upload for all Employer
       * @param files input
       * @returns {*}
       */
      importHealthResultForClients: function (files, fileFormat) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        var tmpPath = '/healthresult/importv2ForClients';
        if (fileFormat === 'parkview') {
          tmpPath = '/healthresult/importParkviewForClients';
        }

        apiService.upload(resource + tmpPath, formData).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      downloadUsers: function (ids, loading) {
        return users.downloadUsers(resource, ids, loading);
      },

      downloadAllUser: function (params, loading) {
        return users.downloadAllUser(resource, params, loading);
      },

      downloadAllUserV2: function (params, loading) {
        return users.downloadAllUserV2(resource, params, loading);
      },

      getListSpouse: function (params, headers, loading) {
        var deferred = $q.defer();
        var id = params.id_participant;
        delete params.id_participant;

        apiService.get(resource + "/" + id + '/spouses' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          response = response.data.data;
          response = {
            totalCount: response.totalCount,
            data: apiService.format(response.data)
          };

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getListDependents: function (params, headers, loading) {
        var deferred = $q.defer();
        var id = params.id_participant;
        delete params.id_participant;

        apiService.get(resource + "/" + id + '/dependents' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          response = response.data.data;
          response = {
            totalCount: response.totalCount,
            data: apiService.format(response.data)
          };

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      /***
       * get Benefit Year
       * @param id: participant id
       * @param loading
       * @returns {*}
       */
      getIncentives: function (id, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/incentives' + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      // Set current
      setCurrent: function (participant) {
        if (service.currentParticipant !== participant) {
          service.currentParticipant = participant;
          $rootScope.$broadcast('participants:current:updated', service.currentParticipant);
        }
      }
    };

    return service;
  });
