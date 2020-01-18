/**
 * Overlay that waits for IAP callback
 * Contains general code flow for making a purchase
 * Advised to include this module asap, as it contains global event listeners also used for restoring purchases.
 *
 * Note: this module does NOT handle unresolved purchases of promoted IAP
 * To handle that manually, look in the unresolvedPurchases array and resolve the purchase on an appropiate time.
 * Remove from the array with Store.resolvePurchase(purchaseInfo).
 *
 * @moduleName IapOverlay
 */
bento.define('ui/iapoverlay', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/gui/clickbutton',
    'bento/gui/counter',
    'bento/gui/text',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'modules/store',
    'modules/localization',
    'bento/components/fill',
    'modules/tenjin'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    ClickButton,
    Counter,
    Text,
    EventSystem,
    Utils,
    Tween,
    Store,
    Localization,
    Fill,
    Tenjin
) {
    'use strict';
    var IapOverlay = function (settings) {
        var viewport = Bento.getViewport();
        // timeout
        var timeoutTime = settings.timeoutTime || 600; // frames until timeout, defaults to 600 (10 seconds)
        var onTimeout = settings.onTimeout; // what should happen if the IAP timed out
        // dark overlay
        var overlay = new Entity({
            name: 'overlay',
            components: [new Fill({
                color: [0, 0, 0, 0.75]
            })]
        });
        var fontSettings = Utils.extend({
            position: new Vector2(viewport.width / 2, viewport.height / 2),
            fontSettings: Utils.getTextStyle('iapOverlay'),
            text: Localization.getText('processing'),
            fontSize: 8,
            fontColor: '#ffffff',
            align: 'center',
            maxWidth: viewport.width - 16,
            textBaseline: 'middle'
        }, settings.fontSettings);
        var text = new Text(fontSettings);
        // pauselevel is 1 higher than current pauselevel
        var pauseLevel = 0;
        var pauseBehavior = {
            oldPauseLevel: 0,
            start: function () {
                this.oldPauseLevel = Bento.objects.isPaused();
                pauseLevel = this.oldPauseLevel + 1;
                entity.updateWhenPaused = pauseLevel;
                Bento.objects.pause(pauseLevel);
            },
            destroy: function () {
                Bento.objects.pause(this.oldPauseLevel);
            }
        };
        var timeoutBehavior = {
            hasTimedOut: false,
            update: function () {
                if (this.hasTimedOut === false && entity.timer > timeoutTime) {
                    this.hasTimedOut = true;
                    if (onTimeout) {
                        onTimeout();
                    }
                }
            }
        };
        var entity = new Entity({
            z: settings.z,
            name: 'iapOverlay',
            float: true,
            components: [
                pauseBehavior,
                overlay,
                text,
                timeoutBehavior
            ]
        });

        // public
        entity.extend({
            /**
             * Close overlay (with a delay)
             */
            exit: function (delay, callback) {
                Utils.timeout(delay || 0, function () {
                    Bento.objects.remove(entity);
                    if (callback) {
                        callback();
                    }
                }, pauseLevel);
            },
            /**
             * Set overlay text
             */
            setText: function (str) {
                text.setText(str);
            }
        });

        return entity;
    };
    /*
     * Global purchase events (game specific)
     */
    EventSystem.on('purchase_success', function (purchaseInfo) {
        IapOverlay.onNonConsumable(purchaseInfo);
    });
    /*
     * global event listener for non-consumables
     * overwrite this function if needed, or pass a function during init
     */
    IapOverlay.onNonConsumable = function (purchaseInfo) {
        var productId = purchaseInfo.productId;
        // save flag into savestate
        Bento.saveState.save('purchased-' + productId, true);
    };

    var gameAnalyticsCartType = 'shop';
    var gameAnalyticsItemTypes = {};


    // Tenjin / GameAnalytics purchase events

    EventSystem.on('purchase_success', function (purchaseInfo) {

        var productId = purchaseInfo.productId;
        var transactionId = purchaseInfo.transactionId;

        // extended properties
        var product = purchaseInfo.product;
        var lastReceipt = purchaseInfo.lastReceipt; // for purchase validation

        if (!lastReceipt || !product) {
            // don't send analytics event
            return;
        }

        // GameAnalytics wants amount in cents (even for currencies that aren't usually divided)
        var priceCents = Math.round(product.price * 100);
        var cartType = gameAnalyticsCartType;
        var itemType = gameAnalyticsItemTypes[productId.replace('XXX', window.IAPPREFIX)] || 'iap';

        if (shouldTrackPurchase(lastReceipt)) {
            if (Utils.isNativeIos()) {
                EventSystem.fire('GameAnalytics-addBusinessEvent', {
                    currency: product.currency,
                    amount: priceCents,
                    cartType: cartType,
                    itemType: itemType,
                    itemId: productId,
                    receipt: lastReceipt // app store receipt (base64)
                });
                Tenjin.iosTransaction(
                    productId, // sku
                    product.currency || '', // currencycode
                    1, // quantity
                    product.price.toString(), // price
                    transactionId, // transaction id
                    lastReceipt // receipt in base64
                );
            } else if (Utils.isNativeAndroid()) {
                EventSystem.fire('GameAnalytics-addBusinessEvent', {
                    currency: product.currency,
                    amount: priceCents,
                    cartType: cartType,
                    itemType: itemType,
                    itemId: productId,
                    receipt: lastReceipt.purchaseData, // android purchase data (json)
                    signature: lastReceipt.dataSignature, // purchase data signature (base64)
                });
                Tenjin.androidTransaction(
                    productId, // sku
                    product.currency || '', // currencycode
                    1, // quantity
                    product.price.toString(), // price
                    lastReceipt.purchaseData, // purchase data
                    lastReceipt.dataSignature // data signature
                );
            }
            Tenjin.sendEvent('validatedPayment');

            // to view the revenue, we must also send transaction data
            // GoogleAnalytics.addTransaction(
            //     transactionId,         // id
            //     '',                    // affiliation
            //     product.price,         // revenue
            //     product.price * 0.3,   // tax
            //     0,                     // shipping
            //     product.currency || '' // currencycode
            // );
            // GoogleAnalytics.addTransactionItem(
            //     transactionId,         // id
            //     product.title,         // title
            //     productId,             // sku
            //     'IAP',                 // category
            //     product.price,         // price
            //     1,                     // quantity
            //     product.currency || '' // currencycode
            // );

        } else {
            // don't send real business events in sandbox mode
            console.log('purchased', {
                currency: product.currency,
                amount: priceCents,
                cartType: cartType,
                itemType: itemType,
                itemId: productId,
            });
        }
    });

    // Should this purchase be tracked
    // -is the environment not sandbox?
    // -is the product not a subscription
    // -is this the first time this purchase is made? (non-consumables/subscriptions)
    var shouldTrackPurchase = function (receipt) {
        var receiptStr;
        var purchaseInfoStr;
        var isOriginal;
        var isSandbox;

        if (Utils.isNativeAndroid()) {
            // checking for subscriptions is quite trivial on Android actually
            return !Utils.isDefined(((receipt || {}).purchaseData || {}).autoRenewing);
        }

        try {
            if (window.decodeB64) {
                receiptStr = window.decodeB64(receipt);
            } else {
                // atob is not so reliable in cocoon
                receiptStr = window.atob(receipt);
            }

            // check if the receipt contains the string '"environment" = "Sandbox"'
            isSandbox = receiptStr.indexOf('"environment" = "Sandbox"') >= 0;

            if (isSandbox) {
                console.log('Sandbox environment detected.');
                return false;
            }

            // get the transaction data
            // we're not going to parse the entire receipt as json, instead try to extract relevant data with regex
            purchaseInfoStr = receiptStr.match(/\"purchase\-info\" \= \"(.*?)\"/gm);

            if (!purchaseInfoStr.length) {
                console.log('Purchase info not found.');
                return false;
            }
            // retrieve the string behind the =
            purchaseInfoStr = JSON.parse(purchaseInfoStr[0].split(" = ")[1]);
            if (window.decodeB64) {
                purchaseInfoStr = window.decodeB64(purchaseInfoStr);
            } else {
                // atob is not so reliable in cocoon
                purchaseInfoStr = window.atob(purchaseInfoStr);
            }

            // check subscription by the existance of a "expires-date"
            var expiresDate = purchaseInfoStr.match(/\"expires\-date\" \= \"(.*?)\"/gm);
            if (expiresDate && expiresDate.length) {
                console.log('Product is a subscription.');
                return false;
            }

            // find transaction ids
            var transactionRegex = purchaseInfoStr.match(/\"transaction\-id\" \= \"(.*?)\"/gm);
            var originalTransactionRegex = purchaseInfoStr.match(/\"original\-transaction\-id\" \= \"(.*?)\"/gm);

            if (transactionRegex && transactionRegex.length && originalTransactionRegex && originalTransactionRegex.length) {
                // retrieve the string behind the =
                transactionRegex = JSON.parse(transactionRegex[0].split(" = ")[1]);
                originalTransactionRegex = JSON.parse(originalTransactionRegex[0].split(" = ")[1]);

                // it's an original purchase if original-transaction-id is the same or nil
                isOriginal = originalTransactionRegex === 'nil' || originalTransactionRegex === transactionRegex;
                if (!isOriginal) {
                    console.log('Already purchased this product in the past');
                }
                return isOriginal;
            } else {
                return false;
            }

        } catch (e) {
            Utils.log('ERROR: malformed receipt ' + e);
            return false;
        }
    };


    /*
     * Purchase flow
     * @snippet IapOverlay.purchase()|snippet
IapOverlay.purchase({
    z: ${1:0},
    id: '${2:productId}',
    isConsumable: ${3:true},
    resolveAutomatically: ${4:true},
    fontSettings: ${5:null},
    onPurchaseComplete: function (success, id, purchaseInfo) {
        if (success && id === 'myProduct') {
            // etc.
        }
    }
});
     */
    IapOverlay.purchase = function (settings) {
        var overlayZ = settings.z;
        var id = settings.id; // product id
        var subscription = settings.subscription;
        var isConsumable = Utils.getDefault(settings.isConsumable, true);
        var resolveAutomatically = Utils.getDefault(settings.resolveAutomatically, true);
        var onPurchaseComplete = settings.onPurchaseComplete;
        var fontSettings = settings.fontSettings || {};
        var iapOverlay = new IapOverlay({
            z: overlayZ,
            fontSettings: fontSettings
        });
        var isRestoring = settings.restore || false;
        var purchase = function () {
            var success;

            // show overlay
            Bento.objects.attach(iapOverlay);
            iapOverlay.setText(Localization.getText('processing'));

            // wait for callback
            EventSystem.on('purchase_success', onPurchaseSuccess);
            EventSystem.on('purchase_error', onPurchaseError);

            // purchase!
            if (subscription) {
                success = Store.purchaseSubscription(id);
            } else {
                success = Store.purchase(id);
            }

            if (!success) {
                if (!(Utils.isNativeIos() || Utils.isNativeAndroid())) {
                    onPurchaseError('Only available in the App version!');
                } else {
                    onPurchaseError(Localization.getText('errorstore'));
                }
            }
        };
        var restore = function () {
            var success;

            // show overlay
            Bento.objects.attach(iapOverlay);
            iapOverlay.setText(Localization.getText('processing'));

            // wait for callback
            EventSystem.on('restore_success', onPurchaseSuccess);
            EventSystem.on('restore_error', onPurchaseError);
            EventSystem.on('purchase_error', onPurchaseError);

            success = Store.restore(id);

            if (!success) {
                if (!(Utils.isNativeIos() || Utils.isNativeAndroid())) {
                    onPurchaseError('Only available in the App version!');
                } else {
                    onPurchaseError(Localization.getText('errorstore'));
                }
            }
        };
        var onPurchaseSuccess = function (purchaseInfo) {
            var sendAnalytics = function () {
                var productId = purchaseInfo.productId;
                var iapAmount = Bento.saveState.load('iapAmount', 0);
                var productAmount = Bento.saveState.load('productAmount-' + productId, 0);

                iapAmount++;
                Bento.saveState.save('iapAmount', iapAmount);
                productAmount++;
                Bento.saveState.save('productAmount-' + productId, productAmount);

                // which IAP was bought
                EventSystem.fire('Analytics', {
                    category: 'IAP',
                    action: 'bought_' + productId
                });
                // amount of IAP's purchased along with the name of the IAP being purchased
                EventSystem.fire('Analytics', {
                    category: 'IAP',
                    action: 'iapAmount_' + iapAmount,
                    label: productId
                });
                EventSystem.fire('Analytics', {
                    category: 'UI',
                    action: 'bought_' + productId
                });

                // FireBase.setUserProperty('iapAmount', iapAmount);
                // FireBase.setUserProperty(productId, productAmount);
            };
            if (isRestoring) {
                iapOverlay.setText(Localization.getText('restored'));
            } else {
                iapOverlay.setText(Localization.getText('thanks'));
            }
            iapOverlay.exit(60, function () {
                if (!isRestoring && resolveAutomatically) {
                    Store.resolvePurchase(purchaseInfo);
                }
                if (!isRestoring && isConsumable) {
                    console.log('CONSUMING!!');
                    Store.consume(purchaseInfo, function () {
                        if (onPurchaseComplete) {
                            onPurchaseComplete(true, id, purchaseInfo);
                        }
                    });
                } else {
                    // just call purchaseComplete
                    if (onPurchaseComplete) {
                        onPurchaseComplete(true, id, purchaseInfo);
                    }
                }
            });
            // clean up event listeners
            cleanUp();

            // increment the amount of IAP's purchased
            if (!isRestoring) {
                sendAnalytics();
            }
        };
        var onPurchaseError = function (err) {
            console.log('purchase failed!', JSON.stringify(err));
            if (err) {
                EventSystem.fire('Analytics', {
                    category: 'UI',
                    action: 'purchaseError',
                    label: JSON.stringify(err)
                });
                iapOverlay.setText(Localization.getText('error') + '\n\n' + JSON.stringify(err));
            } else {
                // if there's no error message we silently fail
                // this can happen in case of subscription restorations
            }
            iapOverlay.exit(120, function () {
                if (onPurchaseComplete) {
                    onPurchaseComplete(false, id, null);
                }
            });
            cleanUp();
        };
        var cleanUp = function () {
            EventSystem.off('restore_success', onPurchaseSuccess);
            EventSystem.off('restore_error', onPurchaseError);
            EventSystem.off('purchase_success', onPurchaseSuccess);
            EventSystem.off('purchase_error', onPurchaseError);
        };

        if (isRestoring) {
            restore();
        } else {
            purchase();
        }
        return iapOverlay;
    };
    /*
     * Restore flow
     * Note that Cocoon doesn't actually have a restore flow: Restoring fires the purchase callbacks again
     * @snippet IapOverlay.restore|snippet
IapOverlay.restore({
    z: ${1:0},
    fontSettings: ${2:null}
});
     */
    IapOverlay.restore = function (settings) {
        settings.restore = true;
        return IapOverlay.purchase(settings);
    };

    /*
     * Get the localized price string
     * @snippet IapOverlay.getPrice()|String
IapOverlay.getPrice(${1:productId}, ${2:'\$0.99'})
     */
    IapOverlay.getPrice = function (productId, defaultPrice) {
        var i;
        var id = productId;
        var products = Store.getProducts();
        if (products) {
            // search
            for (i = 0; i < products.length; ++i) {
                if (products[i].productId === id) {
                    return products[i].localizedPrice;
                }
            }
        }
        // if products can't be loaded, try price from save state
        return Bento.saveState.load(id + 'Price', defaultPrice);
    };
    /**
     * Init IAP
     * @snippet IapOverlay.init()|snippet
IapOverlay.init({
    productIds: [$1], // array of productId strings

    // the following properties are required for IAP validation
    bundleId: '$2', // bundle id
    appleKey: '$3', // Apple secret key encrypted in AES
    googleKey: '$4', // Google secret key encrypted in AES

    // global listener, recommended to add non-consumables here
    onPurchase: function (purchaseInfo) {
        // note that a restore process will pass here again
        if (purchaseInfo.productId === 'myNonConsumable') {
            Bento.saveState.save('purchased-myNonConsumable', true);
        }
    }
});
     */
    IapOverlay.init = function (settings) {
        Store.init(settings);
        gameAnalyticsCartType = settings.gameAnalyticsCartType || 'shop';
        gameAnalyticsItemTypes = settings.gameAnalyticsItemTypes || {};
        IapOverlay.onNonConsumable = settings.onPurchase || IapOverlay.onNonConsumable;
    };

    return IapOverlay;
});