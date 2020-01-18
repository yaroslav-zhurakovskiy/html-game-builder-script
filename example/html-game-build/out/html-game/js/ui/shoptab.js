/**
 * Module description
 * @moduleName ShopTab
 * @snippet ShopTab.snippet
ShopTab({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/shoptab', [
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
    'ui/shopdialog',
    'ui/coinsforadshop'
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
    ShopDialog,
    CoinsForAdShop
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
                    to: viewport.width + 80,
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
                    to: viewport.width - 14,
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
            position: new Vector2(-32, 60),
            text: Localization.getText('shopTitle'),
            scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI),
            maxWidth: 36,
            maxHeight: 18
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

        CoinsForAdShop.checkDay();
        var badgeNumber = CoinsForAdShop.getBadgeValue();
        var updateBadge = function (value) {
            badgeNumber = value;
            badgeCount.setText(badgeNumber.toString());
            badge.visible = (badgeNumber !== 0);
        };
        var badgeCount = new Text({
            fontSettings: Utils.getTextStyle('badgeCount'),
            position: new Vector2(0, -2),
            maxWidth: 32,
            maxHeight: 12,
            text: badgeNumber,
            scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI)
        });
        var badge = new SpriteContainer({
            imageName: 'ui/shop/vid-badge',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-160, -60),
            scale: new Vector2(1, 1)
        }).attach(badgeCount).attach({
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
                            if (badgeNumber !== 0) {
                                p.scale = new Vector2(1, 1).scalarMultiply(1 + (v * 0.15));
                            } else {
                                p.scale = new Vector2(1, 1);
                            }
                        }
                    });
                    new Tween({
                        from: 1,
                        to: 0,
                        in: 60,
                        applyOnDelay: 0,
                        ease: 'easeOutQuad',
                        onUpdate: function (v, t) {
                            if (badgeNumber !== 0) {
                                p.rotation = Math.sin(p.timer * 0.5) * 0.1 * v;
                            } else {
                                p.rotation = 0;
                            }
                            badgeCount.rotation = p.rotation;
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
                new Tween({ in: 15,
                    onComplete: function () {
                        wiggle();
                    }
                });
                EventSystem.on('coinsForAdUpdated', updateBadge);
            },
            update: function () {
                badge.visible = (badgeNumber !== 0);
            },
            destroy: function () {
                EventSystem.off('coinsForAdUpdated', updateBadge);
            }
        });

        var tabEntity = new Entity({
            name: 'tabEntity',
            position: new Vector2(viewport.width - 14, (viewport.height * 0.66) - 48),
            scale: Globals.pixelScaleUIV,
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 320,
                    height: 220
                }),
                tabFG,
                new SpriteContainer({
                    imageName: 'ui/icons/shop',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-32, -32),
                    scale: new Vector2(1.25, 1.25)
                }),
                tabTitle,
                badge,
                new SortedClickable({
                    onPressed: function () {
                        tabFG.visible = true;
                    },
                    onClick: function () {
                        new ShopDialog({
                            onComplete: function () {}
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
            name: 'shopTab',
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