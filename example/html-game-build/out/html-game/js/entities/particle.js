/**
 * Module description
 * @moduleName Particle
* @snippet Particle.spriteSheet
Particle({
    spriteSheet: '',
    position: new Vector2(0, 0),
    scale: new Vector2(1, 1),
    rotation: 0,
    rotationRate: 0,
    alpha: 1,
    velocity: new Vector2(0, 0),
    acceleration: new Vector2(0, 0),
    friction: 1,
    removeAfterTime: 0, // if this is zero, the particle will be deleted after teh first animation
    removeEffect: 'none'
})
 * @snippet Particle.imageName
Particle({
    imageName: '',
    originRelative: new Vector2(0.5, 0.5),
    frameCountX: 1,
    frameCountY: 1,
    animations: {
        default: {
            speed: 0,
            frames: [0]
        }
    },
    position: new Vector2(0, 0),
    scale: new Vector2(1, 1),
    rotation: 0,
    rotationRate: 0,
    alpha: 1,
    velocity: new Vector2(0, 0),
    acceleration: new Vector2(0, 0),
    friction: 1,
    removeAfterTime: 0, // if this is zero, the particle will be deleted after teh first animation
    removeEffect: 'none'
})
 */
bento.define('entities/particle', [
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
    'components/movable',
    'globals'
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
    Movable,
    Globals
) {
    'use strict';
    return function (settings) {
        // --- PARAMETERS ---
        var friction = settings.friction || 1;
        var velocity = settings.velocity || new Vector2(0, 0);
        var acceleration = settings.acceleration || new Vector2(0, 0);
        var rotationRate = settings.rotationRate || 0;
        var removeAfterTime = settings.removeAfterTime || 0;
        var removeEffect = settings.removeEffect || 'none';
        var dontAttach = settings.dontAttach || false;
        var blendMode = settings.blendMode;

        // --- VARS ---
        var baseScale = settings.scale || new Vector2(1, 1);
        var baseAlpha = settings.alpha || 1;
        var baseAnimationSpeed = settings.animationSpeed;

        // amend some default stuff
        settings.z = Utils.isDefined(settings.z) ? settings.z : Globals.layers.effects;

        // --- COMPONENTS ---
        // settings is passed to all sube components
        var particle = new SpriteContainer(settings);
        if (baseAnimationSpeed) {
            particle.sprite.setCurrentSpeed(baseAnimationSpeed);
        }
        var animationBehaviour = {
            name: "animationBehaviour",
            family: ['particles'],
            update: function (data) {
                // rotate
                particle.rotation += rotationRate * data.speed;

                // remove after time
                if (removeAfterTime !== 0) {
                    switch (removeEffect) {
                    case 'fade':
                        particle.alpha = baseAlpha * (1 - (particle.timer / removeAfterTime));
                        break;
                    case 'scale':
                        particle.scale = baseScale.scalarMultiply(1 - (particle.timer / removeAfterTime));
                        break;
                    case 'scalefade':
                        particle.scale = baseScale.scalarMultiply(1 + (particle.timer / removeAfterTime) * 0.5);
                        particle.alpha = baseAlpha * (1 - (particle.timer / removeAfterTime));
                        break;
                    case 'flicker':
                        if ((particle.timer / removeAfterTime) > 0.5) {
                            particle.alpha = particle.ticker % 2;
                        }
                        if ((particle.timer / removeAfterTime) > 0.85) {
                            particle.alpha = 1 - particle.ticker % 3;
                        }
                        break;
                    }
                    if (particle.timer > removeAfterTime) {
                        particle.removeSelf();
                    }
                }
            }
        };
        var physicsBehaviour = {
            name: "physicsBehaviour",
            update: function (data) {
                // accelerate
                velocity.addTo(acceleration.scalarMultiply(data.speed));

                // move
                particle.position.addTo(velocity.scalarMultiply(data.speed));

                // apply friction
                velocity.scalarMultiplyWith(friction);
            }
        };
        var blendModeIn = {
            name: "blendModeIn",
            draw: function (data) {
                data.renderer.setPixiBlendMode(blendMode);
            }
        };
        var blendModeOut = {
            name: "blendModeOut",
            draw: function (data) {
                data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.NORMAL);
            }
        };

        if (blendMode) {
            particle.attach(blendModeIn);
            particle.moveComponentTo(blendModeIn, -1);
            particle.attach(blendModeOut);
        }

        // attach stuff
        particle.attach(animationBehaviour);

        // no need if no physics
        if (velocity.x !== 0 || velocity.y !== 0 || acceleration.x !== 0 || acceleration.y !== 0) {
            particle.attach(physicsBehaviour);
        }

        particle.sprite.onCompleteCallback = function () {
            if (removeAfterTime === 0) {
                particle.removeSelf();
            }
        };
        if (!dontAttach) {
            Bento.objects.attach(particle);
        }
        return particle;
    };
});