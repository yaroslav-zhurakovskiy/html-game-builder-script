/**
 * Main IAP purchase module. Use with atomic-plugins-inapps cordova plugin.
 * Or https://github.com/LuckyKat/atomic-plugins-inapps for Subscription support!
 * 
 * I actually recommend using the IapOverlay module to initialize and make purchases instead of this module. 
 * IapOverlay will perform the flow of events for you and shows an overlay with the result. Otherwise continue reading.
 * 
 * == Initializing the module ==
 * Call Store.init() with all the available product ids.
 * 
 * Notes about product ids: 
 * When writing down product ids in the App Store or Google Play, you only get one chance. If you typo or give it the wrong
 * type (consumable vs non-consumable) there is no way to correct or delete the id. 
 * The product ids are also global throughout your account in the App Store. So no two apps can both use 'CoinPack1' as productId. 
 * Some people use the reverse domain names as convention, i.e. com.companyname.gamename.CoinPack1
 *
 * == Making an in app purchase ==
 * Call Store.purchase()
 *
 * Note: IapOverlay will not call Store.consume(productId) for you. Store.consume() is necessary for Android consumables.
 * 
 * Note 2: Every purchase is tracked in a SaveState array called unresolvedPurchases containing purchaseInfo objects. 
 * To resolve the purchase, call Store.resolve(purchaseInfo). The reason for this is the App Store promotions. If you have
 * no App Store promotions, you may choose to ignore this. App Store promotions are made during startup. So it is 
 * recommended to check this unresolvedPurchases array and resolve the purchase on an appropiate time.
 *
 *
 * == Restoring purchases ==
 * Note that the cocoon plugin doesn't actually have any real restore events. It will simply fire the purchase_success
 * events again. 
 * 
 * @moduleName Store
 */
bento.define('modules/store', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/eventsystem',
    'bento/entity',
    'bento/tween',
    'utils'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    EventSystem,
    Entity,
    Tween,
    Utils
) {
    'use strict';
    var bundleId = '';
    var keys = {
        // pass during init
        apple: '',
        google: ''
    };
    var trackValidationFailure = function (productId, type, receipt, responseText) {
        var data = {
            productId: productId,
            receipt: receipt
        };
        var text;
        try {
            text = JSON.stringify(receipt);
            if (responseText) {
                text += '\n\n' + responseText;
            }
            EventSystem.fire('Analytics', {
                category: 'IAP',
                action: 'validation_failure_' + type,
                label: text
            });
        } catch (e) {
            console.log('Unable to track failure.');
            EventSystem.fire('Analytics', {
                category: 'IAP',
                action: 'tracking_failure',
                label: responseText
            });
        }
        console.log('Validation failure');
    };
    var lastReceipt = '';
    var currentProduct = null;
    var products = [];
    var isLoaded = false;
    var productsCache = [];
    var getProduct = function (id) {
        var i = 0,
            product;
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
    var onInit = function (err) {
        if (err) {
            console.log('ERROR: initializing store plugin');
            Utils.log(err);
            return;
        }
        console.log('init store');

        if (Utils.isDev()) {
            // don't show in final version
            console.log('products to fetch:', JSON.stringify(products));
        }
        window.Cocoon.InApp.fetchProducts(products, onProductFetch);
    };
    var onProductFetch = function (productsArray, error) {
        if (error) {
            console.log('onProductsFetchFailed', JSON.stringify(error));
            window.setTimeout(function () {
                window.Cocoon.InApp.fetchProducts(products, onProductFetch);
            }, 30000);
            return;
        }
        for (var i = productsArray.length - 1; i >= 0; i--) {
            // Cocoon.InApp.addProduct(productsArray[i]);
            // console.log('Adding product to the local database: ' + JSON.stringify(productsArray[i]));
            productsCache.push(productsArray[i]);
        }

        if (Utils.isDev()) {
            // console.log('products fetched:', productsArray.length);
        }
        isLoaded = true;

        // save prices to save state so that we can still show prices
        // in case user plays the game without an internet connection
        savePrices();
    };
    var setupValidation = function () {
        window.Cocoon.InApp.setValidationHandler(function (receipt, productId, validationCompletion) {
            console.log('Custom validation started');
            var b64receipt;
            var receiptData;
            var service = '';
            if (Utils.isNativeIos()) {
                service = 'apple';
                if (window.encodeB64) {
                    // turns out atob and btoa in Cocoon is not reliable. lib/patcher.js may define a pure JS method
                    b64receipt = window.encodeB64(receipt);
                } else {
                    b64receipt = window.btoa(receipt);
                }
                // save receipt for tenjin
                lastReceipt = b64receipt;

            } else if (Utils.isNativeAndroid()) {
                service = 'google';
                b64receipt = receipt;

                // save receipt for tenjin
                // cocoon renames purchaseData to signedData
                try {
                    receiptData = JSON.parse(receipt);
                } catch (e) {
                    receiptData = {
                        signedData: '',
                        signature: ''
                    };
                }
                lastReceipt = {
                    purchaseData: receiptData.signedData,
                    dataSignature: receiptData.signature
                };
            } else {
                Utils.log('No validation available for this device');
            }
            var body = {
                receipt: b64receipt,
                key: keys[service]
            };

            var xhr = new window.XMLHttpRequest();
            xhr.open('POST', 'https://xbsl2jkdvg.execute-api.us-east-1.amazonaws.com/latest/' + service);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify(body));
            xhr.onreadystatechange = function () {
                // final client side checks: do the productId, bundleId and service match?
                var finalChecks = {
                    init: function (response) {
                        if (response.status === 'SUCCESS' && response.result.isValid) {
                            finalChecks[service](response.result);
                        } else {
                            validationCompletion(false);
                            EventSystem.fire('IapValidation', {
                                validated: false,
                                productId: productId,
                                b64receipt: b64receipt,
                                receiptData: receiptData
                            });
                            trackValidationFailure(productId, 'rejected', receipt);
                        }
                    },
                    apple: function (result) {
                        var srv = result.purchaseData.service;
                        var bid = result.purchaseData.receipt.bid;
                        var pid = result.purchaseData.receipt.product_id;
                        if (
                            service === srv &&
                            bundleId === bid &&
                            productId === pid
                        ) {
                            validationCompletion(true);
                            EventSystem.fire('IapValidation', {
                                validated: true,
                                productId: productId,
                                b64receipt: b64receipt,
                                receiptData: receiptData,
                                serverResponse: result 
                            });
                        } else {
                            validationCompletion(false);
                            EventSystem.fire('IapValidation', {
                                validated: false,
                                productId: productId,
                                b64receipt: b64receipt,
                                receiptData: receiptData,
                                serverResponse: result
                            });
                            trackValidationFailure(productId, 'rejectedByApple', receipt);
                            // Bento.saveState.save('fakeIAP', true);
                            // Bento.saveState.save('cheatSuspect', true);
                            // window.alert('Purchase validation failed. If you believe this is an error, please contact Lucky Kat.');
                        }
                    },
                    google: function (result) {
                        var srv = result.purchaseData.service;
                        var bid = result.purchaseData.packageName;
                        var pid = result.purchaseData.productId;

                        if (service === srv && bundleId === bid && productId === pid) {
                            validationCompletion(true);
                            EventSystem.fire('IapValidation', {
                                validated: true,
                                productId: productId,
                                b64receipt: b64receipt,
                                receiptData: receiptData,
                                serverResponse: result
                            });
                        } else {
                            validationCompletion(false);
                            EventSystem.fire('IapValidation', {
                                validated: false,
                                productId: productId,
                                b64receipt: b64receipt,
                                receiptData: receiptData,
                                serverResponse: result
                            });
                            trackValidationFailure(productId, 'rejectedByGoogle', receipt);
                            // Bento.saveState.save('fakeIAP', true);
                            // Bento.saveState.save('cheatSuspect', true);
                            // window.alert('Purchase validation failed. If you believe this is an error, please contact Lucky Kat.');
                        }
                    }
                };
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            console.log('iap success');
                            // console.log(xhr.responseText);
                            finalChecks.init(JSON.parse(xhr.responseText));
                        } catch (e) {
                            // NOTE: we allow validation to pass, because of unexpected responses
                            lastReceipt = null;
                            validationCompletion(true);
                            EventSystem.fire('IapValidation', {
                                validated: false,
                                productId: productId,
                                b64receipt: b64receipt,
                                receiptData: receiptData
                            });
                            trackValidationFailure(productId, 'parseError', receipt, xhr.responseText);
                        }
                    } else {
                        // NOTE: we used allow validation to pass, because of unexpected responses
                        trackValidationFailure(productId, 'unexpectedHttpResponse', receipt, xhr.responseText);
                        lastReceipt = null;
                        validationCompletion(false);
                            EventSystem.fire('IapValidation', {
                                validated: false,
                                productId: productId,
                                b64receipt: b64receipt,
                                receiptData: receiptData
                            });
                    }
                }
            };

            // Utils.timeout(60 * 5, function () {
            //     console.log('validationCompletion');
            // }, Infinity);
        });
    };
    /**
     * Save prices to save state so that we can still show prices in case user plays the game without an internet connection
     */
    var savePrices = function () {
        var productsArray = store.getProducts();
        var i = 0;
        if (productsArray && productsArray.length > 0) {
            for (i = 0; i < productsArray.length; ++i) {
                Bento.saveState.save(productsArray[i].productId + 'Price', productsArray[i].localizedPrice);
            }
        }
    };
    var store = {
        /**
         * Initialize IAP module
         * @snippet Store.init()|snippet
Store.init({
    productIds: [$1], // array of productId strings

    // the following properties are required for IAP validation
    bundleId: '$2', // bundle id
    appleKey: '$3', // Apple secret key encrypted in AES
    googleKey: '$4', // Google secret key encrypted in AES
});
         */
        init: function (settings) {
            var productIds = settings.productIds || [];

            bundleId = settings.bundleId || bundleId;
            keys.apple = settings.appleKey || keys.apple;
            keys.google = settings.googleKey || keys.google;
            if (!window.Cocoon || !window.Cocoon.InApp) {
                console.log('InApp plugin not available');
                return;
            }

            if (!window.Cocoon.InApp.canPurchase()) {
                console.log('Warning: in-app-purchases not available');
                return store;
            }
            if (bundleId) {
                if (Utils.isNativeIos() && keys.apple) {
                    setupValidation();
                } else if (Utils.isNativeAndroid() && keys.google) {
                    setupValidation();
                }
            }

            /**********************************
             * Product purchase
             *******************************/

            window.Cocoon.InApp.on('purchase', {
                start: function (productId) {
                    console.log('Product purchase started: ' + productId);
                },
                complete: function (purchaseInfo) {
                    var product = getProduct(purchaseInfo.productId);
                    var currency;
                    var purchasesCount = Bento.saveState.load('purchasesCount', 0);
                    var purchaseHistory = Bento.saveState.load('purchaseHistory', []);
                    var unresolvedPurchases = Bento.saveState.load('unresolvedPurchases', []);
                    var resolvedPurchases = Bento.saveState.load('resolvedPurchases', []);

                    purchasesCount += 1;
                    Bento.saveState.save('purchasesCount', purchasesCount);

                    console.log('Product purchase completed: ');
                    console.log(JSON.stringify(arguments));

                    // calling finish only needed if autoFinishPurchases: false
                    //Cocoon.InApp.finishPurchase(purchaseInfo.transactionId);

                    // already resolved this purchase in the past
                    var alreadyResolved = false;
                    Utils.forEach(resolvedPurchases, function (info, i, l, breakLoop) {
                        if (
                            info.productId === purchaseInfo.productId &&
                            info.transactionId === purchaseInfo.transactionId
                        ) {
                            alreadyResolved = true;
                            breakLoop();
                        }
                    });
                    if (alreadyResolved) {
                        EventSystem.fire('purchase_error', '');
                        EventSystem.fire('Analytics', {
                            category: 'IAP',
                            action: 'duplicateResolve'
                        });
                        return;
                    }

                    // extend purchaseInfo info
                    purchaseInfo.product = product;
                    purchaseInfo.lastReceipt = lastReceipt;

                    // save into array
                    unresolvedPurchases.push(purchaseInfo);
                    purchaseHistory.push(purchaseInfo);
                    Bento.saveState.save('purchaseHistory', purchaseHistory);
                    Bento.saveState.save('unresolvedPurchases', unresolvedPurchases);

                    // fire event
                    EventSystem.fire('purchase_success', purchaseInfo);
                },
                error: function (productId, err) {
                    console.log('Product purchase failed: ' + JSON.stringify(err));
                    if (!(Utils.isNativeIos() || Utils.isNativeAndroid())) {
                        EventSystem.fire('purchase_error', 'Only available in the app version!');
                        return;
                    }
                    EventSystem.fire('purchase_error', err.message);
                }
            });
            /**********************************
             * START
             *******************************/

            products = productIds;
            window.Cocoon.InApp.initialize({
                autofinish: true
            }, onInit);
        },
        /**
         * Returns false if purchase failed
         * @snippet Store.purchase()|snippet
            Store.purchase('${1:productId}');
         */
        purchase: function (productId) {
            if (!isLoaded) {
                return false;
            }
            window.Cocoon.InApp.purchase(productId, 1, function (error) {
                if (error) {
                    console.log(error);
                    return;
                }
            });
            return true;
        },
        /**
         * Returns false if purchase failed
         * @snippet Store.purchaseSubscription()|snippet
            Store.purchaseSubscription('${1:productId}');
         */
        purchaseSubscription: function (productId) {
            if (!isLoaded) {
                return false;
            }
            window.Cocoon.InApp.purchaseSubscription(productId, function (error) {
                if (error) {
                    console.log(error);
                    return;
                }
            });
            return true;
        },
        /**
         * Returns false if restore failed
         * @snippet Store.restore()|snippet
            Store.restore();
         */
        restore: function () {
            if (!isLoaded) {
                console.log('Cannot restore');
                EventSystem.fire('restore_error', 'Store not loaded.');
                return false;
            }
            window.Cocoon.InApp.restorePurchases(function (error) {
                if (error) {
                    console.log('error restore purchases');
                    console.log(JSON.stringify(error));
                    EventSystem.fire('restore_error', error.message);
                    return;
                }
                EventSystem.fire('restore_success');
            });
            return true;
        },
        getProducts: function () {
            if (!isLoaded) {
                return null;
            }
            return window.Cocoon.InApp.getProducts();
        },
        getCachedProducts: function () {
            return productsCache;
        },
        /**
         * Retrieved all products
         * @snippet Store.isLoaded()|Boolean
            Store.isLoaded()
         */
        isLoaded: function () {
            return isLoaded;
        },
        canPurchase: function () {
            return window.Cocoon.InApp.canPurchase();
        },
        /**
         * Retrieved all products
         * @snippet Store.consume()|snippet
            Store.consume('${1:productId}')
         */
        consume: function (purchaseInfo, callback) {
            window.Cocoon.InApp.consume(purchaseInfo.productId, 1, callback);
        },
        /**
         * Resolve saved purchase
         * @snippet Store.resolvePurchase()|snippet
            Store.resolvePurchase(${1:purchaseInfo})
         */
        resolvePurchase: function (purchaseInfo) {
            var unresolvedPurchases = Bento.saveState.load('unresolvedPurchases', []);
            var resolvedPurchases = Bento.saveState.load('resolvedPurchases', []); // keep track of history

            // find purchase based on product id and transaction id
            Utils.forEach(unresolvedPurchases, function (info, i, l, breakLoop) {
                if (
                    info.productId === purchaseInfo.productId &&
                    info.transactionId === purchaseInfo.transactionId
                ) {
                    // remove from unresolved
                    unresolvedPurchases.splice(i, 1);
                    resolvedPurchases.push(info);
                    breakLoop();
                }
            });

            // save
            Bento.saveState.save('unresolvedPurchases', unresolvedPurchases);
            Bento.saveState.save('resolvedPurchases', resolvedPurchases);
        },
        resolveAllPurchases: function () {
            var unresolvedPurchases = Bento.saveState.load('unresolvedPurchases', []);
            var resolvedPurchases = Bento.saveState.load('resolvedPurchases', []);
            resolvedPurchases = resolvedPurchases.concat(unresolvedPurchases);
            Bento.saveState.save('unresolvedPurchases', []);
            Bento.saveState.save('resolvedPurchases', resolvedPurchases);
        }
    };


    return store;
});