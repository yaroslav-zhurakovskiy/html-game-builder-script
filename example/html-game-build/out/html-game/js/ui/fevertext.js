/**
 * Module description
 * @moduleName FeverText
 * @snippet FeverText.snippet
FeverText({
    position: new Vector2(0, 0)
})
 */
bento.define('ui/fevertext', [
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
    'globals',
    'modules/localization'
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
    Globals,
    Localization
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- PARAMETERS ---
        var position = settings.position;


        // --- VARS ---
        var textString = Localization.getText('fever');
        var horizontalSpacing = 14;
        var scaleFactor = 1;
        var components = [];
        var letters = [];

        switch (Localization.getLanguage()) {
        case "ja":
            horizontalSpacing = 22;
            break;
        case "ko":
            horizontalSpacing = 22;
            break;
        case "ru":
            horizontalSpacing = 14;
            scaleFactor = 0.75;
            break;
        case "zh":
            horizontalSpacing = 22;
            break;
        case "zt":
            horizontalSpacing = 14;
            break;
        default:
            horizontalSpacing = 14;
            break;
        }


        // --- FUNCTIONS ---
        var makeLetter = function (index) {
            // get this letter
            var subString = textString.slice(index, index + 1);

            //wave effect
            var waveBehaviour = {
                name: "waveEffect",
                start: function () {
                    var p = this.parent;
                    p.scale = new Vector2(0, 0);
                    new Tween({
                        from: 0,
                        to: 1,
                        in: 30,
                        delay: 5 * index,
                        applyOnDelay: 0,
                        ease: 'easeOutBack',
                        onUpdate: function (v, t) {
                            p.scale.x = v * scaleFactor;
                            p.scale.y = v * scaleFactor;
                        }
                    });
                },
                update: function () {
                    var p = this.parent;
                    p.position.y = Math.sin((-p.timer + (index * 10)) * 0.1) * 3;
                    p.rotation = Math.sin((-p.timer + (index * 10)) * 0.15) * 0.1;
                }
            };

            // the letter text
            var thisText = new Text({
                position: new Vector2(0, 0),
                text: subString,
                fontSettings: Utils.getTextStyle('fever')
            });

            //final entity
            var thisLetter = new Entity({
                name: 'thisLetter',
                position: new Vector2(((textString.length * -0.5) + index + 1) * horizontalSpacing, 0),
                components: [
                    thisText,
                    waveBehaviour
                ]
            });
            letters.push(thisLetter);
        };
        var onFeverChanged = function (start) {
            if (start) {
                return;
            }
            Utils.forEach(letters, function (letter, i, l, breakLoop) {
                new Tween({
                    from: letter.scale.clone(),
                    to: new Vector2(0, 0),
                    in: 30,
                    delay: 5 * i,
                    ease: 'easeInBack',
                    onUpdate: function (v, t) {
                        letter.scale = v;
                    }
                });
            });
            new Tween({ in: 30 + letters.length * 5,
                onComplete: function () {
                    entity.removeSelf();
                }
            });
        };


        // --- COMPONENTS ---
        //glowing
        var glowBehaviour = {
            name: 'feverDrawBehaviour',
            start: function () {
                EventSystem.on('onFeverChanged', onFeverChanged);
            },
            draw: function (data) {
                if (this.parent.alpha === 0) {
                    return;
                }
                // turn effect on
                data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.ADD);

                //draw
                Utils.forEach(letters, function (letter, i, l, breakLoop) {
                    var preScale = letter.scale.clone();
                    letter.scale = preScale.scalarMultiply(1.5);
                    letter.draw(data);
                    letter.scale = preScale;
                });

                // turn effect off
                data.renderer.setPixiBlendMode(PIXI.BLEND_MODES.NORMAL);
            }
        };
        components.push(glowBehaviour);

        //add letter components
        for (var i = 0; i < textString.length; i++) {
            makeLetter(i);
        }
        components = components.concat(letters);


        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.active3,
            name: 'feverText',
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.33),
            updateWhenPaused: 0,
            float: true,
            components: components
        });
        //attach
        Bento.objects.attach(entity);
        return entity;
    };
});