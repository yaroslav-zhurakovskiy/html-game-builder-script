/**
 * Cloud save module using AWS Lambda to be used with cloudsave.js
 * Modeled after Google Play Saved Games
 * @moduleName AwsCloudSave
 */
bento.define('modules/awscloudsave', [
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
    var didSendWarning = false;
    var initialized = false;
    var apiUrl = 'https://';
    var apiKey = '';
    var userId = '';
    var additionalData = {};
    /**
     * Send savefile to aws
     */
    var sendToAws = function (snapshot, onSuccess, onError) {
        var saveData = JSON.stringify(snapshot);
        var id = snapshot.identifier;
        var body = {
            id: id,
            saveFile: saveData
        };
        Utils.extend(body, additionalData);

        var xhr = new window.XMLHttpRequest();
        xhr.open("POST", apiUrl + '/cloudsave');
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        if (apiKey) {
            xhr.setRequestHeader("X-Api-Key", apiKey);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    onSuccess();
                } else {
                    if (onError) {
                        Utils.log('ERROR: bad server response. ' + xhr.responseText);
                        if (!didSendWarning) {
                            didSendWarning = true;
                            // send warning about failed cloud save
                            EventSystem.fire('Notification', {
                                textId: 'cloudSaveError'
                            });
                            EventSystem.fire('Notification', {
                                text: 'Server response error ' + xhr.status
                            });
                        }
                        onError('Bad server response');
                    }
                }
            }
        };
        xhr.send(JSON.stringify(body));
    };
    /**
     * Download savefile
     */
    var downloadFromAws = function (id, onSuccess, onError) {
        var body = {
            id: id
        };
        var xhr = new window.XMLHttpRequest();
        xhr.open("POST", apiUrl + '/cloudload');
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        if (apiKey) {
            xhr.setRequestHeader("X-Api-Key", apiKey);
        }
        xhr.onreadystatechange = function () {
            var res;
            var snapshot;
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        res = JSON.parse(xhr.responseText);
                        snapshot = JSON.parse(res.Item.saveFile);
                        onSuccess(snapshot);
                    } catch (e) {
                        if (onError) {
                            Utils.log('ERROR: could not parse data');
                            onError(xhr.responseText);
                        }
                    }
                } else {
                    if (onError) {
                        Utils.log('ERROR: bad server response. ' + xhr.responseText);
                        onError('Bad server response');
                    }
                }
            }
        };
        xhr.send(JSON.stringify(body));
    };
    return {
        /**
         * @snippet AwsCloudSave.init|snippet
AwsCloudSave.init({
    apiUrl: 'https://XXXX.execute-api.us-east-1.amazonaws.com/latest', // AWS url returned by claudia
    userId: '', // unique id per user, suggested cross-platform convention: gc_<GAMECENTER ID>, gp_<GOOGLEPLAY ID>
    additionalData: {}, // additional data sent to the server
    apiKey: '', // optional, when using API key in AWS Gateway API
});
         */
        init: function (settings) {
            userId = settings.userId;
            apiUrl = settings.apiUrl;
            additionalData = settings.additionalData;
            apiKey = settings.apiKey;
            if (!userId) {
                return;
            }
            initialized = true;
        },
        // handled by CloudSave module
        writeSavedGame: function (snapshot, onSuccess, onError) {
            if (!initialized) {
                onError('AwsCloudSave module not initialized');
                return;
            }
            // overwite id with service id
            snapshot.identifier = userId;
            sendToAws(snapshot, onSuccess, onError);
        },
        // handled by CloudSave module
        loadSavedGame: function (identifier, onSuccess, onError) {
            if (!initialized) {
                onError('AWSCloudSave module not initialized');
                return;
            }
            downloadFromAws(userId, onSuccess, onError);
        }
    };
});