/**
 * Module description
 * @moduleName MainMenuScreen
 * @snippet MainMenuScreen.snippet
MainMenuScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/mainmenuscreen', [
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
    'components/spritecontainer',
    'ui/cheatscreen',
    'modules/gameanalytics',
    'modules/tenjin',
    'ui/potselector',
    'ui/coindialog',
    'ui/adforcoinbutton',
    'ui/plantselector',
    'modules/savemanager',
    'ui/beandialog',
    'components/sortedclickable',
    'ui/tutorialscreen',
    'modules/cloudsave',
    'modules/skinmanager',
    'modules/vipmanager',
    'ui/vipdialog',
    'ui/settings',
    'ui/viptab',
    'ui/iapoverlay',
    'ui/shoptab',
    'ui/viptestdrivedialog',
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
    Globals,
    SpriteContainer,
    CheatScreen,
    GameAnalytics,
    Tenjin,
    PotSelector,
    CoinDialog,
    AdForCoinbutton,
    PlantSelector,
    SaveManager,
    BeanDialog,
    SortedClickable,
    TutorialScreen,
    CloudSave,
    SkinManager,
    VipManager,
    VipDialog,
    SettingsScreen,
    VipTab,
    IapOverlay,
    ShopTab,
    VipTestDrive,
    Ads
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var currentLevel = SaveManager.load('currentLevel');
        var plantSectorStatusLast;
        var potSectorStatusLast;
        var isVipLast;

        // --- SETUP ---
        Utils.unlockLevelSkins();

        // --- VARS ---
        var gc;
        var gameGUI;
        var hasStarted = false;
        var isPlantTutorial = !SaveManager.load('doneGrowTutorial') && SaveManager.load('canShowPlantSelector');

        // --- FUNCTIONS ---
        var playGame = function () {
            if (!hasStarted) {
                hasStarted = true;
                Globals.gameState = Globals.gameStates.game;
                gc.startLevel();
                gameGUI.showScore();
                new Tween({
                    from: entity.alpha,
                    to: 0,
                    in: 15,
                    delay: 0,
                    applyOnDelay: 0,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        entity.alpha = v;
                    },
                    onComplete: function () {
                        entity.removeSelf();
                    }
                });
            }
        };

        // --- COMPONENTS ---
        var playTutorial = new TutorialScreen({
            isMenu: true,
            doAttach: false
        });
        var playClickable = new Entity({
            name: 'playClickable',
            position: new Vector2(0, 0),
            boundingBox: new Rectangle(0, 0, viewport.width, viewport.height),
            components: [
                new SortedClickable({
                    onPressed: function (data) {
                        if (playClickable.active && entity.timer > 60) {
                            playGame();
                            playTutorial.hide();
                            ClickButton.currentlyPressing = null;
                        }
                    }
                })
            ]
        }).extend({
            active: true,
            setActive: function (newActive) {
                playClickable.active = newActive;
            }
        }).attach({
            name: 'activeBehaviour',
            update: function () {
                playTutorial.alpha = (playClickable.active) ? 1 : 0;
            }
        });

        var behaviour = {
            name: "behaviour",
            start: function () {},
            update: function () {
                if (!gc) {
                    gc = Bento.objects.get('gameController');
                    if (!gc) {
                        return;
                    }
                }
                if (!gameGUI) {
                    gameGUI = Bento.objects.get('gameGUI');
                    gameGUI.hideScore(true);
                    if (!gameGUI) {
                        return;
                    }
                }

                isPlantTutorial = !SaveManager.load('doneGrowTutorial') && SaveManager.load('canShowPlantSelector');

                var plantSelectorStatus = (plantSelector.getOpenStatus() !== "closed");
                var potSelectorStatus = (potSelector.getOpenStatus() !== "closed");
                var isVip = VipManager.isVip();

                if (plantSelectorStatus !== plantSectorStatusLast) {
                    if (plantSelectorStatus || isPlantTutorial) {
                        potSelector.hideTab();
                    } else {
                        potSelector.showTab();
                    }
                }

                if (potSelectorStatus !== potSectorStatusLast) {
                    if (potSelectorStatus) {
                        plantSelector.hideTab();
                    } else {
                        plantSelector.showTab();
                    }
                }

                if (plantSelectorStatus !== plantSectorStatusLast || potSelectorStatus !== potSectorStatusLast || isVipLast !== isVip) {
                    if (plantSelectorStatus || potSelectorStatus || isVip) {
                        vipTab.hideTab();
                    } else {
                        vipTab.showTab();
                    }
                    if (plantSelectorStatus || potSelectorStatus) {
                        shopTab.hideTab();
                    } else {
                        shopTab.showTab();
                    }
                }

                if (Globals.doOpenPlants) {
                    plantSelector.open();
                    Globals.doOpenPlants = false;
                }

                plantSectorStatusLast = plantSelectorStatus;
                potSectorStatusLast = potSelectorStatus;
                isVipLast = isVip;
            },
            destroy: function () {
            }
        };

        // settings button
        var settingsButton = new ClickButton({
            name: 'settingsButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/config',
            frameCountX: 1,
            frameCountY: 1,
            position: new Vector2(19, 21),
            scale: new Vector2(0.15, 0.15),
            updateWhenPaused: 0,
            float: false,
            sort: true,
            onButtonDown: function () {
                new Tween({
                    from: 0,
                    to: Math.PI,
                    in: 15,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        settingsButton.rotation = -v;
                    }
                });
                new Tween({
                    from: settingsButton.scale.clone(),
                    to: new Vector2(0.2, 0.2),
                    in: 15,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        settingsButton.scale = v;
                    }
                });
            },
            onClick: function () {
                settingsScreen.open();
            },
            onButtonUp: function () {
                new Tween({
                    from: settingsButton.scale.clone(),
                    to: new Vector2(0.15, 0.15),
                    in: 15,
                    ease: 'easeInOutBack',
                    onUpdate: function (v, t) {
                        settingsButton.scale = v;
                    }
                });
            }
        });

        // Pot Selector
        var potSelector = new PotSelector({});

        // Plant Selector
        var plantSelector = new PlantSelector({});

        // VIP Tab
        var vipTab = new VipTab({
            onComplete: function (isNowVip) {
                if (isNowVip) {
                    plantSelector.open();
                }
            }
        });

        //Shop Tab
        var shopTab = new ShopTab({});

        var settingsScreen = new SettingsScreen({});

        var askForPassword = function () {
            var success = function (text) {
                if (text === 'thunderdogs4evar') {
                    SaveManager.save('isDev', true);
                    GameAnalytics.disable();
                    Tenjin.disable();
                    new CheatScreen({});
                }
            };
            Utils.promptText('???', '???', success);
        };
        var cheatTaps = 0;
        var cheatRegion = new Entity({
            name: 'cheatRegion',
            position: new Vector2(0, 0),
            boundingBox: new Rectangle(viewport.width - 48, 0, 48, 32),
            components: [
                new SortedClickable({
                    onClick: function (data) {
                        cheatTaps++;
                        if (cheatTaps === 8) {
                            if (SaveManager.load('isDev')) {
                                new CheatScreen({});
                            } else {
                                askForPassword();
                            }
                            cheatTaps = 0;
                        }
                    },
                    onClickMiss: function (data) {
                        cheatTaps = 0;
                    }
                })
            ]
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.mainmenu,
            name: 'mainMenuScreen',
            family: [''],
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            components: [
                behaviour,
                playClickable,
                playTutorial,
                cheatRegion,
                settingsButton,
                {
                    name: "blank"
                },
                SaveManager.load('canShowPlantSelector') ? vipTab : {
                    name: "blank"
                },
                (currentLevel >= 2) ? shopTab : {
                    name: "blank"
                },
                (currentLevel >= 2) ? potSelector : {
                    name: "blank"
                },
                SaveManager.load('canShowPlantSelector') ? plantSelector : {
                    name: "blank"
                },
                settingsScreen
            ]
        }).extend({
            potSelector: potSelector,
            plantSelector: plantSelector,
            playButton: playClickable
        });

        VipManager.checkVip(function (isVip) {
            if (isVip) {
                if (SaveManager.load('VipFirstTimeClaim') === false) {
                    SaveManager.save('VipFirstTimeClaim', true);
                }
            } else {
                if (SkinManager.isUsingVipSkin()) {
                    SkinManager.setCurrentPlantSkin('default');
                    plantSelector.focusSkin('default');
                }
            }
        });
        if (!VipManager.isVip() && SkinManager.isUsingVipSkin()) {
            SkinManager.setCurrentPlantSkin('default');
            plantSelector.focusSkin('default');
        }

        //show vip
        Utils.preloadVIPTerms(IapOverlay);
        if (currentLevel < 5 || VipManager.isVip()) {
            Globals.levelsSinceVIP = 0;
        } else {
            if (Globals.doOpenVIP || (!Globals.doOpenPlants && Globals.levelsSinceVIP > 2)) {
                Globals.levelsSinceVIP = 0;
                Globals.doOpenVIP = false;
                new Tween({ in: 45,
                    onComplete: function () {
                        if (SaveManager.load('TimesShownVIP') % 2 === 1 || !Ads.canShowRewarded()) {
                            new VipDialog({
                                onComplete: function (isNowVip) {
                                    if (isNowVip) {
                                        plantSelector.open();
                                    }
                                }
                            });
                        } else {
                            new VipTestDrive({
                                onYes: function (newSkin) {
                                    EventSystem.fire('onPlantChanged', newSkin);
                                    Globals.doOpenVIP = true;
                                    playGame();
                                },
                                onNo: function () {},
                            });
                        }
                        SaveManager.save('TimesShownVIP', SaveManager.load('TimesShownVIP') + 1);
                    }
                });
            }
        }
        Bento.objects.attach(entity);
        return entity;
    };
});