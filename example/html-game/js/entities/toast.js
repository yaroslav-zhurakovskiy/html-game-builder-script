/**
 * Module description
 * @moduleName Toast
 * @snippet Toast.snippet
Toast({imageName:'',text:'',position: new Vector2(0,0),timeOnScreen:-1});
 */
bento.define('entities/toast', [
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
    'components/spritecontainer',
    'bento/components/nineslice',
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
    SpriteContainer,
    NineSlice
) {
    'use strict';
    return function (settings) {

        var timeOnScreen = settings.timeOnScreen || -1;  //-1 for ever
        var special = settings.special || false;  //-1 for ever

        var toastWidth = 160;
        var toastHeight = 18;
        var iconWidth = 22;
        var dying = false;
        var text = new Text({
            fontSettings: Utils.getTextStyle((special)?'toastSpecial':'toast'),
            position: new Vector2(iconWidth/2, 0),
            text: settings.text || '',
            maxWidth: toastWidth - iconWidth,
            maxHeight: toastHeight,

        });

        var icon = new SpriteContainer({
            imageName: settings.imageName || null,
            spriteSheet: settings.spriteSheet || null,
            position: new Vector2(0-toastWidth/2+iconWidth/2+5,0),
            originRelative: new Vector2(0.5,0.5),
            scale: settings.scale || Globals.pixelScaleUIV.clone().scalarMultiply(1.2)
        });

        var back = new Entity({
            name: 'toastback',
            scale: Globals.pixelScaleUIV.clone(),
            components:[
                new NineSlice({
                imageName: 'ui/9slices/tabs',
                originRelative: new Vector2(0.5, 0.5),
                width: toastWidth/Globals.pixelScaleUI,
                height: toastHeight/Globals.pixelScaleUI})
            ]
        });

        var kill = function(){
            if (dying){
                return;
            }
            dying = true;
            new Tween({
                from: 1,
                to: 0,
                in: 20,
                delay: timeOnScreen,
                ease: 'linear',
                onStart: function () {},
                onUpdate: function (v, t) {
                    entity.alpha = v;
                },
                onComplete: function () {
                    entity.removeSelf();
                }
            });
        };

        var entity = new Entity({
            z: Globals.layers.gui,
            name: 'toast',
            family: ['toasts'],
            position: settings.position.clone(),
            updateWhenPaused: 0,
            float: true,
            components: [
                back,
                icon,
                text,
                {
                    name: 'behaviourComponent',
                    update: function(data){
                        if(special){
                            data.entity.position.y =  settings.position.y + Math.sin(data.entity.timer*0.2) * 1;
                            data.entity.rotation = Math.sin(data.entity.timer*0.8) * 0.008;
                        }
                    },
                    start: function (data) {
                        new Tween({
                            from: 0,
                            to: 1,
                            in: 20,
                            ease: 'easeOutBack',
                            onUpdate: function (v, t) {
                                entity.scale.x = v;
                                entity.position.x = settings.position.x - toastWidth + toastWidth*v;
                            },
                            onComplete: function () {
                                if(timeOnScreen > -1 && !dying){
                                    dying = true;
                                    new Tween({
                                        from: 1,
                                        to: 0,
                                        in: 20,
                                        delay: timeOnScreen,
                                        ease: 'linear',
                                        onStart: function () {},
                                        onUpdate: function (v, t) {
                                            entity.alpha = v;
                                        },
                                        onComplete: function () {
                                            entity.removeSelf();
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            ]
        }).extend({
            kill: kill
        });

        return entity;
    };
});