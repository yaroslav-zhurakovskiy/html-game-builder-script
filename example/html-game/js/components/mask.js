/**
 * Square mask for sprites
 * @moduleName Mask
 * @snippet Mask.snippet
Mask({
    // reference to rectangle, coordinates relative to entity's space
    rectangle: new Rectangle(0, 0, 1, 1),
    // reference to sprite, may be several entities deeper
    sprite: null
})
 */
bento.define('components/mask', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'bento/components/sprite'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween,
    Sprite
) {
    'use strict';
    var Mask = function (settings) {
        var viewport = Bento.getViewport();
        var rectangle = settings.rectangle || new Rectangle(0, 0, 1, 1);
        var sprite = settings.sprite;
        var entity;
        var component = {
            name: 'mask',
            start: function (data) {
                if (sprite) {
                    sprite.draw = maskedDraw;
                }
            },
            destroy: function (data) {
                if (sprite) {
                    // restore
                    sprite.draw = Sprite.prototype.draw;
                }
            },
            attached: function (data) {
                entity = data.entity;
            }
        };
        var maskedDraw = function (data) {
            // target rectangle to draw, determine x and y below
            var target;
            if (!this.currentAnimation || !this.visible) {
                return;
            }

            // do the sprite update
            this.updateFrame();

            // determine target
            // target is local to the sprite
            target = new Rectangle(
                (-this.origin.x) | 0,
                (-this.origin.y) | 0,
                this.frameWidth,
                this.frameHeight
            );

            // transform the mask rect from the space of the entity
            // to the space of the sprite's parent (which may be several entities deeper)
            var x1 = rectangle.x;
            var y1 = rectangle.y;
            var x2 = rectangle.x + rectangle.width;
            var y2 = rectangle.y + rectangle.height;

            if (x1 > x2) {
                var x1_ = x1;
                x1 = x2;
                x2 = x1_;
            }
            if (y1 > y2) {
                var y1_ = y1;
                y1 = y2;
                y2 = y1_;
            }

            var applyTransform = function (e) {
                if (e !== entity) {
                    applyTransform(e.parent);
                }
                x1 = (x1 - e.position.x) / e.scale.x;
                y1 = (y1 - e.position.y) / e.scale.y;
                x2 = (x2 - e.position.x) / e.scale.x;
                y2 = (y2 - e.position.y) / e.scale.y;

                if (x1 > x2) {
                    var x1_ = x1;
                    x1 = x2;
                    x2 = x1_;
                }
                if (y1 > y2) {
                    var y1_ = y1;
                    y1 = y2;
                    y2 = y1_;
                }

            };
            applyTransform(sprite.parent);

            var intersection = new Rectangle(x1, y1, x2 - x1, y2 - y1).intersection(target);

            if (!intersection.width || !intersection.height) {
                // there is nothing to draw
                return;
            }

            //floor intersection
            intersection.width = Math.floor(intersection.width);
            intersection.height = Math.floor(intersection.height);

            data.renderer.drawImage(
                this.spriteImage,
                this.sourceX + (intersection.x - target.x),
                this.sourceY + (intersection.y - target.y),
                intersection.width,
                intersection.height,
                intersection.x,
                intersection.y,
                intersection.width,
                intersection.height
            );
        };
        return component;
    };

    Mask.applyToContainer = function (container, rectangle) {
        var setMasks = function (entity) {
            entity.components.forEach(function (comp) {
                if (!comp) {
                    return;
                }
                if (comp.components) {
                    setMasks(comp);
                } else if (comp instanceof Sprite) {
                    container.attach(new Mask({
                        sprite: comp,
                        rectangle: rectangle
                    }));
                }
            });
        };
        setMasks(container);
    };

    return Mask;
});