/**
 * Screen description
 */
bento.define('screens/splash', [
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
    'bento/screen',
    'bento/tween',
    'entities/tiledbackground',
    'bento/components/fill',
    'components/spritecontainer',
    'ui/screentransition',
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
    Screen,
    Tween,
    TiledBackground,
    Fill,
    SpriteContainer,
    ScreenTransition,
    BackButton
) {
    'use strict';
    var onShow = function (settings) {

        var viewport = Bento.getViewport();
        // --- FUNCTIONS ---
        var end = function () {
            new ScreenTransition({
                destination: 'screens/main',
                position: new Vector2(viewport.width * 0.5, viewport.height * 0.5)
            });
        };

        // --- COMPONENTS ---
        var checkerScroller = {
            name: "checkerScroller",
            update: function () {
                checkerBG.offset.x += 1;
                checkerBG.offset.y -= 0.5;
            }
        };
        var checkerBG = new TiledBackground({
            z: -1,
            imageName: 'checker',
            scale: new Vector2(0.2, 0.2)
        }).attach(checkerScroller);

        var fillBG = new Entity({
            z: 0,
            name: 'fill',
            components: [
                new Fill({})
            ]
        });

        var shadowOffset = 0;
        var shadow = new SpriteContainer({
            imageName: 'luckykat-720b',
            alpha: 0.1,
            position: new Vector2(4, 54 + 4),
            originRelative: new Vector2(0.5, 1),
            scale: new Vector2(0.15, 0.15),
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
            scale: new Vector2(0.15, 0.15),
        });


        var luckyKat = new Entity({
            z: 1,
            name: 'luckyKatLogo',
            position: new Vector2(viewport.width / 2, viewport.height / 2),
            scale: new Vector2(0.75, 0.75),
            components: [
                shadow,
                logo
            ]
        });


        // Start Screen
        Bento.objects.attach(fillBG);
        Bento.objects.attach(checkerBG);
        Bento.objects.attach(luckyKat);
        new Tween({
            from: luckyKat.scale.x,
            to: 1.25,
            in: 20,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                shadowOffset = 4 * v;
                luckyKat.scale.x = v;
                luckyKat.scale.y = v;

            },
            onComplete: function () {
                Bento.audio.playSound('sfx_meow');
                new Tween({
                    from: luckyKat.scale.x,
                    to: 1,
                    in: 20,
                    ease: 'easeOutBack',
                    onUpdate: function (v, t) {
                        shadowOffset = 4 * v;
                        luckyKat.scale.x = v;
                        luckyKat.scale.y = v;
                    }
                });
            }
        });
        new Tween({
            from: 1,
            to: 0,
            in: 30,
            ease: 'linear',
            onUpdate: function (v, t) {
                fillBG.alpha = v;
            }
        });
        new Tween({ in: 75,
            onComplete: function (v, t) {
                end();
            }
        });
    };

    return new Screen({
        onShow: onShow
    });
});