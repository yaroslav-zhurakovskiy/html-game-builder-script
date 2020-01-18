/**
 * @moduleName GameCounter
 * @snippet GameCounter.snippet
GameCounter({
    z: 0,
    name: "",
    value: 0,
    imageName: '',
    position: new Vector2(0, 0),
    scale: new Vector2(1, 1),
    align: 'center',
    updateWhenPaused: 0
})
 */
bento.define('components/gamecounter', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'bento/components/sprite',
    'globals',
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween,
    Sprite,
    Globals
) {
    'use strict';

    var numberFrames = {
        '0': {
            frames: [0],
            spacing: -18
        },
        '1': {
            frames: [1],
            spacing: -35
        },
        '2': {
            frames: [2],
            spacing: -18
        },
        '3': {
            frames: [3],
            spacing: -18
        },
        '4': {
            frames: [4],
            spacing: -16
        },
        '5': {
            frames: [5],
            spacing: -18
        },
        '6': {
            frames: [6],
            spacing: -18
        },
        '7': {
            frames: [7],
            spacing: -18
        },
        '8': {
            frames: [8],
            spacing: -18
        },
        '9': {
            frames: [9],
            spacing: -18
        },
        '+': {
            frames: [10],
            spacing: -18
        },
    };

    var GameCounter = function (settings) {
        var z = Utils.getDefault(settings.z, Globals.layers.gui);
        var name = Utils.getDefault(settings.name, 'gameCounter');
        var value = Utils.getDefault(settings.value, 0);
        var imageName = Utils.getDefault(settings.imageName, 'ui/scorecounter');
        var align = Utils.getDefault(settings.align, 'center');
        var position = settings.position;
        var scale = settings.scale;
        var float = settings.float || false;
        var updateWhenPaused = settings.updateWhenPaused;

        var image = Bento.assets.getImage(imageName);

        var counter = new CustomCounter({
            z: z,
            name: name,
            value: value,
            imageName: imageName,
            frameCountX: 6,
            frameCountY: 2,
            padding: 1,
            animations: numberFrames,
            align: align,
            spacing: new Vector2(-1, 0),
            position: position,
            scale: scale,
            float: float,
            updateWhenPaused: updateWhenPaused,
            digit: {
                position: new Vector2(0, -image.height / 2) // vertical centering
            }
        });

        counter.setImage = function (newImageName) {
            var newImage = Bento.assets.getImage(newImageName);
            counter.loopDigits(function (digit) {
                digit.getComponent('sprite', function (digitSprite) {
                    digitSprite.spriteImage = newImage;
                });
            });
        };

        return counter;
    };

    /**
     * Like Bento's counter but with some support for variable-width fonts
     */
    var CustomCounter = function (settings) {
        /*{
            value: Number,
            spacing: Vector,
            align: String,
            image: Image, // lower priority
            frameWidth: Number, // lower priority
            frameHeight: Number, // lower priority
            animations: Object, // only way to overwrite animations
            sprite: Sprite({
                image: Image,
                imageName: String,
                frameWidth: Number,
                frameHeight: Number,
                animations: Animation
            }),
            position: Vector
        }*/
        var animations = settings.animations;
        var value = settings.value || 0;
        var spacing = settings.spacing || new Vector2(0, 0);
        var alignment = settings.align || settings.alignment || 'right';
        var digitWidths = null;
        var children = [];
        var spriteSettings = {};
        /*
         * Counts the number of digits in the value
         */
        var getDigits = function () {
            return value.toString().length;
        };
        /*
         * Returns an entity with all digits as animation
         */
        var createDigit = function () {
            var sprite = new Sprite({
                image: spriteSettings.image,
                padding: spriteSettings.padding,
                imageName: spriteSettings.imageName,
                frameWidth: spriteSettings.frameWidth,
                frameHeight: spriteSettings.frameHeight,
                frameCountX: spriteSettings.frameCountX,
                frameCountY: spriteSettings.frameCountY,
                animations: animations
            });
            // settings.digit can be used to change every digit entity constructor
            var digitSettings = Utils.extend({
                components: [sprite]
            }, settings.digit || {});
            var entity = new Entity(digitSettings);
            entity.name = 'digit';

            // update widths
            if (!digitWidths) {
                digitWidths = [];
                Object.keys(animations).forEach(function (digitName) {
                    digitWidths[digitName] = sprite.frameWidth + (animations[digitName].spacing || 0);
                });
            }

            return entity;
        };
        /*
         * Adds or removes children depending on the value
         * and number of current digits and updates
         * the visualuzation of the digits
         */
        var updateDigits = function () {
            // add or remove digits
            var i, l, x,
                valueStr = value.toString(),
                valueChar,
                pos,
                digit,
                digits = getDigits(),
                difference = children.length - digits;
            /* update number of children to be
                    the same as number of digits*/
            if (difference < 0) {
                // create new
                for (i = 0; i < Math.abs(difference); ++i) {
                    digit = createDigit();
                    children.push(digit);
                    container.attach(digit);

                }
            } else if (difference > 0) {
                // remove
                for (i = 0; i < Math.abs(difference); ++i) {
                    digit = children.pop();
                    container.remove(digit);
                }
            }

            /* update animations */
            for (i = 0, x = 0, l = children.length; i < l; ++i) {
                valueChar = valueStr.substr(i, 1);
                digit = children[i];
                digit.position = new Vector2(x, digit.position.y);
                x += digitWidths[valueChar] + spacing.x;
                digit.getComponent('sprite', function (sprite) {
                    sprite.setAnimation(valueChar);
                });
            }

            /* alignment */
            if (alignment === 'right') {
                // move all the children
                for (i = 0, l = children.length; i < l; ++i) {
                    digit = children[i];
                    pos = digit.position;
                    pos.x -= x;
                    // pos.substractFrom(new Vector2((digitWidths[valueChar] + spacing.x) * digits - spacing.x, 0));
                }
            } else if (alignment === 'center') {
                for (i = 0, l = children.length; i < l; ++i) {
                    digit = children[i];
                    pos = digit.position;
                    pos.x -= x / 2;
                    // pos.addTo(new Vector2(((digitWidths[valueChar] + spacing.x) * digits - spacing.x) / -2, 0));
                }
            }
        };
        var entitySettings = {
            z: settings.z,
            name: settings.name,
            position: settings.position,
            float: settings.float
        };
        var container;

        // copy spritesettings
        spriteSettings.image = settings.image;
        spriteSettings.imageName = settings.imageName;
        spriteSettings.padding = settings.padding;
        spriteSettings.frameWidth = settings.frameWidth;
        spriteSettings.frameHeight = settings.frameHeight;
        spriteSettings.frameCountX = settings.frameCountX;
        spriteSettings.frameCountY = settings.frameCountY;
        // can also use a predetermined sprite as base for every
        if (settings.sprite) {
            settings.sprite = settings.sprite.animationSettings;
            spriteSettings.image = settings.sprite.image;
            spriteSettings.imageName = settings.sprite.imageName;
            spriteSettings.padding = settings.sprite.padding;
            spriteSettings.frameWidth = settings.sprite.frameWidth;
            spriteSettings.frameHeight = settings.sprite.frameHeight;
            spriteSettings.frameCountX = settings.sprite.frameCountX;
            spriteSettings.frameCountY = settings.sprite.frameCountY;
        }

        Utils.extend(entitySettings, settings);
        // merge components array
        entitySettings.components = settings.components;
        /*
         * Public interface
         */
        container = new Entity(entitySettings).extend({
            /*
             * Sets current value
             * @snippet #Counter.setValue|snippet
                setValue(${1:0});
             */
            setValue: function (val) {
                value = val;
                updateDigits();
            },
            /*
             * Retrieves current value
             * @snippet #Counter.getValue|Number
                getValue();
             */
            getValue: function (justNumber) {
                var thisValue = value;
                if (justNumber) {
                    thisValue = parseInt(thisValue);
                }
                return thisValue;
            },
            /*
             * Add value
             * @snippet #Counter.addValue|snippet
                addValue(${1:0});
             */
            addValue: function (val) {
                value += val;
                updateDigits();
            },
            /*
             * Get number of digits
             * @snippet #Counter.getDigits|Number
                getDigits();
             */
            getDigits: function () {
                return getDigits();
            },
            /*
             * Loop through digits
             * @snippet #Counter.loopDigits|snippet
                loopDigits(function (digitEntity) {$1});
             */
            loopDigits: function (callback) {
                var i = 0,
                    l;
                for (i = 0, l = children.length; i < l; ++i) {
                    callback(children[i]);
                }
            },
        });

        updateDigits();

        return container;
    };

    return GameCounter;
});