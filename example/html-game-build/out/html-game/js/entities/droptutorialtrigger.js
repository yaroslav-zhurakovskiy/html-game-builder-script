/**
 * Module description
 * @moduleName DropTutorialTrigger
 * @snippet DropTutorialTrigger.snippet
DropTutorialTrigger({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/droptutorialtrigger', [
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
    'ui/droptutorialscreen'
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
    DropTutorial
) {
    'use strict';
    return function (settings) {
        var position = settings.position;
        var behaviour = {
            name: "behaviour",
            update: function () {
                var player = Bento.objects.get('player');
                if (player) {
                    entity.collidesWith({
                        rectangle: player.getHeadBoundingBox(),
                        firstOnly: true, // onCollide stops after having found single collision 
                        onCollide: function (other) {
                            new DropTutorial({
                                player: player
                            });
                            entity.removeSelf();
                        }
                    });
                }
            }
        };
        var entity = new Entity({
            z: 0,
            name: 'dropTutorialTrigger',
            position: position,
            boundingBox: settings.boundingBox,
            components: [
                behaviour
            ]
        });
        return entity;
    };
});