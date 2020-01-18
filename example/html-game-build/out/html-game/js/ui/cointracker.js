/**
 * Module description
 * @moduleName CoinTracker
 * @snippet CoinTracker.snippet
CoinTracker({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/cointracker', [
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
    'components/spritecontainer',
    'components/gamecounter',
    'globals',
    'modules/savemanager',
    'bento/components/nineslice'
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
    SpriteContainer,
    GameCounter,
    Globals,
    SaveManager,
    NineSlice
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var position = settings.position || new Vector2(0, 0);
        var counterValue = SaveManager.load('coinCount', 0);
        var targetCounterValue = counterValue;
        var playSound = settings.playSound || false;

        var turnOffLoop = function () {
            Bento.audio.stopSound('sfx_coin_collect_loop');
            EventSystem.off('screenHidden', turnOffLoop);
        };


        // --- COMPONENTS ---
        var coinBacking = new Entity({
            name: 'coinBacking',
            position: new Vector2(-14, 1),
            scale: Globals.pixelScaleUIV,
            alpha: 1,
            components: [
                new NineSlice({
                    imageName: 'ui/9slices/tabs',
                    originRelative: new Vector2(0.5, 0.5),
                    width: 240,
                    height: 80
                })
            ]
        });
        var coinSprite = new SpriteContainer({
            imageName: 'coin',
            originRelative: new Vector2(0.5, 0.5),
            position: new Vector2(0, 1),
            alpha: 1,
            scale: new Vector2(0.2, 0.2),
            rotation: 0
        });
        var coinCounter = new GameCounter({
            imageName: 'ui/coincounter_alt',
            position: new Vector2(-8, 4.5),
            value: counterValue,
            align: 'right',
            scale: Globals.pixelScaleUIV.scalarMultiply(0.3)
        });


        var counterInterval;
        var updateCoinValue = function (newCoinCount) {
            if (targetCounterValue !== newCoinCount) {
                var oldCoinCount = counterValue;
                targetCounterValue = Math.floor(newCoinCount);

                var totalTime = Math.min((Math.abs(newCoinCount - oldCoinCount) - 1), 90);
                var thisTime = 0;
                if (totalTime > 10) {
                    Bento.audio.stopSound('sfx_coin_collect_loop');
                    Bento.audio.playSound('sfx_coin_collect_loop', true);
                }
                var updateTick = function () {
                    var thisValue = Math.floor(oldCoinCount + ((targetCounterValue - oldCoinCount) * (thisTime / totalTime)));
                    thisTime++;
                    if (thisTime > totalTime) {
                        window.clearInterval(counterInterval);
                        thisValue = targetCounterValue;
                        Bento.audio.stopSound('sfx_coin_collect_loop');
                    }
                    coinCounter.setValue(thisValue);
                    counterValue = thisValue;
                };

                if (counterInterval) {
                    window.clearInterval(counterInterval);
                }
                counterInterval = window.setInterval(updateTick, 1000 / 60);
            }
        };
        var behavior = {
            name: 'behaviorComponent',
            start: function () {
                EventSystem.on('coinsUpdated', updateCoinValue);
                EventSystem.on('screenHidden', turnOffLoop);
            },
            destroy: function () {
                EventSystem.off('coinsUpdated', updateCoinValue);
                Bento.audio.stopSound('sfx_coin_collect_loop');
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: settings.z || -10000000000000,
            name: 'coinTracker',
            position: position,
            float: false,
            components: [
                coinBacking,
                behavior,
                coinSprite,
                coinCounter
            ]
        }).extend({
            getCoinValue: function () {
                return targetCounterValue;
            },
            updateCoinValue: updateCoinValue
        });
        return entity;
    };
});