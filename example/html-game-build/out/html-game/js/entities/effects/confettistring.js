/**
 * Module description
 * @moduleName ConfettiString
 * @snippet ConfettiString.snippet
ConfettiString({
    position: new Vector2(0, 0),
    velocity: new Vector2(0, 0),
    friction: 0.95
})
 */
bento.define('entities/effects/confettistring', [
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
    'color',
    'colorswapper'
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
    Color,
    ColorSwapper
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var swipe = new window.PIXI.Graphics();

        // --- VARS ---
        var isRemoving = false;
        var pointArray = [];
        var pointTimes = [];

        // --- FUNCTIONS ---
        var line = function (r, img, thickness, startPoint, endPoint) {
            var delta = endPoint.subtract(startPoint);
            var angle = delta.angle();
            var mag = delta.magnitude();
            r.translate(startPoint.x, startPoint.y);
            r.rotate(angle);
            r.drawImage(img, 0, 0, 8, 8, 0, -(thickness / 2), mag, thickness);
            r.rotate(-angle);
            r.translate(-startPoint.x, -startPoint.y);
        };

        // --- PARAMETERS ---
        var position = settings.position || new Vector2(0, 0);
        var velocity = settings.velocity || new Vector2(0, 0);
        var friction = settings.friction || 1;
        var life = settings.life || Utils.getRandomRangeFloat(50, 70);
        var maxLife = life;
        var radius = settings.radius || 3;
        var color = settings.color || [new Color(255, 59, 59), new Color(255, 224, 111), new Color(59, 212, 255)][Utils.getRandom(3)];
        var spinRate = Utils.getRandomRangeFloat(-0.1, 0.1);

        var lineImage = new ColorSwapper(Bento.assets.getImage('pinkPixel'), [new Color(255, 0, 255)], [color]);

        // --- COMPONENTS ---
        var behavior = {
            name: 'behaviorComponent',
            update: function (data) {

                if (!isRemoving) {
                    life -= data.speed;
                    if (life <= 0) {
                        isRemoving = true;
                        new Tween({
                            from: radius,
                            to: 0,
                            in: 15,
                            onUpdate: function (v, t) {
                                radius = v;
                            },
                            onComplete: function () {
                                entity.removeSelf();
                            }
                        });
                    }
                }

                // remove stuff
                while (entity.timer > pointTimes[0] + 30) {
                    pointArray.shift();
                    pointTimes.shift();
                }

                // add stuff 
                if (pointArray.length === 0) {
                    pointArray.push(entity.position.clone());
                    pointTimes.push(entity.timer);
                } else {
                    if (pointArray[pointArray.length - 1].distance(entity.position) < 0.1) {
                        pointArray[pointArray.length - 1] = entity.position.clone();
                        pointTimes[pointTimes.length - 1] = entity.timer;
                    } else {
                        pointArray.push(entity.position.clone());
                        pointTimes.push(entity.timer);
                    }
                }

                while (pointTimes.length > 30) {
                    pointArray.shift();
                    pointTimes.shift();
                }

                // move
                //velocity.y += gravity * data.speed;
                entity.position.addTo(velocity.scalarMultiply(data.speed));
                velocity.scalarMultiplyWith(1 - ((1 - friction) * data.speed));
                velocity = velocity.rotateRadian(spinRate * (life / maxLife));
            },
            draw: function (data) {
                var r = data.renderer;
                r.translate(-entity.position.x, -entity.position.y);
                for (var i = 1; i < pointArray.length; i++) {
                    line(r, lineImage, Math.min((i / 30) * radius, radius), pointArray[i - 1].clone(), pointArray[i].clone());
                }
                r.translate(entity.position.x, entity.position.y);
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.effects2,
            name: 'confettiString',
            family: ['effects'],
            position: position.clone(),
            float: false,
            components: [
                behavior
            ]
        });
        Bento.objects.attach(entity);
        return entity;
    };
});