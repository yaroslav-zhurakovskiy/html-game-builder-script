/**
 * Module description
 * @moduleName Bullet
 * @snippet Bullet.snippet
Bullet({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/bullet', [
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
    'components/movable',
    'globals',
    'components/culler',
    'components/spritecontainer',
    'entities/particle'
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
    Movable,
    Globals,
    Culler,
    SpriteContainer,
    Particle
) {
    'use strict';
    return function (settings) {
        var position = settings.position;
        var source = settings.source;
        var shootDirection = settings.shootDirection || "left";
        var xVel = (shootDirection === "left") ? -1 : 1;
        var sprite = new SpriteContainer({
            spriteSheet: 'cannonball',
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale)
        });
        window.Bento = Bento;
        var movable = new Movable({
            velocity: new Vector2(xVel, 0),
            ignore: [source],
            stopOnCollide: false,
            canCollideWith: ['solids', 'hazards'],
            onCollision: function (collisionData) {
                new Particle({
                    z: Globals.layers.effects,
                    spriteSheet: 'effects/hit',
                    position: entity.position.clone(),
                    scale: Globals.pixelScaleV
                });
                entity.removeSelf();
                if (collisionData.entity.name === "bullet") {
                    collisionData.entity.removeSelf();
                }
            }
        });
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'bullet',
            family: ['hazards'],
            position: position,
            scale: new Vector2((xVel > 0) ? 1 : -1, 1),
            boundingBox: new Rectangle(-7, -7, 14, 14),
            components: [
                sprite,
                new Culler({
                    height: 8
                }),
                movable
            ]
        });
        return entity;
    };
});