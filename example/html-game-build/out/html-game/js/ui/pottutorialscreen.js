/**
 * Module description
 * @moduleName PotTutorialScreen
 * @snippet PotTutorialScreen.snippet
PotTutorialScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/pottutorialscreen', [
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
    SaveManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);

        // --- PARAMETERS ---
        var mainmenu = settings.mainmenu;
        var potSelector = settings.mainmenu.potSelector;

        // --- VARS ---
        var isHiding = false;
        var lastOpenStatus = '';

        // --- FUNCTIONS ---
        var hide = function () {
            potSelector.setTutorial(false);
            if (isHiding) {
                return;
            }
            isHiding = true;
            SaveManager.save('doneUnlockTutorial', true);
            mainmenu.playButton.setActive(true);
            potSelector.setCanClose(true);
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
            position: new Vector2(28, viewport.height * 0.55 + 12),
            rotation: -0.5,
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

        var behaviour = {
            name: 'behaviourComponent',
            start: function () {
                EventSystem.on('onPotUnlocked', hide);
            },
            update: function () {
                var thisStatus = potSelector.getOpenStatus();
                if (thisStatus !== lastOpenStatus) {
                    if (thisStatus === 'closed') {
                        openSelectorHand.show();
                    } else {
                        openSelectorHand.hide();
                    }
                }
                lastOpenStatus = thisStatus;
            },
            destroy: function () {
                EventSystem.off('onPotUnlocked', hide);
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.mainmenututorial,
            name: 'dropTutorial',
            position: new Vector2(0, 0),
            float: true,
            components: [
                behaviour,
                openSelectorHand
            ]
        });

        mainmenu.playButton.setActive(false);
        potSelector.setCanClose(false);
        potSelector.setTutorial(true);
        potSelector.scrollToBuyPots();

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