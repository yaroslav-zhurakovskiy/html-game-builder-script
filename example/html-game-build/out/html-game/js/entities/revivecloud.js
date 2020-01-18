/**
 * Module description
 * @moduleName ReviveCloud
 * @snippet ReviveCloud.snippet
ReviveCloud({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/revivecloud', [
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
    'globals'
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
    Globals
) {
    'use strict';
    return function (settings) {
        var position = settings.position;
        var wasStoodOnBy;

        // --- COMPONENTS ---
        var spriteContainer = new SpriteContainer({
            spriteSheet: 'cloud',
            position: new Vector2(0.5, -2),
            scale: Globals.pixelScaleV
        });
        var behaviour = {
            name: "behaviour",
            update: function () {
                var stoodOnBy = entity.collidesWith({
                    name: 'player',
                    offset: new Vector2(0, -1),
                    firstOnly: true,
                });
                if (wasStoodOnBy && !stoodOnBy) {
                    spriteContainer.sprite.setAnimation("disappear");
                    spriteContainer.sprite.onCompleteCallback = function () {
                        entity.removeSelf();
                    };
                    entity.boundingBox = new Rectangle(-256, 0, 1, 1);
                }
                wasStoodOnBy = stoodOnBy;
                spriteContainer.scale = new Vector2(Globals.pixelScale + Math.cos(spriteContainer.timer * 0.1) * 0.02, Globals.pixelScale - Math.cos(spriteContainer.timer * 0.1) * 0.02);
                if (stoodOnBy) {
                    stoodOnBy.getDrawEntity().position.y -= (Math.sin(spriteContainer.timer * 0.1) * 0.1);
                }

            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'reviveCloud',
            family: ['solids'],
            position: position,
            boundingBox: new Rectangle(-16, 0, 32, 1),
            components: [
                spriteContainer,
                behaviour
            ]
        });
        return entity;
    };
});