/**
 * Initialization of system and cordova modules
 */
bento.define('init', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/tween',
    'bento/eventsystem',
    'utils',
    'modules/localization',
    'modules/ironsource',
    'modules/gameanalytics',
    'modules/skinmanager',
    'modules/timemanager',
    'modules/errorhandler',
    'modules/savemanager',
    'modules/notifications',
    'modules/abtest',
    'modules/cloudsave',
    'modules/vipmanager',
    'bento/gui/text',
], function (
    Bento,
    Vector2,
    Rectangle,
    Tween,
    EventSystem,
    Utils,
    Localization,
    IronSource,
    GameAnalytics,
    SkinManager,
    TimeManager,
    ErrorHandler,
    SaveManager,
    Notifications,
    ABTest,
    CloudSave,
    VipManager,
    Text
) {
    'use strict';
    return function () {
        /**
         * Clears screen with black every tick (android only)
         */
        var clearScreen = function () {
            var canvasDimension = Bento.getViewport();
            var clear = function (data) {
                data.renderer.begin();
                data.renderer.fillRect([0, 0, 0, 1], 0, 0, canvasDimension.width, canvasDimension.height);
                data.renderer.flush();
            };
            if (Utils.isNativeAndroid()) {
                EventSystem.on('preDraw', clear);
            }
        };

        var initNotifications = function () {
            var getNotification = function (prms) {
                prms = prms || {};
                var time = prms.time || 24 * 60 * 60 * 1000;
                var notificationLocalization = prms.Localization;
                if (!notificationLocalization) {
                    Utils.log('ERROR: pass Localization as parameter');
                    return {};
                }

                return {
                    title: notificationLocalization.getText('title'),
                    text: notificationLocalization.getText('notificationInactive1'),
                    deltaTime: time
                };
            };
            var scheduleNotificationInactive = function () {
                // reset badge
                Notifications.resetBadgeNumber();

                // cancel old notification if needed
                var old1Day = SaveManager.load('notification1Day');
                var old2Day = SaveManager.load('notification2Day');
                var old1Week = SaveManager.load('notification1Week');
                var old2Week = SaveManager.load('notification2Week');
                if (old1Day) {
                    Notifications.cancel(old1Day);
                }
                if (old2Day) {
                    Notifications.cancel(old2Day);
                }
                if (old1Week) {
                    Notifications.cancel(old1Week);
                }
                if (old2Week) {
                    Notifications.cancel(old2Week);
                }

                // schedule notifications
                var notification = getNotification({
                    Localization: Localization,
                    time: 1 * 24 * 60 * 60 * 1000
                });
                Notifications.send(notification, function (id) {
                    // save id so it can be cancelled if needed
                    SaveManager.save('notification1Day', id);
                });

                notification = getNotification({
                    Localization: Localization,
                    time: 2 * 24 * 60 * 60 * 1000
                });
                Notifications.send(notification, function (id) {
                    // save id so it can be cancelled if needed
                    SaveManager.save('notification2Day', id);
                });

                notification = getNotification({
                    Localization: Localization,
                    time: 7 * 24 * 60 * 60 * 1000
                });
                Notifications.send(notification, function (id) {
                    // save id so it can be cancelled if needed
                    SaveManager.save('notification1Week', id);
                });

                notification = getNotification({
                    Localization: Localization,
                    time: 14 * 24 * 60 * 60 * 1000
                });
                Notifications.send(notification, function (id) {
                    // save id so it can be cancelled if needed
                    SaveManager.save('notification2Week', id);
                });
            };
            // if user has allowed notifications, initialize notification system
            if (SaveManager.load('notificationsAllowed')) {
                Notifications.init();

                // Note: the badge number appears to be glitchy, so let's just reset it upon opening
                Notifications.resetBadgeNumber();

                // schedule for inactive users
                scheduleNotificationInactive();

                // reschedule on resume
                EventSystem.on('documentResume', scheduleNotificationInactive);
            } else {
                // wait until user allows notifications to schedule inactive
                EventSystem.on('allowedNotifications', function () {
                    // cancel all notifications first to remove any old notifications that could be lingering after user cleared their cache
                    Notifications.cancelAll();
                    scheduleNotificationInactive();

                    // reschedule on resume
                    EventSystem.on('documentResume', scheduleNotificationInactive);

                    // done
                    EventSystem.clear('allowedNotifications');
                });
            }
        };
        /**
         * Catch unhandled errors and send them to Google Analytics
         */
        var initErrorHandler = function () {
            ErrorHandler.init({
                saveErrors: Utils.isDev() || SaveManager.load('isDev'), // save into savestate with key 'errorHistory'
                GaId: 'UA-59807613-23', // optional: Google Analytics ID to send error to
                GaPrefix: 'NomPlant' // enter a prefix for Google Analytics category name (recommended to use game name)
            });
        };
        /**
         * Initialize GameAnalytics
         */
        var initGameAnalytics = function () {
            if (SaveManager.load('isDev')) {
                console.log("Did not initialize GameAnalytics because user is dev");
                return;
            }
            GameAnalytics.configureBuild(window.VERSION);

            GameAnalytics.configureAvailableCustomDimensions01([
                'NoDrop',
                'KeepDrop'
            ]);
            GameAnalytics.configureAvailableResourceCurrencies(['coins', 'gems']);
            GameAnalytics.configureAvailableResourceItemTypes([
                'ads',
                'coinpack',
                'noads',
                'vip',
                'pots',
                'heads',
                'ingame'
            ]);

            if (Utils.isNativeIos()) {
                GameAnalytics.initialize({
                    gameKey: '5ca0e7245e0a0982e3ee27ab9e282e37',
                    secretKey: 'b12382a074064e37f61c1355957c4601b5c26ddc'
                }, function () {
                    console.log("GameAnalytics.initializeSuccessful");
                });
            } else if (Utils.isNativeAndroid()) {
                GameAnalytics.initialize({
                    gameKey: '265e2acf84526de5ebc83396d156f7ba',
                    secretKey: 'd1377df39ec363f64352676abc168f2640396f5a'
                }, function () {
                    console.log("GameAnalytics.initializeSuccessful");
                });
            }
        };
        /**
         * Setup AB test and other analytics
         */
        var initABTest = function () {
            // ABTest.init(); // AB-TEST
            // AB Test concluded to always skip tutorials
            SaveManager.save('doneUnlockTutorial', true);
            SaveManager.save('doneGrowTutorial', true);

        };

        /**
         * Time
         */
        var initTime = function () {
            TimeManager.initialize();
        };

        /**
         * Turn off antialiasing for pixel art
         */
        var antiAliasing = function () {
            if (Utils.isCocoonJS() && window.Cocoon) {
                window.Cocoon.Utils.setAntialias(false);
            }
        };
        /**
         * Init localization
         */
        var initLocalization = function () {
            // find system language (language is set in preloader screen)
            Localization.init();

            // clean unused language assets (note: this means you cannot change language after startup)
            if (!Bento.isDev()) {
                Localization.cleanUnusedAssets();
            }
        };

        initErrorHandler();
        clearScreen();
        initTime();
        initGameAnalytics();
        antiAliasing();
        initLocalization();
        initNotifications();
        initABTest();
        Text.disposeCanvas = true;

        //migrate old keys
        if (SaveManager.load('chestProgress') > SaveManager.load('superProgress')) {
            SaveManager.save('superProgress', SaveManager.load('chestProgress'));
        }

        if (SaveManager.load('chestsOpened') > SaveManager.load('supersOpened')) {
            SaveManager.save('supersOpened', SaveManager.load('chestsOpened'));
        }

        /**
         * Start preloader
         */
        Bento.assets.load('preloader', function (err) {
            Bento.screens.show('screens/preloader');
        });
    };
});