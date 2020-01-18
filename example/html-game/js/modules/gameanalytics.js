/**
 * @moduleName GameAnalytics
 * @snippet GameAnalytics.initialize()|snippet
GameAnalytics.initialize({
    gameKey: '$1',
    secretKey: '$2'
});
 * @snippet GameAnalytics.configureAvailableCustomDimensions01()|snippet
            GameAnalytics.configureAvailableCustomDimensions01(['$1']);
 * @snippet GameAnalytics.configureAvailableCustomDimensions02()|snippet
            GameAnalytics.configureAvailableCustomDimensions02(['$1']);
 * @snippet GameAnalytics.configureAvailableCustomDimensions03()|snippet
            GameAnalytics.configureAvailableCustomDimensions03(['$1']);
 * @snippet GameAnalytics.configureAvailableResourceCurrencies()|snippet
            GameAnalytics.configureAvailableResourceCurrencies(['$1']);
 * @snippet GameAnalytics.configureAvailableResourceItemTypes()|snippet
            GameAnalytics.configureAvailableResourceItemTypes(['$1']);
 * @snippet GameAnalytics.configureBuild()|snippet
            GameAnalytics.configureBuild(${1:window.VERSION});
 * @snippet GameAnalytics.configureUserId()|snippet
            GameAnalytics.configureUserId('$1');
 * @snippet GameAnalytics.setEnabledInfoLog()|snippet
            GameAnalytics.setEnabledInfoLog(${1:true});
 * @snippet GameAnalytics.setEnabledVerboseLog()|snippet
            GameAnalytics.setEnabledVerboseLog(${1:true});
 * @snippet GameAnalytics.setEnabledManualSessionHandling()|snippet
            GameAnalytics.setEnabledManualSessionHandling({1:true});
 * @snippet GameAnalytics.setFacebookId()|snippet
            GameAnalytics.setFacebookId('$1');
 * @snippet GameAnalytics.setGender()|Female
            GameAnalytics.setGender(GameAnalytics.EGAGender.Female);
 * @snippet GameAnalytics.setGender()|Male
            GameAnalytics.setGender(GameAnalytics.EGAGender.Male);
 * @snippet GameAnalytics.setBirthYear()|snippet
            GameAnalytics.setBirthYear(${1:1980});
 */
bento.define('modules/gameanalytics', [
    'bento',
    'bento/eventsystem',
    'bento/utils'
], function (
    Bento,
    EventSystem,
    Utils
) {
    'use strict';
    var nothing = function () {};
    var enabled = !Bento.saveState.load('isDev', false);

    // - Check if the JS file exists
    if (!Utils.isDefined(window.GameAnalytics)) {
        // doesn't exist return blank object
        console.log('Warning: GameAnalytics not found!');
        return {
            disable: nothing,
            configureAvailableCustomDimensions01: nothing,
            configureAvailableCustomDimensions02: nothing,
            configureAvailableCustomDimensions03: nothing,
            configureAvailableResourceCurrencies: nothing,
            configureAvailableResourceItemTypes: nothing,
            configureBuild: nothing,
            configureUserId: nothing,
            initialize: nothing,
            addBusinessEvent: nothing,
            addResourceEvent: nothing,
            addProgressionEvent: nothing,
            addDesignEvent: nothing,
            addErrorEvent: nothing,
            setEnabledInfoLog: nothing,
            setEnabledVerboseLog: nothing,
            setEnabledManualSessionHandling: nothing,
            setCustomDimension01: nothing,
            setCustomDimension02: nothing,
            setCustomDimension03: nothing,
            setFacebookId: nothing,
            setGender: nothing,
            setBirthYear: nothing,
            startSession: nothing,
            endSession: nothing,
            EGAErrorSeverity: {},
            EGAGender: {},
            EGAResourceFlowType: {},
            EGAProgressionStatus: {}
        };
    }

    // Bento event handlers
    /**
     * @snippet Event.GA.addBusinessEvent()|GooglePlay
EventSystem.fire('GameAnalytics-addBusinessEvent', {
    currency: "${1:USD}", 
    amount: ${2:100}, 
    itemType: "${3:boost}", 
    itemId: "${4:megaBoost}", 
    cartType: "${5:shop}", 
    receipt: "$6", 
    signature: "$7"
});
     * @snippet Event.GA.addBusinessEvent()|iOS
EventSystem.fire('GameAnalytics-addBusinessEvent', {
    currency: "${1:USD}", 
    amount: ${2:100}, 
    itemType: "${3:boost}", 
    itemId: "${4:megaBoost}", 
    cartType: "${5:shop}", 
    receipt: "$6"
});
     */
    EventSystem.on('GameAnalytics-addBusinessEvent', function (data) {
        if (enabled) {
            window.GameAnalytics.addBusinessEvent(data, function () {});
        }
    });
    /**
     * @snippet Event.GA.addResourceEvent()|Source
EventSystem.fire('GameAnalytics-addResourceEvent', {
    flowType: 1, // source
    currency: "${1:ConfiguredResourceCurrency}",
    amount: ${2:1},
    itemType: "${3:ConfiguredItemType}",
    itemId: "${4:HowItWasGained}"
});
     * @snippet Event.GA.addResourceEvent()|Sink
EventSystem.fire('GameAnalytics-addResourceEvent', {
    flowType: 2, // sink
    currency: "${1:Gems}",
    amount: ${2:1},
    itemType: "${3:CategoryGainedOrPlace}",
    itemId: "${4:WhatIsGained}"
});
     */
    EventSystem.on('GameAnalytics-addResourceEvent', function (data) {
        if (enabled) {
            window.GameAnalytics.addResourceEvent(data, function () {});
        }
    });
    /**
     * @snippet Event.GA.addProgressionEvent()|Start
EventSystem.fire('GameAnalytics-addProgressionEvent', {
    progressionStatus: 1, // Start
    progression01: "${1:world01}",
    progression02: "${2:stage01}", // optional
    progression03: "${3:level01}", // optional
    score: ${4:0} // optional
});
     * @snippet Event.GA.addProgressionEvent()|Complete
EventSystem.fire('GameAnalytics-addProgressionEvent', {
    progressionStatus: 2, // Complete
    progression01: "${1:world01}",
    progression02: "${2:stage01}", // optional
    progression03: "${3:level01}", // optional
    score: ${4:0} // optional
});
     * @snippet Event.GA.addProgressionEvent()|Fail
EventSystem.fire('GameAnalytics-addProgressionEvent', {
    progressionStatus: 3, // Fail
    progression01: "${1:world01}",
    progression02: "${2:stage01}", // optional
    progression03: "${3:level01}", // optional
    score: ${4:0} // optional
});
     */
    EventSystem.on('GameAnalytics-addProgressionEvent', function (data) {
        if (enabled) {
            window.GameAnalytics.addProgressionEvent(data, function () {});
        }
    });
    /**
     * @snippet Event.GA.addDesignEvent()|event
EventSystem.fire('GameAnalytics-addDesignEvent', {
    eventId: "${1:BossFights:FireLord:KillTimeUsed}"
});
     * @snippet Event.GA.addDesignEvent()|value
EventSystem.fire('GameAnalytics-addDesignEvent', {
    eventId: "${1:BossFights:FireLord:KillTimeUsed}", // max 5 segments, each 32 length max
    value: ${2:234.5}
});
     */
    EventSystem.on('GameAnalytics-addDesignEvent', function (data) {
        if (enabled) {
            window.GameAnalytics.addDesignEvent(data, function () {});
        }
    });
    /**
     * @snippet Event.GA.addErrorEvent()|Debug
EventSystem.fire('GameAnalytics-addErrorEvent', {
    severity: 1, // Debug
    message: '$1'
});
     * @snippet Event.GA.addErrorEvent()|Info
EventSystem.fire('GameAnalytics-addErrorEvent', {
    severity: 2, // Info
    message: '$1'
});
     * @snippet Event.GA.addErrorEvent()|Warning
EventSystem.fire('GameAnalytics-addErrorEvent', {
    severity: 3, // Warning
    message: '$1'
});
     * @snippet Event.GA.addErrorEvent()|Error
EventSystem.fire('GameAnalytics-addErrorEvent', {
    severity: 4, // Error
    message: '$1'
});
     * @snippet Event.GA.addErrorEvent()|Critical
EventSystem.fire('GameAnalytics-addErrorEvent', {
    severity: 5, // Critical
    message: '$1'
});
     */
    EventSystem.on('GameAnalytics-addErrorEvent', function (data) {
        if (enabled) {
            window.GameAnalytics.addErrorEvent(data);
        }
    });

    /**
     * @snippet Event.GA.setCustomDimension01()|snippet
EventSystem.fire('GameAnalytics-setCustomDimension01', "$1");
     * @snippet Event.GA.setCustomDimension01()|Reset
EventSystem.fire('GameAnalytics-setCustomDimension01', "");
     */
    EventSystem.on('GameAnalytics-setCustomDimension01', function (data) {
        if (enabled) {
            window.GameAnalytics.setCustomDimension01(data, function () {});
        }
    });
    /**
     * @snippet Event.GA.setCustomDimension02()|snippet
EventSystem.fire('GameAnalytics-setCustomDimension02', "$1");
     * @snippet Event.GA.setCustomDimension02()|Reset
EventSystem.fire('GameAnalytics-setCustomDimension02', "");
     */
    EventSystem.on('GameAnalytics-setCustomDimension02', function (data) {
        if (enabled) {
            window.GameAnalytics.setCustomDimension02(data, function () {});
        }
    });
    /**
     * @snippet Event.GA.setCustomDimension03()|snippet
EventSystem.fire('GameAnalytics-setCustomDimension03', "$1");
     * @snippet Event.GA.setCustomDimension03()|Reset
EventSystem.fire('GameAnalytics-setCustomDimension03', "");
     */
    EventSystem.on('GameAnalytics-setCustomDimension03', function (data) {
        if (enabled) {
            window.GameAnalytics.setCustomDimension03(data, function () {});
        }
    });
    /**
     * @snippet Event.GA.startSession()|snippet
EventSystem.fire('GameAnalytics-startSession');
     */
    EventSystem.on('GameAnalytics-startSession', function (data) {
        if (enabled) {
            window.GameAnalytics.startSession(function () {});
        }
    });
    /**
     * @snippet Event.GA.endSession()|snippet
EventSystem.fire('GameAnalytics-endSession');
     */
    EventSystem.on('GameAnalytics-endSession', function (data) {
        if (enabled) {
            window.GameAnalytics.endSession(function () {});
        }
    });

    window.GameAnalytics.disable = function () {
        enabled = false;
    };

    return window.GameAnalytics;
});