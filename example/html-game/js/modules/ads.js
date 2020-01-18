/**
 * A module made SPECIFCIALLY for Nom Plant to allow swapping between Toutiao and IronSource
 * @moduleName Ads
 * @snippet Ads.snippet
 */
bento.define('modules/ads', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'modules/ironsource',
    'modules/bytedanceads'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween,
    IronSource,
    BytedanceAds
) {
    'use strict';

    // Bytedance Ads
    var BDAds = {
        init: function () {
            BytedanceAds.initialize({
                appID: '5001121',
                appName: 'Mouth Plant',
                autoLoadInteractionAds: true,
                autoLoadRewardedAds: true,
                interactionCodeID: '901121725',
                rewardedCodeID: '901121365'
            });
        },
        canShowRewarded: function () {
            return BytedanceAds.canShowRewarded();
        },
        showRewarded: function (success, failure, placement) {
            success();
            //BytedanceAds.showRewarded(success, failure);
        },
        canShowInterstitial: function (yes, no) {
            yes();
            //BytedanceAds.canShowInteraction(yes, no);
        },
        showInterstitial: function (success, failure) {
            success();
            //BytedanceAds.showInteraction(success, failure);
        }
    };

    // IronSource Ads
    var ISAds = {
        init: function () {
            IronSource.initialize({
                appKey: Utils.isNativeIos() ? '864af795' : '8f8b696d',
                clientCallback: false,
                autoLoadInterstitials: true
            }, function () {
                IronSource.setUserConsent(true);
            }, function (e) {
                console.log(e);
            });
        },
        canShowRewarded: function () {
            return IronSource.canShowRewarded();
        },
        showRewarded: function (success, failure, placement) {
            success();
            //IronSource.showRewarded(success, failure, placement);
        },
        canShowInterstitial: function (yes, no) {
            yes();
            //IronSource.canShowInterstitial(yes, no);
        },
        showInterstitial: function (success, failure) {
            success();
            //IronSource.showInterstitial(success, failure);
        }
    };

    return (window.ISCHINA) ? BDAds : ISAds;
});