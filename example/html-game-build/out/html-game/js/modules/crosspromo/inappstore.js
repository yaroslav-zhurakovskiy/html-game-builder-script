/**
 * Opens an "in-app store" in iOS
 * https://github.com/LuckyKat/cordova-plugin-inappstore
 */
bento.define('modules/crosspromo/inappstore', [
    'bento',
    'bento/utils'
], function (
    Bento,
    Utils
) {
    'use strict';
    var available = true;
    var isLoading = false;
    var shouldShow = false;
    var currentAppStoreId = '';
    var open = function (appstoreId, campaignToken, providerToken, onSuccess, onFail) {
        if (!available) {
            // fail callback
            if (onFail) {
                onFail();
            }
            return false;
        }
        if (isLoading) {
            return;
        }
        currentAppStoreId = appstoreId;

        // try to open in app store
        window.plugins.inappstore.openWithTokens(appstoreId, campaignToken, providerToken, function () {
            if (onSuccess) {
                onSuccess();
            }
            isLoading = false;

            // tried to show while it was loading
            if (shouldShow) {
                shouldShow = false;
                show();
            }
        }, function () {
            if (onFail) {
                onFail();
            }
        });
        return true;
    };
    var show = function () {
        if (isLoading) {
            // not ready to show
            console.log('not ready for showing');
            shouldShow = true;
            return;
        }
        console.log('show');
        window.plugins.inappstore.show();
    };

    // plugin not found
    if (!window.plugins || !window.plugins.inappstore) {
        available = false;
    }

    // must be on iOS
    if (!Utils.isNativeIos()) {
        available = false;
    }

    return {
        open: open,
        show: show
    };
});