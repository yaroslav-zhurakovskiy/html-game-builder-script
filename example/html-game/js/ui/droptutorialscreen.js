/**
 * Module description
 * @moduleName DropTutorial
 * @snippet DropTutorial.snippet
DropTutorial({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/droptutorialscreen', [
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
    'entities/revivecloud',
    'ui/cutscene',
    'modules/localization'
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
    ReviveCloud,
    Cutscene,
    Localization
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);
        var player = settings.player;
        var timeTween;
        var isHiding = false;

        var hide = function () {
            if (isHiding) {
                return;
            }
            isHiding = true;
            promptCutscene.hide();
            if (timeTween) {
                timeTween.stop();
            }
            timeTween = new Tween({
                from: Bento.getGameSpeed(),
                to: 1,
                in: 15,
                delay: 0,
                ignoreGameSpeed: true,
                ease: 'easeOutQuad',
                onUpdate: function (v, t) {
                    Bento.setGameSpeed(v);
                    entity.alpha = 1 - v;
                },
                onComplete: function () {
                    Bento.setGameSpeed(1);
                    entity.removeSelf();
                }
            });
        };

        var behaviour = {
            name: "tutorialBeahviour",
            start: function () {
                Bento.objects.attach(promptCutscene);
            },
            update: function () {
                if (player) {
                    if (!player.getIsGrowing()) {
                        hide();
                    }
                }
            }
        };

        var promptCutscene = new Cutscene({
            cutsceneStrings: [Localization.getText('bzzt'), Localization.getText('tutorial2')],
            fontSize: 12,
            hideAfter: -1,
            yPos: 96,
            doAttach: false
        });

        var entity = new Entity({
            z: Globals.layers.screens,
            name: 'dropTutorial',
            position: new Vector2(0, 0),
            float: true,
            components: [
                behaviour
            ]
        });

        timeTween = new Tween({
            from: 1,
            to: 0,
            in: 15,
            delay: 0,
            ignoreGameSpeed: true,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                Bento.setGameSpeed(v);
                entity.alpha = 1 - v;
            },
            onComplete: function () {
                Bento.setGameSpeed(0);
            }
        });

        Bento.objects.attach(entity);
        return entity;
    };
});