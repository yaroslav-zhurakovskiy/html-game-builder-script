/**
 * Module description
 * @moduleName Cutscene
 * @snippet Cutscene.snippet
Cutscene({
    cutsceneStrings: [''],
    hideAfter: -1
});
 */
bento.define('ui/cutscene', [
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
    'components/spritecontainer'
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
    SpriteContainer
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();
        var viewMid = new Vector2(viewport.width * 0.5, viewport.height * 0.5);

        // --- VARS ---
        var cutsceneStrings = settings.cutsceneStrings || ['HI, MY NAME IS GROWBOT, HOW DO YOU DO?', 'WOW, CUTSCENES ARE COOL', 'I MUST GO, MY PEOPLE NEED ME'];
        var hideAfter = settings.hideAfter || 300;
        var currentCutsceneString = 0;
        var currentString = '';
        var timer = 0;
        var charIndex = 0;
        var charRate = 2;
        var screenRate = settings.screenRate || 30;
        var fontSize = settings.fontSize || 10;
        var isHiding = false;
        var doAttach = Utils.isDefined(settings.doAttach) ? settings.doAttach : true;
        var yPos = settings.yPos || 80;

        var hide = function () {
            if (isHiding) {
                return;
            }
            isHiding = true;
            new Tween({
                from: speechBubble.scale.clone(),
                to: new Vector2(0, 0),
                in: 30,
                ease: 'easeInBack',
                ignoreGameSpeed: true,
                onUpdate: function (v, t) {
                    speechBubble.scale = v;
                },
            });
            new Tween({
                from: 0,
                to: -0.8,
                in: 25,
                ease: 'easeInBack',
                ignoreGameSpeed: true,
                onUpdate: function (v, t) {
                    growbotContainer.rotation = v;
                }
            });
            new Tween({
                from: growbotContainer.position.x,
                to: -120,
                in: 30,
                ease: 'easeInBack',
                ignoreGameSpeed: true,
                onUpdate: function (v, t) {
                    growbotContainer.position.x = v;
                },
                onComplete: function () {
                    entity.removeSelf();
                }
            });
        };

        // --- COMPONENTS ---
        // sprite
        var speechBubbleSpriteContainer = new SpriteContainer({
            imageName: 'ui/speechbubble',
            originRelative: new Vector2(0.5, 0.6),
            position: new Vector2(0, 0),
            scale: new Vector2(1, 0.6).scalarMultiply(Globals.pixelScale)
        });

        // the actual text
        var speechBubbleText = new Text({
            fontSettings: Utils.getTextStyle('cutscene'),
            text: currentString,
            fontSize: fontSize,
            maxWidth: 100,
            maxHeight: 100
        });

        // progresses the text
        var speechBubbleBehaviour = {
            name: "speechBubbleBehaviour",
            update: function (data) {
                timer++;
                if (charIndex < cutsceneStrings[currentCutsceneString].length) {
                    if (timer > charRate) {
                        timer = 0;
                        charIndex += 2;
                        charIndex = Math.min(cutsceneStrings[currentCutsceneString].length, charIndex);
                        currentString = cutsceneStrings[currentCutsceneString].slice(0, charIndex);
                        Bento.audio.playSound('sfx_growbot_' + (1 + Utils.getRandom(5)));
                    }
                } else {
                    if (timer > screenRate) {
                        if (currentCutsceneString < cutsceneStrings.length - 1) {
                            currentCutsceneString++;
                            charIndex = 0;
                        }
                    }
                }
                if (currentString !== speechBubbleText.getText()) {
                    speechBubbleText.setText(currentString);
                }
            }
        };

        // holds everything
        var speechBubble = new Entity({
            name: 'speechBubble',
            position: new Vector2(viewMid.x + 32, yPos + 16),
            components: [
                speechBubbleSpriteContainer,
                speechBubbleText,
                speechBubbleBehaviour
            ]
        });

        // holds the character sprite
        var growbotContainer = SpriteContainer({
            spriteSheet: 'growbot',
            position: new Vector2(viewMid.x - 55, yPos),
            alpha: 1,
            ignoreGameSpeed: true,
            scale: Globals.pixelScaleV.scalarMultiply(2.1),
            rotation: 0
        });


        // --- ENTITY ---
        var entity = new Entity({
            z: Globals.layers.cutscenes,
            name: 'cutscne',
            position: new Vector2(0, 0),
            float: true,
            components: [
                growbotContainer,
                speechBubble
            ]
        }).extend({
            hide: hide
        });

        //animate in
        new Tween({
            from: growbotContainer.scale.scalarMultiply(0.2),
            to: growbotContainer.scale.clone(),
            in: 100,
            oscilations: 20,
            ease: 'easeOutElastic',
            ignoreGameSpeed: true,
            onUpdate: function (v, t) {
                growbotContainer.scale.x = v.x;
                growbotContainer.scale.y = Globals.pixelScaleV.scalarMultiply(2.1).y * 2 - v.y;

            }
        });
        new Tween({
            from: growbotContainer.position.add(new Vector2(0, 60)),
            to: growbotContainer.position.clone(),
            in: 40,
            oscilations: 6,
            decay: 10,
            ease: 'elastic',
            ignoreGameSpeed: true,
            onUpdate: function (v, t) {
                growbotContainer.position = v;
            }
        });


        new Tween({
            from: new Vector2(0, 0),
            to: speechBubble.scale.clone(),
            in: 30,
            ease: 'easeOutBack',
            ignoreGameSpeed: true,
            onUpdate: function (v, t) {
                speechBubble.scale = v;
            }
        });

        if (hideAfter > 0) {
            new Tween({ in: hideAfter,
                ignoreGameSpeed: true,
                onComplete: function () {
                    hide();
                }
            });
        }

        if (doAttach) {
            Bento.objects.attach(entity);
        }
        return entity;
    };
});