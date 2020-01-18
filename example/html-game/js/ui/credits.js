/**
 * Module description
 * @moduleName Credits
 * @snippet Credits.snippet
Credits({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/credits', [
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
    'bento/components/modal',
    'entities/tiledbackground',
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
    Modal,
    TiledBackground,
    Globals
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        var isClosing = false;

        // --- FUNCTIONS ---
        var close = function () {
            if (isClosing) {
                return;
            }
            isClosing = true;
            new Tween({
                from: 1,
                to: 0,
                in: 10,
                ease: 'linear',
                onUpdate: function (v, t) {
                    entity.alpha = v;
                },
                onComplete: function () {
                    entity.removeSelf();
                }
            });
        };

        // --- COMPONENTS ---
        var bg = new TiledBackground({
            imageName: 'checker',
            scale: new Vector2(0.2, 0.2)
        }).attach({
            name: 'scrollerBehaviour',
            update: function () {
                bg.offset.x += 0.25;
                bg.offset.y -= 0.25;
            }
        });

        var shadowOffset = 4;
        var shadow = new SpriteContainer({
            imageName: 'luckykat-720b',
            alpha: 0.1,
            position: new Vector2(4, 54 + 4),
            originRelative: new Vector2(0.5, 1),
            scale: new Vector2(0.2, 0.2),
        }).extend({
            name: 'shadowBehaviour',
            update: function () {
                shadow.position.x = logo.position.x + shadowOffset;
                shadow.position.y = logo.position.y + shadowOffset;
            }
        });
        var logo = new SpriteContainer({
            imageName: 'luckykat-720',
            position: new Vector2(0, 54),
            originRelative: new Vector2(0.5, 1),
            scale: new Vector2(0.2, 0.2),
        });


        var luckyKat = new Entity({
            z: 1,
            name: 'luckyKatLogo',
            position: new Vector2(viewport.width / 2, viewport.height / 4),
            scale: new Vector2(0.75, 0.75),
            components: [
                shadow,
                logo
            ]
        });

        var text = new Text({
            z: 0,
            position: new Vector2(viewport.width / 2, luckyKat.position.y + 48),
            text: '\n-- PRODUCER --\nHerdjie Zhou\n\n-- PRODUCT MANAGER --\nHernan Zhou\n\n-- CODE --\nHenri de Rochefort\n\n-- ART --\nRik Nicol\n\n-- MUSIC --\nMaxo',
            font: 'font',
            fontSize: 12,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'top',
            shadow: true,
            shadowOffset: new Vector2(1, 1),
            shadowColor: '#00000016'
        });


        var closeButton = new ClickButton({
            name: 'okayButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(24, 24),
            scale: new Vector2(0.6, 1.2).divide(new Vector2(Math.max(1, viewport.width / 180), 1)).scalarMultiply(Globals.pixelScaleUI),
            sort: true,
            onClick: function () {
                close();
            }
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/tick',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            alpha: 1,
            scale: new Vector2(1 / 0.3, 1 / 0.6),
            rotation: 0
        }));

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.modals,
            name: 'credits',
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            alpha: 0,
            components: [
                new Modal({}),
                bg,
                luckyKat,
                text,
                closeButton
            ]
        });
        Bento.objects.attach(entity);
        new Tween({
            from: 0,
            to: 1,
            in: 10,
            ease: 'linear',
            onUpdate: function (v, t) {
                entity.alpha = v;
            }
        });
        return entity;
    };
});