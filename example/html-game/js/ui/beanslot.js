/**
 * A plant Skin for the locked/unlockable phase
 * @moduleName GrowSlot
 * @snippet GrowSlot.snippet
GrowSlot({})
 */
bento.define('ui/beanslot', [
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
    'modules/timemanager',
    'entities/particle',
    'ui/plantunlockeddialog',
    'modules/notifications',
    'modules/localization',
    'modules/savemanager',
    'ui/dialog',
    'components/radialbar',
    'color',
    'ui/shopdialog'
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
    TimeManager,
    Particle,
    PlantUnlockedDialog,
    Notifications,
    Localization,
    SaveManager,
    Dialog,
    RadialBar,
    Color,
    ShopDialog
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var skin = settings.skin || 'default';
        var index = settings.index || 0;
        var onStateChanged = settings.onStateChanged || function () {};
        var isScrolling = settings.isScrolling || function () {
            return false;
        };

        // --- VARS ---
        var skipGrowingPrice = SkinManager.getPlantSkipWaitPrice(skin);
        var currentState = '';
        var canInteract = true;

        // --- FUNCTIONS ---
        var scheduleNotifications = function () {
            // get this Id
            var thisID = SaveManager.load('notificationPlantReady');
            // cancel the old notification
            if (thisID != null) {
                Notifications.cancel(thisID);
                SaveManager.save('notificationPlantReady', null);
            }
            //get content
            var unlockingPlants = SkinManager.getAllUnlockingPlantSkins();
            var timeToWait = 0;
            Utils.forEach(unlockingPlants, function (thisSkin, i, l, breakLoop) {
                var thisDT = SkinManager.getPlantSkinWaterAfter(thisSkin) - TimeManager.getCurrentTime();
                if (thisDT > timeToWait) {
                    timeToWait = thisDT;
                }
            });
            //set the new notification
            Notifications.send({
                title: Localization.getText('title'),
                text: (unlockingPlants.length > 1) ? Localization.getText('notificationXPlantsReady').replace('{X}', unlockingPlants.length.toString()) : Localization.getText('notificationPlantReady'),
                deltaTime: timeToWait
            }, function (id) {
                SaveManager.save('notificationPlantReady', id);
            });
        };

        var askNotifications = function () {
            var dialog = new Dialog({
                name: 'notificationDialog',
                titleText: Localization.getText('notifications?'),
                bodyText: Localization.getText('notificationsAsk'),
                type: 'yesno',
                attach: false,
                onYes: function () {
                    Notifications.init(function (initialized) {
                        if (initialized) {
                            SaveManager.save('notificationsAllowed', true);
                            scheduleNotifications();
                        }
                    });
                    dialog.close();
                },
                onComplete: function () {
                    SaveManager.add('notificationsAsked', 1);
                }
            });
            if (SaveManager.load('notificationsAsked') > 0) {
                // already asked
                return;
            }
            Bento.objects.attach(dialog);
        };

        var doNotifications = function () {
            if (SkinManager.getAllUnlockedPlantSkins().length < 3) {
                return;
            }
            if (SaveManager.load('notificationsAllowed')) {
                scheduleNotifications();
            } else {
                askNotifications();
            }
        };

        // begin the unlocking process
        var startUnlocking = function () {
            if (canInteract) {
                canInteract = false;

                new Tween({
                    from: unlockableButton.scale,
                    to: new Vector2(0.0001, 0.0001),
                    in: 5,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        unlockableButton.scale = v;
                    }
                });
                new Tween({
                    from: unlockableBeanSprite.scale,
                    to: new Vector2(0.0001, 0.0001),
                    in: 45,
                    delay: 0,
                    applyOnDelay: 0,
                    ease: 'easeInOutBack',
                    onUpdate: function (v, t) {
                        unlockableBeanSprite.scale = v;
                    },
                    onComplete: function () {
                        //start unlocking
                        SkinManager.startPlantSkinUnlocking(skin);
                        currentState = 'unlocking';

                        // attach stuff
                        slot.remove(unlockableStuff);
                        slot.attach(unlockingStuff);

                        //stuff that needs to happen
                        updateTimer();
                        canInteract = true;

                        //animate in water screen
                        new Tween({
                            from: new Vector2(0.0001, 0.0001),
                            to: unlockingWaitingSproutSprite.scale.clone(),
                            in: 15,
                            ease: 'easeInOutBack',
                            onUpdate: function (v, t) {
                                unlockingWaitingSproutSprite.scale = v;
                                unlockingUnlockableSproutSprite.scale = v;
                            }
                        });
                    }
                });
            }
        };

        // go to the unlock screen
        var unlockPlant = function () {
            if (canInteract) {
                canInteract = false;
                new PlantUnlockedDialog({
                    plantSkin: skin,
                    onComplete: function () {
                        SkinManager.makePlantSkinUnlocked(skin);
                        doNotifications();
                        onStateChanged(skin, 'unlocked');
                        canInteract = true;
                    }
                });
            }
        };

        // once a second update the timer
        var updateTimer = function () {
            var timeToGo = SkinManager.getPlantSkinWaterAfter(skin) - TimeManager.getCurrentTime();
            var timeObject = TimeManager.timeToObject(timeToGo);
            var timeString = '';

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
            var percent = Utils.clamp(0, timeToGo / SkinManager.getPlantSkinUnlockTime(skin), 1);
            unlockingWheel.setPercent(Math.floor(percent * 360) / 360);
        };

        // --- COMPONENTS ---
        var bgSprite = new SpriteContainer({
            imageName: 'ui/char-back2',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.05, 1))
        });


        // Locked Bean
        var lockedBeanSprite = new SpriteContainer({
            spriteSheet: 'beans/' + skin,
            originRelative: new Vector2(0.55, 0.5),
            position: new Vector2(0, 3),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.5)
        });
        lockedBeanSprite.sprite.setFrame((index * 3) % lockedBeanSprite.sprite.currentAnimationLength);
        lockedBeanSprite.sprite.setCurrentSpeed(0);
        lockedBeanSprite.alpha = 0.5;
        var lockedStuff = new Entity({
            name: 'lockedStuff',
            components: [
                lockedBeanSprite
            ]
        });


        // Unlockable Bean
        var unlockableButton = new ClickButton({
            name: 'startButton',
            imageName: 'ui/bluebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 10),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.8, 0.8)),
            sort: true,
            onClick: function (data) {
                if (isScrolling()) {
                    return;
                }
                startUnlocking();
            }
        }).attach(new Text({
            name: 'startText',
            fontSettings: Utils.getTextStyle('growButtonText'),
            position: new Vector2(0, 0),
            scale: new Vector2(0.5, 0.5).divide(Globals.pixelScaleUIV.multiply(new Vector2(0.4, 0.4))),
            text: Localization.getText('plantMe'),
            maxWidth: 40,
            maxHeight: 16
        })).attach({
            name: 'plantActiveBehaviour',
            update: function () {
                unlockableButton.setActive(SkinManager.getAllUnlockingPlantSkins().length < 4);
                slot.alpha = unlockableButton.active ? 1 : 0.5;
            }
        });
        var unlockableBeanSprite = new SpriteContainer({
            spriteSheet: 'beans/' + skin,
            originRelative: new Vector2(0.55, 0.5),
            position: new Vector2(0, -9),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.5)
        });
        unlockableBeanSprite.sprite.setFrame((index * 3) % unlockableBeanSprite.sprite.currentAnimationLength);
        unlockableBeanSprite.sprite.setCurrentSpeed(0);
        var unlockableNewBadgeSprite = new SpriteContainer({
            imageName: 'ui/icons/new',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-20, -16),
            alpha: 1,
            scale: Globals.pixelScaleUIV,
            rotation: 0
        }).attach(new Text({
            name: 'startText',
            position: new Vector2(0, 0),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV),
            rotation: -0.3,
            text: Localization.getText('new'),
            font: 'luckiest_guy',
            fontSize: 7,
            fontColor: '#ffab0d',
            align: 'center',
            textBaseline: 'middle',
            maxWidth: 64,
            maxHeight: 10
        }));
        var unlockableStuff = new Entity({
            name: 'unlockableStuff',
            components: [{
                    name: "unlockableBehaviour",
                    lastPart: 0,
                    offset: Utils.getRandomFloat(1000),
                    update: function () {
                        var p = this.parent;
                        var t = p.timer + this.offset;
                        unlockableBeanSprite.rotation = Math.sin(t * 0.05) * 0.123;
                        if (t - this.lastPart > 30) {
                            this.lastPart = t;
                            p.attach(new Particle({
                                imageName: 'sparkle',
                                originRelative: new Vector2(0.5, 0.5),
                                position: new Vector2(Utils.getRandomRangeFloat(-16, 16), -8 + Utils.getRandomRangeFloat(-16, 16)),
                                alpha: 1,
                                scale: Globals.pixelScaleV.scalarMultiply(0.75),
                                rotation: Utils.getRandomRangeFloat(0, Math.PI * 2),
                                rotationRate: 0,
                                velocity: new Vector2(0, 0),
                                acceleration: new Vector2(0, 0),
                                friction: 1,
                                removeAfterTime: 100,
                                removeEffect: 'scale',
                                dontAttach: true,
                                z: Globals.layers.modals + 0.1
                            }));
                        }
                    }
                },
                unlockableButton,
                unlockableBeanSprite,
                unlockableNewBadgeSprite
            ]
        });

        //Unlocking
        var unlockingWaitingSproutSprite = new SpriteContainer({
            imageName: 'ui/sprout',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, -4),
            scale: Globals.pixelScaleUIV.scalarMultiply(1)
        });
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
        var unlockingTimer = new SpriteContainer({
            imageName: 'ui/water-timer-back',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(11, 14),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.75)
        }).attach(timerText);
        var unlockingSkipButton = new ClickButton({
            name: 'skipButton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(-21, 14),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.45, 0.8)),
            sort: true,
            onClick: function () {
                var coinCount = SaveManager.load('coinCount');
                if (coinCount >= skipGrowingPrice) {
                    Utils.takeCoins(skipGrowingPrice, 'plants', 'skipWaiting');
                    SkinManager.lowerPlantSkinTimer(skin, 10000000000);
                } else {
                    new ShopDialog({});
                }
            }
        }).attach(new SpriteContainer({
            imageName: 'ui/big_coin',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, -28),
            alpha: 1,
            scale: Globals.pixelScaleUIV.divide(new Vector2(0.45, 0.8)),
            rotation: 0
        })).attach(new Text({
            name: 'priceText',
            fontSettings: Utils.getTextStyle('growButtonText'),
            position: new Vector2(0, 36),
            scale: new Vector2(0.5, 0.5).divide(Globals.pixelScaleUIV.multiply(new Vector2(0.225, 0.4))),
            text: skipGrowingPrice.toString(),
            maxWidth: 56,
            maxHeight: 16
        }));
        var unlockingWaitingBubbleBean = new SpriteContainer({
            spriteSheet: 'beans/' + skin,
            position: new Vector2(-16, 0),
            scale: new Vector2(0.5, 0.5)
        });
        unlockingWaitingBubbleBean.sprite.setCurrentSpeed(0);
        var unlockingWaitingBubble = new SpriteContainer({
            imageName: 'ui/icons/talk',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-20, -10),
            rotation: 0.2,
            scale: Globals.pixelScaleUIV
        }).attach(unlockingWaitingBubbleBean);
        var unlockingWheel = new RadialBar({
            name: 'radialBar',
            position: new Vector2(24, -10),
            scale: new Vector2(1, 1),
            currentPercent: 0,
            radius: 4,
            angle: 360,
            segments: 64,
            color: new Color(60, 194, 255),
            colorBG: new Color(194, 161, 127),
            thickness: 8,
            overstep: 0.02
        });

        var unlockingWaitingStuff = new Entity({
            name: 'unlockingWaitingStuff',
            components: [{
                    name: "unlockingWaitingBehaviour",
                    lastPart: 0,
                    update: function () {
                        var p = this.parent;
                        var t = p.timer;
                        if (t - this.lastPart > 15) {
                            this.lastPart = t;
                            p.attach(new Particle({
                                imageName: 'ui/waterdrop',
                                originRelative: new Vector2(0.5, 0.5),
                                position: new Vector2(Utils.getRandomRangeFloat(-16, 16), -8 + Utils.getRandomRangeFloat(-16, 0)),
                                alpha: 0.66,
                                scale: Globals.pixelScaleV.scalarMultiply(1),
                                rotation: 0,
                                rotationRate: 0,
                                velocity: new Vector2(0, 0),
                                acceleration: new Vector2(0, 0.01),
                                friction: 1,
                                removeAfterTime: 60,
                                removeEffect: 'scale',
                                dontAttach: true,
                                z: Globals.layers.modals + 0.1
                            }));
                        }
                    }
                },
                unlockingWaitingSproutSprite,
                unlockingTimer,
                unlockingWaitingBubble,
                unlockingWheel,
                unlockingSkipButton
            ]
        });

        // READY TO OPEN
        var unlockingUnlockableSproutShineSprite = new SpriteContainer({
            imageName: 'ui/fx/shine',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-4, 0),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.75)
        });
        var unlockingUnlockableSproutSprite = new SpriteContainer({
            imageName: 'ui/sprout',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, -8),
            scale: Globals.pixelScaleUIV.scalarMultiply(1)
        });
        var unlockingUnlockableExclamations = new Entity({
            name: 'unlockingUnlockableExclamations',
            position: new Vector2(0, 0),
            components: [
                new SpriteContainer({
                    imageName: 'ui/icons/exclaim',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(128, -48),
                    scale: new Vector2(1, 1),
                    rotation: 0.3
                }),
                new SpriteContainer({
                    imageName: 'ui/icons/exclaim',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-128, -64),
                    scale: new Vector2(1, 1),
                    rotation: -0.2
                })
            ]
        });
        var unlockingUnlockableButton = new ClickButton({
            name: 'unlockButton',
            imageName: 'ui/bluebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 10),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.8, 0.8)),
            sort: true,
            onClick: function () {
                if (isScrolling()) {
                    return;
                }
                unlockPlant();
            }
        }).attach(new Text({
            name: 'readyText',
            fontSettings: Utils.getTextStyle('growButtonText'),
            position: new Vector2(0, 4),
            scale: new Vector2(0.5, 0.5).divide(Globals.pixelScaleUIV.multiply(new Vector2(0.4, 0.4))),
            text: Localization.getText('ready'),
            maxWidth: 40,
            maxHeight: 16
        }));
        var unlockingUnlockableStuff = new Entity({
            name: 'unlockingUnlockableStuff',
            components: [{
                    name: "unlockableBehaviour",
                    lastPart: 0,
                    update: function () {
                        var p = this.parent;
                        var t = p.timer;
                        unlockingUnlockableSproutShineSprite.rotation = t * 0.0123;
                        unlockingUnlockableSproutSprite.scale = Globals.pixelScaleUIV.scalarMultiply(1 + (Math.sin(t * 0.05) * 0.05));
                        unlockingUnlockableExclamations.rotation = (Math.sin(t * 0.025) * -0.1);
                        unlockingUnlockableExclamations.scale = Globals.pixelScaleUIV.scalarMultiply(1 + (Math.sin(t * 0.1) * -0.05));
                        if (t - this.lastPart > 15) {
                            this.lastPart = t;
                            p.attach(new Particle({
                                imageName: 'sparkle',
                                originRelative: new Vector2(0.5, 0.5),
                                position: new Vector2(Utils.getRandomRangeFloat(-16, 16), -8 + Utils.getRandomRangeFloat(-16, 16)),
                                alpha: 1,
                                scale: Globals.pixelScaleV.scalarMultiply(1),
                                rotation: Utils.getRandomRangeFloat(0, Math.PI * 2),
                                rotationRate: 0,
                                velocity: new Vector2(0, 0),
                                acceleration: new Vector2(0, 0),
                                friction: 1,
                                removeAfterTime: 100,
                                removeEffect: 'scale',
                                dontAttach: true,
                                z: Globals.layers.modals + 0.1
                            }));
                        }
                    },
                },
                unlockingUnlockableSproutShineSprite,
                unlockingUnlockableSproutSprite,
                unlockingUnlockableExclamations,
                unlockingUnlockableButton
            ]
        });

        var unlockingState = '';
        var unlockingStateLast = '';
        var unlockingStuff = new Entity({
            name: 'unlockingStuff',
            components: [{
                name: "unlockingSwitcher",
                start: function () {
                    EventSystem.on('onEverySecond', updateTimer);
                    EventSystem.on('updateTimers', updateTimer);
                    unlockingStuff.update();
                },
                update: function () {
                    unlockingState = 'waiting';
                    if (SkinManager.getPlantSkinCanUnlock(skin)) {
                        unlockingState = "unlockable";
                    }

                    if (unlockingState !== unlockingStateLast) {
                        unlockingStuff.remove(unlockingWaitingStuff);
                        unlockingStuff.remove(unlockingUnlockableStuff);
                        switch (unlockingState) {
                        case 'waiting':
                            if (unlockingStateLast !== '') {
                                onStateChanged(skin, 'unlocking-waiting');
                            }
                            unlockingStuff.attach(unlockingWaitingStuff);
                            break;
                        case 'unlockable':
                            if (unlockingStateLast !== '') {
                                onStateChanged(skin, 'unlocking-unlockable');
                            }
                            unlockingStuff.attach(unlockingUnlockableStuff);
                            break;
                        }
                    }
                    unlockingStateLast = unlockingState;
                },
                destroy: function () {
                    EventSystem.off('onEverySecond', updateTimer);
                    EventSystem.off('updateTimers', updateTimer);
                }
            }]
        });

        // --- ENTITY ---
        var slot = new Entity({
            name: 'slot-' + index,
            position: settings.position || new Vector2(0, 0),
            components: [
                bgSprite
            ]
        }).extend({
            getState: function () {
                return currentState;
            },
            getSkin: function () {
                return skin;
            }
        });

        // get new state
        currentState = SkinManager.getPlantSkinState(skin);
        //attach new stuff
        switch (currentState) {
        case 'locked':
            slot.attach(lockedStuff);
            break;
        case 'unlockable':
            slot.attach(unlockableStuff);
            break;
        case 'unlocking':
            slot.attach(unlockingStuff);
            unlockingStuff.start();
            break;
        }
        return slot;
    };
});