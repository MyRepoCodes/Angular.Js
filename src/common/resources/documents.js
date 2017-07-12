angular.module('resources.documents', [])

    .factory('documents',
    function ($rootScope, $q, apiService, i18nNotifications) {

        // Set base url for resource (used as API endpoint)
        var resource = 'documents';

        // Set error notification if all() request fails
        function fetchAllApiError(error) {
            i18nNotifications.pushForCurrentRoute('crud.default.error', 'warning');
        }

        $rootScope.$on('documents:list:updated', function (event, documentList) {
            if (documentList.length > 0) {
                service.setCurrent(documentList[0]);
            }
        });

        $rootScope.$on('documents:created', function () {
            service.documentList = [];
        });

        $rootScope.$on('documents:edited', function (event, document) {
            for (var i = 0; i < service.documentList.length; i++) {
                if (service.documentList[i].id === document.id) {
                    service.documentList[i] = document;
                    break;
                }
            }
        });

        $rootScope.$on('documents:removed', function (event, id) {
            for (var i = 0; i < service.documentList.length; i++) {
                if (service.documentList[i].id === id) {
                    service.documentList.splice(i, 1);
                    break;
                }
            }
        });

        var service = {
            currentDocument: null,
            documentList: [],
            newDocuments: null,

            find: function (id) {
                var deferred = $q.defer();
                var existing = false;

                for (var i = 0; i < service.documentList.length; i++) {
                    if (service.documentList[i].id === id) {
                        service.currentDocument = service.documentList[i];
                        deferred.resolve(service.currentDocument);
                        existing = true;
                        break;
                    }
                }

                if (!existing) {
                    apiService.find(resource, id).then(function (response) {
                        response = response.data.data;
                        service.currentDocument = response;
                        deferred.resolve(service.currentDocument);
                    }, function (error) {
                        error.data.status = error.status;
                        deferred.reject(error.data);
                        //fetchAllApiError(error);
                    });
                }

                return deferred.promise;
            },

            get: function (params, loading) {
                var deferred = $q.defer();

                apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
                    response = response.data.data;
                    var data = {
                        documentList: response.data,
                        totalCount: response.totalCount
                    };
                    service.documentList = data.documentList;

                    $rootScope.$broadcast('documents:list:updated', service.documentList);
                    deferred.resolve(data);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            getNotifications: function (params, loading) {
                var deferred = $q.defer();

                apiService.get(resource + '/notifications' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
                    response = response.data.data;
                    service.newDocuments = response;

                    $rootScope.$broadcast('documents:notifications', service.newDocuments);
                    deferred.resolve(response);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            getEmployers: function (params, loading) {
                var deferred = $q.defer();

                apiService.get(resource + '/employers' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
                    response = response.data.data;
                    var data = {
                        employerList: response.data,
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

            getHealthCoachs: function (params, loading) {
                var deferred = $q.defer();

                apiService.get(resource + '/healthcoachs' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
                    response = response.data.data;
                    var data = {
                        userList: response.data,
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

            getParticipants: function (params, loading) {
                var deferred = $q.defer();

                apiService.get(resource + '/participants' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
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

            getParticipantsByClient: function (params, idClient, loading) {
                var deferred = $q.defer();

                apiService.get(resource + '/employers/' + idClient + '/participants' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
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

            post: function (params) {
                var deferred = $q.defer();

                apiService.post(resource, params).then(function (response) {
                    response = response.data.data;

                    $rootScope.$broadcast('documents:created', response);
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

                    $rootScope.$broadcast('documents:edited', response);
                    deferred.resolve(response);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            putNotifications: function (params, loading) {
                var deferred = $q.defer();

                apiService.put(resource + '/notifications' + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function (response) {
                    service.newDocuments = null;

                    $rootScope.$broadcast('documents:notifications:removed', service.newDocuments);
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

                    $rootScope.$broadcast('documents:edited', response);
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
                    //response = response.data;

                    $rootScope.$broadcast('documents:removed');
                    deferred.resolve(true);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            upload: function (files) {
                var deferred = $q.defer();

                var formData = new FormData();
                //for(var i = 0; i < files.length; i++) {
                //    formData.append('file' + i, files[i]);
                //}
                formData.append('file', files[0]);

                apiService.upload(resource + '/upload', formData).then(function (response) {
                    response = response.data.data;

                    $rootScope.$broadcast('documents:uploaded');
                    deferred.resolve(response);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            //*** Ids of document to download. Should be in SYNTAX: id,id,id
            download: function (ids, loading) {
                var deferred = $q.defer();
                apiService.download(resource + '/download?documentIds=' + encodeURIComponent(ids) + (loading === false ? '&loadingSpinnerNotShowing' : ''))
                    .then(function (response) {
                        var filename = '';
                        var contentDisposition = response.headers('content-disposition');
                        if (contentDisposition) {
                            contentDisposition = contentDisposition.split('filename=');
                            if (contentDisposition[1]) {
                                filename = contentDisposition[1];
                            }
                        }

                        if (!filename) {
                            filename = 'documents.zip';
                        }

                        var data = {
                            contentType: response.headers('content-type'),
                            contentLength: response.headers('content-length'),
                            lastModified: response.headers('last-modified'),
                            fileContent: response.data.data,
                            filename: filename
                        };
                        deferred.resolve(data);
                    }, function (error) {
                        error.data.status = error.status;
                        deferred.reject(error.data);
                        //fetchAllApiError(error);
                    });

                return deferred.promise;
            },

            // Set current
            setCurrent: function (document) {
                if (service.currentDocument !== document) {
                    service.currentDocument = document;
                    $rootScope.$broadcast('documents:current:updated', service.currentDocument);
                }
            }
        };

        return service;
    }
);
