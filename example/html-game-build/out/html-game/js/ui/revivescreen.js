/**
 * Module description
 * @moduleName ReviveScreen
 * @snippet ReviveScreen.snippet
ReviveScreen({
    onWatchedAd: function () {},
    onSkippedAd: function () {}
})
 */
bento.define('ui/revivescreen', [
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
    'bento/components/fill',
    'globals',
    'components/radialbar',
    'color',
    'components/spritecontainer',
    'modules/tenjin',
    'modules/localization',
    'modules/savemanager',
    'ui/shopdialog',
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
    Fill,
    Globals,
    RadialBar,
    Color,
    SpriteContainer,
    Tenjin,
    Localization,
    SaveManager,
    ShopDialog,
    Ads
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var completed = false;
        var deathCount = settings.deathCount || 0;
        var onComplete = settings.onComplete || function () {};
        var onSkipped = settings.onSkipped || function () {};

        // --- VARS ---
        var coinCount = SaveManager.load('coinCount');
        var revivePrices = [
            50,
            75,
            100
        ];
        var thisPrice = revivePrices[Math.min(revivePrices.length - 1, deathCount - 1)];
        var doAd = Ads.canShowRewarded() && Globals.canAdRevive;
        var doPay = true; //coinCount >= thisPrice;
        var countDownTime = 450;
        var countDownTicks = countDownTime;

        // do a check here to see if we can afford this popup
        if (!doAd && !doPay) {
            onSkipped();
            return;
        }

        // --- FUNCTIONS ---
        var hide = function () {
            new Tween({
                from: 1,
                to: 0,
                in: 20,
                ease: 'linear',
                onUpdate: function (v, t) {
                    entity.alpha = v;
                },
                onComplete: function () {
                    entity.removeSelf();
                }
            });
        };

        // --- COMPONENTS ---
        var counterBehaviour = {
            name: "countdownBehaviour",
            update: function (data) {
                if (!completed) {
                    if (countDownTicks > 0) {
                        countDownTicks -= data.speed;
                    } else {
                        countDownTicks = 0;
                        completed = true;
                        onSkipped();
                        if (doAd) {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedRevive",
                                value: 0
                            });
                        }
                        hide();
                    }
                    var percent = countDownTicks / countDownTime;
                    // shrink bar
                    timerBar.setColor(new Color(Utils.clamp(0, 255 * 2 * (1 - percent), 255), Utils.clamp(0, 255 * 2 * percent, 255), 0));
                    timerBar.setPercent(percent);
                }
            }
        };
        var continueText = new Text({
            fontSettings: Utils.getTextStyle('continueTitle'),
            position: new Vector2(0, -64),
            text: Localization.getText('continue?'),
            maxWidth: undefined,
            maxHeight: undefined
        });
        var timerBar = new RadialBar({
            name: 'radialBar',
            position: new Vector2(0, 0),
            scale: new Vector2(-1, 1),
            radius: 48,
            angle: 360,
            segments: 36,
            color: new Color(255, 0, 0),
            thickness: 5
        });
        var timerButton = new Entity({
            name: 'skipButton',
            position: new Vector2(0, 30),
            boundingBox: new Rectangle(-40, -40, 80, 80),
            components: [
                new SpriteContainer({
                    imageName: 'circle',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 0),
                    alpha: 0.25,
                    scale: Globals.pixelScaleV.scalarMultiply(3)
                }),
                timerBar,
                counterBehaviour
            ]
        });

        var payButton = new ClickButton({
            name: 'payButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.scalarMultiply((!doPay && doAd) ? 0.8 : 1.1),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                if (coinCount >= thisPrice) {
                    if (!completed) {
                        completed = true;
                        Utils.takeCoins(thisPrice, 'ingame', 'revive');
                        onComplete();
                        hide();
                    }
                } else {
                    new ShopDialog({
                        onComplete: function () {
                            coinCount = SaveManager.load('coinCount');
                        }
                    });
                }
            },
        }).attach(new SpriteContainer({
            imageName: 'ui/big_coin',
            position: new Vector2(-80, 8),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.25, 0.25)
        })).attach(new Text({
            position: new Vector2(64, 7.5),
            scale: new Vector2(0.5, 0.5).scalarMultiply(2 / Globals.pixelScaleUI),
            text: thisPrice.toString(),
            fontSettings: Utils.getTextStyle('dialogTitle'),
            maxWidth: 24,
            fontSize: 18,
            fontColor: '#fbffbe',
            align: 'center',
            textBaseline: 'middle',
            linebreaks: true
        }));

        var adButton = new ClickButton({
            name: 'adButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.scalarMultiply((doPay && !doAd) ? 1.1 : 0.8),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                if (!completed) {
                    completed = true;
                    if (Utils.isDev()) {
                        window.alert("This is a Rewarded Ad!");
                        Bento.input.resetPointers();
                        onComplete();
                        hide();
                    } else {
                        Ads.showRewarded(function () {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedRevive",
                                value: 1
                            });
                            onComplete();
                            hide();
                        }, function (e) {
                            completed = false;
                        }, "Revive");
                    }
                }
            },
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/vid2',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.625, 0.625)
        }));

        var skipButton = new Entity({
            name: 'skipButton',
            position: new Vector2(0, 128),
            boundingBox: new Rectangle(-32, -16, 64, 32),
            components: [
                new Clickable({
                    onClick: function (data) {
                        if (!completed) {
                            completed = true;
                            onSkipped();
                            if (doAd) {
                                EventSystem.fire('GameAnalytics-addDesignEvent', {
                                    eventId: "ads:rewardedRevive",
                                    value: 0
                                });
                            }
                            hide();
                        }
                    }
                }),
                new Text({
                    name: "continueSkip",
                    fontSettings: Utils.getTextStyle('continueSkip'),
                    text: Localization.getText('skip'),
                    maxWidth: undefined,
                    maxHeight: undefined
                })
            ]
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.screens,
            name: 'reviveScreen',
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.5),
            updateWhenPaused: 0,
            float: true,
            components: [
                new Fill({
                    dimension: new Rectangle(viewport.width * -0.5, viewport.height * -0.5, viewport.width, viewport.height),
                    color: [0, 0, 0, 0.5]
                }),
                continueText,
                timerButton
            ]
        });

        var buttonsToAdd = [];
        if (doPay) {
            buttonsToAdd.push(payButton);
        }
        if (doAd) {
            buttonsToAdd.push(adButton);
        }


        Utils.forEach(buttonsToAdd, function (button, i, l, breakLoop) {
            entity.attach(button);
            button.position.y = 32;
            if (buttonsToAdd.length > 1) {
                button.position.y += (buttonsToAdd.length - 1) * -0.5 * 32;
                button.position.y += (i / (buttonsToAdd.length - 1)) * 32;
            }
            var preScale = button.scale.clone();
            button.scale = new Vector2(0.001, 0.001);
            new Tween({
                from: button.scale,
                to: preScale,
                in: 15,
                delay: 20 + (i * 5),
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    button.scale = v;
                }
            });
        });

        new Tween({ in: 90,
            onComplete: function () {
                entity.attach(skipButton);
                new Tween({
                    from: 0,
                    to: 1,
                    in: 20,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        skipButton.alpha = v;
                    }
                });
            }
        });
        timerButton.scale = new Vector2(0.001, 0.001);
        new Tween({
            from: 0,
            to: 1,
            in: 15,
            ease: 'linear',
            onUpdate: function (v, t) {
                entity.alpha = v;
            },
            onComplete: function () {
                new Tween({
                    from: timerButton.scale,
                    to: new Vector2(1, 1),
                    in: 15,
                    ease: 'easeOutBack',
                    onUpdate: function (v, t) {
                        timerButton.scale = v;
                    }
                });
            }
        });
        Bento.objects.attach(entity);
        return entity;
    };
});