/**
 * An Entity which naturally holds a sprite, thereby granting it teh ability to be transformed easily
 * @moduleName SpriteContainer
 * @snippet SpriteContainer.spriteSheet
SpriteContainer({
    spriteSheet: '',
    position: new Vector2(0, 0),
    alpha: 1,
    scale: new Vector2(1, 1),
    rotation: 0
})
 * @snippet SpriteContainer.imageName
SpriteContainer({
    imageName: '',
    originRelative: new Vector2(0.5, 0.5),
    frameCountX: 1,
    frameCountY: 1,
    animations: {
        default: {
            speed: 0,
            frames: [0]
        }
    },
    position: new Vector2(0, 0),
    alpha: 1,
    scale: new Vector2(1, 1),
    rotation: 0
})
 */
bento.define('components/spritecontainer', [
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
    'bento/tween'
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
    Tween
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var sprite = settings.sprite || new Sprite(settings);
        var spriteContainer = new Entity({
            name: settings.name || 'spriteContainer',
            position: settings.position || new Vector2(0, 0),
            alpha: Utils.isDefined(settings.alpha) ? settings.alpha : 1,
            float: settings.float || false,
            scale: settings.scale || new Vector2(1, 1),
            rotation: settings.rotation || 0,
            components: [sprite],
            z: settings.z || 0
        }).extend({
            sprite: sprite
        });
        return spriteContainer;
    };
});