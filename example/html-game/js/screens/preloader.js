/**
 * Screen description
 */
bento.define('screens/preloader', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/components/fill',
    'bento/gui/text',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/screen',
    'bento/tween',
    'globals',
    'modules/localization',
    'ui/screentransition',
    'modules/skinmanager',
    'modules/notifications',
    'modules/savemanager',
    'modules/crosspromo/crosspromo',
    'components/spritecontainer',
    'components/backbutton'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Fill,
    Text,
    Entity,
    EventSystem,
    Utils,
    Screen,
    Tween,
    Globals,
    Localization,
    ScreenTransition,
    SkinManager,
    Notifications,
    SaveManager,
    CrossPromo,
    SpriteContainer,
    BackButton
) {
    'use strict';
    var viewport = Bento.getViewport();

    var bootupAnalytics = function () {
        var now = Date.now();
        var day = Math.floor(now / 1000 / 60 / 60 / 24);
        var dayDiff = 0;
        var retainedDays = Bento.saveState.load('retainedDays', {});
        var bootups = Bento.saveState.load('bootups', 0);
        var lastPlayedDay = Bento.saveState.load('lastPlayedDay', 0);

        // doing some bootup analytics
        if (bootups === 0) {
            Bento.saveState.save('bootupDate', now);
            Bento.saveState.save('bootupDay', day);
            Bento.saveState.save('lastPlayedVersion', window.VERSION);
            EventSystem.fire('GameAnalytics-addDesignEvent', {
                eventId: "Stats:firstBootup"
            });
        }
        Bento.saveState.save('bootups', bootups + 1);

        // retention
        dayDiff = day - Bento.saveState.load('bootupDay', 0);
        retainedDays[dayDiff] = 1;
        Bento.saveState.save('retainedDays', retainedDays);

        // if this is a new day 
        if (lastPlayedDay !== day) {
            //tenjin d1 event
            if (dayDiff === 1) {
                EventSystem.fire('Tenjin', {
                    name: "D1_retention"
                });
                EventSystem.fire('GameAnalytics-addDesignEvent', {
                    eventId: "retention:D1",
                    value: SaveManager.load('currentLevel')
                });
            }
            //tenjin d7 event
            if (dayDiff === 7) {
                EventSystem.fire('Tenjin', {
                    name: "D7_retention"
                });
                EventSystem.fire('GameAnalytics-addDesignEvent', {
                    eventId: "retention:D7",
                    value: SaveManager.load('currentLevel')
                });
            }
            //tenjin d14 event
            if (dayDiff === 14) {
                EventSystem.fire('Tenjin', {
                    name: "D14_retention"
                });
                EventSystem.fire('GameAnalytics-addDesignEvent', {
                    eventId: "retention:D14",
                    value: SaveManager.load('currentLevel')
                });
            }
            //tenjin d30 event
            if (dayDiff === 30) {
                EventSystem.fire('Tenjin', {
                    name: "D30_retention"
                });
                EventSystem.fire('GameAnalytics-addDesignEvent', {
                    eventId: "retention:D30",
                    value: SaveManager.load('currentLevel')
                });
            }
        }
        EventSystem.fire('GameAnalytics-addDesignEvent', {
            eventId: "Stats:bootup"
        });

        EventSystem.fire('GameAnalytics-addDesignEvent', {
            eventId: "patch:adoption_1",
            value: 0
        });
        EventSystem.fire('GameAnalytics-addDesignEvent', {
            eventId: "patch:adoption_2",
            value: 0
        });

        Bento.saveState.save('lastPlayedDay', day);
        Bento.saveState.save('lastPlayedVersion', window.VERSION);
    };

    var initPostPreloader = function () {
        // hide cordova splashscreen if exists
        if (navigator.splashscreen) {
            navigator.splashscreen.hide();
        }



        // send bootup analytics after preloader
        bootupAnalytics();
    };
    var onShow = function () {
        var loaded = false;
        var background = new Entity({
            z: 0,
            name: 'background',
            components: [
                new Fill({})
            ]
        });
        var luckyKat = new Entity({
            z: 1,
            name: 'luckyKatLogo',
            position: new Vector2(viewport.width / 2, viewport.height / 2),
            scale: new Vector2(0.75, 0.75),
            components: [
                new SpriteContainer({
                    imageName: 'luckykat-720',
                    originRelative: new Vector2(0.5, 0.5),
                    scale: new Vector2(0.15, 0.15),
                })
            ]
        });
        var loadingBar = new SpriteContainer({
            imageName: 'barBG',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.9),
            scale: new Vector2(0.25, 0.25)
        });
        var loadingBarFG = new SpriteContainer({
            imageName: 'barFG',
            originRelative: new Vector2(0, 0.5),
            position: new Vector2((viewport.width * 0.5) - (357 * 0.125), viewport.height * 0.9),
            scale: new Vector2(0, 0.25)
        });
        var postAssets = function () {

            // setup skins post assets as we need JSON
            SkinManager.initialize();

            // Localization language is set after localized json files are loaded
            Localization.init();

            EventSystem.on('touchcancel', Bento.input.resetPointers);

            // if (SkinManager.getAllLockedPlantSkins().indexOf('supergameplant') !== -1) {
            //     SkinManager.makePlantSkinUnlockable('supergameplant');
            //     SaveManager.save('doneGrowTutorial', true);
            //     SaveManager.save('canShowPlantSelector', true);
            // }
            Globals.currentCrossPromo = new CrossPromo({
                position: new Vector2(viewport.width - 48, 88),
                rotation: 0.1
            });

            //disable audio
            Bento.audio.muteSound(Bento.saveState.load('muteSound', false));
            Bento.audio.muteMusic(Bento.saveState.load('muteMusic', false));

            if (loaded) {
                if (Bento.saveState.load('bootups', 0) === 1) {
                    Bento.screens.show('screens/main');
                } else {
                    Bento.screens.show('screens/splash');
                }
            }
        };
        var loadFonts = function () {
            var fonts = Bento.assets.getAssetGroups().preloader.fonts;
            var font;
            if (!fonts) {
                return;
            }
            for (font in fonts) {
                if (!fonts.hasOwnProperty(font)) {
                    continue;
                }
                new Text({
                    position: new Vector2(1000, 1000),
                    text: '.',
                    font: font
                });
            }
        };

        initPostPreloader();

        Bento.objects.attach(background);
        Bento.objects.attach(loadingBar);
        Bento.objects.attach(loadingBarFG);
        Bento.objects.attach(luckyKat);

        // preload fonts
        loadFonts();

        var lastTick = luckyKat.ticker;
        // we will now load all other assets
        console.log('Preload: Started!');
        Bento.assets.loadAllAssets({
            exceptions: ['preloader'], // preloader was already loaded
            onLoaded: function (current, total) {
                if (luckyKat.ticker > lastTick + 5) {
                    loadingBarFG.scale.x = Math.min(current / total, 1) * 0.25;
                    console.log('Preload: ' + current + ' / ' + total);
                    lastTick = luckyKat.ticker;
                }
            },
            onReady: function () {
                console.log('Preload: Complete!');
                loaded = true;
                postAssets();
            }
        });
    };

    return new Screen({
        onShow: onShow
    });
});