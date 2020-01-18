/**
 * Module description
 * @moduleName TutorialScreen
 * @snippet TutorialScreen.snippet
TutorialScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/tutorialscreen', [
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
    'components/spritecontainer',
    'bento/components/fill',
    'components/sortedclickable',
    'ui/cutscene',
    'modules/localization'
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
    SpriteContainer,
    Fill,
    SortedClickable,
    Cutscene,
    Localization
) {
    'use strict';
    return function (settings) {

        // --- VARS ---
        var viewport = Bento.getViewport();
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);
        var isMenu = Utils.isDefined(settings.isMenu) ? settings.isMenu : false;
        var yOffsetFactor = isMenu ? 0.8 : 0.8;
        var gameGUI = settings.gameGUI || Bento.objects.get('gameGUI');

        // --- FUNCTIONS ---
        var hide = function () {
            if (!isMenu) {
                Globals.gameState = Globals.gameStates.game;
            }
            new Tween({
                from: 1,
                to: 0,
                in: 30,
                ease: 'linear',
                onUpdate: function (v, t) {
                    entity.alpha = v;
                },
                onComplete: function () {
                    entity.removeSelf();
                    gameGUI.show();
                    if (ClickButton.currentlyPressing === entity) {
                        ClickButton.currentlyPressing = null;
                    }
                }
            });
            tutorialCutscene.hide();
        };

        // --- COMPONENTS ---
        var downFor = 0;
        var done = false;
        var isDown = false;
        var hideClickable = new Clickable({
            pointerDown: function (data) {
                isDown = true;
            },
            pointerUp: function (data) {
                isDown = false;
            },
            pointerMove: function (data) {
                isDown = true;
            }
        });
        var behaviour = {
            name: 'clickbehaviour',
            start: function () {
                if (!isMenu) {
                    Bento.objects.attach(tutorialCutscene);
                }
            },
            update: function (data) {
                var doClose = false;
                if (isDown) {
                    downFor += data.speed;
                } else {
                    downFor = 0;
                }
                if (downFor > 20) {
                    doClose = true;
                }
                if (!done && doClose && !isMenu) {
                    done = true;
                    new Tween({ in: 15,
                        onComplete: function () {
                            hide();
                        }
                    });
                }
            }
        };

        var arrows = new SpriteContainer({
            imageName: 'ui/leftright_arrows',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(viewMid.x, viewport.height * yOffsetFactor),
            alpha: 1,
            scale: Globals.pixelScaleUIV.scalarMultiply(isMenu ? 0.75 : 0.8),
            rotation: 0
        });
        var circle = new SpriteContainer({
            imageName: 'ui/circle',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            alpha: 0,
            scale: Globals.pixelScaleUIV,
            rotation: 0
        });
        var hand = new Entity({
            name: 'hand',
            position: new Vector2(viewMid.x, viewport.height * yOffsetFactor),
            components: [
                circle,
                SpriteContainer({
                    imageName: 'ui/poke_hand',
                    originRelative: new Vector2(0.165, 0.10),
                    position: new Vector2(0, 0),
                    alpha: 1,
                    scale: Globals.pixelScaleUIV.scalarMultiply(isMenu ? 1.5 : 0.8),
                    rotation: 0
                })
            ]
        });
        var tutorialCutscene = new Cutscene({
            cutsceneStrings: [Localization.getText('bzzt'), Localization.getText('tutorial1')],
            fontSize: 12,
            hideAfter: -1,
            yPos: 48,
            doAttach: false
        });

        // --- ANIMATION ---
        var animateCircle = function () {
            new Tween({
                from: 0,
                to: 1,
                in: 30,
                ease: 'linear',
                onUpdate: function (v, t) {
                    circle.alpha = 1 - v;
                    circle.scale = Globals.pixelScaleUIV.scalarMultiply(0.5 + (isMenu ? 0.5 : 1) * v);
                },
                onComplete: animateCircle
            });
        };
        var handKeyframes = [{
            moveRightBy: 100,
            moveDownBy: -80,
            rotateBy: 0.5
        }, {
            moveRightBy: 0,
            duration: 0,
        }, {
            moveRightBy: 10,
            moveDownBy: -10,
            duration: 15,
        }, {
            moveRightBy: -110,
            moveDownBy: 90,
            rotateBy: -0.5,
            scaleXBy: -0.4,
            scaleYBy: -0.4,
            duration: 15
        }, {
            moveDownBy: 6,
            rotateBy: 0.1,
            duration: 3
        }, {
            moveDownBy: -3,
            rotateBy: -0.05,
            duration: 3,
            run: animateCircle
        }, {
            moveDownBy: -2,
            rotateBy: -0.05,
            duration: 6
        }, {
            moveDownBy: 4,
            rotateBy: 0,
            duration: 6
        }, {
            duration: 20
        }, {
            moveRightBy: -30,
            rotateBy: -0.15,
            duration: 40
        }, {
            moveRightBy: -30,
            rotateBy: -0.15,
            duration: 40
        }, {
            moveRightBy: 60,
            rotateBy: 0.3,
            duration: 50
        }, {
            moveRightBy: 60,
            rotateBy: 0.3,
            duration: 50
        }, {
            moveRightBy: -60,
            rotateBy: -0.3,
            duration: 50
        }, {
            moveRightBy: -60,
            rotateBy: -0.3,
            duration: 50,
            next: 11
        }];

        Utils.animateKeyframes(hand, handKeyframes, 0);

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.screens,
            name: 'TutorialScreen',
            position: new Vector2(0, 0),
            boundingBox: new Rectangle(0, 0, viewport.width, viewport.height),
            updateWhenPaused: 0,
            float: true,
            components: [
                isMenu ? {
                    name: 'blank'
                } : hideClickable,
                behaviour,
                arrows,
                hand
            ]
        }).extend({
            hide: hide
        });

        new Tween({
            from: 0,
            to: 1,
            in: 20,
            ease: 'linear',
            onUpdate: function (v, t) {
                entity.alpha = v;
            }
        });


        return entity;
    };
});