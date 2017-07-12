angular.module('services.i18nNotifications', [])

.factory('i18nNotifications', function(localizedMessages, notifications) {

    // Helper function for displaying notifications in the correct language
    var prepareNotification = function(msgKey, type, interpolateParams, otherProperties) {
        return angular.extend({
            message: localizedMessages.get(msgKey, interpolateParams),
            type: type
        }, otherProperties);
    };

    var i18nNotifications = {

        // Return notifications for current route
        getCurrent: function() {
            return notifications.getCurrent();
        },

        // Set a sticky notification which persists on route change
        pushSticky: function(msgKey, type, interpolateParams, otherProperties) {
            return notifications.pushSticky(prepareNotification(msgKey, type, interpolateParams, otherProperties));
        },

        // Set a notification for the current route
        pushForCurrentRoute: function(msgKey, type, interpolateParams, otherProperties) {
            return notifications.pushForCurrentRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
        },

        // Set a notification for the next route viewed
        pushForNextRoute: function(msgKey, type, interpolateParams, otherProperties) {
            return notifications.pushForNextRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
        },

        // Remove a notification
        remove: function(notification) {
            return notifications.remove(notification);
        },

        // Remove all notifications
        removeAll: function() {
            return notifications.removeAll();
        }
    };

    return i18nNotifications;
});
