/**
 * Extends utils with more useful functions.
 * See bento/utils
 */
bento.define('utils', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/utils',
    'bento/tween',
    'modules/localization',
    'bento/eventsystem',
    'modules/gameanalytics',
    'modules/savemanager',
    'modules/skinmanager',
    'bento/gui/text'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    Utils,
    Tween,
    Localization,
    EventSystem,
    GameAnalytics,
    SaveManager,
    SkinManager,
    Text
) {
    'use strict';


    /* --- CUSTOM SNIPPETS ---

    * @snippet Parameters Breaker
    // --- PARAMETERS ---
    * @snippet Variables Breaker
    // --- VARS ---
    * @snippet Functions Breaker
    // --- FUNCTIONS ---
    * @snippet Components Breaker
    // --- COMPONENTS ---
    * @snippet Entity Breaker
    // --- ENTITY ---
    
    */

    var fonts = {
        reg: {
            default: {
                fontName: 'font',
                offset: {
                    x: 0,
                    y: 0
                },
                scale: 1,
                linebreaksOnlyOnSpace: true
            },
            ja: {
                fontName: 'japanese-russian',
                offset: {
                    x: 0,
                    y: -1
                },
                scale: 0.8
            },
            ko: {
                fontName: 'korean',
                offset: {
                    x: 0,
                    y: -0.6
                },
                scale: 1
            },
            ru: {
                fontName: 'japanese-russian',
                offset: {
                    x: 0,
                    y: -1
                },
                scale: 0.8,
                linebreaksOnlyOnSpace: true
            },
            zh: {
                fontName: 'chinsimp',
                offset: {
                    x: 0,
                    y: -0.6
                },
                scale: 1
            },
            zt: {
                fontName: 'chintrad',
                offset: {
                    x: 0,
                    y: -0.6
                },
                scale: 1
            }
        },
        bold: {
            default: {
                fontName: 'luckiest_guy',
                offset: {
                    x: 0,
                    y: 0
                },
                scale: 1,
                linebreaksOnlyOnSpace: true
            },
            ja: {
                fontName: 'japanese-russian',
                offset: {
                    x: 0,
                    y: -1
                },
                scale: 0.8
            },
            ko: {
                fontName: 'korean',
                offset: {
                    x: 0,
                    y: -0.4
                },
                scale: 1
            },
            ru: {
                fontName: 'japanese-russian',
                offset: {
                    x: 0,
                    y: -1
                },
                scale: 0.8,
                linebreaksOnlyOnSpace: true
            },
            zh: {
                fontName: 'chinsimp',
                offset: {
                    x: 0,
                    y: -0.6
                },
                scale: 1
            },
            zt: {
                fontName: 'chintrad',
                offset: {
                    x: 0,
                    y: -0.6
                },
                scale: 1
            }
        }
    };
    var cascadeStlye = function (style1, style2) {
        return Utils.extend(Utils.copyObject(style1), style2);
    };
    var textStyles = {};
    /* BUTTONS */
    textStyles.cheer = {
        font: 'bold',
        fontSize: 19,
        align: 'center',
        textBaseline: 'middle',
        lineWidth: 1,
        fontColor: '#F25CD4',
        strokeStyle: '#FFFF6B',
        ySpacing: 1,
        pixelStroke: true,
        linebreaks: true
    };
    textStyles.tutorial = {
        font: 'reg',
        fontSize: 16,
        align: 'center',
        textBaseline: 'middle',
        lineWidth: 1,
        fontColor: '#4157CA',
        strokeStyle: '#f3f0e7',
        ySpacing: 1,
        pixelStroke: true,
        linebreaks: true
    };
    textStyles.dialogTitle = {
        font: 'bold',
        fontSize: 16,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.dialogBody = {
        font: 'reg',
        fontSize: 12,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#4157CA',
        linebreaks: true
    };
    textStyles.tabTitle = {
        font: 'bold',
        fontSize: 10,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.randomButtonText = {
        font: 'bold',
        fontSize: 8,
        fontColor: '#0cccb9',
        align: 'center',
        textBaseline: 'middle'
    };
    textStyles.unlockedCountText = {
        font: 'bold',
        fontSize: 16,
        fontColor: '#fbffbe',
        align: 'right',
        textBaseline: 'middle',
    };
    textStyles.lockedCountText = {
        font: 'bold',
        fontSize: 10,
        fontColor: '#fbffbe',
        align: 'left',
        textBaseline: 'middle',
    };
    textStyles.unlockedCountTitle = {
        font: 'bold',
        fontSize: 12,
        fontColor: '#fbffbe',
        align: 'center',
        textBaseline: 'middle',
    };
    textStyles.nameTitle = {
        font: 'bold',
        fontSize: 16,
        fontColor: '#4157CA',
        align: 'center',
        textBaseline: 'middle',
        linebreaks: true,
        margin: new Vector2(12, 12)
    };
    textStyles.nameDescription = {
        font: 'bold',
        fontSize: 10,
        fontColor: '#1b9a87',
        align: 'center',
        textBaseline: 'middle',
        linebreaks: true,
        margin: new Vector2(12, 12)
    };
    textStyles.toast = {
        font: 'bold',
        fontSize: 8,
        fontColor: '#8AD9B1',
        align: 'center',
        textBaseline: 'middle',
        linebreaks: true
    };
    textStyles.toastSpecial = cascadeStlye(textStyles.toast, {
        fontColor: '#fbffb6'
    });
    textStyles.cutscene = cascadeStlye(textStyles.toastSpecial, {
        fontSize: 10,
        fontColor: '#4157CA',
        align: 'center',
    });
    textStyles.levelText = {
        font: 'luckiest_guy',
        fontSize: 14,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#5db7a2',
        linebreaks: true
    };
    textStyles.growingTitleText = {
        font: 'bold',
        fontSize: 16,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#4157CA',
        linebreaks: true
    };
    textStyles.growingSubtitleText = {
        font: 'reg',
        fontSize: 8,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#1ec4a9',
        linebreaks: true
    };
    textStyles.growButtonText = {
        font: 'bold',
        fontSize: 9,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.continueTitle = {
        font: 'bold',
        fontSize: 18,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.continueSkip = {
        font: 'bold',
        fontSize: 18,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#6fe3ba',
        linebreaks: true
    };
    textStyles.potDialogName = {
        font: 'bold',
        fontSize: 16,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#4157CA',
        linebreaks: true
    };
    textStyles.potPrice = {
        font: 'bold',
        fontSize: 8,
        align: 'left',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.potLevel = {
        font: 'bold',
        fontSize: 8,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.fastGrowTabText = {
        font: 'reg',
        fontSize: 8,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.progressIndicatorText = {
        font: 'luckiest_guy',
        fontSize: 10,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        lineWidth: 1,
        strokeStyle: "#3352be",
        linebreaks: false
    };
    textStyles.progressIndicator = {
        font: 'luckiest_guy',
        fontSize: 16,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        lineWidth: 1,
        strokeStyle: "#3352be",
        linebreaks: false
    };
    textStyles.vipButtonTry = {
        font: 'bold',
        fontSize: 14,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.vipButtonGet = {
        font: 'bold',
        fontSize: 14,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.vipButtonOffer = {
        font: 'bold',
        fontSize: 11,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#6fe3ba',
        linebreaks: true
    };
    textStyles.vipScreenText = {
        font: 'bold',
        fontSize: 12,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#4157ca',
        linebreaks: true
    };
    textStyles.iapOverlay = {
        font: 'bold',
        fontSize: 10,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.settingsMenu = {
        font: 'bold',
        fontSize: 12,
        fontColor: '#4bbd96',
        align: 'left',
        textBaseline: 'middle',
        linebreaks: true,
        margin: new Vector2(12, 12)
    };
    textStyles.newBean = {
        font: 'bold',
        fontSize: 16
    };
    textStyles.fever = {
        font: 'bold',
        fontSize: 24,
        fontColor: '#F25CD4',
        align: 'center',
        textBaseline: 'middle',
        ySpacing: 0,
        lineWidth: 1, // set to add an outline
        strokeStyle: '#fbffbe'
    };
    textStyles.conversionText = {
        font: 'bold',
        fontSize: 11,
        maxWidth: 80,
        linebreaks: false,
        fontColor: '#2f5bc1',
        align: 'center',
        textBaseline: 'middle'
    };
    textStyles.tabUnlockedCountTextLeft = {
        font: 'bold',
        fontSize: 5,
        fontColor: '#fbffbe',
        align: 'right',
        textBaseline: 'middle',
    };
    textStyles.tabUnlockedCountTextRight = {
        font: 'bold',
        fontSize: 5,
        fontColor: '#fbffbe',
        align: 'left',
        textBaseline: 'middle',
    };
    textStyles.pauseScreen = {
        font: 'bold',
        fontSize: 24,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.vipTestDriveSubtitle = {
        font: 'bold',
        fontSize: 8,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#4157CA',
        linebreaks: true
    };
    textStyles.shopTitles = {
        font: 'bold',
        fontSize: 12,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#4157CA',
        linebreaks: true
    };
    textStyles.shopPrices = {
        font: 'bold',
        fontSize: 12,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.noAdsPurchase = {
        font: 'bold',
        fontSize: 8,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };
    textStyles.skinSelectorTitle = {
        font: 'bold',
        fontSize: 8,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#0cccb9',
        linebreaks: true
    };
    textStyles.bestValue = {
        font: 'bold',
        fontSize: 6,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#ffeb65',
        linebreaks: true
    };
    textStyles.badgeCount = {
        font: 'bold',
        fontSize: 10,
        align: 'center',
        textBaseline: 'middle',
        fontColor: '#fbffbe',
        linebreaks: true
    };

    var utils = {
        getStoreLink: function (device) {
            // TODO: double check these URLs before launch
            var links = {
                web: 'https://itunes.apple.com/us/app/go-slice/id1449269813',
                ios: 'https://itunes.apple.com/us/app/go-slice/id1449269813',
                android: 'https://play.google.com/store/apps/details?id=com.luckykat.plant'
            };
            var link = links.web;
            if (!device) {
                // try to determine automatically
                if (Utils.isNativeIos()) {
                    link = links['ios'];
                } else if (Utils.isNativeAndroid()) {
                    link = links['android'];
                }
            } else if (links[device]) {
                link = links[device];
            }
            return link;
        },
        versionToHex: function versionToHex(versionStr) {
            var parts = versionStr.split('.').map(function (s) {
                return parseInt(s) & 0xff;
            });
            return parts[0] << 16 | parts[1] << 8 | parts[2];
        },
        findInBento: function (needle, haystack) {
            //recursive search for game Objects, probably keep to only dev-work.  
            if (typeof haystack === "undefined") {
                haystack = Bento.getObjects();
            }
            var checkEntry = function (obj) {
                if (obj.hasOwnProperty("name") && obj.name === needle) {
                    return obj;
                }
                if (obj.hasOwnProperty("components")) {
                    var deepResult = Utils.findInBento(needle, obj.components);
                    if (deepResult) {
                        return deepResult;
                    }
                }
            };
            if (Array.isArray(haystack)) {
                for (var i = 0; i < haystack.length; i++) {
                    var check = checkEntry(haystack[i]);
                    if (check) {
                        return check;
                    }
                }
            } else {
                return checkEntry(haystack);
            }
            return false;
        },

        unlockLevelSkins: function () {
            var unlockedSkin;
            Utils.forEach(SkinManager.getAllLockedPotSkins(), function (potSkin, i, l, breakLoop) {
                var unlockMethod = SkinManager.getPotSkinUnlockMethod(potSkin);
                if (unlockMethod && unlockMethod.method === "level" && unlockMethod.value < SaveManager.load("currentLevel")) {
                    SkinManager.makePotSkinUnlocked(potSkin);
                    unlockedSkin = potSkin;
                }
            });
            return unlockedSkin;
        },

        /**
         * Wrapper for tweens to simulate a timeout
         */
        timeout: function (time, callback) {
            var tween = new Tween({
                from: 0,
                to: 1,
                in: time,
                ease: 'linear',
                onComplete: callback
            });
            return tween;
        },

        getTextStyle: function (styleName) {
            var style = {};
            if (textStyles.hasOwnProperty(styleName)) {
                style = Utils.copyObject(textStyles[styleName]);
            }
            if (style.hasOwnProperty('font') && fonts.hasOwnProperty(style.font)) {

                //get language font
                var font;
                if (fonts[style.font].hasOwnProperty(Localization.getLanguage())) {
                    font = fonts[style.font][Localization.getLanguage()];
                } else {
                    font = fonts[style.font].default;
                }
                style.font = font.fontName;
                if (font.hasOwnProperty('linebreaksOnlyOnSpace')) {
                    style.linebreaksOnlyOnSpace = font.linebreaksOnlyOnSpace;
                }

                //scale fontsize according to font settings
                if (font.hasOwnProperty('scale') && font.scale !== 1 && style.hasOwnProperty('fontSize')) {
                    style.fontSize = Math.round(font.scale * style.fontSize);
                }
                //offset font according to font settings
                if (font.offset.x !== 0 || font.offset.y !== 0) {
                    style.offset = Utils.copyObject(font.offset);
                    //scale by font size
                    style.offset.x = style.offset.x * (style.fontSize / 8);
                    style.offset.y = style.offset.y * (style.fontSize / 8);
                }
            }
            return style;
        },

        killAnimateKeyframes: function (gameObject) {
            if (gameObject.hasOwnProperty('keyFramesTween')) {
                gameObject.keyFramesTween.stop();
                delete gameObject.keyFramesTween;
            }
        },
        animateKeyframes: function (gameObject, keyframes, keyframe) {
            if (gameObject.hasOwnProperty('keyFramesTween')) {
                Utils.killAnimateKeyframes(gameObject);
            }
            var values = keyframes[keyframe];
            if (Utils.isDefined(values.run)) {
                values.run();
            }
            var duration = Utils.isDefined(values.duration) ? values.duration : 0;
            var startLeft = gameObject.position.x;
            var endLeft = Utils.isDefined(values.moveRightBy) ? gameObject.position.x + values.moveRightBy : gameObject.position.x;
            var startTop = gameObject.position.y;
            var endTop = Utils.isDefined(values.moveDownBy) ? gameObject.position.y + values.moveDownBy : gameObject.position.y;
            var startRotation = gameObject.rotation;
            var endRotation = Utils.isDefined(values.rotateBy) ? gameObject.rotation + values.rotateBy : gameObject.rotation;
            var startScaleX = gameObject.scale.x;
            var endScaleX = Utils.isDefined(values.scaleXBy) ? gameObject.scale.x + values.scaleXBy : gameObject.scale.x;
            var startScaleY = gameObject.scale.y;
            var endScaleY = Utils.isDefined(values.scaleYBy) ? gameObject.scale.y + values.scaleYBy : gameObject.scale.y;
            var nextKey = Utils.isDefined(values.next) ? values.next : keyframe + 1;
            gameObject.keyFramesTween = new Tween({
                from: 0,
                to: 1,
                in: duration,
                ease: (keyframe % 2 === 1) ? 'easeInSine' : 'easeOutSine',
                onUpdate: function (v, t) {
                    gameObject.position.x = startLeft + (endLeft - startLeft) * v;
                    gameObject.position.y = startTop + (endTop - startTop) * v;
                    gameObject.rotation = startRotation + (endRotation - startRotation) * v;
                    gameObject.scale.x = startScaleX + (endScaleX - startScaleX) * v;
                    gameObject.scale.y = startScaleY + (endScaleY - startScaleY) * v;
                },
                onComplete: function () {
                    delete gameObject.keyFramesTween;
                    if (keyframes.length > nextKey) {
                        Utils.animateKeyframes(gameObject, keyframes, nextKey);
                    }
                }
            });
        },

        // completely locks the game for X milliseconds (needs mobile testing)
        sleep: function (milliseconds) {
            var endTime = new Date().getTime() + milliseconds;
            while (new Date().getTime() < endTime) {}
        },
        closestAngle: function (a1, a2) {
            return Utils.toRadian(((Utils.toDegree(a1) - Utils.toDegree(a2)) + 540) % 360 - 180);
        },
        promptText: function (title, prompt, successCallback) {
            if (Utils.isCocoonJS() && window.Cocoon) {
                window.Cocoon.Dialog.prompt({
                    title: title,
                    message: prompt
                }, {
                    success: successCallback,
                    cancel: function () {}
                });
            } else {
                var res = window.prompt(prompt);
                if (res) {
                    successCallback(res);
                }
            }
        },

        // --- PSUEDO RANDOMNESS ---
        pseudoRandomSeed: 0,
        //returns a pseudo random number up to the cap
        setPseudoRandomSeed: function (seed) {
            utils.pseudoRandomSeed = seed % 2147483646;
            if (utils.pseudoRandomSeed < 0) utils.pseudoRandomSeed += 2147483646;
        },
        //returns a pseudo random integer number up to the cap
        getPseudoRandom: function (maxNumber) {
            utils.pseudoRandomSeed = utils.pseudoRandomSeed * 16807 % 2147483647;
            return utils.pseudoRandomSeed % maxNumber;
        },
        //returns a pseudo random integer number up to the cap
        getPseudoRandomRange: function (minNumber, maxNumber) {
            utils.pseudoRandomSeed = utils.pseudoRandomSeed * 16807 % 2147483647;
            return minNumber + (utils.pseudoRandomSeed % (maxNumber - minNumber));
        },
        //returns a pseudo random float number up to the cap
        getPseudoRandomFloat: function (maxNumber) {
            utils.pseudoRandomSeed = utils.pseudoRandomSeed * 16807 % 2147483647;
            return ((utils.pseudoRandomSeed - 1) / 2147483647) * maxNumber;
        },
        //returns a pseudo random float number up to the cap
        getPseudoRandomRangeFloat: function (minNumber, maxNumber) {
            utils.pseudoRandomSeed = utils.pseudoRandomSeed * 16807 % 2147483647;
            return minNumber + ((utils.pseudoRandomSeed - 1) / 2147483647) * (maxNumber - minNumber);
        },

        // --- CURRENCY ---
        giveCoins: function (amount, sourceType, sourceId) {
            if (amount <= 0) {
                console.log("WARNING: Can't give negative or zero coin amount!");
                return;
            }
            var coinCount = SaveManager.load('coinCount');
            coinCount += amount;
            SaveManager.save('coinCount', coinCount);
            //console.log("Given " + amount + " coins!");
            EventSystem.fire('coinsUpdated', coinCount);
            if (sourceType && sourceId) {
                EventSystem.fire('GameAnalytics-addResourceEvent', {
                    flowType: 1,
                    currency: 'coins',
                    amount: amount,
                    itemType: sourceType,
                    itemId: sourceId
                });
            }
        },
        takeCoins: function (amount, sinkType, sinkId) {
            if (amount <= 0) {
                console.log("WARNING: Can't take negative or zero coin amount!");
                return;
            }
            var coinCount = SaveManager.load('coinCount');
            coinCount -= amount;
            SaveManager.save('coinCount', coinCount);
            //console.log("Taken " + amount + " coins!");
            EventSystem.fire('coinsUpdated', coinCount);
            if (sinkType && sinkId) {
                EventSystem.fire('GameAnalytics-addResourceEvent', {
                    flowType: 2,
                    currency: 'coins',
                    amount: amount,
                    itemType: sinkType,
                    itemId: sinkId
                });
            }
        },

        openUrl: function (url) {
            if (window.cordova && window.cordova.InAppBrowser) {
                window.cordova.InAppBrowser.open(url, '_system');
            } else {
                window.open(url, '_blank');
            }
        },

        preloadedVIPTerms: null,
        preloadVIPTerms: function (IapOverlay) {
            if (Utils.preloadedVIPTerms) {
                // they're already preloaded
                return;
            }
            var viewport = Bento.getViewport();
            var subscriptionTermsString = Localization.getText('subscriptionTerms')
                .replace('{SUBSCRIPTIONNAME}', Localization.getText('title'))
                .replace('{DAYS}', '3')
                .replace('{PRICE}', IapOverlay.getPrice((window.IAPPREFIX + '_vip'), '$3.99'))
                .replace('{FEATURES}', Localization.getText('subscriptionFeatures'))
                .replace('{SERVICE}', (Utils.isNativeIos()) ? 'Apple App Store' : 'Google Play Store');
            Utils.preloadedVIPTerms = new Text({
                name: 'preloadedVIPTerms',
                position: new Vector2(0, 0),
                text: subscriptionTermsString,
                fontSize: 5,
                fontColor: '#bbb',
                align: 'left',
                textBaseline: 'top',
                maxWidth: viewport.width - 16,
                maxHeight: 56
            });
            Utils.preloadedVIPTerms.draw();
        },
        getPreloadedVIPTerms: function () {
            if (!Utils.preloadedVIPTerms) {
                Utils.preloadVIPTerms();
            }
            return Utils.preloadedVIPTerms;
        },
        hexToColor: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255, 1] : null;
        },
    };


    Utils.extend(Utils, utils);
    return Utils;
});