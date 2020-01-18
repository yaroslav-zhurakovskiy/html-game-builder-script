/**
 * Defines the player spawn point
 * @moduleName PlayerSpawn
 * @snippet PlayerSpawn.snippet
PlayerSpawn({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/playerspawn', [
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
    'bento/tween'
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
    Tween
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var entity = new Entity({
            name: 'playerSpawn',
            position: settings.position || new Vector2(0, 0)
        });
        return entity;
    };
});