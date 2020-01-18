'use strict';

/**
 * Send data to AWS server to track purchases
 * @moduleName TenjinServerPurchase
 */
bento.define('modules/tenjinserverpurchase', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/eventsystem',
    'bento/gui/clickbutton',
    'bento/gui/counter',
    'bento/gui/text',
    'bento/utils',
    'bento/tween',
    'modules/store',
    'modules/serverlog'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    EventSystem,
    ClickButton,
    Counter,
    Text,
    Utils,
    Tween,
    Store,
    ServerLog
) {
    'use strict';

    var subscriptionIds = [];
    var eventName;
    var TenjinServerPurchase = {
        /**
         * @snippet TenjinServerPurchase.init()|snippet
        TenjinServerPurchase.init({
            eventName: 'IapValidation', // event after purchase validation, eventdata should contain the receipt data
            productIds: [''], // the product ids that are seen as subscriptions
        })
         */
        init: function (settings) {
            eventName = settings.eventName;
            EventSystem.on(eventName, onPurchase);

            subscriptionIds = settings.productIds || subscriptionIds;
        },
        send: function (body, onComplete) {
            var xhr = new window.XMLHttpRequest();
            xhr.open("POST", 'https://ml371twv56.execute-api.us-east-1.amazonaws.com/latest/tenjin');
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (onComplete) {
                            onComplete(null);
                        }
                    } else {
                        if (onComplete) {
                            onComplete('ERROR: bad server response. ' + xhr.responseText);
                        }
                    }
                }
            };
            xhr.send(JSON.stringify(body));
        },
        getIdfa: function (onComplete) {
            // already have it
            var advertisingId = Bento.saveState.load('idfa', null);
            if (advertisingId) {
                onComplete(advertisingId);
                return;
            }

            // first try with our own plugin (should be there for iOS and Android?)
            if (window.SystemData) {
                if (window.SystemData.advertising_id) {
                    window.SystemData.advertising_id(function (idfa) {
                        // save this if not done yet
                        if (idfa) {
                            Bento.saveState.save('idfa', idfa);
                            onComplete(idfa);
                        } else {
                            // limit ad tracking?
                            onComplete(null);
                        }
                    }, function () {
                        // limit ad tracking?
                        onComplete(null);
                    });
                }
            }
            // try getting it with another plugin (iOS only)
            else if (window.plugins && window.plugins.AppleAdvertising) {
                window.plugins.AppleAdvertising.getIdentifiers(function (identifiers) {
                    if (identifiers.trackingEnabled) {
                        var idfa = identifiers.idfa;
                        // save this if not done yet
                        Bento.saveState.save('idfa', idfa);
                        onComplete(idfa);
                    } else {
                        onComplete(null);
                    }
                }, function () {
                    console.log("error loading identifiers");
                    onComplete(null);
                });
            } else {
                // no possibilty of getting idfa
                onComplete(null);
            }
        }
    };
    // get system data for Tenjin, requires cordova-plugin-systemdata plugin
    var getSystemData = function (body, properties, onComplete) {
        var done = 0;
        if (window.SystemData) {
            Utils.forEach(properties, function (propertyName, i, l, breakLoop) {
                var onGetProperty = function (value) {
                    if (value !== void 0) {
                        body[propertyName] = value;
                    }
                    done += 1;
                    if (done >= l && onComplete) {
                        onComplete();
                        onComplete = null;
                    }
                };
                if (window.SystemData[propertyName]) {
                    window.SystemData[propertyName](onGetProperty, onGetProperty);
                }
            });
        } else {
            Utils.log("Missing SystemData plugin.");
            onComplete();
        }
    };
    var onPurchase = function (data) {
        var body = {};
        var receiptData = data.receiptData || {}; // android
        var serverResponse = data.serverResponse || {};
        var purchaseData = serverResponse.purchaseData || {};
        var receipt = purchaseData.receipt || {};
        var product = getProduct(data.productId);
        var platform = window.device.platform.toLowerCase();
        var purchaseToken = purchaseData.purchaseToken || null;
        // is the product id a subscription?
        if (subscriptionIds.indexOf(data.productId) < 0) {
            return;
        }
        console.log('Validation of subscription detected');

        if (Bento.saveState.load('sentSubscriptionToServer', false) === true) {
            // already did this in the past
            if (platform === 'ios') {
                return;
            } else {
                // on Android, the purchaseToken may change
                if (Bento.saveState.load('subscriptionPurchaseToken', null) === purchaseToken) {
                    return;
                }
            }
        }

        // should be validated
        if (data.validated && data.serverResponse && window.device) {
            // get idfa first
            TenjinServerPurchase.getIdfa(function (idfa) {
                var limit_ad_tracking = '0';
                if (!idfa) {
                    limit_ad_tracking = '1';
                }

                body.limit_ad_tracking = limit_ad_tracking;
                if (platform === 'ios') {
                    body.developer_device_id = window.device.uuid;
                }
                body.advertising_id = idfa;
                body.platform = platform;
                if (platform === 'ios') {
                    console.log('platform is iOS');
                    body.bundle_id = receipt.bid;
                    body.product_id = receipt.product_id;
                    body.transaction_id = receipt.transaction_id;
                    body.original_transaction_id = receipt.original_transaction_id;
                } else {
                    // ANDROID
                    console.log('platform is Android');
                    body.bundle_id = purchaseData.packageName;
                    body.product_id = purchaseData.productId;
                    body.original_transaction_id = purchaseData.purchaseToken;
                    // on Android we can only get the receipt in the app, the server will send no such information(?)
                    body.receipt = receiptData.signedData;
                    body.signature = receiptData.signature;
                }
                body.price = product.price;
                body.currency = product.currency;
                body.quantity = 1; // just assume 1

                // the rest needs the systemdata plugin again
                getSystemData(body, ['os_version', 'app_version', 'country', 'os_version_release', 'build_id', 'locale', 'device_model'], function () {
                    // ready to send
                    // console.log('sending body');
                    // console.log(JSON.stringify(body));
                    // ServerLog.log(JSON.stringify(body));

                    TenjinServerPurchase.send(body, function (error) {
                        if (error) {
                            Utils.log('Error sending subs event: ' + error);
                            return;
                        }
                        console.log('Sent subscription event');

                        // remember the original_transaction_id, which is the primary key
                        Bento.saveState.save('originalTransactionId', body.original_transaction_id);

                        // do this only once ever?
                        // Bento.saveState.save('sentSubscriptionToServer', true);
                        // if (platform === 'android') {
                        //     Bento.saveState.save('subscriptionPurchaseToken', purchaseToken);
                        // }
                    });
                });
            });
        } else {
            console.log('Validation failed');
        }
    };
    // get product data for price and currency
    var getProduct = function (id) {
        var i = 0;
        var product;
        var productsCache = Store.getCachedProducts();
        for (i = 0; i < productsCache.length; ++i) {
            product = productsCache[i];
            if (!product) {
                continue;
            }
            if (product.productId === id) {
                return product;
            }
        }
        return product;
    };

    return TenjinServerPurchase;
});