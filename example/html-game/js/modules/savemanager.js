/**
 * Save Manager. Wrapper for Bento's SaveState.
 * All savekeys need to be defined here, paired with a default value. When using the SaveManager,
 * it will check wether the provided key is defined, and throw a warning otherwise.
 * It will also use the paired default value, ensuring consistency between all places in the codebase where a value is loaded.
 *
 * Tip: don't use the SaveManager for generic settings. For example: audio mute states.
 *
 * @moduleName SaveManager
 * @snippet SaveManager.load
SaveManager.load('$1');
 * @snippet SaveManager.save
SaveManager.save('$1', ${2:value});
 * @snippet SaveManager.add
SaveManager.add('$1', ${2:value});
 */
bento.define('modules/savemanager', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween
) {
    'use strict';
    /**
     * Save keys
     */
    var Keys = {};

    Keys.identifier = null;

    // Boolean - cheats
    Keys.isDev = false;
    // Boolean - disable haptics
    Keys.muteHaptics = false;

    // Number - current progress level
    Keys.currentLevel = 1;
    // Number - current progress between chests
    Keys.chestProgress = 0;
    Keys.superProgress = 0;
    // Number - current number of opened chests
    Keys.chestsOpened = 0;
    Keys.supersOpened = 0;
    // Number - current count of coins
    Keys.coinCount = 0;
    // Number - highest total score
    Keys.bestScore = 0;

    // Boolean - has the player completed the cutscene
    Keys.watchedCutscene = false;
    // Boolean - has the player completed the pot unlock tutorial
    Keys.hasInitialBean = false;
    // Boolean - has the player completed the pot unlock tutorial
    Keys.doneUnlockTutorial = false;
    // Boolean - has the player completed the growing unlock tutorial
    Keys.doneGrowTutorial = false;
    // Boolean - are we allowed to show the plant selector
    Keys.canShowPlantSelector = false;
    // Boolean - ShowForcedAds
    Keys.showForcedAds = true;

    // Number - How many ads have been watched
    Keys.watchedAds = 0;

    // Object - holds the current save data for the unlocked skins
    Keys.skinSaveData = {};
    // String - identification ID for the current pot skin
    Keys.currentPotSkin = '';
    // String - identification ID for the current plant skin
    Keys.currentPlantSkin = '';

    Keys.TimesShownVIP = 0;
    Keys.VipFirstTimeClaim = false;

    Keys.notificationsAllowed = false;
    Keys.notificationsAsked = 0;
    Keys.notificationPlantReady = null;
    Keys.notification1Day = null;
    Keys.notification2Day = null;
    Keys.notification1Week = null;
    Keys.notification2Week = null;

    Keys.askedRating = false;

    //ads
    Keys.levelsSinceBonusAd = 0;
    Keys.levelsSinceSkinAd = 0;
    Keys.dayLastRedeemedAdForCoins = -1;
    Keys.timesRedeemedAdForCoinsToday = 0;

    Keys.ABSkipMetaTutorialsSet = false;
    Keys.ABSkipMetaTutorials = false;
    Keys.ABAllowDroppingSet = false;
    Keys.ABAllowDropping = false;
    Keys.ABSuperLongLevelsSet = false;
    Keys.ABSuperLongLevels = false;
    Keys.ABNoIntroSet = false;
    Keys.ABNoIntro = false;
    Keys.ABimmediateVipPopupSet = false;
    Keys.ABimmediateVipPopup = false;
    Keys.ABNoDropSet = false;
    Keys.ABNoDrop = false;

    // Social Media
    Keys.shownTwitter = false;
    Keys.shownInstagram = false;
    Keys.shownFacebook = false;

    //allow VIP trial
    Keys.doneGrowBotTrial = false;
    Keys.doneCalciTrial = false;
    Keys.doneKingPlantTrial = false;
    Keys.doneGizmoTrial = false;
    Keys.doneGojiTrial = false;

    /**
     * Private functions, ignore these
     */
    var getParsedDefault = function (def) {
        if (def !== null) {
            if (def.constructor === Array) {
                def = [].concat(def);
            } else if (typeof def === 'object') {
                def = JSON.parse(JSON.stringify(def));
            }
        }
        return def;
    };
    var checkKey = function (key) {
        if (Keys.hasOwnProperty(key)) {
            return true;
        } else {
            Utils.log('WARNING: save key ' + key + ' is not defined!');
            return false;
        }
    };
    /**
     * Public functions
     */
    var manager = {
        Keys: Keys,
        save: function (key, value) {
            if (!checkKey(key)) {
                return;
            }
            Bento.saveState.save(key, value);
        },
        load: function (key) {
            if (!checkKey(key)) {
                return undefined;
            }
            var def = getParsedDefault(Keys[key]);

            return Bento.saveState.load(key, def);
        },
        add: function (key, value) {
            var current = manager.load(key);
            current += value;
            manager.save(key, current);
        }
    };

    return manager;
});