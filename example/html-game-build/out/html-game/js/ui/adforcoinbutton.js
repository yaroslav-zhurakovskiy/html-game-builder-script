/**
 * Module description
 * @moduleName AdForCoinbutton
 * @snippet AdForCoinbutton.snippet
AdForCoinbutton({})
 */
bento.define('ui/adforcoinbutton', [
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
    'components/spritecontainer',
    'bento/components/nineslice',
    'components/sortedclickable',
    'globals',
    'modules/ironsource',
    'modules/timemanager'
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
    SpriteContainer,
    NineSlice,
    SortedClickable,
    Globals,
    IronSource,
    TimeManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var canAd = false;
        var reward = settings.reward || 25;
        var isWatching = false;

        var maxAds = 5;
        var today = Math.floor(TimeManager.getCurrentTime() / 1000 / 60 / 60 / 24);
        var savedDay = Bento.saveState.load('adRewardDay', 0);
        var adsRemaining = Bento.saveState.load('adRewardRemaining', 5);
        if (today !== savedDay) {
            adsRemaining = maxAds;
            Bento.saveState.save('adRewardRemaining', adsRemaining);
            Bento.saveState.save('adRewardDay', today);
        }
        var onWatchedAd = settings.onWatchedAd || function () {};

        // --- FUNCTIONS ---
        var hiddenStatus = 'hidden';
        var show = function () {
            if (hiddenStatus === 'hidden') {
                hiddenStatus = 'moving';
                new Tween({
                    from: adButton.position.x,
                    to: viewport.width - 24,
                    in: 15,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        adButton.position.x = v;
                    },
                    onComplete: function () {
                        hiddenStatus = 'shown';
                    }
                });
            }
        };
        var hide = function () {
            if (hiddenStatus === 'shown') {
                hiddenStatus = 'moving';
                new Tween({
                    from: adButton.position.x,
                    to: viewport.width + 24,
                    in: 15,
                    ease: 'easeInQuad',
                    onUpdate: function (v, t) {
                        adButton.position.x = v;
                    },
                    onComplete: function () {
                        hiddenStatus = 'hidden';
                    }
                });
            }
        };

        // --- COMPONENTS ---
        var remainingAdsText = new Text({
            position: new Vector2(0, -105),
            text: adsRemaining + ' / ' + maxAds,
            fontSize: 8,
            fontColor: '#d67512',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI)
        });

        var adButton = new Entity({
            name: 'tabEntity',
            position: new Vector2(viewport.width + 24, viewport.height * 0.5),
            scale: Globals.pixelScaleUIV.scalarMultiply(2),
            components: [
                new ClickButton({
                    z: settings.z || 0,
                    name: 'adButton',
                    sfx: '',
                    imageName: 'ui/orangebutton',
                    frameCountX: 1,
                    frameCountY: 3,
                    position: new Vector2(0, 0),
                    scale: new Vector2(0.4, 0.8),
                    updateWhenPaused: 0,
                    float: true,
                    sort: true,
                    onClick: function () {
                        if (canAd && hiddenStatus === 'shown' && !isWatching) {
                            if (Utils.isDev()) {
                                window.alert("This is a Rewarded Ad!");
                                Bento.input.resetPointers();
                                adsRemaining--;
                                Bento.saveState.save('adRewardRemaining', adsRemaining);
                                remainingAdsText.setText(adsRemaining + ' / ' + maxAds);
                                onWatchedAd();
                            } else {
                                IronSource.showRewarded(function () {
                                    isWatching = false;
                                    adsRemaining--;
                                    Bento.saveState.save('adRewardRemaining', adsRemaining);
                                    remainingAdsText.setText(adsRemaining + ' / ' + maxAds);
                                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                                        eventId: "ads:rewardedMenuCoins",
                                        value: 1
                                    });
                                    onWatchedAd();
                                }, function (e) {
                                    isWatching = false;
                                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                                        eventId: "ads:rewardedMenuCoins",
                                        value: 0
                                    });
                                });
                            }
                        }
                    }
                }),
                new SpriteContainer({
                    imageName: 'ui/icons/vid',
                    originRelative: new Vector2(0.4, 0.4),
                    position: new Vector2(-20, -20),
                    scale: new Vector2(0.33, 0.33)
                }),
                new SpriteContainer({
                    imageName: 'coin',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(56, 88),
                    scale: new Vector2(1.25, 1.25)
                }),
                new Text({
                    position: new Vector2(-56, 88),
                    text: '+' + reward,
                    fontSize: 12,
                    fontColor: '#fbffbe',
                    align: 'center',
                    textBaseline: 'middle',
                    scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI)
                }),
                remainingAdsText, {
                    name: 'showBehaviour',
                    update: function () {
                        canAd = (IronSource.canShowRewarded() || Utils.isDev()) && Bento.saveState.load('doneUnlockTutorial', false) && adsRemaining > 0;
                        if (canAd && hiddenStatus === 'hidden') {
                            show();
                        }
                        if (!canAd && hiddenStatus === 'shown') {
                            hide();
                        }
                    }
                }
            ]
        });
        return adButton;
    };
});