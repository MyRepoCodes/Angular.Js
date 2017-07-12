angular.module('resources.users', [])

  .factory('users', function ($rootScope, $q, $window, apiService, i18nNotifications, utils) {

    // Set base url for resource (used as API endpoint)
    var resource = 'users';

    // Set error notification if all() request fails
    function fetchAllApiError(error) {
      i18nNotifications.push0ForCurrentRoute('crud.default.error', 'warning');
    }

    var service = {

      // Get list of documents assigned to current user
      getDocuments: function (params, loading) {
        var deferred = $q.defer();
        var id = params.id;
        delete params.id;

        apiService.get(resource + '/' + id + '/documents' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          response = response.data.data;
          var data = {
            documentList: response.data,
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

      // GET /api/users/me/documents Get list of documents assigned to current user
      getMeDocuments: function (params, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/me/documents' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          response = response.data.data;
          var data = {
            documentList: response.data,
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

      // Get list of documents uploaded by current user
      getUploadeds: function (id, loading) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/documents' + '/uploaded' + (loading === false ? '?loadingSpinnerNotShowing' : '')).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },

      patchUserSecurity: function (params,headers) {
        var deferred = $q.defer();
        var id = params.userId;
        delete params.userId;

        if (_.isEmpty(params)) {
          deferred.resolve(true);
        } else {
          apiService.put(resource + '/' + id + '/changesecurity', params,undefined,undefined,headers).then(function (response) {
            response = response.data.data;
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });
        }

        return deferred.promise;
      },

      checkEmailExist: function (params) {
        var deferred = $q.defer();

        apiService.post(resource + '/checkEmailExist', params).then(function (response) {
          response = response.data.data;

          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },


      uploadImageForUser: function (id, formData) {
        var deferred = $q.defer();

        apiService.upload(resource + '/' + id + '/avatar', formData).then(function (response) {

          apiService.get('users/' + id + '/avatar?loadingSpinnerNotShowing&api_key=' + encodeURIComponent(apiService.authToken)).then(function (response2) {
            deferred.resolve(apiService.getUrl('users/' + id + '/avatar'));
          }, function (error) {
            deferred.reject(error.data);
          });

        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      getImageForUser: function (id) {
        var deferred = $q.defer();

        apiService.get(resource + '/' + id + '/avatar?loadingSpinnerNotShowing&api_key=' + encodeURIComponent(apiService.authToken)).then(function (response) {
          deferred.resolve(apiService.getUrl('users/' + id + '/avatar'));
        }, function (error) {
          deferred.resolve(false);
        });

        return deferred.promise;
      },

      getCurrentMe: function (params) {
        var deferred = $q.defer();

        //get new info
        apiService.get(resource + '/auth?loadingSpinnerNotShowing&ver=' + Math.random(), params)
          .then(function (response) {
            deferred.resolve(response.data.data);
          }, function (error) {
            deferred.resolve(false);
          });

        return deferred.promise;
      },

      getAllNotifications: function (params) {
        var deferred = $q.defer();

        //get new info
        apiService.get(resource + '/me/notifications', params)
          .then(function (response) {
            response = response.data.data;

            //total
            response['total'] = response['countContact'] + response['countSurvey'] + response['countObjectChangeForm'] + response['countDirectDeposit'] + response['countPrivacyAuthorizationForm'];

            $rootScope.$broadcast('getAllNotifications:updated', response);

            deferred.resolve(response);
          }, function (error) {
            deferred.resolve(false);
          });

        return deferred.promise;
      },


      assignroles: function (params) {
        var deferred = $q.defer();
        var id = params.userId;
        delete params.userId;

        apiService.put(resource + '/' + id + '/assignroles', params).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
          //fetchAllApiError(error);
        });

        return deferred.promise;
      },


      deleteAvatar: function () {
          var deferred = $q.defer();

          apiService.remove(resource + '/me/avatar').then(function () {
            deferred.resolve(true);
          }, function (error) {
            deferred.reject(error.data);
          });

          return deferred.promise;
        },
      deleteAvatarDependent: function (id) {
          var deferred = $q.defer();

          apiService.remove(resource + '/'+id+'/avatar').then(function () {
            deferred.resolve(true);
          }, function (error) {
            deferred.reject(error.data);
          });

          return deferred.promise;
        },

      patchMeSecurity: function (params,headers) {
        var deferred = $q.defer();

        if (_.isEmpty(params)) {
          deferred.resolve(true);
        } else {
          apiService.put(resource + '/me/changesecurity', params,undefined,undefined,headers).then(function (response) {
            response = response.data.data;
            deferred.resolve(response);
          }, function (error) {
            error.data.status = error.status;
            deferred.reject(error.data);
            //fetchAllApiError(error);
          });
        }

        return deferred.promise;
      },

      updateQuestionSecurity: function (params,headers) {
        var deferred = $q.defer();

        apiService.post(resource, params,headers).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      downloadUsers: function (resource, ids, loading) {
        if (_.isArray(ids)) {
          ids = ids.join(',');
        }
        $window.open(apiService.getBaseUrl() + '/' + resource + '/downloadUsers?ids=' + encodeURIComponent(ids) + (loading === false ? '&loadingSpinnerNotShowing' : ''));
      },

      downloadAllUser: function (resource, params, loading) {
        $window.open(apiService.getBaseUrl() + '/' + resource + '/downloadAllUser?' + utils.convertToUrlParams(params) + (loading === false ? '&loadingSpinnerNotShowing' : ''));
      },

      downloadAllUserV2: function (resource, params, loading) {
        var deferred = $q.defer();
        apiService.download(resource + '/downloadUsersV2' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
          var fileContent = response.data.data;
          var contentType = response.headers('content-type');
          var contentLength = response.headers('content-length');
          var lastModified = response.headers('last-modified');
          var contentDisposition = response.headers('content-disposition');
          var extension = utils.getExtension(contentType);

          var filename = '';
          if (contentDisposition) {
            contentDisposition = contentDisposition.split('filename=');
            if (contentDisposition[1]) {
              filename = contentDisposition[1];
            }
          }

          if (!filename) {
            filename = 'download-users.' + extension;
          }

          var data = {
            contentType: contentType,
            contentLength: contentLength,
            lastModified: lastModified,
            fileContent: fileContent,
            filename: filename
          };
          utils.saveAs(data.fileContent, data.filename, data.contentType);
          deferred.resolve(data);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },
    };

    return service;
  });
