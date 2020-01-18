/**
 * Swaps out two colors on an image and spits out an PackedImage with the colors swapped (Only comparesRGB)
 * @moduleName ColorSwapper
 * @snippet ColorSwapper.snippet
ColorSwapper(Bento.assets.getImage(''),[],[])
 */
bento.define('colorswapper', [
    'bento',
    'bento/utils',
    'color',
    'bento/packedimage'
], function (
    Bento,
    Utils,
    Color,
    PackedImage
) {
    var cache = {};
    var ColorSwapper = function (image, oldColors, newColors) {
        var toKey = function (col) {
            return Utils.isDefined(col) ? (Utils.isDefined(col.toHex) ? col.toHex() : oldColors[0]) : '#NONE';
        };
        var key = image.image.src + '_' + image.x + '_' + image.y + '_' + toKey(oldColors[0]) + ',' + toKey(oldColors[1]) + ',' + toKey(oldColors[2]) + '_' + toKey(newColors[0]) + ',' + toKey(newColors[1]) + ',' + toKey(newColors[2]);
        if (cache[key]) {
            return cache[key];
        }
        //make canvas
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        //draw sprite
        context.drawImage(image.image, image.x, image.y, image.width, image.height, 0, 0, image.width, image.height);

        // collect image data
        for (var c = 0; c < oldColors.length; c++) {
            var imageData = context.getImageData(0, 0, image.width, image.height);

            // swap colors
            for (var i = 0; i < imageData.data.length; i += 4) {
                var thisPixel = new Color(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]);
                if (thisPixel.a > 0.1 && (oldColors[c] == "all" || thisPixel.equals(oldColors[c]))) {

                    var P = (i / 4);
                    var PX = P % image.width;
                    var PY = Math.floor(P / image.width);
                    var random = Math.random();
                    var data = {};

                    //check and see if we want to run an imageeffect
                    switch (newColors[c]) {
                    case "darken":
                        imageData.data[i] = imageData.data[i] * (35 / 255);
                        imageData.data[i + 1] = imageData.data[i + 1] * (34 / 255);
                        imageData.data[i + 2] = imageData.data[i + 2] * (108 / 255);
                        break;
                    case "hologram":
                        data.val = 0.9 + (random * 0.2);
                        imageData.data[i] = imageData.data[i] * data.val;
                        imageData.data[i + 1] = imageData.data[i + 1] * data.val;
                        imageData.data[i + 2] = imageData.data[i + 2] * data.val;
                        imageData.data[i + 3] = imageData.data[i + 3] * data.val;
                        // every other row do this
                        if (PY % 2 == 0) {
                            imageData.data[i] = imageData.data[i] * 1.1;
                            imageData.data[i + 1] = imageData.data[i + 1] * 1.1;
                            imageData.data[i + 2] = imageData.data[i + 2] * 1.75;
                            imageData.data[i + 3] = imageData.data[i + 3] * 0.75;
                        } else {
                            imageData.data[i] = imageData.data[i] * 0.9;
                            imageData.data[i + 1] = imageData.data[i + 1] * 0.9;
                            imageData.data[i + 2] = imageData.data[i + 2] * 2;
                            imageData.data[i + 3] = imageData.data[i + 3];
                        }
                        // skip the next pixel
                        imageData.data[i + 4] = imageData.data[i];
                        imageData.data[i + 5] = imageData.data[i + 1];
                        imageData.data[i + 6] = imageData.data[i + 2];
                        imageData.data[i + 7] = imageData.data[i + 3];
                        i += 4;
                        break;
                    default:
                        imageData.data[i] = newColors[c].r;
                        imageData.data[i + 1] = newColors[c].g;
                        imageData.data[i + 2] = newColors[c].b;
                        break;
                    }
                }
            }
            context.putImageData(imageData, 0, 0);
            if (oldColors[c] == "all") {
                break;
            }
        }

        //store the new data
        var outImage = new PackedImage(canvas);

        cache[key] = outImage;

        //delete canvases
        canvas = null;
        context = null;
        return outImage;
    };

    if (Utils.isCocoonJs() && window.Cocoon && window.Cocoon.App && window.Cocoon.App.on) {
        // window.Cocoon.App.on('memorywarning', function () {
        //     // remove cache
        //     cache = {};
        // });
    }

    return ColorSwapper;
});