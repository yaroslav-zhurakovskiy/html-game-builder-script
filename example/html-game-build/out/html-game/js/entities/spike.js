/**
 * Module description
 * @moduleName Spike
 * @snippet Spike.snippet
Spike({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/spike', [
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
        var viewport = Bento.getViewport();
        var directionString = settings.directionString || 'up';
        var position = settings.position;
        var spriteContainer = new SpriteContainer({
            imageName: 'spike_' + directionString,
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
            originRelative: new Vector2(0.5, 0.5)
        });
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'spike',
            family: ['hazards', 'spikes'],
            position: position,
            boundingBox: new Rectangle(-5, -5, 10, 10),
            components: [
                spriteContainer,
                new Culler({
                    height: 8
                }), {
                    name: "debugdraw",
                    draw: function (data) {
                        if (Globals.debug) {
                            var bb = entity.boundingBox;
                            data.renderer.fillRect([1, 0, 1, 0.5], bb.x, bb.y, bb.width, bb.height);
                        }
                    }
                }
            ]
        }).extend({
            break: function (other) {
                entity.remove(spriteContainer);
                new Particle({
                    z: Globals.layers.effects,
                    sprite: spriteContainer,
                    position: entity.position,
                    rotation: 0,
                    rotationRate: (entity.position.x - other.getHeadPosition().x) * 0.005,
                    velocity: new Vector2((entity.position.x - other.getHeadPosition().x) * 0.2, -2),
                    acceleration: new Vector2(0, 0.1)
                });
                entity.removeSelf();
            }
        });
        return entity;
    };
});