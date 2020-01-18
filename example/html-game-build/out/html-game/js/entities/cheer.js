/**
 * Module description
 * @moduleName Cheer
 * @snippet Cheer.snippet
Cheer({})
 */
bento.define('entities/cheer', [
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
    Particle
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var perfect = settings.perfect || false;
        var text = new Text({
            fontSettings: Utils.getTextStyle('cheer'),
            position: new Vector2(-1, -1),
            text: settings.text || '',
            maxWidth: 100,
            maxHeight: 70
        });

        var entity = new Entity({
            z: Globals.layers.gui,
            name: 'cheer',
            family: ['effects'],
            position: new Vector2(Math.max(Math.min(viewport.width - 50, settings.position.x - viewport.x), viewport.x + 50), viewport.height * 0.33) || new Vector2(0, 0),
            updateWhenPaused: 0,
            rotation: Utils.getRandomRangeFloat(-0.2, 0.2),
            float: true,
            components: [{
                    name: 'behaviourComponent',
                    start: function (data) {
                        new Tween({
                            from: 0,
                            to: 1,
                            in: 20,
                            ease: 'easeOutBack',
                            onUpdate: function (v, t) {
                                entity.scale = new Vector2(1, 1).scalarMultiply(v);
                            },
                            onComplete: function () {
                                new Tween({
                                    from: 1,
                                    to: 0,
                                    in: 20,
                                    delay: 50,
                                    ease: 'linear',
                                    onStart: function () {},
                                    onUpdate: function (v, t) {
                                        entity.alpha = v;
                                    },
                                    onComplete: function () {
                                        entity.removeSelf();
                                    }
                                });
                            }
                        });
                    }
                },
                text
            ]
        });

        if (perfect) {
            new Particle({
                z: Globals.layers.gui,
                imageName: 'ui/fx/bloom-hard',
                originRelative: new Vector2(0.5, 0.5),
                alpha: 1,
                scale: Globals.pixelScaleV.scalarMultiply(1.2),
                position: entity.position, //.add(new Vector2(viewport.x,viewport.y)),
                velocity: new Vector2(0, 0),
                gravity: 0.05,
                removeAfterTime: 30,
                removeEffect: 'scale',
                float: true
            });
            entity.scale = new Vector2(1.5, 1.5);
        } else {
            new Particle({
                z: Globals.layers.gui,
                spriteSheet: 'effects/coin',
                alpha: 1,
                scale: Globals.pixelScaleV.scalarMultiply(2),
                position: entity.position, //.add(new Vector2(viewport.x,viewport.y)),
                velocity: new Vector2(0, 0),
                gravity: 0.05,
                float: true
            });

        }

        for (var i = 5 - 1; i >= 0; i--) {
            new Particle({
                imageName: 'sparkle',
                position: entity.position.add(new Vector2(viewport.x, viewport.y)),
                alpha: 1,
                scale: Globals.pixelScaleV,
                rotation: Utils.getRandomRangeFloat(-2, 2),
                rotationRate: 0,
                velocity: new Vector2(Utils.getRandomRangeFloat(-0.8, 0.8), Utils.getRandomRangeFloat(-4, 0.5)),
                acceleration: new Vector2(0, 0.15 / 2),
                friction: 1,
                removeAfterTime: 120,
                removeEffect: 'scale',
                z: Globals.layers.effects
            });
        }
        Bento.objects.attach(entity);
        return entity;
    };
});