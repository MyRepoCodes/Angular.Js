angular.module('resources.faqs', [])

    .factory('faqs',
    function ($rootScope, $q, apiService) {

        // Set base url for resource (used as API endpoint)
        var resource = 'faqs';

        $rootScope.$on('faqs:list:updated', function (event, faqsList) {
            if (faqsList.length > 0) {
                service.setCurrent(faqsList[0]);
            }
        });

        $rootScope.$on('faqs:created', function () {

        });

        $rootScope.$on('faqs:edited', function (event, faqs) {
            for (var i = 0; i < service.faqsList.length; i++) {
                if (service.faqsList[i].id === faqs.id) {
                    service.faqsList[i] = faqs;
                    break;
                }
            }
        });

        $rootScope.$on('faqs:removed', function (event, id) {
            for (var i = 0; i < service.faqsList.length; i++) {
                if (service.faqsList[i].id === id) {
                    service.faqsList.splice(i, 1);
                    break;
                }
            }
        });

        var service = {
            currentFaqs: null,
            faqsList: [],

            find: function (id) {
                var deferred = $q.defer();
                var existing = false;

                for (var i = 0; i < service.faqsList.length; i++) {
                    if (service.faqsList[i].id === id) {
                        service.currentfaqs = service.faqsList[i];
                        deferred.resolve(service.currentfaqs);
                        existing = true;
                        break;
                    }
                }

                if (!existing) {
                    apiService.find(resource, id).then(function (response) {
                        response = response.data.data;
                        service.currentfaqs = response;
                        deferred.resolve(service.currentfaqs);
                    }, function (error) {
                        error.data.status = error.status;
                        deferred.reject(error.data);
                    });
                }

                return deferred.promise;
            },
            get: function (params, headers, loading) {
                var deferred = $q.defer();  
              if(params.viewActivity){
                    resource = resource+'/'+params.id;
                     delete params.id;      
                     delete params.viewActivity;               
                }       
                apiService.get(resource, params, headers).then(function (response) {
                    response = response.data.data;
                    var data = {
                        faqsList: response.data,
                        totalCount: response.totalCount
                    };
                    service.faqsList = data.faqsList;

                    $rootScope.$broadcast('faqs:list:updated', service.faqsList);
                    deferred.resolve(data);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            updateMutipleFaq: function (params) {
                var deferred = $q.defer();

                apiService.post(resource+ '/updateMutipleFaq', params).then(function (response) {
                    response = response.data.data;

                    deferred.resolve(response);
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

                    $rootScope.$broadcast('faqs:created', response);
                    deferred.resolve(response);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            put: function (params,headers) {
                var deferred = $q.defer();
                var id = params.id;
                delete params.id;              
                apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function (response) {
                    response = response.data.data;

                    $rootScope.$broadcast('faqs:edited', response);
                    deferred.resolve(response);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            patch: function (params,headers) {
                var deferred = $q.defer();
                var id = params.id;
                delete params.id;

                apiService.put(resource + '/' + id, params,undefined,undefined,headers).then(function (response) {
                    response = response.data.data;

                    $rootScope.$broadcast('faqs:edited', response);
                    deferred.resolve(response);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            remove: function (id,headers) {
                var deferred = $q.defer();

                apiService.remove(resource, id,undefined,headers).then(function () {
                  //response = response.data;
                  $rootScope.$broadcast('faqs:removed');
                  deferred.resolve(true);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            // Set current
            setCurrent: function (faqs) {
                if (service.currentfaqs !== faqs) {
                    service.currentfaqs = faqs;
                    $rootScope.$broadcast('faqs:current:updated', service.currentfaqs);
                }
            }
        };
        return service;
    });
