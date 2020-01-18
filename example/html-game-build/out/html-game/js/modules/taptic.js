/**
 * Safe wrapper for TapticEngine.js
 * https://github.com/EddyVerbruggen/cordova-plugin-taptic-engine/blob/master/www/TapticEngine.js
 * @moduleName TapticEngine
 */
bento.define('modules/taptic', [
    'bento',
    'bento/utils',
    'modules/savemanager'
], function (
    Bento,
    Utils,
    SaveManager
) {
    'use strict';
    var nothing = function () {};
    var initUnofficial = function () {
        console.log('TapticEngine: Swap official with unoficial API');
        window.TapticEngine.selection = window.TapticEngine.unofficial.weakBoom;
        window.TapticEngine.notification = window.TapticEngine.unofficial.burst;
        window.TapticEngine.impact = function (data) {
            if (Bento.saveState.load('muteHaptics', false)) {
                return;
            }
            if (!data) {
                return;
            }
            if (data.style === 'heavy') {
                window.TapticEngine.unofficial.strongBoom();
            }
            if (data.style === 'medium') {
                window.TapticEngine.unofficial.strongBoom();
            }
            if (data.style === 'light') {
                window.TapticEngine.unofficial.weakBoom();
            }
        };
    };
    var isEnabled = true;
    var module = {
        enable: function (value) {
            isEnabled = value;
        },
        unofficial: {
            weakBoom: nothing,
            strongBoom: nothing,
            burst: nothing
        },
        notification: nothing,
        selection: nothing,
        impact: nothing,
        gestureSelectionStart: nothing,
        gestureSelectionChanged: nothing,
        gestureSelectionEnd: nothing,
        initUnofficial: nothing
    };
    var makeFn = function (fn) {
        return function () {
            if (Bento.saveState.load('muteHaptics', false)) {
                return;
            }
            if (isEnabled) {
                fn.apply(window.TapticEngine, arguments);
            }
        };
    };

    if (!window.TapticEngine || Utils.isNativeAndroid()) {
        console.log('WARNING: cordova plugin for TapticEngine not found.');
        return module;
    }
    console.log('Init taptic engine');
    module.initUnofficial = initUnofficial;

    // copy functions to module
    module.notification = makeFn(window.TapticEngine.notification);
    module.selection = makeFn(window.TapticEngine.selection);
    module.impact = makeFn(window.TapticEngine.impact);
    module.gestureSelectionStart = makeFn(window.TapticEngine.gestureSelectionStart);
    module.gestureSelectionChanged = makeFn(window.TapticEngine.gestureSelectionChanged);
    module.gestureSelectionEnd = makeFn(window.TapticEngine.gestureSelectionEnd);

    return module;
});