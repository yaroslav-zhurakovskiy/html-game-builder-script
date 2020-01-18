/**
 * Module description
 * @moduleName Solid
 * @snippet Solid.snippet
Solid({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/solid', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/utils',
    'globals'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    Utils,
    Globals
) {
    'use strict';
    return function (settings) {
        // --- PARAMETERS ---
        var camera = Bento.objects.get('camera');
        var position = settings.position;

        // --- COMPONENTS ---
        var behaviour = {
            name: "behaviourComponent",
            update: function () {
                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                var viewportScaled = camera.getUnscaledViewport();
                entity.visible = (entity.visible && entity.collidesWith({
                    name: 'player',
                    offset: new Vector2(0, -1),
                    firstOnly: true,
                })) || entity.position.y < (viewportScaled.y + viewportScaled.height + 5);
            },
            draw: function (data) {
                if (Globals.debug) {
                    var bb = entity.boundingBox;
                    data.renderer.fillRect([1, 0, 0, 0.5], bb.x, bb.y, bb.width, bb.height);
                }
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active,
            name: 'solid',
            family: ['solids'],
            visible: true,
            position: position,
            boundingBox: settings.boundingBox || new Rectangle(0, 0, 16, 16),
            components: [
                behaviour
            ]
        });
        return entity;
    };
});