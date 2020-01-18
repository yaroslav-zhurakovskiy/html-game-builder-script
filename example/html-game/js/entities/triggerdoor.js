/**
 * Module description
 * @moduleName TriggerDoor
 * @snippet TriggerDoor.snippet
TriggerDoor({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/triggerdoor', [
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
    'components/spritecontainer',
    'globals',
    'components/mask',
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
    SpriteContainer,
    Globals,
    Mask,
    Particle
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var isOpen = Utils.isDefined(settings.isOpen) ? settings.isOpen : false;
        var directionString = settings.directionString || 'right';
        var position = settings.position;
        var triggerId = (settings.chunkId || "chunk-NULL") + "-" + (settings.triggerId || "0");
        var extraWidthPieces = Utils.isDefined(settings.extraWidthPieces) ? settings.extraWidthPieces : 1;

        // --- VARS ---
        var totalWidth = ((2 + extraWidthPieces) * 16);
        var totalOffset = isOpen ? (directionString === 'left' ? totalWidth : -totalWidth) : 0;

        // --- FUNCTIONS ---
        var toggle = function () {
            if (isOpen) {
                isOpen = false;
                if (directionString === 'right') {
                    new Tween({
                        from: totalOffset,
                        to: 0,
                        in: 60,
                        ease: 'easeInOutQuad',
                        onUpdate: function (v, t) {
                            totalOffset = v;
                            entity.boundingBox.width = Math.round(totalWidth + totalOffset);
                        }
                    });
                } else {
                    new Tween({
                        from: totalOffset,
                        to: 0,
                        in: 60,
                        ease: 'easeInOutQuad',
                        onUpdate: function (v, t) {
                            totalOffset = v;
                            entity.boundingBox.x = Math.round(totalWidth * 0.5) - Math.round(totalWidth - totalOffset);
                            entity.boundingBox.width = Math.round(totalWidth - totalOffset);
                        }
                    });
                }
            } else {
                isOpen = true;
                if (directionString === 'right') {
                    new Tween({
                        from: totalOffset,
                        to: -totalWidth,
                        in: 60,
                        ease: 'easeInOutQuad',
                        onUpdate: function (v, t) {
                            totalOffset = v;
                            entity.boundingBox.width = Math.round(totalWidth + totalOffset);
                        }
                    });
                } else {
                    new Tween({
                        from: totalOffset,
                        to: totalWidth,
                        in: 60,
                        ease: 'easeInOutQuad',
                        onUpdate: function (v, t) {
                            totalOffset = v;
                            entity.boundingBox.x = Math.round(totalWidth * 0.5) - Math.round(totalWidth - totalOffset);
                            entity.boundingBox.width = Math.round(totalWidth - totalOffset);
                        }
                    });
                }
            }
        };

        var onTrigger = function (thisTriggerId) {
            if (thisTriggerId !== triggerId) {
                //this isn't for us, ignore
                return;
            }
            toggle();
        };

        // --- COMPONENTS ---
        var doorwaySpriteContainer = new SpriteContainer({
            imageName: 'doorway',
            position: new Vector2(totalWidth * (directionString === 'right' ? -0.5 : 0.5), Globals.pixelScale),
            originRelative: new Vector2(1, 0.5),
            scale: new Vector2(Globals.pixelScale * (directionString === 'right' ? 1 : -1), Globals.pixelScale)
        });
        var spriteContainer = new SpriteContainer({
            imageName: 'door',
            frameCountX: 3,
            frameCountY: 1,
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(Globals.pixelScale, Globals.pixelScale),
            animations: {
                default: {
                    speed: 0,
                    frames: [0, 1, 2]
                }
            }
        });
        spriteContainer.attach(new Mask({
            // reference to rectangle, coordinates relative to entity's space
            rectangle: new Rectangle(-(totalWidth * 0.5), -8, totalWidth, 16),
            // reference to sprite, may be several entities deeper
            sprite: spriteContainer.sprite
        }));

        var behaviourComponent = {
            name: "behaviourComponent",
            start: function () {
                EventSystem.on('buttonTriggered', onTrigger);
            },
            destroy: function () {
                EventSystem.off('buttonTriggered', onTrigger);
            }
        };

        var renderBehaviour = {
            name: "renderBehaviour",
            draw: function (data) {
                spriteContainer.position = new Vector2(-(totalWidth * 0.5) + 8 + totalOffset, 0);
                spriteContainer.sprite.setFrame((directionString === 'right') ? 1 : 0);
                spriteContainer.draw(data);
                spriteContainer.position.x += 16;

                spriteContainer.sprite.setFrame(1);
                for (var i = 0; i < extraWidthPieces; i++) {
                    spriteContainer.draw(data);
                    spriteContainer.position.x += 16;
                }

                spriteContainer.sprite.setFrame((directionString === 'right') ? 2 : 1);
                spriteContainer.draw(data);

                if (Globals.debug) {
                    var bb = entity.boundingBox;
                    data.renderer.fillRect([1, 0.5, 0, 0.5], bb.x, bb.y, bb.width, bb.height);
                }
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active2,
            name: 'triggerDoor',
            family: ['triggerdoors', 'solids'],
            position: settings.position,
            updateWhenPaused: 0,
            boundingBox: isOpen ? new Rectangle((directionString === 'right') ? -totalWidth * 0.5 : totalWidth * 0.5, -7, 0, 15) : new Rectangle(-totalWidth * 0.5, -7, totalWidth, 15),
            float: false,
            components: [
                spriteContainer,
                behaviourComponent,
                renderBehaviour,
                doorwaySpriteContainer
            ]
        }).extend({
            break: function (other) {
                entity.remove(renderBehaviour);
                new Particle({
                    z: Globals.layers.effects,
                    sprite: renderBehaviour,
                    position: entity.position,
                    rotation: 0,
                    rotationRate: (entity.position.x - other.getHeadPosition().x) * 0.0025,
                    velocity: new Vector2((entity.position.x - other.getHeadPosition().x) * 0.05, -2),
                    acceleration: new Vector2(0, 0.1)
                });
                entity.removeSelf();
            }
        });
        return entity;
    };
});