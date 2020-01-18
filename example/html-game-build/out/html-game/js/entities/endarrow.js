/**
 * Module description
 * @moduleName ModuleName
 * @snippet ModuleName.snippet
ModuleName({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/endarrow', [
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
    'modules/skinmanager',
    'modules/savemanager',
    'entities/particle',
    'entities/effects/confettiburst',
    'entities/effects/confettistring'
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
    SkinManager,
    SaveManager,
    Particle,
    ConfettiBurst,
    ConfettiString
) {
    'use strict';
    return function (settings) {
        var background;
        var plantSkins = SkinManager.getAllLockedPlantSkins();
        var isBean = (SaveManager.load('superProgress') >= Globals.superProgressSegments - 1 && plantSkins.length > 0) || (!SaveManager.load('hasInitialBean') && SaveManager.load('superProgress') === 2);
        var position = settings.position;
        var beanSprite = new SpriteContainer({
            spriteSheet: 'beans/' + (plantSkins[0] || 'daisy'),
            position: new Vector2(0, 44),
            scale: Globals.pixelScaleV.scalarMultiply(4)
        });
        var spriteContainer = new SpriteContainer({
            imageName: 'arrow',
            originRelative: new Vector2(0.5, 0)
        });
        var behavior = {
            name: 'behaviorComponent',
            update: function (data) {
                if (!background) {
                    background = Bento.objects.get('background');
                }
                spriteContainer.position.y = ((isBean) ? 72 : 0) + Math.abs(Math.sin(entity.timer * 0.125) * 30);
            },
            onWin: function () {
                if (isBean) {
                    Bento.audio.playSound('sfx_candy_1');
                    beanSprite.visible = false;
                    new Particle({
                        z: Globals.layers.effects,
                        spriteSheet: 'effects/coin',
                        position: entity.position.clone().add(new Vector2(0, 8)),
                        alpha: 1,
                        scale: Globals.pixelScaleV.scalarMultiply(2),
                        rotation: 0,
                        velocity: new Vector2(0, 0),
                        gravity: 0.05
                    });
                    new Tween({ in: 8,
                        onComplete: function () {
                            new Particle({
                                z: Globals.layers.tiles - 1,
                                imageName: 'ui/fx/bloom-halo',
                                position: entity.position.clone().add(new Vector2(0, 8)),
                                scale: Globals.pixelScaleV.scalarMultiply(0.4),
                                removeAfterTime: 30,
                                originRelative: new Vector2(0.5, 0.5),
                                removeEffect: 'scalefade'
                            });
                        }
                    });
                } else {
                    new Particle({
                        z: Globals.layers.effects,
                        spriteSheet: 'effects/coin',
                        position: entity.position.clone(),
                        alpha: 1,
                        scale: Globals.pixelScaleV.scalarMultiply(2),
                        rotation: 0,
                        velocity: new Vector2(0, 0),
                        gravity: 0.05
                    });
                    new Particle({
                        z: Globals.layers.effects2,
                        imageName: 'ui/fx/bloom-halo',
                        position: entity.position.clone(),
                        scale: Globals.pixelScaleV.scalarMultiply(0.4),
                        removeAfterTime: 30,
                        originRelative: new Vector2(0.5, 0.5),
                        removeEffect: 'scalefade'
                    });
                }
                if (background) {
                    background.flash();
                }
                for (var i = 10 - 1; i >= 0; i--) {
                    new ConfettiString({
                        position: entity.position.add(new Vector2(Utils.getRandomRangeFloat(-8, 8), Utils.getRandomRangeFloat(-4, 4))),
                        velocity: new Vector2(0, Utils.getRandomRange(-2, -5)).rotateDegree(Utils.getRandomRangeFloat(90, 270)),
                        friction: 0.95
                    });

                }
                for (var i = 30 - 1; i >= 0; i--) {
                    new ConfettiBurst({
                        position: entity.position.add(new Vector2(Utils.getRandomRangeFloat(-8, 8), Utils.getRandomRangeFloat(-4, 4))),
                        velocity: new Vector2(Utils.getRandomRangeFloat(-4, 4), Utils.getRandomRangeFloat(0, 2)),
                        friction: 0.95,
                        particleScale: 0.04 + Utils.getRandomFloat(0.03)
                    });
                }
            }
        };
        var entity = new Entity({
            z: Globals.layers.active - 0.1,
            name: 'endarrow',
            position: position,
            boundingBox: new Rectangle(-30, 0, 60, 60),
            updateWhenPaused: 0,
            float: false,
            scale: Globals.pixelScaleV,
            components: [
                spriteContainer,
                (isBean) ? beanSprite : {
                    name: 'blank'
                },
                behavior
            ]
        }).extend({
            onWin: behavior.onWin
        });
        return entity;
    };
});