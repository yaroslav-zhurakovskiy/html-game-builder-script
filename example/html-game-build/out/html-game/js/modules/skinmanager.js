/**
 * Component description
 * @moduleName SkinManager
 * @snippet SkinManager.snippet
SkinManager({})
 */
bento.define('modules/skinmanager', [
    'bento',
    'bento/utils',
    'modules/timemanager',
    'bento/eventsystem',
    'modules/savemanager'
], function (
    Bento,
    Utils,
    TimeManager,
    EventSystem,
    SaveManager
) {
    'use strict';

    var debug = false;

    var skinJSON;
    var skinSaveData = {};

    var allPotSkins;
    var defaultPotSkins = [];
    var lockedPotSkins = [];
    var unlockedPotSkins = [];
    var potSkinUnlockMethods = {};
    var currentPotSkin = '';

    var allPlantSkins;
    var defaultPlantSkins = [];
    var lockedPlantSkins = [];
    var unlockablePlantSkins = [];
    var unlockingPlantSkins = [];
    var unlockedPlantSkins = [];
    var nonUnlockedPlants = [];
    var vipPlantSkins = [];
    var currentPlantSkin = '';


    var parsePotUnlockMethod = function (potSkin) {
        var data = {
            method: undefined,
            value: 0
        };
        var unlockMethodsString = skinJSON.pots.unlockMethod[potSkin];
        console.log(potSkin);
        var subStrings = unlockMethodsString.split(':');
        if (subStrings[0]) {
            data.method = subStrings[0];
        }
        if (subStrings[1]) {
            data.value = parseInt(subStrings[1]);
        }
        return data;
    };
    var save = function () {
        SaveManager.save('skinSaveData', skinSaveData);
    };
    var module = {
        /*
         * @snippet SkinManager.initialize
        SkinManager.initialize();
         */
        initialize: function () {
            // load data
            skinJSON = Bento.assets.getJson('skin_data');

            allPotSkins = skinJSON.pots.list;
            defaultPotSkins = skinJSON.pots.default;
            currentPotSkin = SaveManager.load('currentPotSkin');

            allPlantSkins = skinJSON.plants.list;
            defaultPlantSkins = skinJSON.plants.default;
            vipPlantSkins = skinJSON.plants.vipList;
            currentPlantSkin = SaveManager.load('currentPlantSkin');

            skinSaveData = SaveManager.load('skinSaveData');
            if (!skinSaveData["pots"]) {
                skinSaveData["pots"] = {};
            }
            if (!skinSaveData["plants"]) {
                skinSaveData["plants"] = {};
            }

            // build missing pot skin data
            Utils.forEach(allPotSkins, function (potSkin, i, l, breakLoop) {
                var thisData = skinSaveData['pots'][potSkin] || {};
                if (!thisData.state) {
                    thisData.state = 'locked';
                }
                if (defaultPotSkins.indexOf(potSkin) !== -1) {
                    thisData.state = 'unlocked';
                }
                skinSaveData['pots'][potSkin] = thisData;
            });

            // build missing plant skin data
            Utils.forEach(allPlantSkins, function (plantSkin, i, l, breakLoop) {
                var thisData = skinSaveData['plants'][plantSkin] || {};
                if (!thisData.state) {
                    thisData.state = 'locked';
                }
                if (defaultPlantSkins.indexOf(plantSkin) !== -1) {
                    thisData.state = 'unlocked';
                }
                skinSaveData['plants'][plantSkin] = thisData;
            });
            save();

            // build fast access pot skin arrays
            Utils.forEach(allPotSkins, function (potSkin, i, l, breakLoop) {
                var thisState = skinSaveData['pots'][potSkin].state || 'locked';
                // parse pot skin unlock methods
                potSkinUnlockMethods[potSkin] = parsePotUnlockMethod(potSkin);
                switch (thisState) {
                case 'locked':
                    lockedPotSkins.push(potSkin);
                    break;
                case 'unlocked':
                    unlockedPotSkins.push(potSkin);
                    break;
                }
            });
            if (debug) {
                console.log(potSkinUnlockMethods);
            }

            // build fast access plant skin arrays
            Utils.forEach(allPlantSkins, function (plantSkin, i, l, breakLoop) {
                var thisState = skinSaveData['plants'][plantSkin].state || 'locked';
                switch (thisState) {
                case 'locked':
                    lockedPlantSkins.push(plantSkin);
                    nonUnlockedPlants.push(plantSkin);
                    break;
                case 'unlockable':
                    unlockablePlantSkins.push(plantSkin);
                    nonUnlockedPlants.push(plantSkin);
                    break;
                case 'unlocking':
                    unlockingPlantSkins.push(plantSkin);
                    nonUnlockedPlants.push(plantSkin);
                    break;
                case 'unlocked':
                    unlockedPlantSkins.push(plantSkin);
                    break;
                }
            });

            // set pot skin
            if (unlockedPotSkins.indexOf(currentPotSkin) === -1 && currentPotSkin !== 'random') {
                currentPotSkin = defaultPotSkins[0];
            }

            // set plant skin
            if ((unlockedPlantSkins.indexOf(currentPlantSkin) === -1 && vipPlantSkins.indexOf(currentPlantSkin) === -1) && currentPlantSkin !== 'random') {
                currentPlantSkin = defaultPlantSkins[0];
            }

            // log
            console.log('SkinManager Initialized!');
            if (debug) {
                console.log(skinSaveData);
            }
        },

        /*
         * @snippet SkinManager.getAllPotSkins
        SkinManager.getAllPotSkins();
         */
        getAllPotSkins: function () {
            return allPotSkins;
        },

        /*
         * @snippet SkinManager.getAllUnlockedPotSkins
        SkinManager.getAllUnlockedPotSkins();
         */
        getAllUnlockedPotSkins: function () {
            return unlockedPotSkins;
        },

        /*
         * @snippet SkinManager.getAllLockedPotSkins
        SkinManager.getAllLockedPotSkins();
         */
        getAllLockedPotSkins: function () {
            return lockedPotSkins;
        },

        /*
         * @snippet SkinManager.getUnlockedPotSkinCount
        SkinManager.getUnlockedPotSkinCount();
         */
        getUnlockedPotSkinCount: function () {
            return unlockedPotSkins.length - defaultPotSkins.length;
        },

        /*
         * @snippet SkinManager.getPotSkinUnlockMethod
        SkinManager.getPotSkinUnlockMethod(skin);
         */
        getPotSkinUnlockMethod: function (potSkin) {
            return potSkinUnlockMethods[potSkin];
        },

        /*
         * @snippet SkinManager.getLowestPotSkinCost
        SkinManager.getLowestPotSkinCost(skin);
         */
        getLowestPotSkinCost: function (potSkin) {
            var lowestPrice = 1000000000000;
            Utils.forEach(lockedPotSkins, function (thisPotSkin, i, l, breakLoop) {
                var thisMethod = potSkinUnlockMethods[thisPotSkin];
                if (thisMethod.method === "coins" && lowestPrice > thisMethod.value) {
                    lowestPrice = thisMethod.value;
                }
            });
            return lowestPrice;
        },

        /*
         * @snippet SkinManager.getNextUnlockLevel
        SkinManager.getNextUnlockLevel(skin);
         */
        getNextUnlockLevel: function () {
            var lowestLevel;
            Utils.forEach(lockedPotSkins, function (thisPotSkin, i, l, breakLoop) {
                var thisMethod = potSkinUnlockMethods[thisPotSkin];
                if (thisMethod.method === "level") {
                    if (!lowestLevel) {
                        lowestLevel = thisMethod.value;
                    } else {
                        if (thisMethod.value < lowestLevel) {
                            lowestLevel = thisMethod.value;
                        }
                    }
                }
            });
            return lowestLevel;
        },

        /*
         * @snippet SkinManager.getPotSkinsForLevel
        SkinManager.getPotSkinsForLevel();
         */
        getPotSkinsForLevel: function (level) {
            var skins = [];
            Utils.forEach(lockedPotSkins, function (thisPotSkin, i, l, breakLoop) {
                var thisMethod = potSkinUnlockMethods[thisPotSkin];
                if (thisMethod.method === "level" && thisMethod.value === level) {
                    skins.push(thisPotSkin);
                }
            });
            return skins;
        },

        /*
         * @snippet SkinManager.getNextAdPot
        SkinManager.getNextAdPot();
         */
        getNextAdPot: function (potSkin) {
            var potentialSkins = [];
            Utils.forEach(lockedPotSkins, function (potSkin, i, l, breakLoop) {
                var thisMethod = potSkinUnlockMethods[potSkin];
                if (thisMethod.method === "ad") {
                    potentialSkins.push(potSkin);
                }
            });
            return potentialSkins[Utils.getRandom(potentialSkins.length)];
        },

        /*
         * @snippet SkinManager.getRandomPotSkins
        SkinManager.getRandomPotSkins();
         */
        getRandomPotSkin: function (onlyUnlocked) {
            if (onlyUnlocked) {
                return unlockedPotSkins[Utils.getRandom(unlockedPotSkins.length)];
            } else {
                return allPotSkins[Utils.getRandom(allPotSkins.length)];
            }
        },

        /*
         * @snippet SkinManager.getCurrentPotSkin
        SkinManager.getCurrentPotSkin();
         */
        getCurrentPotSkin: function (ignoreRandom) {
            if (ignoreRandom || currentPotSkin !== 'random') {
                return currentPotSkin;
            } else {
                return module.getRandomPotSkin(true);
            }
        },

        /*
         * @snippet SkinManager.setCurrentPotSkin
        SkinManager.setCurrentPotSkin(skin);
         */
        setCurrentPotSkin: function (skin) {
            if (currentPotSkin !== skin) {
                if (unlockedPotSkins.indexOf(skin) !== -1 || skin === 'random') {
                    currentPotSkin = skin;
                } else {
                    currentPotSkin = defaultPotSkins[0];
                }
                SaveManager.save('currentPotSkin', currentPotSkin);
                EventSystem.fire('onPotChanged', skin);
            }
        },


        /*
         * @snippet SkinManager.makePotSkinUnlocked
        SkinManager.makePotSkinUnlocked(skin);
         */
        makePotSkinUnlocked: function (skin) {
            if (unlockedPotSkins.indexOf(skin) !== -1) {
                return;
            }
            skinSaveData['pots'][skin].state = 'unlocked';
            unlockedPotSkins.push(skin);
            var skIndex = lockedPotSkins.indexOf(skin);
            if (skIndex !== -1) {
                lockedPotSkins.splice(skIndex, 1);
            }
            save();
            EventSystem.fire('onPotUnlocked', skin);
        },

        /*
         * @snippet SkinManager.getPotSkinState
        SkinManager.getPotSkinState(skin);
         */
        getPotSkinState: function (skin) {
            return skinSaveData['pots'][skin].state;
        },

        /*
         * @snippet SkinManager.getAllPlantSkins
        SkinManager.getAllPlantSkins();
         */
        getAllPlantSkins: function () {
            return allPlantSkins;
        },

        /*
         * @snippet SkinManager.getAllUnlockedPlantSkins
        SkinManager.getAllUnlockedPlantSkins();
         */
        getAllUnlockedPlantSkins: function () {
            return unlockedPlantSkins;
        },

        /*
         * @snippet SkinManager.getAllUnlockablePlantSkins
        SkinManager.getAllUnlockablePlantSkins();
         */
        getAllUnlockablePlantSkins: function () {
            return unlockablePlantSkins;
        },

        /*
         * @snippet SkinManager.getAllUnlockingPlantSkins
        SkinManager.getAllUnlockingPlantSkins();
         */
        getAllUnlockingPlantSkins: function () {
            return unlockingPlantSkins;
        },

        /*
         * @snippet SkinManager.getAllLockedPlantSkins
        SkinManager.getAllLockedPlantSkins();
         */
        getAllLockedPlantSkins: function () {
            return lockedPlantSkins;
        },

        /*
         * @snippet SkinManager.getAllNonUnlockedPlantSkins
        SkinManager.getAllNonUnlockedPlantSkins();
         */
        getAllNonUnlockedPlantSkins: function () {
            return nonUnlockedPlants;
        },

        /*
         * @snippet SkinManager.getAllVipPlantSkins
        SkinManager.getAllVipPlantSkins();
         */
        getAllVipPlantSkins: function () {
            return vipPlantSkins;
        },
        isSkinVIP: function (skin) {
            return (vipPlantSkins.indexOf(skin) !== -1);
        },
        isUsingVipSkin: function () {
            return (vipPlantSkins.indexOf(currentPlantSkin) !== -1);
        },

        /*
         * @snippet SkinManager.getRandomPlantSkins
        SkinManager.getRandomPlantSkins();
         */
        getRandomPlantSkin: function (onlyUnlocked) {
            if (onlyUnlocked) {
                return unlockedPlantSkins[Utils.getRandom(unlockedPlantSkins.length)];
            } else {
                return allPlantSkins[Utils.getRandom(allPlantSkins.length)];
            }
        },

        /*
         * @snippet SkinManager.getCurrentPlantSkin
        SkinManager.getCurrentPlantSkin();
         */
        getCurrentPlantSkin: function (ignoreRandom) {
            if (ignoreRandom || currentPlantSkin !== 'random') {
                return currentPlantSkin;
            } else {
                return module.getRandomPlantSkin(true);
            }
        },

        /*
         * @snippet SkinManager.setCurrentPlantSkin
        SkinManager.setCurrentPlantSkin(skin);
         */
        setCurrentPlantSkin: function (skin) {
            if (currentPlantSkin !== skin) {
                if (unlockedPlantSkins.indexOf(skin) !== -1 || vipPlantSkins.indexOf(skin) !== -1 || skin === 'random') {
                    currentPlantSkin = skin;
                } else {
                    currentPlantSkin = defaultPlantSkins[0];
                }
                SaveManager.save('currentPlantSkin', currentPlantSkin);
                EventSystem.fire('onPlantChanged', skin);
            }
        },

        /*
         * @snippet SkinManager.makePlantSkinUnlockable
        SkinManager.makePlantSkinUnlockable(skin);
         */
        makePlantSkinUnlockable: function (skin) {
            if (unlockablePlantSkins.indexOf(skin) !== -1) {
                return;
            }
            skinSaveData['plants'][skin].state = 'unlockable';
            unlockablePlantSkins.push(skin);
            var skIndex = lockedPlantSkins.indexOf(skin);
            if (skIndex !== -1) {
                lockedPlantSkins.splice(skIndex, 1);
            }
            save();
        },

        /*
         * @snippet SkinManager.startPlantSkinUnlocking
        SkinManager.startPlantSkinUnlocking(skin);
         */
        startPlantSkinUnlocking: function (skin) {
            if (unlockingPlantSkins.indexOf(skin) !== -1) {
                return;
            }
            skinSaveData['plants'][skin].state = 'unlocking';
            skinSaveData['plants'][skin].remainingWaters = skinJSON.plants.waterCount[skin] - 1;
            skinSaveData['plants'][skin].waterAfter = TimeManager.getCurrentTime() + (skinJSON.plants.waterTimes[skin] * 1000);
            unlockingPlantSkins.push(skin);
            var skIndex = lockedPlantSkins.indexOf(skin);
            if (skIndex !== -1) {
                lockedPlantSkins.splice(skIndex, 1);
            }
            skIndex = unlockablePlantSkins.indexOf(skin);
            if (skIndex !== -1) {
                unlockablePlantSkins.splice(skIndex, 1);
            }
            save();
            return skinSaveData['plants'][skin].unlockAfter;
        },

        /*
         * @snippet SkinManager.getPlantSkinRemainingWaters
        SkinManager.getPlantSkinRemainingWaters(skin);
         */
        getPlantSkinRemainingWaters: function (skin) {
            return skinSaveData['plants'][skin].remainingWaters;
        },

        /*
         * @snippet SkinManager.getPlantSkinCanProgress
        SkinManager.getPlantSkinCanProgress(skin);
         */
        getPlantSkinCanProgress: function (skin) {
            return (skinSaveData['plants'][skin].state === 'unlocking' && TimeManager.getCurrentTime() > skinSaveData['plants'][skin].waterAfter);
        },

        /*
         * @snippet SkinManager.progressPlantSkinUnlocking
        SkinManager.progressPlantSkinUnlocking(skin);
         */
        progressPlantSkinUnlocking: function (skin) {
            if (module.getPlantSkinCanProgress(skin)) {
                skinSaveData['plants'][skin].remainingWaters--;
                skinSaveData['plants'][skin].waterAfter = TimeManager.getCurrentTime() + (skinJSON.plants.waterTimes[skin] * 1000);
                save();
            }
            return module.getPlantSkinCanUnlock(skin);
        },

        /*
         * @snippet SkinManager.getPlantSkinWaterAfter
        SkinManager.getPlantSkinWaterAfter(skin);
         */
        getPlantSkinWaterAfter: function (skin) {
            return skinSaveData['plants'][skin].waterAfter;
        },
        getPlantSkinUnlockTime: function (skin) {
            return (skinJSON.plants.waterTimes[skin] * 1000);
        },
        getPlantSkipWaitPrice: function (skin) {
            return Math.min(Math.ceil((skinJSON.plants.waterTimes[skin] / 60) / 10) * 30, 500);
        },

        /*
         * @snippet SkinManager.getPlantSkinCanUnlock
        SkinManager.getPlantSkinCanUnlock(skin);
         */
        getPlantSkinCanUnlock: function (skin) {
            return (skinSaveData['plants'][skin].state === 'unlocking' && skinSaveData['plants'][skin].remainingWaters <= 0 && TimeManager.getCurrentTime() > skinSaveData['plants'][skin].waterAfter);
        },

        /*
         * @snippet SkinManager.makePlantSkinUnlocked
        SkinManager.makePlantSkinUnlocked(skin);
         */
        makePlantSkinUnlocked: function (skin) {
            if (unlockedPlantSkins.indexOf(skin) !== -1) {
                return;
            }

            skinSaveData['plants'][skin].state = 'unlocked';
            unlockedPlantSkins.push(skin);
            var skIndex = lockedPlantSkins.indexOf(skin);
            if (skIndex !== -1) {
                lockedPlantSkins.splice(skIndex, 1);
            }
            skIndex = unlockablePlantSkins.indexOf(skin);
            if (skIndex !== -1) {
                unlockablePlantSkins.splice(skIndex, 1);
            }
            skIndex = unlockingPlantSkins.indexOf(skin);
            if (skIndex !== -1) {
                unlockingPlantSkins.splice(skIndex, 1);
            }
            skIndex = nonUnlockedPlants.indexOf(skin);
            if (skIndex !== -1) {
                nonUnlockedPlants.splice(skIndex, 1);
            }
            save();

            EventSystem.fire('onPlantUnlocked', skin);
        },

        /*
         * @snippet SkinManager.getPlantSkinState
        SkinManager.getPlantSkinState(skin);
         */
        getPlantSkinState: function (skin) {
            return skinSaveData['plants'][skin].state;
        },

        lowerPlantSkinTimer: function (plantSkin, deltaT) {
            deltaT = Math.abs(deltaT);
            //lower the unlockafter by this much time
            skinSaveData['plants'][plantSkin].waterAfter -= deltaT;
            save();
            EventSystem.fire('updateTimers');
        },

        lowerAllTimers: function (deltaT) {
            deltaT = Math.abs(deltaT);
            //lower the unlockafter by this much time
            Utils.forEach(unlockingPlantSkins, function (plantSkin, i, l, breakLoop) {
                skinSaveData['plants'][plantSkin].waterAfter -= deltaT;
            });
            save();
            EventSystem.fire('updateTimers');
        }
    };
    return module;
});