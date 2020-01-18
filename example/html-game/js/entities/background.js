/**
 * Module description
 * @moduleName Background
 * @snippet Background.snippet
Background({
    levelSkin: levelSkin
})
 */
bento.define('entities/background', [
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
    'globals'
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
    Globals
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var levelSkin = settings.levelSkin || 1;
        var useBgColorOveride = Globals.useBgColorOveride;
        var bgColorOveride = Globals.bgColorOveride;

        // --- FUNCTIONS ---
        var Osc = function (x, speed) {
            return Math.sin((background.timer + x) * speed);
        };

        // --- VARS ---
        var rainbowImg = Bento.assets.getImage('backgrounds/rainbow');
        var img = Bento.assets.getImage('backgrounds/' + levelSkin);
        var pixel = Bento.assets.getImage('pixel');
        var ix = img.x;
        var iy = img.y;
        var iw = img.width;
        var ih = img.height;
        var splits = img.height / 4;
        var intensity = 0;
        var flashIntensity = 0;

        var drawBehaviour = {
            name: "drawBehaviour",
            draw: function (data) {
                var v = Bento.getViewport();
                var r = data.renderer;
                if (!Globals.useBgColorOveride) {
                    if (intensity > 0.05) {
                        var spacing = (ih / splits);
                        for (var y = 0; y < (ih - spacing); y += spacing) {
                            r.drawImage(
                                img,
                                ix,
                                iy + y,
                                iw,
                                spacing,

                                (-iw * 0.5) + ((Osc((y - v.y) * 0.25, 0.05) * 64) - 32) * intensity * 0.5,
                                (-ih * 0.5) + y,
                                iw + (64 * intensity),
                                spacing
                            );
                        }
                        data.renderer.setOpacity(0.25 * intensity);
                        data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.COLOR);
                        r.drawImage(
                            rainbowImg,
                            rainbowImg.x,
                            rainbowImg.y,
                            rainbowImg.width,
                            rainbowImg.height,
                            (-iw * 0.5),
                            ((background.timer * 15) % ih) + (-ih * 0.5),
                            iw,
                            ih
                        );
                        r.drawImage(
                            rainbowImg,
                            rainbowImg.x,
                            rainbowImg.y,
                            rainbowImg.width,
                            rainbowImg.height,
                            (-iw * 0.5),
                            ((background.timer * 15) % ih) + (-ih * 1.5),
                            iw,
                            ih
                        );
                        data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.NORMAL);
                        data.renderer.setOpacity(1);
                    } else {
                        r.drawImage(
                            img,
                            ix,
                            iy,
                            iw,
                            ih,
                            (-iw * 0.5),
                            (-ih * 0.5),
                            iw,
                            ih
                        );
                    }
                    if (flashIntensity > 0) {
                        data.renderer.setOpacity(flashIntensity);
                        r.drawImage(
                            pixel,
                            0,
                            0,
                            1,
                            1,
                            viewport.width * -0.5 / Globals.pixelScale,
                            viewport.height * -0.5 / Globals.pixelScale,
                            viewport.width / Globals.pixelScale,
                            viewport.height / Globals.pixelScale
                        );
                        data.renderer.setOpacity(1);
                    }
                } else {
                    r.fillRect(Utils.hexToColor(Globals.bgColorOveride), viewport.width * -0.5 / Globals.pixelScale, viewport.height * -0.5 / Globals.pixelScale, viewport.width / Globals.pixelScale, viewport.height / Globals.pixelScale);
                }
            }
        };


        var background = new Entity({
            z: Globals.layers.bg,
            name: 'background',
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.5),
            float: true,
            scale: Globals.pixelScaleV.scalarMultiply(2),
            components: [
                drawBehaviour
            ]
        }).extend({
            getFeverIntensity: function () {
                return intensity;
            },
            setFeverIntensity: function (newIntensity) {
                intensity = newIntensity;
            },
            flash: function (power) {
                power = power || 0.5;
                new Tween({
                    from: power,
                    to: 0,
                    in: 60,
                    ease: 'easeOutExpo',
                    onUpdate: function (v, t) {
                        flashIntensity = v;
                    },
                    onComplete: function () {
                        flashIntensity = 0;
                    }
                });
            }
        });
        return background;
    };
});