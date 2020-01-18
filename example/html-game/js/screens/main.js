/**
 * Main screen
 */
bento.define('screens/main', [
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
    'bento/screen',
    'bento/tween',
    'globals',
    'bento/components/fill',
    'entities/camera',
    'entities/gamecontroller',
    'profiler',
    'ui/gamegui',
    'components/spritecontainer',
    'ui/vipdialog',
    'components/backbutton',
    'modules/skinmanager',
    'ui/viptestdrivedialog',
    'modules/localization',
    'ui/potaddialog'
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
    Screen,
    Tween,
    Globals,
    Fill,
    Camera,
    GameController,
    Profiler,
    GameGUI,
    SpriteContainer,
    VipDialog,
    BackButton,
    SkinManager,
    VipTestDrive,
    Localization,
    PotAdDialog
) {
    'use strict';
    var onShow = function () {

        //Localization.setLanguage('ja');
        if (Utils.isDev()) {
            window.Bento = Bento;
        }
        /* Screen starts here */
        var viewport = Bento.getViewport();

        // --- CAMERA ---
        var camera = new Camera({
            position: new Vector2(viewport.width * 0.5, viewport.height * 0.5)
        });
        Bento.objects.attach(camera);

        // --- GUI ---
        var gameGUI = new GameGUI({});
        Bento.objects.attach(gameGUI);
        //Profiler.measureFor(5 * 60);

        // --- GAME CONTROLLER ---
        var gameController = new GameController({});
        Bento.objects.attach(gameController);

        // clean up particles that were made when the room ended last
        Utils.forEach(Bento.objects.getByFamily('particles'), function (particle, i, l, breakLoop) {
            if (particle) {
                particle.removeSelf();
            }
        });
    };

    return new Screen({
        onShow: onShow
    });
});