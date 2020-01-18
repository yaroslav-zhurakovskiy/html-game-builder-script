/**
 * Module description
 * @moduleName IntroCutscene
 * @snippet IntroCutscene.snippet
IntroCutscene({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/introcutscene', [
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
    'modules/gameanalytics',
    'ui/tutorialscreen',
    'entities/effects/sparkleparticle',
    'entities/particle',
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
    SpriteContainer,
    GameAnalytics,
    TutorialScreen,
    Sparkle,
    Particle,
    SaveManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var gameController = Bento.objects.get('gameController');
        var player = settings.player || Bento.objects.get('player');
        var camera = settings.camera || Bento.objects.get('camera');
        var gameGUI = settings.gameGUI || Bento.objects.get('gameGUI');
        var isComplete = false;

        // --- VARS ---
        camera.setViewScale(0.5);
        var cameraPosition = new Vector2(viewport.width * 0.5, player.position.y - 16);
        camera.setTargetPosition(cameraPosition);
        camera.position = player.position.clone();
        player.setEnabled(false);
        player.visible = false;
        gameGUI.hide(true);


        // --- FUNCTIONS ---
        var snapHead = function () {
            headSprite.sprite.setAnimation('default');
            headSprite.sprite.setFrame(0);
            headSprite.sprite.onCompleteCallback = function () {
                headSprite.sprite.setAnimation('idle');
            };
        };
        var wiggle = function (entity, time, speed, intensity, offset) {
            new Tween({
                from: intensity,
                to: 0,
                in: time,
                ease: 'linear',
                onUpdate: function (v, t) {

                    if (isComplete) {
                        return;
                    }
                    entity.rotation = offset + Math.sin(t * speed) * v;
                },
                onComplete: function () {

                }
            });
        };
        var startGame = function () {
            isComplete = true;
            Bento.audio.stopSound('sfx_intro');
            Bento.audio.playSound('sfx_start');
            // enable the player
            entity.visible = false;
            player.visible = true;
            player.setEnabled(true);
            // zoom camera to default scale 
            gameController.setIsPlaying(true);
            gameController.setCanScrollCamera(true);
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
                progression01: "level_1"
            });
            //remove cutscene entity
            entity.removeSelf();
            // start tutorial
            Globals.gameState = Globals.gameStates.tutorial;
            Bento.objects.attach(new TutorialScreen({}));
        };

        var startCutscene = function () {

            // first wiggle
            new Tween({ in: 60,
                onComplete: function () {
                    if (isComplete) {
                        return;
                    }
                    Bento.audio.playSound('sfx_intro');
                    new Tween({
                        from: sproutSprite.scale.clone(),
                        to: sproutSprite.scale.scalarMultiply(1.25),
                        in: 60,
                        ease: 'easeOutBack',
                        onUpdate: function (v, t) {
                            sproutSprite.scale = v;
                        }
                    });
                    wiggle(sproutSprite, 60, 0.5, 0.3, -0.1);
                    wiggle(fakePlayer, 80, -0.5, 0.0125, 0);
                }
            });
            //second wiggle
            new Tween({ in: 120,
                onComplete: function () {
                    if (isComplete) {
                        return;
                    }
                    new Tween({
                        from: sproutSprite.scale.clone(),
                        to: sproutSprite.scale.scalarMultiply(1.25),
                        in: 60,
                        ease: 'easeOutBack',
                        onUpdate: function (v, t) {
                            sproutSprite.scale = v;
                        }
                    });
                    wiggle(sproutSprite, 60, 0.35, 0.4, -0.1);
                    wiggle(fakePlayer, 80, 0.5, 0.025, 0);
                }
            });
            // third wiggle
            new Tween({ in: 180,
                onComplete: function () {
                    if (isComplete) {
                        return;
                    }
                    new Tween({
                        from: sproutSprite.scale.clone(),
                        to: sproutSprite.scale.scalarMultiply(1.25),
                        in: 60,
                        ease: 'easeOutBack',
                        onUpdate: function (v, t) {
                            if (isComplete) {
                                return;
                            }
                            sproutSprite.scale = v;
                        }
                    });
                    wiggle(sproutSprite, 60, 0.35, 0.4, -0.1);
                    wiggle(fakePlayer, 80, -0.5, 0.025, 0);
                }
            });
            //fourth super wiggle
            new Tween({ in: 240,
                onComplete: function () {
                    if (isComplete) {
                        return;
                    }
                    new Tween({
                        from: camera.getViewScale(),
                        to: camera.getViewScale() - 0.1,
                        in: 150,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            if (isComplete) {
                                return;
                            }
                            camera.setViewScale(v);
                        },
                        onComplete: function () {
                            if (isComplete) {
                                return;
                            }
                            new Tween({
                                from: camera.getViewScale(),
                                to: 0.5,
                                in: 30,
                                ease: 'easeOutBack',
                                onUpdate: function (v, t) {
                                    if (isComplete) {
                                        return;
                                    }
                                    camera.setViewScale(v);
                                }
                            });
                        }
                    });
                    new Tween({
                        from: sproutSprite.scale.clone(),
                        to: sproutSprite.scale.scalarMultiply(1.2),
                        in: 60,
                        ease: 'easeOutBack',
                        onUpdate: function (v, t) {
                            if (isComplete) {
                                return;
                            }
                            sproutSprite.scale = v;
                        },
                        onComplete: function () {
                            new Tween({
                                from: sproutSprite.scale.clone(),
                                to: sproutSprite.scale.multiply(new Vector2(0.5, 0.75)),
                                in: 90,
                                ease: 'easeOutQuad',
                                onUpdate: function (v, t) {
                                    if (isComplete) {
                                        return;
                                    }
                                    sproutSprite.scale = v;
                                },
                                onComplete: function () {
                                    if (isComplete) {
                                        return;
                                    }
                                    for (var i = 5 - 1; i >= 0; i--) {
                                        new Sparkle({
                                            position: entity.position.add(head.position.add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-8, 0))))
                                        });
                                    }
                                    new Particle({
                                        z: Globals.layers.effects,
                                        spriteSheet: 'effects/hit',
                                        position: entity.position.add(head.position).add(new Vector2(0, 8)),
                                        scale: Globals.pixelScaleV
                                    });
                                    // burst out the plant
                                    sproutSprite.visible = false;
                                    headSprite.visible = true;
                                    wiggle(headSprite, 60, 0.3, 0.2, 0);
                                    new Tween({
                                        from: headSprite.scale.scalarMultiply(0.1),
                                        to: headSprite.scale.clone(),
                                        in: 30,
                                        ease: 'easeOutBack',
                                        onUpdate: function (v, t) {
                                            if (isComplete) {
                                                return;
                                            }
                                            headSprite.scale = v;
                                        },
                                        onComplete: function () {
                                            if (isComplete) {
                                                return;
                                            }
                                            new Tween({ in: 15,
                                                onComplete: function () {
                                                    if (isComplete) {
                                                        return;
                                                    }
                                                    Bento.audio.stopSound('sfx_grow_head');
                                                    Bento.audio.playSound('sfx_grow_head');
                                                    snapHead();
                                                }
                                            });
                                            new Tween({ in: 60,
                                                onComplete: function () {
                                                    if (isComplete) {
                                                        return;
                                                    }
                                                    Bento.audio.stopSound('sfx_grow_head');
                                                    Bento.audio.playSound('sfx_grow_head');
                                                    snapHead();
                                                }
                                            });
                                            new Tween({ in: 80,
                                                onComplete: function () {
                                                    if (isComplete) {
                                                        return;
                                                    }
                                                    Bento.audio.stopSound('sfx_grow_head');
                                                    Bento.audio.playSound('sfx_grow_head');
                                                    snapHead();
                                                }
                                            });
                                            new Tween({ in: 120,
                                                onComplete: function () {
                                                    if (isComplete) {
                                                        return;
                                                    }
                                                    Bento.audio.stopSound('sfx_start');
                                                    Bento.audio.playSound('sfx_start');
                                                    startGame();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    wiggle(sproutSprite, 60, 0.3, 0.5, -0.1);
                    new Tween({
                        from: 0.025,
                        to: 0.1,
                        in: 160,
                        ease: 'linear',
                        onUpdate: function (v, t) {
                            if (isComplete) {
                                return;
                            }
                            fakePlayer.rotation = Math.sin(t * 0.75) * v;
                        },
                        onComplete: function () {
                            if (isComplete) {
                                return;
                            }
                            fakePlayer.rotation = 0;
                        }
                    });
                    new Tween({
                        from: new Vector2(1, 1),
                        to: new Vector2(1, 0.75),
                        in: 90,
                        delay: 60,
                        ease: 'easeInQuad',
                        onUpdate: function (v, t) {
                            if (isComplete) {
                                return;
                            }
                            fakePlayer.scale = v;
                        },
                        onComplete: function () {
                            if (isComplete) {
                                return;
                            }
                            new Tween({
                                from: new Vector2(1, 0.75),
                                to: new Vector2(1, 1),
                                in: 30,
                                ease: 'easeOutBack',
                                onUpdate: function (v, t) {
                                    if (isComplete) {
                                        return;
                                    }
                                    fakePlayer.scale = v;
                                }
                            });
                        }
                    });
                }
            });
        };

        // --- COMPONENTS ---
        var potSprite = new SpriteContainer({
            spriteSheet: 'potskins/default',
            position: new Vector2(0, -17),
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
        });
        var headSprite = new SpriteContainer({
            spriteSheet: 'headskins/default',
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale).scalarMultiply(0.9),
            position: new Vector2(0, 6)
        });
        headSprite.visible = false;
        var sproutSprite = new SpriteContainer({
            imageName: 'cutscenesprout',
            originRelative: new Vector2(0.4, 0.95),
            rotation: -0.1,
            position: new Vector2(0, 5.5),
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale).scalarMultiply(0.2),
        });
        var head = new Entity({
            name: 'head',
            position: new Vector2(0, -21),
            components: [
                headSprite,
                sproutSprite
            ]
        });
        snapHead();
        var fakePlayer = new Entity({
            name: 'pot',
            position: new Vector2(0, 0),
            components: [
                potSprite,
                head
            ]
        });
        var cutsceneBehaviour = {
            name: 'cutsceneBehaviour',
            start: function () {
                startCutscene();
            }
        };
        var skipClickable = new Clickable({
            pointerDown: function (data) {
                if (!isComplete && entity.timer > 45) {
                    startGame();
                }
            }
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'introCutscene',
            position: player.position.clone(),
            boundingBox: new Rectangle(-1000, -1000, 2000, 2000),
            updateWhenPaused: 0,
            float: false,
            components: [
                fakePlayer,
                cutsceneBehaviour,
                skipClickable
            ]
        });
        return entity;
    };
});