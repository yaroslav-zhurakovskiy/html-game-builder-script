/**
 * Module description
 * @moduleName VipSlot
 * @snippet VipSlot.snippet
VipSlot({
    onClick: function () {}
})
 */
bento.define('ui/vipslot', [
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
    'modules/timemanager',
    'components/sortedclickable',
    'globals',
    'modules/skinmanager',
    'ui/potunlockeddialog'
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
    TimeManager,
    SortedClickable,
    Globals,
    SkinManager,
    PotUnlockedDialog
) {
    'use strict';
    return function (settings) {

        // --- PARAMETERS ---
        var plantSelector = settings.plantSelector;
        var index = settings.index || 0;
        var skin = settings.skin;
        var onClick = settings.onClick || function () {};
        var isScrolling = settings.isScrolling || function () {
            return false;
        };

        // --- COMPONENTS ---
        var headSprite = new SpriteContainer({
            name: 'buttonIcon',
            spriteSheet: 'headskins/' + skin,
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 12),
            scale: Globals.pixelScaleV.scalarMultiply(1.66).scalarMultiply(Bento.assets.getJson('skin_data')['plants']['extraScale'][skin] || 1)
        });
        headSprite.sprite.setAnimation('idle');
        headSprite.sprite.setFrame(0);
        headSprite.sprite.setCurrentSpeed(0);

        switch (skin) {
        case "turnip":
        case "neep":
            headSprite.position.y = 10;
            break;

        }

        var snapBehaviour = {
            name: "snapBehaviour",
            update: function () {
                if (plantSelector) {
                    var focusEntity = plantSelector.getFocusEntity();
                    if (focusEntity && focusEntity.id === slot.id) {
                        headSprite.sprite.setAnimation('default');
                        headSprite.sprite.setCurrentSpeed(0.25);
                    } else {
                        headSprite.sprite.setAnimation('idle');
                        headSprite.sprite.setFrame(0);
                        headSprite.sprite.setCurrentSpeed(0);
                    }
                }
            }
        };

        // --- ENTITY ---
        var slot = new Entity({
            name: 'slot-' + index,
            position: settings.position || new Vector2(0, 0),
            boundingBox: new Rectangle(-22, -22, 44, 44),
            components: [
                new SpriteContainer({
                    name: 'buttonSpriteContainer',
                    imageName: 'ui/char-back-unlocked',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 0),
                    scale: Globals.pixelScaleUIV
                }),
                headSprite,
                snapBehaviour,
                new SortedClickable({
                    onClick: function (data) {
                        if (!isScrolling()) {
                            onClick();
                            Bento.audio.playSound('sfx_clickbutton');
                        }
                    }
                })
            ]
        }).extend({
            getSkin: function () {
                return skin;
            }
        });

        return slot;
    };
});