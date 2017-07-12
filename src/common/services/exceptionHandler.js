angular.module('services.exceptionHandler', [])

.factory('exceptionHandlerFactory', function ($injector) {
    
    return function($delegate) {
        return function(exception, cause) {

            // Lazy load notifications to get around circular dependency
            // Circular dependency: $rootScope <- notifications <- i18nNotifications <- $exceptionHandler
            var i18nNotifications = $injector.get('i18nNotifications');

            // Pass through to original handler
            $delegate(exception, cause);

            // Push a notification error
            i18nNotifications.pushForCurrentRoute('error.fatal', 'danger', {}, {
                exception: exception,
                cause: cause
            });
        };
    };
})

.config(function($provide) {
    $provide.decorator('$exceptionHandler', function($delegate, exceptionHandlerFactory) {
        return exceptionHandlerFactory($delegate);
    });
});
