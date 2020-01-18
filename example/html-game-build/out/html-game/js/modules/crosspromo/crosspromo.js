/**
 * Creates a clickable crosspromo frame with video
 * @moduleName CrossPromo
 */
bento.define('modules/crosspromo/crosspromo', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/components/fill',
    'bento/entity',
    'bento/eventsystem',
    'bento/gui/clickbutton',
    'bento/gui/counter',
    'bento/gui/text',
    'bento/utils',
    'bento/tween',
    'modules/crosspromo/inappstore',
    'bento/packedimage',
    'modules/localization',
    'bento/components/modal',
    'modules/crosspromo/polaroid',
    'components/sortedclickable'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Fill,
    Entity,
    EventSystem,
    ClickButton,
    Counter,
    Text,
    Utils,
    Tween,
    InAppStore,
    PackedImage,
    Localization,
    Modal,
    CrosspromoPolaroid,
    SortedClickable
) {
    'use strict';
    var gameId = '';
    var providerToken = '666586';

    // var downloadComplete = false;
    // var downloadedCrossPromoImage;
    var downloadCrossPromo = function () {
        // step 1: get all available games
        var getGames = function (onComplete) {
            var xhr = new window.XMLHttpRequest();
            var cleanUp = function (json) {
                // clean up received json
                // split it into the available variables
                var games = json.games;
                var waterFalls = json.waterFalls;
                var game;

                titles = json.titles || {};

                // get the waterfall for this game
                promoWaterfallList = waterFalls[gameId] || waterFalls['default'];

                // fill in the store links
                for (game in games) {
                    if (!games.hasOwnProperty(game)) {
                        continue;
                    }
                    // new data
                    storeLinks[game] = storeLinks[game] || {};
                    storeLinks[game].bundleId = games[game].bundleId;
                    storeLinks[game].urlScheme = games[game].urlScheme;
                    if (Utils.isNativeAndroid()) {
                        // on Android, the bundle id is used as urlScheme
                        storeLinks[game].urlScheme = storeLinks[game].bundleId;
                    }

                    // legacy stuff
                    storeLinks[game].iosId = games[game].iosId;
                    // construct links
                    storeLinks[game].ios = 'https://itunes.apple.com/app/apple-store/id' + games[game].iosId;
                    storeLinks[game].android = 'https://play.google.com/store/apps/details?id=' + games[game].bundleId;

                    // save each game in the array
                    promoApps.push(game);
                }

                onComplete(json);
            };

            xhr.open("GET", 'http://d3q8vwl9xlq0g.cloudfront.net/crosspromo/crosspromo.json');
            xhr.onreadystatechange = function () {
                var response;
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            response = JSON.parse(xhr.responseText);
                            cleanUp(response);
                        } catch (e) {
                            // failed to parse: do nothing
                            console.error(e);
                        }
                    } else {
                        // wrong server response
                        console.error('Bad server response: ' + xhr.responseText);
                    }
                }
            };
            xhr.send();
        };
        // step 2: filter all games that were already downloaded: this requires the appAvailability plugin!
        var filterGames = function (onComplete) {
            var game;
            var i;
            var done = 0;
            // we clone the promoApps array because it may change during the loop, 
            // if checkAvailability is fast enough
            var availableGames = promoApps.concat([]);
            var checkAppAvailability = function (gameStr) {
                var urlScheme = (storeLinks[gameStr] || {}).urlScheme;
                // use the plugin
                window.appAvailability.check(
                    urlScheme,
                    function () {
                        // Success callback
                        removeChoice(gameStr);
                        done += 1;
                        checkDoneAvailability();
                    },
                    function () {
                        done += 1;
                        checkDoneAvailability();
                    }
                );
            };
            var checkDoneAvailability = function () {
                if (done === availableGames.length) {
                    onComplete();
                    // prevent onComplete from being called twice by redefining it as an empty function
                    onComplete = function () {};
                }
            };
            // filter self first
            removeChoice(gameId);

            if (!window.appAvailability) {
                // plugin does not exist
                onComplete();
                return;
            }
            if (availableGames.length < 1) {
                // nothing to do
                onComplete();
                return;
            }

            // use the url schemes to check if a game is already downloaded
            for (i = 0; i < availableGames.length; ++i) {
                game = availableGames[i];
                checkAppAvailability(game);
            }
        };
        // step 3: decide on game
        var decideGame = function (onComplete) {
            if (promoApps.length === 0) {
                // user already installed all apps!
                console.log('Crosspromo: no more apps to show.');

                // crosspromo ends here
                return;
            }

            CrossPromo.shuffleApp();

            // done
            onComplete();
        };
        // DEPRECATED step 4A: download the appropiate image
        // var downloadImage = function (onComplete) {};
        // DEPRECATED step 4B: preload the webview
        // var preloadWebview = function (onComplete) {
        //     if (window.Cocoon) {
        //         window.Cocoon.App.loadInTheWebView("crosspromo/index.html");
        //         window.Cocoon.App.WebView.on("load", {
        //             success: function () {
        //                 onComplete();
        //             },
        //             error: function () {
        //                 console.log("Cannot show the Webview for some reason :/");
        //                 console.log(JSON.stringify(arguments));
        //             }
        //         });
        //     }
        // };

        if (window.FBInstant || Utils.WEB) {
            // don't bother on FB
            return;
        }

        canShow = false;
        getGames(function () {
            filterGames(function () {
                decideGame(function () {
                    // downloadImage(function () {
                    //     console.log('Crosspromo download complete: ' + crossPromoApp);
                    // });
                    // preloadWebview(function () {
                    //     console.log('CROSSPROMO ready to show ' + crossPromoApp);
                    //     canShow = true;
                    //     hasLoadedWebview = true;

                    //     // user already intended to show the webview
                    //     if (wantToShowWebview && window.showWebview) {
                    //         window.showWebview();
                    //     }

                    //     if (CrossPromo.onReady) {
                    //         CrossPromo.onReady();
                    //     }
                    // });
                    console.log('CROSSPROMO ready to show ' + crossPromoApp);
                    canShow = true;

                    if (CrossPromo.onReady) {
                        CrossPromo.onReady();
                    }
                });
            });
        });
    };

    var onClick;
    var onClose;
    var canShow = false;

    var timesPromoShown;
    var referrer = {
        ios: '?pt=666586&ct=' + gameId + '&mt=8',
        campaignToken: gameId,
        providerToken: providerToken,

        android: '&referrer=utm_source%3D' + gameId + '%26utm_medium%3Dcrosspromo%26utm_campaign%3Dcrosspromo'
    };
    // filled by downloadCrossPromo
    var promoApps = [];
    var promoWaterfallList = [];
    var storeLinks = {};
    var titles = {};
    var titleLocalizations = {};
    var installedGames = {
        // nomcat: true
    };
    var removeChoice = function (name) {
        console.log('Crosspromo: Already has ' + name);

        // DEPRECATED: instead open app if user already has app
        installedGames[name] = true;
        return;

        /*
        var index = -1;
        while (promoWaterfallList.indexOf(name) != -1) {
            index = promoWaterfallList.indexOf(name);
            if (index >= 0) {
                promoWaterfallList.splice(index, 1);
            } else {
                break;
            }
        }
        while (promoApps.indexOf(name) != -1) {
            index = promoApps.indexOf(name);
            if (index >= 0) {
                promoApps.splice(index, 1);
            } else {
                break;
            }
        }*/
    };
    var getTitle = function () {
        var currentLanguage = Localization.getLanguage();
        return titleLocalizations[currentLanguage] || titleLocalizations.en || 'error';
    };
    var hasApp = function (name) {
        return installedGames[name] || false;
    };

    var crossPromoApp = ''; // key string for storeLinks
    var hasLoadedStore = false;
    var failedInAppStore = false;
    var preload = function () {
        var isAtLeastIos9 = function () {
            var version;
            var os;
            if (!window.device || !window.device.version) {
                // Utils.log("LK_ERROR: Can't find window.device.version");
                return false;
            }
            version = window.device.version;
            os = parseInt(version.substring(0, version.indexOf('.')));

            return os > 8;
        };

        // newest version of in app store plugin (as of December 2016) crashes on iOS versions lower than 9
        if (isAtLeastIos9() === false) {
            // console.log("LK_LOG: iOS version is lower than 9. Can't use InAppStore plugin.");
            failedInAppStore = true;
            return;
        }

        InAppStore.open(storeLinks[crossPromoApp].iosId, referrer.campaignToken, referrer.providerToken, function () {
            console.log('Crosspromo: done preloading inappstore');
            hasLoadedStore = true;
        }, function () {
            console.log('Crosspromo: Could not load In App Store');
            failedInAppStore = true;
        });
    };
    /**
     * @snippet CrossPromo()|constructor
CrossPromo({
    z: 0,
    position: new Vector2(96, 96),
    size: new Rectangle(0, 0, 128, 128),
    rotation: 0
})
     */
    var CrossPromo = function (settings) {
        var entity = new CrosspromoPolaroid(settings);
        var clickable = new SortedClickable({
            onClick: function (data) {
                // open
                CrossPromo.openCrossPromo();
                if (onClick) {
                    onClick(crossPromoApp);
                }
            }
        });

        entity.attach(new Object({
            name: 'behavior',
            start: function () {
                if (canShow) {
                    timesPromoShown += 1;
                    Bento.saveState.save('timesPromoShown', timesPromoShown);
                }
            },
            destroy: function (data) {
                if (onClose) {
                    onClose(crossPromoApp);
                }
            }
        }));
        entity.attach(clickable);

        if (!canShow) {
            Utils.log('WARNING: Crosspromo is not ready to be shown.');
            entity.visible = false;
        } else {
            // set video url
            entity.setVideoUrl(["./lib/crosspromo/" + crossPromoApp + ".mp4", "https://d3q8vwl9xlq0g.cloudfront.net/crosspromo/mp4/" + crossPromoApp + ".mp4"]);
        }

        return entity;
    };
    /**
     * Picks a different app for crosspromo
     * @snippet Crosspromo.shuffleApp()|snippet 
     */
    CrossPromo.shuffleApp = function () {
        if (promoApps.length === 0) {
            // user already installed all apps!
            console.log('Crosspromo: no more apps to show.');

            // crosspromo ends here
            return;
        }

        // get next app
        var index = timesPromoShown % promoWaterfallList.length;
        crossPromoApp = promoWaterfallList[index];

        if (Utils.isNativeIos()) {
            // preload the InAppStore module
            preload();
        }

        titleLocalizations = titles[crossPromoApp];
    };
    /**
     * @snippet CrossPromo.init()|snippet
CrossPromo.init({
    gameId: 'myGameId',
    providerToken: '666586',
    onClick: function (gameId) {},
    onClose: function () {
        // optional: show a new app after destroy
        CrossPromo.shuffleApp();
    }
})
     */
    CrossPromo.init = function (settings) {
        onClick = settings.onClick;
        onClose = settings.onClose;
        gameId = settings.gameId || 'kaijurush';
        providerToken = settings.providerToken || '';

        timesPromoShown = Bento.saveState.load('timesPromoShown', 0);

        // prepare asap
        downloadCrossPromo();
    };
    CrossPromo.canShow = function () {
        return canShow;
    };
    CrossPromo.openCrossPromo = function () {
        var openUrl = function (url) {
            Utils.openUrl(url);
        };
        if (hasApp(crossPromoApp)) {
            if (Utils.isNativeAndroid()) {
                // crashes the game for some reason, opening the store for now
                openUrl(storeLinks[crossPromoApp].android);
                return;
            }
            openUrl(storeLinks[crossPromoApp].urlScheme);
            return;
        }

        if (Utils.isNativeAndroid()) {
            // android: just open the link
            openUrl(storeLinks[crossPromoApp].android);
        } else if (Utils.isNativeIos()) {
            // ios: try inappstore first
            if (failedInAppStore) {
                openUrl(storeLinks[crossPromoApp].ios);
            } else {
                InAppStore.show();

                preload();
            }
        } else {
            openUrl(storeLinks[crossPromoApp].ios);
        }
    };
    CrossPromo.currentEntity = null;

    return CrossPromo;
});