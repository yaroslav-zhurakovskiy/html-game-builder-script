/**
 * Module description
 * @moduleName PauseScreen
 * @snippet PauseScreen.snippet
Dialog({})
 */
bento.define('ui/pausescreen', [
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
    'bento/components/modal',
    'globals',
    'components/spritecontainer',
    'bento/components/fill',
    'modules/localization',
    'components/backbutton'
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
    Modal,
    Globals,
    SpriteContainer,
    Fill,
    Localization,
    BackButton
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var animating = false;

        // --- FUNCTIONS ---
        var open = function () {
            if (!animating) {
                animating = true;
                new Tween({
                    from: 0,
                    to: 1,
                    in: 20,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        backgroundFill.alpha = v * 0.5;
                        content.alpha = v;
                    },
                    onComplete: function () {
                        animating = false;
                    }
                });
            }
        };
        var close = function () {
            if (!animating) {
                animating = true;
                new Tween({
                    from: 1,
                    to: 0,
                    in: 20,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        backgroundFill.alpha = v * 0.5;
                        content.alpha = v;
                    },
                    onComplete: function () {
                        entity.removeSelf();
                        animating = false;
                    }
                });
            }
        };

        // --- COMPONENTS ---
        var backgroundFill = new Entity({
            name: 'backgroundFill',
            alpha: 0,
            components: [
                new Fill({
                    dimension: new Rectangle(0, 0, viewport.width, viewport.height),
                    color: [0, 0, 0, 1]
                })
            ]
        });

        var pauseText = new Text({
            fontSettings: Utils.getTextStyle('pauseScreen'),
            position: new Vector2(viewport.width * 0.5, (viewport.height * 0.33) + 32),
            text: Localization.getText('paused'),
            maxWidth: 128,
            maxHeight: 32
        });

        var playIcon = new SpriteContainer({
            imageName: 'ui/icons/play',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            scale: new Vector2(1 / 0.4, 1 / 0.75).scalarMultiply(0.75)
        });
        var playButton = new ClickButton({
            name: 'collectButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            alpha: 1,
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.66),
            scale: Globals.pixelScaleV.multiply(new Vector2(0.8, 1.5)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                close();
            }
        }).attach(playIcon).attach(new BackButton({
            onPressed: function (data) {
                data.entity.doCallback();
            }
        }));

        var content = new Entity({
            name: 'content',
            components: [
                playButton,
                pauseText
            ]
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: settings.z || Globals.layers.modals,
            name: 'dialog',
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            components: [
                new Modal({}),
                backgroundFill,
                content
            ]
        }).extend({
            close: close
        });

        //attach
        Bento.objects.attach(entity);
        open();
        return entity;
    };
});