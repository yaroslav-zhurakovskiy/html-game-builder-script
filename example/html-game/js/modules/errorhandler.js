/**
 * A global event listener that catches any error produced by Javascript.
 * Will automatically send error message and stack trace to Google Analytics if the GaId is passed.
 * Will fire the event "UncaughtError", for handling errors per game
 * @moduleName ErrorHandler
 * @snippet ErrorHandler.init|snippet
ErrorHandler.init({
    saveErrors: Utils.isDev(), // save into savestate with key 'errorHistory'
    GaId: '$1', // optional: Google Analytics ID to send errors to
    GaPrefix: '$2', // enter a prefix for Google Analytics category name (recommended to use game name) 
});
 */
bento.define('modules/errorhandler', [
    'bento',
    'bento/eventsystem',
    'bento/utils'
], function (
    Bento,
    EventSystem,
    Utils
) {
    'use strict';
    var ErrorHandler = {
        init: function (settings) {
            Bento.objects.attach(globalTimer);
            startListener();

            ErrorHandler.GaPrefix = settings.GaPrefix;
            ErrorHandler.GaId = settings.GaId;
            ErrorHandler.saveErrors = settings.saveErrors;
        },
        saveErrors: false,
        GaId: null,
        GaPrefix: ''
    };
    // this object will be attached
    var globalTimer = {
        z: 0,
        name: 'errorHandler',
        timer: 0,
        global: true,
        update: function () {
            globalTimer.timer += 1;
        },
        destroy: function () {
            // re-add self
            Bento.objects.attach(globalTimer);
        }
    };
    // using window.onerror to catch errors
    var startListener = function () {
        // event listener for errors
        window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
            console.log('caught Trace');
            // Cocoon: column and errorObj are undefined, url is an empty string
            var globalTime = globalTimer.timer;
            var summary;
            var isFatal = false;
            var currentObject = Bento.objects.getCurrentObject();
            var errorData;

            summary = 'url: ' + url + ' line ' + lineNumber + ': ' + errorMsg;

            errorData = {
                isFatal: isFatal,
                line: lineNumber,
                errorMsg: errorMsg,
                summary: summary,
                currentObject: currentObject
            };

            // detect if fatal: wait 1 second to see if globalTimer moved
            window.setTimeout(function () {
                if (globalTimer.isAdded && globalTime === globalTimer.timer) {
                    errorData.isFatal = true;
                    console.log('Fatal error detected');
                } else {
                    console.log('Non-fatal error detected');
                }

                handleError(errorData);

                // send event to perform game specific action
                EventSystem.fire('UncaughtError', errorData);
            }, 1000);

            // window.alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber +
            // ' Column: ' + column + ' StackTrace: ' + JSON.stringify(errorObj));
        };
    };
    var handleError = function (data) {
        var prefix = ErrorHandler.GaPrefix;
        var category = prefix + '-Error';
        var currentScreen = Bento.screens.getCurrentScreen();
        var currentScreenName = 'none';
        var currentObject = data.currentObject;
        var currentObjectName = 'none';
        var currentComponent;
        var currentComponentName = 'none';
        var summary = data.summary;
        var errorMsg = data.errorMsg;
        var isFatal = data.isFatal;
        var errorHistory = Bento.saveState.load('errorHistory', []);
        var environment = 'unknown';
        var userAgent = '';

        if (Utils.isNativeIos()) {
            environment = 'iOS';
        } else if (Utils.isNativeAndroid()) {
            environment = 'Android';
        } else {
            environment = 'Web';
            userAgent = navigator.userAgent;
        }
        if (currentScreen) {
            // try to log the current screen
            currentScreenName = currentScreen.name;
        }
        if (currentObject && currentObject.name) {
            // try to log the object name
            currentObjectName = currentObject.name;
            summary += '\nObject: ' + currentObject.name;
            currentComponent = currentObject.currentComponent;
            if (currentComponent && currentComponent.name) {
                currentComponentName = currentComponent.name;
                summary += '\nComponent: ' + currentComponentName;

                // special case: stateMachine
                if (currentComponentName === 'stateMachine') {
                    summary += '\nstateName: ' + currentComponent.stateName;
                }
            }
            if (window.VERSION !== void(0)) {
                summary += '\nVersion: ' + window.VERSION;
            }
            if (window.BUILD !== void(0)) {
                summary += '\nBuild: ' + window.BUILD;
            }
        }
        if (errorMsg.stack) {
            summary += '\nStack: ' + errorMsg.stack;
        }
        if (isFatal) {
            category = prefix + '-ErrorFatal';
        }
        // send analytics
        if (ErrorHandler.GaId && !(Utils.isDev() && environment === 'Web')) { // don't send during desktop development
            sendToGa(category, environment + '-' + currentScreenName, 1, summary);
        }

        EventSystem.fire('GameAnalytics-addErrorEvent', {
            severity: 5, // Critical
            message: environment + '-' + currentScreenName + ': ' + summary
        });

        // save into history
        if (ErrorHandler.saveErrors) {
            errorHistory.push({
                isFatal: isFatal,
                summary: summary,
                screen: currentScreenName,
                objectName: currentObjectName,
                componentName: currentComponentName,
                date: (new Date()).toString()
            });
            Bento.saveState.save('errorHistory', errorHistory);
        }

        console.log(summary);
    };
    /**
     * Send to Google Analytics (using web API)
     */
    var sendToGa = function (category, action, value, label) {
        var serverId = ErrorHandler.GaId;
        var userId = (navigator.isCocoonJS && window.Cocoon && window.Cocoon.Device) ? window.Cocoon.Device.getDeviceId() : 'unknown';
        var request = new window.XMLHttpRequest();
        var params = 'v=1&tid=' + serverId + '&cid=' + userId + '&t=event&ec=' + category + '&ea=' + action;
        if (label !== void(0)) {
            params += '&el=' + label;
        }
        if (value !== void(0)) {
            params += '&ev=' + value;
        }
        request.open('POST', 'https://www.google-analytics.com/collect', true);
        request.send(params);
    };

    return ErrorHandler;
});