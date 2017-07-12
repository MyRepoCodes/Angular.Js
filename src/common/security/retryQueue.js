angular.module('security.retryQueue', [])

// This is a generic queue for security failures. Each item 
// is expected to expose to functions: retry and cancel.
.factory('securityRetryQueue', function($q, $log) {
    
    var retryQueue = [];

    var service = {

        // Array of callbacks to be run when something is added to the retryQueue
        onItemAddedCallbacks: [],

        // Check if more items exists in retryQueue
        hasMore: function() {
            return retryQueue.length > 0;
        },

        // Push a new item onto the retryQueue
        push: function(retryItem) {

            retryQueue.push(retryItem);

            angular.forEach(service.onItemAddedCallbacks, function(cb) {
                try {
                    cb(retryItem);
                }
                catch(e) {
                    $log.error('security.retryQueue.push(retryItem): callback threw an error');
                }
            });
        },

        pushRetryFn: function(reason, retryFn) {

            // The reason parameter is optional
            if ( arguments.length === 1) {
                retryFn = reason;
                reason = undefined;
            }

            // The deferred object that will be resolved or rejected by calling retry or cancel
            var deferred = $q.defer();

            var retryItem = {

                reason: reason,

                retry: function() {

                    // Wrap the result of the retryFn into a promise if it is not already
                    $q.when(retryFn()).then(function(value) {

                        // If it was successful then resolve our deferred
                        deferred.resolve(value);

                    }, function(value) {

                        // Otherwise reject it
                        deferred.reject(value);
                    });
                },

                cancel: function() {

                    // Give up on retrying and reject our deferred
                    deferred.reject();
                }
            };

            service.push(retryItem);
            return deferred.promise;
        },

        // Get reason for first retry in queue 
        retryReason: function() {
            return service.hasMore() && retryQueue[0].reason;
        },

        // Cancel all retries in queue
        cancelAll: function() {
            while(service.hasMore()) {
                retryQueue.shift().cancel();
            }
        },

        // Retry all retries in queue
        retryAll: function() {
            while(service.hasMore()) {
                retryQueue.shift().retry();
            }
        }
    };

    return service;
});
