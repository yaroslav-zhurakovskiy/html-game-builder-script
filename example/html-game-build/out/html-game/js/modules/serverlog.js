/**
 * Send a log to a server
 * @moduleName ServerLog
 * @snippet ServerLog.snippet
ServerLog({
    
})
 */
bento.define('modules/serverlog', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween'
], function (
    Bento,
    Vector2,
    Rectangle,
    Entity,
    EventSystem,
    Utils,
    Tween
) {
    'use strict';
    var ServerLog = {
        ip: 'http://10.19.132.105:3000',
        // ip: 'http://127.0.0.1:3000',
        id: 0, // automatically incrementing id
        /**
         * Send and save a log
         * @snippet ServerLog.send()|snippet
            ServerLog.send('${1:file.txt}', '${2:text}');
         */
        send: function (fileName, text) {
            var xhr = new window.XMLHttpRequest();
            var body = {
                name: fileName,
                log: text
            };
            try {
                xhr.open("POST", ServerLog.ip + '/save');
            } catch (e) {
                console.log('Sending to logger failed: ' + e);
            }
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.timeout = 2000; // time in milliseconds
            xhr.onreadystatechange = function () {
                var jsonResponse;
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // console.log(xhr.responseText);
                    } else {
                        console.log('Sending to logger failed: ' + xhr.responseText);
                    }
                }
            };
            xhr.ontimeout = function (e) {
                console.log('Sending to logger failed: ' + e);
            };
            xhr.send(JSON.stringify(body));

            ServerLog.id += 1;
        },
        /**
         * Log to server without saving
         * @snippet ServerLog.log()|snippet
            ServerLog.log('${1:text}');
         */
        log: function (text) {
            var xhr = new window.XMLHttpRequest();
            var body = {
                log: text
            };
            try {
                xhr.open("POST", ServerLog.ip + '/log');
            } catch (e) {
                console.log('Sending to logger failed: ' + e);
            }
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.timeout = 2000; // time in milliseconds
            xhr.onreadystatechange = function () {
                var jsonResponse;
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // console.log(xhr.responseText);
                    } else {
                        console.log('Sending to logger failed: ' + xhr.responseText);
                    }
                }
            };
            xhr.ontimeout = function (e) {
                console.log('Sending to logger failed: ' + e);
            };
            xhr.send(JSON.stringify(body));
        }
    };

    return ServerLog;
});