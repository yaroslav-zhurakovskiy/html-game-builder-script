/**
 * Module description
 * @moduleName SuperBeanDialog
 * @snippet SuperBeanDialog.snippet
BeanDialog({
    onComplete: function () {}
})
 */
bento.define('ui/superbeandialog', [
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
    'modules/localization',
    'ui/confetti',
    'modules/ads',
    'modules/vipmanager',
    'modules/skinmanager',
    'modules/savemanager',
    'entities/particle'
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
    Localization,
    Confetti,
    Ads,
    VipManager,
    SkinManager,
    SaveManager,
    Particle
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var completed = false;
        var isVip = VipManager.isVip();
        var onComplete = settings.onComplete || function () {};
        var skin = SkinManager.getAllLockedPlantSkins()[0];
        var canPlant = SkinManager.getAllUnlockingPlantSkins().length < 4;
        var shocked = false;
        var free = (settings.free || false) || VipManager.isVip();

        // --- FUNCTIONS ---
        var burstAnimation = function () {
            // show skin
            mainRoot.attach(beanSprite);
            mainRoot.attach(tearSprite);

            new Tween({
                from: 0,
                to: 1,
                in: 30,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    beanSprite.alpha = Math.min(v, 1);
                    beanSprite.scale = new Vector2(v, v);
                }
            });

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
                to: 0.15,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bloomHard.scale.x = v;
                    bloomHard.scale.y = v;
                },
                onComplete: function () {
                    new Tween({
                        from: 0.15,
                        to: 0.125,
                        in: 60,
                        ease: 'easeInOutCubic',
                        onUpdate: function (v, t) {
                            bloomHard.scale.x = v;
                            bloomHard.scale.y = v;
                        },
                        onComplete: function () {
                            dialog.showButtons();
                        }
                    });
                }
            });
        };
        var discardBean = function () {
            // hide buttons
            new Tween({
                from: discardButton.scale.clone(),
                to: new Vector2(0, 0),
                in: 15,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    discardButton.scale = v;
                },
                onComplete: function () {
                    discardButton.removeSelf();
                }
            });
            new Tween({
                from: bonusButton.scale.clone(),
                to: new Vector2(0, 0),
                in: 15,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bonusButton.scale = v;
                },
                onComplete: function () {
                    bonusButton.removeSelf();
                }
            });

            // shake bean
            shocked = true;
            beanSpriteContainer.sprite.setCurrentSpeed(0);
            new Tween({
                from: 1,
                to: 0,
                in: 20,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    beanSprite.position = new Vector2(0, -16).add(new Vector2(v * 10, 0).rotateDegree(Utils.getRandomFloat(360)));
                }
            });
            new Tween({ in: 30,
                onComplete: function () {
                    new Tween({
                        from: 0,
                        to: 0.75,
                        in: 10,
                        ease: 'easeInQuad',
                        onUpdate: function (v, t) {
                            tearSprite.alpha = v;
                        }
                    });
                    new Tween({
                        from: new Vector2(0, 0),
                        to: Globals.pixelScaleUIV.scalarMultiply(2.5),
                        in: 10,
                        ease: 'easeInQuad',
                        onUpdate: function (v, t) {
                            tearSprite.scale = v;
                        }
                    });
                    new Tween({
                        from: 0.75,
                        to: 0,
                        in: 15,
                        delay: 45,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            tearSprite.alpha = v;
                        }
                    });
                    new Tween({
                        from: tearSprite.position.y,
                        to: tearSprite.position.y + 32,
                        in: 60,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            tearSprite.position.y = v;
                        },
                        onComplete: function () {
                            new Tween({
                                from: beanSprite.scale.clone(),
                                to: new Vector2(0, 0),
                                in: 15,
                                ease: 'easeInQuad',
                                onUpdate: function (v, t) {
                                    beanSprite.scale = v;
                                },
                                onComplete: function () {
                                    for (var i = 5; i >= 0; i--) {
                                        mainRoot.attach(new Particle({
                                            spriteSheet: 'particles/dust',
                                            position: beanSprite.position.add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4))),
                                            alpha: 1,
                                            scale: Globals.pixelScaleV.scalarMultiply(1.5),
                                            rotation: Utils.getRandomRangeFloat(-2, 2),
                                            rotationRate: 0,
                                            velocity: new Vector2(Utils.getRandomRangeFloat(-0.1, 0.1), Utils.getRandomRangeFloat(-0.1, 0.1)),
                                            gravity: 0,
                                            friction: 1,
                                            removeAfterTime: 0,
                                            removeEffect: 'none',
                                            z: Globals.layers.effects,
                                            dontAttach: true
                                        }));
                                    }
                                }
                            });
                        }
                    });
                }
            });


            // hide bloom
            new Tween({
                from: 0.1,
                to: 0,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bloomHard.scale.x = v;
                    bloomHard.scale.y = v;
                },
            });

            new Tween({ in: 120,
                onComplete: function () {
                    dialog.close();
                    onComplete();
                }
            });
        };
        var giveBean = function () {
            SkinManager.makePlantSkinUnlockable(skin);
            if (canPlant) {
                SkinManager.startPlantSkinUnlocking(skin);
                Globals.doOpenPlants = true;
            }
            if (!free) {
                SaveManager.save('superProgress', 0);
            }

            // hide button
            new Tween({
                from: bonusButton.scale.clone(),
                to: new Vector2(0, 0),
                in: 15,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bonusButton.scale = v;
                },
                onComplete: function () {
                    bonusButton.removeSelf();
                }
            });
            new Tween({
                from: discardButton.scale.clone(),
                to: new Vector2(0, 0),
                in: 15,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    discardButton.scale = v;
                },
                onComplete: function () {
                    discardButton.removeSelf();
                }
            });

            // hide bloom
            new Tween({
                from: 0.1,
                to: 0,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bloomHard.scale.x = v;
                    bloomHard.scale.y = v;
                },
            });

            // move bean up
            new Tween({
                from: beanSprite.scale.clone(),
                to: new Vector2(1, 1),
                in: 25,
                ease: 'easeInOutBack',
                onUpdate: function (v, t) {
                    beanSprite.scale = v;
                }
            });

            // move dirt up
            new Tween({
                from: plantSprite.position.clone(),
                to: new Vector2(0, 40),
                in: 45,
                ease: 'easeInOutBack',
                onUpdate: function (v, t) {
                    plantSprite.position = v;
                }
            });
            new Tween({
                from: plantSprite.scale.clone(),
                to: Globals.pixelScaleUIV.scalarMultiply(1.25),
                in: 45,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    plantSprite.scale = v;
                }
            });

            new Tween({ in: 30,
                onComplete: function () {
                    // move bean up
                    new Tween({
                        from: beanSprite.position.clone(),
                        to: new Vector2(0, -64),
                        in: 15,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            beanSprite.position = v;
                        },
                        onComplete: function () {
                            // shrink bean into dirt
                            new Tween({
                                from: beanSprite.position.clone(),
                                to: new Vector2(0, 0),
                                in: 20,
                                ease: 'easeInQuad',
                                onUpdate: function (v, t) {
                                    beanSprite.position = v;
                                }
                            });
                            new Tween({
                                from: plantSprite.position.clone(),
                                to: new Vector2(0, 0),
                                in: 20,
                                ease: 'easeInQuad',
                                onUpdate: function (v, t) {
                                    plantSprite.position = v;
                                }
                            });
                            new Tween({
                                from: beanSprite.scale.clone(),
                                to: new Vector2(0.1, 0.1),
                                in: 15,
                                ease: 'easeInBack',
                                onUpdate: function (v, t) {
                                    beanSprite.scale = v;
                                }
                            });
                            new Tween({ in: 20,
                                onComplete: function () {
                                    // hide bean/plant bean
                                    beanSprite.visible = false;
                                    plantSprite.sprite.setup({
                                        imageName: 'ui/sprout',
                                        originRelative: new Vector2(0.5, 0.7)
                                    });

                                    // spring
                                    new Tween({
                                        from: Globals.pixelScaleUIV.multiply(new Vector2(2, 0.5)),
                                        to: Globals.pixelScaleUIV.multiply(new Vector2(1.5, 1.5)),
                                        in: 30,
                                        ease: 'easeOutBack',
                                        onUpdate: function (v, t) {
                                            plantSprite.scale = v;
                                        }
                                    });

                                    //move up
                                    new Tween({
                                        from: plantSprite.position.clone(),
                                        to: new Vector2(0, 0),
                                        in: 15,
                                        delay: 5,
                                        ease: 'easeOutQuad',
                                        onUpdate: function (v, t) {
                                            plantSprite.position = v;
                                        }
                                    });

                                    // burst effects
                                    new Tween({ in: 1,
                                        onComplete: function (v, t) {
                                            Bento.audio.playSound('sfx_unlock_burst');
                                            dialog.attach(new Confetti({
                                                particleScale: 0.1
                                            }));

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
                                                to: 0.18,
                                                in: 30,
                                                ease: 'easeOutQuad',
                                                onUpdate: function (v, t) {
                                                    bloomHard.scale.x = v;
                                                    bloomHard.scale.y = v;
                                                },
                                                onComplete: function () {
                                                    new Tween({
                                                        from: 0.18,
                                                        to: 0.15,
                                                        in: 60,
                                                        ease: 'easeInOutCubic',
                                                        onUpdate: function (v, t) {
                                                            bloomHard.scale.x = v;
                                                            bloomHard.scale.y = v;
                                                        },
                                                        onComplete: function () {
                                                            dialog.showButtons();
                                                        }
                                                    });
                                                }
                                            });

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
                                    new Tween({ in: 60,
                                        onComplete: function () {
                                            dialog.close();
                                            onComplete();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        };

        // --- COMPONENTS ---
        var ribbon = new SpriteContainer({
            imageName: 'ui/ribbon',
            originRelative: new Vector2(0.5, 0.25),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.clone().multiply(new Vector2(1, -1))
        });
        var titleBanner = new Entity({
            name: 'titleBanner',
            family: [''],
            position: new Vector2(0, -82),
            components: [
                ribbon,
                new Text({
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    position: new Vector2(0, -2),
                    text: Localization.getText('foundABean'),
                    maxWidth: 128,
                    maxHeight: 32
                })
            ]
        });
        var plantSprite = new SpriteContainer({
            imageName: 'ui/dirt',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 80),
            alpha: 1,
            scale: Globals.pixelScaleUIV.scalarMultiply(0.5)
        });
        var tearSprite = new SpriteContainer({
            imageName: 'ui/waterdrop',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(16, -8),
            alpha: 0,
            scale: Globals.pixelScaleUIV.scalarMultiply(2.5)
        });
        var bonusButton = new ClickButton({
            name: 'bonusButtonChest',
            alpha: 1,
            sfx: 'sfx_clickbutton',
            imageName: 'ui/bluebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 64),
            scale: Globals.pixelScaleUIV.clone().scalarMultiply(2),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                if (completed) {
                    return;
                }
                completed = true;
                bonusButton.setActive(false);
                if (!free) {
                    //Bonus Chest
                    if (Utils.isDev()) {
                        window.alert("This is a Rewarded Ad!");
                        Bento.input.resetPointers();
                        SaveManager.save('levelsSinceSkinAd', 0);
                        Globals.attemptsSinceAd = 0;
                        giveBean();
                    } else {
                        Ads.showRewarded(function () {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:superBonusAd",
                                value: 1
                            });
                            SaveManager.save('levelsSinceSkinAd', 0);
                            Globals.attemptsSinceAd = 0;
                            giveBean();
                        }, function (e) {
                            completed = false;
                            bonusButton.setActive(true);
                        }, "SuperBonus");

                    }
                } else {
                    SaveManager.save('levelsSinceSkinAd', 0);
                    Globals.attemptsSinceAd = 0;
                    giveBean();
                }
            },
            components: [
                new Text({
                    position: new Vector2(70, 8),
                    scale: new Vector2(0.5, 0.5).scalarMultiply(1 / Globals.pixelScaleUI),
                    maxWidth: 60,
                    text: Localization.getText('plantMe'),
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    fontSize: 14,
                    fontColor: '#fbffbe',
                    align: 'center',
                    textBaseline: 'middle',
                    linebreaks: true,
                    maxHeight: 14
                }),
                (free) ? {
                    name: 'blank'
                } : new SpriteContainer({
                    imageName: 'ui/icons/vid-plant',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-100, -12.5),
                    scale: new Vector2(0.5, 0.5)
                }),
                new SpriteContainer({
                    imageName: 'ui/sprout',
                    originRelative: new Vector2(0.5, 0.7),
                    position: (free) ? new Vector2(-80, 40) : new Vector2(-60, 55),
                    alpha: 1,
                    scale: (free) ? new Vector2(0.5, 0.5) : new Vector2(0.375, 0.375)
                })
            ]
        });
        var discardButton = new ClickButton({
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
                if (completed) {
                    return;
                }
                completed = true;
                discardBean();
            },
        });
        discardButton.attach(new SpriteContainer({
            imageName: 'ui/icons/discard',
            position: new Vector2(0, -32),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(1 / discardButton.scale.x, 1 / discardButton.scale.y).multiply(Globals.pixelScaleUIV).scalarMultiply(0.8)
        }));
        discardButton.attach(new Text({
            position: new Vector2(0, 48),
            scale: new Vector2(1 / discardButton.scale.x, 1 / discardButton.scale.y).scalarMultiply(0.5),
            maxWidth: 48,
            maxHeight: 12,
            text: Localization.getText('discard'),
            fontSettings: Utils.getTextStyle('dialogTitle'),
            fontSize: 10,
            fontColor: '#fbffbe',
            align: 'center',
            textBaseline: 'middle',
            linebreaks: true
        }));
        var beanSpriteContainer = new SpriteContainer({
            spriteSheet: 'beans/' + skin,
            position: new Vector2(0, 0),
            alpha: 1,
            scale: new Vector2(0.5, 0.5),
            rotation: 0
        }).attach({
            name: 'wobbleBehaviour',
            t: 0,
            update: function (data) {
                if (!shocked) {
                    this.t += data.speed;
                }
                var p = this.parent;
                p.rotation = (Math.sin(this.t * 0.03) * 0.2) - 0.1;
            }
        });
        var beanSprite = new Entity({
            name: 'beanSprite',
            position: new Vector2(0, -16),
            components: [
                beanSpriteContainer
            ]
        });
        var bloomHard = new SpriteContainer({
            imageName: 'ui/fx/bloom-hard',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, -16),
            scale: new Vector2(0, 0)
        });
        var bloomHalo = new SpriteContainer({
            imageName: 'ui/fx/bloom-halo',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, -16),
            scale: new Vector2(0, 0),
            alpha: 0.6
        });
        var mainRoot = new Entity({
            name: 'mainRoot',
            position: new Vector2(0, 0),
            components: [
                titleBanner,
                (free) ? {
                    name: 'blank'
                } : discardButton,
                bloomHard,
                bloomHalo,
                plantSprite,
                bonusButton
            ]
        });

        // --- ENTITY ---
        var dialog = new Dialog({
            type: 'none',
            onYes: function (thisDialog) {
                thisDialog.close();
            },
            components: [mainRoot],
            hidebuttons: true,
            attach: true,
            delay: 15,
            bgScale: new Vector2(1, 1)
        });
        Bento.audio.playSound('sfx_unlock_up');
        burstAnimation();

        new Tween({
            from: 0,
            to: 1,
            in: 90,
            ease: 'easeOutExpo',
            delay: 90,
            onUpdate: function (v, t) {
                discardButton.alpha = v;
            }
        });
        discardButton.alpha = 0;

        return dialog;
    };
});