/**
 * Module description
 * @moduleName Culler
 * @snippet Culler.snippet
Culler({
    position: new Vector2(0, 0)
})
 */
bento.define('components/culler', [
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
        var h = settings.height || 0;
        var camera;
        var e;
        return {
            name: "cullerBehaviour",
            attached: function () {
                e = this.parent;
            },
            update: function (data) {
                if (!camera) {
                    camera = Bento.objects.get('camera');
                }
                var viewportScaled = camera.getUnscaledViewport();
                e.visible = ((e.position.y + h) > viewportScaled.y) && ((e.position.y - h) < viewportScaled.y + viewportScaled.height);
            }
        };
    };
});