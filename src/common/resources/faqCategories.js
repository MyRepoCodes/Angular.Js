angular.module('resources.faqCategories', [])

.factory('faqCategories',
    function($rootScope, $q, apiService) {

        // Set base url for resource (used as API endpoint)
        var resource = 'faqCategories';

        var service = {
            currentFaqCategories: null,
            faqCategoriesList: [],

            find: function(id) {
                var deferred = $q.defer();
                var existing = false;

                for(var i = 0; i < service.faqCategoriesList.length; i++) {
                    if(service.faqCategoriesList[i].id === id) {
                        service.currentFaqCategories = service.faqCategoriesList[i];
                        deferred.resolve(service.currentFaqCategories);
                        existing = true;
                        break;
                    }
                }

                if(!existing) {
                    apiService.find(resource, id).then(function(response) {
                        response = response.data.data;
                        service.currentFaqCategories = response;
                        deferred.resolve(service.currentFaqCategories);
                    }, function(error) {
                        error.data.status = error.status;
                        deferred.reject(error.data);
                    });
                }

                return deferred.promise;
            },

            get: function(params, loading) {
                var deferred = $q.defer();

                apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params).then(function(response) {
                    response = response.data.data;

                    var data = [];
                    if(angular.isArray(response)){
                        data = {
                            faqCategoriesList: response,
                            totalCount: response.length
                        };
                    }else{
                        data = {
                            faqCategoriesList: response.data,
                            totalCount: response.totalCount
                        };
                    }

                    service.faqCategoriesList = data.faqCategoriesList;

                    $rootScope.$broadcast('faqCategories:list:updated', service.faqCategoriesList);
                    deferred.resolve(data);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            post: function(params) {
                var deferred = $q.defer();

                apiService.post(resource, params).then(function(response) {
                    response = response.data.data;

                    $rootScope.$broadcast('faqCategories:created', response);
                    deferred.resolve(response);
                },  function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            put: function(params) {
                var deferred = $q.defer();
                var id = params.id;
                delete params.id;
                console.log(": H : E : A : D : E : R :");

                apiService.put(resource + '/' + id, params).then(function(response) {
                    response = response.data.data;

                    $rootScope.$broadcast('faqCategories:edited', response);
                    deferred.resolve(response);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            patch: function(params) {
                var deferred = $q.defer();
                var id = params.id;
                delete params.id;

                apiService.put(resource + '/' + id, params).then(function(response) {
                    response = response.data.data;

                    $rootScope.$broadcast('faqCategories:edited', response);
                    deferred.resolve(response);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            remove: function(id) {
                var deferred = $q.defer();

                apiService.remove(resource, id).then(function() {
                    //response = response.data;

                    $rootScope.$broadcast('faqCategories:removed');
                    deferred.resolve(true);
                },  function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            // Set current
            setCurrent: function(faqCategories) {
                if(service.currentFaqCategories !== faqCategories) {
                    service.currentFaqCategories = faqCategories;
                    $rootScope.$broadcast('faqCategories:current:updated', service.currentFaqCategories);
                }
            }
        };

        return service;
    }
);
