/**
 * Module description
 * @moduleName PotSelector
 * @snippet PotSelector.snippet
PotSelector({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/potselector', [
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
    BackButton
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
        var panelPosition = new Vector2(-88, viewport.height * 0.5);
        var panelWidth = 160;
        var panelHeight = viewport.height + 10;
        var player = Bento.objects.get('player');
        var coinCount = SaveManager.load('coinCount');

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
                new Tween({
                    from: quickTabs.position.x,
                    to: quickTabPos.x,
                    in: 10,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        quickTabs.position.x = v;
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
                new Tween({
                    from: quickTabs.position.x,
                    to: quickTabPos.x - 128,
                    in: 10,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        quickTabs.position.x = v;
                    }
                });
            }
        };

        var hideTab = function () {
            if (tabVisible) {
                tabVisible = false;
                new Tween({
                    from: tabEntity.position.x,
                    to: -80,
                    in: 15,
                    ease: 'easeInBack',
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
                    to: 14,
                    in: 15,
                    ease: 'easeOutBack',
                    onUpdate: function (v, t) {
                        tabEntity.position.x = v;
                    }
                });
            }
        };

        // --- COMPONENTS ---
        var updateBadge = function (count) {
            var price = SkinManager.getLowestPotSkinCost();
            alertBadge.visible = Utils.isDefined(price) ? (count >= price) : false;
            tabBadge.visible = Utils.isDefined(price) ? (count >= price) : false;
        };
        var alertBadge = new SpriteContainer({
            imageName: 'ui/icons/alertbadge',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(150, -80),
            alpha: 1,
            scale: new Vector2(1, 1),
            rotation: 0
        }).attach({
            name: 'badgeEventListener',
            update: function (data) {
                data.entity.scale.x = 1.1 + Math.sin(entity.ticker * 0.05 + Math.PI) * 0.1;
                data.entity.scale.y = data.entity.scale.x;
                updateBadge(SaveManager.load('coinCount'));
            }
        });
        var tabBadge = new SpriteContainer({
            imageName: 'ui/icons/alertbadge',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(90, -64),
            alpha: 1,
            scale: new Vector2(1, 1),
            rotation: 0
        }).attach({
            name: 'badgeEventListener',
            update: function (data) {
                data.entity.scale.x = 1 + Math.sin(entity.ticker * 0.1 + Math.PI) * 0.2;
                data.entity.scale.y = data.entity.scale.x;
                updateBadge(SaveManager.load('coinCount'));
            }
        });
        updateBadge(SaveManager.load('coinCount'));


        var tabUnlockedCount = new Text({
            fontSettings: Utils.getTextStyle('tabUnlockedCountTextLeft'),
            position: new Vector2(-3, -1.5),
            text: SkinManager.getAllUnlockedPotSkins().length,
            maxWidth: 48,
            maxHeight: 16
        });
        var tabUnlockedBar = Bento.assets.getImage('ui/tab-progressbar-filled');
        var tabUnlockedCounter = new Entity({
            name: 'tabUnlockedCounter',
            position: new Vector2(32, 128),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV)
        }).extend({
            total: SkinManager.getAllPotSkins().length,
            count: SkinManager.getAllUnlockedPotSkins().length,
            updateCount: function () {
                tabUnlockedCounter.count = SkinManager.getAllUnlockedPotSkins().length;
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
            text: ' / ' + SkinManager.getAllPotSkins().length,
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
            position: new Vector2(14, viewport.height * 0.66),
            scale: Globals.pixelScaleUIV,
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 320,
                    height: 320
                }),
                tabFG, {
                    name: 'hideBehaviour',
                    update: function () {
                        this.parent.visible = (openStatus !== 'open');
                    }
                },
                new SpriteContainer({
                    imageName: 'ui/icons/pots',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(32, -30)
                }),
                new Text({
                    fontSettings: Utils.getTextStyle('tabTitle'),
                    position: new Vector2(32, 64),
                    text: Localization.getText('pots'),
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

        var coinYPos = 0;
        var vidYPos = 0;
        var levelYPos = 0;

        var scrollTo = function (yPos) {
            var container = list.getComponent('container');
            new Tween({
                from: container.position.y,
                to: -yPos - (panelHeight * 0.5) + 20,
                in: 30,
                ease: 'easeOutExpo',
                onUpdate: function (v, t) {
                    container.position.y = v;
                }
            });
        };

        var unlockedTabFG = new Entity({
            name: 'unlockedTabFG',
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs_pressed',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 200,
                    height: 200
                })
            ]
        });
        unlockedTabFG.visible = false;

        var vidsTabFG = new Entity({
            name: 'vidsTabFG',
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs_pressed',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 200,
                    height: 200
                })
            ]
        });
        vidsTabFG.visible = false;

        var coinTabFG = new Entity({
            name: 'coinTabFG',
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs_pressed',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 200,
                    height: 200
                })
            ]
        });
        coinTabFG.visible = false;

        var levelTabFG = new Entity({
            name: 'levelTabFG',
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs_pressed',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 200,
                    height: 200
                })
            ]
        });
        levelTabFG.visible = false;

        var quickTabPos = new Vector2((panelWidth * 0.5) / Globals.pixelScaleUI, 0);
        var quickTabs = new Entity({
            name: 'quickTabs',
            position: quickTabPos.clone().add(new Vector2(-128, 0)),
            components: [
                new Entity({
                    name: 'vidsTab',
                    position: new Vector2(48, ((panelHeight * 0.5) - 156) / Globals.pixelScaleUI),
                    components: [
                        new NineSlice({
                            imageName: 'ui/9slices/tabs',
                            originRelative: new Vector2(0.5, 0.5),
                            width: 200,
                            height: 200
                        }),
                        vidsTabFG,
                        new SpriteContainer({
                            imageName: 'ui/icons/pots',
                            position: new Vector2(8, 0),
                            originRelative: new Vector2(0.5, 0.5),
                            scale: new Vector2(0.7, 0.7)
                        }),
                        new Text({
                            fontSettings: Utils.getTextStyle('tabTitle'),
                            position: new Vector2(8, 64),
                            text: Localization.getText('free'),
                            scale: new Vector2(1 / Globals.pixelScaleUI, 1 / Globals.pixelScaleUI),
                            maxWidth: 24,
                            maxHeight: 8
                        }),
                        new SortedClickable({
                            onPressed: function () {
                                vidsTabFG.visible = true;
                            },
                            onClick: function () {
                                scrollTo(vidYPos);
                                Bento.audio.playSound('sfx_clickbutton');
                            },
                            onRelease: function () {
                                vidsTabFG.visible = false;
                            }
                        })
                    ]
                }),
                new Entity({
                    name: 'coinTab',
                    position: new Vector2(48, ((panelHeight * 0.5) - 118) / Globals.pixelScaleUI),
                    components: [
                        new NineSlice({
                            imageName: 'ui/9slices/tabs',
                            originRelative: new Vector2(0.5, 0.5),
                            width: 200,
                            height: 200
                        }),
                        coinTabFG,
                        new SpriteContainer({
                            imageName: 'ui/icons/pots-coins',
                            position: new Vector2(8, 0),
                            originRelative: new Vector2(0.5, 0.5),
                            scale: new Vector2(1.1, 1.1)
                        }),
                        new SortedClickable({
                            onPressed: function () {
                                coinTabFG.visible = true;
                            },
                            onClick: function () {
                                scrollTo(coinYPos);
                                Bento.audio.playSound('sfx_clickbutton');
                            },
                            onRelease: function () {
                                coinTabFG.visible = false;
                            }
                        }),
                        tabBadge
                    ]
                }),
                new Entity({
                    name: 'levelTab',
                    position: new Vector2(48, ((panelHeight * 0.5) - 80) / Globals.pixelScaleUI),
                    components: [
                        new NineSlice({
                            imageName: 'ui/9slices/tabs',
                            originRelative: new Vector2(0.5, 0.5),
                            width: 200,
                            height: 200
                        }),
                        levelTabFG,
                        new SpriteContainer({
                            imageName: 'ui/icons/pots-level',
                            position: new Vector2(8, 0),
                            originRelative: new Vector2(0.5, 0.5),
                            scale: new Vector2(1.1, 1.1)
                        }),
                        new SortedClickable({
                            onPressed: function () {
                                levelTabFG.visible = true;
                            },
                            onClick: function () {
                                scrollTo(levelYPos);
                                Bento.audio.playSound('sfx_clickbutton');
                            },
                            onRelease: function () {
                                levelTabFG.visible = false;
                            }
                        })
                    ]
                })
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
                }),
                quickTabs
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
            return (list.didMove(4));
        };
        // list items
        var items = [];
        var itemOffset = new Vector2(-48, 4);
        var focusIndex = 0;
        var focusEntity = null;
        var focusIndicator = new Entity({
            name: 'focusIndicator',
            position: new Vector2(0, 0),
            components: [
                new SpriteContainer({
                    imageName: 'ui/selected',
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
            name: 'listAnchor',
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
                    imageName: 'ui/char-back-unlocked2',
                    originRelative: new Vector2(0.5, 0.5),
                    position: new Vector2(0, 0),
                    scale: Globals.pixelScaleUIV
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
            getState: function () {
                return 'unlocked';
            },
            getSkin: function () {
                return 'random';
            }
        });

        var purchaseText = new Text({
            fontSettings: Utils.getTextStyle('growingTitleText'),
            position: new Vector2(0, 0),
            text: Localization.getText('coinPots'),
            antiAlias: true,
            maxWidth: 64,
            maxHeight: 16
        });

        var levelText = new Text({
            fontSettings: Utils.getTextStyle('growingTitleText'),
            position: new Vector2(0, 0),
            text: Localization.getText('levelPots'),
            antiAlias: true,
            maxWidth: 64,
            maxHeight: 16
        });

        var adText = new Text({
            fontSettings: Utils.getTextStyle('growingTitleText'),
            position: new Vector2(0, 0),
            text: Localization.getText('freePots'),
            antiAlias: true,
            maxWidth: 64,
            maxHeight: 16
        });

        var generateSlots = function () {
            //reset slots
            for (var i = items.length - 1; i >= 0; i--) {
                var item = items[i];
                listAnchor.remove(item);
            }
            items = [];

            //reset startY
            var thisYOffset = 20;

            // items.push(shuffleButton);
            // listAnchor.attach(shuffleButton);

            var adPots = SkinManager.getAllPotSkins().slice().filter(function (potSkin) {
                return SkinManager.getPotSkinUnlockMethod(potSkin).method === 'ad';
            });

            listAnchor.remove(adText);
            if (adPots.length > 0) {
                adText.position = itemOffset.add(new Vector2(48, thisYOffset - 34));
                listAnchor.attach(adText);
            }

            Utils.forEach(adPots, function (skin, i, l, breakLoop) {
                var index = items.length;
                var slotPosition = new Vector2((i % 3) * 48, (Math.floor(i / 3) * 48) + thisYOffset);
                var slot = new PotSlot({
                    index: index,
                    position: itemOffset.add(slotPosition),
                    skin: skin,
                    isScrolling: isScrolling,
                    onClick: function () {
                        changeFocus(index);
                    },
                    onStateChanged: function (newState) {
                        if (newState === 'unlocked') {
                            generateSlots();
                            focusSkin(skin);
                        }
                    }
                });
                listAnchor.attach(slot);
                items.push(slot);
            });
            vidYPos = thisYOffset - 30;
            thisYOffset += (Math.floor((adPots.length - 1) / 3) * 48) + 72;

            var purchasePots = SkinManager.getAllPotSkins().slice().filter(function (potSkin) {
                return SkinManager.getPotSkinUnlockMethod(potSkin).method === 'coins';
            });

            listAnchor.remove(purchaseText);
            if (purchasePots.length > 0) {
                purchaseText.position = itemOffset.add(new Vector2(48, thisYOffset - 34));
                listAnchor.attach(purchaseText);
            }

            Utils.forEach(purchasePots, function (skin, i, l, breakLoop) {
                var index = items.length;
                var slotPosition = new Vector2((i % 3) * 48, (Math.floor(i / 3) * 48) + thisYOffset);
                var slot = new PotSlot({
                    index: index,
                    position: itemOffset.add(slotPosition),
                    skin: skin,
                    isScrolling: isScrolling,
                    onClick: function () {
                        changeFocus(index);
                    },
                    onStateChanged: function (newState) {
                        if (newState === 'unlocked') {
                            generateSlots();
                            focusSkin(skin);
                        }
                    }
                });
                listAnchor.attach(slot);
                items.push(slot);
            });
            coinYPos = thisYOffset - 30;
            thisYOffset += (Math.floor((purchasePots.length - 1) / 3) * 48) + 72;


            // add locked items by column for each unlock method
            var levelPots = SkinManager.getAllPotSkins().slice().filter(function (potSkin) {
                return SkinManager.getPotSkinUnlockMethod(potSkin).method === 'level';
            });

            listAnchor.remove(levelText);
            if (levelPots.length > 0) {
                levelText.position = itemOffset.add(new Vector2(48, thisYOffset - 34));
                listAnchor.attach(levelText);
            }

            Utils.forEach(levelPots, function (skin, i, l, breakLoop) {
                var index = items.length;
                var slotPosition = new Vector2((i % 3) * 48, (Math.floor(i / 3) * 48) + thisYOffset);
                var slot = new PotSlot({
                    index: index,
                    position: itemOffset.add(slotPosition),
                    skin: skin,
                    isScrolling: isScrolling,
                    onClick: function () {
                        changeFocus(index);
                    },
                    onStateChanged: function (newState) {
                        if (newState === 'unlocked') {
                            generateSlots();
                            focusSkin(skin);
                        }
                    }
                });
                listAnchor.attach(slot);
                items.push(slot);
            });
            levelYPos = thisYOffset - 30;
            thisYOffset += (Math.floor((levelPots.length - 1) / 3) * 48) + 72;

            listAnchor.remove(focusIndicator);
            listAnchor.attach(focusIndicator);

            // apply stuff to the list
            var listYLength = thisYOffset - 96;
            list.setMaxOffset(listYLength - ((panelHeight - 8) * 0.5) + (panelHeight - 140));
            Mask.applyToContainer(list, new Rectangle(-(panelWidth - 8) * 0.5, -(panelHeight - 8) * 0.5, (panelWidth - 8), (panelHeight - 8)));
            unlockedCount.setText(SkinManager.getAllUnlockedPotSkins().length);
            tabUnlockedCounter.updateCount();
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
                    in: 8,
                    ease: 'easeOutQuad',
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
                potName.setText(Localization.getText(skinName + ((skinName === 'random') ? "" : "-pot")));
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
            SkinManager.setCurrentPotSkin(skin);
            if (!player) {
                player = Bento.objects.get('player');
            }
            if (player) {
                player.setPotSkin(SkinManager.getCurrentPotSkin());
            }
        };

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
                            imageName: 'ui/icons/pots',
                            originRelative: new Vector2(0.5, 0.5),
                            position: new Vector2(-36, 35),
                            scale: new Vector2(-0.05, 0.05)
                        }),
                        new SpriteContainer({
                            imageName: 'ui/icons/pots',
                            originRelative: new Vector2(0.5, 0.5),
                            position: new Vector2(36, 35),
                            scale: new Vector2(0.05, 0.05)
                        }),
                        new Text({
                            fontSettings: Utils.getTextStyle('skinSelectorTitle'),
                            position: new Vector2(0, 35),
                            text: Localization.getText('choosePot'),
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
            text: SkinManager.getAllUnlockedPotSkins().length,
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
            text: Localization.getText('potsUnlocked'),
            maxWidth: 40,
            maxHeight: 16
        })).attach(new Text({
            fontSettings: Utils.getTextStyle('lockedCountText'),
            position: new Vector2(-24, 48),
            scale: new Vector2(1, 1).divide(Globals.pixelScaleUIV),
            text: ' / ' + SkinManager.getAllPotSkins().length,
            maxWidth: 24,
            maxHeight: 10
        })).attach(unlockedCount);

        var potName = new Text({
            fontSettings: Utils.getTextStyle('nameTitle'),
            position: new Vector2(0, 0),
            scale: new Vector2(1 / Math.max(1, viewport.width / 180), 1).divide(Globals.pixelScaleV),
            text: "",
            maxWidth: 64,
            maxHeight: 32
        });

        var detailsMain = new Entity({
            name: 'detailsMain',
            position: new Vector2(0, -320),
            components: [
                potName,
                okayButton,
                unlockedBackground
            ]
        });

        var tutorialMain = new Entity({
            name: 'tutorialText',
            position: new Vector2(0, -320),
            components: [
                new Text({
                    fontSettings: Utils.getTextStyle('nameTitle'),
                    position: new Vector2(0, 0),
                    scale: new Vector2(1, 1).divide(Globals.pixelScaleV),
                    text: Localization.getText('pickAPresent'),
                    maxWidth: 128,
                    maxHeight: 20
                })
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
            name: 'potSelector',
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
            setTutorial: function (newDoTutorial) {
                if (newDoTutorial) {
                    detailsPanel.remove(detailsMain);
                    detailsPanel.attach(tutorialMain);
                } else {
                    detailsPanel.attach(detailsMain);
                    detailsMain.alpha = 0;
                    new Tween({
                        from: 0,
                        to: 1,
                        in: 30,
                        ease: 'linear',
                        onStart: function () {},
                        onUpdate: function (v, t) {
                            detailsMain.alpha = v;
                            tutorialMain.alpha = 1 - v;
                        },
                        onComplete: function () {
                            detailsPanel.remove(tutorialMain);
                        }
                    });
                }
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
            scrollToBuyPots: function () {
                scrollTo(coinYPos);
            },
            hideTab: hideTab,
            showTab: showTab,
            focusSkin: focusSkin
        });

        generateSlots();
        focusSkin(SkinManager.getCurrentPotSkin(true));

        return entity;
    };
});