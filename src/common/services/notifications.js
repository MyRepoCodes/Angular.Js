angular.module('services.notifications', [])

.factory('notifications', function($rootScope) {

    var notifications = {
        'STICKY' : [],
        'ROUTE_CURRENT' : [],
        'ROUTE_NEXT' : []
    };

    $rootScope.$on('$routeChangeSuccess', function() {
        notifications.ROUTE_CURRENT.length = 0;
        notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
        notifications.ROUTE_NEXT.length = 0;
    });

    var service = {

        // Worker function for pushing a new notification onto the correct array/queue
        addNotification: function(notificationsArray, notificationObj) {
            if (!angular.isObject(notificationObj)) {
                throw new Error("Only objects can be added to the notification service.");
            }
            notificationsArray.push(notificationObj);
            return notificationObj;
        },

        // Return notifications for current route
        getCurrent: function() {
            return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
        },

        // Set a sticky notification which persists on route change
        pushSticky: function(notification) {
            return service.addNotification(notifications.STICKY, notification);
        },

        // Set a notification for the current route
        pushForCurrentRoute: function(notification) {
            return service.addNotification(notifications.ROUTE_CURRENT, notification);
        },

        // Set a notification for the next route viewed
        pushForNextRoute: function(notification) {
            return service.addNotification(notifications.ROUTE_NEXT, notification);
        },

        // Remove a notification
        remove: function(notification) {
            angular.forEach(notifications, function(notificationsByType) {
                var idx = notificationsByType.indexOf(notification);
                if (idx>-1) {
                    notificationsByType.splice(idx,1);
                }
            });
        },

        // Remove all notifications
        removeAll: function() {
            angular.forEach(notifications, function(notificationsByType) {
                notificationsByType.length = 0;
            });
        }
    };

    return service;
});
