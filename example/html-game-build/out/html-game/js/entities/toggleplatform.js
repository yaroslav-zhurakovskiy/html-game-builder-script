/**
 * Module description
 * @moduleName TogglePlatform
 * @snippet TogglePlatform.snippet
TogglePlatform({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/toggleplatform', [
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
    'components/movable'
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
    Movable
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var position = settings.position;
        var extraWidthPieces = Utils.isDefined(settings.extraWidthPieces) ? settings.extraWidthPieces : 1;
        var deleteOffscreen = Utils.isDefined(settings.deleteOffscreen) ? settings.deleteOffscreen : true;
        var doToggle = true;
        var startOffset = settings.startOffset || 0;
        var toggleTicks = startOffset;
        var toggleTime = settings.toggleTime || 90;

        // --- VARS ---
        var totalWidth = ((2 + extraWidthPieces) * 16);

        var isSolid = false;
        var toggle = function () {
            isSolid = !isSolid;
            if (isSolid) {
                pieceSpriteContainer.alpha = 1;
                entity.boundingBox = new Rectangle(-totalWidth * 0.5, -8, totalWidth, 16);
                var player = Bento.objects.get('player');
                if (player) {
                    if (entity.collidesWith({
                            rectangle: player.getHeadBoundingBox()
                        })) {
                        player.die();
                    }
                }
            } else {
                pieceSpriteContainer.alpha = 0.5;
                entity.boundingBox = new Rectangle(-1000, 0, 1, 1);
            }
        };

        // --- COMPONENTS
        var pieceSpriteContainer = new SpriteContainer({
            imageName: 'platformMoving',
            frameCountX: 3,
            frameCountY: 1,
            originRelative: new Vector2(0.5, 0.5),
            animations: {
                default: {
                    speed: 0,
                    frames: [0, 1, 2]
                }
            }
        });
        var behaviour = {
            name: "behaviourComponent",
            update: function (data) {
                var stoodOnBy = entity.collidesWith({
                    name: 'player',
                    offset: new Vector2(0, -1),
                    firstOnly: true,
                });
                if (deleteOffscreen && (entity.position.y + entity.boundingBox.y) > (viewport.y + viewport.height)) {
                    if (!stoodOnBy) {
                        entity.removeSelf();
                    }
                }
                if (stoodOnBy) {
                    doToggle = false;
                }
                if (doToggle) {
                    toggleTicks -= data.speed;
                    if (toggleTicks <= 0) {
                        toggle();
                        toggleTicks = toggleTime;
                    }
                }
            },
            draw: function (data) {
                data.renderer.translate(viewport.x, viewport.y);
                pieceSpriteContainer.position = new Vector2(-(totalWidth * 0.5) + 8, 0);
                pieceSpriteContainer.sprite.setFrame(0);
                pieceSpriteContainer.draw(data);
                pieceSpriteContainer.position.x += 16;

                pieceSpriteContainer.sprite.setFrame(1);
                for (var i = 0; i < extraWidthPieces; i++) {
                    pieceSpriteContainer.draw(data);
                    pieceSpriteContainer.position.x += 16;
                }

                pieceSpriteContainer.sprite.setFrame(2);
                pieceSpriteContainer.draw(data);
                data.renderer.translate(-viewport.x, -viewport.y);

                if (Globals.debug) {
                    var bb = entity.boundingBox;
                    data.renderer.fillRect([1, 0, 0, 0.5], bb.x, bb.y, bb.width, bb.height);
                }
            }
        };


        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active2,
            name: 'movingplatform',
            family: ['solids'],
            position: position,
            updateWhenPaused: 0,
            boundingBox: new Rectangle(-totalWidth * 0.5, -8, totalWidth, 16),
            float: false,
            components: [
                behaviour
            ]
        });
        return entity;
    };
});