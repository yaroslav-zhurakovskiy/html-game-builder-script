/**
 * Module description
 * @moduleName VipTab
 * @snippet VipTab.snippet
VipTab({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/viptab', [
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
    'bento/components/nineslice',
    'components/spritecontainer',
    'modules/localization',
    'components/sortedclickable',
    'ui/vipdialog'
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
    NineSlice,
    SpriteContainer,
    Localization,
    SortedClickable,
    VipDialog
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var tabVisible = true;
        var onComplete = settings.onComplete || function () {};

        var hideTab = function () {
            if (tabVisible) {
                tabVisible = false;
                new Tween({
                    from: tabEntity.position.x,
                    to: -80,
                    in: 15,
                    ease: 'easeInBack',
                    ignoreGameSpeed: true,
                    onUpdate: function (v, t) {
                        tabEntity.position.x = v;
                    }
                });
            }
        };

        var showTab = function () {
            if (!tabVisible) {
                tabVisible = true;
                new Tween({
                    from: tabEntity.position.x,
                    to: 14,
                    in: 15,
                    ease: 'easeOutBack',
                    ignoreGameSpeed: true,
                    onUpdate: function (v, t) {
                        tabEntity.position.x = v;
                    }
                });
            }
        };
        var tabTitle = new Text({
            fontSettings: Utils.getTextStyle('tabTitle'),
            position: new Vector2(32, 60),
            text: 'VIP',
            scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI),
            maxWidth: 36,
            maxHeight: 18
        });
        var crownGlow = new SpriteContainer({
            imageName: 'ui/icons/crownglow',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(32, -32),
            scale: new Vector2(1.25, 1.25)
        });
        var tabFG = new Entity({
            name: 'tabFG',
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs_pressed',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 320,
                    height: 220
                })
            ]
        });
        tabFG.visible = false;
        var tabEntity = new Entity({
            name: 'tabEntity',
            position: new Vector2(14, (viewport.height * 0.66) - 48),
            scale: Globals.pixelScaleUIV,
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 320,
                    height: 220
                }),
                tabFG,
                crownGlow,
                new SpriteContainer({
                    imageName: 'ui/icons/crown',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(32, -32),
                    scale: new Vector2(1.25, 1.25)
                }).attach({
                    name: 'motionBehaviour',
                    start: function () {
                        var p = this.parent;
                        var wiggle = function () {
                            new Tween({
                                from: 1,
                                to: 0,
                                in: 30,
                                applyOnDelay: 0,
                                ease: 'easeOutQuad',
                                onUpdate: function (v, t) {
                                    p.scale = new Vector2(1, 1).scalarMultiply(1.25 + (v * 0.125));

                                    crownGlow.scale = p.scale.clone();
                                    tabTitle.scale = new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI).scalarMultiply(1 + (v * 0.125));
                                }
                            });
                            new Tween({
                                from: 1,
                                to: 0,
                                in: 60,
                                applyOnDelay: 0,
                                ease: 'easeOutQuad',
                                onUpdate: function (v, t) {
                                    p.rotation = Math.sin(p.timer * 0.5) * 0.25 * v;
                                    crownGlow.alpha = v;
                                    crownGlow.rotation = p.rotation;
                                },
                                onComplete: function () {
                                    new Tween({ in: 15,
                                        onComplete: function () {
                                            wiggle();
                                        }
                                    });
                                }
                            });
                        };
                        wiggle();
                    }
                }),
                tabTitle,
                new SortedClickable({
                    onPressed: function () {
                        tabFG.visible = true;
                    },
                    onClick: function () {
                        new VipDialog({
                            onComplete: onComplete
                        });
                        Bento.audio.playSound('sfx_clickbutton');
                    },
                    onRelease: function () {
                        tabFG.visible = false;
                    }
                })
            ]
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.mainMenu,
            name: 'plantSelector',
            float: true,
            components: [
                tabEntity
            ]
        }).extend({
            hideTab: hideTab,
            showTab: showTab
        });

        return entity;
    };
});