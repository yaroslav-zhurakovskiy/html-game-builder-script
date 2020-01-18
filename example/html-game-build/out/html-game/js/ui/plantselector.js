/**
 * Module description
 * @moduleName PlantSelector
 * @snippet PlantSelector.snippet
PlantSelector({})
 */
bento.define('ui/plantselector', [
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
    'modules/localization',
    'ui/vipui',
    'modules/vipmanager',
    'components/backbutton',
    'ui/plantslot',
    'ui/beanslot'
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
    Localization,
    VipUI,
    VipManager,
    BackButton,
    PlantSlot,
    BeanSlot
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var onFocusChange = settings.onFocusChange || function () {};

        // --- VARS ---
        var canClose = true;
        var openStatus = 'closed';
        var tabVisible = true;
        var panelPosition = new Vector2(viewport.width + 88, viewport.height * 0.5);
        var panelWidth = 160;
        var panelHeight = viewport.height + 10;
        var player = Bento.objects.get('player');

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
                hideTab();
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
                    to: viewport.width - 72,
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
                showTab();
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
                    to: viewport.width + 88,
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

        var hideTab = function () {
            if (tabVisible) {
                tabVisible = false;
                new Tween({
                    from: tabEntity.position.x,
                    to: viewport.width + 80,
                    in: 15,
                    ease: 'easeInBack',
                    ignoreGameSpeed: true,
                    onUpdate: function (v, t) {
                        tabEntity.position.x = v;
                    }
                });
            }
        };

        var showTab = function () {
            if (!tabVisible) {
                tabVisible = true;
                new Tween({
                    from: tabEntity.position.x,
                    to: viewport.width - 14,
                    in: 15,
                    ease: 'easeOutBack',
                    ignoreGameSpeed: true,
                    onUpdate: function (v, t) {
                        tabEntity.position.x = v;
                    }
                });
            }
        };

        var onVipChanged = function (isVip) {
            generateSlots();
        };

        // --- COMPONENTS ---
        var updateBadge = function () {
            alertBadge.visible = false;
        };
        var alertBadge = new SpriteContainer({
            imageName: 'ui/icons/alertbadge',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-150, -80),
            alpha: 1,
            scale: new Vector2(1, 1),
            rotation: 0
        }).attach({
            name: 'badgeEventListener',
            update: function (data) {
                data.entity.scale.x = 1.1 + Math.sin(entity.ticker * 0.05) * 0.1;
                data.entity.scale.y = data.entity.scale.x;
            }
        });

        var crown = new SpriteContainer({
            imageName: 'ui/icons/crown',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-0, -120),
            scale: new Vector2(1.25, 1.25),
            rotation: 0.2
        }).attach({
            name: 'visibleBehaviour',
            update: function () {
                crown.visible = VipManager.isVip();
            }
        });

        var tabUnlockedCount = new Text({
            fontSettings: Utils.getTextStyle('tabUnlockedCountTextLeft'),
            position: new Vector2(-3, -1.5),
            text: SkinManager.getAllUnlockedPlantSkins().length,
            maxWidth: 48,
            maxHeight: 16
        });
        var tabUnlockedBar = Bento.assets.getImage('ui/tab-progressbar-filled');
        var tabUnlockedCounter = new Entity({
            name: 'tabUnlockedCounter',
            position: new Vector2(-32, 128),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV)
        }).extend({
            total: SkinManager.getAllPlantSkins().length,
            count: SkinManager.getAllUnlockedPlantSkins().length,
            updateCount: function () {
                tabUnlockedCounter.count = SkinManager.getAllUnlockedPlantSkins().length;
                tabUnlockedCount.setText(tabUnlockedCounter.count);
            }
        }).attach(new SpriteContainer({
            imageName: 'ui/tab-progressbar-back',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV
        })).attach({
            name: 'tabUnlockedBar',
            draw: function (data) {
                var r = data.renderer;
                var img = tabUnlockedBar;
                var percentComplete = tabUnlockedCounter.count / tabUnlockedCounter.total;
                r.drawImage(
                    img,
                    0,
                    0,
                    img.width * percentComplete,
                    img.height,
                    img.width * -0.5 * Globals.pixelScaleUI, img.height * -0.5 * Globals.pixelScaleUI,
                    img.width * percentComplete * Globals.pixelScaleUI,
                    img.height * Globals.pixelScaleUI
                );
            }
        }).attach(new Text({
            fontSettings: Utils.getTextStyle('tabUnlockedCountTextRight'),
            position: new Vector2(-3, -1.5),
            text: ' / ' + SkinManager.getAllPlantSkins().length,
            maxWidth: 48,
            maxHeight: 16
        })).attach(tabUnlockedCount);

        var tabFG = new Entity({
            name: 'tabFG',
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs_pressed',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 320,
                    height: 320
                })
            ]
        });
        tabFG.visible = false;
        var tabEntity = new Entity({
            name: 'tabEntity',
            position: new Vector2(viewport.width - 14, viewport.height * 0.66),
            scale: Globals.pixelScaleUIV,
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 320,
                    height: 320
                }), tabFG, {
                    name: 'hideBehaviour',
                    update: function () {
                        this.parent.visible = (openStatus !== 'open');
                    }
                },
                new SpriteContainer({
                    imageName: 'ui/icons/plants',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(-32, -50),
                    scale: new Vector2(0.9, 0.9)
                }),
                crown,
                new Text({
                    fontSettings: Utils.getTextStyle('tabTitle'),
                    position: new Vector2(-32, 64),
                    text: Localization.getText('plants'),
                    scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI),
                    maxWidth: 36,
                    maxHeight: 18
                }),
                tabUnlockedCounter,
                new SortedClickable({
                    onPressed: function () {
                        tabFG.visible = true;
                    },
                    onClick: function () {
                        open();
                        Bento.audio.playSound('sfx_clickbutton');
                    },
                    onRelease: function () {
                        tabFG.visible = false;
                    }
                }),
                alertBadge
            ]
        });

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

        var list = new ScrollingList({
            name: 'list',
            position: new Vector2(0, 32),
            area: new Rectangle(-(panelWidth - 8) * 0.5, -(panelHeight - 8) * 0.5, (panelWidth - 8), (panelHeight - 8)),
            direction: 'y',
            spacing: 0,
            maxOffset: 0,
            minOffset: -(panelHeight - 8) * 0.5 + 26,
            damping: 0.9,
            sort: true
        });
        var isScrolling = function () {
            if (list.active) {
                return list.didMove(8);
            } else {
                return false;
            }
        };
        // list items
        var items = [];
        var itemOffset = new Vector2(-38, 4);
        var focusIndex = 0;
        var focusEntity = null;
        var focusIndicator = new Entity({
            name: 'focusIndicator',
            position: new Vector2(0, 0),
            components: [
                new SpriteContainer({
                    imageName: 'ui/selected-plant',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 0),
                    alpha: 1,
                    scale: Globals.pixelScaleUIV,
                    rotation: 0
                })
            ]
        });

        // these must be added else the list won't scroll
        var listAnchor = new Entity({
            name: 'listAnchor'
        });
        list.addItem(listAnchor);
        var listEnd = new Entity({
            name: 'listEnd'
        });
        list.addItem(listEnd);

        //shuffle button
        var shuffleButton = new Entity({
            name: 'shuffleButton',
            position: itemOffset,
            boundingBox: new Rectangle(-22, -22, 44, 44),
            components: [
                new SpriteContainer({
                    name: 'buttonSpriteContainer',
                    imageName: 'ui/char-back-unlocked',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 0),
                    scale: Globals.pixelScaleUIV.multiply(new Vector2(1.05, 1))
                }),
                new SpriteContainer({
                    name: 'buttonIcon',
                    imageName: 'ui/icons/random',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, -4),
                    scale: Globals.pixelScaleUIV
                }),
                new Text({
                    fontSettings: Utils.getTextStyle('randomButtonText'),
                    position: new Vector2(0, 10),
                    text: Localization.getText('random')
                }),
                new SortedClickable({
                    onClick: function (data) {
                        if (!isScrolling()) {
                            changeFocus(0);
                        }
                    }
                })
            ]
        }).extend({
            getSkin: function () {
                return 'random';
            }
        });

        var generateSlots = function () {
            //remove old stuff
            var thisYOffset = 0;
            for (var i = items.length - 1; i >= 0; i--) {
                var item = items[i];
                listAnchor.remove(item);
            }
            items = [];
            listAnchor.remove(focusIndicator);

            //attach new stuff
            items.push(shuffleButton);
            listAnchor.attach(shuffleButton);

            if (VipManager.isVip()) {
                Utils.forEach(SkinManager.getAllVipPlantSkins(), function (skin, i, l, breakLoop) {
                    var index = items.length;
                    var slotPosition = new Vector2((index % 2) * 72, Math.floor(index / 2) * 46);
                    var slot = new PlantSlot({
                        index: index,
                        position: itemOffset.add(slotPosition),
                        skin: skin,
                        isScrolling: isScrolling,
                        isVipCharacter: true,
                        plantSelector: entity,
                        onClick: function () {
                            changeFocus(index);
                        }
                    });
                    listAnchor.attach(slot);
                    items.push(slot);
                });
            }

            // add unlocked items
            var unlockedPlants = SkinManager.getAllUnlockedPlantSkins();
            var lockedPlants = SkinManager.getAllNonUnlockedPlantSkins();
            Utils.forEach(unlockedPlants, function (skin, i, l, breakLoop) {
                var index = items.length;
                var slotPosition = new Vector2((index % 2) * 72, Math.floor(index / 2) * 46);
                var slot = new PlantSlot({
                    index: index,
                    position: itemOffset.add(slotPosition),
                    skin: skin,
                    isScrolling: isScrolling,
                    isVipCharacter: false,
                    plantSelector: entity,
                    onClick: function () {
                        changeFocus(index);
                    }
                });
                listAnchor.attach(slot);
                items.push(slot);
            });

            // attach indicator
            listAnchor.attach(focusIndicator);

            //attach bean UI
            Utils.forEach(lockedPlants, function (skin, ii, l, breakLoop) {
                var index = items.length;
                var slotPosition = new Vector2((index % 2) * 72, Math.floor(index / 2) * 46);
                var thisSlot = new BeanSlot({
                    position: itemOffset.add(slotPosition),
                    skin: skin,
                    index: index,
                    isScrolling: isScrolling,
                    onStateChanged: function (skin, newState) {
                        if (newState === 'unlocked') {
                            generateSlots();
                            focusSkin(skin);
                            changeSkin(skin);
                        }
                    }
                });
                items.push(thisSlot);
                listAnchor.attach(thisSlot);
            });
            updateBadge();


            // apply stuff to the list
            var listYLength = (Math.floor((items.length - 1) / 3) * 46);
            list.setMaxOffset(listYLength - ((panelHeight - 8) * 0.5) + (panelHeight - 140) + (viewport.height * 0.5) - 32);
            Mask.applyToContainer(list, new Rectangle(-(panelWidth - 8) * 0.5, -(panelHeight - 8) * 0.5, (panelWidth - 8), (panelHeight - 8)));
            unlockedCount.setText(SkinManager.getAllUnlockedPlantSkins().length);
        };

        var changeFocus = function (index) {
            var oldFocusEntity = items[focusIndex];
            focusIndex = index;
            focusEntity = items[focusIndex];
            if (oldFocusEntity) {
                if (oldFocusEntity.onUnfocus) {
                    oldFocusEntity.onUnfocus();
                }
            }
            if (focusEntity) {
                new Tween({
                    from: focusIndicator.position.clone(),
                    to: focusEntity.position,
                    in: 30,
                    ease: 'easeOutExpo',
                    onUpdate: function (v, t) {
                        focusIndicator.position = v;
                    }
                });
                if (focusEntity.onFocus) {
                    focusEntity.onFocus();
                }
                if (onFocusChange) {
                    onFocusChange(focusEntity);
                }
                var skinName = focusEntity.getSkin();
                plantName.setText(Localization.getText(skinName + ((skinName === 'random') ? "" : "-plant")));
                if (SkinManager.isSkinVIP(focusEntity.getSkin())) {
                    plantName.position.y = -64;
                    plantDescription.setText(Localization.getText(focusEntity.getSkin() + "-power"));
                } else {
                    plantName.position.y = 0;
                    plantDescription.setText("");
                }
            }
        };
        var focusSkin = function (skin) {
            //focus on currently selected skin
            Utils.forEach(items, function (item, i, l, breakLoop) {
                if (item.getSkin && item.getSkin() === skin) {
                    changeFocus(i);
                    breakLoop();
                }
            });
        };

        var changeSkin = function (skin) {
            SkinManager.setCurrentPlantSkin(skin);
            if (!player) {
                player = Bento.objects.get('player');
            }
            if (player) {
                player.setPlantSkin(SkinManager.getCurrentPlantSkin());
            }
        };

        var panelBehaviour = {
            name: 'panelBehaviour',
            start: function () {
                EventSystem.on('onVipChanged', onVipChanged);
            },
            update: function () {
                this.parent.visible = (openStatus !== 'closed');
            },
            destroy: function () {
                EventSystem.off('onVipChanged', onVipChanged);
            },
        };

        var mainPanel = new Entity({
            name: 'mainPanel',
            position: panelPosition,
            components: [
                panelBehaviour,
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
                list,
                new Entity({
                    name: 'nineslicetop',
                    position: new Vector2(0, -panelHeight * 0.5),
                    scale: Globals.pixelScaleUIV,
                    components: [
                        new NineSlice({
                            imageName: 'ui/9slices/tabs-top',
                            originRelative: new Vector2(0.5, 0.5),
                            width: (panelWidth) / Globals.pixelScaleUI,
                            height: 512
                        })
                    ]
                }),
                new Entity({
                    name: 'titleText',
                    position: new Vector2(0, -panelHeight * 0.5),
                    components: [
                        new SpriteContainer({
                            imageName: 'ui/icons/plants',
                            originRelative: new Vector2(0.5, 0.5),
                            position: new Vector2(-36, 35),
                            scale: new Vector2(-0.05, 0.05)
                        }),
                        new SpriteContainer({
                            imageName: 'ui/icons/plants',
                            originRelative: new Vector2(0.5, 0.5),
                            position: new Vector2(36, 35),
                            scale: new Vector2(0.05, 0.05)
                        }),
                        new Text({
                            fontSettings: Utils.getTextStyle('skinSelectorTitle'),
                            position: new Vector2(0, 35),
                            text: Localization.getText('choosePlant'),
                            maxWidth: 64,
                            maxHeight: 10
                        })
                    ]
                })
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
                if (focusEntity) {
                    changeSkin(focusEntity.getSkin());
                }
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
        var unlockedCount = new Text({
            fontSettings: Utils.getTextStyle('unlockedCountText'),
            position: new Vector2(-24, 48),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV),
            text: SkinManager.getAllUnlockedPlantSkins().length,
            maxWidth: 24,
            maxHeight: 10
        });
        var unlockedBackground = new SpriteContainer({
            imageName: 'ui/unlock-count-back',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(-340, 0),
            scale: new Vector2(1, 1).divide(new Vector2(Math.max(1, viewport.width / 180), 1)),
        }).attach(new Text({
            fontSettings: Utils.getTextStyle('unlockedCountTitle'),
            position: new Vector2(0, -56),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV),
            text: Localization.getText('plantsUnlocked'),
            maxWidth: 40,
            maxHeight: 16
        })).attach(new Text({
            fontSettings: Utils.getTextStyle('lockedCountText'),
            position: new Vector2(-24, 48),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV),
            text: ' / ' + SkinManager.getAllPlantSkins().length,
            maxWidth: 24,
            maxHeight: 10
        })).attach(unlockedCount);

        var plantName = new Text({
            fontSettings: Utils.getTextStyle('nameTitle'),
            position: new Vector2(0, 0),
            scale: new Vector2(1 / Math.max(1, viewport.width / 180), 1).divide(Globals.pixelScaleV),
            text: "",
            maxWidth: 68,
            maxHeight: 32
        });

        var plantDescription = new Text({
            fontSettings: Utils.getTextStyle('nameDescription'),
            position: new Vector2(0, 32),
            scale: new Vector2(1 / Math.max(1, viewport.width / 180), 1).divide(Globals.pixelScaleV),
            text: "",
            maxWidth: 68,
            maxHeight: 24
        });

        var detailsMain = new Entity({
            name: 'detailsMain',
            position: new Vector2(0, -320),
            components: [
                plantName,
                plantDescription,
                okayButton,
                unlockedBackground
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
                new SortedClickable({
                    onPressed: function () {
                        list.cancel();
                    }
                }),
                detailsMain
            ]
        });

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.mainMenu,
            name: 'plantSelector',
            float: true,
            components: [
                backgroundOverlay,
                backgroundNineSlice,
                tabEntity,
                mainPanel,
                detailsPanel,
                new CoinTracker({
                    position: new Vector2(viewport.width - 12, 19),
                    playSound: false
                })
            ]
        }).extend({
            changeFocus: changeFocus,
            isScrolling: isScrolling,
            setTutorial: function (newIsTutorial) {
                list.setActive(!newIsTutorial);
            },
            getFocusEntity: function () {
                return focusEntity;
            },
            getItems: function () {
                return items;
            },
            getOpenStatus: function () {
                return openStatus;
            },
            setCanClose: function (newCanClose) {
                canClose = newCanClose;
                okayButton.setActive(newCanClose);
            },
            hideTab: hideTab,
            showTab: showTab,
            focusSkin: focusSkin,
            open: open
        });

        generateSlots();
        focusSkin(SkinManager.getCurrentPlantSkin(true));

        return entity;
    };
});