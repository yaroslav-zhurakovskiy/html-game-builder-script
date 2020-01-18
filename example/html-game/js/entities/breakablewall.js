/**
 * Module description
 * @moduleName BreakableWall
 * @snippet BreakableWall.snippet
BreakableWall({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/breakablewall', [
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
    'globals',
    'entities/particle',
    'modules/taptic',
    'components/culler'
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
    Globals,
    Particle,
    TapticEngine,
    Culler
) {
    'use strict';
    return function (settings) {
        var exploding = false;
        var camera = Bento.objects.get('camera');
        var position = settings.position;
        var spriteContainer = new SpriteContainer({
            imageName: 'breakableWall' + (Math.round(Math.random() * 3) + 1),
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleV
        });
        var entity = new Entity({
            z: Globals.layers.tiles - position.y * 0.0001,
            name: 'breakableWall',
            family: ['solids', 'breakables'],
            position: position,
            boundingBox: new Rectangle(-8, -8, 16, 16),
            float: false,
            components: [{
                    name: "cullBehaviour",
                    update: function () {
                        if (!camera) {
                            camera = Bento.objects.get('camera');
                        }
                        var viewportScaled = camera.getUnscaledViewport();
                        entity.visible = (entity.visible && entity.collidesWith({
                            name: 'player',
                            offset: new Vector2(0, -1),
                            firstOnly: true,
                        })) || (entity.position.y) < (viewportScaled.y + viewportScaled.height + 18);
                    }
                },
                spriteContainer
            ]
        }).extend({
            break: function () {
                if (exploding) {
                    return;
                }
                exploding = true;

                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                entity.boundingBox = new Rectangle(-10000, 0, 1, 0);

                Bento.audio.stopSound('sfx_destroyed');
                Bento.audio.playSound('sfx_destroyed');
                new Tween({
                    from: new Vector2(1, 1),
                    to: new Vector2(1.2, 1.2),
                    in: 4,
                    ease: 'easeOutBack',
                    onStart: function () {},
                    onUpdate: function (v, t) {
                        entity.scale = v;
                    },
                    onComplete: function () {
                        if (camera) {
                            camera.shake(20);
                            camera.hitFreeze(3);
                        }
                        TapticEngine.impact({
                            style: 'heavy'
                        });
                        var speed = new Vector2(Utils.getRandomRangeFloat(-1, 1), Utils.getRandomRangeFloat(-1, 1));
                        if (Globals.showEffects) {
                            new Particle({
                                z: Globals.layers.tiles - 1,
                                imageName: 'ui/fx/bloom-hard',
                                position: entity.position,
                                scale: Globals.pixelScaleV.scalarMultiply(0.2),
                                removeAfterTime: 5,
                                originRelative: new Vector2(0.5, 0.5),
                                removeEffect: 'fade'
                            });

                            new Particle({
                                spriteSheet: 'particles/dust',
                                position: entity.position.clone(),
                                alpha: 1,
                                scale: Globals.pixelScaleV,
                                rotation: Utils.getRandomRangeFloat(-2, 2),
                                rotationRate: 0,
                                velocity: speed.scalarMultiply(-1),
                                acceleration: speed.scalarMultiply(0.02),
                                removeAfterTime: 0,
                                removeEffect: 'none',
                                z: Globals.layers.active
                            });
                            for (var i = Utils.getRandomRange(1, 4); i < 6; i++) {
                                new Particle({
                                    spriteSheet: 'particles/debris' + i,
                                    originRelative: new Vector2(0.5, 0.5),
                                    position: entity.position.add(new Vector2(Utils.getRandomRangeFloat(-2, 2), Utils.getRandomRangeFloat(-2, 2))),
                                    alpha: 1,
                                    scale: Globals.pixelScaleV,
                                    rotation: 0,
                                    rotationRate: Utils.getRandomRangeFloat(-0.3, 0.3),
                                    velocity: new Vector2(Utils.getRandomRangeFloat(-2, 2), Utils.getRandomRangeFloat(-4, -1)),
                                    acceleration: new Vector2(0, Utils.getRandomRangeFloat(0.08, 0.13)),
                                    friction: 1,
                                    removeAfterTime: 100,
                                    z: Globals.layers.active
                                });
                            }
                        }
                        entity.removeSelf();
                    }
                });

            }
        });
        return entity;
    };
});