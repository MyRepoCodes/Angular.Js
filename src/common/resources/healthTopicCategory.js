angular.module('resources.healthTopicCategory', [])

.factory('healthTopicCategory',
    function($rootScope, $q, apiService) {

        // Set base url for resource (used as API endpoint)
        var resource = 'healthtopiccategories';

        var service = {
            currentCategories: null,
            categoriesList: [],

            find: function(id) {
                var deferred = $q.defer();
                var existing = false;

                for(var i = 0; i < service.categoriesList.length; i++) {
                    if(service.categoriesList[i].id === id) {
                        service.currentCategories = service.categoriesList[i];
                        deferred.resolve(service.currentCategories);
                        existing = true;
                        break;
                    }
                }

                if(!existing) {
                    apiService.find(resource, id).then(function(response) {
                        response = response.data.data;
                        service.currentCategories = response;
                        deferred.resolve(service.currentCategories);
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
                            categoriesList: response,
                            totalCount: response.length
                        };
                    }else{
                        data = {
                            categoriesList: response.data,
                            totalCount: response.totalCount
                        };
                    }

                    service.categoriesList = data.categoriesList;

                    $rootScope.$broadcast('healthTopicsCategories:list:updated', service.categoriesList);
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

                    $rootScope.$broadcast('healthTopicsCategories:created', response);
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

                apiService.put(resource + '/' + id, params).then(function(response) {
                    response = response.data.data;

                    $rootScope.$broadcast('healthTopicsCategories:edited', response);
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

                    $rootScope.$broadcast('healthTopicsCategories:edited', response);
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

                    $rootScope.$broadcast('healthTopicsCategories:removed');
                    deferred.resolve(true);
                },  function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            // Set current
            setCurrent: function(Categories) {
                if(service.currentCategories !== Categories) {
                    service.currentCategories = Categories;
                    $rootScope.$broadcast('healthTopicsCategories:current:updated', service.currentCategories);
                }
            }
        };

        return service;
    }
);
