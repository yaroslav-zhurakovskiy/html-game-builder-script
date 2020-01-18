/**
 * Module description
 * @moduleName RadialBar
 * @snippet RadialBar.snippet
RadialBar({
    name: 'radialBar',
    position: new Vector2(0, 0),
    scale: new Vector2(0, 0),
    currentPercent: 1,
    radius: 32,
    angle: 360,
    segments: 18,
    color: new Color(255, 255, 255),
    thickness: 8
})
 */
bento.define('components/radialbar', [
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
    'color',
    'colorswapper'
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
    Color,
    ColorSwapper
) {
    'use strict';
    return function (settings) {
        var TwoPi = Math.PI * 2;
        // --- PARAMETERS ---
        var color = settings.color || new Color(255, 0, 0);
        var colorBG = settings.colorBG;
        var radius = settings.radius || 32;
        var currentPercent = settings.currentPercent || 0;
        var segments = settings.segments || 36;
        var thickness = settings.thickness || 6;
        var startAngle = Utils.toRadian(settings.startAngle || 0);
        var endAngle = Utils.toRadian(settings.endAngle || 360);
        var totalAngle = endAngle - startAngle;
        var angleStep = totalAngle / segments;
        var overstep = TwoPi * (settings.overstep || 0.0025);

        var doDraw = true;
        var drawn = false;


        var lineFG = new ColorSwapper(Bento.assets.getImage('pinkPixel'), [new Color(255, 0, 255)], [color]);
        var lineBG;
        if (colorBG) {
            lineBG = new ColorSwapper(Bento.assets.getImage('pinkPixel'), [new Color(255, 0, 255)], [colorBG]);
        }
        var line = function (r, img, thickness, startPoint, endPoint) {
            var delta = endPoint.subtract(startPoint);
            var angle = delta.angle();
            var mag = delta.magnitude();
            r.translate(startPoint.x, startPoint.y);
            r.rotate(angle);
            r.drawImage(img, 0, 0, 8, 8, 0, -(thickness / 2), mag, thickness);
            r.rotate(-angle);
            r.translate(-startPoint.x, -startPoint.y);
        };

        // --- BEHAVIOUR ---
        var behavior = {
            name: "drawbehaviour",
            draw: function (data) {
                var r = data.renderer;

                var lastPos = new Vector2(0, -radius).rotateRadian(startAngle);
                var thisPos = lastPos.clone();
                var currentAngle = startAngle + (totalAngle * currentPercent);

                if (doDraw) {
                    if (colorBG) {
                        for (var a1 = 0; a1 <= totalAngle; a1 += angleStep) {
                            thisPos = new Vector2(Math.sin(a1 + overstep) * radius, Math.cos(a1 + overstep) * -radius);
                            line(r, lineBG, thickness + 2, lastPos.clone(), thisPos.clone());
                            lastPos = new Vector2(Math.sin(a1) * radius, Math.cos(a1) * -radius);
                        }
                        if (a1 !== totalAngle) {
                            thisPos = new Vector2(Math.sin(totalAngle) * radius, Math.cos(totalAngle) * -radius);
                            line(r, lineBG, thickness + 2, lastPos.clone(), thisPos.clone());
                            lastPos = thisPos.clone();
                        }
                        lastPos = new Vector2(0, -radius).rotateRadian(startAngle);
                    }

                    for (var a2 = 0; a2 <= currentAngle; a2 += angleStep) {
                        thisPos = new Vector2(Math.sin(a2 + overstep) * radius, Math.cos(a2 + overstep) * -radius);
                        line(r, lineFG, thickness, lastPos.clone(), thisPos.clone());
                        lastPos = new Vector2(Math.sin(a2) * radius, Math.cos(a2) * -radius);
                    }
                    if (a2 !== currentAngle) {
                        thisPos = new Vector2(Math.sin(currentAngle) * radius, Math.cos(currentAngle) * -radius);
                        line(r, lineFG, thickness, lastPos.clone(), thisPos.clone());
                        lastPos = thisPos.clone();
                    }
                    lastPos = new Vector2(0, -radius).rotateRadian(startAngle);
                }
            }
        };

        // --- ENTITY ---
        var entity = new Entity({
            z: settings.z || 0,
            name: settings.name || 'radialBar',
            position: settings.position || new Vector2(0, 0),
            scale: settings.scale || new Vector2(1, 1),
            float: Utils.isDefined(settings.float) ? settings.float : false,
            components: [
                behavior
            ]
        }).extend({
            setRadius: function (newRadius) {
                radius = newRadius;
                drawn = false;
            },
            setColor: function (newColor) {
                color = newColor;
                drawn = false;
            },
            setBGColor: function (newColor) {
                colorBG = newColor;
                drawn = false;
            },
            getPercent: function () {
                return currentPercent;
            },
            setPercent: function (newPercent) {
                if (newPercent !== currentPercent) {
                    currentPercent = newPercent;
                    doDraw = (newPercent !== 0);
                    drawn = false;
                }
            }
        });
        return entity;
    };
});