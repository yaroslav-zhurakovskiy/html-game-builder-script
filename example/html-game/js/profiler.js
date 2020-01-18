/*
 * Time profiler
 * @moduleName Profiler
 */
bento.define('profiler', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/eventsystem',
    'bento/utils',
    'bento/tween',
    'modules/serverlog'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    EventSystem,
    Utils,
    Tween,
    ServerLog
) {
    'use strict';
    var ticTime = 0;
    var startTime = 0;
    var totalTime = 0;
    var times = {};
    var totals = {};
    var min = {};
    var max = {};
    var measures = {};
    var measurements = 0;
    var hasStarted = false;
    var start = function () {
        hasStarted = true;
        startTime = window.performance.now();
    };
    var stop = function () {
        totalTime += window.performance.now() - startTime;
        measurements += 1;

        if (this.reportAfter && measurements > this.reportAfter) {
            measurements = 0;
            this.report();
        }
        hasStarted = false;
    };
    var report = function () {
        var key;
        var toLog = [];
        var giantLog = 'name, ms, %\n';
        console.log('== Report for time spent ==');
        console.log('Total time:', totalTime.toFixed(2) + 'ms');
        for (key in totals) {
            if (!totals.hasOwnProperty(key)) {
                continue;
            }

            // console.log(
            //     key,
            //     '\n  ' + totals[key].toFixed(2) + 'ms',
            //     '\n  ' + (totals[key] / totalTime * 100).toFixed(0) + '%',
            //     '\n  ' + measures[key] + ' tics'
            // );
            toLog.push({
                txt: key + ', ' + totals[key].toFixed(2) + '' + ', ' + (min[key] / (1000 / 60) * 100).toFixed(2) + '-' + (totals[key] / totalTime * 100).toFixed(2) + '-' + (max[key] / (1000 / 60) * 100).toFixed(2) + '',
                ms: totals[key]
            });
        }
        // sort by ms
        toLog.sort(function (a, b) {
            return b.ms - a.ms;
        });
        Utils.forEach(toLog, function (item, i, l, breakLoop) {
            // console.log(item.txt);
            giantLog += item.txt + '\n';
        });
        console.log(giantLog);
        ServerLog.send('Profiler ' + new Date().toString() + '.csv', giantLog);

    };
    var tic = function (name) {
        if (!hasStarted) {
            return;
        }
        if (name) {
            times[name] = window.performance.now();
            totals[name] = totals[name] || 0;
            min[name] = min[name] || 100000;
            max[name] = max[name] || 0;
            measures[name] = measures[name] || 0;
        } else {
            ticTime = window.performance.now();
        }
    };
    var toc = function (name, log) {
        if (!hasStarted) {
            return;
        }
        if (log) {
            if (name) {
                console.log(name, window.performance.now() - times[name]);
            } else {
                console.log(window.performance.now() - ticTime);
            }
        }
        var thisTime = window.performance.now() - times[name];
        totals[name] += thisTime;
        if (min[name] > thisTime) {
            min[name] = thisTime;
        }
        if (max[name] < thisTime) {
            max[name] = thisTime;
        }
        measures[name] += 1;
    };
    var measureFor = function (count) {
        var updateOn = function (data) {
            tic('update-' + data.name);
        };
        var updateOff = function (data) {
            toc('update-' + data.name);
        };
        var drawOn = function (data) {
            tic('draw-' + data.name);
        };
        var drawOff = function (data) {
            toc('draw-' + data.name);
        };
        var onLoop = function () {
            loops += 1;
            if (loops > count) {
                BentoProfiler.stop();
                BentoProfiler.report();

                EventSystem.off('updateOn', updateOn);
                EventSystem.off('updateOff', updateOff);
                EventSystem.off('drawOn', drawOn);
                EventSystem.off('drawOff', drawOff);
                EventSystem.off('postDraw', onLoop);

                console.log('** Profiler ended ** ');
            }
        };
        var loops = 0;

        // place these events inside object manager
        EventSystem.on('updateOn', updateOn);
        EventSystem.on('updateOff', updateOff);
        EventSystem.on('drawOn', drawOn);
        EventSystem.on('drawOff', drawOff);
        EventSystem.on('postDraw', onLoop);
        BentoProfiler.start();
        console.log('** Profiler started ** ');
    };

    var BentoProfiler = {
        reportAfter: 10, // number of measurements to report after
        start: start,
        stop: stop,
        report: report,
        tic: tic,
        toc: toc,
        measureFor: measureFor
    };
    window.BentoProfiler = BentoProfiler;

    return BentoProfiler;
});