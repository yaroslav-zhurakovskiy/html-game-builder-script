/**
 * Wrapper for Tenjin cordova plugin
 * @moduleName Tenjin
 */
bento.define('modules/tenjin', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween
) {
    'use strict';
    var exec;
    var nothing = function () {};
    var module = {
        active: true,
        transaction: nothing,
        androidTransaction: nothing,
        iosTransaction: nothing,
        sendEvent: nothing,
        sendEventAndValue: nothing,
        disable: nothing,
        enable: nothing,


        // v2!
        init: function (settings) {
            var onComplete = settings.onComplete || function () {};
            onComplete('Tenjin plugin not available');
        }
    };

    if (window.tenjin) {
        exec = window.cordova.require('cordova/exec');

        // wrap all ES6 functions
        module.iosTransaction = function (productId, currency, quantity, priceString, transactionId, base64Receipt, success, failure) {
            if (!module.active) {
                return;
            }
            exec(
                function () {
                    console.log('Tenjin iOS transaction success');
                    if (success) {
                        success();
                    }
                },
                function () {
                    console.log('Tenjin iOS transaction failed');
                    if (failure) {
                        failure();
                    }
                },
                'Tenjin',
                'iosTransaction', [
                    productId,
                    currency,
                    quantity,
                    priceString,
                    transactionId,
                    base64Receipt
                ]
            );
        };
        module.androidTransaction = function (productId, currency, quantity, unitPrice, purchaseDataString, dataSignature, success, failure) {
            if (!module.active) {
                return;
            }
            exec(
                function () {
                    console.log('Tenjin android transaction success');
                    if (success) {
                        success();
                    }
                },
                function () {
                    console.log('Tenjin android transaction failed');
                    if (failure) {
                        failure();
                    }
                },
                'Tenjin',
                'androidTransaction', [
                    productId,
                    currency,
                    quantity,
                    unitPrice,
                    purchaseDataString,
                    dataSignature
                ]
            );
        };

        module.sendEvent = function (name) {
            if (!module.active) {
                return;
            }
            exec(function () {
                // success
                console.log("Tenjin Sent: " + name);
            }, function () {
                // error
            }, 'Tenjin', 'sendEvent', ['' + name]);
        };
        module.sendEventAndValue = function (eventName, integerValue) {
            if (!module.active) {
                return;
            }
            if (eventName === 'undefined') {
                console.log('WARNING: "eventName" is required');
                eventName = 'undefined';
            }

            if (typeof integerValue !== 'number') {
                console.log('WARNING: expecting "integerValue" to be an integer');
                integerValue = parseInt(integerValue);
            }
            exec(function () {
                console.log("Tenjin Sent: " + eventName + " :: " + integerValue);
            }, function () {}, 'Tenjin', 'sendEventAndValue', ['' + eventName, integerValue]);
        };

        module.enable = function () {
            module.active = true;
        };
        module.disable = function () {
            module.active = false;
        };

        /**
         * V2!
         */
        /**
         * @snippet Tenjin.init()|snippet
Tenjin.init({
    apiKey: '',
    optIn: true, // will we ever opt out?
    onComplete: function () {}
});
         */
        module.init = function (settings) {
            // while the tenjin plugin expects you to use Promises, we might as well just do the
            // callback chain and be compatible with cocoon
            var apiKey = settings.apiKey;
            var optIn = Utils.getDefault(settings.optIn, true);
            var onComplete = settings.onComplete || function () {};
            var lastOperation = 'init';

            var onFail = function () {
                onComplete("Tenjin initialization failed at " + lastOperation);
            };
            var onInitSuccess = function () {
                // after init: opt in or out
                if (optIn) {
                    lastOperation = 'optIn';
                    exec(onOptSuccess, onFail, 'Tenjin', 'optIn', []);
                } else {
                    lastOperation = 'optOut';
                    exec(onOptSuccess, onFail, 'Tenjin', 'optOut', []);
                }
            };
            var onOptSuccess = function () {
                // after opt in/out: connect
                lastOperation = 'connect';
                exec(function () {
                    onComplete();
                }, onFail, 'Tenjin', 'connect', []);
            };

            exec(onInitSuccess, onFail, 'Tenjin', 'init', [apiKey]);
        };
    } else {
        Utils.log("WARNING: Tenjin plugin does not exist.");
    }

    return module;
});