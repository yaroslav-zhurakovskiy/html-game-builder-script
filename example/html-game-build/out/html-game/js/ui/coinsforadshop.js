/**
 * Module description
 * @moduleName CoinsForAdShop
 * @snippet CoinsForAdShop.snippet
CoinsForAdShop({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/coinsforadshop', [
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
    'modules/savemanager',
    'modules/timemanager',
    'components/spritecontainer',
    'globals',
    'ui/coindialog',
    'modules/ads'
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
    SaveManager,
    TimeManager,
    SpriteContainer,
    Globals,
    CoinDialog,
    Ads
) {
    'use strict';

    var maxDailyRedeems = 3;
    var coinsPerAd = 50;

    var CoinsForAdShop = function (settings) {
        // --- VARS ---
        var viewport = Bento.getViewport();
        var isWatching = false;
        var timesRedeemedToday = SaveManager.load('timesRedeemedAdForCoinsToday');
        var dayLastRedeemed = SaveManager.load('dayLastRedeemedAdForCoins');
        var today = Math.floor(TimeManager.getCurrentLocalTime() / TimeManager.constants.day);

        // --- PARAMETERS ---
        var position = settings.position || new Vector2(0, 0);

        // --- SETUP ---
        //reset stuff when day changes

        // --- COMPONENTS ---
        var backing = new SpriteContainer({
            imageName: 'ui/shop/freecoin_back',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV
        });

        var updateTimer = function () {
            var tomorrowTime = (today + 1) * TimeManager.constants.day;
            var timeToGo = Math.max(0, tomorrowTime - TimeManager.getCurrentLocalTime());
            var timeObject = TimeManager.timeToObject(timeToGo);
            var timeString = '';

            if (timeToGo <= 0) {
                return;
            }

            if (timeObject.hours < 10) {
                timeString += "0";
            }
            timeString += timeObject.hours.toString() + ":";
            if (timeObject.minutes < 10) {
                timeString += "0";
            }
            timeString += timeObject.minutes.toString() + ":";
            if (timeObject.seconds < 10) {
                timeString += "0";
            }
            timeString += timeObject.seconds.toString();

            timerText.setText(timeString);
        };
        var timerText = new Text({
            name: 'startText',
            position: new Vector2(0, 0),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV),
            text: "00:00:00",
            font: 'luckiest_guy',
            fontSize: 12,
            fontColor: '#fbffb6',
            align: 'center',
            textBaseline: 'middle',
            maxWidth: 96,
            maxHeight: 12
        });
        var timer = new Entity({
            name: 'timer',
            position: new Vector2(0, 0),
            alpha: 0,
            components: [
                timerText, {
                    name: "timerUpdater",
                    start: function () {
                        updateTimer();
                        EventSystem.on('onEverySecond', updateTimer);
                    },
                    destroy: function () {
                        EventSystem.off('onEverySecond', updateTimer);
                    }
                }
            ]
        });

        var onAd = function () {
            new CoinDialog({
                numberOfCoins: coinsPerAd
            });
            Utils.giveCoins(coinsPerAd);

            timesRedeemedToday++;
            SaveManager.save('timesRedeemedAdForCoinsToday', timesRedeemedToday);
            if (timesRedeemedToday >= maxDailyRedeems) {
                adButton.setActive(false);
                adButtonIcon.alpha = 0;
                timer.alpha = 1;
            }
            badgeCount.setText(maxDailyRedeems - timesRedeemedToday);
            isWatching = false;
            EventSystem.fire('coinsForAdUpdated', (maxDailyRedeems - timesRedeemedToday));
        };
        var adButtonIcon = new SpriteContainer({
            imageName: 'ui/icons/vid2',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.625, 0.625)
        });
        var adButton = new ClickButton({
            name: 'adButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(32, 0),
            scale: Globals.pixelScaleUIV.scalarMultiply(1),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                if (!isWatching) {
                    isWatching = true;
                    if (Utils.isDev()) {
                        window.alert("This is a Rewarded Ad!");
                        Bento.input.resetPointers();
                        onAd();
                    } else {
                        Ads.showRewarded(function () {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedRevive",
                                value: 1
                            });
                            onAd();
                        }, function (e) {
                            isWatching = false;
                        }, "CoinsForAdShop");
                    }
                }
            },
        }).attach(adButtonIcon).attach(timer).attach({
            name: 'motionBehaviour',
            start: function () {
                var p = this.parent;
                var wiggle = function () {
                    new Tween({
                        from: 1,
                        to: 0,
                        in: 30,
                        applyOnDelay: 0,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            if (adButton.active) {
                                p.scale = Globals.pixelScaleUIV.scalarMultiply(1 + (v * 0.05));
                            } else {
                                p.scale = Globals.pixelScaleUIV.scalarMultiply(1);
                            }
                        }
                    });
                    new Tween({
                        from: 1,
                        to: 0,
                        in: 60,
                        applyOnDelay: 0,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            if (adButton.active) {
                                p.rotation = Math.sin(p.timer * 0.5) * 0.05 * v;
                            } else {
                                p.rotation = 0;
                            }
                            adButtonIcon.rotation = p.rotation;
                        },
                        onComplete: function () {
                            new Tween({ in: 15,
                                onComplete: function () {
                                    wiggle();
                                }
                            });
                        }
                    });
                };
                wiggle();
            }
        });
        if (timesRedeemedToday >= maxDailyRedeems) {
            adButton.setActive(false);
            adButtonIcon.alpha = 0;
            timer.alpha = 1;
        }
        if (!Ads.canShowRewarded()) {
            adButton.setActive(false);
            adButtonIcon.alpha = Math.min(0.5, adButtonIcon.alpha);
        }

        var coin = new SpriteContainer({
            imageName: 'ui/big_coin',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-32, -7),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.35)
        });

        var coinCount = new Text({
            fontSettings: Utils.getTextStyle('shopTitles'),
            position: new Vector2(-32, 12),
            maxWidth: 32,
            maxHeight: 12,
            text: coinsPerAd
        });

        var badgeCount = new Text({
            fontSettings: Utils.getTextStyle('badgeCount'),
            position: new Vector2(0, -1),
            maxWidth: 32,
            maxHeight: 12,
            text: (maxDailyRedeems - timesRedeemedToday).toString(),
            scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI)
        });
        var badge = new SpriteContainer({
            imageName: 'ui/shop/vid-badge',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(4, -8),
            scale: Globals.pixelScaleUIV
        }).attach(badgeCount);


        // --- ENTITY ---
        var entity = new Entity({
            z: 0,
            name: 'CoinsForAdShop',
            family: [''],
            position: position,
            updateWhenPaused: 0,
            float: false,
            components: [
                backing,
                adButton,
                coin,
                coinCount,
                badge
            ]
        });
        return entity;
    };

    CoinsForAdShop.checkDay = function () {
        var timesRedeemedToday = SaveManager.load('timesRedeemedAdForCoinsToday');
        var dayLastRedeemed = SaveManager.load('dayLastRedeemedAdForCoins');
        var today = Math.floor(TimeManager.getCurrentLocalTime() / (1000 * 60 * 60 * 24));
        if (today > dayLastRedeemed) {
            dayLastRedeemed = today;
            timesRedeemedToday = 0;
            SaveManager.save('dayLastRedeemedAdForCoins', dayLastRedeemed);
            SaveManager.save('timesRedeemedAdForCoinsToday', timesRedeemedToday);
        }
    };

    CoinsForAdShop.getBadgeValue = function () {
        return maxDailyRedeems - SaveManager.load('timesRedeemedAdForCoinsToday');
    };

    return CoinsForAdShop;
});