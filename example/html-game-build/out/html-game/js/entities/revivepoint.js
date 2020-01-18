/**
 * Module description
 * @moduleName RevivePoint
 * @snippet RevivePoint.snippet
RevivePoint({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/revivepoint', [
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
    Globals
) {
    'use strict';
    return function (settings) {
        var position = settings.position || new Vector2(0, 0);
        var spriteContainer = new SpriteContainer({
            imageName: 'point',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleV
        });
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'revivePoint',
            family: ['revivePoints'],
            position: position
        });
        return entity;
    };
});