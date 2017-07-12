 angular.module('resources.question', [])

.factory('question',
    function($rootScope, $q, apiService) {

        // Set base url for resource (used as API endpoint)
        var resource = 'questions';

        $rootScope.$on('questions:list:updated', function(event, questionList) {
            if(questionList.length > 0) {
                service.setCurrent(questionList[0]);
            }
        });

        $rootScope.$on('questions:created', function() {

        });

        $rootScope.$on('questions:edited', function(event, questionList) {
            for(var i = 0; i < service.questionList.length; i++) {
                if(service.questionList[i].id === question.id) {
                    service.questionList[i] = question;
                    break;
                }
            }
        });

        $rootScope.$on('questions:removed', function(event, id) {
            for(var i = 0; i < service.questionList.length; i++) {
                if(service.questionList[i].id === id) {
                    service.questionList.splice(i, 1);
                    break;
                }
            }
        });

        var service = {
            currentQuestion: null,
            //faqsList: [],
            
        //This section can be used for if we want serch functionality for question module so its still here
            
            // find: function(id) {
            //     var deferred = $q.defer();
            //     var existing = false;

            //     for(var i = 0; i < service.faqsList.length; i++) {
            //         if(service.faqsList[i].id === id) {
            //             service.currentfaqs = service.faqsList[i];
            //             deferred.resolve(service.currentfaqs);
            //             existing = true;
            //             break;
            //         }
            //     }

            //     if(!existing) {
            //         apiService.find(resource, id).then(function(response) {
            //             response = response.data.data;
            //             service.currentfaqs = response;
            //             deferred.resolve(service.currentfaqs);
            //         }, function(error) {
            //             error.data.status = error.status;
            //             deferred.reject(error.data);
            //         });
            //     }

            //     return deferred.promise;
            // },

            get: function(params, headers, loading) {
                var deferred = $q.defer();
                if(params.viewActivity){
                    resource = resource+'/'+params.id;
                     delete params.id;      
                     delete params.viewActivity;               
                }

               apiService.get(resource, params, headers).then(function(response) {
                    
                    response = response.data.data;

                    var data = {
                        questionList: response.availableSecurityQuestions,
                        totalCount: response.totalCount
                    };

                    service.questionList = data.questionList;
                    

                    $rootScope.$broadcast('question:list:updated', service.questionList);
                    deferred.resolve(data);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            post: function(params,headers) {
                var deferred = $q.defer();     

                apiService.post(resource,params,headers).then(function(response) {
                    response = response.data.data;

                    $rootScope.$broadcast('question:created', response);
                    deferred.resolve(response);
                },  function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                    //fetchAllApiError(error);
                });

                return deferred.promise;
            },

            put: function(params,headers) {
                var deferred = $q.defer();
                var id = params.id;
                delete params.id;

                apiService.put(resource+'/edit/'+id, params,undefined,undefined,headers).then(function(response) {
                    response = response.data.data;

                    $rootScope.$broadcast('question:edited', response);
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

                    $rootScope.$broadcast('question:edited', response);
                    deferred.resolve(response);
                }, function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            remove: function(id,headers) {
                var deferred = $q.defer();
                //var IsDeleted =  {IsDeleted :false};
                apiService.remove(resource, id,undefined,headers).then(function() {
                    //response = response.data;

                    $rootScope.$broadcast('question:removed');
                    deferred.resolve(true);
                },  function(error) {
                    error.data.status = error.status;
                    deferred.reject(error.data);
                });

                return deferred.promise;
            },

            //Set current
            setCurrent: function(question) {
                if(service.currentQuestion !== question) {
                    service.currentQuestion = question;
                    $rootScope.$broadcast('question:current:updated', service.currentQuestion);
                }
            }
        };

        return service;
    }
);
