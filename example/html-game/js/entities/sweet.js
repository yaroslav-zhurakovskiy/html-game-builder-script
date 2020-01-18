/**
 * Module description
 * @moduleName Sweet
 * @snippet Sweet.snippet
Sweet({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/sweet', [
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
    'components/culler',
    'components/spritecontainer',
    'entities/particle',
    'components/movable',
    'modules/skinmanager'
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
    Culler,
    SpriteContainer,
    Particle,
    Movable,
    SkinManager
) {
    'use strict';
    return function (settings) {
        // --- PARAMETERS ---
        var startPosition = settings.position || new Vector2(0, 0);
        var moveX = settings.moveX || 0;
        var moveTimeX = settings.moveTimeX || 120;
        var moveOffsetTimeX = settings.moveOffsetTimeX || 0;
        var moveY = settings.moveY || 0;
        var moveTimeY = settings.moveTimeY || 120;
        var moveOffsetTimeY = settings.moveOffsetTimeY || 0;
        var skin = Utils.isDefined(settings.forceSkin) ? settings.forceSkin % 6 : Utils.getRandom(6);
        var fall = false;
        var isBone = (SkinManager.getCurrentPlantSkin() === 'gizmo');
        var rotRate = Utils.getRandomRangeFloat(0.075, 0.15) * [-1, 1][Utils.getRandom(2)];

        var sweetSprite = !isBone ? new SpriteContainer({
            spriteSheet: 'sweets/sweet' + (1 + skin),
            scale: Globals.pixelScaleV
        }) : new SpriteContainer({
            spriteSheet: 'sweets/bone',
            scale: Globals.pixelScaleV.scalarMultiply(1.25)
        });

        var checkGizmo = function (newSkin) {
            isBone = (newSkin === 'gizmo');
            if (isBone) {
                sweetSprite.sprite.setSpriteSheet('sweets/bone');
                sweetSprite.scale = Globals.pixelScaleV.scalarMultiply(1.25);
                sweetSprite.sprite.setCurrentSpeed(0.33);
                entity.rotation = Utils.toRadian(Utils.getRandomFloat(360));
            } else {
                sweetSprite.sprite.setSpriteSheet('sweets/sweet' + (1 + skin));
                sweetSprite.scale = Globals.pixelScaleV;
                sweetSprite.sprite.setCurrentSpeed(0.33);
                sweetSprite.sprite.setFrame(Math.floor(Math.abs(startPosition.y / 4)) % 16);
                entity.rotation = 0;
            }
        };

        // --- COMPONENTS ---
        var movable = new Movable({
            velocity: new Vector2(0, 0),
            enabled: false,
            canCollideWith: ['solids'],
            stopOnCollide: false,
            onCollision: function (collisionData) {
                movable.velocity.y *= -0.5;
                if (Math.abs(movable.velocity.y) < 0.05) {
                    movable.velocity.y = 0;
                }
            }
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'sweet',
            family: ['sweets'],
            position: startPosition.clone(),
            boundingBox: new Rectangle(-6, -6, 12, 12),
            components: [
                sweetSprite,
                new Culler({
                    height: 8
                }),
                movable, {
                    name: "effectBehaviour",
                    start: function () {
                        EventSystem.on('onPlantChanged', checkGizmo);
                        checkGizmo(SkinManager.getCurrentPlantSkin());
                    },
                    update: function () {
                        if (moveX > 0) {
                            entity.position.x = startPosition.x + Math.sin(((entity.timer + moveOffsetTimeX) / moveTimeX) * Math.PI) * moveX;
                            entity.position.y = startPosition.y + Math.sin(((entity.timer + moveOffsetTimeY) / moveTimeY) * Math.PI) * moveY;
                        }
                        if (fall) {
                            movable.velocity.y += 0.1;
                        }
                        if (isBone) {
                            entity.rotation += rotRate;
                        }
                    },
                    destroy: function (data) {
                        EventSystem.off('onPlantChanged', checkGizmo);
                        if (!Globals.showEffects) {
                            return;
                        }
                        new Particle({
                            z: Globals.layers.effects,
                            spriteSheet: 'effects/splat',
                            position: entity.position.clone(),
                            alpha: 1,
                            scale: Globals.pixelScaleV.multiply(new Vector2([-1.3, 1.3][Utils.getRandom(2)], 1.3)),
                            rotation: 0,
                            velocity: new Vector2(0, 0)
                        });
                        new Particle({
                            z: Globals.layers.tiles2,
                            originRelative: new Vector2(0.5, 0.5),
                            imageName: 'rainbow-radial',
                            blendMode: PIXI.BLEND_MODES.OVERLAY,
                            position: entity.position.clone(),
                            alpha: 0.66,
                            scale: Globals.pixelScaleV.multiply(new Vector2([-1.1, 1.1][Utils.getRandom(2)], 1.1)),
                            rotation: Utils.getRandom(6.28),
                            rotationRate: 0.1,
                            velocity: new Vector2(0, 0),
                            removeAfterTime: 20,
                            removeEffect: 'scalefade'
                        });
                    },
                    draw: function (data) {
                        if (Globals.debug) {
                            var bb = entity.boundingBox;
                            data.renderer.fillRect([1, 0.75, 0, 0.5], bb.x, bb.y, bb.width, bb.height);
                        }
                    }
                }
            ]
        }).extend({
            startFall: function () {
                fall = true;
                movable.setEnabled(true);
                moveX = 0;
                moveY = 0;
            },
            setMoveX: function (newX) {
                moveX = newX;
            }
        });
        return entity;
    };
});