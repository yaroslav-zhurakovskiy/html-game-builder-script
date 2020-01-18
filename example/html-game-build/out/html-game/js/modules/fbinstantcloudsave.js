/**
 * FBInstant cloudsave module for Cloudsave
 * @moduleName FBInstantCloudSave
 */
bento.define('modules/fbinstantcloudsave', [
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
    return {
        writeSavedGame: function (snapshot, onSuccess, onError) {
            if (!window.FBInstant) {
                if (onError) {
                    onError('No FBInstant found');
                }
                return;
            }
            FBInstant.player.setDataAsync(snapshot).then(function () {
                console.log('Cloud data is saved');
                // console.log(storage.data)
            }).catch(function () {
                if (onError) {
                    onError('Error saving');
                }
            });
        },
        loadSavedGame: function (identifier, onSuccess, onError) {
            if (!window.FBInstant) {
                if (onError) {
                    onError('No FBInstant found');
                }
                return;
            }
            FBInstant.player.getDataAsync(['data']).then(function (data) {
                onSuccess(data);
            }).catch(function () {
                if (onError) {
                    onError('Error loading');
                }
            });
        }
    };
});