/**
 * Module description
 * @moduleName VipDialog
 * @snippet VipDialog.snippet
VipDialog({
    onComplete: function () {
    
    }
});
 */
bento.define('ui/vipdialog', [
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
    'ui/dialog',
    'globals',
    'modules/localization',
    'ui/iapoverlay',
    'components/spritecontainer',
    'modules/cloudsave',
    'ui/screentransition',
    'modules/vipmanager',
    'modules/timemanager'
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
    Dialog,
    Globals,
    Localization,
    IapOverlay,
    SpriteContainer,
    CloudSave,
    ScreenTransition,
    VipManager,
    TimeManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var postComplete = settings.onComplete || function () {};
        var isPopup = settings.isPopup || false;
        var onComplete = function () {
            postComplete(VipManager.isVip());
        };

        var subscriptionPrice = IapOverlay.getPrice((window.IAPPREFIX + '_vip'), '$3.99');


        // --- COMPONENTS ---
        var ribbon = new SpriteContainer({
            imageName: 'ui/ribbon',
            originRelative: new Vector2(0.5, 0.25),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV
        });
        var titleBanner = new Entity({
            name: 'titleBanner',
            family: [''],
            position: new Vector2(0, -118),
            components: [
                ribbon,
                new Text({
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    position: new Vector2(0, 2),
                    maxWidth: 108,
                    maxHeight: 24,
                    text: Localization.getText('subscriptionTitle')
                })
            ]
        });
        var kingGraphic = new SpriteContainer({
            imageName: 'ui/vip/vip_gang_kingplant',
            originRelative: new Vector2(0.6, 0.6),
            position: new Vector2(-50, -60),
            rotation: 0,
            alpha: 1,
            scale: Globals.pixelScaleUIV
        }).attach({
            name: 'wobbleBehaviour',
            offset: 0,
            update: function () {
                var p = this.parent;
                p.rotation = Math.sin((p.timer + this.offset) * 0.03) * 0.1;
            }
        });
        var calciGraphic = new SpriteContainer({
            imageName: 'ui/vip/vip_gang_calci',
            originRelative: new Vector2(0.5, 0.6),
            position: new Vector2(64, -70),
            rotation: -0,
            alpha: 1,
            scale: Globals.pixelScaleUIV
        }).attach({
            name: 'wobbleBehaviour',
            offset: 60,
            update: function () {
                var p = this.parent;
                p.rotation = Math.sin((p.timer + this.offset) * 0.033) * 0.11;
            }
        });
        var growbotGraphic = new SpriteContainer({
            imageName: 'ui/vip/vip_gang_growbot',
            originRelative: new Vector2(0.5, 0.6),
            position: new Vector2(10, -74),
            rotation: 0,
            alpha: 1,
            scale: Globals.pixelScaleUIV
        }).attach({
            name: 'wobbleBehaviour',
            offset: 90,
            update: function () {
                var p = this.parent;
                p.rotation = Math.sin((p.timer + this.offset) * 0.027) * 0.12;
            }
        });
        var gizmoGraphic = new SpriteContainer({
            imageName: 'ui/vip/vip_gang_gizmo',
            originRelative: new Vector2(0.5, 0.6),
            position: new Vector2(-30, -52),
            rotation: 0,
            alpha: 1,
            scale: Globals.pixelScaleUIV
        }).attach({
            name: 'wobbleBehaviour',
            offset: -70,
            update: function () {
                var p = this.parent;
                p.rotation = Math.sin((p.timer + this.offset) * 0.025) * 0.17;
            }
        });
        var gojiGraphic = new SpriteContainer({
            imageName: 'ui/vip/vip_gang_goji',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(28, -48),
            rotation: 0,
            alpha: 1,
            scale: Globals.pixelScaleUIV
        }).attach({
            name: 'wobbleBehaviour',
            offset: 180,
            update: function () {
                var p = this.parent;
                p.rotation = Math.sin((p.timer + this.offset) * 0.037) * 0.11;
            }
        });
        var doubleCoins = new Entity({
            name: 'doubleCoins',
            position: new Vector2(-36, 8),
            components: [
                new SpriteContainer({
                    imageName: 'ui/vip/doublecoins',
                    originRelative: new Vector2(0.5, 0.5),
                    alpha: 1,
                    scale: Globals.pixelScaleUIV
                }),
                new Text({
                    fontSettings: Utils.getTextStyle('vipScreenText'),
                    position: new Vector2(0, 14),
                    scale: new Vector2(1, 1),
                    maxWidth: 48,
                    maxHeight: 16,
                    text: Localization.getText('2xCoins')
                })
            ]
        });
        var noAds = new Entity({
            name: 'noAds',
            position: new Vector2(36, 8),
            components: [
                new SpriteContainer({
                    imageName: 'ui/vip/freebeans',
                    originRelative: new Vector2(0.5, 0.5),
                    alpha: 1,
                    scale: Globals.pixelScaleUIV
                }),
                new Text({
                    fontSettings: Utils.getTextStyle('vipScreenText'),
                    position: new Vector2(0, 12),
                    scale: new Vector2(1, 1),
                    maxWidth: 48,
                    maxHeight: 16,
                    text: Localization.getText('freeBeans')
                })
            ]
        });
        var closeButton = new ClickButton({
            name: 'closeButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/vip/close',
            frameCountX: 1,
            frameCountY: 1,
            position: new Vector2((viewport.width * 0.5) - 24, -(viewport.height * 0.5) + 24),
            scale: Globals.pixelScaleV.scalarMultiply(0.75),
            float: false,
            alpha: 0.75,
            onClick: function () {
                if (isPopup) {
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "vip:popupResult",
                        value: 0
                    });
                } else {
                    EventSystem.fire('GameAnalytics-addDesignEvent', {
                        eventId: "vip:selfResult",
                        value: 0
                    });
                }
                dialog.close();
            }
        });
        var buyButton = new ClickButton({
            name: '',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 62),
            scale: Globals.pixelScaleUIV.scalarMultiply(2),
            float: false,
            onClick: function () {
                if (Utils.isDev()) {
                    if (!Bento.saveState.load('VIP', false)) {
                        Bento.saveState.save('VIP', true);
                        Bento.saveState.save('VipFailedValidations', 0);
                        EventSystem.fire('onVipChanged', true);
                        dialog.close();
                    }
                    return;
                }
                IapOverlay.purchase({
                    z: Globals.layers.iapoverlay,
                    id: (window.IAPPREFIX + '_vip'),
                    subscription: true,
                    isConsumable: false,
                    fontSettings: Utils.getTextStyle('iapOverlay'),
                    onPurchaseComplete: function onPurchaseComplete(success, id, purchaseInfo) {
                        if (!success || id !== (window.IAPPREFIX + '_vip')) {
                            return;
                        }

                        // close the popup, the onPurchase() handler in init.js should take care of the rest
                        if (isPopup) {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "vip:popupResult",
                                value: 1
                            });
                        } else {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "vip:selfResult",
                                value: 1
                            });
                        }
                        dialog.close();
                    }
                });
            }
        }).attach(new Text({
            fontSettings: Utils.getTextStyle('vipButtonTry'),
            position: new Vector2(0, -18),
            scale: new Vector2(0.5, 0.5).divide(Globals.pixelScaleUIV),
            maxWidth: 108,
            maxHeight: 20,
            text: Localization.getText('tryFree')
        })).attach(new Text({
            fontSettings: Utils.getTextStyle('vipButtonOffer'),
            position: new Vector2(0, 26),
            scale: new Vector2(0.375, 0.375).divide(Globals.pixelScaleUIV),
            maxWidth: 108,
            maxHeight: 20,
            text: Localization.getText('subscriptionOffer').replace('{PRICE}', subscriptionPrice)
        }));
        var detailsText = Utils.getPreloadedVIPTerms();
        detailsText.position = new Vector2(-(viewport.width - 16) * 0.5, 92);
        var buttonGlow = new SpriteContainer({
            imageName: 'ui/button-glow',
            originRelative: new Vector2(0.5, 0.5),
            position: buyButton.position,
            scale: buyButton.scale
        }).attach({
            name: 'glowBehaviour',
            update: function () {
                var p = this.parent;
                p.alpha = 0.5 + Math.sin(p.timer * 0.1) * 0.2;
            }
        });
        var privacyLink = new Text({
            position: new Vector2((-viewport.width * 0.5) + 16, (viewport.height * 0.5) - 4),
            text: Localization.getText('privacyPolicy'),
            fontSize: 9,
            fontColor: '#28aeff',
            align: 'left',
            textBaseline: 'bottom',
            drawDebug: false,
            linebreaks: false,
            boundingBox: new Rectangle(-32, -8, 64, 10),
            maxWidth: 64,
            maxHeight: 12,
            components: [
                new Clickable({
                    sort: true,
                    onClick: function (data) {
                        Utils.openUrl('https://www.lucky-kat.com/games-privacy-notice/');
                    }
                })
            ]
        });
        var termsLink = new Text({
            position: new Vector2((viewport.width * 0.5) - 16, (viewport.height * 0.5) - 4),
            text: Localization.getText('termsOfService'),
            fontSize: 9,
            fontColor: '#28aeff',
            align: 'right',
            textBaseline: 'bottom',
            drawDebug: false,
            linebreaks: false,
            boundingBox: new Rectangle(-32, -8, 64, 10),
            maxWidth: 64,
            maxHeight: 12,
            components: [
                new Clickable({
                    sort: true,
                    onClick: function (data) {
                        Utils.openUrl('https://www.lucky-kat.com/terms-of-use');
                    }
                })
            ]
        });

        var mainAnchor = new Entity({
            name: 'mainAnchor',
            position: new Vector2(0, 0),
            components: [
                titleBanner,
                kingGraphic,
                calciGraphic,
                growbotGraphic,
                gizmoGraphic,
                gojiGraphic,
                new Text({
                    fontSettings: Utils.getTextStyle('vipScreenText'),
                    position: new Vector2(0, -20),
                    scale: new Vector2(1, 1),
                    maxWidth: 128,
                    maxHeight: 16,
                    text: Localization.getText('subscriptionSubTitle')
                }),
                doubleCoins,
                noAds,
                closeButton,
                buttonGlow,
                buyButton,
                detailsText,
                privacyLink,
                termsLink, {
                    name: 'cleaner',
                    destroy: function () {
                        mainAnchor.remove(detailsText);
                    }
                }
            ]
        });

        // --- ENTITY ---
        var dialog = new Dialog({
            z: Globals.layers.vipdialog,
            titleText: '',
            type: '',
            offset: new Vector2(0, -20),
            onComplete: onComplete,
            components: [mainAnchor],
            attach: true
        });

        new Tween({
            from: 0,
            to: 1,
            in: 30,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                detailsText.alpha = v;
            }
        });
    };
});