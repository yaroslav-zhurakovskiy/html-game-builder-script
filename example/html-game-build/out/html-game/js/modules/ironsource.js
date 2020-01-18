/**
 * Module for using IronSource Ads in Bento.
 TODO: Banners
 TODO: Offer Walls
 TODO: Other Callbacks(?)
 * @moduleName IronSource
 */
bento.define('modules/ironsource', [
    'bento',
    'bento/utils',
    'bento/eventsystem',
    'modules/savemanager',
    'bento/tween'
], function (
    Bento,
    Utils,
    EventSystem,
    SaveManager,
    Tween
) {
    // ------ FUNCTIONS ------
    var nothing = function () {
        // do nothing
    };
    var error = function (err) {
        if (!err) {
            return;
        }
        console.log('Iron Source Error: ', err);
    };
    var prepareInterstitialLoop = function () {
        // keeps trying to prepare until it succeeds
        IronSourceModule.prepareInterstitial(nothing, prepareInterstitialLoop);
    };

    var checkRewardedLoop = function () {
        new Tween({ in: 30,
            onComplete: function () {
                // if (!rewardedAvailable) {
                IronSourceModule.hasRewardedVideo(function (available) {
                    rewardedAvailable = available;
                    checkRewardedLoop();
                }, checkRewardedLoop);
                // } else {
                // checkRewardedLoop();
                // }
            }
        });
    };

    // ------ VARS ------
    // Banner Variables
    var bannerOptions = {
        autoShowBanner: 'false', // true or false - To auto load ad when ad is ready.
        bannerPosition: 'bottom', // center or top or bottom. Center always overlap the screen.
        adSize: 'BANNER', // SMART OR BANNER OR LARGE_BANNER or RECT_BANNER
        placement: 'DefaultBanner', // placement name optional
        bannerOverlap: 'true', // true or false, overlap banner on webview. doesn't have effect on center position.
        offsetTopBar: 'false', // true or false, set offset when ad is loaded at top for ios7 statusbar
        offsetBottom: 'true', // true or false, set offset when
    };

    var getBannerStatus = function () {
        return {
            prepared: bannerPrepared,
            loaded: bannerLoaded,
            queue: bannerQueue,
            visible: bannerVisible
        };
    };

    var isBannerVisible = function () {
        return bannerVisible;
    };

    var bannerPrepared = false;
    var bannerLoaded = false;
    var bannerQueue = false;
    var bannerVisible = false;

    // Interstitial Variables
    var autoLoadInterstitials = true;
    var isProcessingInterstitial = false;
    var interstitialLoadCallback;
    var interstitialLoadFailedCallback;
    var interstitialCompleteCallback;

    // Rewarded Variables
    var rewardedAvailable = false;
    var isProcessingRewarded = false;
    var doGiveReward = false;
    var rewardedCallback;


    // ------ MODULE ------
    // Fallback Callbacks Module
    var IronSourceModule = {
        initialize: nothing,
        setUserConsent: nothing,
        createBannerView: nothing,
        getBannerStatus: getBannerStatus,
        isBannerVisible: isBannerVisible,
        removeBannerView: nothing,
        showBanner: nothing,
        hideBanner: nothing,
        prepareInterstitial: nothing,

        canShowInterstitial: function (a, b) {
            b();
        },
        showInterstitial: nothing,
        canShowRewarded: function () {
            return Utils.isDev();
        },
        showRewarded: nothing
    };

    // Check if we can access iron source, if we can, get it ready
    if (window.plugins && window.plugins.ironsource) {
        var IronSource = window.plugins.ironsource;
        IronSourceModule = {
            /**
            * Initializes the SDK and creates the events

            * @param {Object} settings -
                options = {
                    appKey: 'appKey' string from IronSource console
                    userId: 'userId' (optional) string for the userId
                    clientCallback: boolean for whether to use client callbacks for offerwalls, useless right now
                    autoLoadInterstitials: boolean for whether we want to automatically load interstitials in the same way rewarded ads load
                }

            * @snippet IronSource.initialize
            IronSource.initialize({
                appKey: 'appKey',
                userId: 'userId',
                clientCallback: false,
                autoLoadInterstitials: true
            }, function () {
                //success
            }, function (e) {
                //failure
            });
            */
            initialize: function (options, success, failure) {
                if (Utils.isDefined(options.autoLoadInterstitials)) {
                    autoLoadInterstitials = options.autoLoadInterstitials;
                }
                if (!options.appKey) {
                    Utils.log('Iron Source Initialization failed!', 'No App Key!');
                }
                IronSource.initSdk({
                    appKey: options.appKey || '',
                    userId: options.userId || '',
                    clientCallback: Utils.isDefined(options.clientCallback) ? options.clientCallback : false,
                }, function () {
                    console.log('Iron Source Initialized!');
                    if (success) {
                        success();
                    }
                    if (autoLoadInterstitials) {
                        prepareInterstitialLoop();
                    }
                    checkRewardedLoop();

                    // this is synchronous
                    IronSourceModule.createBannerView(function () {
                        console.log('IronSource banner view created');
                    }, error);
                }, function (e) {
                    Utils.log('Iron Source Initialization failed!', e);
                    if (failure) {
                        failure(e);
                    }
                });
            },
            /**
            * This function is used to manually set the user consent for GDPR.

            * @snippet IronSource.setUserConsent
                IronSource.setUserConsent(true);
            */
            setUserConsent: function (userConsent) {
                IronSource.setUserConsent(userConsent, nothing, error);
            },
            /**
            * Sets up the banner view
            * @snippet IronSource.createBannerView
                IronSource.createBannerView();
            */
            createBannerView: function (succes, failure) {
                IronSource.createBannerView(bannerOptions, function () {
                    bannerPrepared = true;
                    if (succes) {
                        succes();
                    }
                }, error);
            },
            /**
            * Get status of banner
            * @snippet IronSource.getBannerStatus
                IronSource.getBannerStatus();
            */
            getBannerStatus: getBannerStatus,
            /**
            * If banner is/was visible
            * @snippet IronSource.isBannerVisible
                IronSource.isBannerVisible();
            */
            isBannerVisible: isBannerVisible,
            /**
            * Removes the banner view
            * @snippet IronSource.removeBannerView
                IronSource.removeBannerView(function () {
                    //success
                });
            */
            removeBannerView: function (succes) {
                IronSource.removeBannerView(function () {
                    bannerPrepared = false;
                    bannerLoaded = false;
                    bannerQueue = false;
                    bannerVisible = false;
                    if (succes) {
                        succes();
                    }
                }, error);
            },

            /**
            * Loads and displays an ad, have to create a banner view before doing this
            * @snippet IronSource.showBanner
                IronSource.showBanner(function () {
                    //success
                });
            */
            showBanner: function (succes) {
                if (bannerLoaded) {
                    IronSource.showBanner(function () {
                        bannerVisible = true;
                        if (succes) {
                            succes();
                        }
                        bannerQueue = null;
                    }, error);
                } else {
                    // always run this since there is a difference between ad networks it seems
                    IronSourceModule.createBannerView(function () {
                        console.log('IronSource banner view created');
                        bannerPrepared = true;
                    }, error);
                    bannerQueue = succes;
                }
            },
            /**
            * Hides the current ad, doesnt remove it completely. Try removeBannerView() instead.
            * @snippet IronSource.hideBanner
                IronSource.hideBanner(function () {
                    //success
                });
            */
            hideBanner: function (succes) {
                if (bannerVisible) {
                    IronSource.hideBanner(function () {
                        bannerVisible = false;
                        if (succes) {
                            succes();
                        }
                    }, error);
                }
            },

            /**
            * Manually prepares an Interstital to be shown, MUST be called before showInterstitial if autoLoadInterstitials is false

            * @param {Object} settings -
                success: callback (async),
                failure: callback (sync)

            * @snippet IronSource.prepareInterstitial
                IronSource.prepareInterstitial (function () {
                    //success
                }, function (e) {
                    //failure
                });
            */
            prepareInterstitial: function (success, failure) {
                interstitialLoadCallback = success;
                interstitialLoadFailedCallback = failure;
                IronSource.prepareInterstitialView(nothing, error);
            },



            /**
            * Checks whether we can show an interstitial

            * @param {Object} settings -
                canShowCallback: callback (async),
                cannotShowCallback: callback(reason) (async)

            * @snippet IronSource.canShowInterstitial
                IronSource.canShowInterstitial (function () {
                    // can show Interstitial
                }, function (e) {
                    // can not show Interstitial
                });
            */
            canShowInterstitial: function (canShowCallback, cannotShowCallback) {
                // annoyingly this is asynchoronous
                IronSource.isInterstitialReady(function (isInterstitialReady) {
                    if (isInterstitialReady) {
                        canShowCallback();
                    } else {
                        cannotShowCallback();
                    }
                }, function (e) {
                    if (cannotShowCallback) {
                        cannotShowCallback(e);
                    } else {
                        error(e);
                    }
                });
            },



            /**
            * Shows a prepared interstitial

            * @param {Object} settings -
                success: callback (sync),
                failure: callback(reason) (sync)

            * @snippet IronSource.showInterstitial
                IronSource.showInterstitial (function () {
                    // Interstitial completed
                }, function (e) {
                    // Interstitial failed to show
                });
            */
            showInterstitial: function (onComplete, failure, placementTag) {
                if (!placementTag) {
                    placementTag = '';
                }
                // callback that fires on a failure
                var onFailure = function (e) {
                    isProcessingInterstitial = false;
                    if (failure) {
                        failure(e);
                    } else {
                        error(e);
                    }
                };

                if (!isProcessingInterstitial) {
                    isProcessingInterstitial = true;
                    interstitialCompleteCallback = onComplete;
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "ads:interstitialStart:"
                    });
                    IronSourceModule.canShowInterstitial(function (didSucceed) {
                        IronSource.showInterstitialView(placementTag, nothing, onFailure);
                    }, onFailure);
                }
            },



            /**
            * Checks whether we can show an rewarded
            * @snippet IronSource.canShowRewarded
                IronSource.canShowRewarded();
            */
            canShowRewarded: function () {
                return rewardedAvailable;
            },

            hasRewardedVideo: function (success, failure) {
                IronSource.hasRewardedVideo(success, failure);
            },



            /**
            * Shows a rewarded ad

            * @param {Object} settings -
                success: callback (sync),
                failure: callback (sync)

            * @snippet IronSource.showRewarded
                IronSource.showRewarded (function () {
                    // Rewarded shown and completed
                    //give reward
                }, function (e) {
                    // Interstitial failed to show
                    // rewarded failed to show, or the user cancelled watching
                });

            */
            showRewarded: function (onComplete, failure, placementTag) {

                if (!placementTag) {
                    placementTag = "";
                }

                // callback that fires on a failure
                var onFailure = function (e) {
                    isProcessingRewarded = false;
                    if (failure) {
                        failure(e);
                    } else {
                        error(e);
                    }
                };

                // if we're not already processing a rewarded ad, start a new process
                if (!isProcessingRewarded && IronSourceModule.canShowRewarded()) {
                    //start process, set callback, reset bool
                    isProcessingRewarded = true;
                    rewardedCallback = function () {
                        onComplete();
                        EventSystem.fire('Tenjin', {
                            name: "video_view"
                        });
                        var watchedAds = SaveManager.load('watchedAds');
                        SaveManager.save('watchedAds', watchedAds + 1);
                        if (watchedAds === 10) {
                            EventSystem.fire('Tenjin', {
                                name: "10_rv_watched"
                            });
                        }
                        if (watchedAds === 50) {
                            EventSystem.fire('Tenjin', {
                                name: "50_rv_watched"
                            });
                        }
                    };
                    doGiveReward = false;
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "ads:rewardedStart:"
                    });
                    //double check we can show a rewarded ad
                    IronSource.showRewardedVideo(placementTag, nothing, onFailure);
                } else {
                    // we're already processing an ad or there isn't one available
                }
            }
        };

        // Good to go!
        console.log("IronSource Ready!");
    } else {

        //Iron Source doesn't exist, so we don't overwrite the module
        Utils.log("WARNING: IronSource not found!");
    }

    // ------ LISTENERS ------
    //Banner Load Ad Listener
    document.addEventListener('bannerDidLoad', function (data) {
        // show banner if need to
        bannerLoaded = true;
        if (bannerQueue) {
            IronSourceModule.showBanner(bannerQueue);
        } else {}
    }, false);

    //Banner Load Ad Failure Listener
    document.addEventListener('bannerDidFailToLoadWithError', function (data) {
        EventSystem.fire('bannerStatusChanged', data);
    }, false);

    //Banner Clicked Listener
    document.addEventListener('didClickBanner', function (data) {}, false);

    //Banner Full Screen Listener
    document.addEventListener('bannerWillPresentScreen', function (data) {}, false);

    //Banner Dismissed Full Screen Listener
    document.addEventListener('bannerDidDismissScreen', function (data) {}, false);

    //Banner Leave App Listener
    document.addEventListener('bannerWillLeaveApplication', function (data) {}, false);

    //Interstitial ad close Listener
    document.addEventListener('interstitialDidClose', function (data) {
        // If we're waiting for a close
        if (isProcessingInterstitial) {
            isProcessingInterstitial = false;
            // fire success
            if (interstitialCompleteCallback) {
                interstitialCompleteCallback();
            }
            // prepare next interstitial
            if (autoLoadInterstitials) {
                prepareInterstitialLoop();
            }
        }
    }, false);

    //Interstitial Load Ad Listener
    document.addEventListener('interstitialDidLoad', function (data) {
        if (interstitialLoadCallback) {
            interstitialLoadCallback(data);
        }
    }, false);

    //Interstitial Load Ad Failure Listener
    document.addEventListener('interstitialDidFailToLoadWithError', function (data) {
        if (interstitialLoadFailedCallback) {
            interstitialLoadFailedCallback(data);
        }
    }, false);


    // Rewarded Video Availablity Listener
    document.addEventListener('rewardedVideoHasChangedAvailability', function (data) {
        var decodedData = JSON.parse(data.msg);
        rewardedAvailable = decodedData.available;
    }, false);

    // Rewarded ad close Listener
    document.addEventListener('rewardedVideoDidClose', function (data) {
        // if we're waiting for a close event
        if (isProcessingRewarded) {
            isProcessingRewarded = false;
            // if a reward function exists
            if (rewardedCallback) {
                // if we got the all clear for a reward, give it. Otherwise do nothing and wait for the reward listener
                if (doGiveReward) {
                    rewardedCallback(data);
                    doGiveReward = false;
                }
            }
        }
    }, false);

    // Reward Listener
    document.addEventListener('didReceiveRewardForPlacement', function (data) {
        if (isProcessingRewarded) {
            // if we're in the middle of processing a rewarded ad, allow the reward on close
            doGiveReward = true;
        } else {
            // if we get this callback and we're not processing an ad, the ad has already closed before we got this callback.
            // In this case, we just give them the reward as they have to have watched the ad to get it.
            rewardedCallback(data);
            doGiveReward = false;
        }
    }, false);

    return IronSourceModule;
});