/**
 * Cloud save module
 * Call loadFromCloud at the beginning of the game and use saveToCloud when closing the game.
 * Preferably as much as possible, but saveToCloud uses stringify to save all values and thus
 * can be performance heavy if used all the time.
 * 
 * @moduleName CloudSave
 */
bento.define('modules/cloudsave', [
    'bento',
    'utils',
    'lzstring',
    'modules/awscloudsave',
    'modules/fbinstantcloudsave',
    'modules/savemanager'
], function (
    Bento,
    Utils,
    LZString,
    AwsCloudSave,
    FBInstantCloudSave,
    SaveManager
) {
    'use strict';
    var CloudModule;
    var hasCloudSave = false;
    var currentSave;
    var cloudSave = {};
    var serviceName = '';
    /**
     * Game specific values and actions
     */
    // unique id per game
    var cloudSaveId = '';
    // keys not to save, these are typically the values that are saved during init.js
    // or keys with a lot of data such as base64 strings 
    var excludedKeys = [
        'muteSound',
        'muteMusic',
        'showDeveloperCheats',
        'promptGooglePlayOnBoot',
        'notificationsAllowed',
        'notifications', // scheduled notifications could be different between devices
    ];
    /**
     * Saving and loading specifics
     */
    var getCurrentSave = function () {
        var i;
        var len;
        var storageCopy = {};
        var keys = Bento.saveState.getKeys();

        for (i = 0, len = keys.length; i < len; ++i) {
            if (excludedKeys.indexOf(keys[i]) >= 0) {
                // skip excluded keys
                continue;
            }
            storageCopy[keys[i]] = Bento.saveState.load(keys[i]);
        }

        return storageCopy;
    };
    var saveToCloud = function (onComplete) {
        var stringifiedSaveFile;
        var compressedSaveFile;

        try {
            stringifiedSaveFile = JSON.stringify(currentSave);
        } catch (e) {
            Utils.log('Unable to stringify save file');
            if (onComplete) {
                onComplete(false, 'stringifyError');
            }
            return;
        }

        try {
            compressedSaveFile = LZString.compressToBase64(stringifiedSaveFile);
        } catch (e) {
            Utils.log('Unable to compress save file');
            if (onComplete) {
                onComplete(false, 'compressError');
            }
            return;
        }

        // save data to cloud!
        var snapshot = {
            identifier: cloudSaveId,
            title: cloudSaveId,
            description: 'Save file for ' + cloudSaveId,
            data: compressedSaveFile,
            date: Date.now()
        };

        if (snapshot.data) {
            CloudModule.writeSavedGame(
                snapshot,
                function () {
                    // success on saving to cloud
                    if (onComplete) {
                        onComplete(true);
                    }
                },
                function (error) {
                    // something went wrong?
                    Utils.log('Cloud save error: ' + JSON.stringify(error));
                    if (onComplete) {
                        onComplete(false, 'cloudSaveError');
                    }
                    return;
                }
            );
        } else {
            // there's nothing to save
            Bento.objects.resume();
        }
    };
    var loadFromCloud = function (onComplete) {
        // get the savefile in the cloud
        CloudModule.loadSavedGame(
            cloudSaveId,
            function (snapshot) {
                var decompressedSaveFile;

                // success
                if (snapshot && snapshot.data) {
                    try {
                        decompressedSaveFile = LZString.decompressFromBase64(snapshot.data);
                    } catch (e) {
                        Utils.log('Savefile corrupted!');
                        if (onComplete) {
                            onComplete(false, 'cloudSaveCorrupt');
                        }
                        return;
                    }

                    try {
                        cloudSave = JSON.parse(decompressedSaveFile);
                    } catch (e) {
                        Utils.log('Savefile corrupted!');
                        if (onComplete) {
                            onComplete(false, 'cloudSaveCorrupt');
                        }
                        return;
                    }

                    if (!cloudSave) {
                        Utils.log('No save file found');
                        if (onComplete) {
                            // no cloud save exists, but we consider the action a success
                            onComplete(true, 'cloudSaveNone');
                        }
                        return;
                    }

                    // success
                    if (onComplete) {
                        onComplete(true, cloudSave);
                    }

                } else {
                    Utils.log('No save file found');
                    if (onComplete) {
                        // no cloud save exists, but we consider the action a success
                        onComplete(true, 'cloudSaveNone');
                    }
                }
            },
            function (error) {
                if (error !== null) {
                    // fail
                    console.log('error cloudsave', JSON.stringify(error));
                    if (onComplete) {
                        onComplete(false, 'pluginError');
                    }
                } else {
                    // no snapshot available?
                    console.log('No cloud save found');
                    hasCloudSave = false;
                    if (onComplete) {
                        // no cloud save exists, but we consider the action a success
                        onComplete(true, 'cloudSaveNone');
                    }
                }
            }
        );
    };
    var isLoggedIn = function () {
        // logging in requirement only for GP and GC
        if (serviceName === 'AWS') {
            return true;
        } else if (Utils.isNativeAndroid()) {
            return GooglePlay.isLoggedIn();
        } else if (Utils.isNativeIos()) {
            return GameCenter.isLoggedIn();
        } else {
            return true;
        }
    };

    /**
     * Deprecated
     * Google Play and GameCenter require logging in first
     */
    var login = function (onComplete) {
        if (serviceName === 'GooglePlay') {
            // try to login with Google Play
            // if (!GooglePlay.isLoggedIn()) {
            //     GooglePlay.GooglePlayGames.login(function (success, error) {
            //         if (!success) {
            //             console.log(error);
            //         }
            //         if (onComplete) {
            //             onComplete(success);
            //         }
            //     });
            // } else {
            //     // already logged in
            //     if (onComplete) {
            //         onComplete(true);
            //     }
            // }
        } else if (serviceName === 'GameCenter') {
            // try to login with GameCenter
            // if (!GameCenter.isLoggedIn()) {
            //     GameCenter.login(function (hasLoggedIn, response) {
            //         if (onComplete) {
            //             onComplete(hasLoggedIn, response);
            //         }
            //     });
            // } else {
            //     // already logged in
            //     if (onComplete) {
            //         onComplete(true);
            //     }
            // }
        } else {
            // no need to login
            if (Utils.isDev()) {
                cloudSaveId = 'dev';
                if (onComplete) {
                    onComplete(true);
                }
            } else if (isFacebookInstant()) {
                cloudSaveId = 'FBInstant';
                if (onComplete) {
                    onComplete(true);
                }

            } else {
                console.log('Cloud saving not available');
            }
            return;
        }
    };

    /**
     * Set up
     */
    var setup = function () {
        // if (serviceName === 'GooglePlay') {
        //     CloudModule = GooglePlay;
        // } else if (serviceName === 'GameCenter') {
        //     CloudModule = GameCenter;
        // } else if (serviceName === 'FBInstant') {
        //     CloudModule = FBInstantCloudSave;
        // } else if (serviceName === 'AWS') {
        //     CloudModule = AwsCloudSave;
        // } else {
        //     return;
        // }
        CloudModule = AwsCloudSave;
    };
    var isFacebookInstant = function () {
        return serviceName === 'FBInstant';
    };

    var CloudSave = {
        /**
         * @snippet CloudSave.init()|snippet
CloudSave.init({
    // possible values: 'GooglePlay', 'GameCenter', 'FBInstant', 'AWS'
    serviceName: 'AWS',
    // unique id per game
    cloudSaveId: '', 
    // list of keys that should not be saved, consider large data or values that differ per device
    excludedKeys: [
        'muteSound',
        'muteMusic',
        'showDeveloperCheats',
        'notificationsAllowed',
        'notifications',
    ],
    // initialization data for AWS, if used
    // if you don't know all parameters yet, skip this and call AwsCloudSave.init() later
    AWS: {
        // AWS url returned by claudia
        apiUrl: 'https://XXXX.execute-api.us-east-1.amazonaws.com/latest',
        // unique id per user and cross platform, example: gc_<GAMECENTER ID>, gp_<GOOGLEPLAY ID>
        userId: '',
        // optional, additional data sent to the server
        additionalData: {},
        // optional, when using API key in AWS Gateway API
        apiKey: ''
    }
});
         */
        init: function (settings) {
            cloudSaveId = settings.cloudSaveId;
            excludedKeys = settings.excludedKeys || [];
            serviceName = settings.serviceName;

            setup();

            if (serviceName === 'AWS' && settings.AWS) {
                AwsCloudSave.init(settings.AWS);
            }
        },
        useCloudSave: true,
        isAvailable: function () {
            return true;
        },
        login: login,
        lastWriteStatus: 'none',
        isLoggedIn: function () {
            return isLoggedIn();
        },
        /**
         * @snippet CloudSave.saveToCloud()|Snippet
CloudSave.saveToCloud(function (success, errorMsg) {
    if (!success) {
        console.log(errorMsg);
        return;
    }
});
         */
        saveToCloud: function (onComplete) {
            if (!CloudSave.useCloudSave) {
                if (onComplete) {
                    onComplete(false, 'turnedOff');
                }
                return;
            }
            setup();
            if (isLoggedIn() && CloudModule) {
                // read the local save file
                currentSave = getCurrentSave();
                // save to cloud
                saveToCloud(function (success, error) {
                    if (!success) {
                        CloudSave.lastWriteStatus = 'failed';
                    } else {
                        CloudSave.lastWriteStatus = 'success';
                    }
                    if (onComplete) {
                        onComplete(success, error);
                    }
                });
            } else {
                if (onComplete) {
                    onComplete(false, 'notLoggedIn');
                }
            }
        },
        /**
         * @snippet CloudSave.loadFromCloud()|Snippet
CloudSave.loadFromCloud(function (success, errorMsg) {
    if (!success) {
        console.log(errorMsg);
        return;
    }
    // Bento.saveState will be automatically updated here
});
         */
        loadFromCloud: function (onComplete) {
            if (!CloudSave.useCloudSave) {
                console.log('Cloud saving feature is turned off.');
                if (onComplete) {
                    onComplete(false, 'turnedOff');
                }
                return;
            }
            var excludedValues = {};
            setup();
            if (isLoggedIn() && CloudModule) {
                loadFromCloud(function (success, reason) {
                    var newMethod = false;
                    var shouldOverwrite = success && reason !== 'cloudSaveNone'; // don't overwrite if there was nothing to load
                    var clearAndOverwriteSave = function () {
                        // old method: clear save file and write new values

                        var key;
                        // cache excluded keys and values
                        Utils.forEach(excludedKeys, function (excludedKey) {
                            var value = Bento.saveState.load(excludedKey, null);
                            if (value !== null) {
                                excludedValues[excludedKey] = value;
                            }
                        });

                        // clear local save file (?)
                        Bento.saveState.clear();

                        // restore excluded keys
                        Utils.forEach(excludedValues, function (value, excludedKey) {
                            Bento.saveState.save(excludedKey, excludedValues[excludedKey]);
                        });

                        for (key in cloudSave) {
                            Bento.saveState.save(key, cloudSave[key]);
                        }
                    };
                    var overwriteSavedValues = function () {
                        // new method: only overwrite the keys that were found and leave the old ones alone
                        Utils.forEach(cloudSave, function (value, key) {
                            Bento.saveState.save(key, value);
                        });
                    };

                    if (shouldOverwrite) {
                        if (newMethod) {
                            overwriteSavedValues();
                        } else {
                            // something seems off, using the old method for now
                            clearAndOverwriteSave();
                        }
                    }
                    onComplete(success, reason);
                });
            } else {
                Utils.log('Could not load from cloud');
                onComplete(false, 'notLoggedIn');
            }
        },
        getExcluded: function () {
            return excludedKeys;
        },
        /**
         * @snippet CloudSave.hasAnySave()|snippet
CloudSave.hasAnySave(function (success, data) {
    if (success) {
        // cloud save data exists
    }
});
         */
        hasAnySave: function (onComplete) {
            setup();
            // get the savefile in the cloud
            if (isLoggedIn() && CloudModule) {
                CloudModule.loadSavedGame(
                    cloudSaveId,
                    function (snapshot) {
                        var decompressedSaveFile;
                        if (snapshot && snapshot.data) {
                            try {
                                decompressedSaveFile = LZString.decompressFromBase64(snapshot.data);
                            } catch (e) {
                                if (onComplete) {
                                    onComplete(false, 'cloudSaveCorrupt');
                                }
                                return;
                            }
                            try {
                                cloudSave = JSON.parse(decompressedSaveFile);
                            } catch (e) {
                                if (onComplete) {
                                    onComplete(false, 'cloudSaveCorrupt');
                                }
                                return;
                            }
                            if (!cloudSave) {
                                if (onComplete) {
                                    onComplete(false, 'cloudSaveNone');
                                }
                                return;
                            }

                            // success
                            try {
                                if (Utils.getKeyLength(cloudSave)) {
                                    onComplete(true, snapshot);
                                } else {
                                    onComplete(false);
                                }
                            } catch (e) {
                                onComplete(false);
                            }
                        } else {
                            onComplete(false);
                        }
                    },
                    function (error) {
                        if (onComplete) {
                            onComplete(false, error);
                        }
                    }
                );
            } else {
                onComplete(false, 'cloudSaveNoLogin');
            }
        }
    };
    return CloudSave;
});