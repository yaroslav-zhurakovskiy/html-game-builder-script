/**
 * Cocoon's notification plugin
 * http://ludei.github.io/atomic-plugins-docs/dist/doc/js/Cocoon.Notification.html
 *
 * This used to be a universal plugin for local and push notifications, but since Parse
 * is now dead, we must use Firebase
 */
bento.define('modules/notifications', [
    'bento/utils',
    'bento/eventsystem'
], function (
    Utils,
    EventSystem
) {
    'use strict';
    var initialized = false;
    var localService;
    var nothing = function () {};
    /**
     * Initialize local notification system. Registers service automatically after initialization.
     * Registering may show a Dialog to request user permissions.
     * @param {Function} onComplete - Optional callback to be called after successful initialization
     */
    var init = function (onComplete) {
        var initLocal = function () {
            localService.initialize({}, function (registered, error) {
                localService.isRegistered(function (granted) {
                    if (!granted) {
                        Utils.log("ERROR: couldn't register notifications");
                    } else {
                        console.log('Notifications registered successfully');
                    }

                    initialized = granted;

                    // cocoon bug: re-initialize idIndex, should not start at 0! we'd get duplicate ids on restart if
                    localService.idIndex = Date.now();

                    if (onComplete) {
                        onComplete(initialized);
                    }
                });
            });
        };

        // check if the plugin is available
        if (!window.Cocoon || !window.Cocoon.Notification || !window.Cocoon.Notification.Local) {
            Utils.log("ERROR: No local notification plugin found");
            return;
        }
        if (!initialized) {
            localService = window.Cocoon.Notification.Local;
            initLocal();

        } else {
            Utils.log("ERROR: Local notifications already initialized.");
            if (onComplete) {
                onComplete(initialized);
            }
        }
    };

    /**
     * Sends/schedules notification
     * @param  {Object} notification - Notification to send/schedule
     *             {String} title: (tested on iOS) The notification title. By default, it will be the app title
     *             {String} message: The notification message. By default, it will be empty
     *             {Boolean} soundEnabled: A flag that indicates if the sound should be enabled for the notification. By default, it will be true
     *             {Number} badgeNumber: (iOS only it seems) The number that will appear in the badge of the application icon in the home screen. By default, it will be 0
     *             {Object} userData: The JSON data to attached to the notification. By default, it will be empty
     *             {String} contentBody: (haven't yet seen this appear) The body content to be showed in the expanded notification information. By default, it will be empty
     *             {String} contentTitle: (haven't yet seen this appear) The title to be showed in the expanded notification information. By default, it will be empty
     *             {Number} date: Time in millisecs from 1970 when the notification will be fired. By default, it will be 1 second (1000)
     *             {String} icon: (Optional) (Android only) Name of the custom icon that you have bundled in the application as a resource (You will need a custom Cordova plugin to bundle resources in the app). In Android is the icon name without extension
     */
    var sendNotification = function (notification, callback) {
        if (!notification) {
            Utils.log("ERROR: No notification to send");
            return;
        }

        // cancel any outstanding notifications just in case
        // localService.cancelAllNotifications();

        console.log('Preparing to send notification');
        var id = localService.send(notification, function (identifier) {
            // this callback can be synchronous for some reason, which results in the id being undefined
            window.setTimeout(function () {
                if (callback) {
                    // identifier is undefined in Cocoon, so id will be passed
                    callback(identifier || id);
                }
            }, 1);
        });

        return id;
    };

    var module = {
        /**
         * @snippet Notifications.init()|snippet
Notifications.init(function () {
    // onComplete
})
         */
        init: init,
        /**
         * @snippet Notifications.send()|ID
Notifications.send({
    title: '$1',
    text: '$2',
    deltaTime: ${3:24 * 60 * 60 * 1000}
}, function (id) {
    // save id so it can be cancelled later
    Bento.saveState.save('notificationId$4', id);
});
         */
        send: function (data, callback) {
            var deltaTime = data.deltaTime || 24 * 60 * 60 * 1000;
            var title = data.title;
            var text = data.text;
            var notification = {
                title: title || "", // ios title text
                message: data.message || Utils.isNativeIos() ? text : title, // ios body text, but android title text
                soundEnabled: Utils.getDefault(data.message, true),
                badgeNumber: Utils.getDefault(data.badgeNumber, 1),
                userData: data.userData || {},
                contentBody: data.contentBody || Utils.isNativeIos() ? "" : text, // android body text
                contentTitle: data.contentTitle || "",
                date: Date.now() + deltaTime, // notify again in X hours
                icon: data.icon || 'notification_icon'
            };

            if (!initialized) {
                Utils.log('Local Notifications are not initialized');
                return;
            }
            var id = sendNotification(notification, callback);
            return id;
        },
        /**
         * @snippet Notifications.cancel()|snippet
        Notifications.cancel(${1:id})
         */
        cancel: function (identifier) {
            if (initialized) {
                localService.cancel(identifier);
            }
        },
        /* @snippet Notifications.cancelAll|snippet */
        cancelAll: function () {
            localService.cancelAllNotifications();
        },
        /* @snippet Notifications.resetBadgeNumber|ReturnType */
        resetBadgeNumber: function () {
            if (!initialized) {
                console.log('Local Notifications are not initialized');
                return;
            }
            // reset notification number on app icon
            if (Utils.isNativeIos()) {
                localService.setBadgeNumber(0);
            }
        }
    };

    if (!window.Cocoon) {
        module.init = nothing;
        module.send = nothing;
        module.resetBadgeNumber = nothing;
    }

    return module;
});