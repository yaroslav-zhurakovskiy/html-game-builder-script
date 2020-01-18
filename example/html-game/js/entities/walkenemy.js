/**
 * Enemy that walks along the top of solids, turning at the corners
 * @moduleName WalkEnemy
 * @snippet WalkEnemy.snippet
WalkEnemy({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/walkenemy', [
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
    'components/movable',
    'components/spritecontainer',
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
    Movable,
    SpriteContainer,
    Particle
) {
    'use strict';
    return function (settings) {

        // --- VARS ---
        var camera;
        var viewport = Bento.getViewport();
        var position = settings.position;
        var spawnChance = settings.spawnChance || 1;
        var startDir = settings.startDir || 'right';

        var isDead = false;
        var isEnabled = true;
        var gravity = 0.1;
        var walkDir = (startDir === 'right') ? 1 : -1;
        var walkAccel = 0.1;
        var walkSpeed = 0.275;

        // --- FUNCTIONS ---
        var setEnabled = function (newEnabled) {
            if (isEnabled !== newEnabled) {
                isEnabled = newEnabled;
            }
        };

        var turn = function () {
            if (walkDir === 0) {
                //already turning
                return;
            }
            // hop up
            movable.velocity.y -= 1;
            // cache turn direction
            var startWalkDir = walkDir;
            walkDir = 0;
            // start animation


            spriteContainer.sprite.setSpriteSheet('bugs/bugturn-red');
            spriteContainer.sprite.setAnimation('start', function () {
                // flip around
                spriteContainer.scale.x = -startWalkDir * -Globals.pixelScale;
                // end animation
                spriteContainer.sprite.setAnimation('end', function () {
                    spriteContainer.sprite.setSpriteSheet('bugs/bugwalk-red');
                    //startwalking again
                    walkDir = -startWalkDir;
                });
            });

        };

        var squash = function () {
            if (isDead) {
                return;
            }
            isDead = true;
            setEnabled(false);
            movable.velocity.x = 0;
            movable.velocity.y = 2;
            movable.ignore.push('players');
            spriteContainer.sprite.setSpriteSheet('bugs/bugsplat-red');
            Bento.audio.setVolume(0.25, 'sfx_squish');
            Bento.audio.playSound('sfx_hit');
            Bento.audio.playSound('sfx_squish');
            new Tween({
                from: Globals.pixelScaleV.multiply(new Vector2(Utils.sign(spriteContainer.scale.x) * 2, 0.35)),
                to: Globals.pixelScaleV.multiply(new Vector2(Utils.sign(spriteContainer.scale.x) * 1.3, 0.8)),
                in: 60,
                oscilations: 10,
                ease: 'easeOutElastic',
                onUpdate: function (v, t) {
                    spriteContainer.scale = v;
                }
            });
            new Tween({ in: 25,
                onComplete: function () {
                    for (var i = 4 - 1; i >= 0; i--) {
                        new Particle({
                            spriteSheet: 'particles/dust',
                            position: entity.position.add(new Vector2(Utils.getRandomRangeFloat(-8, 8), Utils.getRandomRangeFloat(-4, 4) - 2)),
                            alpha: 1,
                            scale: Globals.pixelScaleV,
                            rotation: Utils.getRandomRangeFloat(-2, 2),
                            rotationRate: 0,
                            velocity: new Vector2([-1, -1, 1, 1][i], Utils.getRandomRangeFloat(-0.1, 0.1)),
                            friction: 0.96,
                            removeAfterTime: 0,
                            removeEffect: 'none',
                            z: Globals.layers.effects
                        });
                    }
                    entity.removeSelf();
                }
            });
        };

        // --- COMPONENTS ---
        var spriteContainer = new SpriteContainer({
            spriteSheet: 'bugs/bugwalk-red',
            scale: new Vector2(walkDir * -Globals.pixelScale, Globals.pixelScale)
        });

        var behavior = {
            name: 'behaviorComponent',
            update: function (data) {
                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                var viewportScaled = camera.getUnscaledViewport();
                entity.visible = (entity.position.y > viewportScaled.y - 16) && (entity.position.y < (viewportScaled.y + viewportScaled.height + 16));

                if (isEnabled) {
                    // get stuff
                    var solids = [];
                    Utils.forEach(Bento.objects.getByFamily('solids'), function (solid, i, l, breakLoop) {
                        if (solid && solid.name !== 'player') {
                            solids.push(solid);
                        }
                    });
                    var walkenemies = [];
                    Utils.forEach(Bento.objects.getByFamily('walkenemies'), function (walkenemy, i, l, breakLoop) {
                        if (walkenemy && walkenemy.visible) {
                            walkenemies.push(walkenemy);
                        }
                    });
                    var movingplatforms = [];
                    Utils.forEach(Bento.objects.getByFamily('movingplatforms'), function (movingplatform, i, l, breakLoop) {
                        if (movingplatform && movingplatform.visible) {
                            movingplatforms.push(movingplatform);
                        }
                    });

                    // check wall and floor
                    collisionProbe.position = entity.position.add(new Vector2(walkDir * 10, -4));
                    var wallCollision = (walkDir === 0) ? false : collisionProbe.collidesWith({
                        entities: solids
                    });
                    collisionProbe.position = entity.position.add(new Vector2(walkDir * 10, 2));
                    var floorCollision = collisionProbe.collidesWith({
                        entities: solids
                    });
                    // check other enemies
                    collisionProbe.position = entity.position.add(new Vector2((walkDir * 24), -4));
                    var enemyCollision;
                    collisionProbe.collidesWith({
                        entities: walkenemies,
                        onCollide: function (other) {
                            if (!enemyCollision && other && other.id !== entity.id && other.getWalkDir() !== walkDir && !other.getIsDead()) {
                                enemyCollision = other;
                            }

                        }
                    });

                    // check standing
                    collisionProbe.position = entity.position.add(new Vector2(0, 2));
                    //move with moving platforms
                    collisionProbe.collidesWith({
                        entities: movingplatforms,
                        firstOnly: false,
                        onCollide: function (other) {
                            if (other) {
                                entity.position.x += other.getVelocity().x;
                            }
                        }
                    });
                    var standingCollision = collisionProbe.collidesWith({
                        entities: solids,
                        firstOnly: false,
                        onCollide: function (other) {
                            if (movable.velocity.y > 0.1) {
                                new Tween({
                                    from: Globals.pixelScaleV.multiply(new Vector2(1.2, 0.8)),
                                    to: Globals.pixelScaleV.multiply(new Vector2(1, 1)),
                                    in: 60,
                                    oscilations: 10,
                                    ease: 'easeOutElastic',
                                    onUpdate: function (v, t) {
                                        spriteContainer.scale.y = v.y;
                                        spriteContainer.scale.x = v.x * ((walkDir !== 0) ? -walkDir : Utils.sign(spriteContainer.scale.x));
                                    }
                                });
                            }

                        }
                    });

                    // turn when needed
                    if (standingCollision && wallCollision) {
                        // if there's a wall
                        turn();
                    }
                    if (standingCollision && !floorCollision) {
                        //if there's no floor
                        turn();
                    }

                    if (!standingCollision) {
                        movable.velocity.y += gravity * data.speed;
                    } else {
                        movable.velocity.x += walkDir * walkAccel * data.speed;
                    }

                    if (walkDir === 0) {
                        movable.velocity.x *= 1 - ((1 - 0.8) * data.speed);
                    }

                    // clamp walk speed
                    if (Math.abs(movable.velocity.x) > walkSpeed) {
                        movable.velocity.x = Utils.sign(movable.velocity.x) * walkSpeed;
                    }
                }
            }
        };

        var collisionProbe = new Entity({
            name: 'collisionProbe',
            boundingBox: new Rectangle(-2, -2, 4, 4),
        });

        // the movable the player requires to be able to move and hit solids
        var movable = new Movable({
            ignore: ['players'],
            velocity: new Vector2(0, 0),
            stopOnCollide: true
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'walkenemy',
            family: ['walkenemies', 'enemies'],
            position: position,
            boundingBox: new Rectangle(-8, -13, 16, 13),
            components: [
                behavior,
                movable,
                spriteContainer
            ]
        }).extend({
            spawnChance: spawnChance,
            squash: squash,
            getWalkDir: function () {
                return walkDir;
            },
            getIsDead: function () {
                return isDead;
            }
        });
        return entity;
    };
});