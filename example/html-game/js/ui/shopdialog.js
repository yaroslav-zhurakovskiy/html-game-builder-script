/**
 * Module description
 * @moduleName ShopDialog
 * @snippet ShopDialog.snippet
ShopDialog({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/shopdialog', [
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
    'modules/localization',
    'bento/components/fill',
    'ui/iapoverlay',
    'bento/components/modal',
    'ui/coindialog',
    'modules/savemanager',
    'components/sortedclickable',
    'ui/vipdialog',
    'components/gamecounter',
    'bento/components/nineslice',
    'entities/particle',
    'ui/coinsforadshop',
    'modules/vipmanager'
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
    Localization,
    Fill,
    IapOverlay,
    Modal,
    CoinDialog,
    SaveManager,
    SortedClickable,
    VipDialog,
    GameCounter,
    NineSlice,
    Particle,
    CoinsForAdShop,
    VipManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var isAnimating = false;
        var onComplete = settings.onComplete || function () {};
        var ShopItem = function (itemSettings) {
            var productId = itemSettings.productId;
            var productPrice = IapOverlay.getPrice(productId, '$4.99');
            var productTitle = itemSettings.productTitle;
            var productIsConsumable = itemSettings.isConsumable;
            var productOnBuy = itemSettings.onBuy;
            var valueBanner = itemSettings.valueBanner || false;

            // item components
            var backingImage = new SpriteContainer({
                imageName: 'ui/shop/coinpack-back',
                originRelative: new Vector2(0.5, 0.5),
                position: new Vector2(0, 0),
                scale: Globals.pixelScaleUIV
            });
            var itemImage = new SpriteContainer({
                imageName: itemSettings.imageName,
                originRelative: new Vector2(0.5, 0.5),
                position: new Vector2(0, valueBanner ? -18 : -24),
                scale: Globals.pixelScaleUIV.scalarMultiply(valueBanner ? 0.9 : 1)
            });

            var buyButton = new ClickButton({
                name: 'buyButton',
                sfx: 'sfx_clickbutton',
                imageName: 'ui/orangebutton',
                frameCountX: 1,
                frameCountY: 3,
                position: new Vector2(0, 20),
                scale: Globals.pixelScaleUIV.scalarMultiply(0.8),
                float: false,
                sort: true,
                onClick: function () {
                    if (isAnimating) {
                        return;
                    }
                    if (Utils.isDev()) {
                        productOnBuy();
                        return;
                    }
                    IapOverlay.purchase({
                        z: Globals.layers.iapoverlay,
                        id: productId,
                        subscription: false,
                        isConsumable: productIsConsumable,
                        fontSettings: Utils.getTextStyle('iapOverlay'),
                        onPurchaseComplete: function onPurchaseComplete(success, id, purchaseInfo) {
                            if (!success || id !== productId) {
                                return;
                            }
                            productOnBuy();
                        }
                    });
                }
            });

            var shopItem = new Entity({
                name: 'shopItem',
                position: itemSettings.position || new Vector2(0, 0),
                scale: new Vector2(0.9, 0.9),
                components: [
                    backingImage,
                    valueBanner ? new SpriteContainer({
                        imageName: 'ui/ribbon',
                        originRelative: new Vector2(0.5, 0.25),
                        position: new Vector2(0, -38),
                        scale: Globals.pixelScaleUIV.scalarMultiply(0.4)
                    }) : {
                        name: 'blank'
                    },
                    valueBanner ? new Text({
                        fontSettings: Utils.getTextStyle('bestValue'),
                        position: new Vector2(0, -38.5),
                        maxWidth: 48,
                        maxHeight: 12,
                        text: Localization.getText('bestValue')
                    }) : {
                        name: 'blank'
                    },
                    itemImage,
                    new Text({
                        fontSettings: Utils.getTextStyle('shopTitles'),
                        position: new Vector2(0, -3),
                        maxWidth: 48,
                        maxHeight: 12,
                        text: productTitle
                    }),
                    buyButton,
                    new Text({
                        fontSettings: Utils.getTextStyle('shopPrices'),
                        position: new Vector2(0, 20),
                        maxWidth: 48,
                        maxHeight: 12,
                        text: productPrice
                    })
                ]
            }).extend({
                disable: function () {
                    buyButton.setActive(false);
                    shopItem.alpha = 0.66;
                }
            });
            return shopItem;
        };

        var close = function () {
            if (isAnimating) {
                return;
            }
            isAnimating = true;
            new Tween({
                from: 0.5,
                to: 0,
                in: 15,
                ignoreGameSpeed: true,
                onUpdate: function (v, t) {
                    backgroundFill.alpha = v;
                }
            });
            new Tween({
                from: new Vector2(1, 1),
                to: new Vector2(0.001, 0.001),
                in: 15,
                ease: 'easeInBack',
                onUpdate: function (v, t) {
                    mainRoot.scale = v;
                },
                onComplete: function () {
                    isAnimating = false;
                    entity.removeSelf();
                    onComplete();
                }
            });
        };

        // --- COMPONENTS ---
        var backgroundFill = new Entity({
            name: 'backgroundFill',
            alpha: 0.5,
            components: [
                new Fill({
                    dimension: new Rectangle(-viewport.width * 0.5, -viewport.height * 0.5, viewport.width, viewport.height),
                    color: [0, 0, 0, 1]
                })
            ]
        });

        var backboard = new Entity({
            name: 'backboard',
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1, 1.5)),
            components: [
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(1, 1)
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(-1, 1)
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(-1, -1)
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(1, -1)
                })
            ]
        });

        var ribbon = new SpriteContainer({
            imageName: 'ui/ribbon',
            originRelative: new Vector2(0.5, 0.25),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.9)
        });
        var titleBanner = new Entity({
            name: 'titleBanner',
            family: [''],
            position: new Vector2(0, -136),
            components: [
                ribbon,
                new Text({
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    position: new Vector2(0, 2),
                    maxWidth: 108,
                    maxHeight: 24,
                    text: Localization.getText('shopTitle')
                })
            ]
        });



        var closeButton = new ClickButton({
            name: 'closeButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(64, -128),
            scale: new Vector2(Globals.pixelScaleUI * 0.5, Globals.pixelScaleUI * 1),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                close();
            },
        });
        closeButton.attach(new SpriteContainer({
            imageName: 'ui/icons/close',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(1 / closeButton.scale.x, 1 / closeButton.scale.y).multiply(Globals.pixelScaleUIV).scalarMultiply(0.8)
        }));

        // --- SHOP ITEMS ---
        var coinsForAdShop = new CoinsForAdShop({
            position: new Vector2(0, -80)
        });

        var coinPack1 = new ShopItem({
            imageName: 'ui/shop/coinpack-small',
            position: new Vector2(-36, -26),
            productTitle: 500,
            productId: (window.IAPPREFIX + '_coinpack1'),
            isConsumable: true,
            onBuy: function () {
                new CoinDialog({
                    numberOfCoins: 500
                });
                Utils.giveCoins(500);
            }
        });

        var coinPack2 = new ShopItem({
            imageName: 'ui/shop/coinpack-mid',
            position: new Vector2(36, -26),
            productTitle: 1100,
            productId: (window.IAPPREFIX + '_coinpack2'),
            isConsumable: true,
            onBuy: function () {
                new CoinDialog({
                    numberOfCoins: 1100
                });
                Utils.giveCoins(1100);
            }
        });
        var coinPack3 = new ShopItem({
            imageName: 'ui/shop/coinpack-big',
            position: new Vector2(-36, 44),
            productTitle: 2500,
            productId: (window.IAPPREFIX + '_coinpack3'),
            isConsumable: true,
            onBuy: function () {
                new CoinDialog({
                    numberOfCoins: 2500
                });
                Utils.giveCoins(2500);
            }
        });
        var coinPack4 = new ShopItem({
            imageName: 'ui/shop/coinpack-huge',
            position: new Vector2(36, 44),
            productTitle: '',
            productId: (window.IAPPREFIX + '_coinpack4'),
            valueBanner: true,
            isConsumable: true,
            onBuy: function () {
                new CoinDialog({
                    numberOfCoins: 7000
                });
                Utils.giveCoins(7000);
            }
        }).attach(new Entity({
            name: 'slice',
            position: new Vector2(0, -2),
            scale: new Vector2(0.2, 0.2),
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 220,
                    height: 60
                })
            ]
        })).attach(new GameCounter({
            name: "title",
            value: 7000,
            imageName: 'addcoincounter',
            position: new Vector2(0, 4),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.5),
            align: 'center',
            updateWhenPaused: 0
        })).attach({
            name: "sparkle",
            lastPart: 0,
            offset: Utils.getRandomFloat(1000),
            update: function () {
                var p = this.parent;
                var t = p.timer + this.offset;
                if (t - this.lastPart > 20) {
                    this.lastPart = t;
                    p.attach(new Particle({
                        imageName: 'sparkle',
                        originRelative: new Vector2(0.5, 0.5),
                        position: new Vector2(Utils.getRandomRangeFloat(-16, 16), -16 + Utils.getRandomRangeFloat(-16, 16)),
                        alpha: 1,
                        scale: Globals.pixelScaleV.scalarMultiply(1),
                        rotation: Utils.getRandomRangeFloat(0, Math.PI * 2),
                        rotationRate: 0,
                        velocity: new Vector2(0, 0),
                        acceleration: new Vector2(0, 0),
                        friction: 1,
                        removeAfterTime: 100,
                        removeEffect: 'scale',
                        dontAttach: true,
                        z: Globals.layers.modals + 0.1
                    }));
                }
            }
        });

        var vipPurchase = new Entity({
            name: 'vipPurchase',
            position: new Vector2(0, 88),
            components: [
                new SpriteContainer({
                    imageName: 'ui/shop/vip-back',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 16),
                    scale: Globals.pixelScaleUIV.scalarMultiply(0.95)
                }),
                new SpriteContainer({
                    imageName: 'ui/vip/vip_gang_kingplant',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-56, 16),
                    scale: Globals.pixelScaleUIV.scalarMultiply(0.75)
                }),
                new SpriteContainer({
                    imageName: 'ui/vip/vip_gang_kingplant',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(56, 16),
                    scale: Globals.pixelScaleUIV.scalarMultiply(0.75).multiply(new Vector2(-1, 1))
                }),
                new ClickButton({
                    name: 'vipButton',
                    sfx: 'sfx_clickbutton',
                    imageName: 'ui/bluebutton',
                    frameCountX: 1,
                    frameCountY: 3,
                    position: new Vector2(0, 23),
                    scale: Globals.pixelScaleUIV.multiply(new Vector2(1.7, 1.4)),
                    sort: true,
                    onClick: function () {
                        new VipDialog({
                            onComplete: function (nowVIP) {
                                if (nowVIP) {
                                    mainRoot.remove(vipPurchase);
                                    coinPack1.position.y += 16;
                                    coinPack2.position.y += 16;
                                    coinPack3.position.y += 32;
                                    coinPack4.position.y += 32;
                                }
                            }
                        });
                    }
                }),
                new Text({
                    fontSettings: Utils.getTextStyle('vipButtonGet'),
                    position: new Vector2(0, 25),
                    text: Localization.getText('getKingPlants'),
                    antiAlias: true,
                    maxWidth: 92,
                    maxHeight: 28
                })
            ]
        });

        var mainRoot = new Entity({
            name: 'mainRoot',
            boundingBox: new Rectangle(-78, -140, 156, 280),
            components: [
                new SortedClickable({}),
                backboard,
                coinsForAdShop,
                coinPack1,
                coinPack2,
                coinPack3,
                coinPack4,
                vipPurchase,
                titleBanner,
                closeButton
            ]
        });

        if (VipManager.isVip()) {
            mainRoot.remove(vipPurchase);
            coinPack1.position.y += 16;
            coinPack2.position.y += 16;
            coinPack3.position.y += 32;
            coinPack4.position.y += 32;
        }

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.modals,
            name: 'shopDialog',
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.5),
            boundingBox: new Rectangle(-viewport.width * 0.5, -viewport.height * 0.5, viewport.width, viewport.height),
            updateWhenPaused: 0,
            float: true,
            components: [
                new Modal({}),
                new SortedClickable({
                    onClick: function (data) {
                        close();
                    }
                }),
                backgroundFill,
                mainRoot
            ]
        });
        Bento.objects.attach(entity);

        // animate it all in
        isAnimating = true;
        new Tween({
            from: 0,
            to: 0.5,
            in: 15,
            ignoreGameSpeed: true,
            onUpdate: function (v, t) {
                backgroundFill.alpha = v;
            }
        });
        new Tween({
            from: new Vector2(0.001, 0.001),
            to: new Vector2(1, 1),
            in: 20,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                mainRoot.scale = v;
            },
            onComplete: function () {
                isAnimating = false;
            }
        });

        new Tween({
            from: 0,
            to: Globals.pixelScaleUI * 0.9,
            in: 45,
            delay: 10,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                ribbon.scale.x = v;
            }
        });
        ribbon.scale.x = 0;

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: new Vector2(1, 1),
            in: 15,
            delay: 10,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                titleBanner.scale = v;
            }
        });
        titleBanner.scale = new Vector2(0.001, 0.001);

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: coinsForAdShop.scale.clone(),
            in: 15,
            delay: 12,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                coinsForAdShop.scale = v;
            }
        });
        coinsForAdShop.scale = new Vector2(0.001, 0.001);

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: coinPack1.scale.clone(),
            in: 15,
            delay: 14,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                coinPack1.scale = v;
            }
        });
        coinPack1.scale = new Vector2(0.001, 0.001);

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: coinPack2.scale.clone(),
            in: 15,
            delay: 16,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                coinPack2.scale = v;
            }
        });
        coinPack2.scale = new Vector2(0.001, 0.001);

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: coinPack3.scale.clone(),
            in: 15,
            delay: 18,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                coinPack3.scale = v;
            }
        });
        coinPack3.scale = new Vector2(0.001, 0.001);

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: coinPack4.scale.clone(),
            in: 15,
            delay: 20,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                coinPack4.scale = v;
            }
        });
        coinPack4.scale = new Vector2(0.001, 0.001);

        new Tween({
            from: new Vector2(0.001, 0.001),
            to: vipPurchase.scale.clone(),
            in: 15,
            delay: 22,
            ease: 'easeOutBack',
            onUpdate: function (v, t) {
                vipPurchase.scale = v;
            }
        });
        vipPurchase.scale = new Vector2(0.001, 0.001);


        return entity;
    };
});