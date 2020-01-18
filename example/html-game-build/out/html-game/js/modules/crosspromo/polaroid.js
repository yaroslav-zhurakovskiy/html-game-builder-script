/**
 * Polaroid like entity, containing a video, border, button, for crosspromo
 * @moduleName CrosspromoPolaroid
 * @snippet CrosspromoPolaroid|constructor
CrosspromoPolaroid({
    position: new Vector2(0, 0)
})
 */
bento.define('modules/crosspromo/polaroid', [
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
    'modules/localization',
    'bento/packedimage'
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
    Localization,
    PackedImage
) {
    'use strict';
    return function (settings) {
        var videoSource = settings.videoSource || [];
        var size = settings.size || new Rectangle(0, 0, 128, 128);
        var videoSize = new Rectangle(0, 0, 0, 0);
        var videoEntity; // created when video is loaded
        var videoElement, videoBaseTexture, videoTexture, videoSprite;

        /**
         * Create video element, the video is loaded and played asap
         */
        var makeVideoElement = function (videoSrc, onLoadedMetaData) {
            var video = document.createElement('video');
            var createSource = function (path, type) {
                if (!type) {
                    type = 'video/' + path.substr(path.lastIndexOf('.') + 1);
                }

                var source = document.createElement('source');

                source.src = path;
                source.type = type;

                return source;
            };

            video.loop = true;
            video.muted = true;
            video.setAttribute('webkit-playsinline', 'webkit-playsinline'); // Fix fullscreen problem on IOS 8 and 9
            video.setAttribute('playsinline', 'playsinline'); // Fix fullscreen problem on IOS 10
            video.crossOrigin = 'anonymous';
            video.addEventListener('loadedmetadata', function (evt) {
                videoSize.width = video.videoWidth;
                videoSize.height = video.videoHeight;
                if (videoEntity) {
                    // setup scale
                    videoEntity.scale.x = 220 / videoSize.width;
                    videoEntity.scale.y = 220 / videoSize.height;
                }
                if (onLoadedMetaData) {
                    onLoadedMetaData();
                }
            });


            // array of objects or strings
            if (Array.isArray(videoSrc)) {
                for (var i = 0; i < videoSrc.length; ++i) {
                    video.appendChild(createSource(videoSrc[i].src || videoSrc[i], videoSrc[i].mime));
                }
            }
            // single object or string
            else {
                video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
            }

            video.load();
            video.play();

            return video;
        };
        /**
         * Converts a video source url to a pixi texture
         */
        var makePixiVideoEntity = function () {
            if (videoEntity) {
                videoEntity.removeSelf();

                // unload the video element
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();

                // destroy sprite, texture and base texture
                videoBaseTexture.update = function () {};
                videoSprite.destroy(true, true);
            }

            if (!videoSource || videoSource.length === 0) {
                return;
            }

            videoElement = makeVideoElement(videoSource);
            // convert the video to a texture
            videoBaseTexture = new window.PIXI.VideoBaseTexture.fromVideo(videoElement);
            videoTexture = new window.PIXI.Texture(videoBaseTexture);
            videoSprite = new window.PIXI.Sprite(videoTexture);

            var selfVideo = videoElement;
            var selfPaused = false;

            // Global object to ensure the video doesn't play in the background, when removed or paused.
            var videoPause = {
                name: 'videoPause',
                video: videoElement,
                paused: false,
                updateWhenPaused: 999,
                start: function () {
                    this.play();
                },
                destroy: function () {
                    this.pause();
                },
                pause: function () {
                    if (!this.paused) {
                        this.paused = true;
                        this.video.pause();
                    }
                },
                play: function () {
                    if (this.paused) {
                        this.paused = false;
                        this.video.play();
                    }
                },
                update: function () {
                    if (Bento.objects.isPaused(videoEntity)) {
                        if (!this.paused) {
                            this.paused = true;
                            this.video.pause();
                        }
                    } else {
                        if (this.paused) {
                            this.paused = false;
                            this.video.play();
                        }
                    }
                },
            };

            videoEntity = new Entity({
                name: 'video',
                // position relative to border sprite size
                position: new Vector2(-110, -110),
                components: [
                    new Object({
                        name: 'renderVideo',
                        start: function () {
                            Bento.objects.attach(videoPause);
                        },
                        destroy: function () {
                            Bento.objects.remove(videoPause);
                        },
                        draw: function (data) {
                            data.renderer.drawPixi(videoSprite);
                        },
                    })
                ]
            });

            videoContainer.attach(videoEntity);
            return videoEntity;
        };
        var makeCanvasVideoEntity = function () {
            var video = makeVideoElement(videoSource, function () {
                // convert the video to a sprite
                var packedImage = new PackedImage(video);
                var sprite;

                packedImage.width = video.videoWidth;
                packedImage.height = video.videoHeight;

                sprite = new Sprite({
                    image: packedImage
                });
                videoEntity.attach(sprite);
            });

            if (videoEntity) {
                videoEntity.removeSelf();
            }

            videoEntity = new Entity({
                name: 'video',
                // position relative to border sprite size
                position: new Vector2(-110, -110),
                components: []
            });

            videoContainer.attach(videoEntity);
            return videoEntity;
        };
        var isPixi = Bento.getRenderer().name === 'pixi';
        var border = new Sprite({
            imageName: 'crosspromo-border',
            originRelative: new Vector2(0.5, 0.5),
        });
        var playText = new Text({
            position: new Vector2(62, 110),
            text: 'play',
            font: 'crosspromo',
            fontSize: 24,
            fontColor: '#fff',
            align: 'center',
            textBaseline: 'middle',
            maxWidth: 72,
            maxHeight: 24,
            components: []
        });
        var otherGamesText = new Text({
            position: new Vector2(-48, 110),
            text: Localization.getText('moreGames'),
            font: 'crosspromo',
            fontSize: 20,
            fontColor: '#777',
            align: 'center',
            textBaseline: 'middle',
            maxWidth: 128,
            maxHeight: 20,
            components: []
        });
        var videoContainer = new Entity({
            name: 'videoContainer',
        });
        var entity = new Entity({
            z: settings.z,
            name: 'crosspromo',
            position: settings.position,
            scale: settings.scale,
            rotation: settings.rotation,
            components: [
                videoContainer,
                border,
                playText,
                otherGamesText
            ]
        });

        // load video later
        entity.extend({
            setVideoUrl: function (src) {
                videoSource = src;
                if (isPixi) {
                    makePixiVideoEntity();
                } else {
                    makeCanvasVideoEntity();
                }
            },
            setSize: function (rect) {
                entity.scale.x = rect.width / border.frameWidth;
                entity.scale.y = rect.height / border.frameHeight;
            }
        });

        if (videoSource) {
            if (isPixi) {
                makePixiVideoEntity();
            } else {
                makeCanvasVideoEntity();
            }
        }

        entity.setSize(size);

        return entity;
    };
});