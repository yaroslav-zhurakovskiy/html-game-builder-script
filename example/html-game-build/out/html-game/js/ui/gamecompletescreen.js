/**
 * Game ends via game over or level complete, shows score to coin conversion with bonus buttons for double coin or chest.
 * Once upon a time this was used to give access to the super bonus screen, it's now used to naviage to the SuperBeanDialog instead of allowing this access to the superbonus screen
 * The old functionality remains here to make it easier to migrate back to the old method.
 * @moduleName GameCompleteScreen
 * @snippet GameCompleteScreen.snippet
GameCompleteScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/gamecompletescreen', [
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
    'bento/components/fill',
    'entities/particle',
    'modules/ads',
    'components/gamecounter',
    'modules/skinmanager',
    'modules/savemanager',
    'entities/toast',
    'ui/beandialog',
    'ui/potunlockeddialog',
    'ui/coindialog',
    'ui/potaddialog',
    'ui/superbonusscreen',
    'modules/vipmanager',
    'modules/localization',
    'ui/superbeandialog'
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
    Fill,
    Particle,
    Ads,
    GameCounter,
    SkinManager,
    SaveManager,
    Toast,
    BeanDialog,
    PotUnlockedDialog,
    CoinDialog,
    PotAdDialog,
    SuperBonusScreen,
    VipManager,
    Localization,
    SuperBeanDialog
) {
    'use strict';
    return function (settings) {

        // --- PARAMETERS ---
        var failed = settings.failed || false;
        var onClose = settings.onClose || function () {};
        var unlockedSkin = settings.unlockedSkin;
        var doBean = settings.doBean;

        var currentLevel = settings.currentLevel || 0;

        // --- VARS ---
        var finishedPopups = false;
        var completed = false;
        var isVip = VipManager.isVip();
        var viewport = Bento.getViewport();
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);
        var gameGUI;
        var supersOpened = SaveManager.load('supersOpened');
        var bestScore = SaveManager.load('bestScore');
        var superProgress = SaveManager.load('superProgress');
        var newBest = false;
        var closed = false;
        var socialCoins = 25;
        var bonusCoins = 50;
        var pointsPerCoin = Globals.pointsPerCoin;
        if (isVip) {
            pointsPerCoin = Math.round(Globals.pointsPerCoinVIP);
        }
        var coinValueOfScore = Math.floor(Globals.currentScore / pointsPerCoin);
        if (coinValueOfScore <= 0) {
            onClose();
            return;
        }
        if (Globals.currentScore > bestScore) {
            bestScore = Globals.currentScore;
            newBest = true;
            SaveManager.save('bestScore', bestScore);
        }
        if (!failed) {
            SaveManager.save('levelsSinceSkinAd', SaveManager.load('levelsSinceSkinAd') + 1);
            SaveManager.save('levelsSinceBonusAd', SaveManager.load('levelsSinceBonusAd') + 1);
            Globals.levelsThisBoot++;
        }
        var gameController = Bento.objects.get('gameController');
        var isSuper = (Ads.canShowRewarded() && superProgress >= Globals.superProgressSegments - 1 && !failed && SkinManager.getAllLockedPlantSkins().length > 0);
        var showBonus = (!failed && Ads.canShowRewarded() && (SaveManager.load('levelsSinceBonusAd') >= 2 && !isVip && !isSuper));
        var canTwitter = (!SaveManager.load('shownTwitter'));
        var canInstagram = (!SaveManager.load('shownInstagram'));
        var canFacebook = (!SaveManager.load('shownFacebook'));
        var doSocial = (showBonus && Utils.getRandom(10) > 8 && currentLevel > 6 && (canTwitter || canInstagram || canFacebook));
        var showCharacterPopup = ((!showBonus || isSuper) && SaveManager.load('levelsSinceSkinAd') >= 3 && SkinManager.getNextAdPot());
        var currentCountText;
        var currentCountTween;
        var hint = false;
        var thisSocial;
        if (doSocial) {
            if (canTwitter) {
                thisSocial = 'twit';
            } else {
                if (canInstagram) {
                    thisSocial = 'insta';
                } else {
                    if (canFacebook) {
                        thisSocial = 'face';
                    }
                }
            }
        }
        Globals.canAdRevive = true;

        // --- FUNCTIONS ---
        var hide = function () {
            if (hint) {
                hint.kill();
            }

            // halt keyframe animation
            Utils.killAnimateKeyframes(chestSprite);

            // hide main Box
            new Tween({
                from: new Vector2(1, 1),
                to: new Vector2(0.0001, 0.0001),
                in: 30,
                delay: 15,
                ease: 'easeInQuad',
                onUpdate: function (v, t) {
                    scoreBox.scale = v;
                },
                onComplete: function () {
                    scoreBox.removeSelf();
                }
            });

            // hide coin text
            if (currentCountText) {
                currentCountTween = new Tween({
                    from: currentCountText.scale.clone(),
                    to: new Vector2(0, 0),
                    in: 30,
                    delay: 15,
                    ease: 'easeInBack',
                    onUpdate: function (v, t) {
                        currentCountText.scale = v;
                    },
                    onComplete: function () {
                        currentCountText.removeSelf();
                    }
                });
            }

            new Particle({
                spriteSheet: 'coin',
                position: bonusButton.position,
                velocity: new Vector2(-5, -6),
                acceleration: new Vector2(0, 0.3),
                friction: 1,
                alpha: 0,
                removeAfterTime: 60,
            });
            new Particle({
                spriteSheet: 'coin',
                position: collectButton.position,
                velocity: new Vector2(5, -6),
                acceleration: new Vector2(0, 0.4),
                friction: 1,
                alpha: 0,
                removeAfterTime: 60,
            });
            bonusButtonGlow.alpha = 0;
            bonusButton.attach({
                name: 'rotateBehaviour',
                update: function (data) {
                    data.entity.rotation += 0.05;
                }
            });
            collectButton.attach({
                name: 'rotateBehaviour',
                update: function (data) {
                    data.entity.rotation -= 0.05;
                }
            });
        };

        var handleNextPopup = function () {
            new Tween({ in: 75,
                onComplete: function () {
                    if (finishedPopups) {
                        return;
                    }
                    if (doBean && Ads.canShowRewarded()) {
                        new SuperBeanDialog({
                            free: true,
                            onComplete: function () {
                                handleNextPopup();
                            }
                        });
                        doBean = null;
                        return;
                    }
                    if (isSuper && Ads.canShowRewarded()) {
                        new SuperBeanDialog({
                            onComplete: function () {
                                handleNextPopup();
                            }
                        });
                        isSuper = false;
                        return;
                    }
                    if (unlockedSkin) {
                        new PotUnlockedDialog({
                            titleText: Localization.getText('levelXPot').replace('{LEVEL}', (currentLevel + 1).toString()),
                            potSkin: unlockedSkin,
                            onComplete: function () {
                                handleNextPopup();
                            }
                        });
                        unlockedSkin = false;
                        return;
                    }
                    if (showCharacterPopup && SaveManager.load('levelsSinceSkinAd') !== 0 && Ads.canShowRewarded()) {
                        new PotAdDialog({
                            potSkin: SkinManager.getNextAdPot(),
                            onComplete: function () {
                                handleNextPopup();
                            }
                        });
                        showCharacterPopup = false;
                        return;
                    }
                    finishedPopups = true;
                    onClose();
                }
            });
        };

        var close = function () {
            if (closed) {
                return;
            }
            closed = true;
            hide();
            handleNextPopup();
        };

        var performBonus = function () {
            if (completed) {
                return;
            }
            completed = true;
            //Absolute Coins
            if (Utils.isDev()) {
                window.alert("This is a Rewarded Ad!");
                Bento.input.resetPointers();
                SaveManager.save('levelsSinceBonusAd', 0);
                Globals.attemptsSinceAd = 0;
                new CoinDialog({
                    numberOfCoins: bonusCoins,
                    onComplete: function () {
                        Utils.giveCoins(bonusCoins);
                        close();
                    }
                });
            } else {
                Ads.showRewarded(function () {
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "ads:coinsForAd",
                        value: 1
                    });
                    SaveManager.save('levelsSinceBonusAd', 0);
                    Globals.attemptsSinceAd = 0;
                    new CoinDialog({
                        numberOfCoins: bonusCoins,
                        onComplete: function () {
                            Utils.giveCoins(bonusCoins);
                            close();
                        }
                    });
                }, function (e) {
                    completed = false;
                }, "CoinsForAd");
            }
        };

        var performSocial = function (social) {
            completed = true;
            switch (social) {
            case 'twit':
                Utils.openUrl(Globals.socialURLs.twitter);
                new CoinDialog({
                    numberOfCoins: socialCoins,
                    onComplete: function () {
                        Utils.giveCoins(socialCoins);
                        SaveManager.save('shownTwitter', true);
                        close();
                    }
                });
                break;
            case 'insta':
                Utils.openUrl(Globals.socialURLs.instagram);
                new CoinDialog({
                    numberOfCoins: socialCoins,
                    onComplete: function () {
                        Utils.giveCoins(socialCoins);
                        SaveManager.save('shownInstagram', true);
                        close();
                    }
                });
                break;
            case 'face':
                Utils.openUrl(Globals.socialURLs.facebook);
                new CoinDialog({
                    numberOfCoins: socialCoins,
                    onComplete: function () {
                        Utils.giveCoins(socialCoins);
                        SaveManager.save('shownFacebook', true);
                        close();
                    }
                });
                break;
            }
        };

        var showChestScreen = function () {
            supersOpened++;
            SaveManager.save('supersOpened', supersOpened);
            SaveManager.save('superProgress', 0);
            gameController.setLevelProgress(0);
            hide();

            // hide stuff
            Utils.killAnimateKeyframes(chestSprite);
            chestSprite.alpha = 0;
            new Tween({
                from: scoreBacking.scale.x,
                to: 0,
                ease: 'easeOutQuint',
                in: 5,
                delay: 15,
                onUpdate: function (v, t) {
                    scoreBacking.scale = new Vector2(v, v);
                },
                onComplete: function () {
                    scoreBacking.removeSelf();
                }
            });

            // show super bonus wheel!
            new SuperBonusScreen({
                chestPosition: chestSprite.position.clone(),
                chestScale: chestSprite.scale.clone(),
                onClose: close
            });
        };

        var scoreBacking, scoreCounter;
        var dropScore = function () {
            scoreBacking = new SpriteContainer({
                imageName: 'ui/scoreholder',
                originRelative: new Vector2(0.5, 0.5),
                position: new Vector2(viewMid.x, 48),
                alpha: 1,
                scale: new Vector2(Globals.pixelScaleUI, Globals.pixelScaleUI),
                rotation: 0
            });
            gameGUI.getComponent('scoreBacking', function (original) {
                scoreBacking.position = original.position.clone();
            });
            scoreCounter = new GameCounter({
                position: new Vector2(0, 176),
                align: 'center',
                value: Globals.currentScore,
                scale: new Vector2(0.8, 0.8)
            });
            gameGUI.hideScore(true);
            gameGUI.getComponent('scoreCounter', function (original) {
                scoreCounter.position = original.position.clone();
            });
            chestAnchor.attach(scoreBacking);
            scoreBacking.attach(coinSprite);
            scoreBacking.attach(scoreCounter);
            //gameGUI.hideScore();
            new Tween({
                from: scoreBacking.position.y,
                to: viewport.height * 0.5 + (showBonus ? 4 : 32),
                in: 80,
                oscilations: 4,
                ease: 'easeOutBounce',
                onUpdate: function (v, t) {
                    scoreBacking.position.y = v;
                },
                onComplete: scoreToCoins
            });
        };

        var scoreToCoins = function () {
            scoreCounter.setValue(Globals.currentScore);
            var coinsToGive = coinValueOfScore;
            var addCoin = function () {
                //todo:  play sound
                var angle = Utils.getRandomRange(-3, 3);
                coinSprite.attach(new Particle({
                    spriteSheet: 'coin',
                    position: new Vector2(400, 0).rotateRadian(angle).addTo(new Vector2(0, 0)),
                    alpha: 1,
                    scale: new Vector2(1, 1),
                    rotation: Utils.getRandomRangeFloat(-1, 1),
                    rotationRate: Utils.getRandomRangeFloat(-0.1, 0.1),
                    velocity: new Vector2(-400, 0).rotateRadian(angle).addTo(new Vector2(0, 0)).scalarMultiply(0.2),
                    acceleration: new Vector2(0, 0),
                    friction: 1,
                    removeAfterTime: 5,
                    dontAttach: true
                }));
            };

            new Tween({
                from: Globals.currentScore,
                to: coinValueOfScore,
                in: 30,
                delay: 0,
                ease: 'easeInOutQuad',
                onUpdate: function (v, t) {
                    scoreCounter.setValue(Math.floor(v));
                    if (coinsToGive && v - coinValueOfScore < coinsToGive * pointsPerCoin) {
                        coinsToGive--;
                        addCoin();
                    }
                }
            });
            var scoreBackingYStart = scoreBacking.position.y;
            var scoreCounterYStart = scoreCounter.position.y;
            new Tween({
                from: 0,
                to: 1,
                in: 30,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    scoreCounter.position.y = scoreCounterYStart + 0 * v;
                    scoreBacking.position.y = scoreBackingYStart + 5 * v;
                    coinSprite.scale.x = v * 0.55;
                    coinSprite.scale.y = v * 0.55;
                },
            });
            showButtons();
        };

        var collectCoins = function (numberOfCoins, andClose) {
            Utils.giveCoins(numberOfCoins);

            new Tween({
                from: 1,
                to: 0,
                in: 5,
                delay: 0,
                ease: 'easeInQuad',
                onUpdate: function (v, t) {
                    coinSprite.scale = Globals.pixelScaleUIV.clone().scalarMultiply(v);
                    scoreBacking.scale = Globals.pixelScaleUIV.clone().scalarMultiply(v);
                },
                onComplete: function () {
                    coinSprite.removeSelf();
                }
            });

            new Tween({ in: 5,
                onComplete: function (v, t) {
                    for (var i = 0; i < 15; i++) {
                        Bento.attach(new Particle({
                            imageName: 'sparkle',
                            position: scoreBacking.position.clone(),
                            alpha: 1,
                            scale: Globals.pixelScaleV.scalarMultiply(3),
                            rotation: Utils.getRandomRangeFloat(-2, 2),
                            rotationRate: 0,
                            velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-3, 0)),
                            acceleration: new Vector2(0, 0.025),
                            friction: 1,
                            removeAfterTime: 100,
                            removeEffect: 'scale',
                            dontAttach: true,
                            float: true,
                            z: Globals.layers.screens + 0.1
                        }));
                    }
                }
            });
            new Tween({ in: 5,
                onComplete: function (v, t) {
                    for (var i = 0; i < Math.min(numberOfCoins, 30); i++) {
                        Bento.attach(new Particle({
                            spriteSheet: 'coin',
                            position: scoreBacking.position.clone(),
                            alpha: 1,
                            scale: Globals.pixelScaleV,
                            rotation: Utils.getRandomRangeFloat(-1, 1),
                            rotationRate: Utils.getRandomRangeFloat(-0.1, 0.1),
                            velocity: new Vector2(Utils.getRandomRangeFloat(-2, 2), Utils.getRandomRangeFloat(-4, 0)),
                            acceleration: new Vector2(0, 0.065),
                            friction: 1,
                            removeAfterTime: 300,
                            dontAttach: true,
                            float: true,
                            z: Globals.layers.screens + 0.1
                        }));
                    }
                }
            });

            new Tween({
                from: scoreCounter.position.clone(),
                to: new Vector2(0, 20),
                in: 20,
                delay: 0,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    scoreCounter.position = v;
                }
            });

            if (!currentCountText) {
                currentCountText = new GameCounter({
                    z: Globals.layers.screens + 0.1,
                    imageName: "addcoincounter",
                    position: new Vector2(viewMid.x, viewMid.y + 20 + (showBonus ? 4 : 32)),
                    align: 'center',
                    value: '+' + numberOfCoins,
                    scale: new Vector2(0, 0),
                    float: true
                });
                Bento.attach(currentCountText);
                currentCountTween = new Tween({
                    from: new Vector2(0, 0),
                    to: Globals.pixelScaleUIV.scalarMultiply(1.25),
                    in: 30,
                    ease: 'easeOutBack',
                    onUpdate: function (v, t) {
                        currentCountText.scale = v;
                    }
                });
            } else {
                currentCountText.setValue('+' + (currentCountText.getValue(true) + numberOfCoins));
                if (currentCountTween) {
                    currentCountTween.stop();
                    currentCountTween.removeSelf();
                }
                currentCountTween = new Tween({
                    from: currentCountText.scale.scalarMultiply(0.75),
                    to: Globals.pixelScaleUIV.scalarMultiply(1.25),
                    in: 30,
                    ease: 'easeOutBack',
                    onUpdate: function (v, t) {
                        currentCountText.scale = v;
                    }
                });
            }

            effects.alpha = 1;
            // bloom halo burst outwards
            Utils.killAnimateKeyframes(bloomHalo);
            bloomHalo.keyFramesTween = Tween({
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
            Utils.killAnimateKeyframes(bloomHard);
            bloomHard.keyFramesTween = new Tween({
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
                        to: 0,
                        in: 30,
                        ease: 'easeInCubic',
                        onUpdate: function (v, t) {
                            bloomHard.scale.x = v;
                            bloomHard.scale.y = v;
                        },
                        onComplete: function () {
                            if (andClose) {
                                close();
                                if (currentCountText) {
                                    new Tween({
                                        from: currentCountText.scale.clone(),
                                        to: new Vector2(0, 0),
                                        in: 30,
                                        ease: 'linear',
                                        onUpdate: function (v, t) {
                                            currentCountText.scale = v;
                                        }
                                    });
                                }
                            } else {
                                bloomHard.removeSelf();
                                bloomHalo.removeSelf();
                            }
                        }
                    });
                }
            });
        };

        var coinsTillNextPot;
        if (SkinManager.getAllLockedPotSkins().length !== 0 && SkinManager.getLowestPotSkinCost() !== undefined) {
            coinsTillNextPot = SkinManager.getLowestPotSkinCost() - (SaveManager.load('coinCount') + coinValueOfScore);
        }
        var showButtons = function () {
            var hintPos = (viewMid.y - 90 + 68) / 2;
            var hintText;
            var hintIcon;

            // show toast
            if (showBonus) {
                if (Utils.isDefined(coinsTillNextPot)) {
                    if (coinsTillNextPot > 0) {
                        hintIcon = 'ui/icons/pot_info';
                        hintText = Localization.getText('hint1').replace('{COINS}', coinsTillNextPot);
                    } else {
                        hintIcon = 'ui/icons/pot_info';
                        hintText = Localization.getText('hint2');
                    }
                }
                if (isSuper) {
                    hintIcon = 'ui/icons/bean_info';
                    hintText = Localization.getText('hint3');
                }
            }
            new Tween({ in: 60,
                onComplete: function () {
                    if (hintIcon && hintText) {
                        hint = new Toast({
                            imageName: hintIcon,
                            text: hintText,
                            position: new Vector2(viewMid.x, hintPos),
                            timeOnScreen: -1,
                            special: ((coinsTillNextPot <= coinValueOfScore || (coinsTillNextPot <= 50 + coinValueOfScore && showBonus)) && coinsTillNextPot > 0) ? true : false
                        });
                        Bento.attach(hint);
                    }
                }
            });

            //setup stuff on buttons
            collectButton.alpha = 0;
            bonusButton.alpha = 0;
            bonusButtonGlow.alpha = 0;
            collectButton.setActive(false);
            bonusButton.setActive(false);

            // give coins after countdown
            new Tween({ in: 45,
                onComplete: function () {
                    collectCoins(coinValueOfScore, false);
                    EventSystem.fire('GameAnalytics-addResourceEvent', {
                        flowType: 1,
                        currency: 'coins',
                        amount: coinValueOfScore,
                        itemType: "ingame",
                        itemId: "fromScore"
                    });
                }
            });

            // attach and animate chest if we need to
            if (showBonus) {
                chestAnchor.attach(collectButton);
                var preScale = collectButton.scale;
                new Tween({
                    from: new Vector2(0, 0),
                    to: preScale,
                    in: 60,
                    ease: 'easeOutElastic',
                    oscillations: 6,
                    delay: 60,
                    decay: 15,
                    onStart: function () {
                        collectButton.setActive(true);
                        collectButton.alpha = 1;
                    },
                    onUpdate: function (v, t) {
                        collectButton.scale = v;
                    }
                });

                if (isSuper) {
                    chestAnchor.attach(bonusButtonGlow);
                }
                chestAnchor.attach(bonusButton);

                new Tween({
                    from: 0.7,
                    to: 1,
                    in: 30,
                    ease: 'easeOutElastic',
                    oscillations: 6,
                    delay: 0,
                    decay: 15,
                    onStart: function () {
                        bonusButton.alpha = 1;
                        bonusButtonGlow.alpha = 1;
                        bonusButton.setActive(false);
                    },
                    onUpdate: function (v, t) {
                        bonusButton.scale.x = v * 2 * Globals.pixelScaleUI + Math.cos(entity.timer * 0.12) * 0.008;
                        bonusButton.scale.y = v * 2 * Globals.pixelScaleUI - Math.cos(entity.timer * 0.12) * 0.008;
                        var glowScale = bonusButton.scale.x + Math.cos(entity.timer * 0.24) * 0.005;
                        bonusButtonGlow.scale = new Vector2(glowScale, glowScale);
                    },
                    onComplete: function () {
                        bonusButton.attach(bonusButtonBounceBehaviour);
                        bonusButton.setActive(true);
                    }
                });

                if (isSuper) {
                    var superIcon = gameGUI.superIcon;
                    // make chest fly out of gameGUI
                    chestSprite.keyFramesTween = new Tween({
                        from: superIcon.position,
                        to: superIcon.position.add(new Vector2(0, -300)),
                        in: 15,
                        delay: 0,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            superIcon.position = v;
                        },
                        onComplete: function () {
                            //attach hi res chest in place of the icon
                            chestAnchor.attach(chestSprite);
                            chestSprite.sprite.setAnimation('closed');
                            // land chest on button
                            chestSprite.keyFramesTween = new Tween({
                                from: superIcon.position.add(entity.position.scalarMultiply(-1)),
                                to: bonusButton.position.add(new Vector2(-30, (isVip ? 0 : 24))).add(entity.position.scalarMultiply(-1)),
                                in: 40,
                                ease: 'easeInQuad',
                                onUpdate: function (v, t) {
                                    chestSprite.position = v;
                                },
                                onComplete: function () {
                                    // bounce
                                    new Tween({
                                        from: entity.position.y + 3,
                                        to: entity.position.y,
                                        in: 70,
                                        decay: 8,
                                        oscilations: 4,
                                        ease: 'easeOutElastic',
                                        onUpdate: function (v, t) {
                                            entity.position.y = v;
                                        }
                                    });

                                    // wiggle the chest
                                    var bounceWiggleKeyframes = [{
                                        moveDownBy: -20,
                                        rotateBy: 0.1,
                                        duration: 12,
                                    }, {
                                        moveDownBy: 20,
                                        rotateBy: 0.1,
                                        duration: 12,
                                        run: function () {
                                            chestSprite.sprite.setAnimation('bounce');
                                        }
                                    }, {
                                        rotateBy: -0.1
                                    }, {
                                        rotateBy: 0
                                    }, {
                                        moveDownBy: -10,
                                        rotateBy: -0.15,
                                        duration: 7,
                                        run: function () {
                                            chestSprite.sprite.setAnimation('closed');
                                        }
                                    }, {
                                        moveDownBy: 10,
                                        rotateBy: -0.05,
                                        duration: 7,
                                        run: function () {
                                            chestSprite.sprite.setAnimation('bounce');
                                        }
                                    }, {
                                        rotateBy: 0.05,
                                    }, {
                                        rotateBy: 0,
                                    }, {
                                        moveDownBy: -5,
                                        rotateBy: 0.075,
                                        duration: 5,
                                        run: function () {
                                            chestSprite.sprite.setAnimation('closed');
                                        }
                                    }, {
                                        moveDownBy: 5,
                                        rotateBy: 0.025,
                                        duration: 5,
                                        run: function () {
                                            chestSprite.sprite.setAnimation('bounce');
                                        }
                                    }, {
                                        rotateBy: -0.05,
                                        run: function () {
                                            chestSprite.sprite.setAnimation('closed');
                                        }
                                    }, {
                                        duration: 50
                                    }, {
                                        rotateBy: -0.1,
                                        duration: 4
                                    }, {
                                        rotateBy: 0.1,
                                        duration: 3
                                    }, {
                                        rotateBy: 0.05,
                                        duration: 3,
                                        run: function () {
                                            for (var i = Utils.getRandomRange(3, 5) - 1; i >= 0; i--) {
                                                new Particle({
                                                    imageName: 'sparkle',
                                                    position: chestSprite.position.clone().add(new Vector2(0, -10)),
                                                    alpha: 1,
                                                    scale: Globals.pixelScaleV.clone(),
                                                    rotation: Utils.getRandomRangeFloat(-2, 2),
                                                    rotationRate: Utils.getRandomRangeFloat(-0.4, 0.4),
                                                    originRelative: new Vector2(0.5, 0.5),
                                                    velocity: new Vector2(Utils.getRandomRangeFloat(-1, 1), Utils.getRandomRangeFloat(-1, -2)),
                                                    acceleration: new Vector2(0, 0.07),
                                                    removeAfterTime: Utils.getRandomRangeFloat(20, 50),
                                                    removeEffect: 'scale',
                                                    float: true,
                                                    z: Globals.layers.screens + 0.1
                                                });
                                            }
                                        }
                                    }, {
                                        rotateBy: -0.05,
                                        duration: 3
                                    }, {
                                        rotateBy: -0.04,
                                        duration: 3
                                    }, {
                                        rotateBy: 0.04,
                                        duration: 3
                                    }, {
                                        rotateBy: 0.03,
                                        duration: 3
                                    }, {
                                        rotateBy: -0.03,
                                        duration: 3,
                                        next: 11 // move back to step 11
                                    }];
                                    //start keyframes
                                    Utils.animateKeyframes(chestSprite, bounceWiggleKeyframes, 0);
                                }
                            });
                        }
                    });
                }
            } else {
                new Tween({ in: 30,
                    onComplete: function () {
                        close();
                    }
                });
            }
        };

        // --- COMPONENTS ---
        var conversionText = new Text({
            position: new Vector2(-1.5, -50),
            text: Localization.getText('1coinXpoints').replace("{X}", pointsPerCoin.toString()),
            fontSettings: Utils.getTextStyle('conversionText')
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
        var coinSprite = new SpriteContainer({
            imageName: 'ui/big_coin',
            position: new Vector2(0, -60),
            originRelative: new Vector2(0.5, 0.5),
            alpha: 1,
            scale: new Vector2(0, 0),
            rotation: 0
        });
        var chestSprite = new SpriteContainer({
            name: 'chestSprite',
            spriteSheet: 'ui/big-chest',
            position: new Vector2(0, -100),
            originRelative: new Vector2(0.5, 0.5),
            alpha: 1,
            scale: Globals.pixelScaleUIV.clone().scalarMultiply(0.5),
            rotation: 0
        });
        var ribbon = new SpriteContainer({
            imageName: 'ui/ribbon',
            originRelative: new Vector2(0.5, 0.3),
            position: new Vector2(0, -72),
            scale: Globals.pixelScaleUIV.clone()
        });

        var scoreBox = new Entity({
            z: 0,
            name: 'scorebox',
            family: [''],
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.5 + 20),
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
                ribbon,
                new Text({
                    position: new Vector2(0, -72),
                    text: Localization.getText('coinBonus'),
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    fontSize: 20,
                    fontColor: '#fbffbe',
                    align: 'center',
                    textBaseline: 'middle',
                    maxWidth: 128,
                    maxHeight: 20
                }),
                conversionText
            ]
        });

        var buttonScale = new Vector2(Globals.pixelScaleUI * 0.5, Globals.pixelScaleUI * 1);
        var collectButtonContent = new Entity({
            name: 'collectButtonContent',
            scale: new Vector2(1 / buttonScale.x, 1 / buttonScale.y).multiply(Globals.pixelScaleUIV),
            components: [
                new SpriteContainer({
                    imageName: 'ui/icons/close',
                    originRelative: new Vector2(0.5, 0.5),
                    scale: new Vector2(0.8, 0.8)
                })
            ]
        });
        var collectButton = new ClickButton({
            name: 'collectButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            alpha: 1,
            position: new Vector2(viewport.width * 0.5 + 72, viewport.height * 0.5 - 64),
            scale: buttonScale,
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                if (completed) {
                    return;
                }
                completed = true;
                chestSprite.alpha = 0;
                if (showBonus) {
                    if (isSuper) {
                        EventSystem.fire('GameAnalytics-addDesignEvent', {
                            eventId: "ads:superBonusAd",
                            value: 0
                        });
                    } else {
                        EventSystem.fire('GameAnalytics-addDesignEvent', {
                            eventId: "ads:coinsForAd",
                            value: 0
                        });
                    }
                    SaveManager.save('levelsSinceBonusAd', 0);
                    Globals.attemptsSinceAd = 0;
                }
                close();
            },
            components: [
                collectButtonContent
            ]
        });

        var bonusButtonBounceBehaviour = {
            name: "bounceBehaviour",
            update: function (data) {
                data.entity.scale.x = 2 * Globals.pixelScaleUI + Math.cos(entity.timer * 0.12) * 0.004;
                data.entity.scale.y = 2 * Globals.pixelScaleUI - Math.cos(entity.timer * 0.12) * 0.004;
                var glowScale = data.entity.scale.x + Math.cos(entity.timer * 0.24) * 0.01;
                bonusButtonGlow.scale = new Vector2(glowScale, glowScale);
            }
        };
        var bonusButtonGlow = new SpriteContainer({
            imageName: 'ui/button-glow',
            originRelative: new Vector2(0.5, 0.5),
            position: viewMid.clone().add(new Vector2(0, 80)),
            scale: Globals.pixelScaleUIV.clone(),
        });


        var bonusButton = new ClickButton({
            name: 'bonusButtonChest',
            alpha: 1,
            sfx: 'sfx_clickbutton',
            imageName: (doSocial) ? ((thisSocial === 'twit') ? 'ui/bluebutton' : 'ui/button_' + thisSocial) : 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: viewMid.clone().add(new Vector2(0, 80)),
            scale: Globals.pixelScaleUIV.clone().scalarMultiply(2),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                if (doSocial) {
                    performSocial(thisSocial);
                } else {
                    performBonus();
                }
            },
            components: (doSocial) ? [
                new Text({
                    position: new Vector2(35, 3.5),
                    scale: new Vector2(0.5, 0.5).scalarMultiply(1 / Globals.pixelScaleUI),
                    maxWidth: 56,
                    text: Localization.getText('XCoins').replace('{COUNT}', socialCoins.toString()),
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    fontSize: 16,
                    fontColor: '#fbffbe',
                    align: 'center',
                    textBaseline: 'middle',
                    linebreaks: true
                }),
                new SpriteContainer({
                    imageName: 'ui/icons/' + thisSocial,
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-100, 0),
                    alpha: 1,
                    scale: new Vector2(0.5, 0.5),
                    rotation: 0
                }),
                new SpriteContainer({
                    imageName: 'coin',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-64, 51),
                    scale: new Vector2(0.875, 0.875),
                    rotation: -0.2
                })
            ] : [
                new Text({
                    position: new Vector2(70, 8),
                    scale: new Vector2(0.5, 0.5).scalarMultiply(1 / Globals.pixelScaleUI),
                    maxWidth: 56,
                    text: Localization.getText('XCoins').replace('{COUNT}', bonusCoins.toString()),
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    fontSize: 16,
                    fontColor: '#fbffbe',
                    align: 'center',
                    textBaseline: 'middle',
                    linebreaks: true
                }),
                (isVip) ? {
                    name: 'blank'
                } : new SpriteContainer({
                    imageName: 'ui/icons/vid2',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-100, 0),
                    alpha: 1,
                    scale: new Vector2(0.5, 0.5),
                    rotation: 0
                }),
                new SpriteContainer({
                    imageName: 'coin',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-144, 51),
                    scale: new Vector2(0.875, 0.875),
                    rotation: -0.2
                })
            ]
        });

        // collect the game gui
        var getterBehaviour = {
            name: "getterBehaviour",
            update: function () {
                if (!gameGUI) {
                    gameGUI = Bento.objects.get('gameGUI');
                    dropScore();
                }
            }
        };
        //effect holder
        var effects = new Entity({
            name: 'effects',
            position: viewMid.clone().add(new Vector2(0, (showBonus ? 4 : 32))),
            components: [
                bloomHard,
                bloomHalo
            ]
        });
        //bg fill
        var fill = new Fill({
            dimension: new Rectangle(0, -8, viewport.width, viewport.height + 16),
            float: true,
            color: [0, 0, 0, 0.5]
        });

        // --- ENTITY ---
        var chestAnchor = new Entity({
            name: 'chestAnchor'
        });
        var entity = new Entity({
            z: Globals.layers.screens,
            name: 'gameOverScreen',
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            components: [
                getterBehaviour,
                fill,
                scoreBox,
                effects,
                chestAnchor
            ]
        });

        // animate in the screen
        new Tween({
            from: 0.5,
            to: 1,
            in: 100,
            decay: 8,
            oscilations: 5,
            ease: 'easeOutElastic',
            onUpdate: function (v, t) {
                ribbon.scale.x = Globals.pixelScaleUI * v;
            }
        });
        new Tween({
            from: 0.1,
            to: 1,
            in: 20,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                scoreBox.scale = new Vector2(v, v);
            }
        });
        return entity;
    };
});