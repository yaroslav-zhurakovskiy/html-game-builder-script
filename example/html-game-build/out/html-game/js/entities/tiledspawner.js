/**
 * Module description
 * @moduleName TiledSpawner
 * @snippet TiledSpawner.snippet
TiledSpawner({
    tiledMap: '',
    tiledOffset: new Vector2(0, 0)
})
 */
bento.define('entities/tiledspawner', [
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
    'bento/tiled',
    'entities/solid',
    'globals',
    'entities/droptutorialtrigger',
    'entities/enemytutorialtrigger'
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
    Tiled,
    Solid,
    Globals,
    DropTutorialTrigger,
    EnemyTutorialTrigger
) {
    'use strict';
    var cachedModulesMap = {};
    return function (settings) {
        // --- PARAMETERS ---
        var levelSkin = settings.levelSkin || 1;
        var tiled = Bento.assets.getJson(settings.tiledMap);
        var position = settings.position || new Vector2(0, 0);
        var relativeOrigin = settings.relativeOrigin || new Vector2(0, 0);
        var flip = Utils.isDefined(settings.flip) ? settings.flip : false;
        var chunkIndex = settings.chunkIndex || "NULL";
        var performSpawn = Utils.isDefined(settings.performSpawn) ? settings.performSpawn : true;
        var chunkId = "chunk-" + chunkIndex;
        var spawnEnemies = Utils.isDefined(settings.spawnEnemies) ? settings.spawnEnemies : true;

        // --- VARS ---
        var isComplete = false;
        var onComplete = function () {
            if (isComplete) {
                return;
            }
            isComplete = true;

            // wait to act async
            new Tween({ in: 1,
                onComplete: function () {
                    if (performSpawn) {
                        doSpawn();
                    }
                    // flip backgrounds
                    if (flip) {
                        Utils.forEach(tiledSpawner.backgrounds, function (background, i, l, breakLoop) {
                            var relativeXPosition = background.position.x - (position.x + anchorPoint.x);
                            background.position.x = (position.x - anchorPoint.x) + (relativeXPosition * -1);
                            background.scale.x *= -1;
                        });
                    }
                    if (settings.onComplete) {
                        settings.onComplete();
                    }
                }
            });
        };
        var onLoaded = function () {
            if (settings.onLoaded) {
                settings.onLoaded(cacheTotal, leftToCache);
            }
        };
        var doSpawn = function () {
            // attach everything in one go
            Utils.forEach(attachList, function (thisModule, i, l, breakLoop) {
                if ((!spawnEnemies || !Globals.showEnemies) && thisModule.family.indexOf('enemies') !== -1) {
                    return;
                }
                if (!Globals.showCoins && thisModule.family.indexOf('coins') !== -1) {
                    return;
                }
                if (!Globals.showCandy && thisModule.family.indexOf('sweets') !== -1) {
                    return;
                }
                if (!Globals.showSpikes && thisModule.family.indexOf('spikes') !== -1) {
                    return;
                }
                if (thisModule.spawnChance && Utils.getPseudoRandomFloat(1) > thisModule.spawnChance) {
                    return;
                }
                Bento.objects.attach(thisModule);
            });
        };

        // --- edit tiled ---
        Utils.forEach(tiled.tilesets, function (tileset, i, l, breakLoop) {
            if (tileset.name === "tileset") {
                tileset.image = "../../../images/tilesets/" + levelSkin + ".png";
            }
        });

        //6.25%
        // --- TILEDMAP ---
        var scalar = Globals.pixelScale;
        var tiledDimensions = new Vector2(tiled.width * tiled.tilewidth, tiled.height * tiled.tileheight);
        var anchorPoint = tiledDimensions.multiply(relativeOrigin).scalarMultiply(scalar);
        var cacheTotal = 0;
        var leftToCache = 0;
        var attachList = [];
        var tiledOffset = new Vector2(position.x - anchorPoint.x, position.y - anchorPoint.y);
        var objectOffset = position.subtract(anchorPoint);
        var cachedIDMap = {};
        //get the total of all objects to countdown to make sure we've gone through it all
        var objectsRemaining = 0;
        Utils.forEach(tiled.layers, function (layer, i, l, breakLoop) {
            if (layer.type === "objectgroup") {
                objectsRemaining += layer.objects.length;
            }
        });
        var tiledSpawner = new Tiled({
            tiled: tiled,
            offset: tiledOffset,
            drawTiles: true,
            spawnEntities: false,
            spawnBackground: true,
            scalar: scalar,
            maxCanvasSize: new Vector2(1080, 180),
            merge: true,
            onObject: function (objectJSON, tilesetJSON, tileIndex) {
                if (tilesetJSON) {
                    // get tile
                    var thisTile;
                    // if we've done this before use the cached tile data
                    if (cachedIDMap[tileIndex]) {
                        thisTile = tilesetJSON.tiles[cachedIDMap[tileIndex]];
                    } else {
                        //else retrieve it and store it
                        Utils.forEach(tilesetJSON.tiles, function (tile, i, l, breakLoop) {
                            if (tile && tileIndex === tile.id) {
                                cachedIDMap[tileIndex] = tile.id;
                                thisTile = tilesetJSON.tiles[tile.id];
                            }
                        });
                    }

                    // make properties JSON
                    var thisProperties = {};
                    if (thisTile && thisTile.properties) {
                        Utils.forEach(thisTile.properties, function (property, i, l, breakLoop) {
                            thisProperties[property.name] = property.value;
                        });
                    }
                    thisProperties.chunkId = chunkId;
                    //if this has a module, spawn it
                    if (thisProperties.module) {
                        // increase counts
                        cacheTotal++;
                        leftToCache++;

                        // make settings
                        var thisModule;
                        var thisOrigin = new Vector2(thisProperties.originX || 0, thisProperties.originY || 0);
                        var xPos = (objectJSON.x * scalar) + thisOrigin.x;
                        // flip around x anchor
                        if (flip) {
                            xPos = anchorPoint.x - (xPos - anchorPoint.x);
                        }
                        var thisPosition = new Vector2(
                            (objectOffset.x + xPos),
                            (objectOffset.y + (objectJSON.y * scalar)) - thisOrigin.y
                        );
                        var thisSettings = thisProperties;
                        thisSettings.position = thisPosition;
                        thisSettings.scale = new Vector2(1, 1);
                        thisSettings.tiledRect = new Rectangle(0, 0, objectJSON.width * scalar, objectJSON.height * scalar);
                        if (objectJSON.properties) {
                            Utils.forEach(objectJSON.properties, function (property, i, l, breakLoop) {
                                thisSettings[property.name] = property.value;
                            });
                        }

                        // flip settings
                        if (flip) {
                            for (var key in thisSettings) {
                                if (key === "velocityX") {
                                    thisSettings[key] = thisSettings[key];
                                }
                                if (thisSettings[key] === "left") {
                                    thisSettings[key] = "right";
                                } else if (thisSettings[key] === "right") {
                                    thisSettings[key] = "left";
                                }
                            }
                            thisSettings.scale.x = -thisSettings.scale.x;
                        }

                        var cachedModule = cachedModulesMap[thisProperties.module];
                        if (cachedModule) {
                            thisModule = new cachedModule(thisSettings);
                            attachList.push(thisModule);
                            leftToCache--;
                            onLoaded();
                            if (leftToCache === 0 && objectsRemaining === 0) {
                                onComplete();
                            }
                        } else {
                            // async get module
                            bento.require([thisProperties.module], function (Module) {

                                //cache module
                                cachedModulesMap[thisProperties.module] = Module;

                                // attach module
                                thisModule = new Module(thisSettings);
                                attachList.push(thisModule);

                                //decrease count
                                leftToCache--;
                                onLoaded();
                                if (leftToCache === 0 && objectsRemaining === 0) {
                                    onComplete();
                                }
                            });
                        }
                    }
                } else {
                    if (objectJSON) {
                        var thisOffset = position.subtract(tiledOffset);
                        var xPos = (objectJSON.x * scalar);
                        // flip around x anchor
                        if (flip) {
                            xPos = anchorPoint.x - (xPos - anchorPoint.x) - (objectJSON.width * scalar);
                        }
                        var thisPosition = new Vector2(
                            Math.round(objectOffset.x + xPos),
                            Math.round(objectOffset.y + (objectJSON.y * scalar))
                        );
                        var thisWidth = Math.round(objectJSON.width * scalar);
                        var thisHeight = Math.round(objectJSON.height * scalar);
                        if (objectJSON.type === 'solid') {
                            // attach module
                            attachList.push(new Solid({
                                position: thisPosition.clone(),
                                boundingBox: new Rectangle(0, 0, thisWidth, thisHeight)
                            }));
                        }
                        if (objectJSON.type === 'dropTutorialTrigger') {
                            // attach module
                            attachList.push(new DropTutorialTrigger({
                                position: thisPosition.clone(),
                                boundingBox: new Rectangle(0, 0, thisWidth, thisHeight)
                            }));
                        }
                        if (objectJSON.type === 'enemyTutorialTrigger') {
                            // attach module
                            attachList.push(new EnemyTutorialTrigger({
                                position: thisPosition.clone(),
                                boundingBox: new Rectangle(0, 0, thisWidth, thisHeight)
                            }));
                        }
                    }
                }
                objectsRemaining--;
            },
            onComplete: function () {
                if (leftToCache === 0 && objectsRemaining === 0) {
                    onComplete();
                }
            }
        });
        tiledSpawner.mapWidth = tiledDimensions.x * scalar;
        tiledSpawner.mapHeight = tiledDimensions.y * scalar;
        tiledSpawner.doSpawn = doSpawn;
        tiledSpawner.attachList = attachList;
        return tiledSpawner;
    };
});