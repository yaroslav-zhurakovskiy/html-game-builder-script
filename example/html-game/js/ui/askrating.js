/**
 * Asks for a rating once
 * @moduleName AskRating
 */
bento.define('ui/askrating', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/gui/clickbutton',
    'bento/gui/counter',
    'bento/gui/text',
    'bento/eventsystem',
    'bento/utils', 'bento/tween',
    'modules/localization',
    'ui/dialog',
    'modules/savemanager'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    ClickButton,
    Counter,
    Text,
    EventSystem,
    Utils,
    Tween,
    Localization,
    Dialog,
    SaveManager
) {
    'use strict';

    var AskRating = function AskRating(settings) {
        var entity;
        var oldPauseLevel = Bento.objects.isPaused();

        if (!AskRating.canAsk()) {
            if (settings.onComplete) {
                settings.onComplete();
            }
            // return a dummy
            return new Entity({});
        }

        entity = new Dialog({
            z: settings.z,
            name: 'askRating',
            canClose: true,
            type: 'yesno',
            titleText: Localization.getText('rateUs'),
            bodyText: Localization.getText('askLike').replace('{TITLE}', Localization.getText('title')),

            height: 110,

            // noIconImage: 'gui2/misc/button_icon_cross',
            onYes: function (dialog) {
                // redirect to app store
                var link = Utils.getStoreLink();
                if (Utils.isNativeIos()) {
                    link += '?action=write-review';
                }
                Utils.openUrl(link);
                dialog.close();
            },
            onNo: function (dialog) {
                // redirect to support form
                var link = 'https://docs.google.com/forms/d/e/1FAIpQLSdtODSDEnRWXQDR-_YxsBsz9d25YOKE8rCFwoVj27vu1qFrxA/viewform';
                Utils.openUrl(link);
                dialog.close();
            },
            onComplete: function onComplete() {
                if (settings.onComplete) {
                    settings.onComplete();
                }
            }
        });

        return entity;
    };

    AskRating.canAsk = function () {
        return !SaveManager.load('askedRating');
    };

    AskRating.askIos10 = function (settings) {
        var parseVersion = function parseVersion(versionString) {
            var versions = versionString.split('.');
            var versionArray = [];
            Utils.forEach(versions, function (numberStr) {
                versionArray.push(parseInt(numberStr));
            });
            return versionArray;
        };

        if (!AskRating.canAsk()) {
            return;
        }

        var version = [0, 0, 0];
        if (window.Cocoon) {
            version = parseVersion(window.device.version);
        }

        // from iOS 10.3.0 there is a new way to present reviews
        if (version[0] * 10000 + version[1] * 100 + version[0] >= 100300) {
            // use the new skstorereviewcontroller, this may or may not appear at all
            try {
                if (window.inappreview) {
                    EventSystem.fire('GameAnalytics-custom', {
                        id: "ratingPopup:ratingShown"
                    });
                    window.inappreview.requestReview(function () {
                        // note: these callbacks are not programmed at all in the plugin...
                    }, function () {
                        // Utils.log('ERROR: inappreview plugin failed');
                    });
                } else {
                    Utils.log("ERROR: inappreview plugin missing");
                }
            } catch (e) {
                Utils.log("ERROR: " + e);
            }
        } else {
            // don't do anything, asking for review is against app store policy (?)
        }
    };

    return AskRating;
});