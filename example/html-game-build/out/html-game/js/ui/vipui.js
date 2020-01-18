/**
 * Module description
 * @moduleName VipUI
 * @snippet VipUI.snippet
VipUI({})
 */
bento.define('ui/vipui', [
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
    'modules/vipmanager',
    'globals',
    'ui/vipdialog',
    'modules/skinmanager',
    'ui/vipslot',
    'components/spritecontainer',
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
    VipManager,
    Globals,
    VipDialog,
    SkinManager,
    VipSlot,
    SpriteContainer,
    Localization
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var isVip = VipManager.isVip();
        var vipitems = [];
        var items = settings.items || [];
        var plantSelector = settings.plantSelector;
        var listAnchor = settings.listAnchor;
        var vipSkins = SkinManager.getAllVipPlantSkins();
        var position = settings.position || new Vector2(0, 0);

        // --- FUNCTIONS ---
        var reset = function () {
            isVip = VipManager.isVip();
            //remove everything else
            entity.remove(vipText);
            entity.remove(kingPlant1);
            entity.remove(kingPlant2);
            entity.remove(vipButton);
            entity.remove(vipButtonText);
            Utils.forEach(vipitems, function (item, i, l, breakLoop) {
                listAnchor.remove(item);
            });
            vipitems = [];
            if (isVip) {
                entity.attach(vipText);
                // add vip skins if authorised
                Utils.forEach(vipSkins, function (skin, i, l, breakLoop) {
                    var index = items.length;
                    var slotPosition = new Vector2((vipitems.length % 3) * 48 - 48, 24 + Math.floor(vipitems.length / 3) * 48);
                    var slot = new VipSlot({
                        index: index,
                        position: entity.position.add(slotPosition),
                        skin: skin,
                        isScrolling: plantSelector.isScrolling,
                        plantSelector: plantSelector,
                        onClick: function () {
                            plantSelector.changeFocus(index);
                        }
                    });
                    listAnchor.attach(slot);
                    items.push(slot);
                    vipitems.push(slot);
                });
            } else {
                //add the vip buy button instead
                entity.attach(kingPlant1);
                entity.attach(kingPlant2);
                entity.attach(vipButton);
                entity.attach(vipButtonText);
            }
        };

        // --- COMPONENTS ---
        var vipText = new Text({
            fontSettings: Utils.getTextStyle('growingTitleText'),
            position: new Vector2(0, -8),
            text: Localization.getText('kingPlants'),
            antiAlias: true,
            maxWidth: 80,
            maxHeight: 14
        });
        var vipButton = new ClickButton({
            name: 'vipButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/bluebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 23),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.6, 1.4)),
            sort: true,
            onClick: function () {
                new VipDialog({});
            }
        });
        var vipButtonText = new Text({
            fontSettings: Utils.getTextStyle('vipButtonGet'),
            position: new Vector2(0, 25),
            text: Localization.getText('getKingPlants'),
            antiAlias: true,
            maxWidth: 92,
            maxHeight: 28
        });

        var kingPlant1 = new SpriteContainer({
            imageName: 'ui/vip/vip_gang_kingplant',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-52, 16),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.75)
        });
        var kingPlant2 = new SpriteContainer({
            imageName: 'ui/vip/vip_gang_kingplant',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(52, 16),
            scale: Globals.pixelScaleUIV.scalarMultiply(0.75)
        });
        kingPlant2.scale.x *= -1;

        // --- ENTITY ---
        var entity = new Entity({
            name: 'vipUI',
            position: position,
            float: false,
            components: []
        }).extend({
            reset: reset,
            getItems: function () {
                return vipitems;
            },
            getMaxHeight: function () {
                return 64 + (isVip ? Math.floor((vipitems.length - 1) / 3) * 48 : 0);
            }
        });

        reset();
        return entity;
    };
});