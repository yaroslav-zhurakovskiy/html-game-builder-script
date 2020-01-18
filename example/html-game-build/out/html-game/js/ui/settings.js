/**
 * Module description
 * @moduleName SettingsScreen
 * @snippet SettingsScreen.snippet
SettingsScreen({})
 */
bento.define('ui/settings', [
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
    'bento/components/nineslice',
    'components/spritecontainer',
    'components/sortedclickable',
    'bento/components/fill',
    'ui/cointracker',
    'bento/gui/scrollinglist',
    'components/mask',
    'modules/skinmanager',
    'ui/potslot',
    'modules/localization',
    'modules/savemanager',
    'modules/taptic',
    'modules/store',
    'ui/iapoverlay',
    'ui/credits',
    'components/backbutton'
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
    NineSlice,
    SpriteContainer,
    SortedClickable,
    Fill,
    CoinTracker,
    ScrollingList,
    Mask,
    SkinManager,
    PotSlot,
    Localization,
    SaveManager,
    TapticEngine,
    Store,
    IapOverlay,
    Credits,
    BackButton
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var canClose = true;
        var openStatus = 'closed';
        var panelPosition = new Vector2(-88, viewport.height * 0.5);
        var panelWidth = 160;
        var panelHeight = viewport.height + 10;

        // --- FUNCTIONS ---
        var open = function () {
            if (openStatus === 'closed') {
                // move to front
                if (entity && entity.parent) {
                    entity.parent.moveComponentTo(entity, entity.components.length + 100);
                }
                openStatus = 'moving';
                new Tween({
                    from: backgroundOverlay.alpha,
                    to: 0.22,
                    in: 30,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        backgroundOverlay.alpha = v;
                    }
                });
                new Tween({
                    from: detailsPanel.position.y,
                    to: viewport.height + 32,
                    in: 15,
                    delay: 10,
                    ease: 'easeOutBack',
                    onUpdate: function (v, t) {
                        detailsPanel.position.y = v;
                    }
                });
                new Tween({
                    from: panelPosition.x,
                    to: 72,
                    in: 15,
                    delay: 10,
                    ease: 'easeOutExpo',
                    onUpdate: function (v, t) {
                        panelPosition.x = v;
                    },
                    onComplete: function () {
                        openStatus = 'open';
                    }
                });
            }
        };

        var close = function () {
            if (!canClose) {
                return;
            }
            if (openStatus === 'open') {
                openStatus = 'moving';
                new Tween({
                    from: backgroundOverlay.alpha,
                    to: 0,
                    in: 15,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        backgroundOverlay.alpha = v;
                    }
                });
                new Tween({
                    from: detailsPanel.position.y,
                    to: viewport.height + 96,
                    in: 15,
                    ease: 'easeInBack',
                    onUpdate: function (v, t) {
                        detailsPanel.position.y = v;
                    }
                });
                new Tween({
                    from: panelPosition.x,
                    to: -88,
                    in: 15,
                    ease: 'easeOutQuad',
                    onUpdate: function (v, t) {
                        panelPosition.x = v;
                    },
                    onComplete: function () {
                        openStatus = 'closed';
                    }
                });
            }
        };

        // --- COMPONENTS ---
        // dark background
        var backgroundOverlay = new Entity({
            name: 'backgroundOverlay',
            alpha: 0,
            boundingBox: new Rectangle(0, 0, viewport.width, viewport.height),
            components: [
                new Fill({
                    dimension: new Rectangle(0, 0, viewport.width, viewport.height),
                    color: [25 / 255, 6 / 255, 51 / 255, 1]
                }), {
                    name: 'hideBehaviour',
                    update: function () {
                        this.parent.visible = (openStatus !== 'closed');
                    }
                },
                new SortedClickable({
                    onClick: function () {
                        close();
                    }
                })
            ]
        });

        // main panel
        var backgroundNineSlice = new Entity({
            name: 'backgroundNineSlice',
            position: panelPosition,
            scale: Globals.pixelScaleUIV,
            dimension: new Rectangle(0, 0, 1024, panelHeight),
            components: [
                new SortedClickable({}), {
                    name: 'hideBehaviour',
                    update: function () {
                        this.parent.visible = (openStatus !== 'closed');
                    }
                },
                new NineSlice({
                    imageName: 'ui/9slices/tabs',
                    originRelative: new Vector2(0.5, 0.5),
                    width: panelWidth / Globals.pixelScaleUI,
                    height: panelHeight / Globals.pixelScaleUI
                })
            ]
        });

        // mute sound
        var muteSoundIcon = new SpriteContainer({
            imageName: 'ui/icons/sound-' + (Bento.saveState.load('muteSound', false) ? 'off' : 'on'),
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV,
        });
        var muteSoundButton = new ClickButton({
            name: 'muteSoundButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.6, 1.2)),
            sort: true,
            onClick: function () {
                Bento.saveState.save('muteSound', !Bento.saveState.load('muteSound', false));
                Bento.audio.muteSound(Bento.saveState.load('muteSound', false));
                muteSoundIcon.sprite.setup({
                    imageName: 'ui/icons/sound-' + (Bento.saveState.load('muteSound', false) ? 'off' : 'on')
                });
            }
        });
        var muteSoundText = new Text({
            fontSettings: Utils.getTextStyle('settingsMenu'),
            name: 'muteSoundText',
            position: new Vector2(24, 0),
            text: Localization.getText('muteSound'),
            maxWidth: 80,
            maxHeight: 32
        });
        var muteSound = new Entity({
            name: 'muteSound',
            position: new Vector2(-44, -96),
            components: [
                muteSoundButton,
                muteSoundIcon,
                muteSoundText
            ]
        });

        // mute music
        var muteMusicIcon = new SpriteContainer({
            imageName: 'ui/icons/music-' + (Bento.saveState.load('muteMusic', false) ? 'off' : 'on'),
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV,
        });
        var muteMusicButton = new ClickButton({
            name: 'muteMusicButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.6, 1.2)),
            sort: true,
            onClick: function () {
                Bento.saveState.save('muteMusic', !Bento.saveState.load('muteMusic', false));
                Bento.audio.muteMusic(Bento.saveState.load('muteMusic', false));
                muteMusicIcon.sprite.setup({
                    imageName: 'ui/icons/music-' + (Bento.saveState.load('muteMusic', false) ? 'off' : 'on')
                });
                if (!Bento.saveState.load('muteMusic', false)) {
                    Bento.audio.stopSound('music/bgm_gameplay_loop');
                    Bento.audio.playSound('music/bgm_gameplay_loop', true);
                }
            }
        });
        var muteMusicText = new Text({
            fontSettings: Utils.getTextStyle('settingsMenu'),
            name: 'muteMusicText',
            position: new Vector2(24, 0),
            text: Localization.getText('muteMusic'),
            maxWidth: 80,
            maxHeight: 32
        });
        var muteMusic = new Entity({
            name: 'muteMusic',
            position: new Vector2(-44, -52),
            components: [
                muteMusicButton,
                muteMusicIcon,
                muteMusicText
            ]
        });

        // mute haptics
        var muteHapticsIcon = new SpriteContainer({
            imageName: 'ui/icons/haptics-' + (Bento.saveState.load('muteHaptics', false) ? 'off' : 'on'),
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV,
        });
        var muteHapticsButton = new ClickButton({
            name: 'muteHapticsButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.6, 1.2)),
            sort: true,
            onClick: function () {
                Bento.saveState.save('muteHaptics', !Bento.saveState.load('muteHaptics', false));
                muteHapticsIcon.sprite.setup({
                    imageName: 'ui/icons/haptics-' + (Bento.saveState.load('muteHaptics', false) ? 'off' : 'on')
                });
            }
        });
        var hapticsText = new Text({
            fontSettings: Utils.getTextStyle('settingsMenu'),
            name: 'hapticsText',
            position: new Vector2(24, 0),
            text: Localization.getText('haptics'),
            maxWidth: 80,
            maxHeight: 32
        });
        var muteHaptics = new Entity({
            name: 'muteHaptics',
            position: new Vector2(-44, -8),
            components: [
                muteHapticsButton,
                muteHapticsIcon,
                hapticsText
            ]
        });

        // purchases
        var purchasesIcon = new SpriteContainer({
            imageName: 'ui/icons/purchases',
            position: new Vector2(-1, 1),
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV,
        });
        var purchasesButton = new ClickButton({
            name: 'purchasesButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.6, 1.2)),
            sort: true,
            onClick: function () {
                IapOverlay.restore({
                    z: Globals.layers.iapoverlay,
                    fontSettings: Utils.getTextStyle('iapOverlay'),
                });
            }
        });
        var purchasesText = new Text({
            fontSettings: Utils.getTextStyle('settingsMenu'),
            name: 'purchasesText',
            position: new Vector2(24, 0),
            text: Localization.getText('restore'),
            maxWidth: 80,
            maxHeight: 32
        });
        var purchases = new Entity({
            name: 'purchases',
            position: new Vector2(-44, 36),
            components: [
                purchasesButton,
                purchasesIcon,
                purchasesText
            ]
        });

        // credits
        var creditsIcon = new SpriteContainer({
            imageName: 'ui/icons/credits',
            position: new Vector2(0, 0),
            originRelative: new Vector2(0.5, 0.5),
            scale: Globals.pixelScaleUIV,
        });
        var creditsButton = new ClickButton({
            name: 'creditsButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(0.6, 1.2)),
            sort: true,
            onClick: function () {
                new Credits({});
            }
        });
        var creditsText = new Text({
            fontSettings: Utils.getTextStyle('settingsMenu'),
            name: 'purchasesText',
            position: new Vector2(24, 0),
            text: Localization.getText('credits'),
            maxWidth: 80,
            maxHeight: 32
        });
        var credits = new Entity({
            name: 'credits',
            position: new Vector2(-44, 80),
            components: [
                creditsButton,
                creditsIcon,
                creditsText
            ]
        });

        var mainPanel = new Entity({
            name: 'mainPanel',
            position: panelPosition,
            components: [{
                    name: 'hideBehaviour',
                    update: function () {
                        this.parent.visible = (openStatus !== 'closed');
                    }
                },
                new Entity({
                    name: 'nineslice',
                    position: new Vector2(0, 0),
                    scale: Globals.pixelScaleUIV,
                    components: [
                        new NineSlice({
                            imageName: 'ui/9slices/tabs-inner',
                            originRelative: new Vector2(0.5, 0.5),
                            width: (panelWidth - 8) / Globals.pixelScaleUI,
                            height: (panelHeight - 8) / Globals.pixelScaleUI
                        })
                    ]
                }),
                muteSound,
                muteMusic,
                muteHaptics,
                purchases,
                credits
            ]
        });

        //details panel
        var okayButton = new ClickButton({
            name: 'okayButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(340, 0),
            scale: new Vector2(0.75, 1.2).divide(new Vector2(Math.max(1, viewport.width / 180), 1)),
            sort: true,
            onClick: function () {
                close();
            }
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/tick',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            alpha: 1,
            scale: new Vector2(0.5 / 0.375, 0.5 / 0.6),
            rotation: 0
        })).attach({
            name: 'activeBehaviour',
            update: function () {
                okayButton.alpha = (okayButton.active) ? 1 : 0.33;
            }
        }).attach(new BackButton({
            onPressed: function (data) {
                close();
            }
        }));

        var detailsMain = new Entity({
            name: 'detailsMain',
            position: new Vector2(0, -320),
            components: [
                okayButton
            ]
        });

        var detailsPanel = new Entity({
            name: 'detailsPanel',
            position: new Vector2(viewport.width * 0.5, viewport.height + 96),
            scale: Globals.pixelScaleV.multiply(new Vector2(Math.max(1, viewport.width / 180), 1)),
            boundingBox: new Rectangle(-525, -493, 1050, 986),
            components: [{
                    name: 'hideBehaviour',
                    update: function () {
                        this.parent.visible = (openStatus !== 'closed');
                    }
                },
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(1, 1),
                    rotation: Math.PI * 0.5
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(-1, 1),
                    rotation: Math.PI * 0.5
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(-1, -1),
                    rotation: Math.PI * 0.5
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: new Vector2(1, -1),
                    rotation: Math.PI * 0.5
                }),
                detailsMain
            ]
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.mainMenu,
            name: 'potSelector',
            float: true,
            components: [
                backgroundOverlay,
                backgroundNineSlice,
                mainPanel,
                detailsPanel
            ]
        }).extend({
            getOpenStatus: function () {
                return openStatus;
            },
            open: open
        });

        return entity;
    };
});