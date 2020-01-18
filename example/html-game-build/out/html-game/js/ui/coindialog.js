/**
 * Module description
 * @moduleName CoinDialog
 * @snippet CoinDialog.snippet
CoinDialog({
    numberOfCoins: 1
})
 */
bento.define('ui/coindialog', [
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
    'ui/dialog',
    'components/spritecontainer',
    'entities/particle',
    'modules/localization',
    'components/gamecounter'
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
    Dialog,
    SpriteContainer,
    Particle,
    Localization,
    GameCounter
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var completed = false;
        var numberOfCoins = settings.numberOfCoins || 1;
        var onComplete = settings.onComplete || function () {};

        // --- FUNCTIONS ---
        var subtleMovement = function () {
            if (dialog.attached) {
                new Tween({
                    from: 0,
                    to: Math.PI * 2,
                    in: 300,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        bloomHard.scale.x += Math.sin(v * 2) * 0.00005;
                        bloomHard.scale.y += Math.sin(v * 2) * 0.00005;
                    },
                    onComplete: subtleMovement
                });
            }
        };
        var shakeAnimation = function () {
            new Tween({ in: 5,
                onComplete: function (v, t) {
                    for (var i = 0; i < 15; i++) {
                        mainRoot.attach(new Particle({
                            imageName: 'sparkle',
                            position: new Vector2(0, 0),
                            alpha: 1,
                            scale: Globals.pixelScaleV.scalarMultiply(3),
                            rotation: Utils.getRandomRangeFloat(-2, 2),
                            rotationRate: 0,
                            velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-3, 0)),
                            acceleration: new Vector2(0, 0.025),
                            friction: 1,
                            removeAfterTime: 100,
                            removeEffect: 'scale',
                            dontAttach: true,
                            z: Globals.layers.modals + 0.1
                        }));
                    }
                }
            });
            new Tween({
                from: 1,
                to: 0.75,
                in: 20,
                delay: 30,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    coinSprite.scale = Globals.pixelScaleUIV.clone().scalarMultiply(v);
                },
                onComplete: function () {

                }
            });
            new Tween({
                from: 0,
                to: numberOfCoins,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    coinSprite.scale = Globals.pixelScaleUIV.clone().scalarMultiply(0 + (v / numberOfCoins));
                    coinCounter.position.y = 0 + (v / numberOfCoins) * 50;
                    coinCounter.setValue('+' + Math.round(v));
                },
                onComplete: function () {
                    dialog.showButtons();

                }
            });
        };
        var burstAnimation = function () {
            new Tween({
                from: 1,
                to: 0,
                in: 5,
                delay: 0,
                ease: 'easeInQuad',
                onUpdate: function (v, t) {
                    coinSprite.scale = Globals.pixelScaleUIV.clone().scalarMultiply(v);
                },
                onComplete: function () {
                    coinSprite.removeSelf();
                }
            });
            new Tween({
                from: coinCounter.position.clone(),
                to: new Vector2(0, 4),
                in: 20,
                delay: 0,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    coinCounter.position = v;
                }
            });
            //particles
            new Tween({ in: 5,
                onComplete: function (v, t) {
                    for (var i = 0; i < 15; i++) {
                        mainRoot.attach(new Particle({
                            imageName: 'sparkle',
                            position: new Vector2(0, 0),
                            alpha: 1,
                            scale: Globals.pixelScaleV.scalarMultiply(3),
                            rotation: Utils.getRandomRangeFloat(-2, 2),
                            rotationRate: 0,
                            velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-3, 0)),
                            acceleration: new Vector2(0, 0.025),
                            friction: 1,
                            removeAfterTime: 100,
                            removeEffect: 'scale',
                            dontAttach: true,
                            z: Globals.layers.modals + 0.1
                        }));
                    }
                }
            });
            new Tween({ in: 5,
                onComplete: function (v, t) {
                    for (var i = 0; i < Math.min(numberOfCoins, 30); i++) {
                        mainRoot.attach(new Particle({
                            spriteSheet: 'coin',
                            position: new Vector2(0, 0),
                            alpha: 1,
                            scale: Globals.pixelScaleV,
                            rotation: Utils.getRandomRangeFloat(-1, 1),
                            rotationRate: Utils.getRandomRangeFloat(-0.1, 0.1),
                            velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-8, 0)),
                            acceleration: new Vector2(0, 0.065),
                            friction: 1,
                            removeAfterTime: 300,
                            dontAttach: true,
                            z: Globals.layers.modals + 0.1
                        }));
                    }
                }
            });
            // bloom halo burst outwards
            new Tween({
                from: 0,
                to: 1,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bloomHalo.scale.x = bloomHalo.scale.y = 0.25 * v;
                    bloomHalo.alpha = (1 - v) * 0.6;
                },
            });
            // bloom grow and shrink
            new Tween({
                from: 0,
                to: 0.185,
                in: 30,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    bloomHard.scale.x = v;
                    bloomHard.scale.y = v;
                },
                onComplete: function () {
                    new Tween({
                        from: 0.185,
                        to: 0,
                        in: 40,
                        ease: 'easeInCubic',
                        onUpdate: function (v, t) {
                            bloomHard.scale.x = v;
                            bloomHard.scale.y = v;
                        },
                        onComplete: function () {
                            dialog.close();
                            onComplete();
                        }
                    });
                }
            });
        };

        // --- COMPONENTS ---
        var coinSprite = new SpriteContainer({
            imageName: 'ui/big_coin',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            alpha: 1,
            scale: Globals.pixelScaleUIV,
            rotation: 0
        });
        var coinCounter = new GameCounter({
            imageName: "addcoincounter",
            position: coinSprite.position.add(new Vector2(0, 50)),
            value: 0,
            scale: Globals.pixelScaleUIV
        });

        var bloomHard = new SpriteContainer({
            imageName: 'ui/fx/bloom-hard',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0, 0)
        });
        var bloomHalo = new SpriteContainer({
            imageName: 'ui/fx/bloom-halo',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0, 0),
            alpha: 0.6
        });
        var mainRoot = new Entity({
            name: 'mainRoot',
            position: new Vector2(0, -12),
            components: [
                bloomHard,
                bloomHalo,
                coinSprite,
                coinCounter
            ]
        });

        // --- ENTITY ---
        var dialog = new Dialog({
            titleText: Localization.getText('youGotCoins'),
            type: 'yes',
            onYes: function (thisDialog) {
                if (!completed) {
                    completed = true;
                    burstAnimation();
                    dialog.hideButtons();
                }
            },
            components: [mainRoot],
            hidebuttons: true,
            attach: true
        });

        shakeAnimation();


        return dialog;
    };
});