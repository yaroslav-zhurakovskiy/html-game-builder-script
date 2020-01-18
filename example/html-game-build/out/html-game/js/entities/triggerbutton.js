/**
 * Module description
 * @moduleName TriggerButton
 * @snippet TriggerButton.snippet
TriggerButton({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/triggerbutton', [
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
    'components/spritecontainer',
    'components/culler'
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
    SpriteContainer,
    Culler
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var directionString = settings.directionString || 'up';
        var position = settings.position;
        var triggerId = (settings.chunkId || "chunk-NULL") + "-" + (settings.triggerId || "0");

        // --- VARS ---
        var isTriggered = false;

        // --- FUNCTIONS ---
        var trigger = function () {
            isTriggered = true;
            spriteContainer.sprite.setAnimation('down');
            EventSystem.fire('buttonTriggered', triggerId);
            var camera = Bento.objects.get('camera');
            if (camera) {
                camera.shake(30);
                camera.hitFreeze(4);
            }
            Bento.audio.playSound('sfx_triggerbutton');
        };
        var untrigger = function () {
            isTriggered = false;
            spriteContainer.sprite.setAnimation('up');
            EventSystem.fire('buttonUntriggered', triggerId);
        };

        // --- COMPONENTS ---
        var spriteContainer = new SpriteContainer({
            spriteSheet: 'button_' + directionString,
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale)
        });
        var behaviour = {
            name: "behaviourComponent",
            update: function () {
                var player = Bento.objects.get('player');
                if (player && !isTriggered) {
                    entity.collidesWith({
                        entity: player,
                        onCollide: trigger
                    });
                    entity.collidesWith({
                        rectangle: player.getHeadBoundingBox(),
                        onCollide: trigger
                    });
                }
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.tiles2,
            name: 'button',
            family: ['buttons'],
            position: position,
            boundingBox: new Rectangle(-4, -4, 8, 8),
            components: [
                behaviour,
                spriteContainer,
                new Culler({
                    height: 8
                }), {
                    name: "debugdraw",
                    draw: function (data) {
                        if (Globals.debug) {
                            var bb = entity.boundingBox;
                            data.renderer.fillRect([1, 0, 1, 0.5], bb.x, bb.y, bb.width, bb.height);
                        }
                    }
                }
            ]
        });
        return entity;
    };
});