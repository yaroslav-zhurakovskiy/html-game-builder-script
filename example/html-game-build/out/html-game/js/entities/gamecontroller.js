/**
 * Module description
 * @moduleName GameController
 * @snippet GameController.snippet
GameController({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/gamecontroller', [
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
    'entities/levelgenerator',
    'entities/textup',
    'entities/player',
    'globals',
    'ui/mainmenuscreen',
    'entities/solid',
    'components/spritecontainer',
    'entities/revivecloud',
    'ui/revivescreen',
    'modules/ads',
    'ui/screentransition',
    'ui/gamecompletescreen',
    'modules/tenjin',
    'modules/skinmanager',
    'ui/tutorialscreen',
    'ui/pottutorialscreen',
    'modules/gameanalytics',
    'ui/planttutorialscreen',
    'modules/savemanager',
    'entities/background',
    'entities/introcutscene',
    'ui/screentransition2',
    'modules/vipmanager',
    'components/backbutton',
    'ui/pausescreen'
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
    LevelGenerator,
    TextUp,
    Player,
    Globals,
    MainMenuScreen,
    Solid,
    SpriteContainer,
    ReviveCloud,
    ReviveScreen,
    Ads,
    ScreenTransition,
    GameCompleteScreen,
    Tenjin,
    SkinManager,
    TutorialScreen,
    PotTutorialScreen,
    GameAnalytics,
    PlantTutorialScreen,
    SaveManager,
    Background,
    IntroCutscene,
    ScreenTransition2,
    VipManager,
    BackButton,
    PauseScreen
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var player;
        var playerSpawn;
        var currentRevivePoint = new Vector2(0, 100000000);
        var camera;
        var gui;

        var currentLevel = SaveManager.load('currentLevel');
        var superProgress = SaveManager.load('superProgress');
        var levelSkin = Utils.isDefined(Globals.forcedWorldSkin) ? Utils.clamp(1, Globals.forcedWorldSkin, 7) : 1 + ((Math.floor((currentLevel - 1) / 3)) % 7);
        var isPlaying = false;
        var canScrollCamera = false;
        var nextLevelPosition = new Vector2(viewport.width * 0.5, viewport.height);
        var startPlayerY = 0;
        var levelProgress = 0;
        var endPlayerY = 0;
        var coinsCollected = 0;
        var coinsToCashIn = 0;
        var freeRespawns = 0;
        var deathCount = 0;


        if (currentLevel < 5) {
            freeRespawns = 1;
        }
        Globals.canAdRevive = true;

        // --- FUNCTIONS ---
        var startLevel = function () {
            if (!isPlaying) {
                // start game
                isPlaying = true;
                Bento.audio.playSound('sfx_start');
                new Tween({
                    from: Globals.mainMusicVolume,
                    to: 0.5,
                    in: 60,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        Globals.mainMusicVolume = v;
                        Bento.audio.setVolume(v, 'music/bgm_gameplay_loop');
                    }
                });
                // enable camera control
                canScrollCamera = true;
                // enable the player
                player.setEnabled(true);
                // zoom camera to default scale 
                new Tween({
                    from: camera.getViewScale(),
                    to: 0.875,
                    in: 60,
                    delay: 0,
                    applyOnDelay: 0,
                    ease: 'easeOutExpo',
                    onUpdate: function (v, t) {
                        camera.setViewScale(v);
                    }
                });
                //start analytics
                EventSystem.fire('GameAnalytics-addProgressionEvent', {
                    progressionStatus: GameAnalytics.EGAProgressionStatus.Start,
                    progression01: "level_" + currentLevel
                });
            }
        };

        var onFeverChanged = function (starting) {
            if (starting) {
                new Tween({
                    from: Globals.mainMusicVolume,
                    to: 0,
                    in: 30,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        Globals.mainMusicVolume = v;
                        Bento.audio.setVolume(v, 'music/bgm_gameplay_loop');
                    },
                    onComplete: function () {
                        Bento.audio.stopMusic('music/bgm_gameplay_loop');
                    }
                });

                Bento.audio.stopMusic('music/bgm_gameplay_fever_loop');
                Bento.audio.playMusic('music/bgm_gameplay_fever_loop', true);
                Bento.audio.setVolume(Globals.feverMusicVolume, 'music/bgm_gameplay_loop');
                new Tween({
                    from: Globals.feverMusicVolume,
                    to: 0.66,
                    in: 30,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        Globals.feverMusicVolume = v;
                        Bento.audio.setVolume(v, 'music/bgm_gameplay_fever_loop');
                    }
                });
            } else {
                Bento.audio.stopMusic('music/bgm_gameplay_loop');
                Bento.audio.playMusic('music/bgm_gameplay_loop', true);
                new Tween({
                    from: Globals.mainMusicVolume,
                    to: 0.5,
                    in: 30,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        Globals.mainMusicVolume = v;
                        Bento.audio.setVolume(v, 'music/bgm_gameplay_loop');
                    }
                });
                new Tween({
                    from: Globals.feverMusicVolume,
                    to: 0,
                    in: 30,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        Globals.feverMusicVolume = v;
                        Bento.audio.setVolume(v, 'music/bgm_gameplay_fever_loop');
                    },
                    onComplete: function () {
                        Bento.audio.stopMusic('music/bgm_gameplay_fever_loop');
                    }
                });
            }
        };

        var makeMainMenu = function () {
            // make main menu
            var thisMenu = new MainMenuScreen({});
            // disable the player
            player.setEnabled(false);
            // zoom in camera
            camera.setViewScale(0.5);
            //set camera position to 
            var cameraPosition = new Vector2(viewport.width * 0.5, player.position.y - 24);
            camera.setTargetPosition(cameraPosition);
            camera.position = cameraPosition.clone();
            return thisMenu;
        };

        var revivePlayer = function () {
            player.respawnAt(currentRevivePoint.clone());
            var cloud = new ReviveCloud({
                position: currentRevivePoint.clone()
            });
            Bento.objects.attach(cloud);
        };

        var checkInterstitials = function (complete) {
            if (Globals.attemptsSinceAd >= Globals.maxAttemptsBetweenInterstitials && SaveManager.load('showForcedAds')) {
                if (Utils.isDev()) {
                    window.alert("This is an Interstital Ad!");
                    Bento.input.resetPointers();
                    Globals.attemptsSinceAd = 0;
                    complete();
                } else {
                    Ads.showInterstitial(function () {
                        Globals.attemptsSinceAd = 0;
                        complete();
                    }, function (e) {
                        complete();
                    });
                }
            } else {
                complete();
            }
        };

        var onLevelComplete = function () {
            Globals.levelsThisSession++;
            Globals.attemptsSinceAd += 1;
            Globals.levelsSinceVIP++;
            canScrollCamera = false;
            SaveManager.save('currentLevel', currentLevel + 1);
            var unlockedSkin = Utils.unlockLevelSkins();

            var doInitialBean = (superProgress === 2 && !SaveManager.load('hasInitialBean'));
            if (doInitialBean) {
                SaveManager.save('canShowPlantSelector', true);
                SaveManager.save('hasInitialBean', true);
            }

            new Tween({
                from: Globals.mainMusicVolume,
                to: 0.25,
                in: 45,
                ease: 'linear',
                onUpdate: function (v, t) {
                    Globals.mainMusicVolume = v;
                    Bento.audio.setVolume(v, 'music/bgm_gameplay_loop');
                }
            });

            isPlaying = false;
            Bento.audio.playSound('sfx_land');
            Utils.giveCoins(coinsToCashIn, 'ingame', 'coinCollected');
            coinsToCashIn = 0;
            EventSystem.fire('GameAnalytics-addDesignEvent', {
                eventId: "progression:coinsCollected:" + currentLevel,
                value: coinsCollected
            });
            EventSystem.fire('GameAnalytics-addProgressionEvent', {
                progressionStatus: GameAnalytics.EGAProgressionStatus.Complete,
                progression01: "level_" + currentLevel
            });
            EventSystem.fire('GameAnalytics-addDesignEvent', {
                eventId: "progression:levelCompleted:" + currentLevel
            });
            EventSystem.fire('GameAnalytics-addDesignEvent', {
                eventId: "RewardedAdsCount:Level:" + currentLevel,
                value: Bento.saveState.load('watchedAds', 0)
            });

            if (currentLevel === 10) {
                EventSystem.fire('Tenjin', {
                    name: "10_games_completed"
                });
            }
            if (currentLevel === 50) {
                EventSystem.fire('Tenjin', {
                    name: "50_games_completed"
                });
            }
            if (currentLevel === 100) {
                EventSystem.fire('Tenjin', {
                    name: "100_games_completed"
                });
            }

            Bento.objects.attach(new GameCompleteScreen({
                currentLevel: currentLevel,
                unlockedSkin: unlockedSkin,
                doBean: doInitialBean,
                onClose: function () {
                    // back to the main menu
                    levelProgress = 0;
                    if (superProgress < Globals.superProgressSegments - 1) {
                        superProgress++;
                        SaveManager.save('superProgress', superProgress);
                    }
                    Globals.gameState = Globals.gameStates.menu;
                    new ScreenTransition({
                        destination: 'screens/main',
                        position: new Vector2(viewport.width * 0.5, viewport.height * 0.5 + 64),
                        onScreenChange: checkInterstitials
                    });
                    new Tween({
                        from: Globals.mainMusicVolume,
                        to: 0,
                        in: 30,
                        ease: 'linear',
                        onUpdate: function (v, t) {
                            Globals.mainMusicVolume = v;
                            Bento.audio.setVolume(v, 'music/bgm_gameplay_loop');
                        }
                    });
                }
            }));
        };

        var onGameOver = function () {
            Globals.attemptsSinceAd += 1;
            Bento.objects.attach(new GameCompleteScreen({
                currentLevel: currentLevel,
                failed: true,
                onClose: function () {
                    // back to the main menu
                    Globals.gameState = Globals.gameStates.menu;
                    new ScreenTransition({
                        destination: 'screens/main',
                        position: new Vector2(viewport.width * 0.5, viewport.height * 0.5 + 64),
                        onScreenChange: checkInterstitials
                    });
                }
            }));
            Utils.giveCoins(coinsToCashIn, 'ingame', 'coinCollected');
            coinsToCashIn = 0;
            EventSystem.fire('GameAnalytics-addDesignEvent', {
                eventId: "progression:coinsCollected:" + currentLevel,
                value: coinsCollected
            });
            EventSystem.fire('GameAnalytics-addProgressionEvent', {
                progressionStatus: GameAnalytics.EGAProgressionStatus.Fail,
                progression01: "level_" + currentLevel,
                score: Globals.currentScore
            });
        };

        // die
        var onDeath = function () {
            deathCount++;
            new Tween({ in: 60,
                onComplete: function () {
                    if (currentLevel <= 2 || freeRespawns > 0) {
                        new Tween({ in: 30,
                            onComplete: function () {
                                revivePlayer();
                                freeRespawns--;
                            }
                        });
                        return;
                    }

                    // give coins now 
                    Utils.giveCoins(coinsToCashIn, 'ingame', 'coinCollected');
                    coinsToCashIn = 0;
                    new ReviveScreen({
                        deathCount: deathCount,
                        onComplete: function () {
                            Globals.canAdRevive = false;
                            new Tween({ in: 60,
                                onComplete: function () {
                                    revivePlayer();
                                }
                            });
                        },
                        onSkipped: function () {
                            onGameOver();
                        }
                    });
                }
            });
        };

        // --- COMPONENTS ---
        var behaviour = {
            name: 'behaviourComponent',
            start: function () {
                // collecting things we need
                if (!camera) {
                    camera = Bento.objects.get('camera');
                    if (!camera) {
                        return;
                    }
                }

                EventSystem.on('onFeverChanged', onFeverChanged);

                // reset stuff
                Globals.currentScore = 0;

                // set the game state from stuff
                if (currentLevel === 1) {
                    Globals.gameState = Globals.gameStates.tutorial;
                    if (!SaveManager.load('watchedCutscene')) {
                        Globals.gameState = Globals.gameStates.cutscene;
                    }
                }

                if (!SaveManager.load('hasInitialBean') && currentLevel > 3) {
                    SaveManager.save('hasInitialBean', true);
                }

                if (!SaveManager.load('doneUnlockTutorial') && currentLevel >= 2) {
                    Globals.gameState = Globals.gameStates.potTutorial;
                }

                if (!SaveManager.load('doneGrowTutorial') && SaveManager.load('canShowPlantSelector')) {
                    Globals.gameState = Globals.gameStates.plantTutorial;
                }

                // make level
                entity.attach(new LevelGenerator({
                    startPosition: nextLevelPosition.clone(),
                    levelSkin: levelSkin,
                    hasBonus: ((currentLevel) % 3) === 0,
                    onComplete: function () {
                        Bento.objects.get('playerSpawn', function (thisPlayerSpawn) {
                            startPlayerY = thisPlayerSpawn.position.y;
                            playerSpawn = thisPlayerSpawn;
                        });
                        Bento.objects.get('endarrow', function (endarrow) {
                            endPlayerY = endarrow.position.y;
                        });

                        player = new Player({
                            position: playerSpawn.position.clone(),
                            potSkin: SkinManager.getCurrentPotSkin(),
                            plantSkin: SkinManager.getCurrentPlantSkin(),
                        });
                        Bento.objects.attach(player);

                        Bento.audio.stopMusic('music/bgm_gameplay_loop');
                        Bento.audio.playMusic('music/bgm_gameplay_loop', true);
                        Bento.audio.setVolume(Globals.mainMusicVolume, 'music/bgm_gameplay_loop');
                        new Tween({
                            from: Globals.mainMusicVolume,
                            to: 0.25,
                            in: 30,
                            ease: 'linear',
                            onUpdate: function (v, t) {
                                Globals.mainMusicVolume = v;
                                Bento.audio.setVolume(v, 'music/bgm_gameplay_loop');
                            }
                        });

                        // spawn stuff specific from game state
                        switch (Globals.gameState) {
                        case Globals.gameStates.cutscene:
                            // make main menu
                            Bento.objects.attach(new IntroCutscene({}));
                            break;
                        case Globals.gameStates.tutorial:
                            // make main menu
                            Bento.objects.attach(new TutorialScreen({}));
                            startLevel();
                            break;
                        case Globals.gameStates.menu:
                            // make main menu
                            makeMainMenu();
                            break;
                        case Globals.gameStates.potTutorial:
                            // make main menu
                            var potTutorialMainMenu = makeMainMenu();
                            new PotTutorialScreen({
                                mainmenu: potTutorialMainMenu
                            });
                            break;
                        case Globals.gameStates.plantTutorial:
                            // make main menu
                            var plantTutorialMainMenu = makeMainMenu();
                            new PlantTutorialScreen({
                                mainmenu: plantTutorialMainMenu
                            });
                            break;
                        case Globals.gameStates.game:
                            startLevel();
                            break;
                        }
                    }
                }));

                // --- BACKGROUND ---
                var background = new Background({
                    levelSkin: levelSkin
                });
                Bento.objects.attach(background);

                EventSystem.on('onLevelComplete', onLevelComplete);
                EventSystem.on('onDeath', onDeath);
            },
            update: function (data) {
                // check we have everything
                if (!player) {
                    return;
                }
                if (!camera) {
                    return;
                }

                if (!gui) {
                    gui = Bento.objects.get('gameGUI');
                }

                // get player head position
                var playerHeadPosition = player.getHeadPosition();

                // keep track of player progress
                if (isPlaying) {
                    levelProgress = Utils.clamp(0, (camera.position.y - startPlayerY) / (endPlayerY - startPlayerY), 1);
                }


                // keep track of respawn point while alive
                if (!player.getIsDead()) {
                    var revivePoints = Bento.objects.getByFamily('revivePoints');
                    Utils.forEach(revivePoints, function (revivePoint, i, l, breakLoop) {
                        //has to be above the last to change
                        if (revivePoint.position.y <= currentRevivePoint.y) {
                            if (revivePoint.position.distance(playerHeadPosition) <= currentRevivePoint.distance(playerHeadPosition)) {
                                currentRevivePoint = revivePoint.position.clone();
                            }
                        }
                    });
                }


                // kill player when they fall off the screen
                if (isPlaying && !player.getIsDead() && playerHeadPosition.y > viewport.y + viewport.height + 8) {
                    player.die();
                }

                // move camera
                if (canScrollCamera && camera) {
                    if (playerHeadPosition.y < camera.position.y + (SkinManager.getCurrentPlantSkin() === 'growbot' ? 16 : 32)) {
                        camera.setTargetPosition(new Vector2(
                            viewport.width * 0.5,
                            Math.max(playerHeadPosition.y - (SkinManager.getCurrentPlantSkin() === 'growbot' ? 16 : 32), endPlayerY)
                        ));
                    }
                }
            },
            destroy: function () {
                EventSystem.off('onFeverChanged', onFeverChanged);
                EventSystem.off('onLevelComplete', onLevelComplete);
                EventSystem.off('onDeath', onDeath);
            }
        };

        // cheats for devs
        if (Utils.isDev()) {
            window.setLevel = function (level) {
                SaveManager.save('currentLevel', level || currentLevel);
                return "Travelling to level " + level + "!";
            };
            window.skipLevel = function (skipscore) {
                Globals.currentScore = skipscore || Globals.currentScore;
                onLevelComplete();
                return "Level " + currentLevel + " Skipped!";
            };
            window.killPlayer = function () {
                player.die();
                return "Player Killed!";
            };
        }

        // --- ENTITY ---
        var entity = new Entity({
            name: 'gameController',
            position: new Vector2(0, 0),
            float: true,
            components: [
                behaviour,
                new BackButton({
                    onPressed: function (data) {
                        if (isPlaying) {
                            new PauseScreen({});
                        }
                    }
                })
            ]
        }).extend({
            startLevel: startLevel,
            setIsPlaying: function (newIsPlaying) {
                isPlaying = newIsPlaying;
            },
            setCanScrollCamera: function (newCanScroll) {
                canScrollCamera = newCanScroll;
            },
            giveCoins: function (amount) {
                if (gui) {
                    var tracker = gui.getCoinTracker();
                    tracker.updateCoinValue(tracker.getCoinValue() + amount);
                }
                coinsCollected += amount;
                coinsToCashIn += amount;
            },
            giveScore: function (amount) {
                Globals.currentScore += amount;
            },
            getCurrentLevel: function () {
                return currentLevel;
            },
            getSuperProgress: function () {
                return superProgress;
            },
            setLevelProgress: function (newValue) {
                levelProgress = newValue;
            },
            getLevelProgress: function () {
                return levelProgress;
            }
        });
        return entity;
    };
});