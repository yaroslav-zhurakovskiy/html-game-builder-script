/**
 * Module description
 * @moduleName Player
 * @snippet Player.snippet
Player({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/player', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'globals',
    'components/spritecontainer',
    'components/movable',
    'entities/textup',
    'modules/taptic',
    'entities/particle',
    'components/gamecounter',
    'entities/cheer',
    'entities/effects/sparkleparticle',
    'ui/fevertext',
    'modules/localization',
    'modules/savemanager',
    'entities/effects/confettistring'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    EventSystem,
    Utils,
    Tween,
    Globals,
    SpriteContainer,
    Movable,
    TextUp,
    TapticEngine,
    Particle,
    GameCounter,
    Cheer,
    Sparkle,
    FeverText,
    Localization,
    SaveManage,
    ConfettiString) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var camera;
        var background;
        var gameController;


        // --- PARAMETERS ---
        var position = settings.position;

        // --- VARS ---
        // states
        var isWin = false;
        var isDead = false;
        var isEnabled = Utils.isDefined(settings.enabled) ? settings.enabled : true;
        var canGrow = true;
        var pauseGrowing = false;
        var isDragging = false;
        var isGrowing = false;
        var wasGrowing = false;
        var isGrounded = true;
        var wasGrounded = true;
        var snappingBack = false;
        var isFever = false;
        var hasFlame = false;
        var wasFever = false;
        var endFlame = false;
        var useGravity = true;

        // animations
        var playIdleAnim = true;
        var leftDownGrounded = true;
        var rightDownGrounded = true;
        var wobbleSide = 0;
        var wobbleAnimationScale = 0;
        var stemShudder = 0;

        // input
        var deltaX = 0;
        var lastInputPosition = new Vector2(0, 0);
        var pauseGrowingTween;

        // scoring and gameplay
        var thisScore = 0;
        var lastScore = 0;
        var timesLanded = 0;
        var lastScoreHeight = Infinity;
        var minimumScoreLength = 10;
        var lastScoreLength = minimumScoreLength;
        var stemSpacing = 3.5;
        var totalLength = 0;

        // physics
        var headVelocity = new Vector2(0, 0);
        var collisionSize = 12;
        var standardSpeed = 1.1;
        var feverSpeed = 1.5;
        var growSpeed = standardSpeed;
        var speedMultiplier = 1;
        var fallSpeed = 3;
        var gravity = 0.1;
        var friction = 0.9;

        // fever
        var feverTimeMax = 600;
        var feverTime = 0;
        var feverDecay = 0.5;

        // positions
        var potAnchor = new Vector2(0, -17);
        var headAnchor = new Vector2(0, -21);
        var scoreTextAnchor = new Vector2(0, -16);
        var defaultPoints = [headAnchor.clone().add(new Vector2(0, 4))];
        var stemPoints = defaultPoints.slice();
        var defaultLeafPoints = [0.001];
        var leafPoints = defaultLeafPoints.slice();
        var defaultLeafTweens = [null];
        var leafTweens = defaultLeafTweens.slice();
        var lastDeltaPoint;

        // sound
        var coinsCollected = 0; //only used for choosing which sound effect to use
        var candyCollected = 0; //only used for choosing which sound effect to use
        var heightCollected = 0; //only used for choosing which sound effect to use

        // skins
        var plantSkin = settings.plantSkin || 'default';
        var potSkin = settings.potSkin || 'default';
        var plantSkinExtraScale = Bento.assets.getJson('skin_data')['plants']['extraScale'][plantSkin] || 1;

        if (plantSkin === 'calci') {
            hasFlame = true;
        }
        if (plantSkin === 'growbot') {
            fallSpeed = 1.25;
        } else {
            fallSpeed = 3;
        }
        if (plantSkin === 'rocketboy') {
            speedMultiplier = 1.3;
        } else {
            speedMultiplier = 1;
        }

        // --- FUNCTIONS ---
        // enable or disable the player - disabling means the player is left in its current position and state
        var setEnabled = function (newEnabled) {
            if (newEnabled) {
                isEnabled = true;
            } else {
                isEnabled = false;
            }
        };


        //play head snap animation
        var snapHead = function () {
            headSprite.sprite.setAnimation('default');
            headSprite.sprite.onCompleteCallback = function () {
                //headSprite.sprite.setAnimation('idle');
                headSprite.sprite.setFrame(headSprite.sprite.currentAnimation.frames.length - 1);
                headSprite.sprite.setCurrentSpeed(0);
            };
            headSprite.sprite.setFrame(0);
            headSprite.sprite.setCurrentSpeed(headSprite.sprite.currentAnimation.frames.length / (20 / (growSpeed * speedMultiplier)));
        };


        // animate success
        var win = function (endArrow) {
            if (isFever) {
                endFever();
            }
            // push to background
            entity.z = Globals.layers.bg2;
            // disable physics and the player
            setEnabled(false);
            isGrowing = false;
            canGrow = false;
            isWin = true;
            // cash in score on win
            cashInScore(true);
            // play pipe sound
            Bento.audio.stopSound('sfx_snapback_pipe');
            Bento.audio.playSound('sfx_snapback_pipe');
            //find end point
            var endPos = endArrow.position.clone().add(new Vector2(0, -32));
            // fade out the end arrow
            new Tween({
                from: endArrow.alpha,
                to: 0,
                in: 15,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    endArrow.alpha = v;
                }
            });
            // move the player to the correct X
            new Tween({
                from: head.position.x,
                to: endPos.x - entity.position.x,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    head.position.x = v;
                }
            });
            // enter the pipe
            new Tween({
                from: head.position.y,
                to: endPos.y - entity.position.y,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    head.position.y = v;
                    // make missing stem bits
                    var deltaPoint = head.position.subtract(stemPoints[stemPoints.length - 1]);
                    if (deltaPoint.magnitude() > stemSpacing) {
                        var nextPoint = stemPoints[stemPoints.length - 1].add(deltaPoint.normalize().scalarMultiply(stemSpacing));
                        stemPoints.push(nextPoint);
                        leafPoints.push(0);
                        deltaPoint = head.position.subtract(stemPoints[stemPoints.length - 1]);
                    }
                },
                onComplete: function () {
                    // snap the pot to the head and complete the level
                    snapBack(function () {});
                    //complete game
                    new Tween({ in: 45,
                        onComplete: function () {
                            EventSystem.fire('onLevelComplete');
                        }
                    });
                    //shrink the player at the same time
                    new Tween({
                        from: 1,
                        to: 0.01,
                        in: 8,
                        delay: 8,
                        ease: 'linear',
                        onUpdate: function (v, t) {
                            headSprite.scale = Globals.pixelScaleV.scalarMultiply(v);
                            potSpriteContainer.scale = Globals.pixelScaleV.scalarMultiply(v);
                        },
                        onComplete: function () {
                            headSprite.scale = new Vector2(0.01, 0.01);
                            potSpriteContainer.scale = new Vector2(0.01, 0.01);
                        }
                    });
                }
            });
        };


        //death animation
        var die = function () {
            var viewBottom = viewport.y + viewport.height;
            //we died
            isDead = true;

            // end fever mode
            if (isFever) {
                endFever();
            }

            //disable player
            canGrow = false;
            setEnabled(false);
            movable.velocity = new Vector2(0, 0);

            //shake camera
            camera.shake(200);
            new Tween({ in: 10,
                onUpdate: function (v, t) {
                    TapticEngine.impact({
                        style: 'heavy'
                    });
                }
            });

            background.flash(0.5);

            // play death sound
            Bento.audio.stopSound('sfx_death');
            Bento.audio.playSound('sfx_death');

            // make star particles
            if (Globals.showEffects) {
                for (var i = 5 - 1; i >= 0; i--) {
                    new Particle({
                        spriteSheet: 'particles/starparticle',
                        position: entity.position.add(head.position).add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4))),
                        alpha: 1,
                        scale: Globals.pixelScaleV,
                        rotation: Utils.getRandomRangeFloat(-2, 2),
                        rotationRate: Utils.getRandomRangeFloat(-0.1, 0.1),
                        velocity: new Vector2(Utils.getRandomRangeFloat(-1, 1), [-5, -4, -3.2, -3.5, -1][i]),
                        acceleration: new Vector2(0, gravity * 0.7),
                        friction: 1,
                        removeAfterTime: 100,
                        removeEffect: 'scale',
                        z: Globals.layers.effects
                    });
                }
            }

            // leave frozen for 15 frames
            new Tween({ in: 15,
                onComplete: function () {
                    // hide player
                    entity.visible = false;
                    //make head particle
                    var thisSprite = new SpriteContainer({
                        spriteSheet: 'headskins/' + plantSkin,
                        position: new Vector2(0, 32)
                    });
                    thisSprite.sprite.setCurrentSpeed(1);
                    new Particle({
                        z: Globals.layers.effects,
                        sprite: thisSprite,
                        position: head.position.add(entity.position),
                        rotation: head.rotation,
                        rotationRate: [-0.25, 0.25][Utils.getRandom(2)],
                        velocity: new Vector2(0, -growSpeed * speedMultiplier).rotateRadian(head.rotation).add(new Vector2(Utils.getRandomRangeFloat(-1, 1), Utils.getRandomRangeFloat(-1, -4))),
                        scale: Globals.pixelScaleV,
                        acceleration: new Vector2(0, gravity)
                    });
                    //make pot particle
                    var thatSprite = new SpriteContainer({
                        spriteSheet: 'potskins/' + potSkin,
                        position: potAnchor.clone().add(new Vector2(0, -20))
                    });
                    thatSprite.sprite.setCurrentSpeed(1);
                    new Particle({
                        z: Globals.layers.effects,
                        sprite: thatSprite,
                        position: potSpriteContainer.position.add(entity.position).add(new Vector2(0, 10)),
                        rotation: potSpriteContainer.rotation,
                        rotationRate: [-0.25, 0.25][Utils.getRandom(2)],
                        velocity: new Vector2(0, -growSpeed * speedMultiplier).rotateRadian(potSpriteContainer.rotation).add(new Vector2(Utils.getRandomRangeFloat(-1, 1), Utils.getRandomRangeFloat(-1, -4))),
                        scale: Globals.pixelScaleV,
                        acceleration: new Vector2(0, gravity)
                    });
                    //make stem particles - only for those on screen
                    for (var i = stemPoints.length - 2; i >= 0; i--) {
                        var thisPoint = stemPoints[i].add(entity.position);
                        if (thisPoint.y < viewBottom) {
                            new Particle({
                                z: Globals.layers.effects,
                                imageName: 'stemskins/' + plantSkin + '-stem',
                                originRelative: new Vector2(0.5, 0.5),
                                position: thisPoint.clone(),
                                rotation: 0,
                                velocity: new Vector2(0.5, 0).rotateDegree(Utils.getRandom(360)).add(new Vector2(0, Utils.getRandomRangeFloat(-0.5, -2))),
                                scale: Globals.pixelScaleV,
                                acceleration: new Vector2(0, gravity),
                                friction: 1
                            });
                        } else {
                            break;
                        }
                    }
                }
            });

            // fire death event now
            EventSystem.fire('onDeath');
        };


        // return the pot to the head
        var respawnAt = function (newPosition) {
            // undie
            setEnabled(true);
            canGrow = true;
            isDead = false;
            isGrowing = false;
            wasGrowing = false;
            isGrounded = true;
            wasGrounded = true;
            isDragging = false;
            wasFever = false;
            if (plantSkin === 'calci') {
                hasFlame = true;
            }
            endFlame = false;

            //reset other player stuff
            entity.z = Globals.layers.active;
            entity.visible = true;
            entity.position = newPosition.clone();
            head.position = headAnchor.clone();
            head.rotation = 0;
            potSpriteContainer.position = potAnchor.clone();
            potSpriteContainer.rotation = 0;

            // reset growth
            stemPoints = defaultPoints.slice();
            leafPoints = defaultLeafPoints.slice();
            leafTweens = defaultLeafTweens.slice();
            totalLength = 0;
            lastScoreLength = minimumScoreLength;
            thisScore = 0;
            feverTime = 0;

            //reset draw
            drawEntity.position = new Vector2(0, 0);

            //animate back in
            playIdleAnim = false;
            new Tween({
                from: new Vector2(0, 0),
                to: new Vector2(1, 1),
                in: 45,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    drawEntity.scale = v;
                },
                onComplete: function () {
                    playIdleAnim = true;
                }
            });
        };


        //bounce the head off of a solid wall
        var bumpHead = function (bumpVector) {
            pauseGrowing = true;
            if (pauseGrowingTween) {
                pauseGrowingTween.stop();
            }
            pauseGrowingTween = new Tween({ in: 20,
                onComplete: function () {
                    pauseGrowing = false;
                }
            });
            //bounce head velocity
            headVelocity.addTo(bumpVector.normalize().scalarMultiply(2)); //.add(new Vector2(0, growSpeed * speedMultiplier));
        };


        // return the pot to the heads current position
        var snapBack = function (endOverride, timeOutControls) {
            //set states - diable the player
            snappingBack = true;
            canGrow = false;
            setEnabled(false);
            snapHead();
            // play the sound
            if (stemPoints.length > 7) {
                Bento.audio.stopSound('sfx_snapback');
                Bento.audio.playSound('sfx_snapback');
            }
            // tween the pot to the head removing stempoints as this happens
            var thisStemPoints = stemPoints.slice();
            var maxTime = isFever ? 10 : 25;
            var timeToSnap = Math.min(stemPoints.length, maxTime);
            new Tween({
                from: new Vector2(1 - ((timeToSnap / maxTime) * 0.25), 1 + (timeToSnap / maxTime)).scalarMultiplyWith(Globals.pixelScale),
                to: Globals.pixelScaleV,
                in: timeToSnap - 1,
                delay: 1,
                ease: 'linear',
                onUpdate: function (v, t) {
                    potSpriteContainer.scale.addTo(v.subtract(potSpriteContainer.scale).scalarMultiply(0.1));
                },
                onComplete: function () {
                    potSpriteContainer.scale = Globals.pixelScaleV.clone();
                }
            });
            var lastIndex = 0;
            new Tween({
                from: 0,
                to: stemPoints.length,
                in: timeToSnap,
                ease: 'linear',
                onUpdate: function (v, t) {
                    // remove the stem points prior to thisIndex, via slicing
                    var thisIndex = Math.round(v);
                    stemPoints = thisStemPoints.slice(thisIndex, thisStemPoints.length - 1);
                    // if there is a point at the end, place the pot there, and rotate in the direction of the motion
                    if (thisIndex !== lastIndex && stemPoints[0]) {
                        var thisPoint = stemPoints[0].clone();
                        var deltaPosition = thisPoint.subtract(potSpriteContainer.position);
                        potSpriteContainer.position.addTo(deltaPosition.clone());
                        if (deltaPosition.sqrMagnitude() > 0) {
                            potSpriteContainer.rotation += (deltaPosition.angle() + (Math.PI * 0.5) - potSpriteContainer.rotation) * (0.25 + ((thisIndex - lastIndex) * 0.02));
                        }
                    }
                    lastIndex = thisIndex;
                },
                onComplete: function () {
                    // when the pot is at head
                    // reset rotations
                    new Tween({
                        from: head.rotation,
                        to: 0,
                        in: 15,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            head.rotation = v;
                        }
                    });
                    new Tween({
                        from: potSpriteContainer.rotation,
                        to: 0,
                        in: 15,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            potSpriteContainer.rotation = v;
                        }
                    });
                    // 'squish head and pot' animations
                    new Tween({
                        from: new Vector2(1.5, 0.5).scalarMultiplyWith(Globals.pixelScale),
                        to: Globals.pixelScaleV,
                        in: 15,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            potSpriteContainer.scale = v;
                        }
                    });
                    new Tween({
                        from: new Vector2(1.5, 0.5).scalarMultiplyWith(Globals.pixelScale * plantSkinExtraScale),
                        to: new Vector2(Globals.pixelScale, Globals.pixelScale).scalarMultiply(plantSkinExtraScale),
                        in: 15,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            headSprite.scale = v;
                        }
                    });
                    // reset positions
                    entity.position.addTo(head.position.subtract(headAnchor));
                    head.position = headAnchor.clone();
                    potSpriteContainer.position = potAnchor.clone();
                    // reset stem arrays
                    stemPoints = defaultPoints.slice();
                    leafPoints = defaultLeafPoints.slice();
                    leafTweens = defaultLeafTweens.slice();
                    totalLength = 0;
                    lastScoreLength = minimumScoreLength;
                    // if we have an overide like the end
                    if (endOverride) {
                        endOverride();
                        return;
                    }
                    // pull up the head if the head landed on a ledge
                    entity.collidesWith({
                        family: 'solids',
                        firstOnly: false,
                        onCollide: function (other) {
                            if (other.id === entity.id) {
                                return;
                            }
                            var BB = entity.getBoundingBox();
                            var otherBB = other.getBoundingBox();
                            var upDelta = (BB.getY2() - otherBB.y);
                            var downDelta = (BB.y - otherBB.getY2());
                            if (upDelta <= 16) {
                                entity.position.y -= upDelta;
                            } else {
                                entity.position.y -= downDelta;
                            }
                            movable.velocity.y = 0;
                        }
                    });
                    // push out sideways if we just ended up inside a walll
                    entity.collidesWith({
                        family: 'solids',
                        firstOnly: false,
                        onCollide: function (other) {
                            if (other.id === entity.id) {
                                return;
                            }
                            var BB = entity.getBoundingBox();
                            var otherBB = other.getBoundingBox();
                            var deltaX = (BB.getCenter().x > otherBB.getCenter().x) ? (BB.x - otherBB.getX2()) : (BB.getX2() - otherBB.x);
                            entity.position.x -= deltaX;
                            movable.velocity.x = 0;
                        }
                    });
                    // re-enable physics
                    setEnabled(true);
                    if (plantSkin === 'growbot') {
                        useGravity = false;
                        new Tween({ in: 15,
                            onComplete: function () {
                                useGravity = true;
                            }
                        });
                    }
                    //complete snapping back
                    snappingBack = false;
                    // reenable controls after a timeout
                    new Tween({ in: timeOutControls ? 30 : 15,
                        onComplete: function () {
                            canGrow = true;
                        }
                    });
                }
            });
        };


        // collect a coin
        var collectCoin = function (coin) {
            // give coin
            coinsCollected++;
            gameController.giveCoins(1);
            //play sound and haptic
            Bento.audio.stopSound('sfx_coin_' + (1 + (coinsCollected % 9)));
            Bento.audio.playSound('sfx_coin_' + (1 + (coinsCollected % 9)));
            TapticEngine.impact({
                style: 'heavy'
            });
            //make sparkles
            if (Globals.showEffects) {
                for (var i = 5 - 1; i >= 0; i--) {
                    new Sparkle({
                        position: coin.position.add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4)))
                    });
                }
            }
            // make text particle
            if (Globals.showCounters) {
                new Particle({
                    z: Globals.layers.effects,
                    sprite: new GameCounter({
                        value: '+1',
                        imageName: 'addcoincounter'
                    }),
                    originRelative: new Vector2(0.5, 0.5),
                    position: coin.position.clone(),
                    rotation: 0,
                    rotationRate: Utils.getRandomRangeFloat(-0.02, 0.02),
                    velocity: new Vector2(Utils.getRandomRangeFloat(-0.5, 0.5), Math.min(movable.velocity.y, 0) - 1.5),
                    scale: Globals.pixelScaleV.scalarMultiply(0.45),
                    acceleration: new Vector2(0, 0.04),
                    friction: 1,
                    removeAfterTime: 60,
                    removeEffect: 'flicker'
                });
            }
            //remove the coin
            coin.removeSelf();
        };

        // collect a coin
        var collectSweet = function (sweet) {
            // give coin
            gameController.giveScore(1);
            //play sound and haptic
            candyCollected++;
            Bento.audio.stopSound('sfx_candy_' + (1 + (candyCollected % 8)));
            Bento.audio.playSound('sfx_candy_' + (1 + (candyCollected % 8)));
            TapticEngine.impact({
                style: 'light'
            });
            //make sparkles
            if (Globals.showEffects) {
                for (var i = 3 - 1; i >= 0; i--) {
                    new Sparkle({
                        position: sweet.position.add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4)))
                    });
                }
            }
            // make text particle
            if (Globals.showCounters) {
                new Particle({
                    z: Globals.layers.effects,
                    sprite: new GameCounter({
                        value: '+1'
                    }),
                    originRelative: new Vector2(0.5, 0.5),
                    position: sweet.position.clone(),
                    rotation: 0,
                    rotationRate: Utils.getRandomRangeFloat(-0.02, 0.02),
                    velocity: new Vector2(Utils.getRandomRangeFloat(-0.5, 0.5), Math.min(movable.velocity.y, 0) - 1.5),
                    scale: Globals.pixelScaleV.scalarMultiply(0.25),
                    acceleration: new Vector2(0, 0.04),
                    friction: 1,
                    removeAfterTime: 60,
                    removeEffect: 'flicker'
                });
            }
            //remove the coin
            sweet.removeSelf();
        };


        var collectFever = function (fever) {
            // make sparkles
            if (Globals.showEffects) {
                for (var i = 15 - 1; i >= 0; i--) {
                    new Sparkle({
                        position: fever.position.add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4)))
                    });
                }
            }

            // begin fever mode
            startFever();

            // remove the fever collectible
            fever.removeSelf();
        };


        // begin fever mode
        var startFever = function () {
            isFever = true;
            feverTime = feverTimeMax;
            new FeverText({});
            Bento.audio.setVolume(0.5, 'sfx_feverstart');
            Bento.audio.playSound('sfx_feverstart');
            Bento.audio.playSound('sfx_feverloop', true);

            // tween movement speed
            new Tween({
                from: growSpeed,
                to: feverSpeed,
                in: 60,
                ease: 'easeOutExpo',
                onUpdate: function (v, t) {
                    growSpeed = v;
                }
            });

            // animate in fever mode
            if (camera) {
                new Tween({
                    from: camera.getViewScale(),
                    to: 1,
                    in: 30,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        camera.setViewScale(v);
                    }
                });
            }
            if (background) {
                new Tween({
                    from: 0,
                    to: 1,
                    in: 30,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        background.setFeverIntensity(v);
                    }
                });
            }
            new Tween({
                from: feverDrawEntity.alpha,
                to: 0.5,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    feverDrawEntity.alpha = v;
                }
            });

            //fire events
            EventSystem.fire('onFeverChanged', true);
        };


        // end fever mode
        var endFever = function () {
            isFever = false;
            feverTime = 0;

            Bento.audio.playSound('sfx_feverstop');
            Bento.audio.stopSound('sfx_feverloop');

            // tween movement speed
            new Tween({
                from: growSpeed,
                to: standardSpeed,
                in: 60,
                ease: 'easeOutExpo',
                onUpdate: function (v, t) {
                    growSpeed = v;
                }
            });

            // animate out fever mode
            if (camera) {
                new Tween({
                    from: camera.getViewScale(),
                    to: 0.875,
                    in: 30,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        camera.setViewScale(v);
                    }
                });
            }
            if (background) {
                new Tween({
                    from: background.getFeverIntensity(),
                    to: 0,
                    in: 30,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        background.setFeverIntensity(v);
                    }
                });
            }
            new Tween({
                from: feverDrawEntity.alpha,
                to: 0,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    feverDrawEntity.alpha = v;
                }
            });

            //fire events
            EventSystem.fire('onFeverChanged', false);
        };


        // cash in the score that we currently have in thisScore
        var cashInScore = function (isFinal) {
            // if we can cash anything
            if (gameController && thisScore <= 0) {
                return;
            }
            // put the score in the game controller 
            gameController.giveScore(thisScore);
            // make the cheers
            var displayCashInPoints = new GameCounter({
                value: '+' + thisScore,
                imageName: 'scorecounter2'
            });
            if (Globals.showCounters) {
                //thisScale correlates to the score
                var thisScale = new Vector2(1, 1).scalarMultiply(Globals.pixelScale * Math.min((0.5 + 0.3 * thisScore / 60), 1.2));

                // show score count
                var bigscore = new Particle({
                    z: Globals.layers.gui,
                    sprite: displayCashInPoints,
                    originRelative: new Vector2(0.5, 0.5),
                    position: entity.getHeadPosition().add(new Vector2(0, -10)),
                    rotation: 0,
                    rotationRate: Utils.getRandomRangeFloat(-0.005, 0.005),
                    velocity: new Vector2(0, -0.4),
                    scale: new Vector2(0, 0),
                    acceleration: new Vector2(0, 0),
                    friction: 1,
                    removeAfterTime: 100,
                    removeEffect: 'fade'
                });
                new Tween({
                    from: 0.05,
                    to: 0,
                    in: 120,
                    ease: 'elastic',
                    decay: 15,
                    oscillations: 7,
                    onUpdate: function (v, t) {
                        bigscore.scale.y = thisScale.y - v;
                        bigscore.scale.x = thisScale.x + v * 2;
                    }
                });
                // give cheers for each score level
                if (thisScore >= 50) {
                    new Cheer({
                        text: Localization.getText('amazing'),
                        position: entity.getHeadPosition()
                    });
                } else if (thisScore >= 40) {
                    new Cheer({
                        text: Localization.getText('spectacular'),
                        position: entity.getHeadPosition()
                    });
                } else if (thisScore >= 30) {
                    new Cheer({
                        text: Localization.getText('awesome'),
                        position: entity.getHeadPosition()
                    });
                } else if (thisScore >= 20) {
                    new Cheer({
                        text: Localization.getText('great'),
                        position: entity.getHeadPosition()
                    });
                } else if (thisScore >= 10) {
                    new Cheer({
                        text: Localization.getText('nice'),
                        position: entity.getHeadPosition()
                    });
                }
            }
            thisScore = 0;
        };


        // smash a breakable
        var hitBreakable = function (other) {
            if (other.break) {
                other.break(entity);
            } else {
                other.removeSelf();
            }
            thisScore++;
            addScoreParticle(1);
            snapHead();
            stemShudder = 40;
        };


        // fever smash
        var hitHazardFever = function (other) {
            if (hasFlame) {
                endFlame = true;
            }
            if (other.break) {
                other.break(entity);
            } else {
                other.removeSelf();
            }
            if (Globals.showEffects) {
                new Particle({
                    z: Globals.layers.effects,
                    spriteSheet: 'effects/hit',
                    position: entity.position.add(head.position).add(other.position).scalarMultiply(0.5),
                    scale: Globals.pixelScaleV
                });
            }
            Bento.audio.stopSound('sfx_hit');
            Bento.audio.playSound('sfx_hit');
            // put the score in the game controller 
            gameController.giveScore(3);
            if (Globals.showCounters) {
                new Particle({
                    z: Globals.layers.effects,
                    sprite: new GameCounter({
                        value: '+3'
                    }),
                    originRelative: new Vector2(0.5, 0.5),
                    position: other.position.clone(),
                    rotation: 0,
                    rotationRate: Utils.getRandomRangeFloat(-0.02, 0.02),
                    velocity: new Vector2(Utils.getRandomRangeFloat(-0.5, 0.5), Math.min(movable.velocity.y, 0) - 1.5),
                    scale: Globals.pixelScaleV.scalarMultiply(0.25),
                    acceleration: new Vector2(0, 0.04),
                    friction: 1,
                    removeAfterTime: 60,
                    removeEffect: 'flicker'
                });
            }
            snapHead();
            stemShudder = 40;
        };

        var killEnemy = function (other) {
            if (other.getIsDead()) {
                return;
            }
            other.squash();
            // put the score in the game controller 
            gameController.giveScore(5);
            new Particle({
                z: Globals.layers.effects,
                sprite: new GameCounter({
                    value: '+5'
                }),
                originRelative: new Vector2(0.5, 0.5),
                position: other.position.clone(),
                rotation: 0,
                rotationRate: Utils.getRandomRangeFloat(-0.02, 0.02),
                velocity: new Vector2(Utils.getRandomRangeFloat(-0.25, 0.25), Math.min(movable.velocity.y, 0) - 1),
                scale: Globals.pixelScaleV.scalarMultiply(0.25),
                acceleration: new Vector2(0, 0.04),
                friction: 1,
                removeAfterTime: 60,
                removeEffect: 'flicker'
            });
        };


        //creates a particle with a score count in, styled as a core text
        var addScoreParticle = function (score) {
            // make game counter
            var displayNewPoints = new GameCounter({
                value: '+' + score
            });
            // make particle
            if (Globals.showCounters) {
                new Particle({
                    z: Globals.layers.effects,
                    sprite: displayNewPoints,
                    originRelative: new Vector2(0.5, 0.5),
                    position: entity.getHeadPosition().add(new Vector2(0, -30)),
                    rotation: 0,
                    rotationRate: Utils.getRandomRangeFloat(-0.02, 0.02),
                    velocity: new Vector2(Utils.getRandomRangeFloat(-0.5, 0.5), Math.min(movable.velocity.y, 0) - 1),
                    scale: Globals.pixelScaleV.scalarMultiply(Math.min(0.2 + score * 0.15, 0.4)),
                    acceleration: new Vector2(0, 0.04),
                    friction: 1,
                    removeAfterTime: 60,
                    removeEffect: 'scale'
                });
            }
        };


        // change out the plant skin mid game
        var setPlantSkin = function (newPlantSkin) {
            plantSkin = newPlantSkin;
            plantSkinExtraScale = Bento.assets.getJson('skin_data')['plants']['extraScale'][plantSkin] || 1;
            headSprite.sprite.setSpriteSheet('headskins/' + plantSkin);
            headSprite.sprite.setAnimation('idle');
            headSprite.scale = new Vector2(Globals.pixelScale, Globals.pixelScale).scalarMultiply(plantSkinExtraScale);
            feverDrawEntity.alpha = 0;
            leafSpriteContainer = new SpriteContainer({
                imageName: 'stemskins/' + plantSkin + '-leaf',
                originRelative: new Vector2(0, 1),
                scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
            });
            stemSpriteContainer = new SpriteContainer({
                imageName: 'stemskins/' + plantSkin + '-stem',
                originRelative: new Vector2(0.5, 0.5),
                scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
            });
            if (plantSkin === 'calci') {
                hasFlame = true;
            } else {
                hasFlame = false;
            }
            if (plantSkin === 'growbot') {
                fallSpeed = 1.25;
            } else {
                fallSpeed = 3;
            }
            if (plantSkin === 'rocketboy') {
                speedMultiplier = 1.3;
            } else {
                speedMultiplier = 1;
            }
        };


        // hcange out the pot skin mid level
        var setPotSkin = function (newPotSkin) {
            potSkin = newPotSkin;
            potSpriteContainer = new SpriteContainer({
                spriteSheet: 'potskins/' + potSkin,
                position: potAnchor.clone(),
                scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
            });
        };



        // --- COMPONENTS ---
        //holds the graphic for all leaves
        var leafSpriteContainer = new SpriteContainer({
            imageName: 'stemskins/' + plantSkin + '-leaf',
            originRelative: new Vector2(0, 1),
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
        });

        // holds the graphic for all stems
        var stemSpriteContainer = new SpriteContainer({
            imageName: 'stemskins/' + plantSkin + '-stem',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
        });

        // holds the graphic for the pot
        var potSpriteContainer = new SpriteContainer({
            spriteSheet: 'potskins/' + potSkin,
            position: potAnchor.clone(),
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
        });

        // hold the graphic for the head
        var headSprite = new SpriteContainer({
            spriteSheet: 'headskins/' + plantSkin,
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale).scalarMultiply(plantSkinExtraScale),
            position: new Vector2(0, 6)
        });
        headSprite.sprite.setAnimation('idle');

        //the head subentity
        var head = new Entity({
            name: 'headEntity',
            position: headAnchor.clone(),
            boundingBox: new Rectangle((-collisionSize * 0.5), (-collisionSize * 0.5), collisionSize, collisionSize),
            components: [
                headSprite, {
                    name: "debugDrawBehaviour",
                    draw: function (data) {
                        if (Globals.debug) {
                            data.renderer.rotate(-head.rotation);
                            var bb = head.boundingBox;
                            data.renderer.fillRect([0, 0, 1, 0.5], bb.x, bb.y, bb.width, bb.height);
                            data.renderer.fillCircle([0, 1, 1, 0.5], bb.getCenter().x, bb.getCenter().y, collisionSize * 0.5);
                        }
                    }
                }
            ]
        });

        // clickable that dictates all of the input
        var clickable = new Clickable({
            pointerDown: function (data) {
                //start dragging
                isDragging = true;
                lastInputPosition = data.position.clone();
            },
            pointerUp: function (data) {
                //stop dragging
                isDragging = false;
                lastInputPosition = data.position.clone();
            },
            pointerMove: function (data) {
                // drag
                if (isGrowing) {
                    deltaX += (data.position.x - lastInputPosition.x) * 1.25;
                    lastInputPosition = data.position.clone();
                }
            }
        });

        // the movable the player requires to be able to move and hit solids
        var movable = new Movable({
            velocity: new Vector2(0, 0)
        });

        // the behaviour for the player's mechanics and functionality
        var behaviour = {
            name: "behaviour",
            destroy: function () {
                Bento.audio.stopSound('sfx_feverloop');
            },
            update: function (data) {

                // get stuff
                var solids = [];
                Utils.forEach(Bento.objects.getByFamily('solids'), function (solid, i, l, breakLoop) {
                    if (solid && solid.visible) {
                        solids.push(solid);
                    }
                });
                var hazards = [];
                Utils.forEach(Bento.objects.getByFamily('hazards'), function (hazard, i, l, breakLoop) {
                    if (hazard && hazard.visible) {
                        hazards.push(hazard);
                    }
                });
                var coins = [];
                Utils.forEach(Bento.objects.getByFamily('coins'), function (coin, i, l, breakLoop) {
                    if (coin && coin.visible) {
                        coins.push(coin);
                    }
                });
                var sweets = [];
                Utils.forEach(Bento.objects.getByFamily('sweets'), function (sweet, i, l, breakLoop) {
                    if (sweet && sweet.visible) {
                        sweets.push(sweet);
                    }
                });
                var walkenemies = [];
                Utils.forEach(Bento.objects.getByFamily('walkenemies'), function (walkenemy, i, l, breakLoop) {
                    if (walkenemy && walkenemy.visible) {
                        walkenemies.push(walkenemy);
                    }
                });

                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                if (!background) {
                    background = Bento.objects.get('background');
                }
                if (!gameController) {
                    gameController = Bento.objects.get('gameController');
                }

                // set/reset states
                isGrowing = false;
                if (isEnabled && canGrow && isDragging) {
                    isGrowing = true;
                    if (playIdleAnim) {
                        drawEntity.scale = new Vector2(1, 1);
                        headSprite.scale = Globals.pixelScaleV.scalarMultiply(plantSkinExtraScale);
                        headSprite.rotation = 0;
                    }
                    if (!wasGrowing) {
                        snapHead();
                        Bento.audio.stopSound('sfx_grow_head');
                        Bento.audio.playSound('sfx_grow_head');
                    }
                } else {
                    deltaX = 0;
                }

                // fever mode stuff
                isFever = feverTime > 0;
                if (isFever) {
                    if (isGrowing) {
                        feverTime -= data.speed;
                    } else {
                        feverTime -= feverDecay * data.speed;
                    }
                    if (feverTime < 120) {
                        feverDrawEntity.alpha = 0.25 + (Math.sin(feverTime) * 0.25);
                    }
                } else {
                    //end fever mode
                    if (wasFever) {
                        endFever();
                    }
                }

                // get  the direction to grow in
                var inputVector = new Vector2(Utils.clamp(-standardSpeed * 4, (deltaX - head.position.x) * 0.075, standardSpeed * 4), -1).normalize();

                // get the head velocity 
                headVelocity.scalarMultiplyWith(0.9);
                var thisHeadVelocity = headVelocity.clone().normalize().scalarMultiply(Math.min(2, headVelocity.clone().magnitude()));

                //get total movement vector
                var growVector = thisHeadVelocity.add(inputVector.scalarMultiply((pauseGrowing) ? 0 : (growSpeed * speedMultiplier)));


                // check if we're on the ground
                var groundCollision = false;
                entity.collidesWith({
                    entities: solids,
                    offset: new Vector2(0, 1),
                    firstOnly: true,
                    onCollide: function (other) {
                        if (other.id === entity.id) {
                            return;
                        }
                        groundCollision = true;
                    }
                });
                isGrounded = (!snappingBack && groundCollision);

                // if we're not frozen or dead
                if (isEnabled && !isDead) {
                    // fall
                    if (useGravity) {
                        movable.velocity.y += gravity;
                    }
                    if (Math.abs(movable.velocity.y) > fallSpeed) {
                        movable.velocity.y = Utils.sign(movable.velocity.y) * fallSpeed;
                    }
                    //friction
                    movable.velocity.x *= 1 - ((1 - friction) * data.speed);
                    if (Math.abs(movable.velocity.x) < 0.1) {
                        movable.velocity.x = 0;
                    }
                    // if we're growing
                    if (isGrowing) {
                        var bumpedInto = null;
                        // bump/move head

                        // Y
                        head.position.y += growVector.y * data.speed;
                        head.collidesWith({
                            entities: solids,
                            offset: entity.position.clone(),
                            firstOnly: true,
                            onCollide: function (other) {
                                if (other.id === entity.id) {
                                    return;
                                }
                                //skip oneway
                                if (other.family.indexOf('onewayplatform') !== -1) {
                                    return;
                                }
                                //smash breakables
                                if (other.family.indexOf('breakables') !== -1) {
                                    hitBreakable(other);
                                    return;
                                }
                                //destroy things in fever mode
                                if (isFever || hasFlame) {
                                    if (other.family.indexOf('movingplatforms') !== -1) {
                                        hitHazardFever(other);
                                        return;
                                    }
                                    if (other.family.indexOf('triggerdoors') !== -1) {
                                        hitHazardFever(other);
                                        return;
                                    }
                                }
                                var BB = head.getBoundingBox().offset(entity.position);
                                var otherBB = other.getBoundingBox();
                                if (!otherBB.intersectsCircle(BB.getCenter(), (collisionSize * 0.5) + 1)) {
                                    return;
                                }
                                //head.position.y = ((BB.getCenter().y > otherBB.getCenter().y) ? otherBB.getY2() + (BB.getY2() - (entity.position.y + head.position.y)) : otherBB.y - (BB.getY2() - (entity.position.y + head.position.y))) - entity.position.y;
                                head.position.y -= (BB.getCenter().y > otherBB.getCenter().y) ? (BB.y - otherBB.getY2()) : (BB.getY2() - otherBB.y);
                                movable.velocity = new Vector2(0, 0);
                                bumpedInto = other;
                            }
                        });

                        // X
                        head.position.x += growVector.x * data.speed;
                        // clamp head in room
                        if (head.position.x > (viewport.width * 0.5) + (90 - 18) - entity.position.x) {
                            head.position.x = (viewport.width * 0.5) + (90 - 18) - entity.position.x;
                            deltaX += (head.position.x - deltaX) * 0.5;
                        }
                        if (head.position.x < (viewport.width * 0.5) - (90 - 18) - entity.position.x) {
                            head.position.x = (viewport.width * 0.5) - (90 - 18) - entity.position.x;
                            deltaX += (head.position.x - deltaX) * 0.5;
                        }
                        head.collidesWith({
                            entities: solids,
                            offset: entity.position.clone(),
                            firstOnly: true,
                            onCollide: function (other) {
                                if (other.id === entity.id) {
                                    return;
                                }
                                //skip oneway
                                if (other.family.indexOf('onewayplatform') !== -1) {
                                    return;
                                }
                                //smash breakable
                                if (other.family.indexOf('breakables') !== -1) {
                                    hitBreakable(other);
                                    return;
                                }
                                //destroy things in fever mode
                                if (isFever || hasFlame) {
                                    if (other.family.indexOf('movingplatforms') !== -1) {
                                        hitHazardFever(other);
                                        return;
                                    }
                                    if (other.family.indexOf('triggerdoors') !== -1) {
                                        hitHazardFever(other);
                                        return;
                                    }
                                }
                                var BB = head.getBoundingBox().offset(entity.position);
                                var otherBB = other.getBoundingBox();
                                if (!otherBB.intersectsCircle(BB.getCenter(), (collisionSize * 0.5) + 1)) {
                                    return;
                                }
                                //head.position.x = ((BB.getCenter().x > otherBB.getCenter().x) ? otherBB.getX2() + (BB.getX2() - (entity.position.x + head.position.x)) : otherBB.x - (BB.getX2() - (entity.position.x + head.position.x))) - entity.position.x;
                                // console.log((BB.getCenter().x > otherBB.getCenter().x) ? (BB.x - otherBB.getX2()) : (BB.getX2() - otherBB.x));
                                head.position.x -= (BB.getCenter().x > otherBB.getCenter().x) ? (BB.x - otherBB.getX2()) : (BB.getX2() - otherBB.x);
                                movable.velocity = new Vector2(0, 0);
                                bumpedInto = other;
                            }
                        });

                        // snap/bump on collision
                        if (bumpedInto) {
                            //create a collision normal
                            var bumpHeadPosition = entity.getHeadPosition();
                            var bumpBB = bumpedInto.getBoundingBox();
                            var bumpVector = bumpHeadPosition.subtract(new Vector2(Utils.clamp(bumpBB.x, bumpHeadPosition.x, bumpBB.x + bumpBB.width), Utils.clamp(bumpBB.y, bumpHeadPosition.y, bumpBB.y + bumpBB.height))).normalize();

                            Bento.audio.setVolume(0.5, 'sfx_hit');
                            Bento.audio.playSound('sfx_hit');
                            if (Globals.showEffects) {
                                new Particle({
                                    z: Globals.layers.effects,
                                    spriteSheet: 'effects/hit',
                                    position: entity.position.add(head.position).add(bumpVector.scalarMultiply(-8)),
                                    scale: Globals.pixelScaleV
                                });
                            }
                            TapticEngine.impact({
                                style: 'heavy'
                            });
                            camera.shake(50);

                            if (!(isFever || hasFlame)) {
                                snapBack(undefined, true);
                                return;
                            } else {
                                // bounce off in fever mode
                                endFlame = true;
                                bumpHead(bumpVector);
                            }
                        }

                        // add on to the stem array if we cross a distance threshold
                        var deltaPoint = head.position.subtract(stemPoints[stemPoints.length - 1]);
                        while (deltaPoint.magnitude() < stemSpacing) {
                            if (stemPoints.length > defaultPoints.length && deltaPoint.magnitude() < stemSpacing) {
                                stemPoints.pop();
                                leafPoints.pop();
                                if (leafTweens[leafTweens.length - 1] != null) {
                                    leafTweens[leafTweens.length - 1].stop();
                                }
                                leafTweens.pop();
                                deltaPoint = head.position.subtract(stemPoints[stemPoints.length - 1]);
                            }
                        }
                        while (deltaPoint.magnitude() > stemSpacing) {
                            var nextPoint = stemPoints[stemPoints.length - 1].add(deltaPoint.normalize().scalarMultiply(stemSpacing));
                            stemPoints.push(nextPoint);
                            leafPoints.push(0);
                            leafTweens.push(null);
                            //randomly add a leaf
                            if (Utils.getRandom(6) === 0) {
                                var leafIndex = leafPoints.length - 1;
                                //tween in the leaf's scale
                                leafTweens[leafIndex] = new Tween({
                                    from: 0,
                                    to: 0.8,
                                    in: 30,
                                    ease: 'easeOutBack',
                                    onUpdate: function (v, t) {
                                        if (Utils.isDefined(leafPoints[leafIndex])) {
                                            leafPoints[leafIndex] = v;
                                        } else {
                                            if (leafTweens[leafIndex]) {
                                                leafTweens[leafIndex].stop();
                                            }
                                        }
                                    }
                                });
                            }
                        }

                        // only score when above last score position, at set intervals
                        totalLength += growVector.magnitude() * data.speed;
                        if ((head.position.add(entity.position)).y < lastScoreHeight) {
                            if (totalLength - lastScoreLength > 18) {
                                thisScore += (isFever) ? 1 : 1;
                                lastScoreLength = totalLength;
                                TapticEngine.impact({
                                    style: 'light'
                                });
                                heightCollected++;
                                snapHead();
                                Bento.audio.setVolume(0.4 + Utils.getRandomFloat(0.2), 'sfx_grow_head');
                                Bento.audio.stopSound('sfx_grow_head');
                                Bento.audio.playSound('sfx_grow_head');
                            }
                            lastScoreHeight = (head.position.add(entity.position)).y;
                        }

                        // check if something touches our tail
                        for (var index = stemPoints.length - 6; index > 0; index -= 8) {
                            var point = stemPoints[Math.max(0, index - 8)];
                            if (point) {
                                if (point.y > viewport.y + viewport.height - entity.position.y) {
                                    break;
                                }
                                if (!isDead) {
                                    Utils.forEach(solids, function (solid, i, l, breakLoop) {
                                        if (solid.id === entity.id) {
                                            return;
                                        }

                                        //skip oneway
                                        if (solid.family.indexOf('onewayplatform') !== -1) {
                                            return;
                                        }

                                        var BB = solid.getBoundingBox();
                                        var thisPoint = stemPoints[index].clone();
                                        var thatPoint = point.clone();
                                        if (BB.intersectsLine(thisPoint.add(entity.position), thatPoint.add(entity.position))) {
                                            if (isFever || hasFlame) {
                                                //if fever, destroy it
                                                hitHazardFever(solid);
                                            } else {
                                                // if it does, die ☠️
                                                if (Globals.showEffects) {
                                                    new Particle({
                                                        z: Globals.layers.effects,
                                                        spriteSheet: 'effects/hit',
                                                        position: entity.position.add((thisPoint.add(thatPoint)).scalarMultiply(0.5)),
                                                        scale: Globals.pixelScaleV
                                                    });
                                                }
                                                die();
                                            }
                                            breakLoop();
                                        }
                                    });

                                    Utils.forEach(hazards, function (hazard, i, l, breakLoop) {
                                        var BB = hazard.getBoundingBox();
                                        var thisPoint = stemPoints[index].clone();
                                        var thatPoint = point.clone();
                                        if (BB.intersectsLine(thisPoint.add(entity.position), thatPoint.add(entity.position))) {
                                            if (isFever || hasFlame) {
                                                //if fever, destroy it
                                                hitHazardFever(hazard);
                                            } else {
                                                // if it does, die ☠️
                                                if (Globals.showEffects) {
                                                    new Particle({
                                                        z: Globals.layers.effects,
                                                        spriteSheet: 'effects/hit',
                                                        position: entity.position.add((thisPoint.add(thatPoint)).scalarMultiply(0.5)),
                                                        scale: Globals.pixelScaleV
                                                    });
                                                }
                                                die();
                                            }
                                            breakLoop();
                                        }
                                    });

                                    Utils.forEach(walkenemies, function (enemy, i, l, breakLoop) {
                                        var BB = enemy.getBoundingBox();
                                        var thisPoint = stemPoints[index].clone();
                                        var thatPoint = point.clone();
                                        if (BB.intersectsLine(thisPoint.add(entity.position), thatPoint.add(entity.position))) {
                                            if (isFever || hasFlame) {
                                                //if fever kill it
                                                killEnemy(enemy);
                                            } else {
                                                // if it does, die ☠️
                                                if (Globals.showEffects) {
                                                    new Particle({
                                                        z: Globals.layers.effects,
                                                        spriteSheet: 'effects/hit',
                                                        position: entity.position.add((thisPoint.add(thatPoint)).scalarMultiply(0.5)),
                                                        scale: Globals.pixelScaleV
                                                    });
                                                }
                                                die();
                                            }
                                            breakLoop();
                                        }
                                    });

                                }
                            }
                        }
                    } else {
                        // reset if we were just growing but aren't now
                        if (wasGrowing) {
                            movable.velocity = new Vector2(0, 0);
                            snapBack();
                        }
                    }

                    // rotate the head to the movement direction
                    if (isGrowing && !snappingBack) {
                        head.rotation += ((inputVector.angle() + Math.PI * 0.5) - head.rotation) * 0.25 * data.speed;
                    }

                    //magnitise coins to head

                    var magnetDistance = (isFever ? 44 : 22) * (plantSkin === 'kingplant' ? 2 : 1);

                    var headPosition = entity.getHeadPosition();
                    Utils.forEach(coins, function (coin, i, l, breakLoop) {
                        if (coin.position.distance(headPosition) < magnetDistance) {
                            coin.position.addTo((headPosition.subtract(coin.position)).scalarMultiply(0.075 * data.speed));
                            coin.setMoveX(0);
                        }
                    });
                    //magnitise sweets to head
                    Utils.forEach(sweets, function (sweet, i, l, breakLoop) {
                        if (sweet.position.distance(headPosition) < magnetDistance) {
                            sweet.position.addTo((headPosition.subtract(sweet.position)).scalarMultiply(0.075 * data.speed));
                            sweet.setMoveX(0);
                        }
                    });

                    // collect fevers with head
                    head.collidesWith({
                        family: "fevers",
                        firstOnly: true,
                        offset: entity.position.clone(),
                        onCollide: function (other) {
                            collectFever(other);
                        }
                    });

                    // collect coins with body
                    entity.collidesWith({
                        entities: coins,
                        firstOnly: true,
                        onCollide: function (other) {
                            collectCoin(other);
                        }
                    });

                    // collect coins with head
                    head.collidesWith({
                        entities: coins,
                        firstOnly: true,
                        offset: entity.position.clone(),
                        onCollide: function (other) {
                            collectCoin(other);
                        }
                    });

                    // collect sweets with body
                    entity.collidesWith({
                        entities: sweets,
                        firstOnly: true,
                        onCollide: function (other) {
                            collectSweet(other);
                        }
                    });

                    // collect sweets with head
                    head.collidesWith({
                        entities: sweets,
                        firstOnly: true,
                        offset: entity.position.clone(),
                        onCollide: function (other) {
                            collectSweet(other);
                        }
                    });

                    // success when head collides with endgoal
                    head.collidesWith({
                        name: "endarrow",
                        offset: entity.position.clone(),
                        onCollide: function (other) {
                            win(other);
                            other.onWin();
                        }
                    });

                    // hit walkenemies with body
                    entity.collidesWith({
                        entities: walkenemies,
                        firstOnly: false,
                        onCollide: function (other) {
                            if (!isDead && !other.getIsDead()) {
                                if (movable.velocity.y > 0.5 || entity.position.y < other.position.y) {
                                    killEnemy(other);
                                    movable.velocity.y = -1;
                                } else {
                                    if (Globals.showEffects) {
                                        new Particle({
                                            z: Globals.layers.effects,
                                            spriteSheet: 'effects/hit',
                                            position: (entity.position.add(head.position)),
                                            scale: Globals.pixelScaleV
                                        });
                                    }
                                    if (isFever || hasFlame) {
                                        killEnemy(other);
                                    } else {
                                        die();
                                    }
                                }
                            }
                        }
                    });

                    // hit walkenemies with head
                    head.collidesWith({
                        entities: walkenemies,
                        offset: entity.position.clone(),
                        firstOnly: false,
                        onCollide: function (other) {
                            if (!isDead && !other.getIsDead()) {
                                if (isFever || hasFlame) {
                                    killEnemy(other);
                                } else {
                                    die();
                                }
                            }
                        }
                    });

                    // hit hazards with body
                    entity.collidesWith({
                        entities: hazards,
                        firstOnly: true,
                        onCollide: function (other) {
                            if (!isDead) {
                                if (Globals.showEffects) {
                                    new Particle({
                                        z: Globals.layers.effects,
                                        spriteSheet: 'effects/hit',
                                        position: (entity.position.add(head.position)),
                                        scale: Globals.pixelScaleV
                                    });
                                }
                                if (isFever || hasFlame) {
                                    hitHazardFever(other);
                                } else {
                                    die();
                                }
                            }
                        }
                    });

                    // hit hazards with head
                    head.collidesWith({
                        entities: hazards,
                        offset: entity.position.clone(),
                        firstOnly: false,
                        onCollide: function (other) {
                            var BB = head.getBoundingBox().offset(entity.position);
                            var otherBB = other.getBoundingBox();
                            if (!otherBB.intersectsCircle(BB.getCenter(), collisionSize * 0.5)) {
                                return;
                            }
                            if (!isDead) {
                                if (Globals.showEffects) {
                                    new Particle({
                                        z: Globals.layers.effects,
                                        spriteSheet: 'effects/hit',
                                        position: entity.position.add(head.position),
                                        scale: Globals.pixelScaleV
                                    });
                                }
                                if (isFever || hasFlame) {
                                    hitHazardFever(other);
                                } else {
                                    die();
                                }
                            }
                        }
                    });

                    //perform a landing if we're grounded
                    if (!wasGrounded && isGrounded) {
                        timesLanded++;
                        cashInScore();
                        Bento.audio.stopSound('sfx_land');
                        Bento.audio.playSound('sfx_land');
                        TapticEngine.impact({
                            style: 'heavy'
                        });
                        headSprite.sprite.setAnimation('idle');
                        playIdleAnim = false;
                        new Tween({
                            from: new Vector2(1, 1),
                            to: new Vector2(1.25, 0.75),
                            in: 5,
                            ease: 'easeOutBack',
                            onUpdate: function (v, t) {
                                //drawEntity.scale = v;
                                headSprite.rotation = Math.sin(entity.ticker * 0.1) * 0.08;
                                headSprite.scale.x = Globals.pixelScale * plantSkinExtraScale + Math.sin(entity.ticker * 0.2) * 0.01;
                                headSprite.scale.y = Globals.pixelScale * plantSkinExtraScale - Math.sin(entity.ticker * 0.2) * 0.01;
                                drawEntity.scale.x = v.x + Math.cos(entity.ticker * 0.2) * 0.02;
                                drawEntity.scale.y = v.y - Math.cos(entity.ticker * 0.2) * 0.02;
                            },
                            onComplete: function () {
                                new Tween({
                                    from: new Vector2(1.25, 0.75),
                                    to: new Vector2(1, 1),
                                    in: 15,
                                    ease: 'easeOutBack',
                                    onUpdate: function (v, t) {
                                        headSprite.rotation = Math.sin(entity.ticker * 0.1) * 0.08;
                                        headSprite.scale.x = Globals.pixelScale * plantSkinExtraScale + Math.sin(entity.ticker * 0.2) * 0.01;
                                        headSprite.scale.y = Globals.pixelScale * plantSkinExtraScale - Math.sin(entity.ticker * 0.2) * 0.01;
                                        drawEntity.scale.x = v.x + Math.cos(entity.ticker * 0.2) * 0.02;
                                        drawEntity.scale.y = v.y - Math.cos(entity.ticker * 0.2) * 0.02;
                                    },
                                    onComplete: function () {
                                        playIdleAnim = true;
                                    }
                                });
                            }
                        });
                        switch (plantSkin) {
                        case "goji":
                            var factor = Math.abs(movable.lastVelocity.y) / fallSpeed;
                            if (factor > 0.75) {
                                camera.shake(75);
                                if (Globals.showEffects) {
                                    new Particle({
                                        spriteSheet: 'effects/gojibang',
                                        position: entity.position.add(new Vector2(0, 2)),
                                        alpha: 1,
                                        scale: Globals.pixelScaleV.scalarMultiply(1.5),
                                        rotation: 0,
                                        rotationRate: 0,
                                        velocity: new Vector2(0, 0),
                                        gravity: 0,
                                        friction: 1,
                                        removeAfterTime: 0,
                                        removeEffect: 'none',
                                        z: Globals.layers.effects
                                    });
                                }
                                Utils.forEach(coins, function (coin, i, l, breakLoop) {
                                    coin.startFall();
                                });
                                Utils.forEach(sweets, function (sweet, i, l, breakLoop) {
                                    sweet.startFall();
                                });
                            } else {
                                if (Globals.showEffects) {
                                    for (var i = 2 - 1; i >= 0; i--) {
                                        new Particle({
                                            spriteSheet: 'particles/dust',
                                            position: entity.position.add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4))),
                                            alpha: 1,
                                            scale: Globals.pixelScaleV,
                                            rotation: Utils.getRandomRangeFloat(-2, 2),
                                            rotationRate: 0,
                                            velocity: new Vector2(Utils.getRandomRangeFloat(-0.1, 0.1), Utils.getRandomRangeFloat(-0.1, 0.1)),
                                            gravity: 0,
                                            friction: 1,
                                            removeAfterTime: 0,
                                            removeEffect: 'none',
                                            z: Globals.layers.effects
                                        });
                                    }
                                }
                            }
                            break;
                        default:
                            if (Globals.showEffects) {
                                for (var i = 2 - 1; i >= 0; i--) {
                                    new Particle({
                                        spriteSheet: 'particles/dust',
                                        position: entity.position.add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4))),
                                        alpha: 1,
                                        scale: Globals.pixelScaleV,
                                        rotation: Utils.getRandomRangeFloat(-2, 2),
                                        rotationRate: 0,
                                        velocity: new Vector2(Utils.getRandomRangeFloat(-0.3, 0.3), Utils.getRandomRangeFloat(-0.1, 0.1)),
                                        gravity: 0,
                                        friction: 1,
                                        removeAfterTime: 0,
                                        removeEffect: 'none',
                                        z: Globals.layers.effects
                                    });
                                }
                            }
                            break;
                        }
                    }

                    rightDownGrounded = isGrounded && !entity.collidesWith({
                        entities: solids,
                        offset: new Vector2(-9, 1),
                        firstOnly: true
                    });
                    leftDownGrounded = isGrounded && !entity.collidesWith({
                        entities: solids,
                        offset: new Vector2(9, 1),
                        firstOnly: true
                    });
                    drawEntity.rotation = 0;
                    wobbleAnimationScale *= 0.9;
                    wobbleSide = (leftDownGrounded ? -1 : 0) + (rightDownGrounded ? 1 : 0);
                    if (wobbleSide && !isWin) {
                        if (!isGrowing && !snappingBack) {
                            wobbleAnimationScale += 0.1;
                            wobbleAnimationScale = Utils.clamp(0, wobbleAnimationScale, 1);
                            //rotate head
                            headSprite.rotation = (Math.sin(entity.ticker * 0.2) * 0.2) * -wobbleAnimationScale;
                            headSprite.position.x = Math.sin(entity.ticker * 0.1) * 0.5 * wobbleSide;
                        }
                        //rotate body
                        drawEntity.rotation = (Math.sin(entity.ticker * 0.1) * 0.1 - (wobbleSide * 0.1)) * wobbleAnimationScale;
                        drawEntity.position = new Vector2(Math.sin(entity.ticker * 0.1) * -0.25 * wobbleSide, Math.sin(entity.ticker * 0.1) * -0.25 * wobbleSide);
                    }
                }

                if (!isDead) {
                    //skin effects
                    switch (plantSkin) {
                    case "calci":
                        feverDrawEntity.alpha = hasFlame ? 0.25 : feverDrawEntity.alpha * 0.5;
                        if (Globals.showEffects && Utils.getRandom(2) === 0) {
                            new Particle({
                                spriteSheet: 'effects/spark',
                                position: entity.position.add(head.position).add(new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(-4, 4))),
                                alpha: 0.85,
                                scale: Globals.pixelScaleV.scalarMultiply(Utils.getRandomRangeFloat(0.2, 0.5)),
                                rotation: Utils.getRandomRangeFloat(-2, 2),
                                rotationRate: 0,
                                velocity: new Vector2(Utils.getRandomRangeFloat(-0.15, 0.15), Utils.getRandomRangeFloat(0, 0.1)),
                                acceleration: new Vector2(0, -0.01),
                                friction: 0,
                                removeAfterTime: 0,
                                removeEffect: 'none',
                                z: entity.z - 0.1
                            });
                        }
                        break;
                    case "growbot":
                        if (!isGrounded && Globals.showEffects && entity.ticker % 7 === 0) {
                            entity.attach(new Particle({
                                spriteSheet: 'effects/zoom',
                                position: new Vector2(0, 2),
                                alpha: 0.85,
                                scale: Globals.pixelScaleV,
                                rotation: 0,
                                rotationRate: 0,
                                velocity: new Vector2(0, 1),
                                acceleration: new Vector2(0, -0.01),
                                friction: 0,
                                removeAfterTime: 0,
                                removeEffect: 'none',
                                z: Globals.layers.active + 0.1,
                                dontAttach: true
                            }));
                        }
                        break;
                    case "kingplant":
                        if (Globals.showEffects && Utils.getRandom(3) === 0) {
                            new Particle({
                                imageName: 'sparkle',
                                originRelative: new Vector2(0.5, 0.5),
                                position: entity.position.add(head.position).add(new Vector2(Utils.getRandomFloat(16), 0).rotateDegree(Utils.getRandomFloat(360))),
                                alpha: 1,
                                scale: Globals.pixelScaleV.scalarMultiply(1),
                                rotation: Utils.getRandomRangeFloat(0, Math.PI * 2),
                                rotationRate: 0,
                                velocity: new Vector2(0, 0),
                                acceleration: new Vector2(0, 0),
                                friction: 1,
                                removeAfterTime: 60,
                                removeEffect: 'scale',
                                z: Globals.layers.active - 0.1
                            });
                        }
                        break;
                    case "goji":
                        if (isGrowing) {}
                        break;
                    case "rocketboy":
                        if (Globals.showEffects && isGrowing) {
                            feverDrawEntity.alpha = hasFlame ? 0.25 : feverDrawEntity.alpha * 0.5;
                            if (Utils.getRandom(1) === 0) {
                                new Particle({
                                    spriteSheet: 'effects/spark',
                                    position: entity.position.add(head.position).add(new Vector2(Utils.getRandomRangeFloat(-2, 2), Utils.getRandomRangeFloat(-2, 2))).add(new Vector2(0, 16).rotateRadian(head.rotation)),
                                    alpha: 0.85,
                                    scale: Globals.pixelScaleV.scalarMultiply(Utils.getRandomRangeFloat(0.2, 0.3)),
                                    rotation: Utils.getRandomRangeFloat(-2, 2),
                                    rotationRate: 0,
                                    velocity: new Vector2(Utils.getRandomRangeFloat(-0.15, 0.15), Utils.getRandomRangeFloat(0, 0.1)),
                                    acceleration: new Vector2(0, -0.01),
                                    friction: 0,
                                    removeAfterTime: 0,
                                    removeEffect: 'none',
                                    z: Globals.layers.active + 0.1
                                });
                            }
                        }
                        if (Globals.showEffects && isFever) {
                            if (Utils.getRandom(30) === 0) {
                                new Particle({
                                    spriteSheet: 'effects/firework',
                                    position: new Vector2(viewport.x + Utils.getRandom(viewport.width), (viewport.y - viewport.height) + Utils.getRandom(viewport.height * 2)),
                                    alpha: 1,
                                    scale: Globals.pixelScaleV.scalarMultiply(Utils.getRandomRangeFloat(1, 2)),
                                    rotation: Utils.getRandomRangeFloat(-2, 2),
                                    rotationRate: 0,
                                    velocity: new Vector2(Utils.getRandomRangeFloat(-0.15, 0.15), Utils.getRandomRangeFloat(0, 0.1)),
                                    acceleration: new Vector2(0, -0.01),
                                    friction: 0,
                                    removeAfterTime: 0,
                                    removeEffect: 'none',
                                    z: Globals.layers.active + 0.1
                                });
                            }
                        }
                        break;
                    default:
                        break;
                    }
                }


                // rotate the head to the movement direction
                if (playIdleAnim && wobbleSide === 0 && isGrounded && !isGrowing && !snappingBack && !isWin && !isDead) {
                    //subtle idle anim
                    headSprite.rotation = Math.sin(entity.ticker * 0.1) * 0.08;
                    headSprite.scale.x = Globals.pixelScale * plantSkinExtraScale + Math.sin(entity.ticker * 0.2) * 0.01;
                    headSprite.scale.y = Globals.pixelScale * plantSkinExtraScale - Math.sin(entity.ticker * 0.2) * 0.01;
                    drawEntity.scale.x = 1 + Math.cos(entity.ticker * 0.2) * 0.02;
                    drawEntity.scale.y = 1 - Math.cos(entity.ticker * 0.2) * 0.02;
                }
                // set 'last's
                if (endFlame) {
                    if (hasFlame) {
                        for (var i = 0; i <= 10; i++) {
                            if (Globals.showEffects) {
                                new Particle({
                                    spriteSheet: 'effects/spark',
                                    animationSpeed: Utils.getRandomRangeFloat(-0.1, 1),
                                    position: entity.position.add(head.position).add(new Vector2(Utils.getRandomRangeFloat(-16, 16), Utils.getRandomRangeFloat(-16, 16))),
                                    alpha: 1,
                                    scale: Globals.pixelScaleV.scalarMultiply(Utils.getRandomRangeFloat(0.75, 1)),
                                    rotation: Utils.getRandomRangeFloat(-2, 2),
                                    rotationRate: 0,
                                    velocity: new Vector2(Utils.getRandomRangeFloat(-0.15, 0.15), Utils.getRandomRangeFloat(0, 0.1)),
                                    acceleration: new Vector2(0, -0.01),
                                    friction: 0,
                                    removeAfterTime: 0,
                                    removeEffect: 'none',
                                    z: Globals.layers.active - 0.1
                                });
                            }
                        }
                        hasFlame = false;
                    }
                    endFlame = false;
                }
                wasGrowing = isGrowing;
                wasGrounded = isGrounded;
                wasFever = isFever;
            }

        };

        // draws the stem, pot, and leaves
        var drawBehaviour = {
            name: 'drawBehaviour',
            draw: function (data) {
                data.renderer.translate(viewport.x, viewport.y);
                //draw pot
                potSpriteContainer.draw(data);
                var lastPoint = stemPoints[0];
                stemShudder--;
                Utils.forEach(stemPoints, function (point, i, l, breakLoop) {
                    if (point.y > viewport.y + viewport.height - entity.position.y || i > stemPoints.length - 2) {
                        return;
                    }
                    var angle = (point.clone().subtract(lastPoint)).angle();
                    var thisPoint = point.clone(); //.add(new Vector2(0, Math.sin((entity.timer * 0.15) + (i * 0.75))).rotateRadian(angle));
                    if (stemShudder > 0) {
                        thisPoint.addTo(new Vector2(0, Math.sin((stemShudder / 60 * (i - stemPoints.length) * 2)) * i / stemPoints.length * stemShudder / 40).rotateRadian(angle));
                    }
                    stemSpriteContainer.position = thisPoint.clone();
                    stemSpriteContainer.draw(data);
                    if (leafPoints[i] > 0) {
                        var leafScalar = leafPoints[i];
                        leafSpriteContainer.position = thisPoint.clone();
                        leafSpriteContainer.rotation = angle + Math.PI * 0.5;
                        leafSpriteContainer.scale = new Vector2(((i % 2 === 0) ? -1 : 1), 1).scalarMultiplyWith(Globals.pixelScale * leafScalar);
                        leafSpriteContainer.draw(data);
                    }
                    lastPoint = point.clone();
                });
                data.renderer.translate(-viewport.x, -viewport.y);
                // DEBUG
                if (Globals.debug) {
                    for (var index = stemPoints.length - 6; index > 0; index -= 8) {
                        var point = stemPoints[Math.max(0, index - 8)];
                        if (point) {
                            var thisPoint = stemPoints[index].clone();
                            var thatPoint = point.clone();
                            data.renderer.drawLine([0, 1, 1, 0.5], thisPoint.x, thisPoint.y, thatPoint.x, thatPoint.y, 2);
                        }
                    }
                    var bb = entity.boundingBox;
                    data.renderer.fillRect([0, 0, 1, 0.5], bb.x, bb.y, bb.width, bb.height);
                }
            }
        };

        // redraws the drawEntity with a blend mode added
        var feverDrawEntity = new Entity({
            name: 'feverDrawEntity',
            alpha: 0,
            components: [{
                name: 'feverDrawBehaviour',
                draw: function (data) {
                    if (this.parent.alpha === 0) {
                        return;
                    }
                    // turn effect on
                    data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.ADD);
                    //draw
                    drawBehaviour.draw(data);
                    head.draw(data);
                    // turn effect off
                    data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.NORMAL);
                }
            }]
        });

        // subentity that allows for rendered transforms without impacting entity bounding boxes
        var drawEntity2 = new Entity({
            name: 'drawEntity2',
            components: [
                drawBehaviour,
                head,
                feverDrawEntity
            ]
        });
        var drawEntity = new Entity({
            name: 'drawEntity',
            components: [
                drawEntity2
            ]
        });

        // this is the score tracker that floats above the player, only visible when a score is present
        var scoreText = new GameCounter({
            value: 0,
            scale: Globals.pixelScaleV.scalarMultiply(0.3)
        }).attach({
            name: 'scoreBehaviour',
            start: function (data) {
                scoreText.alpha = 0;
                if (!Globals.showCounters) {
                    scoreText.alpha = 0;
                }
            },
            update: function (data) {
                //always keep above the head
                scoreText.position = head.position.clone().add(scoreTextAnchor);

                // if the score changed
                if (lastScore !== thisScore) {
                    //update it
                    scoreText.setValue(thisScore);
                    new Tween({
                        from: new Vector2(1.4, 1.4).scalarMultiply(Globals.pixelScale * 0.4),
                        to: new Vector2(1, 1).scalarMultiply(Globals.pixelScale * Math.min((0.3 + 0.3 * thisScore / 60), 0.8)),
                        in: 15,
                        ease: 'easeOutBack',
                        onUpdate: function (v, t) {
                            scoreText.scale = v;
                        }
                    });
                    scoreText.rotation = Utils.getRandomRangeFloat(-0.1, 0.1);

                    // if our score was 0
                    if (lastScore === 0) {
                        //fade it in
                        if (Globals.showCounters) {
                            new Tween({
                                from: scoreText.alpha,
                                to: 1,
                                in: 15,
                                ease: 'linear',
                                onUpdate: function (v, t) {
                                    if (thisScore !== 0) {
                                        scoreText.alpha = v;
                                    } else {
                                        this.stop();
                                    }
                                }
                            });
                        }
                    } else {
                        //if the score is 0 hide it
                        if (thisScore === 0) {
                            scoreText.alpha = 0;
                        }
                    }
                    lastScore = thisScore;
                }
            }
        });



        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'player',
            family: ['players', 'solids'],
            position: position,
            boundingBox: new Rectangle(-collisionSize * 0.5, -collisionSize, collisionSize, collisionSize),
            updateWhenPaused: 0,
            float: false,
            components: [
                clickable,
                movable,
                behaviour,
                drawEntity,
                scoreText
            ]
        }).extend({
            die: die,
            setEnabled: setEnabled,
            setPlantSkin: setPlantSkin,
            setPotSkin: setPotSkin,
            getIsSnappingBack: function () {
                return snappingBack;
            },
            getIsGrowing: function () {
                return isGrowing;
            },
            getMovable: function () {
                return movable;
            },
            getHeadPosition: function () {
                return entity.position.add(head.position);
            },
            getHeadBoundingBox: function () {
                return head.boundingBox.offset(entity.position.add(head.position));
            },
            getIsDead: function () {
                return isDead;
            },
            getDrawEntity: function () {
                return drawEntity;
            },
            getDrawEntity2: function () {
                return drawEntity2;
            },
            respawnAt: respawnAt
        });
        return entity;
    };
});