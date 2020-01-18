/**
 * Module description
 * @moduleName SuperBonusScreen
 * @snippet SuperBonusScreen.snippet
SuperBonusScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/superbonusscreen', [
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
    'globals',
    'modules/skinmanager',
    'modules/savemanager',
    'components/mask',
    'components/gamecounter',
    'entities/particle',
    'modules/localization'
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
    Globals,
    SkinManager,
    SaveManager,
    Mask,
    GameCounter,
    Particle,
    Localization
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);

        // --- VARS ---
        var supersOpened = SaveManager.load('supersOpened');
        var firstChest = (supersOpened === 0);

        var wheelSlowing = false;
        var wheelPos = 0;
        var tickPos = 0;
        var wheelVelocity = 10;
        var wheelIconSpacing = 64;
        var wheelIcons = [];

        var camera = Bento.objects.get('camera');
        var closed = false;
        var onClose = settings.onClose || function () {};
        var potentialRewards = [{
            weight: 2,
            id: 'bean',
            text: Localization.getText('newBean'),
            renderEntity: new SpriteContainer({
                imageName: 'ui/bean',
                originRelative: new Vector2(0.5, 0.5),
                scale: Globals.pixelScaleUIV.scalarMultiply(0.8)
            })
        }, {
            weight: 1,
            id: '50c',
            text: Localization.getText('XCoins').replace('{COUNT}', '50'),
            renderEntity: new Entity({
                name: 'CoinEntity',
                components: [
                    new SpriteContainer({
                        imageName: 'ui/big_coin',
                        position: new Vector2(-14, 1),
                        originRelative: new Vector2(0.5, 0.5),
                        scale: Globals.pixelScaleUIV.scalarMultiply(0.3)
                    }),
                    new GameCounter({
                        imageName: "addcoincounter",
                        position: new Vector2(14, 10),
                        align: 'center',
                        value: '75',
                        scale: Globals.pixelScaleUIV.scalarMultiply(0.8)
                    })
                ]
            })
        }, {
            weight: 1,
            id: '100c',
            text: Localization.getText('XCoins').replace('{COUNT}', '100'),
            renderEntity: new Entity({
                name: '100CoinEntity',
                components: [
                    new SpriteContainer({
                        imageName: 'ui/big_coin',
                        position: new Vector2(-16, 1),
                        originRelative: new Vector2(0.5, 0.5),
                        scale: Globals.pixelScaleUIV.scalarMultiply(0.3)
                    }),
                    new GameCounter({
                        imageName: "addcoincounter",
                        position: new Vector2(13, 10),
                        align: 'center',
                        value: '100',
                        scale: Globals.pixelScaleUIV.scalarMultiply(0.8)
                    })
                ]
            })
        }, {
            weight: 1,
            id: '150c',
            text: Localization.getText('XCoins').replace('{COUNT}', '150'),
            renderEntity: new Entity({
                name: '150CoinEntity',
                components: [
                    new SpriteContainer({
                        imageName: 'ui/big_coin',
                        position: new Vector2(-16, 1),
                        originRelative: new Vector2(0.5, 0.5),
                        scale: Globals.pixelScaleUIV.scalarMultiply(0.3)
                    }),
                    new GameCounter({
                        imageName: "addcoincounter",
                        position: new Vector2(13, 10),
                        align: 'center',
                        value: '150',
                        scale: Globals.pixelScaleUIV.scalarMultiply(0.8)
                    })
                ]
            })
        }];
        if (SkinManager.getAllLockedPlantSkins().length === 0) {
            //remove the bean if we have no beans left to give
            potentialRewards.shift();
        }

        // --- FUNCTIONS ---
        // animate in the screen
        var open = function (onComplete) {
            // show background
            var preBackgroundScale = backboard.scale.clone();
            backboard.scale = new Vector2(0, 0);
            new Tween({
                from: backboard.scale.clone(),
                to: preBackgroundScale,
                in: 30,
                delay: 30,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    backboard.scale = v;
                }
            });
            // show background
            var preRibbonScale = ribbon.scale.clone();
            ribbon.scale = new Vector2(0, preRibbonScale.y);
            new Tween({
                from: ribbon.scale.clone(),
                to: preRibbonScale,
                in: 30,
                delay: 50,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    ribbon.scale = v;
                }
            });
            // show background
            var getChestButtonScale = getChestButton.scale.clone();
            getChestButton.scale = new Vector2(0, 0);
            new Tween({
                from: new Vector2(0, 0),
                to: getChestButtonScale,
                in: 30,
                delay: 50,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    getChestButton.scale = v;
                }
            });
            //spin
            new Tween({
                from: chestSprite.rotation,
                to: Math.PI * 4,
                ease: 'easeOutExpo',
                in: 60,
                onUpdate: function (v, t) {
                    chestSprite.rotation = v;
                }
            });
            //grow
            new Tween({
                from: chestSprite.scale,
                to: Globals.pixelScaleUIV.clone().scalarMultiply(1.5),
                ease: 'easeOutQuad',
                in: 60,
                onUpdate: function (v, t) {
                    chestSprite.scale = v;
                }
            });
            //move X
            new Tween({
                from: chestSprite.position.x,
                to: backboard.position.x,
                ease: 'easeOutExpo',
                in: 60,
                onUpdate: function (v, t) {
                    chestSprite.position.x = v;
                }
            });
            // move Y - prepare to drop
            Bento.audio.playSound('sfx_chestlaunch');
            new Tween({
                from: chestSprite.position.y,
                to: viewMid.y - 160,
                ease: 'easeOutExpo',
                in: 40,
                onUpdate: function (v, t) {
                    chestSprite.position.y = v;
                },
                onComplete: function () {
                    chestSprite.sprite.setAnimation('bounce');

                    // move Y - drop
                    new Tween({
                        from: chestSprite.position.y,
                        to: backboard.position.y - 80,
                        ease: 'easeInExpo',
                        in: 30,
                        onUpdate: function (v, t) {
                            chestSprite.position.y = v;
                        },
                        onComplete: function () {
                            // land - animations
                            Bento.audio.playSound('sfx_chestthud');
                            camera.shake(100);
                            chestSprite.sprite.setAnimation('closed');
                            new Tween({ in: 2,
                                onComplete: function () {
                                    chestSprite.sprite.setAnimation('bounce');
                                    new Tween({ in: 2,
                                        onComplete: function () {
                                            chestSprite.sprite.setAnimation('closed');
                                        }
                                    });
                                }
                            });
                            // land squish
                            var chestScale = chestSprite.scale.y;
                            var chestPos = chestSprite.position.y;
                            new Tween({
                                from: 0.1,
                                to: 0,
                                in: 100,
                                decay: 5,
                                oscilations: 9,
                                ease: 'easeOutElastic',
                                onUpdate: function (v, t) {
                                    chestSprite.scale.x = chestScale + v;
                                    chestSprite.position.y = chestPos + v * 30;
                                    chestSprite.scale.y = chestScale - v;
                                },
                                onComplete: function () {
                                    if (onComplete) {
                                        onComplete();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        };

        // animate out the screen
        var close = function () {
            if (closed) {
                return;
            }
            onClose();
            new Tween({
                from: 1,
                to: 0.001,
                in: 20,
                ease: 'easeInQuint',
                onUpdate: function (v, t) {
                    entity.scale = new Vector2(v, v);
                    entity.position.x = viewport.width * Math.abs(v - 1) / 2;
                    entity.position.y = viewport.height * Math.abs(v - 1) / 2;
                }
            });
        };

        // open the chest animation
        var openChest = function (onComplete) {
            // fire callback
            new Tween({ in: 50,
                onComplete: function () {
                    if (onComplete) {
                        onComplete();
                    }
                }
            });

            // rapidly shake
            new Tween({
                from: 0,
                to: 1,
                in: 70,
                delay: 0,
                ease: 'easeInQuad',
                onUpdate: function (v, t) {
                    chestSprite.rotation = Math.sin(v * 50) * 0.05;
                },
                onComplete: function () {
                    // burst open
                    camera.shake(100);
                    chestSprite.sprite.setAnimation('opening');
                    var chestScale = chestSprite.scale.y;
                    var chestPos = chestSprite.position.y;
                    new Tween({
                        from: 0.1,
                        to: 0,
                        in: 50,
                        decay: 5,
                        oscilations: 5,
                        ease: 'easeOutElastic',
                        onUpdate: function (v, t) {
                            chestSprite.scale.x = chestScale - v;
                            chestSprite.position.y = chestPos - v * 40;
                            chestSprite.scale.y = chestScale + v * 2;
                        }
                    });
                }
            });
            Bento.audio.playSound('sfx_coinburst');
        };

        // pick reward
        var pickReward = function () {
            var reward;
            var pickFromPotentialRewards = function (chestArray) {
                var totalWeight = 0;
                var i;
                for (i = 0; i < chestArray.length; i++) {
                    totalWeight += chestArray[i].weight;
                }
                var random = Math.random() * totalWeight;
                for (i = 0; i < chestArray.length; i++) {
                    if (random < chestArray[i].weight) {
                        return chestArray[i];
                    }
                    random -= chestArray[i].weight;
                }
                return false;
            };
            if (firstChest) {
                //force bean
                reward = potentialRewards[0];
            } else {
                reward = pickFromPotentialRewards(potentialRewards);
            }
            return reward;
        };

        // give the player a designated amount of coins
        var collectCoins = function (numberOfCoins) {
            Utils.giveCoins(numberOfCoins);
            EventSystem.fire('GameAnalytics-addResourceEvent', {
                flowType: 1,
                currency: 'coins',
                amount: numberOfCoins,
                itemType: "ads",
                itemId: "superBonus"
            });
            for (var i = 0; i < Math.min(numberOfCoins, 30); i++) {
                Bento.attach(new Particle({
                    spriteSheet: 'coin',
                    position: chestSprite.position.clone().add(new Vector2(Utils.getRandomRangeFloat(-16, 16), Utils.getRandomRangeFloat(-8, 8))),
                    scale: Globals.pixelScaleV,
                    rotation: Utils.getRandomRangeFloat(-1, 1),
                    rotationRate: Utils.getRandomRangeFloat(-0.1, 0.1),
                    velocity: new Vector2(Utils.getRandomRangeFloat(-2, 2), Utils.getRandomRangeFloat(-5, 0)),
                    acceleration: new Vector2(0, 0.1),
                    removeAfterTime: 300,
                    dontAttach: true,
                    float: true,
                    z: Globals.layers.superbonus + 0.1
                }));
            }
            for (var i = 0; i < 15; i++) {
                Bento.attach(new Particle({
                    imageName: 'sparkle',
                    position: chestSprite.position.clone().add(new Vector2(Utils.getRandomRangeFloat(-16, 16), Utils.getRandomRangeFloat(-8, 8))),
                    scale: Globals.pixelScaleV,
                    rotation: Utils.getRandomRangeFloat(-2, 2),
                    velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-3, 0)),
                    acceleration: new Vector2(0, 0.025),
                    removeAfterTime: 100,
                    removeEffect: 'scale',
                    dontAttach: true,
                    float: true,
                    z: Globals.layers.superbonus + 0.1
                }));
            }
        };

        var collectBean = function () {
            var beanSprite = new Entity({
                name: 'beanSprite',
                position: new Vector2(0, 0),
                components: [
                    new SpriteContainer({
                        imageName: 'ui/bean',
                        originRelative: new Vector2(0.5, 0.5),
                        scale: Globals.pixelScaleUIV.scalarMultiply(4)
                    })
                ]
            });
            var beanText = new Text({
                position: new Vector2(0, -32),
                scale: new Vector2(5, 5),
                maxWidth: 128,
                text: Localization.getText('newBean'),
                fontSettings: Utils.getTextStyle('newBean'),
                fontSize: 12,
                fontColor: '#fbffbe',
                strokeStyle: '#3352be',
                lineWidth: 1,
                align: 'center',
                linebreaks: false,
                textBaseline: 'middle',
                pixelStroke: true
            });
            new Tween({
                from: beanSprite.position.y,
                to: beanSprite.position.y - 128,
                in: 60,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    beanSprite.position.y = v;
                }
            });
            new Tween({
                from: 0,
                to: 1,
                in: 50,
                decay: 5,
                oscilations: 5,
                ease: 'easeOutElastic',
                onUpdate: function (v, t) {
                    beanSprite.scale.x = v;
                    beanSprite.scale.y = v;
                }
            });
            chestSprite.attach(beanSprite);
            new Tween({
                from: 0,
                to: 5,
                in: 50,
                decay: 3,
                oscilations: 5,
                ease: 'easeOutElastic',
                onUpdate: function (v, t) {
                    beanText.scale.x = v;
                    beanText.scale.y = v;
                }
            });
            chestSprite.attach(beanText);

            // particles
            for (var i = 0; i < 15; i++) {
                Bento.attach(new Particle({
                    imageName: 'sparkle',
                    position: chestSprite.position.clone().add(new Vector2(Utils.getRandomRangeFloat(-16, 16), Utils.getRandomRangeFloat(-8, 8))),
                    scale: Globals.pixelScaleV,
                    rotation: Utils.getRandomRangeFloat(-2, 2),
                    velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-3, 0)),
                    acceleration: new Vector2(0, 0.025),
                    removeAfterTime: 100,
                    removeEffect: 'scale',
                    dontAttach: true,
                    float: true,
                    z: Globals.layers.superbonus + 0.1
                }));
            }
        };

        // give the player their required rewards
        var collectReward = function (reward) {
            switch (reward.id) {
            case '50c':
                new Tween({ in: 30,
                    onComplete: function () {
                        collectCoins(50);
                    }
                });
                break;
            case '100c':
                new Tween({ in: 30,
                    onComplete: function () {
                        collectCoins(100);
                    }
                });
                break;
            case '150c':
                new Tween({ in: 30,
                    onComplete: function () {
                        collectCoins(150);
                    }
                });
                break;
            case 'bean':
                var potentialSkins = SkinManager.getAllLockedPlantSkins();
                SkinManager.makePlantSkinUnlockable(potentialSkins[0]);
                SaveManager.save('canShowPlantSelector', true);
                new Tween({ in: 30,
                    onComplete: function () {
                        collectBean();
                    }
                });
                break;
            }

            // make and attach a close button
            var yesButton = new ClickButton({
                name: 'yesButton',
                sfx: 'sfx_clickbutton',
                imageName: 'ui/greenbutton',
                frameCountX: 1,
                frameCountY: 3,
                position: new Vector2(0, 88),
                scale: Globals.pixelScaleUIV.scalarMultiply(1.33),
                updateWhenPaused: 0,
                sort: true,
                onClick: close,
            }).attach(new SpriteContainer({
                imageName: 'ui/icons/tick',
                originRelative: new Vector2(0.5, 0.5),
                scale: new Vector2(1.25, 1.25)
            }));

            //scale in
            new Tween({
                from: new Vector2(0, 0),
                to: yesButton.scale.clone(),
                in: 30,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    yesButton.scale = v;
                }
            });

            backboard.attach(yesButton);
        };

        // create all of hte icons for the rewards on the wheel
        var makeWheelIcons = function () {
            var makeWheelIcon = function (i, reward) {
                var totalIndex = potentialRewards.length;
                var thisIndex = (i + 1);
                var thisIcon = new Entity({
                    name: reward.id + '-icon',
                    position: new Vector2(0, (-totalIndex + thisIndex) * wheelIconSpacing),
                    components: [
                        reward.renderEntity || new Entity({
                            name: 'blank'
                        }), {
                            name: "iconBehaviour",
                            update: function (data) {
                                var p = this.parent;
                                p.position.y += wheelVelocity;
                                if (p.position.y >= wheelIconSpacing) {
                                    p.position.y += totalIndex * -wheelIconSpacing;
                                }
                            }
                        }
                    ]
                }).extend({
                    index: thisIndex,
                    rewardID: reward.id
                });
                wheelAnchor.attach(thisIcon);
                wheelIcons.push(thisIcon);
            };
            Utils.forEach(potentialRewards, function (thisReward, i, l, breakLoop) {
                makeWheelIcon(i, thisReward);
            });
            Mask.applyToContainer(wheelAnchor, new Rectangle(-36, -32, 72, 64));
        };

        // calculate the deceleration speed to stop on a specific reard (faking a roulette)
        var stopWheelOnReward = function (reward, onComplete) {
            var totalIndex = potentialRewards.length;
            //get the actual icon
            var wheelIcon;
            Utils.forEach(wheelIcons, function (thisIcon, i, l, breakLoop) {
                if (thisIcon.rewardID === reward.id) {
                    wheelIcon = thisIcon;
                    breakLoop();
                }
            });
            //if we have an actual Icon
            if (wheelIcon) {
                //get the total distance to travel
                var distance = (totalIndex * wheelIconSpacing * 3) + ((totalIndex - wheelIcon.index) * wheelIconSpacing) - wheelPos;
                //calculate deceleration; a = (-v^2)/2*s
                var deceleration = (-(wheelVelocity * wheelVelocity) / (2 * distance));
                //slow the wheel
                var timeToStop = -wheelVelocity / deceleration;
                new Tween({ in: timeToStop,
                    ignoreGameSpeed: true,
                    onUpdate: function () {
                        wheelVelocity += deceleration;
                    },
                    onComplete: function () {
                        //due to floating point inaccuracies we must still manually align the icon after deceleration (gross!!!!)
                        wheelVelocity = 0;
                        Bento.audio.playSound('sfx_wheelsuccess');
                        new Tween({
                            from: wheelIcon.position.y,
                            to: Math.round(wheelIcon.position.y / wheelIconSpacing) * wheelIconSpacing,
                            in: 30,
                            ease: 'easeInOutQuad',
                            onUpdate: function (v, t) {
                                wheelIcon.position.y = v;
                            }
                        });
                        if (onComplete) {
                            onComplete();
                        }
                    }
                });
            }
        };

        // do the process for stopping the wheel
        var doWheel = function () {
            //picka a reward
            var thisReward = pickReward();

            //start getting a reward
            stopWheelOnReward(thisReward, function () {
                openChest(function () {
                    collectReward(thisReward);
                });
            });

            // hide get Button
            new Tween({
                from: getChestButton.scale,
                to: new Vector2(0.0001, 0.0001),
                in: 30,
                ease: 'easeInBack',
                onUpdate: function (v, t) {
                    getChestButton.scale = v;
                },
                onComplete: function () {
                    getChestButton.removeSelf();
                }
            });

            // move down the ribbon
            new Tween({
                from: chestSprite.position.y,
                to: chestSprite.position.y + 4,
                in: 60,
                delay: 30,
                ease: 'easeInOutBack',
                onUpdate: function (v, t) {
                    chestSprite.position.y = v;
                }
            });

            // move down the ribbon
            new Tween({
                from: ribbon.position.y,
                to: ribbon.position.y + 24,
                in: 60,
                delay: 20,
                ease: 'easeInOutBack',
                onUpdate: function (v, t) {
                    ribbon.position.y = v;
                }
            });

            // move down the wheel
            new Tween({
                from: wheel.position.y,
                to: wheel.position.y + 24,
                in: 60,
                delay: 10,
                ease: 'easeInOutBack',
                onUpdate: function (v, t) {
                    wheel.position.y = v;
                }
            });
        };

        // --- COMPONENTS ---
        var wheelBackground = new SpriteContainer({
            imageName: 'ui/chest-spinner',
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV.clone()
        });
        var wheelAnchor = new Entity({
            name: 'wheelAnchor'
        });
        var wheelBehaviour = {
            name: "wheelBehaviour",
            update: function () {
                var totalIndex = potentialRewards.length;
                wheelPos += wheelVelocity;
                if (wheelPos >= wheelIconSpacing) {
                    wheelPos += totalIndex * -wheelIconSpacing;
                }
                tickPos += wheelVelocity;
                if (tickPos >= wheelIconSpacing) {
                    Bento.audio.stopSound('sfx_wheeltick');
                    Bento.audio.playSound('sfx_wheeltick');
                    tickPos -= wheelIconSpacing;
                }
            },
            draw: function (data) {
                Utils.forEach(wheelIcons, function (thisIcon, i, l, breakLoop) {
                    if (Math.abs(wheelVelocity) > 0.25) {
                        thisIcon.alpha = 0.33;
                        thisIcon.position.y -= wheelVelocity * 1;
                        thisIcon.draw(data);
                        thisIcon.position.y += wheelVelocity * 0.5;
                        thisIcon.draw(data);
                        thisIcon.position.y += wheelVelocity * 0.5;
                        thisIcon.alpha = 1;
                    }
                });
            }
        };
        var wheel = new Entity({
            name: 'wheel',
            position: new Vector2(0, 8),
            components: [
                wheelBackground,
                wheelBehaviour,
                wheelAnchor

            ]
        });
        makeWheelIcons();
        var backboard = new Entity({
            name: 'backboard',
            position: viewMid.clone().add(new Vector2(0, 16)),
            components: [
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(new Vector2(1, 1))
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(new Vector2(-1, 1))
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(new Vector2(-1, -1))
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(new Vector2(1, -1))
                }),
                wheel
            ]
        });
        var chestSprite = new SpriteContainer({
            name: 'chestSprite',
            spriteSheet: 'ui/big-chest',
            position: settings.chestPosition || viewMid.clone(),
            originRelative: new Vector2(0.5, 0.5),
            alpha: 1,
            scale: settings.chestScale || Globals.pixelScaleUIV.clone(),
            rotation: 0
        });
        var ribbon = new Entity({
            name: 'ribbon',
            position: backboard.position.clone().add(new Vector2(0, -48)),
            components: [
                new SpriteContainer({
                    imageName: 'ui/ribbon',
                    originRelative: new Vector2(0.5, 0.3),
                    position: new Vector2(0, 0),
                    scale: Globals.pixelScaleUIV.clone().multiply(new Vector2(1, -1))
                }),
                new Text({
                    position: new Vector2(0, 2),
                    maxWidth: 150,
                    text: Localization.getText('superBonus'),
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    fontSize: 18,
                    fontColor: '#fbffbe',
                    align: 'center',
                    linebreaks: false,
                    textBaseline: 'middle'
                })
            ]
        });
        var getChestButton = new ClickButton({
            name: 'getChestButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            alpha: 1,
            position: viewMid.clone().add(new Vector2(0, 88)),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.6),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                if (!wheelSlowing) {
                    doWheel();
                    wheelSlowing = true;
                }
            },
            components: [
                new Text({
                    position: new Vector2(0, 8),
                    scale: new Vector2(1, 1).scalarMultiply(1 / Globals.pixelScaleUI),
                    maxWidth: 96,
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    text: Localization.getText('openChest'),
                    fontSize: 16,
                    fontColor: '#fbffbe',
                    align: 'center',
                    textBaseline: 'middle',
                    linebreaks: true
                })
            ]
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.superbonus,
            name: 'superBonusScreen',
            position: new Vector2(0, 0),
            float: true,
            components: [
                backboard,
                chestSprite,
                ribbon,
                getChestButton
            ]
        });
        Bento.objects.attach(entity);
        open();

        return entity;
    };
});