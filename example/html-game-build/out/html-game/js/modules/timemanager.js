/**
 * Module description
 * @moduleName TimeManager
 */
bento.define('modules/timemanager', [
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
    'bento/tween'
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
    Tween
) {
    'use strict';

    var started = false;

    // --- UTILITY FUNCTIONS ---
    var isRequestingTime = false;
    var getServerTime = function (onComplete, onFail) {
        var dateObject;
        var date;
        var todayNow = Date.now();
        var today = Math.floor(todayNow / 1000 / 60 / 60 / 24);

        // functions
        var getAwsTime = function () {
            var xhr = new window.XMLHttpRequest();
            xhr.open("GET", "https://fcqd2ecsh5.execute-api.us-east-1.amazonaws.com/prod/getDate");
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            // get date from server
                            dateObject = JSON.parse(xhr.responseText);
                            date = dateObject.date;

                            // calculate new today
                            todayNow = date;
                            today = Math.floor(todayNow / 1000 / 60 / 60 / 24);

                            console.log("Received date from server: " + date);
                            onComplete(date);
                        } catch (e) {
                            if (onFail) {
                                Utils.log('ERROR: could not retrieve or parse date from server.' + xhr.responseText);
                                getHeaderTime();
                            }
                        }
                    } else {
                        if (onFail) {
                            Utils.log('ERROR: bad server response.');
                            getHeaderTime();
                        }
                    }
                }
            };
            xhr.send();
        };
        var getHeaderTime = function () {
            var dateString;
            var xhr = new window.XMLHttpRequest();
            xhr.open('HEAD', 'https://s3.amazonaws.com/lucky-kat/beatstreet/data/date.json', true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            // get date from server
                            dateString = this.getResponseHeader("Date");
                            if (dateString.indexOf('GMT') === -1) {
                                dateString += ' GMT';
                            }
                            date = Date.parse(dateString);

                            // calculate new today
                            todayNow = date;
                            today = Math.floor(todayNow / 1000 / 60 / 60 / 24);

                            console.log('Date from server: ' + dateString + ' -> ' + date);

                            // headers received
                            onComplete(date);
                        } catch (e) {
                            if (onFail) {
                                Utils.log('ERROR: could not retrieve or parse date from server.');
                                onFail();
                            }
                        }
                    } else {
                        // should be 200 on success
                        if (onFail) {
                            onFail();
                        }
                    }
                }
            };
            xhr.send();
        };

        // unset updated time
        module.hasUpdatedTime = false;
        // start requesting
        if (!isRequestingTime) {
            isRequestingTime = true;
            console.log("Getting server time...");
            getAwsTime();
        }
    };
    var serverComplete = function (time) {
        isRequestingTime = false;
        module.onlineSync = true;
        module.time = time;
        module.hasUpdatedTime = true;
        module.saveCurrentTime();

        // we save the time difference between server and local once
        var timeOffset = Bento.saveState.load('timeOffset', null);
        if (timeOffset === null) {
            timeOffset = module.time - Date.now();
            Bento.saveState.save('timeOffset', timeOffset);
        }

        // save the initial playing time (note: not accurate for softlaunch players)
        var initialStartingTime = Bento.saveState.load('initialStartingTime', 0);
        if (initialStartingTime === 0) {
            initialStartingTime = time;
            Bento.saveState.save('initialStartingTime', initialStartingTime);
        }

        EventSystem.fire('serverTimeUpdated');
        EventSystem.fire('updateTimers');
    };

    var serverFail = function () {
        module.onlineSync = false;
        isRequestingTime = false;

        // Date.now can be manipulated by changing the system clock, not reliable
        if (Bento.isDev()) {
            console.log('WARNING: using local time (dev only)');
            module.time = Date.now();
        } else {
            // try again in 10 seconds
            window.setTimeout(function () {
                module.updateServerTime();
            }, 10000);
        }
    };

    // --- VARIABLES AND DEFINITIONS ---
    var millisecond = 1;
    var second = millisecond * 1000;
    var minute = second * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var ticks = 0;
    var tickSeconds = 0;
    var timerBehaviour = {
        now: Date.now(),
        update: function (data) {
            var deltaT;
            var now;

            // increase ticks every frame
            ticks++;

            //every 60 ticks (1 second)
            if (ticks === 60) {
                // get delta time
                now = Date.now();
                deltaT = now - this.now;

                // limit deltaT to 10seconds to be sure
                if (deltaT > 5000) {
                    deltaT = 5000;
                    //perform a resume event after a DT of > 10 seconds
                    module.resumeEvent();
                }

                // update now
                this.now = now;
                module.time += deltaT;

                //reset ticks
                ticks = 0;

                //increment seconds
                tickSeconds++;

                //fire event on second
                EventSystem.fire('onEverySecond');

                // save time every 60 second
                if (tickSeconds % 60 === 0) {
                    module.saveCurrentTime();
                }
            }
        }
    };
    var globalTimer = new Entity({
        z: 0,
        name: 'globalTimer',
        global: true,
        updateWhenPaused: Infinity,
        components: [
            timerBehaviour
        ]
    });

    // --- MODULE ---
    var module = {
        constants: {
            day: day,
            hour: hour,
            minute: minute,
            second: second,
            millisecond: millisecond
        },
        onlineSync: false,
        time: Bento.saveState.load('lastKnownTime', 0),
        hasUpdatedTime: false,
        initialize: function () {
            if (!started) {
                module.time = Bento.saveState.load('lastKnownTime', 0);
                Bento.objects.attach(globalTimer);
                getServerTime(serverComplete, serverFail);


                if (Utils.isDev()) {
                    window.timeManager = module;
                }

                started = true;
            }
        },
        saveCurrentTime: function () {
            // save last known time
            Bento.saveState.save('lastKnownTime', module.time);
        },
        getCurrentTime: function () {
            // get time from module
            return module.time;
        },
        getCurrentLocalTime: function () {
            // retrieves server time corrected with offset
            var offset = Bento.saveState.load('timeOffset', 0);
            return module.time - offset;
        },
        timeToObject: function (time) {
            // converts a time to an object containing hours minutes seconds and milliseconds
            var hours = Math.floor(time / hour);

            time -= (hours * hour);
            var minutes = Math.floor(time / minute);

            time -= (minutes * minute);
            var seconds = Math.floor(time / second);

            time -= (seconds * second);
            var milliseconds = Math.floor(time);

            var object = {
                hours: hours,
                minutes: minutes,
                seconds: seconds,
                milliseconds: milliseconds
            };
            return object;
        },
        objectToTime: function (object) {
            // converts a time to an object containing days hours minutes seconds and milliseconds
            var time = 0;
            time += object.hours * hour;
            time += object.minutes * minute;
            time += object.seconds * second;
            time += object.milliseconds;
            return time;
        },
        updateServerTime: function (onComplete) {
            // update server time
            getServerTime(function (date) {
                if (onComplete) {
                    onComplete(true);
                }
                serverComplete(date);
            }, function () {
                if (onComplete) {
                    onComplete(false);
                }
                serverFail();
            });
        },
        resumeEvent: function () {
            // update now because there can be a big gap between the counterBehavior.now and the real time
            timerBehaviour.now = Date.now();
            // update server time
            getServerTime(serverComplete, serverFail);
        }
    };

    return module;
});