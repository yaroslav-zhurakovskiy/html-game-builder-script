window.VERSION = '0.0.0';
window.BUILD = 0;
window.BUNDLEID = "com.luckykat.plant";
window.IAPPREFIX = "nomplant";
window.ISCHINA = false;
window.VERSION = "1.2.3";
window.BUILD = 28;
/*replace:bundleid*/
/*replace:iapprefix*/
/*replace:ischina*/

window.patchUrl = 'http://d3q8vwl9xlq0g.cloudfront.net/nomplant/data';
window.patchGame = function () {
    if (window.patchUrl === '') {
        // return since we didn't set the patch url yet
        window.startGame();
        return;
    }
    var hasStarted = false;
    window.patcher(window.patchUrl, 'v' + window.VERSION, function (res) {
        if (res) {
            console.log('Ended with', res);
        }
        if (!hasStarted) {
            window.startGame();
            hasStarted = true;
        }
    });
};

if (bento.require.config) {
    // requirejs config
    bento.require.config({
        baseUrl: 'js',
        waitSeconds: 0
    });
}

window.startGame = function () {
    bento.require([
        'bento',
        'bento/math/vector2',
        'bento/math/rectangle',
        'bento/tween',
        'bento/autoresize',
        'utils',
        'init',
        'modules/nativestorage'
    ], function (
        Bento,
        Vector2,
        Rectangle,
        Tween,
        AutoResize,
        Utils,
        Init,
        NativeStorage
    ) {
        var getEnvironment = function () {
            var environment = 'Web';
            var platform;
            if (navigator.isCocoonJS) {
                environment = 'Cocoon';
                if (window.Cocoon) {
                    environment += ' ' + platform;
                }
            } else if (window.cordova) {
                environment = 'Cordova';
                if (window.device) {
                    environment += ' ' + window.device.platform;
                }
            } else if (window.FBInstant) {
                environment = 'FBInstant';

            }
            return environment;
        };
        console.log('********************');
        console.log('Bento v' + Bento.version);
        console.log('Game v' + window.VERSION + ' b' + window.BUILD);
        console.log('Environment: ' + getEnvironment());
        console.log('********************');

        // save state setup
        Bento.saveState.setId('PiranhaPlant/');
        Bento.saveState.saveKeys = true;

        // setup game
        Bento.setup({
            name: 'PiranhaPlant',
            canvasId: 'canvas',
            renderer: Utils.isCocoonJs() ? 'canvas2d' : 'pixi',
            pixelSize: 4,
            antiAlias: true,
            manualResize: true,
            useDeltaT: true,
            autoThrottle: true,
            subPixel: true,
            preventContextMenu: true,
            // canvasDimension: new Rectangle(0, 0, 640, 480), // use this if responsiveResize is false
            responsiveResize: {
                landscape: false,
                minWidth: 180,
                maxWidth: 240,
                minHeight: 320, // minimum for iPad -> 240 x 320
                maxHeight: 390, // will fill up for iPhoneX (ratio 19.5:9) -> 180 x 390
            },
            globalMouseUp: false, // recommended true for web builds
            reload: {
                // DEV ONLY! right mouse click refreshes the current screen with new javascript code
                simple: 'mouseDown-right',
                assets: 'buttonDown-1',
                jump: 'buttonDown-2'
            },
            // DEV ONLY! q downloads a screenshot
            screenshot: 'buttonDown-q',
            // set to false with build script
            dev: false
        }, function () {
            NativeStorage.init({
                migrateFromLocalStorage: true,
                onComplete: function () {
                    Init();
                },
            });
        });
    });
};

// entry points for cordova apps
document.addEventListener('deviceready', function () {
    window.patchGame();
}, false);

// other entry point
(function () {
    if (navigator.isCocoonJS) {
        // CocoonJs is cordova
        return;
    }
    if (window.cordova) {
        // wait for device ready
        return;
    }

    // playable ads
    if (window.mraid) {
        var hasStarted = false;
        if (window.mraid.getState() === 'loading') {
            // note: how long does mraid need for startup? if it takes long, 
            // we should make a loading screen in an html div and remove it when loading is complete
            window.mraid.addEventListener("ready", function () {
                if (!hasStarted) {
                    window.patchGame();
                    hasStarted = true;
                }
            });
        } else {
            window.patchGame();
            hasStarted = true;
        }
        return;
    }
    window.patchGame();
})();