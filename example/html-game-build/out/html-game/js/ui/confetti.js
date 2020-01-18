/**
 * Confetti overlay
 * @moduleName Confetti
 */
bento.define('ui/confetti', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/utils',
    'bento/tween'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    Utils,
    Tween
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var pauseLevel = settings.updateWhenPaused || Bento.objects.isPaused();
        var duration = settings.duration || 180;
        var scale = new Vector2(settings.particleScale || 1, settings.particleScale || 1);
        var entity = new Entity({
            z: settings.z || 0,
            name: 'confettimaker',
            position: settings.position || new Vector2(0, 0),
            float: true,
            updateWhenPaused: pauseLevel,
            components: [{
                name: "confettiMakerBehaviour",
                start: function () {
                    new Tween({
                        from: 0,
                        to: 1,
                        in: 10,
                        onUpdate: function (v, t) {
                            entity.alpha = v;
                        },
                        onComplete: function () {
                            new Tween({
                                from: 1,
                                to: 0,
                                in: 30,
                                delay: duration,
                                onUpdate: function (v, t) {
                                    entity.alpha = v;

                                },
                                onComplete: function () {
                                    Bento.objects.remove(entity);
                                }
                            });
                        }
                    });
                }
            }]
        });
        var spawnConfetti = function () {
            var confetti = new Entity({
                name: 'confetti',
                position: new Vector2(Utils.getRandom(viewport.width), Utils.getRandom(viewport.height)),
                scale: scale.clone(),
                updateWhenPaused: pauseLevel,
                components: [new Sprite({
                    imageName: settings.imageName || 'ui/confetti',
                    originRelative: new Vector2(0.5, 0.5),
                    frameCountX: 3,
                    animations: {
                        'default': {
                            speed: 0,
                            frames: [Utils.getRandom(3)]
                        }
                    }
                })]
            }).attach({
                name: 'confettiBehaviour',
                speedX: 0,
                speedY: settings.speedY || 1,
                rotationSpeed: Utils.getRandom(5),
                start: function () {
                    confetti.timer = Utils.getRandomFloat(1000);
                },
                update: function () {
                    var dimension = confetti.dimension,
                        position = confetti.position;
                    if (position.x < -dimension.width) {
                        position.x = viewport.width + dimension.width;
                    } else if (position.x > viewport.width + dimension.width) {
                        position.x = -dimension.width;
                    }
                    if (position.y < -dimension.height) {
                        position.y = viewport.height + dimension.height;
                    } else if (position.y > viewport.height + dimension.height) {
                        position.y = -dimension.height;
                    }

                    this.speedX += (Utils.getRandom(10) - Utils.getRandom(10)) / 10;
                    this.speedX = Math.min(Math.max(this.speedX, -2), 2);

                    position.x += this.speedX;
                    position.y += this.speedY;

                    // flip
                    confetti.scale.x = Math.sin(confetti.timer / (this.rotationSpeed + 5)) * scale.x;
                }
            });

            entity.attach(confetti);
        };

        Utils.repeat(35, spawnConfetti);

        return entity;
    };
});