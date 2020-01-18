/**
 * Module description
 * @moduleName OneWayPlatform
 * @snippet OneWayPlatform.snippet
OneWayPlatform({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/onewayplatform', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/utils',
    'globals',
    'components/spritecontainer'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    Utils,
    Globals,
    SpriteContainer
) {
    'use strict';
    return function (settings) {
        // --- PARAMETERS ---
        var camera = Bento.objects.get('camera');
        var dimension = settings.dimension || settings.tiledRect || new Rectangle(0, 0, 5, 5);
        var scale = settings.scale || new Vector2(1, 1);
        var position = settings.position;
        position.x += (dimension.width * Utils.sign(scale.x - 1));
        var pieceWidth = (16 / 3);
        var widthCount = Math.ceil(dimension.width / pieceWidth);
        var halfWidth = (widthCount * 0.5) * pieceWidth;
        var springValues = [];
        var springSpeeds = [];
        var maxSpring = 4;
        var springFactor = 0.1;
        var springDecay = 0.9;
        var springPropagation = 24;
        for (var i = 0; i < widthCount; i++) {
            springValues[i] = 0;
            springSpeeds[i] = 0;
        }

        // --- COMPONENTS ---
        var pieceSprite = new SpriteContainer({
            imageName: 'onewaypiece',
            originRelative: new Vector2(0, 0),
            visible: false,
            scale: Globals.pixelScaleV
        });
        var pieceEndSprite = new SpriteContainer({
            imageName: 'onewayends',
            originRelative: new Vector2(0.5, 0.5),
            visible: false,
            scale: Globals.pixelScaleV
        });

        var behaviour = {
            name: "behaviourComponent",
            update: function () {
                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                var viewportScaled = camera.getUnscaledViewport();
                var weightPositions = [];
                var weightValues = [];
                var stoodOn = false;
                if (entity.visible) {
                    //get weight positions
                    entity.collidesWith({
                        family: 'players',
                        offset: new Vector2(0, -4),
                        onCollide: function (other) {
                            if (other && !other.getIsSnappingBack()) {
                                var yVel = other.getComponent('movableBehaviour').lastVelocity.y;
                                weightPositions.push(other.position.x - entity.position.x);
                                weightValues.push(1 + (yVel * 0.5));
                                stoodOn = true;
                            }
                        }
                    });
                    entity.collidesWith({
                        family: 'enemies',
                        offset: new Vector2(0, -4),
                        onCollide: function (other) {
                            if (other) {
                                var yVel = other.getComponent('movableBehaviour').lastVelocity.y;
                                weightPositions.push(other.position.x - entity.position.x);
                                weightValues.push(0.5 + (yVel * 0.25));
                                stoodOn = true;
                            }
                        }
                    });
                    // edit springs
                    Utils.forEach(springValues, function (springValue, springIndex, l, breakLoop) {
                        var d = 0;
                        Utils.forEach(weightPositions, function (weightPosition, weightIndex, l1, breakLoop1) {
                            d -= ((Math.min(Math.abs(((springIndex + 1) * pieceWidth) - weightPosition), springPropagation) - springPropagation) / springPropagation) * weightValues[weightIndex];
                        });
                        springSpeeds[springIndex] += (d - springValues[springIndex]) * springFactor;
                        springValues[springIndex] += springSpeeds[springIndex];
                        springSpeeds[springIndex] *= springDecay;
                    });
                }

                entity.visible = ((stoodOn && entity.visible) || entity.position.y - 5 < (viewportScaled.y + viewportScaled.height + 5));
            },
            draw: function (data) {
                pieceSprite.visible = true;
                pieceEndSprite.visible = true;
                Utils.forEach(springValues, function (springValue, springIndex, l, breakLoop) {
                    pieceSprite.position.x = springIndex * pieceWidth;
                    pieceSprite.position.y = springValues[springIndex] * maxSpring;
                    pieceSprite.draw(data);
                });
                pieceEndSprite.position.y = 3;
                pieceEndSprite.position.x = 0;
                pieceEndSprite.draw(data);
                pieceEndSprite.position.x = widthCount * pieceWidth;
                pieceEndSprite.draw(data);

                pieceSprite.visible = false;
                pieceEndSprite.visible = false;
                if (Globals.debug) {
                    var bb = entity.boundingBox;
                    data.renderer.fillRect([1, 0.5, 0, 0.5], bb.x, bb.y, bb.width, bb.height);
                }
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'onewayplatform',
            family: ['solids', 'onewayplatform'],
            visible: true,
            position: position,
            scale: new Vector2(1, 1),
            boundingBox: settings.boundingBox || new Rectangle(0, 4, dimension.width, 4),
            components: [
                pieceSprite,
                pieceEndSprite,
                behaviour
            ]
        });
        return entity;
    };
});