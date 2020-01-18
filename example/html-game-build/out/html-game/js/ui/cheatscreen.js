/**
 * Module description
 * @moduleName CheatScreen
 * @snippet CheatScreen.snippet
CheatScreen({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/cheatscreen', [
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
    'bento/components/fill',
    'bento/components/modal',
    'modules/skinmanager',
    'modules/savemanager',
    'bento/gui/scrollinglist'
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
    Fill,
    Modal,
    SkinManager,
    SaveManager,
    ScrollingList
) {
    'use strict';
    return function (settings) {

        // --- VARS ---
        var viewport = Bento.getViewport();
        var doRestart = false;

        // --- FUNCTIONS ---
        var hide = function () {
            new Tween({
                from: 1,
                to: 0,
                in: 20,
                ease: 'linear',
                onUpdate: function (v, t) {
                    entity.alpha = v;
                },
                onComplete: function () {
                    entity.removeSelf();
                }
            });
        };
        // --- COMPONENTS ---
        var closeText = new Text({
            position: new Vector2(96, 0),
            text: '<- Close.',
            font: 'font',
            fontSize: 15,
            fontColor: '#ffffff',
            align: 'left',
            textBaseline: 'middle',
            scale: new Vector2(6, 6)
        });
        var closeButton = new ClickButton({
            z: 0,
            name: 'closeButton',
            sfx: '',
            imageName: 'ui/icons/close',
            frameCountX: 1,
            frameCountY: 1,
            position: new Vector2(16, 16),
            rotation: Math.PI * 0.5,
            scale: new Vector2(0.175, 0.175),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                if (doRestart) {
                    Bento.screens.show('screens/main');
                }
                hide();
            }
        }).attach(closeText);


        var hideCounterText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: Globals.showCounters ? 'Hide Counters' : 'Show Counters',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });

        var hideCounters = new ClickButton({
            name: 'hideCounters',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.showCounters = !Globals.showCounters;
                hideCounterText.setText(Globals.showCounters ? 'Hide Counters' : 'Show Counters');
            }
        }).attach(hideCounterText);

        var hideEffectsText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: Globals.showCounters ? 'Hide Effects' : 'Show Effects',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var hideEffects = new ClickButton({
            name: 'hideEffects',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.showEffects = !Globals.showEffects;
                hideEffectsText.setText(Globals.showEffects ? 'Hide Effects' : 'Show Effects');
            }
        }).attach(hideEffectsText);

        var hideCoinsText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: Globals.showCoins ? 'Hide Coins' : 'Show Coins',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var hideCoins = new ClickButton({
            name: 'hideCoins',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.showCoins = !Globals.showCoins;
                hideCoinsText.setText(Globals.showCoins ? 'Hide Coins' : 'Show Coins');
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(hideCoinsText);

        var hideSweetsText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: Globals.showCounters ? 'Hide Sweets' : 'Show Sweets',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var hideSweets = new ClickButton({
            name: 'hideSweets',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.showCandy = !Globals.showCandy;
                hideSweetsText.setText(Globals.showCandy ? 'Hide Sweets' : 'Show Sweets');
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(hideSweetsText);


        var hideEnemiesText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: Globals.showCounters ? 'Hide Enemies' : 'Show Enemies',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var hideEnemies = new ClickButton({
            name: 'hideEnemies',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.showEnemies = !Globals.showEnemies;
                hideEnemiesText.setText(Globals.showEnemies ? 'Hide Enemies' : 'Show Enemies');
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(hideEnemiesText);

        var hideSpikesText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: Globals.showCounters ? 'Hide Spikes' : 'Show Spikes',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var hideSpikes = new ClickButton({
            name: 'hideSpikes',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.showSpikes = !Globals.showSpikes;
                hideSpikesText.setText(Globals.showSpikes ? 'Hide Spikes' : 'Show Spikes');
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(hideSpikesText);


        var hideGUIText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: Globals.showGUI ? 'Hide GUI' : 'Show GUI',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var hideGUI = new ClickButton({
            name: 'hideGUI',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.showGUI = !Globals.showGUI;
                hideGUIText.setText(Globals.showGUI ? 'Hide GUI' : 'Show GUI');
            }
        }).attach(hideGUIText);


        var forceBackgroundSkin = new ClickButton({
            name: 'forceBackgroundSkin',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                //Globals.forcedWorldSkinOffset++;
                var success = function (number) {
                    var thisNum = parseInt(number);
                    if (!isNaN(thisNum)) {
                        if (thisNum > 0) {
                            Globals.forcedWorldSkin = thisNum;
                        } else {
                            Globals.forcedWorldSkin = undefined;
                        }
                    } else {
                        Globals.forcedWorldSkin = undefined;
                    }
                    closeText.setText('<- Close & Apply Changes');
                    doRestart = true;
                };
                Utils.promptText('', 'Index number of skin to force (1-7)', success);
            }
        }).attach(new Text({
            position: new Vector2(0, 0),
            text: 'Select World Skin',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        }));


        var toggleBackgroundText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: 'Toggle Background Color',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var toggleBackground = new ClickButton({
            name: 'toggleBackground',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Globals.useBgColorOveride = !Globals.useBgColorOveride;
            }
        }).attach(toggleBackgroundText);


        var setBackgroundColorText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: 'set background color: ' + Globals.bgColorOveride,
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var setBackgroundColor = new ClickButton({
            name: 'setBackgroundColor',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Utils.promptText('what color background would you like (hex e.g. #000000)', '', function (result) {
                    if (Utils.hexToColor(result)) {
                        Globals.bgColorOveride = result;
                        setBackgroundColorText.setText(Globals.bgColorOveride);
                    }
                });
            }
        }).attach(setBackgroundColorText);


        var setLevel = new ClickButton({
            name: 'forceBackgroundSkin',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                //Globals.forcedWorldSkinOffset++;
                var success = function (number) {
                    var thisNum = parseInt(number);
                    if (!isNaN(thisNum)) {
                        thisNum = Math.max(0, thisNum);
                        if (thisNum > 0) {
                            SaveManager.save('currentLevel', thisNum);
                        }
                    }
                    closeText.setText('<- Close & Apply Changes');
                    doRestart = true;
                };
                Utils.promptText('', 'What Level would you like to go to?', success);
            }
        }).attach(new Text({
            position: new Vector2(0, 0),
            text: 'Set Level',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        }));


        var giveCoinText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: '1000 Coins',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var giveCoins = new ClickButton({
            name: 'forceSkin',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Utils.giveCoins(1000);
            }
        }).attach(giveCoinText);


        var unlockAllPotsText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: 'Unlock All Pots',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var unlockAllPots = new ClickButton({
            name: 'unlockAllPots',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Utils.forEach(SkinManager.getAllPotSkins(), function (potSkin, i, l, breakLoop) {
                    SkinManager.makePotSkinUnlocked(potSkin);
                });
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(unlockAllPotsText);


        var unlockAllSeedsText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: 'Unlock All Seeds',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var unlockAllSeeds = new ClickButton({
            name: 'unlockAllSeeds',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Utils.forEach(SkinManager.getAllLockedPlantSkins().slice(), function (plantSkin, i, l, breakLoop) {
                    SkinManager.makePlantSkinUnlockable(plantSkin);
                });
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(unlockAllSeedsText);


        var unlockAllPlantsText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: 'Unlock All Plants',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var unlockAllPlants = new ClickButton({
            name: 'unlockAllPlants',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Utils.forEach(SkinManager.getAllPlantSkins(), function (plantSkin, i, l, breakLoop) {
                    SkinManager.makePlantSkinUnlocked(plantSkin);
                });
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(unlockAllPlantsText);


        var deleteSaveText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: 'DeleteSave',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var deleteSave = new ClickButton({
            name: 'deleteSave',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                Bento.saveState.clear();
                document.location.reload(); // will 'crash' the game to force a restart

            }
        }).attach(deleteSaveText);


        var abTestText = new Text({
            z: 0,
            position: new Vector2(0, 8),
            text: 'Swap AB Test',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'bottom',
            scale: new Vector2(1.5, 3)
        });
        var abTestStatusText = new Text({
            z: 0,
            position: new Vector2(0, 12),
            text: 'ABNoDrop: ' + SaveManager.load('ABNoDrop'),
            fontSize: 16,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'top',
            scale: new Vector2(1.5, 3)
        });
        var abTestSwap = new ClickButton({
            name: 'abTestSwap',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                //swap AB test
                SaveManager.save('ABNoDrop', !SaveManager.load('ABNoDrop'));
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(abTestText).attach(abTestStatusText);


        var skipTimersText = new Text({
            z: 0,
            position: new Vector2(0, 0),
            text: 'Skip Timers',
            font: 'font',
            fontSize: 30,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'middle',
            scale: new Vector2(1.5, 3)
        });
        var skipTimers = new ClickButton({
            name: 'skipTimers',
            sfx: '',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.multiply(new Vector2(1.4, 0.7)),
            updateWhenPaused: 0,
            float: false,
            onClick: function () {
                SkinManager.lowerAllTimers(10000000000);
                closeText.setText('<- Close & Apply Changes');
                doRestart = true;
            }
        }).attach(skipTimersText);



        var versionNumber = new Text({
            z: 0,
            position: new Vector2(viewport.width * 0.5, viewport.height - 6),
            text: 'v' + window.VERSION + '-' + window.BUILD + '.' + (window.PATCHVERSION || 0) + (Bento.isDev() ? 'DEV' : ''),
            fontSize: 12,
            fontColor: '#ffffff',
            align: 'center',
            textBaseline: 'bottom',
            ySpacing: 0,
            lineWidth: 0, // set to add an outline
            strokeStyle: '#000000',
            innerStroke: false,
            pixelStroke: true, // workaround for Cocoon bug
            antiAlias: true, // Cocoon only
            maxWidth: undefined,
            maxHeight: undefined,
            linebreaks: true,
            drawDebug: false,
            components: []
        });

        var list = new ScrollingList({
            position: new Vector2(viewport.width * 0.5, 16),
            updateWhenPaused: 0,
            area: new Rectangle(0, 0, viewport.width, viewport.height - 32), // area that user can grab
            direction: 'y', // 'x' or 'y'
            spacing: -170, // additional spacing between items
            maxOffset: 0, // additional max scrolling distance
            minOffset: 0, // additional min scrolling distance
            snap: false, // snap items (cancels maxOffset and minOffset)
            snapNextOffset: 0, // distance to scroll to snap to next, in screen pixels. Used with snap:true, best with damping:0
            onSnap: function (item, index) {}, // called when snap focus changed
            onLoseFocus: function (index) {}, // called when snap focus changed
            onScrollStart: function () {}, // callback when scrolling has started
            snapMinSlideSpeed: 1, // minimum slidespeed before starting to snap
            snapSpeed: 0.3, // speed of snapping
            damping: 0.9 // speed decrease,
        });
        list.addItem(hideCounters);
        list.addItem(hideGUI);
        list.addItem(hideEffects);
        list.addItem(hideCoins);
        list.addItem(hideSweets);
        list.addItem(hideEnemies);
        list.addItem(hideSpikes);

        list.addItem(forceBackgroundSkin);
        list.addItem(toggleBackground);
        list.addItem(setBackgroundColor);

        list.addItem(setLevel);
        list.addItem(giveCoins);
        list.addItem(unlockAllPots);
        list.addItem(unlockAllSeeds);
        list.addItem(unlockAllPlants);

        list.addItem(skipTimers);
        // list.addItem(abTestSwap);
        list.addItem(deleteSave);

        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.modals,
            name: 'CheatScreen',
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            components: [
                new Modal({}),
                new Fill({
                    dimension: new Rectangle(0, 0, viewport.width, viewport.height),
                    color: [0, 0, 0, 0.5]
                }),
                closeButton,
                list,
                versionNumber
            ]
        });

        new Tween({
            from: 0,
            to: 1,
            in: 20,
            ease: 'linear',
            onUpdate: function (v, t) {
                entity.alpha = v;
            }
        });

        Bento.objects.attach(entity);

        return entity;
    };
});