angular.module('security.authorization', ['security.service'])

.provider('securityAuthorization', {

    requireAuthenticatedUser: function(securityAuthorization) {
        return securityAuthorization.requireAuthenticatedUser();
    },

    $get: function(security, securityRetryQueue, $q) {

        var service = {

            // Require that there is an authenticated user
            // (use this in a route resolve to prevent non-authenticated users from entering that route)
            requireAuthenticatedUser: function() {
                return $q.when(security.requestCurrentUser()).then(function() {
                    if(!security.isAuthenticated()) {
                        return securityRetryQueue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
                    }
                });
            }
        };

        return service;
    }
});
