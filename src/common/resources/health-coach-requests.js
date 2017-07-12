angular.module('resources.health-coach-requests', [])

.factory('healthcoachrequests',
    function($rootScope, $q, apiService) {

        // Set base url for resource (used as API endpoint)
        var resource = 'healthcoachrequests';

        var service = {
            currentHealthCoachRequest: null,
            healthCoachRequestList: [],

            find: function(id) {
                var deferred = $q.defer();
                var existing = false;

                for(var i = 0; i < service.adminList.length; i++) {
                    if(service.healthCoachRequestList[i].id === id) {
                        service.currentHealthCoachRequest = service.healthCoachRequestList[i];
                        deferred.resolve(service.currentHealthCoachRequest);
                        existing = true;
                        break;
                    }
                }

                if(!existing) {
                    apiService.find(resource, id).then(function(response) {
                        response = response.data.data;
                        service.currentHealthCoachRequest = response;
                        deferred.resolve(service.currentHealthCoachRequest);
                    }, function(error) {
                        error.data.status = error.status;
                        deferred.reject(error.data);
                    });
                }

                return deferred.promise;
            },

            get: function(params, headers, loading) {
                var deferred = $q.defer();

                apiService.get(resource + (loading === false ? '?loadingSpinnerNotShowing' : ''), params, headers).then(function(response) {
                    response = response.data.data;
                    var data = {
                        list: response.data,
                        totalCount: response.totalCount
                    };
                    service.healthCoachRequestList = data.list;
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
                    deferred.resolve(response);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            put: function(params) {
                var deferred = $q.defer();
                var id = params.id;
                delete params.id;

                apiService.put(resource + '/' + id, params).then(function(response) {
                    response = response.data.data;

                    $rootScope.$broadcast('admins:edited', response);
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

                    $rootScope.$broadcast('healthCoachRequests:edited', response);
                    deferred.resolve(response);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            remove: function(id) {
                var deferred = $q.defer();

                /*apiService.remove(resource, id).then(function() {
                    $rootScope.$broadcast('healthCoachRequests:removed');
                    deferred.resolve(true);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });*/

                var params = {
                    "isDeleted": true
                };
                apiService.put(resource + '/' + id, params).then(function (response) {
                    response = response.data.data;

                    $rootScope.$broadcast('healthCoachRequests:removed');
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

                    $rootScope.$broadcast('healthCoachRequests:removed');
                    deferred.resolve(response);
                }, function (error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            // Set current
            setCurrent: function(healthCoachRequests) {
                if(service.currentHealthCoachRequest !== healthCoachRequests) {
                    service.currentHealthCoachRequest = healthCoachRequests;
                    $rootScope.$broadcast('healthCoachRequests:current:updated', service.currentHealthCoachRequest);
                }
            }
        };

        return service;
    }
);
