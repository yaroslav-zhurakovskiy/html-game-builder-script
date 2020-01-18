/**
 * Module description
 * @moduleName Sparkle
 * @snippet Sparkle.snippet
Sparkle({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/effects/sparkleparticle', [
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
        var move = Utils.isDefined(settings.move) ? settings.move : true;
        var particle = new Particle({
            imageName: 'sparkle',
            originRelative: new Vector2(0.5, 0.5),
            position: settings.position || new Vector2(0, 0),
            alpha: 1,
            scale: Globals.pixelScaleV.scalarMultiply(1.3),
            rotation: Utils.getRandomRangeFloat(-2, 2),
            rotationRate: Utils.getRandomRangeFloat(-0.2, 0.2),
            velocity: move ? new Vector2(Utils.getRandomRangeFloat(-1, 1), Utils.getRandomRangeFloat(-2.5, 0)) : new Vector2(0, 0),
            acceleration: move ? new Vector2(0, 0.05) : new Vector2(0, 0),
            friction: 1,
            removeAfterTime: 100,
            removeEffect: 'scale',
            z: settings.z || Globals.layers.effects
        });
        return particle;
    };
});