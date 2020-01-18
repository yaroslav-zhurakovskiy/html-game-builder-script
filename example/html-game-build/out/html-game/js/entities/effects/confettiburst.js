/**
 * Module description
 * @moduleName ConfettiBurst
 * @snippet ConfettiBurst.snippet
ConfettiBurst({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/effects/confettiburst', [
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
    Globals
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        // --- PARAMETERS ---
        var position = settings.position || new Vector2(0, 0);
        var velocity = settings.velocity || new Vector2(0, 0);
        var friction = settings.friction || 1;
        var gravity = settings.gravity || 0.05;
        var life = settings.life || Utils.getRandomRangeFloat(50, 80);
        var masterScale = new Vector2(settings.particleScale || 1, settings.particleScale || 1);
        var isRemoving = false;
        var spinRate = Utils.getRandomRangeFloat(-0.1, 0.1);

        // --- ENTITY ---
        var confetti = new Entity({
            z: Globals.layers.effects2,
            name: 'confetti',
            position: position.clone(),
            scale: masterScale.clone(),
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
            update: function (data) {
                confetti.rotation += spinRate;
                if (!isRemoving) {
                    life -= data.speed;
                    if (life <= 0) {
                        isRemoving = true;
                        new Tween({
                            from: masterScale,
                            to: new Vector2(0, 0),
                            in: 15,
                            onUpdate: function (v, t) {
                                masterScale = v;
                            },
                            onComplete: function () {
                                confetti.removeSelf();
                            }
                        });
                    }
                }

                // move
                velocity.y += gravity * data.speed;
                confetti.position.addTo(velocity.scalarMultiply(data.speed));
                velocity.scalarMultiplyWith(1 - ((1 - friction) * data.speed));

                // flip
                confetti.scale.y = masterScale.y;
                confetti.scale.x = Math.sin(confetti.timer / (this.rotationSpeed + 5)) * masterScale.x;
            }
        });
        Bento.objects.attach(confetti);
        return confetti;
    };
});