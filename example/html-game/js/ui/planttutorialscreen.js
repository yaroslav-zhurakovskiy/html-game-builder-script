/**
 * Module description
 * @moduleName PlantTutorialScreen
 * @snippet PlantTutorialScreen.snippet
PlantTutorialScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/planttutorialscreen', [
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
    'modules/skinmanager',
    'modules/savemanager'
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
    SkinManager,
    SaveManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);
        var tutorialSlot;

        // --- PARAMETERS ---
        var mainmenu = settings.mainmenu;
        var plantSelector = settings.mainmenu.plantSelector;

        // --- VARS ---
        var isHiding = false;
        var lastOpenStatus = '';

        // --- FUNCTIONS ---
        var hide = function () {
            plantSelector.setTutorial(false);
            if (isHiding) {
                return;
            }
            isHiding = true;
            SaveManager.save('doneGrowTutorial', true);
            mainmenu.playButton.setActive(true);
            plantSelector.setCanClose(true);
            new Tween({
                from: 1,
                to: 0,
                in: 15,
                delay: 0,
                ignoreGameSpeed: true,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    entity.alpha = v;
                },
                onComplete: function () {
                    entity.removeSelf();
                }
            });
        };

        // --- COMPONENTS ---
        var openSelectorHandSprite = new SpriteContainer({
            imageName: 'ui/poke_hand',
            originRelative: new Vector2(0.15, 0.05),
            frameCountX: 1,
            frameCountY: 1,
            animations: {
                default: {
                    speed: 0,
                    frames: [0]
                }
            },
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.scalarMultiply(1),
            alpha: 1,
            rotation: 0.2
        });
        var openSelectorHand = new Entity({
            name: 'openSelectorHand',
            position: new Vector2(viewport.width - 28, viewport.height * 0.55 + 12),
            rotation: 0.5,
            alpha: 0,
            components: [
                openSelectorHandSprite
            ]
        }).extend({
            show: function () {
                new Tween({
                    from: openSelectorHand.alpha,
                    to: 1,
                    in: 15,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        openSelectorHand.alpha = v;
                    }
                });
            },
            hide: function () {
                new Tween({
                    from: openSelectorHand.alpha,
                    to: 0,
                    in: 15,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        openSelectorHand.alpha = v;
                    }
                });
            }
        });
        var openSelectorAnimationLoop = function () {
            new Tween({
                from: openSelectorHandSprite.position.y,
                to: 16,
                in: 20,
                ease: 'easeOutExpo',
                onUpdate: function (v, t) {
                    openSelectorHandSprite.position.y = v;
                },
                onComplete: function () {
                    new Tween({
                        from: openSelectorHandSprite.position.y,
                        to: 0,
                        in: 20,
                        ease: 'easeInExpo',
                        onUpdate: function (v, t) {
                            openSelectorHandSprite.position.y = v;
                        },
                        onComplete: function () {
                            openSelectorAnimationLoop();
                        }
                    });
                }
            });
        };
        openSelectorAnimationLoop();

        // unlock
        var unlockHandSprite = new SpriteContainer({
            imageName: 'ui/poke_hand',
            originRelative: new Vector2(0.15, 0.05),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.scalarMultiply(1),
            rotation: 0.5
        });
        var unlockHand = new Entity({
            name: 'unlockHand',
            position: new Vector2(0, 16),
            rotation: 0.5,
            alpha: 0,
            components: [
                unlockHandSprite, {
                    name: "hideBehaviour",
                    update: function () {
                        if (plantSelector.getOpenStatus() === 'open') {
                            var unlockingChar = SkinManager.getAllUnlockingPlantSkins()[0];
                            if (unlockingChar && !SkinManager.getPlantSkinCanUnlock(unlockingChar) && !SkinManager.getPlantSkinCanProgress(unlockingChar)) {
                                unlockHand.hide();
                            } else {
                                unlockHand.show();
                            }
                        }
                    }
                }
            ]
        }).extend({
            show: function () {
                new Tween({
                    from: unlockHand.alpha,
                    to: 1,
                    in: 15,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        unlockHand.alpha = v;
                    }
                });
            },
            hide: function () {
                new Tween({
                    from: unlockHand.alpha,
                    to: 0,
                    in: 15,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        unlockHand.alpha = v;
                    }
                });
            }
        });
        var unlockHandAnimationLoop = function () {
            new Tween({
                from: unlockHandSprite.position.y,
                to: 16,
                in: 20,
                ease: 'easeOutExpo',
                onUpdate: function (v, t) {
                    unlockHandSprite.position.y = v;
                },
                onComplete: function () {
                    new Tween({
                        from: unlockHandSprite.position.y,
                        to: 0,
                        in: 20,
                        ease: 'easeInExpo',
                        onUpdate: function (v, t) {
                            unlockHandSprite.position.y = v;
                        },
                        onComplete: function () {
                            unlockHandAnimationLoop();
                        }
                    });
                }
            });
        };
        unlockHandAnimationLoop();

        var handAttached = false;
        var behaviour = {
            name: 'behaviourComponent',
            start: function () {
                EventSystem.on('onPlantUnlocked', hide);
            },
            update: function () {
                var thisStatus = plantSelector.getOpenStatus();
                if (thisStatus !== lastOpenStatus) {
                    if (thisStatus === 'closed') {
                        openSelectorHand.show();
                        unlockHand.hide();
                    } else {
                        openSelectorHand.hide();
                        unlockHand.show();
                    }
                }
                lastOpenStatus = thisStatus;

                if (!tutorialSlot) {
                    tutorialSlot = plantSelector.growingUI.getSlots()[0];
                }
                if (tutorialSlot) {
                    if (!handAttached) {
                        handAttached = true;
                        tutorialSlot.attach(unlockHand);
                    } else {
                        tutorialSlot.moveComponentTo(unlockHand, tutorialSlot.components.length);
                    }
                }
            },
            destroy: function () {
                EventSystem.off('onPlantUnlocked', hide);
                tutorialSlot.remove(unlockHand);
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.mainmenututorial,
            name: 'plantTutorial',
            position: new Vector2(0, 0),
            float: true,
            components: [
                behaviour,
                openSelectorHand
            ]
        });

        mainmenu.playButton.setActive(false);
        plantSelector.setCanClose(false);
        plantSelector.setTutorial(true);

        new Tween({
            from: 0,
            to: 1,
            in: 15,
            delay: 0,
            ignoreGameSpeed: true,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                entity.alpha = v;
            }
        });

        Bento.objects.attach(entity);
        return entity;
    };
});