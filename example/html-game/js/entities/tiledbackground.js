/**
 * A background that tiles over the viewport
 * @moduleName TiledBackground
 */
bento.define('entities/tiledbackground', [
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
    'bento/components/fill'
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
    Fill
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var camera;
        var sprite = new Sprite({
            imageName: settings.imageName
        });
        var spriteContainer = new Entity({
            position: new Vector2(0, 0),
            scale: settings.scale || new Vector2(1, 1),
            components: [
                sprite
            ]
        });
        var entity = new Entity({
            z: settings.z || 0,
            name: 'background',
            rotation: -0.1,
            float: true,
            components: [{
                    name: 'background',
                    update: function () {
                        if (!camera) {
                            camera = Bento.objects.get('camera');
                        }
                    },
                    draw: function (data) {
                        //enable spriteContainer
                        var viewMiddle = new Vector2(viewport.x + (viewport.width * 0.5), viewport.y + (viewport.height * 0.5));
                        var scale = spriteContainer.scale.scalarMultiply(0.99);
                        var frameX = sprite.frameWidth * scale.x;
                        var frameY = sprite.frameHeight * scale.y;
                        //get the amount of images that can fit on screen, and draw them
                        // X
                        for (
                            // LEFT
                            var i = Math.floor(viewport.x / frameX) - 2;
                            //RIGHT
                            i < Math.ceil((viewport.x + viewport.width) / frameX) + 2; i++
                        ) {
                            // Y
                            for (
                                // TOP
                                var j = Math.floor(viewport.y / frameY) - 2;
                                // BOTTOM
                                j < Math.ceil((viewport.y + viewport.height) / frameY) + 2; j++
                            ) {
                                //draw
                                spriteContainer.visible = true;
                                spriteContainer.position = new Vector2((i * frameX) + (entity.offset.x % frameX), (j * frameY) + (entity.offset.y % frameY));
                                spriteContainer.draw(data);
                                spriteContainer.visible = false;
                            }
                        }

                    }
                },
                spriteContainer
            ]
        }).extend({
            offset: new Vector2(0, 0),
            sprite: sprite
        });
        return entity;
    };
});