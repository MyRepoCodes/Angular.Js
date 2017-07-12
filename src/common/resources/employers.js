angular.module('resources.employers', [])

  .factory('employers', function ($rootScope, $q, apiService, users, i18nNotifications, CONFIGS, utils) {

    // Set base url for resource (used as API endpoint)
    var resource = 'employers';
    var resource_users = 'users';

    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
    }

    $rootScope.$on('employers:list:updated', function (event, employerList) {
      service.employerList = employerList;
    });

    $rootScope.$on('employers:created', function (event, employer) {
      service.employerList = [];
    });

    $rootScope.$on('employers:edited', function (event, employer) {
      service.employerList = [];
    });

    $rootScope.$on('employers:removed', function (event, id) {
      /*for (var i = 0; i < service.employerList.length; i++) {
        if (service.employerList[i].id === id) {
          service.employerList.splice(i, 1);
          break;
        }
      }*/
      service.employerList = [];
    });

    var service = {
      currentEmployer: null,
      employerList: [],

      all: function (headers, loading) {
        var deferred = $q.defer();
        var params = { fields: 'id,clientName,firstName,lastName,employerLocations,products,groupNumber,effectiveDateOfInsurance,enrollmentDate,annualMaximum' };

        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          var data = [];
          if (!angular.isArray(response.data.data)) {
            response = response.data.data;
            data = {
              employerList: response.data,
              totalCount: response.totalCount
            };
          } else {
            data = {
              employerList: response.data.data,
              totalCount: response.data.data.length
            };
          }

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      find: function (id) {
        var deferred = $q.defer();

        apiService.find(resource, id).then(function (response) {
          response = response.data.data;
          service.currentEmployer = response;
          deferred.resolve(service.currentEmployer);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      // Get List for dropdown
      getList: function () {
        var deferred = $q.defer();

        if (!_.isEmpty(service.employerList)) {
          deferred.resolve(service.employerList);
        } else {
          var params = { fields: 'id,clientName,firstName,lastName,products' };
          apiService.get(resource + '?loadingSpinnerNotShowing', params).then(function (response) {
            response = response.data.data;
            $rootScope.$broadcast('employers:list:updated', response);
            deferred.resolve(response);
          }, function () {
            deferred.resolve([]);
          });
        }

        return deferred.promise;
      },

      get: function (params, headers, loading) {
        var deferred = $q.defer();
        $rootScope.$broadcast('INFO:sortClient', params);
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          var data = [];
          if (!angular.isArray(response.data.data)) {
            response = response.data.data;
            data = {
              employerList: response.data,
              totalCount: response.totalCount
            };
          } else {
            data = {
              employerList: response.data.data,
              totalCount: response.data.data.length
            };
          }

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },


      getAutoComplete: function (params, headers, loading) {
        var deferred = $q.defer();
        apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          var data = [];
          if (!angular.isArray(response.data.data)) {
            response = response.data.data;
            data = {
              employerList: response.data,
              totalCount: response.totalCount
            };
          } else {
            data = {
              employerList: response.data.data,
              totalCount: response.data.data.length
            };
          }

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      // api/employers/id/getEmployerWithIncentive?registerStartYear=2015
      getEmployerWithIncentive: function (params,headers, loading) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;

        apiService.get(resource + '/' + id + '/getEmployerWithIncentive' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params,headers).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      // api/employers/id/benefitYearBcs
      getBenefitYearBcs: function (id, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/benefitYearBcs' + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;
          _.forEach(response, function (item) {
            item.startDate = utils.dateServerToLocalTime(item.startDate);
            item.endDate = utils.dateServerToLocalTime(item.endDate);
            item.registerStartDate = utils.dateServerToLocalTime(item.registerStartDate);
            item.registerEndDate = utils.dateServerToLocalTime(item.registerEndDate);
          });

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      getEmployerActive: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/active' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          var data = [];
          if (!angular.isArray(response.data.data)) {
            response = response.data.data;
            data = {
              employerList: response.data,
              totalCount: response.totalCount
            };
          } else {
            data = {
              employerList: response.data.data,
              totalCount: response.data.data.length
            };
          }

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      getEmployerInActive: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/inactive' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          var data = [];
          if (!angular.isArray(response.data.data)) {
            response = response.data.data;
            data = {
              employerList: response.data,
              totalCount: response.totalCount
            };
          } else {
            data = {
              employerList: response.data.data,
              totalCount: response.data.data.length
            };
          }

          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      post: function (params,headers) {
        var deferred = $q.defer();

        apiService.post(resource, params,headers).then(function (response) {
          response = response.data.data;
          $rootScope.$broadcast('employers:created', response);
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

          $rootScope.$broadcast('employers:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      patch: function (params,headers) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;

        apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('employers:edited', response);
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      remove: function (id,headers) {
        var deferred = $q.defer();

        /*apiService.remove(resource, id).then(function() {
          $rootScope.$broadcast('employers:removed');
          deferred.resolve(true);
        }, function(error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });*/

        var params = {
          "isDeleted": true
        };
        apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function () {
          $rootScope.$broadcast('employers:removed');
          deferred.resolve(true);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });


        return deferred.promise;
      },

      delete: function (id) {
        var deferred = $q.defer();

        apiService.remove(resource, id).then(function () {
          $rootScope.$broadcast('employers:removed');
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

          $rootScope.$broadcast('employers:removed');
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      uploadLogos: function (files) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }
        apiService.upload(resource + '/uploadLogos', formData).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      updateUsername: function (params) {
        var deferred = $q.defer();

        var dataPostUpdateUsername = {
          "newUserName": params.newUserName
        };

        apiService.post(resource_users + '/' + params.id + '/changeusername', dataPostUpdateUsername).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },


      updatePassword: function (params) {
        var deferred = $q.defer();

        var dataPostUpdateUsername = {
          "newPassword": params.newPassword
        };

        apiService.post(resource_users + '/' + params.id + '/changepassword', dataPostUpdateUsername).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      // Get info by specific client ur
      findByUrl: function (clientUrl, loading) {
        var deferred = $q.defer();
        apiService.get(resource + '/clienturl' + '/' + clientUrl + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
        return deferred.promise;
      },

      // Get logo by specific client ur
      getLogoByUrl: function (clientUrl, loading) {
        var deferred = $q.defer();
        apiService.get(resource + '/clienturl' + '/' + clientUrl + '/logo' + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function () {
          var brand = CONFIGS.baseURL() + '/' + resource + '/clienturl' + '/' + clientUrl + '/logo';
          deferred.resolve(brand);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
        return deferred.promise;
      },

      // Get logo by specific client ur
      getLogoUrlById: function (id, loading) {
        var deferred = $q.defer();
        apiService.get(resource + '/logos' + '/' + id + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function () {
          var logoUrl = CONFIGS.baseURL() + '/' + resource + '/logos' + '/' + id;
          deferred.resolve(logoUrl);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });
        return deferred.promise;
      },

      /*
      getParticipants: function (id, params, headers, loading) {
        var deferred = $q.defer();

        $rootScope.$broadcast('INFO:sort', params);

        apiService.get(resource + '/' + id + '/participants' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function (response) {
          response = response.data.data;
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
      */

      getSpouse: function (id, params, header, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/spouses', params, header).then(function (response) {
          response = response.data.data;
          var data = {
            data: response.data,
            totalCount: response.totalCount
          };
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);

        });

        return deferred.promise;
      },


      getAllParticipants: function (id, params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/withhealthresult', params).then(function (response) {
          response = response.data.data;
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

      getAllParticipantsByID: function (id, params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/participants/withhealthresult' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params)
          .then(function (response) {
            response = response.data.data;
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

      getHealthResultByIDClient: function (id, params, header, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/participants/withhealthresultv2', params, header)
          .then(function (response) {
            var tempResponse = response.data.data;
            var data = {
              participantList: tempResponse.data.healthResults,
              totalCount: tempResponse.totalCount
            };
            deferred.resolve(data);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });

        return deferred.promise;
      },

      // http://local.beesightsoft.com:5005/swagger-ui/#!/employers/GetParticipantsByEmployerWithHealthResult
      getHealthResultByIDClientBenefitYear: function (id, params, benefityear, header, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/participants/withhealthresultv3?incentiveId=' + benefityear, params, header)
          .then(function (response) {
            var tempResponse = response.data.data;
            var data = {
              participantList: tempResponse.data.healthResults,
              totalCount: tempResponse.totalCount
            };
            deferred.resolve(data);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
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

      importMultipe: function (files) {
        var deferred = $q.defer();
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('file' + i, files[i]);
        }

        var apiUrl = resource + '/import';
        

        apiService.upload(apiUrl, formData).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      // Set current
      setCurrent: function (employer) {
        if (service.currentEmployer !== employer) {
          service.currentEmployer = employer;
          $rootScope.$broadcast('employers:current:updated', service.currentEmployer);
        }
      }
    };

    return service;
  });
