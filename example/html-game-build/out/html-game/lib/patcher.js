/* jshint evil: true */
/**
 * Downloads JS files and runs it
 * @param {String} version - Version string of your game
 * @param {Function} onReady - Called when patcher has ended
 */
(function () {
    /**
     * LZString
     */
    var LZString = (function () {
        // private property
        var f = String.fromCharCode;
        var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
        var baseReverseDic = {};

        function getBaseValue(alphabet, character) {
            if (!baseReverseDic[alphabet]) {
                baseReverseDic[alphabet] = {};
                for (var i = 0; i < alphabet.length; i++) {
                    baseReverseDic[alphabet][alphabet.charAt(i)] = i;
                }
            }
            return baseReverseDic[alphabet][character];
        }

        var LZString = {
            compressToBase64: function (input) {
                if (input == null) return "";
                var res = LZString._compress(input, 6, function (a) {
                    return keyStrBase64.charAt(a);
                });
                switch (res.length % 4) { // To produce valid Base64
                    default: // When could this happen ?
                    case 0:
                        return res;
                case 1:
                        return res + "===";
                case 2:
                        return res + "==";
                case 3:
                        return res + "=";
                }
            },

            decompressFromBase64: function (input) {
                if (input == null) return "";
                if (input == "") return null;
                return LZString._decompress(input.length, 32, function (index) {
                    return getBaseValue(keyStrBase64, input.charAt(index));
                });
            },

            compressToUTF16: function (input) {
                if (input == null) return "";
                return LZString._compress(input, 15, function (a) {
                    return f(a + 32);
                }) + " ";
            },

            decompressFromUTF16: function (compressed) {
                if (compressed == null) return "";
                if (compressed == "") return null;
                return LZString._decompress(compressed.length, 16384, function (index) {
                    return compressed.charCodeAt(index) - 32;
                });
            },

            //compress into uint8array (UCS-2 big endian format)
            compressToUint8Array: function (uncompressed) {
                var compressed = LZString.compress(uncompressed);
                var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

                for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
                    var current_value = compressed.charCodeAt(i);
                    buf[i * 2] = current_value >>> 8;
                    buf[i * 2 + 1] = current_value % 256;
                }
                return buf;
            },

            //decompress from uint8array (UCS-2 big endian format)
            decompressFromUint8Array: function (compressed) {
                if (compressed === null || compressed === undefined) {
                    return LZString.decompress(compressed);
                } else {
                    var buf = new Array(compressed.length / 2); // 2 bytes per character
                    for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
                        buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
                    }

                    var result = [];
                    buf.forEach(function (c) {
                        result.push(f(c));
                    });
                    return LZString.decompress(result.join(''));

                }

            },


            //compress into a string that is already URI encoded
            compressToEncodedURIComponent: function (input) {
                if (input == null) return "";
                return LZString._compress(input, 6, function (a) {
                    return keyStrUriSafe.charAt(a);
                });
            },

            //decompress from an output of compressToEncodedURIComponent
            decompressFromEncodedURIComponent: function (input) {
                if (input == null) return "";
                if (input == "") return null;
                input = input.replace(/ /g, "+");
                return LZString._decompress(input.length, 32, function (index) {
                    return getBaseValue(keyStrUriSafe, input.charAt(index));
                });
            },

            compress: function (uncompressed) {
                return LZString._compress(uncompressed, 16, function (a) {
                    return f(a);
                });
            },
            _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
                if (uncompressed == null) return "";
                var i, value,
                    context_dictionary = {},
                    context_dictionaryToCreate = {},
                    context_c = "",
                    context_wc = "",
                    context_w = "",
                    context_enlargeIn = 2, // Compensate for the first entry which should not count
                    context_dictSize = 3,
                    context_numBits = 2,
                    context_data = [],
                    context_data_val = 0,
                    context_data_position = 0,
                    ii;

                for (ii = 0; ii < uncompressed.length; ii += 1) {
                    context_c = uncompressed.charAt(ii);
                    if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                        context_dictionary[context_c] = context_dictSize++;
                        context_dictionaryToCreate[context_c] = true;
                    }

                    context_wc = context_w + context_c;
                    if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                        context_w = context_wc;
                    } else {
                        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                            if (context_w.charCodeAt(0) < 256) {
                                for (i = 0; i < context_numBits; i++) {
                                    context_data_val = (context_data_val << 1);
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else {
                                        context_data_position++;
                                    }
                                }
                                value = context_w.charCodeAt(0);
                                for (i = 0; i < 8; i++) {
                                    context_data_val = (context_data_val << 1) | (value & 1);
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else {
                                        context_data_position++;
                                    }
                                    value = value >> 1;
                                }
                            } else {
                                value = 1;
                                for (i = 0; i < context_numBits; i++) {
                                    context_data_val = (context_data_val << 1) | value;
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else {
                                        context_data_position++;
                                    }
                                    value = 0;
                                }
                                value = context_w.charCodeAt(0);
                                for (i = 0; i < 16; i++) {
                                    context_data_val = (context_data_val << 1) | (value & 1);
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else {
                                        context_data_position++;
                                    }
                                    value = value >> 1;
                                }
                            }
                            context_enlargeIn--;
                            if (context_enlargeIn == 0) {
                                context_enlargeIn = Math.pow(2, context_numBits);
                                context_numBits++;
                            }
                            delete context_dictionaryToCreate[context_w];
                        } else {
                            value = context_dictionary[context_w];
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = (context_data_val << 1) | (value & 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }


                        }
                        context_enlargeIn--;
                        if (context_enlargeIn == 0) {
                            context_enlargeIn = Math.pow(2, context_numBits);
                            context_numBits++;
                        }
                        // Add wc to the dictionary.
                        context_dictionary[context_wc] = context_dictSize++;
                        context_w = String(context_c);
                    }
                }

                // Output the code for w.
                if (context_w !== "") {
                    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                        if (context_w.charCodeAt(0) < 256) {
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = (context_data_val << 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                            }
                            value = context_w.charCodeAt(0);
                            for (i = 0; i < 8; i++) {
                                context_data_val = (context_data_val << 1) | (value & 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        } else {
                            value = 1;
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = (context_data_val << 1) | value;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = 0;
                            }
                            value = context_w.charCodeAt(0);
                            for (i = 0; i < 16; i++) {
                                context_data_val = (context_data_val << 1) | (value & 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        }
                        context_enlargeIn--;
                        if (context_enlargeIn == 0) {
                            context_enlargeIn = Math.pow(2, context_numBits);
                            context_numBits++;
                        }
                        delete context_dictionaryToCreate[context_w];
                    } else {
                        value = context_dictionary[context_w];
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }


                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                }

                // Mark the end of the stream
                value = 2;
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    } else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }

                // Flush the last char
                while (true) {
                    context_data_val = (context_data_val << 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data.push(getCharFromInt(context_data_val));
                        break;
                    } else context_data_position++;
                }
                return context_data.join('');
            },

            decompress: function (compressed) {
                if (compressed == null) return "";
                if (compressed == "") return null;
                return LZString._decompress(compressed.length, 32768, function (index) {
                    return compressed.charCodeAt(index);
                });
            },

            _decompress: function (length, resetValue, getNextValue) {
                var dictionary = [],
                    next,
                    enlargeIn = 4,
                    dictSize = 4,
                    numBits = 3,
                    entry = "",
                    result = [],
                    i,
                    w,
                    bits, resb, maxpower, power,
                    c,
                    data = {
                        val: getNextValue(0),
                        position: resetValue,
                        index: 1
                    };

                for (i = 0; i < 3; i += 1) {
                    dictionary[i] = i;
                }

                bits = 0;
                maxpower = Math.pow(2, 2);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }

                switch (next = bits) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 2:
                    return "";
                }
                dictionary[3] = c;
                w = c;
                result.push(c);
                while (true) {
                    if (data.index > length) {
                        return "";
                    }

                    bits = 0;
                    maxpower = Math.pow(2, numBits);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }

                    switch (c = bits) {
                    case 0:
                        bits = 0;
                        maxpower = Math.pow(2, 8);
                        power = 1;
                        while (power != maxpower) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }

                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 1:
                        bits = 0;
                        maxpower = Math.pow(2, 16);
                        power = 1;
                        while (power != maxpower) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 2:
                        return result.join('');
                    }

                    if (enlargeIn == 0) {
                        enlargeIn = Math.pow(2, numBits);
                        numBits++;
                    }

                    if (dictionary[c]) {
                        entry = dictionary[c];
                    } else {
                        if (c === dictSize) {
                            entry = w + w.charAt(0);
                        } else {
                            return null;
                        }
                    }
                    result.push(entry);

                    // Add w+entry[0] to the dictionary.
                    dictionary[dictSize++] = w + entry.charAt(0);
                    enlargeIn--;

                    w = entry;

                    if (enlargeIn == 0) {
                        enlargeIn = Math.pow(2, numBits);
                        numBits++;
                    }

                }
            }
        };
        return LZString;
    })();
    /*
     * Cocoon's atob function is unreliable
     * using atob method from https://gist.github.com/sevir/3946819
     */
    (function (window) {
        var _PADCHAR = "=",
            _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        function _getbyte64(s, i) {
            var idx = _ALPHA.indexOf(s.charAt(i));

            if (idx === -1) {
                throw "Cannot decode base64";
            }

            return idx;
        }

        function _decode(s) {
            var pads = 0,
                i,
                b10,
                imax = s.length,
                x = [];

            s = String(s);

            if (imax === 0) {
                return s;
            }

            if (imax % 4 !== 0) {
                throw "Cannot decode base64";
            }

            if (s.charAt(imax - 1) === _PADCHAR) {
                pads = 1;

                if (s.charAt(imax - 2) === _PADCHAR) {
                    pads = 2;
                }

                // either way, we want to ignore this last block
                imax -= 4;
            }

            for (i = 0; i < imax; i += 4) {
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12) | (_getbyte64(s, i + 2) << 6) | _getbyte64(s, i + 3);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
            }

            switch (pads) {
            case 1:
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12) | (_getbyte64(s, i + 2) << 6);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
                break;

            case 2:
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12);
                x.push(String.fromCharCode(b10 >> 16));
                break;
            }

            return x.join("");
        }

        function _getbyte(s, i) {
            var x = s.charCodeAt(i);

            if (x > 255) {
                throw "INVALID_CHARACTER_ERR: DOM Exception 5";
            }

            return x;
        }

        function _encode(s) {
            if (arguments.length !== 1) {
                throw "SyntaxError: exactly one argument required";
            }

            s = String(s);

            var i,
                b10,
                x = [],
                imax = s.length - s.length % 3;

            if (s.length === 0) {
                return s;
            }

            for (i = 0; i < imax; i += 3) {
                b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8) | _getbyte(s, i + 2);
                x.push(_ALPHA.charAt(b10 >> 18));
                x.push(_ALPHA.charAt((b10 >> 12) & 0x3F));
                x.push(_ALPHA.charAt((b10 >> 6) & 0x3f));
                x.push(_ALPHA.charAt(b10 & 0x3f));
            }

            switch (s.length - imax) {
            case 1:
                b10 = _getbyte(s, i) << 16;
                x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 0x3F) + _PADCHAR + _PADCHAR);
                break;

            case 2:
                b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8);
                x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 0x3F) + _ALPHA.charAt((b10 >> 6) & 0x3f) + _PADCHAR);
                break;
            }

            return x.join("");
        }

        window.encodeB64 = _encode;
        window.decodeB64 = _decode;

    })(window);

    var Xhr = function (settings) {
        /*settings = {
            get: String, // url to get
            post: String, // url to post
            params: {}, // additional parameters
            onSuccess: Function (res),
            onFail: Function (res),
        }*/
        var xhr = new window.XMLHttpRequest(),
            getPostBody = function () {
                // turns the params string into a url encoded form
                var param,
                    params = settings.params,
                    first = true,
                    url = '';
                for (param in params) {
                    if (!params.hasOwnProperty(param)) {
                        continue;
                    }

                    if (!first) {
                        url += '&';
                    }
                    url += param + '=' + params[param];
                    first = false;
                }
                return url;
            },
            addHeaders = function () {
                var key,
                    headers = settings.headers;
                for (key in headers) {
                    if (!headers.hasOwnProperty(key)) {
                        continue;
                    }
                    xhr.setRequestHeader(key, headers[key]);
                }
            };

        if (settings.get) {
            xhr.open('GET', settings.get, true);
        } else if (settings.post) {
            xhr.open('POST', settings.post, true);
            if (settings.json) {
                xhr.setRequestHeader('Content-Type', 'text/plain');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            } else {
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
        }

        if (settings.headers) {
            addHeaders();
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (!settings.onSuccess) {
                        return;
                    }
                    try {
                        settings.onSuccess(JSON.parse(xhr.responseText));
                    } catch (e) {
                        settings.onSuccess({
                            response: xhr.responseText
                        });
                    }
                } else {
                    if (!settings.onFail) {
                        return;
                    }
                    try {
                        settings.onFail(JSON.parse(xhr.responseText));
                    } catch (e) {
                        settings.onFail({
                            response: xhr.responseText
                        });
                    }
                }
            }
        };

        //console.log('success', xhr.responseText);
        if (settings.json) {
            xhr.send(JSON.stringify(settings.params));
        } else if (settings.post) {
            xhr.send(getPostBody());
        } else {
            xhr.send();
        }

        return xhr;
    };
    window.patcher = function (baseUrl, version, onReady) {
        var timeout = 5000, // should complete in 5 seconds
            hasTimedout = false,
            hasFinished = false,
            currentPatch,
            // step 1
            downloadSettings = function () {
                if (hasTimedout) {
                    // too late!
                    return;
                }
                new Xhr({
                    get: baseUrl + '/settings.json?t=' + Date.now(),
                    onSuccess: function (res) {
                        var patchVersion = res[version] || 0;
                        console.log('Detected ' + patchVersion);

                        if (patchVersion === -1) {
                            // wipe patch!
                            localStorage.setItem('patch_' + version, null);
                            onReady('Wiped clean.');
                        } else if (patchVersion > currentPatch.version) {
                            // download new patch
                            console.log('Download new ' + patchVersion);
                            downloadPatch(patchVersion);
                        } else {
                            // equal patch, apply current
                            console.log('Apply current ' + currentPatch.version);
                            applyPatch();
                        }
                    },
                    onFail: applyPatch
                });
            },
            // step 2
            downloadPatch = function (patchVersion) {
                if (hasTimedout) {
                    // too late!
                    return;
                }
                var fileName = version + '-' + patchVersion + '.json';
                new Xhr({
                    get: baseUrl + '/' + fileName + '?t=' + Date.now(),
                    onSuccess: function (res) {
                        // store patch
                        var compression = res.cmp;
                        currentPatch.version = patchVersion;
                        if (compression) {
                            try {
                                currentPatch.data = LZString.decompressFromBase64(res.data);
                            } catch (e) {
                                currentPatch.data = null;
                                applyPatch();
                                return;
                            }
                        } else {
                            currentPatch.data = res.data;
                        }

                        currentPatch.method = res.method || 'default';

                        localStorage.setItem('patch_' + version, JSON.stringify(currentPatch));
                        applyPatch();
                    },
                    onFail: applyPatch
                });
            },
            // step 3
            applyPatch = function () {
                var code;

                if (hasFinished) {
                    // already applied the patch (possibly due to time out)
                    return;
                }
                hasFinished = true;

                // there is no patch
                if (!currentPatch.data) {
                    onReady('Nothing to do.');
                    return;
                }

                // !!
                try {
                    // decompress code
                    if (currentPatch.method === 'atob') {
                        // using atob could be unreliable because of Cocoon
                        code = window.atob(currentPatch.data);
                    } else {
                        // default method is the javascript method
                        code = window.decodeB64(currentPatch.data);
                    }
                    eval(code);
                    window.PATCHVERSION = currentPatch.version;
                    onReady('Success');
                } catch (e) {
                    onReady('Failed with', e);
                }
            };

        window.setTimeout(function () {
            if (hasFinished) {
                return;
            }
            hasTimedout = true;
            console.log('WARNING: Download timed out.');
            applyPatch();
        }, timeout);

        // load currentpatch
        try {
            // try to parse the current patch
            currentPatch = JSON.parse(localStorage.getItem('patch_' + version)) || {
                version: 0
            };
        } catch (e) {
            // something went horribly wrong...
            currentPatch = {
                version: 0
            };
        }

        // start by trying to download settings
        downloadSettings();
    };

})();