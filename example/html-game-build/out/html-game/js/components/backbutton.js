/**
 * Handles the backbutton press on Android. Attach this component to ClickButtons. 
 *
 * Also simulates the backbutton by pressing the esc key on keyboard.
 * 
 * If there are no buttons to click on it is recommended to show a dialog to exit the app. 
 * To do this, catch the 'exitApp' event. You should show a dialog before exiting the app.
 * Example:
EventSystem.on('exitApp', function () {
    var dialog = new Dialog({
        name: 'exitAppStandard',
        text: Localization.getText('exit'),
        type: 'yesno',
        ignoreAnalytics: true,
        onYes: function () {
            if (navigator.app) {
                navigator.app.exitApp();
            }
        }
    });
    Bento.objects.attach(dialog);
});
 * 
 * @moduleName BackButton
 * @snippet BackButton|constructor
BackButton({
    onPressed: function (data) {
        data.entity.doCallback();
    }
})
 */
bento.define('components/backbutton', [
    'bento',
    'bento/eventsystem',
    'bento/utils'
], function (
    Bento,
    EventSystem,
    Utils
) {
    'use strict';
    var didCatch = false;
    var onBackButton = function () {
        // pass to Bento EventSystem
        EventSystem.fire('backButton');

        // if no listener caught the event, perform a standard task
        if (!didCatch) {
            // catch this event if you want to show a dialog
            // e.g. catch after preloader, when assets are initialized
            EventSystem.fire('exitApp');
        }
        didCatch = false;
    };
    // catch backbutton event: prevents default Cordova behavior
    document.addEventListener("backbutton", onBackButton, false);

    // esc key
    EventSystem.on('keyDown', function (evt) {
        if (evt && evt.keyCode === 27) {
            onBackButton();
        }
    });

    return function (settings) {
        var viewport = Bento.getViewport();
        var parent = null;
        var clickable;
        var onPressed = settings.onPressed;
        var removeSelf = settings.removeSelf;
        var listener = function () {
            // is the parent paused? (check clickable/clickbutton first)
            if (clickable) {
                if (clickable.isPaused()) {
                    return;
                }
                if (parent && parent.isActive && !parent.isActive()) {
                    didCatch = true;
                    return;
                }
            } else if (parent && Bento.objects.isPaused() > parent.updateWhenPaused) {
                return;
            }
            // a listener caught the backbutton event
            didCatch = true;

            // invoke callback
            if (onPressed) {
                onPressed({
                    entity: parent
                });
            }
            if (removeSelf) {
                parent.remove(component);
                EventSystem.off('backButton', listener);
            }
        };
        var component = {
            z: -10000,
            name: 'backButton',
            attached: function (data) {
                parent = data.entity;
            },
            start: function () {
                // start listening
                EventSystem.on('backButton', listener);
                // find clickable
                parent.getComponent('clickable', function (clickableComponent) {
                    clickable = clickableComponent;
                });
            },
            destroy: function () {
                // remove listener
                EventSystem.off('backButton', listener);
            }
        };

        return component;
    };
});