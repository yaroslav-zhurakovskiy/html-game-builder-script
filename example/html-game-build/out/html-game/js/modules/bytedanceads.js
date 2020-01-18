/**
 * Component description
 * @moduleName BytedanceAds
 * @snippet BytedanceAds.snippet
 */
bento.define('modules/bytedanceads', [
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
    // ------ FUNCTIONS ------
    var nothing = function () {
        // do nothing
    };
    var error = function (err) {
        if (!err) {
            return;
        }
        console.log('ByteDance Ads Error: ', err);
    };
    var prepareInteractionLoop = function () {
        // keeps trying to prepare until it succeeds
        BytedanceModule.prepareInteraction(nothing, prepareInteractionLoop);
    };
    var prepareRewardedLoop = function () {
        // keeps trying to prepare until it succeeds
        BytedanceModule.prepareRewarded(nothing, prepareRewardedLoop);
    };

    // --- VARS ---
    var hasInteractionAd = false;
    var isProcessingInteraction = false;
    var interactionCodeID;
    var autoLoadInteractionAds = true;
    var interactionLoadCallback;
    var interactionLoadFailedCallback;
    var interactionCompleteCallback;

    var hasRewardedAd = false;
    var isProcessingRewarded = false;
    var rewardedCodeID;
    var autoLoadRewardedAds = true;
    var rewardedLoadCallback;
    var rewardedLoadFailedCallback;
    var rewardedCompleteCallback;

    // --- MODULE ---
    var BytedanceModule = {
        initialize: nothing,
        prepareInteraction: nothing,
        canShowInteraction: function () {
            return Utils.isDev();
        },
        showInteraction: nothing,
        prepareRewarded: nothing,
        canShowRewarded: function () {
            return Utils.isDev();
        },
        showRewarded: nothing
    };
    // Check if we can access iron source, if we can, get it ready
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.toutiao) {
        var BytedancePlugin = window.cordova.plugins.toutiao;

        BytedanceModule = {
            initialize: function (options, success, failure) {
                if (Utils.isDefined(options.autoLoadInteractionAds)) {
                    autoLoadInteractionAds = options.autoLoadInteractionAds;
                }
                if (Utils.isDefined(options.autoLoadRewardedAds)) {
                    autoLoadRewardedAds = options.autoLoadRewardedAds;
                }
                if (!options.appID) {
                    Utils.log('Bytedance Ads Initialization failed!', 'No App ID!');
                    return;
                }
                if (!options.appName) {
                    Utils.log('Bytedance Ads Initialization failed!', 'No App Name!');
                    return;
                }
                interactionCodeID = options.interactionCodeID;
                rewardedCodeID = options.rewardedCodeID;
                BytedancePlugin.initSDK({
                    appID: options.appID,
                    appName: options.appName,
                    textureView: true,
                    showNotificationBar: true,
                    debug: true,
                    showPageOnScreenLock: true,
                    titleBarTheme: 1
                }, function () {
                    console.log('Bytedance Ads Initialized!');
                    if (success) {
                        success();
                    }
                    if (autoLoadInteractionAds) {
                        prepareInteractionLoop();
                    }
                    if (autoLoadRewardedAds) {
                        prepareRewardedLoop();
                    }
                }, function (e) {
                    Utils.log('Bytedance Ads Initialization failed! Error: ', e);
                    if (failure) {
                        failure(e);
                    }
                });
            },
            prepareInteraction: function (success, failure) {
                var screenSize = Utils.getScreenSize();
                var AdSize = new Vector2(screenSize.width, screenSize.height).scalarMultiply(0.9);

                interactionLoadCallback = success;
                interactionLoadFailedCallback = failure;
                BytedancePlugin.loadInteractionAd({
                    codeID: interactionCodeID,
                    imageWidth: AdSize.x,
                    imageHeight: AdSize.y,
                    autoShow: true
                }, nothing, error);
            },
            canShowInteraction: function (yes, no) {
                if (hasInteractionAd && !isProcessingRewarded) {
                    if (yes) {
                        yes();
                    }
                } else {
                    if (no) {
                        no();
                    }
                }
            },
            showInteraction: function (onComplete, failure) {
                var onFailure = function (e) {
                    isProcessingInteraction = false;
                    if (failure) {
                        failure(e);
                    } else {
                        error(e);
                    }
                };

                if (hasInteractionAd && !isProcessingInteraction) {
                    isProcessingInteraction = true;
                    interactionCompleteCallback = onComplete;
                    BytedancePlugin.showInteractionAd(nothing, onFailure);
                }
            },
            prepareRewarded: function (success, failure) {
                var screenSize = Utils.getScreenSize();
                var AdSize = new Vector2(screenSize.width, screenSize.height);

                rewardedLoadCallback = success;
                rewardedLoadFailedCallback = failure;
                BytedancePlugin.loadRewardVideoAd({
                    codeID: rewardedCodeID,
                    imageWidth: AdSize.x,
                    imageHeight: AdSize.y,
                    rewardName: '',
                    amount: 0,
                    autoShow: false
                }, nothing, error);
            },
            canShowRewarded: function () {
                return hasRewardedAd && !isProcessingRewarded;
            },
            showRewarded: function (onComplete, failure) {
                var onFailure = function (e) {
                    isProcessingRewarded = false;
                    if (failure) {
                        failure(e);
                    } else {
                        error(e);
                    }
                };

                if (hasRewardedAd && !isProcessingRewarded) {
                    isProcessingRewarded = true;
                    rewardedCompleteCallback = onComplete;
                    BytedancePlugin.showRewardVideoAd(nothing, onFailure);
                }
            },
        };
    }

    //interaction callbacks
    document.addEventListener('onInteractionAdLoad', function (data) {
        if (interactionLoadCallback) {
            hasInteractionAd = true;
            interactionLoadCallback(data);
        }
    }, false);
    document.addEventListener('onInteractionAdLoadFailed', function (data) {
        if (interactionLoadFailedCallback) {
            hasInteractionAd = false;
            interactionLoadFailedCallback(data);
        }
    }, false);
    //Interstitial ad close Listener
    document.addEventListener('onInteractionAdDismiss', function (data) {
        // If we're waiting for a close
        if (isProcessingInteraction) {
            isProcessingInteraction = false;
            hasInteractionAd = false;
            // fire success
            if (interactionCompleteCallback) {
                interactionCompleteCallback();
            }
            // prepare next interstitial
            if (autoLoadInteractionAds) {
                prepareInteractionLoop();
            }
        }
    }, false);
    //interaction callbacks
    document.addEventListener('onRewardVideoCached', function (data) {
        hasRewardedAd = true;
        if (rewardedLoadCallback) {
            rewardedLoadCallback(data);
        }
    }, false);
    document.addEventListener('onRewardVideoError', function (data) {
        switch (data.code) {
        case '20001': // ad failed to load!!!
            hasRewardedAd = false;
            if (rewardedLoadFailedCallback) {
                rewardedLoadFailedCallback(data);
                // prepare next interstitial
                if (autoLoadRewardedAds) {
                    prepareRewardedLoop();
                }
            }
            break;
        }
    }, false);
    //Interstitial ad close Listener
    document.addEventListener('onRewardVideoAdClose', function (data) {
        // if we're waiting for a close event
        if (isProcessingRewarded) {
            isProcessingRewarded = false;
        }
    }, false);
    //Interstitial ad close Listener
    document.addEventListener('onRewardVideoComplete', function (data) {
        // if we're waiting for a close event
        if (isProcessingRewarded) {
            isProcessingRewarded = false;
            if (rewardedCompleteCallback) {
                rewardedCompleteCallback();
            }
        }
    }, false);


    return BytedanceModule;
});