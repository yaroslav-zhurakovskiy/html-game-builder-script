/**
 * Component description
 * @moduleName Movable
 * @snippet Movable.snippet
Movable({
    velocity: new Vector2(0, 0)
})
 */
bento.define('components/movable', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween
) {
    'use strict';
    return function (settings) {
        var entity;
        var onCollision = settings.onCollision || function () {};
        var stopOnCollide = Utils.isDefined(settings.stopOnCollide) ? settings.stopOnCollide : true;
        var doCollide = Utils.isDefined(settings.doCollide) ? settings.doCollide : true;
        var ignore = settings.ignore || [];
        var enabled = Utils.isDefined(settings.enabled) ? settings.enabled : true;
        var canCollideWith = settings.canCollideWith || ['solids'];
        var component = {
            name: 'movableBehaviour',
            velocity: settings.velocity || new Vector2(0, 0),
            lastVelocity: new Vector2(0, 0),
            update: function (data) {
                if (!enabled) {
                    return;
                }
                component.lastVelocity = component.velocity.clone();

                var solids = [];
                Utils.forEach(component.canCollideWith, function (family, i, l, breakLoop) {
                    var list = Bento.objects.getByFamily(family);
                    Utils.forEach(list, function (item, ii, ll, breakLoop2) {
                        if (item && item.visible) {
                            solids.push(item);
                        }
                    });
                });
                var didCollide = false;
                var collisionData = {
                    entities: [],
                    velocity: component.velocity.clone(),
                    moved: new Vector2(0, 0)
                };

                var moveX = function () {
                    if (component.velocity.x === 0) {
                        return;
                    }
                    entity.position.x += component.velocity.x * data.speed;
                    if (doCollide) {
                        entity.collidesWith({
                            entities: solids,
                            firstOnly: true,
                            onCollide: function (other) {
                                var safe = true;
                                Utils.forEach(component.ignore, function (item, i, l, breakLoop) {
                                    if (typeof item === "string") {
                                        Utils.forEach(Bento.objects.getByFamily(item), function (ent, ii, ll, breakLoop2) {
                                            if (other.id === ent.id) {
                                                safe = false;
                                                breakLoop();
                                            }
                                        });
                                    } else {
                                        if (item && other.id === item.id) {
                                            safe = false;
                                            breakLoop();
                                        }
                                    }
                                });
                                if (!safe || entity.id === other.id) {
                                    return;
                                }
                                var BB = entity.getBoundingBox();
                                var otherBB = other.getBoundingBox();
                                var deltaX = (BB.getCenter().x > otherBB.getCenter().x) ? (BB.x - otherBB.getX2()) : (BB.getX2() - otherBB.x);
                                entity.position.x -= deltaX;
                                collisionData.moved.x = deltaX;
                                if (stopOnCollide) {
                                    component.velocity.x = 0;
                                }
                                collisionData.entities.push(other);
                                didCollide = true;
                            }
                        });
                    }
                };
                var moveY = function () {
                    if (component.velocity.y === 0) {
                        return;
                    }
                    entity.position.y += component.velocity.y * data.speed;
                    if (doCollide) {
                        entity.collidesWith({
                            entities: solids,
                            firstOnly: true,
                            onCollide: function (other) {
                                var safe = true;
                                Utils.forEach(component.ignore, function (item, i, l, breakLoop) {
                                    if (typeof item === "string") {
                                        Utils.forEach(Bento.objects.getByFamily(item), function (ent, ii, ll, breakLoop2) {
                                            if (other.id === ent.id) {
                                                safe = false;
                                                breakLoop();
                                            }
                                        });
                                    } else {
                                        if (item && other.id === item.id) {
                                            safe = false;
                                            breakLoop();
                                        }
                                    }
                                });
                                if (!safe || entity.id === other.id) {
                                    return;
                                }
                                var BB = entity.getBoundingBox();
                                var otherBB = other.getBoundingBox();
                                var deltaY = (BB.getCenter().y > otherBB.getCenter().y) ? (BB.y - otherBB.getY2()) : (BB.getY2() - otherBB.y);
                                entity.position.y -= deltaY;
                                collisionData.moved.y = deltaY;
                                if (stopOnCollide) {
                                    component.velocity.y = 0;
                                }
                                collisionData.entities.push(other);
                                didCollide = true;
                            }
                        });
                    }
                };

                if (Math.abs(component.velocity.x) > Math.abs(component.velocity.y)) {
                    moveX();
                    moveY();
                } else {
                    moveY();
                    moveX();
                }

                if (didCollide) {
                    onCollision(collisionData);
                }
            },
            ignore: ignore.slice(),
            canCollideWith: canCollideWith.slice(),
            setEnabled: function (newEnabled) {
                enabled = newEnabled;
            },
            attached: function (data) {
                entity = data.entity;
            }
        };
        return component;
    };
});