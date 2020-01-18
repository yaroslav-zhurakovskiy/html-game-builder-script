/**
 * Module description
 * @moduleName GameGUI
 * @snippet GameGUI.snippet
GameGUI({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/gamegui', [
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
    'components/gamecounter',
    'ui/cointracker',
    'entities/particle',
    'modules/savemanager',
    'modules/skinmanager'
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
    GameCounter,
    CoinTracker,
    Particle,
    SaveManager,
    SkinManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var gameController;
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);

        // --- PARAMETERS ---
        var position = new Vector2(0, 0);

        // --- VARS ---
        var levelProgress = 0;
        var currentLevel = SaveManager.load('currentLevel');
        var lastCurrentLevel = 0;
        var currentScore = 0;
        var superProgress = SaveManager.load('superProgress');
        var potSkinsThisLevel = SkinManager.getPotSkinsForLevel(currentLevel);
        var plantSkins = SkinManager.getAllLockedPlantSkins();

        var isHidden = false;
        var hide = function (snap) {
            if (isHidden) {
                return;
            }
            isHidden = true;
            if (snap) {
                entity.position = position.add(new Vector2(0, -128));
                return;
            }
            new Tween({
                from: entity.position.clone(),
                to: position.add(new Vector2(0, -128)),
                in: 20,
                ease: 'easeInBack',
                onUpdate: function (v, t) {
                    entity.position = v;
                }
            });
        };
        var show = function (snap) {
            if (!isHidden) {
                return;
            }
            isHidden = false;
            if (snap) {
                entity.position = position;
                return;
            }
            new Tween({
                from: entity.position.clone(),
                to: position.clone(),
                in: 20,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    entity.position = v;
                }
            });
        };

        // --- COMPONENTS ---
        var statusBG = new SpriteContainer({
            imageName: 'ui/status-back',
            originRelative: new Vector2(0.5, 0),
            position: new Vector2(viewMid.x, -6),
            scale: new Vector2(Globals.pixelScaleUI * 2, Globals.pixelScaleUI * 2)
        });

        var levelCurrentText = new Text({
            fontSettings: Utils.getTextStyle('levelText'),
            position: new Vector2(viewMid.x - 52.5, 43),
            text: '-',
            maxWidth: 16,
            maxHeight: 16
        });

        var levelNextText = new Text({
            fontSettings: Utils.getTextStyle('levelText'),
            position: new Vector2(viewMid.x + 52.5, 43),
            text: '-',
            maxWidth: 16,
            maxHeight: 16
        });

        var potPresentSprite = new SpriteContainer({
            spriteSheet: 'boxes/' + (potSkinsThisLevel[0] || 'default'),
            position: new Vector2(viewMid.x + 52, 41),
            scale: Globals.pixelScaleUIV
        }).attach({
            name: 'wobbleBehaviour',
            update: function () {
                this.parent.rotation = Math.sin(this.parent.timer * 0.1) * 0.2;
            }
        });

        var scoreBacking = new SpriteContainer({
            imageName: 'ui/scoreholder',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(viewMid.x, 48),
            alpha: 1,
            scale: new Vector2(Globals.pixelScaleUI, Globals.pixelScaleUI),
            rotation: 0
        });
        var scoreCounter = new GameCounter({
            position: new Vector2(0, 176),
            align: 'center',
            value: currentScore,
            scale: new Vector2(0.8, 0.8)
        });
        scoreCounter.setValue(0);
        scoreBacking.attach(scoreCounter);

        var superProgressBack = new SpriteContainer({
            name: 'superProgressBack',
            imageName: 'ui/beanprogress',
            position: new Vector2(0, 12),
            originRelative: new Vector2(0.5, 0.5),
        });
        var superProgressFilled = Bento.assets.getImage('ui/beanprogress-filled');
        var totalWidth = superProgressFilled.width;
        var superMarker = new SpriteContainer({
            name: 'superMarker',
            imageName: 'ui/icons/super-marker',
            position: new Vector2(0, -20),
            originRelative: new Vector2(0.5, 0.5),
            segment: -1
        });
        var superIcon = new SpriteContainer({
            name: 'superIcon',
            spriteSheet: 'beans/' + (plantSkins[0] || 'daisy'),
            position: new Vector2(210, -30),
            scale: new Vector2(0.66, 0.66)
        });
        var beanIcon = new SpriteContainer({
            name: 'beanIcon',
            spriteSheet: 'beans/' + (plantSkins[0] || 'daisy'),
            position: new Vector2(0, -30),
            scale: new Vector2(0.66, 0.66)
        });

        var superProgressUI = new Entity({
            name: 'superProgressUI',
            position: new Vector2(viewMid.x, 36),
            scale: Globals.pixelScaleUIV.clone(),
            components: [
                superProgressBack, {
                    name: 'superProgressBehaviour',
                    update: function (data) {
                        var verticalMovement = (Math.sin(superMarker.ticker * 0.2) * 1);
                        if (superProgress !== this.segment) {
                            this.segment = superProgress;
                            var displayProgress = Utils.clamp(0, superProgress, Globals.superProgressSegments - 1);
                            var idealPosition = new Vector2(((displayProgress + 0.5) / Globals.superProgressSegments - 0.5) * totalWidth, (displayProgress === Globals.superProgressSegments - 1) ? -80 : -25);
                            new Tween({
                                from: superMarker.position.clone(),
                                to: idealPosition,
                                in: 15,
                                ease: 'easeInOutQuad',
                                onUpdate: function (v, t) {
                                    superMarker.position = v;
                                }
                            });
                        }
                        if (superProgress >= Globals.superProgressSegments - 1) {
                            superIcon.scale.x = 0.66 + Math.sin(superMarker.timer * 0.2) * 0.1 * (levelProgress + 0.2);
                            superIcon.scale.y = 0.66 + Math.cos(superMarker.timer * 0.2) * 0.1 * (levelProgress + 0.2);
                            superIcon.rotation = Math.cos(superMarker.timer * 0.33) * 0.1 * (levelProgress + 0.2);
                        }
                        superMarker.position.y += verticalMovement;

                    },
                    draw: function (data) {
                        var r = data.renderer;
                        var img = superProgressFilled;
                        var percentComplete = Math.min(1, (1 / Globals.superProgressSegments * superProgress + levelProgress / Globals.superProgressSegments));
                        r.drawImage(
                            img,
                            0,
                            0,
                            img.width * percentComplete,
                            img.height,
                            0 - (img.width * 0.5), -22,
                            img.width * percentComplete,
                            img.height * 1
                        );
                    },
                },
                superIcon,
                superMarker
            ]
        });

        var statusBarBack = new SpriteContainer({
            name: 'statusBarBack',
            imageName: 'ui/statusbar-back',
            position: new Vector2(viewMid.x, 43),
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV
        });
        var statusBarImage = Bento.assets.getImage('ui/statusbar-filled');
        var statusBarFrames = 9;
        var statusBarFrameNow = 0;
        var statusBarBehaviour = {
            name: 'statusBarBehaviour',
            position: new Vector2(viewMid.x, 46),
            scale: new Vector2(Globals.pixelScaleUI, Globals.pixelScaleUI),
            percent: 0,
            update: function (data) {
                statusBarFrameNow += 0.5 * data.speed;
                statusBarFrameNow = statusBarFrameNow % statusBarFrames;
                this.percent = levelProgress;
            },
            draw: function (data) {
                var r = data.renderer;
                var img = statusBarImage;
                r.drawImage(
                    img,
                    0,
                    0 + (Math.floor(statusBarFrameNow) * img.height * (1 / statusBarFrames)),
                    img.width * this.percent,
                    img.height * (1 / statusBarFrames),
                    this.position.x - (img.width * 0.5 * this.scale.x),
                    this.position.y - (img.height * (1 / statusBarFrames) * 0.5 * this.scale.y),
                    img.width * this.scale.x * this.percent,
                    img.height * this.scale.y * (1 / statusBarFrames)
                );
            }
        };

        if (!SaveManager.load('hasInitialBean')) {
            superProgressUI.attach(beanIcon);
            superIcon.sprite.setSpriteSheet('beans/' + plantSkins[1]);
        }

        var behavior = {
            name: 'behaviorComponent',
            update: function (data) {
                if (!gameController) {
                    gameController = Bento.objects.get('gameController');
                    if (!gameController) {
                        return;
                    }
                }
                levelProgress = gameController.getLevelProgress();
                currentLevel = gameController.getCurrentLevel();
                superProgress = SaveManager.load('superProgress');
                currentScore = Globals.currentScore;

                if (currentLevel !== lastCurrentLevel) {
                    levelCurrentText.setText(currentLevel);
                    levelNextText.setText(currentLevel + 1);
                }
                if (scoreCounter.getValue() !== currentScore) {
                    var scoreDiff = currentScore - scoreCounter.getValue();
                    if (scoreDiff > 0) {
                        if (scoreDiff > 300) {
                            scoreCounter.setValue(scoreCounter.getValue() + 100);
                        }
                        if (scoreDiff > 30) {
                            scoreCounter.setValue(scoreCounter.getValue() + 10);
                        }
                        scoreCounter.setValue(scoreCounter.getValue() + 1);
                    } else {
                        scoreCounter.setValue(currentScore);
                    }
                }

                lastCurrentLevel = currentLevel;
                entity.alpha = Globals.showGUI ? 1 : 0;
            }
        };

        var coinTracker = new CoinTracker({
            position: new Vector2(viewport.width - 12, 19),
            playSound: true
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.gui,
            name: 'gameGUI',
            position: position,
            float: true,
            components: [
                scoreBacking,
                statusBG,
                statusBarBack,
                levelCurrentText,
                (potSkinsThisLevel.length === 0) ? levelNextText : potPresentSprite,
                behavior,
                statusBarBehaviour,
                (plantSkins.length > 0) ? superProgressUI : {
                    name: 'blank'
                },
                coinTracker
            ]
        }).extend({
            hide: hide,
            show: show,
            getCoinTracker: function () {
                return coinTracker;
            },
            showScore: function (dontAnimate) {
                if (dontAnimate) {
                    scoreBacking.position.y = 48;
                } else {
                    new Tween({
                        from: scoreBacking.position.y,
                        to: 48,
                        in: 15,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            scoreBacking.position.y = v;
                        }
                    });
                }
            },
            hideScore: function (dontAnimate) {
                if (dontAnimate) {
                    scoreBacking.position.y = 0;
                } else {
                    new Tween({
                        from: scoreBacking.position.y,
                        to: 0,
                        in: 15,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            scoreBacking.position.y = v;
                        }
                    });
                }
            },
            superIcon: superIcon
        });
        return entity;
    };
});