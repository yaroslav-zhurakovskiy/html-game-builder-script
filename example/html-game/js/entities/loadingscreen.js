/**
 * Module description
 * @moduleName LoadingScreen
 * @snippet LoadingScreen.snippet
LoadingScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/loadingscreen', [
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
    'bento/components/fill'
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
    Fill
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var entity = new Entity({
            z: 0,
            name: '',
            family: [''],
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            components: []
        });
        return entity;
    };
});