/**
 * Enemy that walks around the outside of solids
 * @moduleName StickyEnemy
 * @snippet StickyEnemy.snippet
StickyEnemy({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/stickyenemy', [
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
        var isGrounded = false;
        var leftAngle = 0;
        var rightAngle = 0;
        var walkAngle = 0;
        var walkDir = (startDir === 'right') ? 1 : -1;
        var walkSpeed = 0.275;
        var gravity = 0.1;

        // --- FUNCTIONS ---
        var setEnabled = function (newEnabled) {
            if (isEnabled !== newEnabled) {
                isEnabled = newEnabled;
            }
        };

        // kill animation showing the bug fall
        var fall = function () {
            var viewportScaled = camera.getUnscaledViewport();
            if (entity.position.y > (viewportScaled.y + viewportScaled.height)) {
                entity.removeSelf();
                return;
            }

            isDead = true;
            setEnabled(false);
            var thisSprite = new SpriteContainer({
                spriteSheet: 'bugs/bugwalk-yellow',
                position: new Vector2(0, 8),
                scale: spriteContainer.scale.clone(),
            });
            thisSprite.sprite.setCurrentSpeed(1);
            new Particle({
                z: Globals.layers.effects,
                sprite: thisSprite,
                position: entity.position.clone(),
                rotation: entity.rotation,
                rotationRate: [-0.25, 0.25][Utils.getRandom(2)],
                velocity: new Vector2(Utils.getRandomRangeFloat(-1, 1), Utils.getRandomRangeFloat(-1, -4)),
                scale: new Vector2(1, 1),
                acceleration: new Vector2(0, gravity)
            });
            entity.removeSelf();
        };

        //get squashed by a player
        var squash = function () {
            //check to see if we're on a wall or ceiling(?)
            var thisAngle = Utils.toDegree(Math.abs(walkAngle));
            Bento.audio.setVolume(0.25, 'sfx_squish');
            Bento.audio.playSound('sfx_hit');
            Bento.audio.playSound('sfx_squish');
            if ((thisAngle < 180 && thisAngle > 45) || (thisAngle > 180 && thisAngle < 315)) {
                //fall instead
                fall();
                return;
            }

            isDead = true;
            setEnabled(false);
            movable.velocity.x = 0;
            movable.velocity.y = 2;
            movable.ignore.push('players');
            spriteContainer.sprite.setSpriteSheet('bugs/bugsplat-yellow');
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
            spriteSheet: 'bugs/bugwalk-yellow',
            position: new Vector2(0, 8),
            scale: new Vector2(walkDir * -Globals.pixelScale, Globals.pixelScale)
        });
        var spriteContainerContainer = new Entity({
            name: 'spriteContainerContainer',
            position: new Vector2(0, 0),
            components: [
                spriteContainer
            ]
        });

        var behavior = {
            name: 'behaviorComponent',
            update: function (data) {
                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                var viewportScaled = camera.getUnscaledViewport();
                entity.visible = (entity.position.y > viewportScaled.y - 16) && (entity.position.y < (viewportScaled.y + viewportScaled.height + 16));
                setEnabled(!isDead && entity.visible);

                if (isEnabled) {
                    // get stuff
                    var solids = [];
                    Utils.forEach(Bento.objects.getByFamily('solids'), function (solid, i, l, breakLoop) {
                        if (solid && solid.visible && solid.name !== 'player') {
                            solids.push(solid);
                        }
                    });
                    var walkenemies = [];
                    Utils.forEach(Bento.objects.getByFamily('walkenemies'), function (walkenemy, i, l, breakLoop) {
                        if (walkenemy && walkenemy.visible) {
                            walkenemies.push(walkenemy);
                        }
                    });

                    var upAngle = walkAngle;
                    collisionFallProbeFloor.position = entity.position.clone();
                    isGrounded = (collisionFallProbeFloor.collidesWith({
                        entities: solids
                    }));


                    // function to find the correct
                    var findFreeAngle = function (direction) {
                        var thisAngle = 0;
                        var keepGoing = true;
                        var deltaAngle = Math.PI / 15;
                        var basePos = entity.position.add(new Vector2(0, 4).rotateRadian(upAngle));
                        var iterate = function () {
                            for (var i = thisAngle; i <= Math.PI * 2; i += deltaAngle) {
                                collisionProbeFloor.position = basePos.add(new Vector2(0, -7).rotateRadian(upAngle + (i * direction)));
                                if (collisionProbeFloor.collidesWith({
                                        entities: solids
                                    })) {
                                    thisAngle = i - deltaAngle;
                                    deltaAngle *= 0.5;
                                    return;
                                }
                            }
                            keepGoing = false;
                        };
                        while (keepGoing && deltaAngle >= Math.PI / 360) {
                            iterate();
                        }
                        if (!keepGoing) {
                            return null;
                        }
                        return upAngle + (thisAngle * direction);
                    };


                    if (isGrounded) {
                        //find left and right angle
                        rightAngle = findFreeAngle(1);
                        leftAngle = findFreeAngle(-1);

                        //we have nothing to grab onto
                        if (rightAngle === null || leftAngle === null) {
                            fall();
                            return;
                        }

                        //get the average angle of the two points
                        walkAngle = ((leftAngle + rightAngle) * 0.5);
                        while (walkAngle < 0) {
                            walkAngle += Math.PI * 2;
                        }
                        while (walkAngle >= Math.PI * 2) {
                            walkAngle -= Math.PI * 2;
                        }

                        while (spriteContainerContainer.rotation < 0) {
                            spriteContainerContainer.rotation += Math.PI * 2;
                        }
                        while (spriteContainerContainer.rotation >= Math.PI * 2) {
                            spriteContainerContainer.rotation -= Math.PI * 2;
                        }

                        spriteContainerContainer.rotation -= Utils.closestAngle(spriteContainerContainer.rotation, walkAngle) * 0.1;

                        //make it a 90 degree angle
                        var walkAngleRound = (Math.round((Utils.toDegree(walkAngle) - walkDir) / 90) * 90);
                        var walkAngleDelta = new Vector2(0, -1).rotateRadian(walkAngle - leftAngle).y + new Vector2(0, -1).rotateRadian(walkAngle - rightAngle).y;
                        spriteContainer.position.y -= (spriteContainer.position.y - ((walkAngleDelta * 3) + 7)) * 0.2;
                        movable.velocity = new Vector2(walkSpeed * walkDir * 1, 0.1).rotateDegree(walkAngleRound);
                    } else {
                        fall();
                    }
                }
            },
            draw: function (data) {
                if (Globals.debug) {
                    var bb = entity.boundingBox;
                    data.renderer.fillRect([0, 0, 1, 0.5], bb.x, bb.y, bb.width, bb.height);
                    data.renderer.fillCircle([0, 1, 1, 0.5], bb.getCenter().x, bb.getCenter().y, 7);
                }
            }
        };

        var collisionFallProbeFloor = new Entity({
            name: 'collisionFallProbeFloor',
            boundingBox: new Rectangle(-8, -8, 16, 16),
        });

        var collisionProbeFloor = new Entity({
            name: 'collisionProbe',
            boundingBox: new Rectangle(-1, -1, 2, 2),
        });

        // the movable the player requires to be able to move and hit solids
        var movable = new Movable({
            ignore: ['players'],
            stopOnCollide: false,
            velocity: new Vector2(0, 0)
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'stickyenemy',
            family: ['walkenemies', 'enemies'],
            position: position,
            boundingBox: new Rectangle(-5, -5, 10, 10),
            components: [
                spriteContainerContainer,
                behavior,
                movable
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