/**
 * Module description
 * @moduleName PotSlot
 * @snippet PotSlot.snippet
PotSlot({
    potskin: potskin,
    onClick: function () {}
})
 */
bento.define('ui/potslot', [
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
    'modules/timemanager',
    'components/sortedclickable',
    'globals',
    'modules/skinmanager',
    'ui/potunlockeddialog',
    'modules/savemanager',
    'modules/ads',
    'modules/localization',
    'ui/vipdialog',
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
    TimeManager,
    SortedClickable,
    Globals,
    SkinManager,
    PotUnlockedDialog,
    SaveManager,
    Ads,
    Localization,
    VipDialog,
    ShopDialog
) {
    'use strict';
    return function (settings) {

        // --- PARAMETERS ---
        var index = settings.index || 0;
        var skin = settings.skin;
        var onClick = settings.onClick || function () {};
        var onStateChanged = settings.onStateChanged || function () {};
        var isScrolling = settings.isScrolling || function () {
            return false;
        };
        var lastCoinCount = 0;
        var coinCount = SaveManager.load('coinCount');
        var unlockMethod = SkinManager.getPotSkinUnlockMethod(skin);
        var unlockMethodValue = unlockMethod.value;
        var purchaseCost = unlockMethodValue;
        if (SkinManager.getAllUnlockedPotSkins().length < 2 && unlockMethod.method === "coins") {
            //unlockMethodValue = 0;
        }
        var canBuy = function () {
            return (coinCount >= purchaseCost);
        };
        var updateCoinValue = function () {
            coinCount = SaveManager.load('coinCount');
        };

        // --- COMPONENTS ---
        var unlockedStuff = new Entity({
            name: 'unlockedStuff',
            position: new Vector2(0, 0),
            boundingBox: new Rectangle(-22, -22, 44, 44),
            components: [
                new SpriteContainer({
                    name: 'buttonSpriteContainer',
                    imageName: 'ui/char-back-unlocked2',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 0),
                    scale: Globals.pixelScaleUIV
                }),
                new SpriteContainer({
                    name: 'buttonIcon',
                    spriteSheet: 'potskins/' + skin,
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, -16),
                    scale: Globals.pixelScaleV.scalarMultiply(1.75)
                }),
                new SortedClickable({
                    onClick: function (data) {
                        if (!isScrolling()) {
                            onClick();
                            Bento.audio.playSound('sfx_clickbutton');
                        }
                    }
                })
            ]
        });

        var purchaseButton = new ClickButton({
            name: 'purchaseButton',
            sfx: 'sfx_clickbutton',
            sprite: new Sprite({
                imageName: 'ui/greenbutton',
                frameCountX: 1,
                frameCountY: 3,
                originRelative: new Vector2(0.5, 0.5),
                animations: {
                    up: {
                        frames: [0],
                        speed: 0
                    },
                    down: {
                        frames: [1],
                        speed: 0
                    },
                    inactive: {
                        frames: [2],
                        speed: 0
                    }
                }
            }),
            position: new Vector2(0, 12),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.7),
            sort: true,
            onClick: function () {
                if (!isScrolling()) {
                    if (canBuy()) {
                        Utils.takeCoins(purchaseCost, 'pots', skin);
                        Bento.audio.stopSound('sfx_coin_collect_loop');
                        EventSystem.fire('GameAnalytics-addDesignEvent', {
                            eventId: "potsUnlocked:" + skin
                        });
                        SkinManager.makePotSkinUnlocked(skin);
                        new PotUnlockedDialog({
                            potSkin: skin,
                            onComplete: function () {
                                onStateChanged('unlocked');
                            }
                        });
                    } else {
                        new ShopDialog({});
                    }
                }
            }
        });
        var coinPurchaseStuff = new Entity({
            name: 'coinPurchaseStuff',
            position: new Vector2(0, 0),
            components: [
                purchaseButton,
                new SpriteContainer({
                    imageName: 'coin',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-11, 12),
                    alpha: 1,
                    scale: Globals.pixelScaleUIV.scalarMultiply(1),
                    rotation: 0
                }),
                new Text({
                    fontSettings: Utils.getTextStyle('potPrice'),
                    name: 'priceText',
                    position: new Vector2(-4, 11),
                    text: (purchaseCost > 0) ? purchaseCost.toString() : Localization.getText('free'),
                    maxWidth: 22,
                    maxHeight: 10
                })
            ]
        });

        var levelUnlockStuff = new Entity({
            name: 'coinPurchaseStuff',
            position: new Vector2(0, 0),
            components: [
                new SpriteContainer({
                    imageName: 'ui/lockedlevelbackground',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 10),
                    alpha: canBuy ? 1 : 0.5,
                    scale: Globals.pixelScaleUIV.multiply(new Vector2(0.35, 0.25)),
                    frameCountX: 1,
                    frameCountY: 1,
                    animations: {
                        default: {
                            frames: [0],
                            speed: 0
                        }
                    },
                    rotation: 0
                }),
                new Text({
                    fontSettings: Utils.getTextStyle('potLevel'),
                    name: 'levelText',
                    position: new Vector2(0, 9.5),
                    text: Localization.getText('levelX').replace('{LEVEL}', unlockMethodValue.toString()),
                    maxWidth: 32,
                    maxHeight: 10
                })
            ]
        });

        var isWatching = false;
        var adIcon = new SpriteContainer({
            imageName: 'ui/icons/vid',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 12),
            alpha: canBuy ? 1 : 0.5,
            scale: Globals.pixelScaleUIV.scalarMultiply(0.4),
            rotation: 0
        });
        var adButton = new ClickButton({
            name: 'adButton',
            sfx: 'sfx_clickbutton',
            sprite: new Sprite({
                imageName: 'ui/orangebutton',
                frameCountX: 1,
                frameCountY: 3,
                originRelative: new Vector2(0.5, 0.5),
                animations: {
                    up: {
                        frames: [0],
                        speed: 0
                    },
                    down: {
                        frames: [1],
                        speed: 0
                    },
                    inactive: {
                        frames: [0],
                        speed: 0
                    }
                }
            }),
            position: new Vector2(0, 12),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.7),
            sort: true,
            onClick: function () {
                var unlockSkin = function () {
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "potsUnlocked:" + skin
                    });
                    SkinManager.makePotSkinUnlocked(skin);
                    new PotUnlockedDialog({
                        potSkin: skin,
                        doAnother: true,
                        onComplete: function () {
                            onStateChanged('unlocked');
                        }
                    });
                };
                if (!isScrolling() && !isWatching) {
                    if (Utils.isDev()) {
                        window.alert("This is a Rewarded Ad!");
                        Bento.input.resetPointers();
                        unlockSkin();
                    } else {
                        isWatching = true;
                        Ads.showRewarded(function () {
                            isWatching = false;
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedSkinUnlockMenu",
                                value: 1
                            });
                            unlockSkin();
                        }, function (e) {
                            isWatching = false;
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:rewardedSkinUnlockMenu",
                                value: 0
                            });
                        }, "SkinUnlockMenu");
                    }
                }
            }
        }).attach({
            name: 'rewardedChecker',
            update: function () {
                if (adButton.active && !Ads.canShowRewarded()) {
                    adButton.setActive(false);
                    adIcon.alpha = 0.5;
                }
                if (!adButton.active && Ads.canShowRewarded()) {
                    adButton.setActive(true);
                    adIcon.alpha = 1;
                }
            }
        });

        var adUnlockStuff = new Entity({
            name: 'adUnlockStuff',
            position: new Vector2(0, 0),
            components: [
                adButton,
                adIcon
            ]
        });

        var lockedStuff = new Entity({
            name: 'unlockedStuff',
            position: new Vector2(0, 0),
            boundingBox: new Rectangle(-22, -22, 44, 44),
            components: [
                new SpriteContainer({
                    name: 'buttonSpriteContainer',
                    imageName: 'ui/char-back',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 0),
                    scale: Globals.pixelScaleUIV
                }),
                new SpriteContainer({
                    name: 'buttonIcon',
                    spriteSheet: 'boxes/' + skin,
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, -10),
                    scale: Globals.pixelScaleUIV.scalarMultiply(1.33)
                }),
            ]
        });

        switch (unlockMethod.method) {
        case "coins":
            lockedStuff.attach(coinPurchaseStuff);
            break;
        case "level":
            lockedStuff.attach(levelUnlockStuff);
            break;
        case "ad":
            lockedStuff.attach(adUnlockStuff);
            break;
        }

        // --- ENTITY ---
        var currentState = '';
        var slot = new Entity({
            name: 'slot-' + index,
            position: settings.position || new Vector2(0, 0),
            components: []
        }).extend({
            getState: function () {
                return currentState;
            },
            getSkin: function () {
                return skin;
            }
        });

        // get new state
        currentState = SkinManager.getPotSkinState(skin);
        //attach new stuff
        switch (currentState) {
        case 'locked':
            slot.attach(lockedStuff);
            break;
        case 'unlocked':
            slot.attach(unlockedStuff);
            break;
        }
        // event handler stuff
        slot.attach({
            name: 'eventstuff',
            start: function () {
                EventSystem.on('coinsUpdated', updateCoinValue);
            },
            destroy: function () {
                EventSystem.off('coinsUpdated', updateCoinValue);
            }
        });
        updateCoinValue();

        return slot;
    };
});