/**
 * Global values
 * @moduleName Globals
 */
bento.define('globals', [
    'bento',
    'bento/utils',
    'bento/math/vector2',
    'bento/gui/text'
], function (
    Bento,
    Utils,
    Vector2,
    Text
) {
    'use strict';
    var Globals = {
        // debug drawing flag
        debug: false,

        showGUI: true,
        showEffects: true, //
        showCounters: true,
        showCoins: true, //
        showCandy: true, //
        showEnemies: true, //
        showSpikes: true, //

        forcedWorldSkin: undefined,


        attemptsSinceAd: 0,
        levelsThisSession: 0,
        levelsSinceVIP: 0,
        levelsThisBoot: 0,

        // ad balance
        canAdRevive: true,
        maxAttemptsBetweenInterstitials: 2,

        mainMusicVolume: 0,
        feverMusicVolume: 0,

        // game balancing
        pointsPerCoin: 10,
        pointsPerCoinVIP: 5,
        superProgressSegments: 5,

        // HD stuff
        pixelScale: 1 / (90 / 16),
        pixelScaleUI: 0.16,
        pixelScaleV: new Vector2(1 / (90 / 16), 1 / (90 / 16)),
        pixelScaleUIV: new Vector2(0.16, 0.16),

        // booleans
        doCull: true,
        doOpenPlants: false, // auto opens the plants screen on the main menu
        doOpenVIP: false,

        // game states
        currentScore: 0,
        gameStates: {
            menu: 0,
            cutscene: 1,
            tutorial: 2,
            potTutorial: 3,
            plantTutorial: 4,
            game: 5
        },
        gameState: 0,


        // layer definitions
        layers: {
            bg: -1001,
            preupdate: -1000,
            bg2: -999,
            camera: -1,
            behindtiles: 1,
            tiles: 2,
            tiles2: 3,
            active: 4,
            active2: 5,
            active3: 6,
            effects: 7,
            effects2: 8,
            postupdate: 1000,
            screens: 1001,
            gui: 1002,
            cutscenes: 1003,
            superbonus: 1003,
            mainmenu: 1003,
            mainmenucoins: 1004,
            mainmenututorial: 1005,
            modals: 5000,
            iapoverlay: 5001,
            transitions: 10000,
            vipdialog: 10001
        },


        // example of pauselevel definitions
        PauseLevels: {
            NONE: 0,
            PAUSE: 1,
            SYSTEM: 2
        },

        // social URLs
        socialURLs: {
            instagram: 'https://www.instagram.com/luckykatstudios/',
            twitter: 'https://twitter.com/luckykatstudios',
            facebook: 'https://www.facebook.com/luckykatstudios/'
        },

        useBgColorOveride: false,
        bgColorOveride: '#000000'
    };
    return Globals;
});