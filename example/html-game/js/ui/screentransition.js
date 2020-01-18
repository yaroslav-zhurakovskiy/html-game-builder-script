/**
 * Module description
 * @moduleName ScreenTransition
 * @snippet ScreenTransition.snippet
ScreenTransition({
    destination: '',
    position: new Vector2(0, 0)
})
 */
bento.define('ui/screentransition', [
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

        if (Bento.objects.get('screenTransition')) {
            Utils.log("Warning: Attempting new transition with transition in progress, cancelling new transition!");
            return;
        }

        // --- PARAMETERS ---
        var destination = settings.destination;
        var position = settings.position || new Vector2(0, 0);
        var onScreenChange = settings.onScreenChange || function (complete) {
            complete();
        };

        // --- COMPONENTS ---
        var ring = new SpriteContainer({
            imageName: 'transition_ring',
            originRelative: new Vector2(0.5, 0.5),
            position: position.clone(),
            scale: new Vector2(2, 2)
        });
        var borderBehaviour = {
            name: "borderBehaviour",
            draw: function (data) {
                var r = data.renderer;
                var c = [0, 0, 0, 1];
                r.fillRect(c, 0, 0, viewport.width, ring.position.y - (256 * ring.scale.y));
                r.fillRect(c, 0, ring.position.y + (256 * ring.scale.y), viewport.width, viewport.height - (ring.position.y + (256 * ring.scale.y)));

                r.fillRect(c, 0, ring.position.y - (256 * ring.scale.y), ring.position.x - (256 * ring.scale.x), 512 * ring.scale.y);
                r.fillRect(c, ring.position.x + (256 * ring.scale.x), ring.position.y - (256 * ring.scale.y), viewport.width - (ring.position.x + (256 * ring.scale.x)), 512 * ring.scale.y);
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
                borderBehaviour,
                ring
            ]
        });

        // --- ANIMATION ---
        var tweenIn = new Tween.TweenBehavior({
            from: ring.scale.clone(),
            to: new Vector2(0, 0),
            in: 30,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                ring.scale = v;
            },
            onComplete: function () {
                tweenInEntity.removeSelf();
                onScreenChange(function () {
                    console.log('--- SCREEN CHANGED ---');
                    Bento.screens.show(destination);
                    Bento.objects.attach(tweenOutEntity);
                });
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
            delay: 20,
            from: new Vector2(0, 0),
            to: new Vector2(2, 2),
            in: 30,
            ease: 'easeInQuad',
            onUpdate: function (v, t) {
                ring.scale = v;
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