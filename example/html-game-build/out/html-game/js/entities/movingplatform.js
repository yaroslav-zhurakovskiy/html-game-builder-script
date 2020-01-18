/**
 * Module description
 * @moduleName MovingPlatform
 * @snippet MovingPlatform.snippet
MovingPlatform({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/movingplatform', [
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
    'components/movable',
    'entities/particle',
    'entities/cheer',
    'components/gamecounter',
    'components/culler',
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
    Globals,
    SpriteContainer,
    Movable,
    Particle,
    Cheer,
    GameCounter,
    Culler,
    Localization
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var camera;
        var position = settings.position;
        var velocityX = Utils.isDefined(settings.velocityX) ? settings.velocityX : 0;
        var extraWidthPieces = Utils.isDefined(settings.extraWidthPieces) ? settings.extraWidthPieces : 1;
        var deleteOffscreen = Utils.isDefined(settings.deleteOffscreen) ? settings.deleteOffscreen : true;
        var isTarget = Utils.isDefined(settings.isTarget) ? settings.isTarget : false;
        var isSpiked = (Utils.isDefined(settings.isSpiked) && !isTarget) ? settings.isSpiked : false;

        // --- VARS ---
        var totalWidth = ((2 + extraWidthPieces) * 16);
        var stopped = false;
        var spriteContainer;
        var faceSprite;
        var gameController;
        var stoodOnBy = null;
        var stoodOnByLast;

        // --- COMPONENTS
        if (isTarget) {
            totalWidth = 39;
            spriteContainer = new SpriteContainer({
                imageName: 'target',
                frameCountX: 1,
                frameCountY: 1,
                originRelative: new Vector2(0.5, 0.65),
                scale: new Vector2(Globals.pixelScale, Globals.pixelScale)
            });
        } else {
            spriteContainer = new SpriteContainer({
                imageName: (isSpiked) ? 'spikelee' : 'platformMoving',
                frameCountX: 3,
                frameCountY: 1,
                originRelative: new Vector2(0.5, 0.5),
                scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
                animations: {
                    default: {
                        speed: 0,
                        frames: [0, 1, 2]
                    }
                }
            });
            if (isSpiked) {
                faceSprite = new SpriteContainer({
                    imageName: 'spikelee-face',
                    frameCountX: 1,
                    frameCountY: 1,
                    originRelative: new Vector2(0.5, 0.5),
                    scale: new Vector2(Globals.pixelScale, Globals.pixelScale)
                });
            }
        }

        var movable = new Movable({
            stopOnCollide: false,
            ignore: ['players'],
            onCollision: function (collisionData) {
                movable.velocity.x *= -1;
                Utils.forEach(collisionData.entities, function (e, i, l, breakLoop) {
                    if (e.name === 'player' && !isSpiked) {
                        movable.velocity.x = 0;
                    }
                });
            }
        });
        var behaviour = {
            name: "behaviourComponent",
            start: function () {
                movable.velocity.x = velocityX;
            },
            update: function () {
                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                var viewportScaled = camera.getUnscaledViewport();

                // turn off offscreen
                entity.visible = (entity.visible && stoodOnBy) || entity.position.y < (viewportScaled.y + viewportScaled.height + 18);
                movable.setEnabled(entity.visible);

                // if this ain't spiked
                if (!isSpiked) {
                    //are we stood on?
                    stoodOnBy = entity.collidesWith({
                        name: 'player',
                        offset: new Vector2(0, -1),
                        firstOnly: true
                    });
                    // if we are stood on
                    if (stoodOnBy) {
                        if (!stopped) {
                            movable.velocity.x = 0;

                            if (isTarget) {
                                //hit a target
                                if (Math.abs(entity.position.x - stoodOnBy.position.x) < 5) {
                                    //PERFECT
                                    if (!gameController) {
                                        gameController = Bento.objects.get('gameController');
                                    }
                                    gameController.giveCoins(3);
                                    if (Globals.showCounters) {
                                        new Particle({
                                            z: Globals.layers.effects,
                                            sprite: new GameCounter({
                                                value: '+3',
                                                imageName: 'addcoincounter'
                                            }),
                                            originRelative: new Vector2(0.5, 0.5),
                                            position: entity.position.clone(),
                                            rotation: 0,
                                            rotationRate: Utils.getRandomRangeFloat(-0.02, 0.02),
                                            velocity: new Vector2(Utils.getRandomRangeFloat(-0.2, 0.2), 0 - 1.5),
                                            scale: Globals.pixelScaleV.scalarMultiply(0.45),
                                            acceleration: new Vector2(0, 0.04),
                                            friction: 1,
                                            removeAfterTime: 60,
                                            removeEffect: 'flicker'
                                        });
                                        var cheer = new Cheer({
                                            text: Localization.getText('perfectLanding'),
                                            position: entity.position.clone()
                                        });
                                        cheer.position.y = entity.position.y - viewport.y + 35;
                                    }
                                    if (Globals.showEffects) {
                                        for (var i = 0; i < 3; i++) {
                                            new Particle({
                                                spriteSheet: 'coin',
                                                position: entity.position.clone(),
                                                alpha: 1,
                                                scale: Globals.pixelScaleV.scalarMultiply(0.8),
                                                rotation: Utils.getRandomRangeFloat(-1, 1),
                                                rotationRate: Utils.getRandomRangeFloat(-0.1, 0.1),
                                                velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-5, 0)),
                                                acceleration: new Vector2(0, 0.065),
                                                friction: 1,
                                                removeAfterTime: 200,
                                                removeEffect: 'scale'
                                            });
                                        }
                                        new Particle({
                                            z: Globals.layers.tiles - 1,
                                            imageName: 'ui/fx/bloom-hard',
                                            position: entity.position.clone(),
                                            scale: Globals.pixelScaleV.scalarMultiply(0.4),
                                            removeAfterTime: 10,
                                            originRelative: new Vector2(0.5, 0.5),
                                            removeEffect: 'fade'
                                        });
                                        new Particle({
                                            z: Globals.layers.tiles - 1,
                                            imageName: 'ui/fx/bloom-halo',
                                            position: entity.position.clone(),
                                            scale: Globals.pixelScaleV.scalarMultiply(0.4),
                                            removeAfterTime: 25,
                                            originRelative: new Vector2(0.5, 0.5),
                                            removeEffect: 'scalefade'
                                        });
                                        for (var i = 5 - 1; i >= 0; i--) {
                                            new Particle({
                                                imageName: 'sparkle',
                                                position: entity.position.clone(),
                                                alpha: 1,
                                                scale: Globals.pixelScaleV,
                                                rotation: Utils.getRandomRangeFloat(-2, 2),
                                                rotationRate: 0,
                                                velocity: new Vector2(Utils.getRandomRangeFloat(-0.8, 0.8), Utils.getRandomRangeFloat(-4, 0.5)),
                                                acceleration: new Vector2(0, 0.1),
                                                friction: 1,
                                                removeAfterTime: 100,
                                                removeEffect: 'scale',
                                                z: Globals.layers.effects
                                            });
                                        }
                                    }
                                }
                                spriteContainer.getComponent('sprite', function (sprite) {
                                    sprite.setup({
                                        imageName: "targetLit"
                                    });
                                });
                            }
                            stopped = true;
                        }
                        if (!stoodOnByLast) {
                            var otherMovable = stoodOnBy.getComponent('movableBehaviour');
                            var wobbleSide = ((stoodOnBy.position.x > entity.position.x) ? 1 : -1);
                            new Tween({
                                from: Math.max(Math.abs(otherMovable.lastVelocity.y * 0.5), 0.5),
                                to: 0,
                                in: 150,
                                ease: 'elastic',
                                decay: 12,
                                oscillations: 5,
                                onUpdate: function (v, t) {
                                    entity.rotation = wobbleSide * Math.sin(v * 5) * 0.05;
                                    spriteContainer.position.y = v * 8;
                                    if (stoodOnBy) {
                                        stoodOnBy.getDrawEntity2().position.y = v * 8;
                                    } else {
                                        if (stoodOnByLast) {
                                            stoodOnByLast.getDrawEntity2().position.y = 0;
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
                stoodOnByLast = stoodOnBy;
            }
        };

        var renderBehaviour = {
            name: "renderBehaviour",
            draw: function (data) {
                if (isTarget) {
                    data.renderer.translate(viewport.x, viewport.y);
                    spriteContainer.position.x = 0;
                    spriteContainer.draw(data);
                    data.renderer.translate(-viewport.x, -viewport.y);
                } else {
                    data.renderer.translate(viewport.x, viewport.y);
                    spriteContainer.position.x = -(totalWidth * 0.5) + 8;
                    spriteContainer.sprite.setFrame(0);
                    spriteContainer.draw(data);
                    spriteContainer.position.x += 16;

                    spriteContainer.sprite.setFrame(1);
                    for (var i = 0; i < extraWidthPieces; i++) {
                        spriteContainer.draw(data);
                        spriteContainer.position.x += 16;
                    }

                    spriteContainer.sprite.setFrame(2);
                    spriteContainer.draw(data);
                    if (isSpiked) {
                        faceSprite.draw(data);
                    }
                    data.renderer.translate(-viewport.x, -viewport.y);
                }


                if (Globals.debug) {
                    var bb = entity.boundingBox;
                    data.renderer.fillRect([1, 0, 0, 0.5], bb.x, bb.y, bb.width, bb.height);
                }
            }
        };

        var family = ['movingplatforms', 'solids'];
        if (isSpiked) {
            family = ['hazards'];
        }

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.tiles,
            name: 'movingplatform',
            family: family,
            position: position,
            updateWhenPaused: 0,
            boundingBox: new Rectangle(-totalWidth * 0.5, (isSpiked) ? -9 : -7, totalWidth, (isSpiked) ? 19 : ((isTarget) ? 9 : 15)),
            float: false,
            components: [
                movable,
                behaviour,
                renderBehaviour
            ]
        }).extend({
            getVelocity: function () {
                return movable.velocity.clone();
            },
            onCollide: function () {
                movable.velocity.x = 0;
            },
            break: function (other) {
                entity.remove(renderBehaviour);
                new Particle({
                    z: Globals.layers.effects,
                    sprite: renderBehaviour,
                    position: entity.position,
                    rotation: 0,
                    rotationRate: (entity.position.x - other.getHeadPosition().x) * 0.0025,
                    velocity: new Vector2((entity.position.x - other.getHeadPosition().x) * 0.05, -2),
                    acceleration: new Vector2(0, 0.1)
                });
                entity.removeSelf();
            }
        });

        return entity;
    };
});