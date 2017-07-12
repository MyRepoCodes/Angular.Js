angular.module('security.interceptor', ['security.retryQueue'])

.factory('securityInterceptor', function($rootScope, $q, $injector, securityRetryQueue) {
    return {

        // optional method
        'request': function(config) {

            // do something on success
            return config || $q.when(config);
        },

        // optional method
        'requestError': function(rejection) {

            // do something on error
            return $q.reject(rejection);
        },

        // optional method
        'response': function(response) {

            // do something on success
            return response || $q.when(response);
        },

        // optional method
        'responseError': function(rejection) {
            var promise;

            if(rejection.status === 0) { // Request timeout
                $rootScope.$broadcast('response:timeout', rejection);
            }
            if(rejection.status === 400) { // Bad Request

            }
            if(rejection.status === 401) { // Authorization Required
                // You do not have permission to access this document.
                $rootScope.$broadcast('API:loading:ended');

                // The request bounced because it was not authorized - add a new request to the retry queue
                promise = securityRetryQueue.pushRetryFn('unauthorized-server', function retryRequest() {

                    // We must use $injector to get the $http service to prevent circular dependency
                    return $injector.get('$http')(rejection.config);
                });

                // Send error
                $rootScope.$broadcast('response:authorized:error', rejection);

                return promise;
            }
            if(rejection.status === 403) { // Forbidden

            }

            return $q.reject(rejection);
        }
    };
})

// Push the security interceptor onto the interceptors array
.config(function($httpProvider) {
    $httpProvider.interceptors.push('securityInterceptor');
});
