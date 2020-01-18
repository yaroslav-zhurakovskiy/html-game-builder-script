/**
 * Module description
 * @moduleName ScreenTransition2
 * @snippet ScreenTransition2.snippet
ScreenTransition({
    destination: '',
    position: new Vector2(0, 0)
})
 */
bento.define('ui/screentransition2', [
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
    'components/spritecontainer'
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
    SpriteContainer
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var destination = settings.destination;
        var position = new Vector2(0, 0);
        var slide = 0;

        // --- COMPONENTS ---
        var borderBehaviour = {
            name: "borderBehaviour",
            draw: function (data) {
                var r = data.renderer;
                var c = [0, 0, 0, 1];
                r.fillRect(c, 0, slide - viewport.height, viewport.width, viewport.height);
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.transitions,
            name: 'screenTransition',
            family: [''],
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            global: true,
            components: [
                borderBehaviour
            ]
        });

        // --- ANIMATION ---
        var tweenIn = new Tween.TweenBehavior({
            from: slide,
            to: viewport.height,
            in: 30,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                slide = v;
            },
            onComplete: function () {
                tweenInEntity.removeSelf();
                Bento.screens.show(destination);
                Bento.objects.attach(tweenOutEntity);
            }
        });
        var tweenInEntity = new Entity({
            name: 'tweenIn',
            global: true,
            components: [
                tweenIn
            ]
        });
        var tweenOut = new Tween.TweenBehavior({
            from: viewport.height,
            to: viewport.height * 2,
            delay: 15,
            in: 30,
            ease: 'easeInQuad',
            onUpdate: function (v, t) {
                slide = v;
            },
            onComplete: function () {
                tweenOutEntity.removeSelf();
                entity.removeSelf();
            }
        });
        var tweenOutEntity = new Entity({
            name: 'tweenOut',
            global: true,
            components: [
                tweenOut
            ]
        });

        Bento.objects.attach(tweenInEntity);


        Bento.objects.attach(entity);
        return entity;
    };
});