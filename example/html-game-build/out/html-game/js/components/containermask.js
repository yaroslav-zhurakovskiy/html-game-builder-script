/**
 * Attach this to a ScrollingList's item to mask it
 * @moduleName ContainerMask
 * @snippet ContainerMask|constructor
ContainerMask({
    boundingBox: new Rectangle(-16, -16, 32, 32),
})
 */
bento.define('components/containermask', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'components/mask'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween,
    Mask
) {
    'use strict';

    var MaskBehavior = function (settings) {
        var boundingBox = settings.boundingBox;
        var mask = new Mask({
            sprite: settings.sprite,
            boundingBox: boundingBox
        });
        var entity;
        return {
            name: 'maskBehavior',
            start: function () {

            },
            attached: function (data) {
                entity = data.entity;
                entity.attach(mask);
            },
            removed: function () {
                entity.remove(mask);
            },
            update: function () {}
        };
    };
    var ContainerMask = function (settings) {
        var entity;
        var component = {
            name: 'containerMask',
            start: function () {

            },
            attached: function (data) {
                entity = data.entity;
            }
        };
        return component;
    };
    return ContainerMask;
});