/**
 * Module description
 * @moduleName Cannon
 * @snippet Cannon.snippet
Cannon({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/cannon', [
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
    'entities/bullet',
    'components/spritecontainer',
    'components/culler',
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
    Bullet,
    SpriteContainer,
    Culler,
    Particle
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var position = settings.position;
        var shootDirection = settings.shootDirection || 'right';
        var shootTiming = settings.shootTiming || 150;
        var shootTimingOffset = settings.shootTimingOffset || 0;
        var thisTicks = shootTimingOffset;
        var spriteWheelContainer = new SpriteContainer({
            imageName: 'cannonWheel',
            originRelative: new Vector2(0.5, 0.48),
            scale: new Vector2((shootDirection === "left") ? 0 - Globals.pixelScale : Globals.pixelScale, Globals.pixelScale)
        });
        var spriteWheel2Container = new SpriteContainer({
            imageName: 'cannonWheel',
            originRelative: new Vector2(0.55, 0.5),
            scale: new Vector2((shootDirection === "left") ? 0 - Globals.pixelScale : Globals.pixelScale, Globals.pixelScale)
        });
        var spriteContainer = new SpriteContainer({
            imageName: 'cannonTurret',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2((shootDirection === "left") ? 0 - Globals.pixelScale : Globals.pixelScale, Globals.pixelScale)
        });
        var deleteOffscreen = true;
        var behavior = {
            name: 'behaviorComponent',
            update: function (data) {
                thisTicks -= data.speed;
                if (thisTicks < 0) {
                    thisTicks = shootTiming;
                    var startX = spriteContainer.position.x;

                    new Tween({
                        from: 0,
                        to: (shootDirection === "left") ? -3 : 3,
                        in: 15,
                        delay: 15,
                        ease: 'easeInCirc',
                        onUpdate: function (v, t) {
                            spriteContainer.position.x = startX - v / 2;
                            spriteWheel2Container.position.x = startX - v / 2;
                            spriteWheelContainer.position.x = startX - v / 2;
                            spriteContainer.rotation = -v / 20;
                        },
                    });

                    new Tween({
                        to: new Vector2((shootDirection === "left") ? 0 - 0.85 : 0.85, 1.15).scalarMultiply(Globals.pixelScale),
                        from: new Vector2((shootDirection === "left") ? 0 - Globals.pixelScale : Globals.pixelScale, Globals.pixelScale),
                        in: 30,
                        ease: 'easeInOutCirc',
                        onUpdate: function (v, t) {
                            spriteContainer.scale = v;
                        },
                        onComplete: function () {
                            spriteContainer.rotation = 0;
                            new Tween({
                                to: 0,
                                from: (shootDirection === "left") ? -8 : 8,
                                in: 20,
                                ease: 'easeOutBack',
                                onUpdate: function (v, t) {
                                    spriteContainer.position.x = startX - v;
                                    spriteWheel2Container.position.x = startX - v;
                                    spriteWheelContainer.position.x = startX - v;

                                    spriteContainer.rotation = -v / 20;

                                },
                            });
                            thisTicks = shootTiming;
                            Bento.objects.attach(new Bullet({
                                position: entity.position.clone().add(new Vector2((shootDirection === "left") ? -16 : 16, 0)),
                                shootDirection: shootDirection,
                                source: entity
                            }));
                            new Particle({
                                z: Globals.layers.effects,
                                spriteSheet: 'effects/hit',
                                position: entity.position.clone().add(new Vector2((shootDirection === "left") ? -12 : 12, -3)),
                                scale: Globals.pixelScaleV
                            });
                            new Tween({
                                from: new Vector2((shootDirection === "left") ? 0 - 1.85 : 1.85, 0.45).scalarMultiply(Globals.pixelScale),
                                to: new Vector2((shootDirection === "left") ? 0 - Globals.pixelScale : Globals.pixelScale, Globals.pixelScale),
                                in: 30,
                                ease: 'easeOutBack',
                                onUpdate: function (v, t) {
                                    spriteContainer.scale = v;
                                }
                            });
                        }
                    });
                }
                var stoodOnBy = entity.collidesWith({
                    name: 'player',
                    offset: new Vector2(0, -1),
                    firstOnly: true,
                });
                if (deleteOffscreen && (entity.position.y + entity.boundingBox.y) > (viewport.y + viewport.height)) {
                    if (!stoodOnBy) {
                        entity.removeSelf();
                    }
                }
            }
        };
        var entity = new Entity({
            z: Globals.layers.active2,
            name: 'cannon',
            family: ['solids'],
            position: position,
            boundingBox: new Rectangle(-16, -12, 32, 28),
            components: [
                spriteWheel2Container,
                spriteContainer,
                spriteWheelContainer,
                behavior, {
                    name: "debugdraw",
                    draw: function (data) {
                        if (Globals.debug) {
                            var bb = entity.boundingBox;
                            data.renderer.fillRect([1, 0, 1, 0.5], bb.x, bb.y, bb.width, bb.height);
                        }
                    }
                }
            ]
        });
        return entity;
    };
});