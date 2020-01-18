/**
 * AB test manager
 * @moduleName ABTest
 */
bento.define('modules/abtest', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'modules/savemanager'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween,
    SaveManager
) {
    'use strict';
    return {
        init: function (onComplete) {
            // test allowing dropping
            var ABNoDrop;
            if (!SaveManager.load('ABNoDropSet')) {
                ABNoDrop = [false, true][Utils.getRandom(2)];
                SaveManager.save('ABNoDrop', ABNoDrop);
                SaveManager.save('ABNoDropSet', true);
            } else {
                ABNoDrop = SaveManager.load('ABNoDrop');
            }

            if (!SaveManager.load('identifier')) {
                var userId;
                // use default methods
                if (window.device) {
                    userId = 'dvc_' + window.device.uuid;
                } else if (navigator.isCocoonJS && window.Cocoon && window.Cocoon.Device) {
                    userId = 'ccd_' + window.Cocoon.Device.getDeviceId();
                } else {
                    // last resort: randomize number
                    userId = 'rnd_' + (1 + Utils.getRandom(100000000));
                }

                if (Utils.isDev()) {
                    userId = 'dev';
                }

                SaveManager.save('identifier', userId);
            }

            // set up dimensions
            EventSystem.fire('GameAnalytics-setCustomDimension01', ABNoDrop ? 'NoDrop' : 'KeepDrop');
            console.log('ABNoDrop:', ABNoDrop);

            if (onComplete) {
                onComplete();
            }
        }
    };
});