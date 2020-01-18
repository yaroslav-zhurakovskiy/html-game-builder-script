/**
 * Module description
 * @moduleName TextUp
 * @snippet TextUp.snippet
TextUp({})
 */
bento.define('entities/textup', [
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
    Globals
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var fontSize = settings.fontSize || 6;
        var text = new Text({
            textStyle: 'cheer',
            position: new Vector2(-1, -1),
            text: settings.text || '',
            fontSize: fontSize,
            fontColor: '#fff',
            strokeStyle: '#000',
            lineWidth: 0.5,
            align: 'center',
            textBaseline: 'middle',
        });
        var entity = new Entity({
            z: Globals.layers.effects + (fontSize * 0.01),
            name: 'sizeUpEffect',
            family: ['effects'],
            position: settings.position || new Vector2(0, 0),
            updateWhenPaused: 0,
            float: false,
            components: [{
                    name: 'behaviourComponent',
                    start: function (data) {
                        new Tween({
                            from: 0,
                            to: 1,
                            in: fontSize,
                            ease: 'easeOutBack',
                            onUpdate: function (v, t) {
                                entity.scale = new Vector2(1, 1).scalarMultiply(v);
                            },
                            onComplete: function () {
                                new Tween({
                                    from: 1,
                                    to: 0,
                                    in: fontSize,
                                    delay: fontSize,
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
        return entity;
    };
});