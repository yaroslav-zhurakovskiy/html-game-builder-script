/**
 * Module description
 * @moduleName PotAdDialog
 * @snippet PotAdDialog.snippet
PotAdDialog({
    potSkin: ''
})
 */
bento.define('ui/potaddialog', [
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
    'globals',
    'ui/dialog',
    'components/spritecontainer',
    'entities/particle',
    'modules/localization',
    'ui/confetti',
    'modules/ads',
    'modules/skinmanager',
    'modules/savemanager'
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
    Globals,
    Dialog,
    SpriteContainer,
    Particle,
    Localization,
    Confetti,
    Ads,
    SkinManager,
    SaveManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var complete = false;
        var nextPotSkin = settings.potSkin || 'default';
        var onComplete = settings.onComplete || function () {};
        var doAnother = Utils.isDefined(settings.doAnother) ? settings.doAnother : true;

        // --- FUNCTIONS ---
        var subtleMovement = function () {
            if (dialog.attached) {
                new Tween({
                    from: 0,
                    to: Math.PI * 2,
                    in: 300,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        bloomHard.scale.x += Math.sin(v * 2) * 0.00005;
                        bloomHard.scale.y += Math.sin(v * 2) * 0.00005;
                    },
                    onComplete: subtleMovement
                });
            }
        };
        var shakeAnimation = function () {
            // reset everything
            boxSprite.scale = new Vector2(0.5, 0.5);
            boxSprite.visible = true;
            potSprite.visible = false;
            potName.visible = false;
            bloomHalo.scale = new Vector2(0, 0);
            bloomHard.scale = new Vector2(0, 0);
            if (okayButton.attached) {
                mainRoot.remove(okayButton);
            }
            if (anotherButton.attached) {
                mainRoot.remove(anotherButton);
            }

            Bento.audio.playSound('sfx_unlock_up');
            new Tween({ in: 20,
                onComplete: function () {
                    Bento.audio.playSound('sfx_unlock_shake');
                }
            });
            if (adButton.attached) {
                new Tween({
                    from: adButton.scale,
                    to: new Vector2(0, 0),
                    in: 30,
                    ease: 'easeInBack',
                    onUpdate: function (v, t) {
                        adButton.scale = v;
                    },
                    onComplete: function () {
                        adButton.removeSelf();
                    }
                });
            }
            if (closeButton.attached) {
                new Tween({
                    from: closeButton.scale,
                    to: new Vector2(0, 0),
                    in: 15,
                    ease: 'easeInBack',
                    onUpdate: function (v, t) {
                        closeButton.scale = v;
                    },
                    onComplete: function () {
                        closeButton.removeSelf();
                    }
                });
            }

            new Tween({
                from: 0,
                to: 1,
                in: 15,
                delay: 105,
                ease: 'easeInBack',
                onUpdate: function (v, t) {
                    boxSprite.scale = new Vector2(0.5, 0.5).scalarMultiply(1 + (v * 0.5));
                }
            });
            new Tween({
                from: 0,
                to: 1,
                in: 120,
                ease: 'easeInQuad',
                onUpdate: function (v, t) {
                    boxSprite.rotation = Math.sin(v * Math.PI * 25) * 0.2;
                },
                onComplete: function () {
                    boxSprite.visible = false;
                    burstAnimation();
                }
            });
        };
        var burstAnimation = function () {
            Bento.audio.playSound('sfx_unlock_burst');
            // show skin
            potSprite.visible = true;
            potName.visible = true;
            new Tween({
                from: 0,
                to: 1,
                in: 20,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    potSprite.alpha = Math.min(v, 1);
                    potSprite.scale = new Vector2(v, v);
                }
            });

            //particles
            new Tween({ in: 5,
                onComplete: function (v, t) {
                    for (var i = 0; i < 15; i++) {
                        mainRoot.attach(new Particle({
                            imageName: 'sparkle',
                            position: new Vector2(0, 0),
                            alpha: 1,
                            scale: Globals.pixelScaleV.scalarMultiply(3),
                            rotation: Utils.getRandomRangeFloat(0, Math.PI * 2),
                            rotationRate: 0,
                            velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-3, 3)),
                            acceleration: new Vector2(0, 0.025),
                            friction: 1,
                            removeAfterTime: 100,
                            removeEffect: 'scale',
                            dontAttach: true,
                            z: Globals.layers.modals + 0.1
                        }));
                    }
                }
            });
            dialog.attach(new Confetti({
                particleScale: 0.1
            }));

            // bloom halo burst outwards
            new Tween({
                from: 0,
                to: 1,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bloomHalo.scale.x = bloomHalo.scale.y = 0.25 * v;
                    bloomHalo.alpha = (1 - v) * 0.6;
                },
            });

            // bloom grow and shrink
            new Tween({
                from: 0,
                to: 0.185,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bloomHard.scale.x = v;
                    bloomHard.scale.y = v;
                },
                onComplete: function () {
                    new Tween({
                        from: 0.185,
                        to: 0.15,
                        in: 60,
                        ease: 'easeInOutCubic',
                        onUpdate: function (v, t) {
                            bloomHard.scale.x = v;
                            bloomHard.scale.y = v;
                        },
                        onComplete: function () {
                            subtleMovement();
                            mainRoot.attach(okayButton);
                            new Tween({
                                from: new Vector2(0.01, 0.01),
                                to: okayButton.scale.clone(),
                                in: 15,
                                ease: 'easeOutBack',
                                onUpdate: function (v, t) {
                                    okayButton.scale = v;
                                }
                            });
                            if (doAnother && Ads.canShowRewarded() && nextPotSkin) {
                                complete = false;
                                mainRoot.attach(anotherButton);
                                new Tween({
                                    from: new Vector2(0.01, 0.01),
                                    to: anotherButton.scale.clone(),
                                    in: 15,
                                    delay: 2,
                                    ease: 'easeOutBack',
                                    onUpdate: function (v, t) {
                                        anotherButton.scale = v;
                                    }
                                });
                                anotherButton.scale = new Vector2(0.01, 0.01);
                            }
                        }
                    });
                }
            });
        };

        // --- COMPONENTS ---
        var boxSprite = new SpriteContainer({
            spriteSheet: 'boxes/' + nextPotSkin,
            position: new Vector2(0, 0),
            alpha: 1,
            scale: new Vector2(0.5, 0.5),
            rotation: 0
        });
        var potSpriteSprite = new SpriteContainer({
            spriteSheet: 'potskins/' + nextPotSkin,
            position: new Vector2(0, -36),
            alpha: 1,
            scale: new Vector2(0.66, 0.66),
            rotation: 0
        });
        var potSprite = new Entity({
            name: 'potSprite',
            position: new Vector2(0, 0),
            visible: false,
            components: [
                potSpriteSprite
            ]
        });
        var potNameText = new Text({
            fontSettings: Utils.getTextStyle('potDialogName'),
            text: "'" + Localization.getText(nextPotSkin + '-pot') + "'",
            maxWidth: undefined,
            maxHeight: undefined
        });
        var potName = new Entity({
            name: 'potName',
            position: new Vector2(0, 48),
            visible: false,
            components: [
                potNameText
            ]
        });
        var bloomHard = new SpriteContainer({
            imageName: 'ui/fx/bloom-hard',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0, 0)
        });
        var bloomHalo = new SpriteContainer({
            imageName: 'ui/fx/bloom-halo',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0, 0),
            alpha: 0.6
        });

        var adButton = new ClickButton({
            name: 'adButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 64),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.6),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                var unlockSkin = function () {
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "potsUnlocked:" + nextPotSkin
                    });
                    SkinManager.makePotSkinUnlocked(nextPotSkin);
                    SkinManager.setCurrentPotSkin(nextPotSkin);
                    shakeAnimation();
                    nextPotSkin = SkinManager.getNextAdPot();
                };
                if (!complete) {
                    if (Utils.isDev()) {
                        window.alert("This is a Rewarded Ad!");
                        Bento.input.resetPointers();
                        SaveManager.save('levelsSinceSkinAd', 0);
                        Globals.attemptsSinceAd = 0;
                        unlockSkin();
                    } else {
                        complete = true;
                        Ads.showRewarded(function () {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedSkinUnlockPopup",
                                value: 1
                            });
                            SaveManager.save('levelsSinceSkinAd', 0);
                            Globals.attemptsSinceAd = 0;
                            unlockSkin();
                            complete = false;
                        }, function (e) {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedSkinUnlockPopup",
                                value: 0
                            });
                            complete = false;
                        }, "SkinUnlockPopup");
                    }
                }
            },
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/vid2',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.625, 0.625)
        }));
        var closeButton = new ClickButton({
            name: 'closeButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(72, -64),
            scale: new Vector2(Globals.pixelScaleUI * 0.5, Globals.pixelScaleUI * 1),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                if (!complete) {
                    complete = true;
                }
                EventSystem.fire('GameAnalytics-addDesignEvent', {
                    eventId: "ads:rewardedSkinUnlockPopup",
                    value: 0
                });
                dialog.close();
                onComplete();
            },
        });
        closeButton.attach(new SpriteContainer({
            imageName: 'ui/icons/close',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(1 / closeButton.scale.x, 1 / closeButton.scale.y).multiply(Globals.pixelScaleUIV).scalarMultiply(0.8)
        }));

        var okayButton = new ClickButton({
            name: 'okayButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 80),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.4),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                if (doAnother && Ads.canShowRewarded() && nextPotSkin) {
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "ads:rewardedSkinUnlockPopupDoAnother",
                        value: 0
                    });
                }
                if (!complete) {
                    complete = true;
                }
                dialog.close();
            },
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/tick',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.625, 0.625)
        }));

        var anotherButton = new ClickButton({
            name: 'anotherButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 120),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 1)),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                var unlockSkin = function () {
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "potsUnlocked:" + nextPotSkin
                    });
                    SkinManager.makePotSkinUnlocked(nextPotSkin);
                    SkinManager.setCurrentPotSkin(nextPotSkin);

                    //update visuals
                    potSpriteSprite.sprite.setSpriteSheet('potskins/' + nextPotSkin);
                    boxSprite.sprite.setSpriteSheet('boxes/' + nextPotSkin);
                    potNameText.setText("'" + Localization.getText(nextPotSkin + '-pot') + "'");

                    shakeAnimation();
                    nextPotSkin = SkinManager.getNextAdPot();
                };
                if (!complete) {
                    if (Utils.isDev()) {
                        window.alert("This is a Rewarded Ad!");
                        Bento.input.resetPointers();
                        SaveManager.save('levelsSinceSkinAd', 0);
                        Globals.attemptsSinceAd = 0;
                        unlockSkin();
                    } else {
                        complete = true;
                        Ads.showRewarded(function () {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedSkinUnlockPopupDoAnother",
                                value: 1
                            });
                            SaveManager.save('levelsSinceSkinAd', 0);
                            Globals.attemptsSinceAd = 0;
                            unlockSkin();
                        }, function (e) {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedSkinUnlockPopupDoAnother",
                                value: 0
                            });
                        }, "SkinUnlockPopupDoAnother");
                    }
                }
            },
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/vid2',
            position: new Vector2(110, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.3, 0.3).divide(new Vector2(0.7, 0.5)),
        })).attach(new Text({
            fontSettings: Utils.getTextStyle('dialogTitle'),
            position: new Vector2(-60, 0),
            scale: new Vector2(0.5 / Globals.pixelScaleUI, 0.5 / Globals.pixelScaleUI).divide(new Vector2(0.7, 0.5)),
            text: Localization.getText('onemore'),
            maxWidth: 48,
            maxHeight: 12
        }));

        var mainRoot = new Entity({
            name: 'mainRoot',
            position: new Vector2(0, -12),
            components: [
                bloomHard,
                bloomHalo,
                boxSprite,
                potSprite,
                potName,
                adButton,
                closeButton
            ]
        });

        // --- ENTITY ---
        var dialog = new Dialog({
            titleText: Localization.getText('freePot'),
            type: '',
            onComplete: onComplete,
            components: [mainRoot],
            attach: true
        });

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: adButton.scale.clone(),
            in: 15,
            delay: 30,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                adButton.scale = v;
            }
        });
        adButton.scale = new Vector2(0.001, 0.001);

        new Tween({
            from: 0,
            to: 1,
            in: 90,
            ease: 'easeOutExpo',
            delay: 90,
            onUpdate: function (v, t) {
                closeButton.alpha = v;
            }
        });
        closeButton.alpha = 0;

        return dialog;
    };
});