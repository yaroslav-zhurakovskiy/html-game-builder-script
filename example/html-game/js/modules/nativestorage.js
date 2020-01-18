/**
 * Replaces Bento.saveState with a saveState object that uses cordova-plugin-nativestorage
 * Recommended to initialize this as soon as possible (before any kind of Bento.saveState operation is done)
 * @moduleName NativeStorage
 */
bento.define('modules/nativestorage', [
    'bento',
    'bento/utils'
], function (
    Bento,
    Utils
) {
    'use strict';
    /**
     * Storage interface is the same interface as localStorage, it may be passed to Bento.saveState
     */
    var data = {};
    var storedKeys = [];
    var storageInterface = {
        setItem: function (key, value) {
            if (!data.hasOwnProperty(key)) {
                storedKeys.push(key);
            }
            data[key] = value;

            // save into native storage asap
            NativeStorage.setItem(key, value, function () {
                // ok great
            }, function (error) {
                console.error("Failed saving key: " + key + " value: " + value + " to native storage. Error code: " + error.code);
            });
        },
        getItem: function (key) {
            // note: the initial should have been loaded during init
            var item = data[key];
            return Utils.isDefined(item) ? item : null;
        },
        removeItem: function (key) {
            var index = storedKeys.indexOf(key);
            if (index !== -1) {
                storedKeys.splice(index, 1);
            }
            delete data[key];

            // remove from native storage asap
            NativeStorage.remove(key, function () {
                // ok great
            }, function (error) {
                console.error("Failed removing key: " + key + " from native storage. Error code: " + error.code);
            });
        },
        clear: function () {
            data = {};
            storedKeys = [];

            // remove from native storage asap
            NativeStorage.clear(function () {
                // ok great
            }, function (error) {
                console.error("Failed clearing from native storage. Error code: " + error.code);
            });
        },
        key: function (i) {
            return storedKeys[i];
        },
        get length() {
            return storedKeys.length;
        }
    };

    /**
     * Load all existing values in native storage and store them into data as synchronous values
     */
    var loadAllItems = function (id, keys, onComplete) {
        var keyCount = 0;
        var keysLoaded = 0;
        var checkDone = function () {
            if (keyCount === keysLoaded) {
                onComplete();
            }
        };
        // loop through keys
        Utils.forEach(keys, function (key, i, l, breakLoop) {
            if (key.indexOf(id) === 0) {
                keyCount += 1;
            }
        });
        Utils.forEach(keys, function (key, i, l, breakLoop) {
            // note that we need to prepend the unique id
            if (key.indexOf(id) === 0) {
                NativeStorage.getItem(key, function (value) {
                    // load into data
                    data[key] = value;

                    keysLoaded += 1;
                    checkDone();
                }, function (error) {
                    console.error("Failed loading key: " + key + " from native storage. Error code: " + error.code);
                    keysLoaded += 1;
                    checkDone();
                    // Utils.logStack();
                });
            }
        });
        checkDone();
    };
    // reference to plugin object
    var NativeStorage = window.NativeStorage;
    /**
     * Main module
     */
    var NativeStorageModule = {
        /**
         * @snippet NativeStorage.init()|snippet
NativeStorage.init({
    migrateFromLocalStorage: false, // migrate existing keys
    onComplete: function () {}
})
         */
        init: function (settings) {
            var onComplete = settings.onComplete;
            var migrateFromLocalStorage = settings.migrateFromLocalStorage;
            var uniqueId = Bento.saveState.getId();
            // load all existing items and keys into storageInterface
            var loadKeys = function () {
                console.log('NativeStorage: Loading saveState from native storage');
                NativeStorage.keys(function (keys) {
                    // pass the unique id as filter, because the NSUserDefaults will be filled with other values
                    loadAllItems(uniqueId, keys, function () {
                        console.log('NativeStorage: Load complete');
                        // move on to migrate or replace save state
                        if (!migrateFromLocalStorage) {
                            replaceSaveState();
                        } else {
                            // migrate from localStorage first
                            migrate();
                        }
                    });
                }, function () {
                    console.error("Unable to retrieve keys");

                    // move on to migrate or replace save state
                    if (!migrateFromLocalStorage) {
                        replaceSaveState();
                    } else {
                        // migrate from localStorage first
                        migrate();
                    }
                });
            };
            // migrating from webview's localstorage (note that with cocoon you wouldn't have access to old values anyway)
            var migrate = function () {
                var i, l;
                var keys = [];
                var onKey = function (key) {
                    var value;
                    if (!key || key.indexOf(uniqueId) !== 0) {
                        // only migrate the keys that are part of bento
                        return;
                    }

                    value = window.localStorage[key];
                    // set in data asap
                    data[key] = value;
                    // save into nativestorage
                    NativeStorage.setItem(key, value, function () {
                        // clear the old value
                        window.localStorage.removeItem(key);
                    }, function (error) {
                        console.error("Failed migrating key: " + key + " value: " + value + " to native storage. Error code: " + error.code);
                    });
                };

                // loop through localstorage to find keys
                for (i = 0, l = window.localStorage.length || 0; i < l; ++i) {
                    // get from localstorage
                    keys.push(window.localStorage.key(i));                    
                }
                // 2nd loop (just to be sure that no items are removed during the 1st loop)
                for (i = 0, l = keys.length; i < l; ++i) {
                    onKey(keys[i]);
                }

                replaceSaveState();
            };
            var replaceSaveState = function () {
                storedKeys = Object.keys(data);
                // replace Bento.saveState
                Bento.saveState.setStorage(storageInterface);
                console.log('Using NativeStorage as save state');
                if (onComplete) {
                    onComplete();
                }
            };

            if (!NativeStorage) {
                // plugin does not exist, continue using localStorage as saveState
                console.warn("NativeStorage plugin not found.");

                // warning: if NativeStorage was previously used but failed to start it may
                // start creating conflicts with the user's save state!!! Not sure what to
                // do in this scenario
                if (onComplete) {
                    onComplete();
                }
                return;
            }

            loadKeys();
        },
        // you may use NativeStorage's functions directly
        setItem: NativeStorage ? NativeStorage.setItem : undefined,
        getItem: NativeStorage ? NativeStorage.getItem : undefined,
        keys: NativeStorage ? NativeStorage.keys : undefined,
        remove: NativeStorage ? NativeStorage.remove : undefined,
        clear: NativeStorage ? NativeStorage.clear : undefined,
        initWithSuiteName: NativeStorage ? NativeStorage.initWithSuiteName : undefined, // iOS only
    };
    return NativeStorageModule;
});