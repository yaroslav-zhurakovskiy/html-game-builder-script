/**
 * Module description
 * @moduleName EnemyTutorialTrigger
 * @snippet EnemyTutorialTrigger.snippet
EnemyTutorialTrigger({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/enemytutorialtrigger', [
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
    'ui/enemytutorialscreen'
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
    EnemyTutorial
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
                            new EnemyTutorial({
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
            name: 'enemyTutorialTrigger',
            position: position,
            boundingBox: settings.boundingBox,
            components: [
                behaviour
            ]
        });
        return entity;
    };
});