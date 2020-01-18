/**
 * Module description
 * @moduleName Coin
 * @snippet Coin.snippet
Coin({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/coin', [
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
    'entities/particle',
    'components/movable'
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
    Particle,
    Movable
) {
    'use strict';
    return function (settings) {
        // --- PARAMETERS ---
        var startPosition = settings.position;
        var moveX = settings.moveX || 0;
        var moveTime = settings.moveTime || 120;
        var moveOffsetTime = settings.moveOffsetTime || 0;
        var fall = false;

        // --- COMPONENTS ---
        var movable = new Movable({
            velocity: new Vector2(0, 0),
            enabled: false,
            canCollideWith: ['solids'],
            stopOnCollide: false,
            onCollision: function (collisionData) {
                movable.velocity.y *= -0.5;
                if (Math.abs(movable.velocity.y) < 0.05) {
                    movable.velocity.y = 0;
                }
            }
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'coin',
            family: ['coins'],
            position: startPosition.clone(),
            boundingBox: new Rectangle(-8, -8, 16, 16),
            components: [
                new SpriteContainer({
                    spriteSheet: 'coin',
                    scale: Globals.pixelScaleV
                }),
                new Culler({
                    height: 8
                }),
                movable, {
                    name: "effectBehaviour",
                    update: function () {
                        if (moveX > 0) {
                            entity.position.x = startPosition.x + Math.sin(((entity.timer + moveOffsetTime) / moveTime) * Math.PI) * moveX;
                        }
                        if (fall) {
                            movable.velocity.y += 0.1;
                        }
                    },
                    destroy: function (data) {
                        if (!Globals.showEffects) {
                            return;
                        }
                        new Particle({
                            z: Globals.layers.effects,
                            spriteSheet: 'effects/coin',
                            position: entity.position.clone(),
                            alpha: 1,
                            scale: Globals.pixelScaleV.scalarMultiply(1.5),
                            rotation: 0,
                            velocity: new Vector2(0, 0),
                            gravity: 0.05
                        });
                        new Tween({ in: 8,
                            onComplete: function () {
                                new Particle({
                                    z: Globals.layers.tiles - 1,
                                    imageName: 'ui/fx/bloom-halo',
                                    position: entity.position.clone(),
                                    scale: Globals.pixelScaleV.scalarMultiply(0.3),
                                    removeAfterTime: 10,
                                    originRelative: new Vector2(0.5, 0.5),
                                    removeEffect: 'scalefade'
                                });
                            }
                        });
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
            startFall: function () {
                fall = true;
                movable.setEnabled(true);
                moveX = 0;
            },
            setMoveX: function (newX) {
                moveX = newX;
            }
        });
        return entity;
    };
});