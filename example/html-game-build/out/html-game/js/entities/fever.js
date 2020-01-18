/**
 * Module description
 * @moduleName Fever
 * @snippet Fever.snippet
Fever({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/fever', [
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
    'components/culler',
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
    Culler,
    SpriteContainer,
    Particle
) {
    'use strict';
    return function (settings) {
        // --- PARAMETERS ---
        var startPosition = settings.position;
        var moveX = settings.moveX || 0;
        var moveTime = settings.moveTime || 120;
        var moveOffsetTime = settings.moveOffsetTime || 0;

        // --- ENTITY ---
        var ringSpriteContainer = new SpriteContainer({
            spriteSheet: 'ring',
            scale: Globals.pixelScaleV
        });

        var ringFrontSpriteContainer = new Entity({
            z: Globals.layers.active + 0.1,
            position: startPosition.clone(),
            name: 'ringFrontSpriteContainer',
            components: [
                new SpriteContainer({
                    spriteSheet: 'ring_front',
                    scale: Globals.pixelScaleV
                })
            ]
        });

        var entity = new Entity({
            z: Globals.layers.active - 0.1,
            name: 'fever',
            family: ['fevers'],
            position: startPosition.clone(),
            scale: new Vector2(1, 1),
            boundingBox: new Rectangle(-4, -6, 8, 2),
            components: [
                ringSpriteContainer,
                new Culler({
                    height: 8
                }), {
                    name: "effectBehaviour",
                    attached: function () {
                        Bento.objects.attach(ringFrontSpriteContainer);
                    },
                    update: function () {
                        if (moveX > 0) {
                            entity.position.x = startPosition.x + Math.sin(((entity.timer + moveOffsetTime) / moveTime) * Math.PI) * moveX;
                        }
                    },
                    destroy: function (data) {
                        new Particle({
                            z: Globals.layers.effects,
                            spriteSheet: 'effects/coin',
                            position: entity.position.clone(),
                            alpha: 1,
                            scale: Globals.pixelScaleV.scalarMultiply(2),
                            rotation: 0,
                            velocity: new Vector2(0, 0),
                            gravity: 0.05
                        });
                        var ringEffect = new Entity({
                            z: Globals.layers.active - 0.1,
                            name: 'ringEffect',
                            family: ['particles'],
                            position: entity.position.clone(),
                            components: [{
                                    name: "setBlendBehaviour",
                                    draw: function (data) {
                                        data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.ADD);
                                    }
                                },
                                new SpriteContainer({
                                    spriteSheet: 'ring',
                                    scale: Globals.pixelScaleV
                                }), {
                                    name: "setBlendBehaviour",
                                    draw: function (data) {
                                        data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.NORMAL);
                                    }
                                }
                            ]
                        });
                        Bento.objects.attach(ringEffect);
                        var ringFrontEffect = new Entity({
                            z: Globals.layers.active + 0.1,
                            name: 'ringEffect',
                            family: ['particles'],
                            position: entity.position.clone(),
                            components: [{
                                    name: "setBlendBehaviour",
                                    draw: function (data) {
                                        data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.ADD);
                                    }
                                },
                                new SpriteContainer({
                                    spriteSheet: 'ring_front',
                                    scale: Globals.pixelScaleV
                                }), {
                                    name: "setBlendBehaviour",
                                    draw: function (data) {
                                        data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.NORMAL);
                                    }
                                }
                            ]
                        });
                        Bento.objects.attach(ringFrontEffect);
                        new Tween({
                            from: ringEffect.scale.clone(),
                            to: ringEffect.scale.scalarMultiply(3),
                            in: 60,
                            ease: 'easeOutQuad',
                            onUpdate: function (v, t) {
                                ringEffect.scale = v;
                                ringFrontEffect.scale = v;
                            }
                        });
                        new Tween({
                            from: 1,
                            to: 0,
                            in: 30,
                            delay: 30,
                            ease: 'linear',
                            onUpdate: function (v, t) {
                                ringEffect.alpha = v;
                                ringFrontEffect.alpha = v;
                            },
                            onComplete: function () {
                                ringEffect.removeSelf();
                                ringFrontEffect.removeSelf();
                            }
                        });
                        ringFrontSpriteContainer.removeSelf();
                    },
                    draw: function (data) {
                        if (Globals.debug) {
                            var bb = entity.boundingBox;
                            data.renderer.fillRect([1, 0.75, 0, 0.5], bb.x, bb.y, bb.width, bb.height);
                        }
                    }
                }
            ]
        }).extend({
            setMoveX: function (newX) {
                moveX = newX;
            },

        });
        return entity;
    };
});