/**
 * Module description
 * @moduleName LevelGenerator
 * @snippet LevelGenerator.snippet
LevelGenerator({
    position: new Vector2(0, 0)
})
 */
bento.define('entities/levelgenerator', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/eventsystem',
    'bento/gui/clickbutton',
    'bento/gui/counter',
    'bento/gui/text',
    'bento/utils',
    'bento/tween',
    'entities/tiledspawner',
    'globals',
    'components/culler',
    'bento/tiled',
    'modules/savemanager'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    EventSystem,
    ClickButton,
    Counter,
    Text,
    Utils,
    Tween,
    TiledSpawner,
    Globals,
    Culler,
    Tiled,
    SaveManager
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var i;

        // --- PARAMETERS ---
        var levelSkin = settings.levelSkin || 1;
        var onLevelGenerationComplete = settings.onComplete || function () {};
        var postGeneration = function () {
            if (doneGeneration) {
                return;
            }
            doneGeneration = true;
            Utils.forEach(currentChunks, function (thisChunk, ii, l, breakLoop) {
                //since we now postpone spawning, we delay this until now
                thisChunk.doSpawn();
            });
            onLevelGenerationComplete();
        };

        // --- VARS ---
        var doneGeneration = false;

        var currentLevel = SaveManager.load('currentLevel', 1);
        var chunksDataJSON = Bento.assets.getJson('level_data');
        var bespokeLevels = chunksDataJSON.bespokeLevels;
        var chunkAvailableAfter = chunksDataJSON.availableAfter;
        var chunkLists = chunksDataJSON.lists;
        var levelLength = Math.min(6 + Math.max(0, Math.floor((currentLevel - 20) / 10)), 10);
        var baseSeed = 12;
        var currentChunks = [];
        var nextPosition = settings.startPosition;
        var hasBonus = Utils.isDefined(settings.hasBonus) ? settings.hasBonus : false;
        var chunkIndex = 0;
        var lastChunk;
        var leftToSpawn = 0;
        var levelIsBespoke = false;


        // --- CHUNK DECIDING ---
        // seed RNG
        Utils.setPseudoRandomSeed(baseSeed + currentLevel);

        // build a list of available chunk lists
        var availableChunkLists = [];
        for (var chunkList in chunkAvailableAfter) {
            if (currentLevel > chunkAvailableAfter[chunkList]) {
                availableChunkLists.push(chunkList);
            }
        }

        // create list of potential chunks from our potential chunk lists (always have base)
        var chosenLists = [];
        for (i = 0; i < 1 + availableChunkLists.length - 1; i++) {
            if (availableChunkLists.length < 1) {
                break;
            }
            var choiceIndex = Utils.getPseudoRandom(availableChunkLists.length);
            chosenLists.push(availableChunkLists[choiceIndex]);
            availableChunkLists.splice(choiceIndex, 1);
        }
        var potentialChunkList = [];
        for (i = chosenLists.length - 1; i >= 0; i--) {
            potentialChunkList = potentialChunkList.concat(chunkLists[chosenLists[i]]);
        }

        // pick random chunks from the pool of potential chunks
        var spawnList = [];
        spawnList.push('base/start' + (1 + Utils.getPseudoRandom(4)));
        for (i = 0; i < levelLength; i++) {
            var thisIndex = Utils.getPseudoRandom(potentialChunkList.length);
            spawnList.push(potentialChunkList[thisIndex]);
        }
        if (hasBonus) {
            var bonusChunk = ['base/fever1', 'base/fever2'][Utils.getPseudoRandom(2)];
            spawnList.splice(1 + Utils.getPseudoRandom(Math.min(2, spawnList.length)), 0, bonusChunk);
        }
        spawnList.push('base/end' + (1 + Utils.getPseudoRandom(3)));

        // overide levels
        if (bespokeLevels[currentLevel]) {
            levelIsBespoke = true;
            spawnList = bespokeLevels[currentLevel];
        }

        // acts like a culler, but also cleans the canvas
        var CanvasCuller = function (sett) {
            var camera;
            var h = sett.height || 0;
            var e;
            return {
                name: "cullerBehaviour",
                attached: function () {
                    e = this.parent;
                },
                start: function () {
                    e.visible = false;
                },
                update: function (data) {
                    if (!camera) {
                        camera = Bento.objects.get('camera');
                    }
                    var viewportScaled = camera.getUnscaledViewport();
                    e.visible = ((e.position.y + h) > viewportScaled.y && (e.position.y) < viewportScaled.y + viewportScaled.height);
                    if ((e.position.y) > viewportScaled.y + viewportScaled.height + 48) {
                        e.removeSelf();
                    }
                },
                destroy: function () {
                    // find canvas image, and delete
                    e.getComponent('sprite', function (sprite) {
                        var img = sprite.spriteImage.image;
                        // check if it exists
                        if (img) {
                            img.width = 0;
                            img.height = 0;
                            // double check if the texture exists before attempting to remove it
                            if (img.texture) {
                                img.texture.destroy();
                            }
                            sprite.spriteImage = null;
                        }
                    });
                }
            };
        };

        var spawnMap = function (name, flip) {
            chunkIndex++;
            leftToSpawn++;
            var thisChunk = new TiledSpawner({
                chunkIndex: chunkIndex,
                tiledMap: 'chunks/' + name,
                levelSkin: (name === 'base/startTutorial') ? 'intro' : levelSkin,
                position: nextPosition.clone(),
                relativeOrigin: new Vector2(0.5, 1),
                flip: flip,
                performSpawn: false,
                spawnEnemies: currentLevel > 3,
                onComplete: function () {
                    Utils.forEach(thisChunk.backgrounds, function (background, i, l, breakLoop) {
                        background.z = Globals.layers.tiles;
                        background.attach(new CanvasCuller({
                            height: background.dimension.height * Globals.pixelScale
                        }));
                    });
                    leftToSpawn--;
                    if (leftToSpawn === 0) {
                        postGeneration();
                    }
                }
            });
            currentChunks.push(thisChunk);
            lastChunk = thisChunk;
            nextPosition.y -= lastChunk.mapHeight;
        };

        // --- LOADING ---
        console.log("Level " + currentLevel);
        for (var ii = 0; ii < spawnList.length; ii++) {
            spawnMap(spawnList[ii], [true, false][(ii + currentLevel) % 2]);
            console.log(ii, spawnList[ii]);
        }

        // --- ENTITY ---
        var levelGenerator = {
            name: 'levelGenerator',
            getNextPosition: function () {
                return nextPosition.clone();
            },
            destroy: function () {}
        };
        return levelGenerator;
    };
});