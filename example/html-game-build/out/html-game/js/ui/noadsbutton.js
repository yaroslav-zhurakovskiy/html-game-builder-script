/**
 * Module description
 * @moduleName NoAdsButton
 * @snippet NoAdsButton.snippet
NoAdsButton({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/noadsbutton', [
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
    'components/spritecontainer',
    'globals',
    'components/sortedclickable',
    'ui/iapoverlay',
    'modules/savemanager',
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
    SpriteContainer,
    Globals,
    SortedClickable,
    IapOverlay,
    SaveManager,
    Localization
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var position = settings.position || new Vector2(0, 0);
        var hasBought = !SaveManager.load('showForcedAds');

        if (hasBought) {
            return {
                name: 'blank'
            };
        }

        // --- FUNCTIONS ---
        var productOnBuy = function () {
            SaveManager.save('showForcedAds', false);
            entity.removeSelf();
        };

        // --- COMPONENTS ---
        var backing = new SpriteContainer({
            imageName: 'ui/no-vids',
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV
        });

        // --- ENTITY ---
        var entity = new Entity({
            name: 'noAdsButton',
            position: position,
            float: true,
            boundingBox: new Rectangle(-20, -20, 40, 40),
            components: [
                backing,
                new Text({
                    fontSettings: Utils.getTextStyle('noAdsPurchase'),
                    position: new Vector2(0, 10),
                    maxWidth: 28,
                    maxHeight: 12,
                    text: Localization.getText('removeAds')
                }),
                new SortedClickable({
                    onClick: function (data) {
                        if (Utils.isDev()) {
                            //productOnBuy();
                            //return;
                        }
                        IapOverlay.purchase({
                            z: Globals.layers.iapoverlay,
                            id: (window.IAPPREFIX + '_noads'),
                            subscription: false,
                            isConsumable: false,
                            fontSettings: Utils.getTextStyle('iapOverlay'),
                            onPurchaseComplete: function onPurchaseComplete(success, id, purchaseInfo) {
                                if (!success || id !== (window.IAPPREFIX + '_noads')) {
                                    return;
                                }
                                productOnBuy();
                            }
                        });
                    }
                })
            ]
        });
        return entity;
    };
});