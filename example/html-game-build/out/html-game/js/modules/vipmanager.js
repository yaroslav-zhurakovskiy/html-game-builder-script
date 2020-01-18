/**
 * Manager that checks if player has a subscription for VIP
 * @moduleName VipManager
 */
bento.define('modules/vipmanager', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'modules/store',
    'bento/components/sprite',
    'modules/timemanager'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween,
    Store,
    Sprite,
    TimeManager
) {
    'use strict';
    var productId;
    var isDebugging = true;
    // timespan to check for VIP (6 hours?)
    var timeSpan = 1000 * 60 * 60 * 6;
    var didWarnOnce = false;
    var vipManager = {
        name: 'vipManager',

        init: function (settings) {
            productId = settings.productId;
        },

        /**
         * Call checkVIP at appropriate time (Restore process can create a popup)
         * This function will limit itself to once a day automatically
         * @snippet VipManager.checkVip()|snippet
            VipManager.checkVip()
         */
        checkVip: function (callback) {
            var today = Math.floor(TimeManager.getCurrentTime() / timeSpan);
            var lastValidationDay = Bento.saveState.load('VipLastValidated', 0);
            var failedAttempts = Bento.saveState.load('VipFailedValidations', 0);
            // the way to check one's subscription is by restoring purchases and waiting for validation
            // do not call this user never purchased before (event will never fire)
            var onValidation = function (data) {
                var validated;
                if (data.productId === productId) {
                    // update VIP status
                    validated = data.validated;

                    // if the vip status changed
                    if (Bento.saveState.load('VIP', false) !== validated) {
                        //downgrade
                        if (!validated) {
                            Bento.saveState.save('VipDowngraded', true);
                        }

                        // save new state
                        Bento.saveState.save('VIP', validated);

                        //fire event
                        EventSystem.fire('onVipChanged', validated);
                    }

                    // callback
                    callback(validated);
                    log('vipmanager: VIP validation complete: ' + validated);
                }
                Bento.saveState.save('VipLastValidated', today);
                cleanEvents();
            };
            var onRestoreError = function (err) {
                // restore failed somehow, could be bad internet, could be user not logged in etc.
                // we will silently fail, try again some other time
                log('vipmanager: restore error ' + err);
                failedAttempts += 1;
                Bento.saveState.save('VipFailedValidations', failedAttempts);
                cleanEvents();

                if (!didWarnOnce) {
                    didWarnOnce = true;
                    EventSystem.fire('notification', {
                        textId: 'vipValidationWarning',
                        icon: null,
                    });
                }
            };
            var cleanEvents = function () {
                EventSystem.off('IapValidation', onValidation);
                EventSystem.off('restore_error', onRestoreError);
            };
            log('vipmanager: starting validation');

            callback = callback || function () {};

            if (today === lastValidationDay && !isDebugging) {
                // already validated today
                log('vipmanager: validated for today');
                callback(Bento.saveState.load('VIP', false));
                return false;
            }
            if (!Bento.saveState.load('purchased-' + productId, false) && !(Bento.isDev() || Bento.saveState.load('isDev', false))) {
                // never purchased this before, there will be no iap validation coming through, the process would block
                callback(false);
                log('vipmanager: never purchased vip before');
                return false;
            }
            // if (!Bento.saveState.load('VIP', false) && !isDebugging) {
            //     // no point in checking if user is not VIP
            //     // if they were in the past, they will need to re-purchase it
            //     callback(false);
            //     log('vipmanager: vip not active');
            //     return false;
            // }
            if (!Store.isLoaded() && !Bento.isDev()) {
                // cannot restore if store is not read
                log('vipmanager: store not ready');
                return false;
            }

            log('vipmanager: waiting for validation');
            EventSystem.on('IapValidation', onValidation);
            EventSystem.on('restore_error', onRestoreError);
            if (!Store.restore()) {
                onRestoreError('Store not ready');
                callback(false);
            } else if (Utils.isNativeAndroid()) {
                // a 30s timeout counts as a failure
                window.setTimeout(function () {
                    onValidation({
                        productId: productId,
                        validated: false
                    });
                }, 30000);
            }

            // todo: add timeout?
            return true; // true merely indicates that the check will be done
        },
        /**
         * Returns timespan for validation
         * @snippet VipManager.isVip()|Boolean
            VipManager.isVip()
         */
        isVip: function () {
            var today = Math.floor(TimeManager.getCurrentTime() / timeSpan);
            var lastValidation = Bento.saveState.load('VipLastValidated', 0);
            var failedAttempts = Bento.saveState.load('VipFailedValidations', 0);
            // has been longer than 2 days since last validation: decline immediately
            // also count failed attempts? maybe player just didnt play for a few days
            if (today - lastValidation > 2 && failedAttempts > 3) {
                if (Bento.saveState.load('VIP', false)) {
                    // downgraded
                    Bento.saveState.save('VipDowngraded', true);
                    // force VIP off
                    Bento.saveState.save('VIP', false);
                    // fire event
                    EventSystem.fire('onVipChanged', false);
                }
            }
            // use the known value
            return Bento.saveState.load('VIP', false);
        },
        /**
         * Returns timespan for validation
         * @snippet VipManager.getTimeSpan()|Number
            VipManager.getTimeSpan()
         */
        getTimeSpan: function () {
            return timeSpan;
        }
    };
    var log = function () {
        if (Bento.isDev() || Bento.saveState.load('isDev', false)) {
            console.log.apply(this, arguments);
        }
    };
    return vipManager;
});