/**
 * Module description
 * @moduleName VipTestDrive
 * @snippet VipTestDrive.snippet
VipTestDrive({
    onYes: function () {},
    onNo: function () {},
})
 */
bento.define('ui/viptestdrivedialog', [
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
    'ui/dialog',
    'modules/localization',
    'globals',
    'components/spritecontainer',
    'modules/skinmanager',
    'entities/particle',
    'ui/vipdialog',
    'modules/savemanager',
    'modules/ads'
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
    Dialog,
    Localization,
    Globals,
    SpriteContainer,
    SkinManager,
    Particle,
    VipDialog,
    SaveManager,
    Ads
) {
    'use strict';
    return function (settings) {
        var complete = false;
        var viewport = Bento.getViewport();
        var vipPlants = [];

        if (!SaveManager.load('doneKingPlantTrial')) {
            vipPlants.push('kingplant');
        }
        if (!SaveManager.load('doneCalciTrial')) {
            vipPlants.push('calci');
        }
        if (!SaveManager.load('doneGrowBotTrial')) {
            vipPlants.push('growbot');
        }
        if (!SaveManager.load('doneGizmoTrial')) {
            vipPlants.push('gizmo');
        }
        if (!SaveManager.load('doneGojiTrial')) {
            vipPlants.push('goji');
        }


        if (vipPlants.length === 0) {
            return new VipDialog({});
        }

        // --- PARAMETERS ---
        var thisSkin = vipPlants[Utils.getRandom(vipPlants.length)];
        var onYesCallback = settings.onYes || function () {};
        var onNoCallback = settings.onNo || function () {};

        // --- FUNCTIONS ---
        var onNo = function () {
            onNoCallback();
        };
        var onYes = function () {
            dialog.close();
            switch (thisSkin) {
            case 'kingplant':
                SaveManager.save('doneKingPlantTrial', true);
                break;
            case 'calci':
                SaveManager.save('doneCalciTrial', true);
                break;
            case 'growbot':
                SaveManager.save('doneGrowBotTrial', true);
                break;
            case 'gizmo':
                SaveManager.save('doneGizmoTrial', true);
                break;
            case 'goji':
                SaveManager.save('doneGojiTrial', true);
                break;
            }
            Bento.objects.get('player', function (player) {
                player.setPlantSkin(thisSkin);
            });
            new Tween({ in: 15,
                onComplete: function () {
                    onYesCallback(thisSkin);
                }
            });
        };

        // --- COMPONENTS ---
        var bloomHard = new SpriteContainer({
            imageName: 'ui/fx/bloom-hard',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, -16),
            scale: new Vector2(0, 0)
        });
        var bloomHalo = new SpriteContainer({
            imageName: 'ui/fx/bloom-halo',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, -16),
            scale: new Vector2(0, 0),
            alpha: 0.6
        });

        var tryButton = new ClickButton({
            name: 'adButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 64),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.6),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                if (!complete) {
                    if (Utils.isDev()) {
                        window.alert("This is a Rewarded Ad!");
                        Bento.input.resetPointers();
                        Globals.attemptsSinceAd = 0;
                        onYes();
                    } else {
                        complete = true;
                        Ads.showRewarded(function () {
                            EventSystem.fire('GameAnalytics-addDesignEvent', {
                                eventId: "ads:tryVipPopup",
                                value: 1
                            });
                            Globals.attemptsSinceAd = 0;
                            onYes();
                        }, function (e) {}, "TryVipPopup");
                    }
                }
            },
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/vid2',
            position: new Vector2(-84, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.5, 0.5),
            rotation: -0.25
        })).attach(new SpriteContainer({
            imageName: 'ui/icons/crown',
            position: new Vector2(-40, -60),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.875, 0.875),
            rotation: 0.4
        })).attach(new Text({
            position: new Vector2(70, 7),
            scale: new Vector2(0.5, 0.5).scalarMultiply(1 / Globals.pixelScaleUI),
            maxWidth: 56,
            text: Localization.getText('tryoutX').replace('{PLANT}', Localization.getText(thisSkin + '-plant')),
            fontSettings: Utils.getTextStyle('dialogTitle'),
            fontSize: 16,
            fontColor: '#fbffbe',
            align: 'center',
            textBaseline: 'middle',
            linebreaks: true
        }));

        var closeButton = new ClickButton({
            name: 'closeButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(72, -64),
            scale: new Vector2(Globals.pixelScaleUI * 0.5, Globals.pixelScaleUI * 1),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                if (complete) {
                    return;
                }
                complete = true;
                dialog.close();
            },
        });
        closeButton.attach(new SpriteContainer({
            imageName: 'ui/icons/close',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(1 / closeButton.scale.x, 1 / closeButton.scale.y).multiply(Globals.pixelScaleUIV).scalarMultiply(0.8)
        }));

        var mainRoot = new Entity({
            name: 'mainRoot',
            components: [
                bloomHard,
                bloomHalo,
                new SpriteContainer({
                    imageName: 'ui/vip/vip_gang_' + thisSkin,
                    originRelative: new Vector2(0.5, 0.66),
                    position: new Vector2(0, -8),
                    alpha: 1,
                    scale: Globals.pixelScaleV.scalarMultiply((thisSkin === 'kingplant') ? 1 : 1.25)
                }).attach({
                    name: 'wobbleSparkleBehaviour',
                    update: function () {
                        var p = this.parent;
                        p.rotation = Math.sin((p.timer) * 0.03) * 0.17;
                        p.position.y = -8 + Math.sin((p.timer) * 0.021) * 4;
                        if (Utils.getRandom(15) === 1) {
                            mainRoot.attach(new Particle({
                                imageName: 'sparkle',
                                originRelative: new Vector2(0.5, 0.5),
                                position: new Vector2(Utils.getRandomFloat(32), 0).rotateDegree(Utils.getRandomFloat(360)).add(new Vector2(0, -8)),
                                alpha: 1,
                                scale: Globals.pixelScaleV.scalarMultiply(1.5),
                                rotation: Utils.getRandomRangeFloat(0, Math.PI * 2),
                                rotationRate: 0,
                                velocity: new Vector2(Utils.getRandomRangeFloat(-0.1, 0.1), Utils.getRandomRangeFloat(-0.1, 0.1)),
                                acceleration: new Vector2(0, 0),
                                friction: 1,
                                removeAfterTime: 60,
                                removeEffect: 'scale',
                                dontAttach: true,
                                z: Globals.layers.modals + 0.1
                            }));
                        }
                    }
                }),
                new Text({
                    position: new Vector2(0, 32),
                    scale: new Vector2(1, 1),
                    maxWidth: 128,
                    text: Localization.getText('specialAbility') + Localization.getText(thisSkin + '-power'),
                    fontSettings: Utils.getTextStyle('vipTestDriveSubtitle'),
                    fontSize: 16,
                    fontColor: '#fbffbe',
                    align: 'center',
                    textBaseline: 'middle',
                    linebreaks: true
                }),
                tryButton,
                closeButton
            ]
        });



        // --- ENTITY ---
        var dialog = new Dialog({
            titleText: Localization.getText('trykingplant'),
            type: 'none',
            components: [mainRoot]
        });

        //animations
        // bloom halo burst outwards
        new Tween({
            from: 0,
            to: 1,
            in: 30,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                bloomHalo.scale.x = bloomHalo.scale.y = 0.25 * v;
                bloomHalo.alpha = (1 - v) * 0.6;
            },
        });

        // bloom grow and shrink
        new Tween({
            from: 0,
            to: 0.15,
            in: 30,
            ease: 'easeOutQuad',
            onUpdate: function (v, t) {
                bloomHard.scale.x = v;
                bloomHard.scale.y = v;
            },
            onComplete: function () {
                new Tween({
                    from: 0.15,
                    to: 0.125,
                    in: 60,
                    ease: 'easeInOutCubic',
                    onUpdate: function (v, t) {
                        bloomHard.scale.x = v;
                        bloomHard.scale.y = v;
                    },
                    onComplete: function () {
                        dialog.showButtons();
                    }
                });
            }
        });

        return dialog;
    };
});