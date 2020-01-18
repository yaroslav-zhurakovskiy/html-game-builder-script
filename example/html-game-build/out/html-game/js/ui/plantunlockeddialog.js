/**
 * Module description
 * @moduleName PlantUnlockedDialog
 * @snippet PlantUnlockedDialog.snippet
PlantUnlockedDialog({
    plantSkin: '',
    onComplete: function () {}
})
 */
bento.define('ui/plantunlockeddialog', [
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
    'ui/confetti'
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
    Confetti
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var plantSkin = settings.plantSkin || 'default';
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
            Bento.audio.playSound('sfx_unlock_up');
            new Tween({ in: 20,
                onComplete: function () {
                    Bento.audio.playSound('sfx_unlock_shake');
                }
            });
            new Tween({
                from: 0,
                to: 1,
                in: 15,
                delay: 105,
                ease: 'easeInBack',
                onUpdate: function (v, t) {
                    boxSprite.scale = new Vector2(0.25, 0.25).scalarMultiply(1 + (v * 0.5));
                }
            });
            new Tween({
                from: 0,
                to: 1,
                in: 120,
                ease: 'easeInQuad',
                onUpdate: function (v, t) {
                    boxSprite.rotation = Math.sin(v * Math.PI * 25) * 0.2;
                },
                onComplete: function () {
                    boxSprite.removeSelf();
                    burstAnimation();
                }
            });
        };
        var burstAnimation = function () {
            Bento.audio.playSound('sfx_unlock_burst');
            // show skin
            mainRoot.attach(plantSprite);
            mainRoot.attach(plantName);
            new Tween({
                from: 0,
                to: 1,
                in: 20,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    plantSprite.alpha = Math.min(v, 1);
                    plantSprite.scale = new Vector2(v, v);
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
                            rotation: Utils.getRandomRangeFloat(0, Math.PI * 2),
                            rotationRate: 0,
                            velocity: new Vector2(Utils.getRandomRangeFloat(-3, 3), Utils.getRandomRangeFloat(-3, 3)),
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
            dialog.attach(new Confetti({
                particleScale: 0.1
            }));

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
                        to: 0.15,
                        in: 60,
                        ease: 'easeInOutCubic',
                        onUpdate: function (v, t) {
                            bloomHard.scale.x = v;
                            bloomHard.scale.y = v;
                        },
                        onComplete: function () {
                            subtleMovement();
                            dialog.showButtons();
                        }
                    });
                }
            });
        };

        // --- COMPONENTS ---
        var boxSprite = new SpriteContainer({
            imageName: 'ui/sprout',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            alpha: 1,
            scale: new Vector2(0.25, 0.25),
            rotation: 0
        });
        var plantSprite = new Entity({
            name: 'plantSprite',
            position: new Vector2(0, 0),
            components: [
                new SpriteContainer({
                    spriteSheet: 'headskins/' + plantSkin,
                    position: new Vector2(0, 20),
                    alpha: 1,
                    scale: new Vector2(0.66, 0.66),
                    rotation: 0
                })
            ]
        });
        var plantName = new Text({
            fontSettings: Utils.getTextStyle('potDialogName'),
            position: new Vector2(0, 48),
            text: "'" + Localization.getText(plantSkin + '-plant') + "'",
            maxWidth: undefined,
            maxHeight: undefined
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
                boxSprite
            ]
        });

        // --- ENTITY ---
        var dialog = new Dialog({
            titleText: Localization.getText('newPlant'),
            type: 'yes',
            onYes: function (thisDialog) {
                thisDialog.close();
                onComplete();
            },
            components: [mainRoot],
            hidebuttons: true,
            attach: true
        });

        shakeAnimation();


        return dialog;
    };
});