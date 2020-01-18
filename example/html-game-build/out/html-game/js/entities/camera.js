/**
 * A Basic Camera Entity
 * @moduleName Camera
 * @snippet Camera.snippet
Camera({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/camera', [
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
        var targetPosition = settings.position || new Vector2(0, 0);
        var targetEntity = settings.targetEntity;

        // --- ZOOM
        //scales the view PREUPDATE
        var renderer = Bento.getRenderer();
        var camera;
        var viewScale = settings.viewScale || 0.88;
        var hitFreezeTimer = 0;
        var revertSpeed = 1;
        var hitFrozen = false;
        var preDrawScaler = {
            z: Globals.layers.preupdate,
            name: "preDrawScaler",
            start: function () {
                camera = Bento.objects.get('camera');
            },
            update: function () {
                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
            },
            draw: function (data) {
                if (!camera) {
                    return;
                }

                renderer.save();

                //correct translation
                renderer.translate(
                    viewport.width * ((1 - (1 / viewScale)) / 2),
                    viewport.height * ((1 - (1 / viewScale)) / 2)
                );

                //scale view
                renderer.scale(1 / viewScale, 1 / viewScale);
            }
        };

        //Scales the camera back just before the GUI
        var postDrawScaler = {
            z: Globals.layers.postupdate,
            name: "postDrawScaler",
            draw: function (data) {
                if (!camera) {
                    return;
                }
                //restore the context
                renderer.restore();
            }
        };

        // --- SHAKE
        var viewShake = 0;
        var shakeDecay = 0.85;
        var shakeOffset = new Vector2(0, 0);
        var doShake = function () {
            if (viewShake > 0) {
                shakeOffset = new Vector2(Utils.getRandomFloat(viewShake), 0).rotateDegree(Utils.getRandomFloat(360));
            }
            viewShake *= shakeDecay;
        };

        // --- BEHAVIOUR
        var doMove = true;
        var behavior = {
            name: 'behaviorComponent',
            start: function () {
                if (!preDrawScaler.attached) {
                    Bento.objects.attach(preDrawScaler);
                }
                if (!postDrawScaler.attached) {
                    Bento.objects.attach(postDrawScaler);
                }
            },
            update: function (data) {
                if (targetEntity && targetEntity.position) {
                    targetPosition = targetEntity.position.clone();
                }

                if (hitFreezeTimer) {
                    hitFreezeTimer--;
                    Bento.setGameSpeed(0);
                    hitFrozen = true;
                } else {
                    if (hitFrozen) {
                        Bento.setGameSpeed(revertSpeed);
                        hitFrozen = false;
                    }
                    revertSpeed = Bento.getGameSpeed();
                }

                // add shake
                doShake();

                if (doMove) {
                    entity.position.x += Utils.clamp(-10, ((targetPosition.x + shakeOffset.x) - entity.position.x) * 0.075 * data.speed, 10);
                    entity.position.y += Utils.clamp(-10, ((targetPosition.y + shakeOffset.y) - entity.position.y) * 0.075 * data.speed, 10);
                }
                viewport.x = entity.position.x - (viewport.width * 0.5);
                viewport.y = entity.position.y - (viewport.height * 0.5);
            }
        };

        var entity = new Entity({
            z: settings.z || 0,
            name: 'camera',
            family: ['cameras'],
            position: targetPosition,
            updateWhenPaused: 0,
            float: false,
            components: [
                behavior
            ]
        }).extend({
            setDoMove: function (newDoMove) {
                doMove = newDoMove;
            },
            shake: function (shakePercent) {
                viewShake += shakePercent * 0.5;
            },
            hitFreeze: function (ticks) {
                hitFreezeTimer = Math.max(ticks, hitFreezeTimer);
            },
            setViewScale: function (newViewScale) {
                var viewMiddle = new Vector2(viewport.x + (viewport.width / 2), viewport.y + (viewport.height / 2));
                viewScale = newViewScale;
            },
            getTargetPosition: function () {
                return targetPosition;
            },
            getViewScale: function () {
                return viewScale;
            },
            getUnscaledViewport: function (overrideRect) {
                var rect = viewport;
                if (overrideRect) {
                    rect = overrideRect;
                }
                var scaledPos = this.toUnscaledWorldSpace(new Vector2(rect.x, rect.y));
                return new Rectangle(scaledPos.x, scaledPos.y, rect.width * viewScale, rect.height * viewScale);
            },
            setTargetEntity: function (newTargetEntity) {
                targetEntity = newTargetEntity;
            },
            setTargetPosition: function (newTargetPosition) {
                targetEntity = null;
                targetPosition = newTargetPosition.clone();
            },
            toScaledWorldSpace: function (Vector) {
                var viewMiddle = new Vector2(viewport.x + (viewport.width / 2), viewport.y + (viewport.height / 2));
                return Vector.subtract(viewMiddle.clone()).scalarMultiply(1 / viewScale).add(viewMiddle.clone());
            },
            toUnscaledWorldSpace: function (Vector) {
                var viewMiddle = new Vector2(viewport.x + (viewport.width / 2), viewport.y + (viewport.height / 2));
                return Vector.subtract(viewMiddle.clone()).scalarMultiply(viewScale).add(viewMiddle.clone());
            },
        });
        Utils.forEach(settings.components || [], function (component, i, l, breakLoop) {
            entity.attach(component);
        });
        return entity;
    };
});