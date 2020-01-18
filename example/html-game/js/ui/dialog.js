/**
 * Module description
 * @moduleName Dialog
 * @snippet Dialog.snippet
Dialog({
    titleText: '',
    bodyText: '',
    type: 'yesno',
    onYes: function (dialog) {
        dialog.close();
    },
    onNo: function (dialog) {
        dialog.close();
    },
    components: [],
    attach: true
})
 */
bento.define('ui/dialog', [
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
    'bento/components/modal',
    'globals',
    'components/spritecontainer',
    'bento/components/fill'
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
    Modal,
    Globals,
    SpriteContainer,
    Fill
) {
    'use strict';
    return function (settings) {
        var viewport = Bento.getViewport();

        // --- VARS ---
        var animating = false;

        // --- PARAMETERS ---
        var offset = settings.offset || new Vector2(0, 0);
        var titleString = settings.titleText || "";
        var bodyString = settings.bodyText || "";
        var type = Utils.isDefined(settings.type) ? settings.type : 'yes';
        var onYes = settings.onYes || function () {
            close();
        };
        var onNo = settings.onNo || function () {
            close();
        };
        var onComplete = settings.onComplete || function () {};
        var components = settings.components || [];
        var hidebuttons = Utils.isDefined(settings.hidebuttons) ? settings.hidebuttons : false;
        var attach = Utils.isDefined(settings.attach) ? settings.attach : true;
        var doPause = Utils.isDefined(settings.doPause) ? settings.doPause : true;

        // --- FUNCTIONS ---
        var open = function () {
            if (!animating) {
                animating = true;

                new Tween({
                    from: 0.5,
                    to: 1,
                    in: 100,
                    decay: 8,
                    oscilations: 5,
                    ease: 'easeOutElastic',
                    onUpdate: function (v, t) {
                        ribbon.scale.x = Globals.pixelScaleUI * v;
                    }
                });

                new Tween({
                    from: 0,
                    to: 0.66,
                    in: 20,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        backgroundFill.alpha = v;
                    }
                });
                new Tween({
                    from: new Vector2(0, 0),
                    to: new Vector2(1, 1),
                    in: 20,
                    ease: 'easeOutBack',
                    onUpdate: function (v, t) {
                        mainBox.scale = v;
                    },
                    onComplete: function () {
                        animating = false;
                    }
                });
            }
        };
        var close = function () {
            if (!animating) {
                animating = true;
                new Tween({
                    from: 0.5,
                    to: 0,
                    in: 20,
                    ease: 'linear',
                    onUpdate: function (v, t) {
                        backgroundFill.alpha = v;
                    }
                });
                new Tween({
                    from: new Vector2(1, 1),
                    to: new Vector2(0, 0),
                    in: 20,
                    ease: 'easeInBack',
                    onUpdate: function (v, t) {
                        mainBox.scale = v;
                    },
                    onComplete: function () {
                        entity.removeSelf();
                        onComplete();
                        animating = false;
                    }
                });
            }
        };

        // --- COMPONENTS ---
        var backgroundFill = new Entity({
            name: 'backgroundFill',
            alpha: 0.5,
            components: [
                new Fill({
                    dimension: new Rectangle(0, 0, viewport.width, viewport.height),
                    color: [0, 0, 0, 1]
                })
            ]
        });

        var ribbon = new SpriteContainer({
            imageName: 'ui/ribbon',
            originRelative: new Vector2(0.5, 0.25),
            position: new Vector2(0, 0),
            scale: Globals.pixelScaleUIV.clone()
        });
        var titleBanner = new Entity({
            name: 'titleBanner',
            family: [''],
            position: new Vector2(0, -66),
            components: [
                ribbon,
                new Text({
                    fontSettings: Utils.getTextStyle('dialogTitle'),
                    position: new Vector2(0, 2),
                    text: titleString,
                    maxWidth: 128,
                    maxHeight: 30
                })
            ]
        });

        var body = new Entity({
            name: 'bodyText',
            position: new Vector2(0, 18),
            components: [
                (bodyString !== '') ? new Text({
                    fontSettings: Utils.getTextStyle('dialogBody'),
                    position: new Vector2(0, 0),
                    text: bodyString,
                    maxWidth: 160,
                    maxHeight: 128
                }) : {
                    name: 'blank'
                }
            ]
        });
        Utils.forEach(components, function (component, i, l, breakLoop) {
            body.attach(component);
        });


        var yesButton = new ClickButton({
            name: 'yesButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/greenbutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(0, 84),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.33),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                onYes(entity);
            }
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/tick',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.625, 0.625)
        }));

        var noButton = new ClickButton({
            name: 'noButton',
            sfx: 'sfx_clickbutton',
            imageName: 'ui/orangebutton',
            frameCountX: 1,
            frameCountY: 3,
            position: new Vector2(-40, 84),
            scale: Globals.pixelScaleUIV.scalarMultiply(1.33),
            updateWhenPaused: 0,
            sort: true,
            onClick: function () {
                onNo(entity);
            }
        }).attach(new SpriteContainer({
            imageName: 'ui/icons/close',
            originRelative: new Vector2(0.5, 0.5),
            scale: new Vector2(0.625, 0.625)
        }));

        if (hidebuttons) {
            yesButton.scale = new Vector2(0.001, 0.001);
            noButton.scale = new Vector2(0.001, 0.001);
        }
        var showButtons = function () {
            hidebuttons = false;
            new Tween({
                from: new Vector2(0.001, 0.001),
                to: Globals.pixelScaleUIV.scalarMultiply(1.33),
                in: 15,
                ease: 'easeOutBack',
                onUpdate: function (v, t) {
                    yesButton.scale = v;
                    noButton.scale = v;
                }
            });
        };
        var hideButtons = function () {
            hidebuttons = true;
            new Tween({
                from: Globals.pixelScaleUIV.scalarMultiply(1.33),
                to: new Vector2(0.001, 0.001),
                in: 15,
                ease: 'easeOutExpo',
                onUpdate: function (v, t) {
                    yesButton.scale = v;
                    noButton.scale = v;
                }
            });
        };


        var mainBox = new Entity({
            name: 'mainBackboard',
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.5).add(offset),
            components: [
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(settings.bgScale || new Vector2(1, 1)).multiply(new Vector2(1, 1))
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(settings.bgScale || new Vector2(1, 1)).multiply(new Vector2(-1, 1))
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(settings.bgScale || new Vector2(1, 1)).multiply(new Vector2(-1, -1))
                }),
                new SpriteContainer({
                    imageName: 'ui/backboard',
                    originRelative: new Vector2(0.999, 0.999),
                    scale: Globals.pixelScaleUIV.multiply(settings.bgScale || new Vector2(1, 1)).multiply(new Vector2(1, -1))
                }),
                (titleString !== "") ? titleBanner : {
                    name: 'blank'
                },
                (bodyString !== "" || components.length !== 0) ? body : {
                    name: 'blank'
                }
            ]
        });
        if (type === 'yes') {
            mainBox.attach(yesButton);
        }
        if (type === "yesno") {
            mainBox.attach(yesButton);
            mainBox.attach(noButton);
            yesButton.position.x = 40;
        }

        // --- ENTITY ---
        var entity = new Entity({
            z: settings.z || Globals.layers.modals,
            name: 'dialog',
            position: new Vector2(0, 0),
            updateWhenPaused: 0,
            float: true,
            components: [
                (doPause) ? new Modal({}) : {
                    name: 'blank'
                }, {
                    name: "startBehaviour",
                    start: function () {
                        open();
                    }
                },
                backgroundFill,
                mainBox
            ]
        }).extend({
            close: close,
            open: open,
            showButtons: showButtons,
            hideButtons: hideButtons
        });

        //attach
        if (attach) {
            Bento.objects.attach(entity);
        }

        return entity;
    };
});