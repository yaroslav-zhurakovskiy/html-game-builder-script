/**
 * Module description
 * @moduleName SortedClickable
 * @snippet SortedClickable.snippet
SortedClickable({
    onPressed: function (data) {},
    onClick: function (data) {},
    onRelease: function (data) {}
})
 */
bento.define('components/sortedclickable', [
    'bento',
    'bento/math/vector2',
    'bento/math/rectangle',
    'bento/components/sprite',
    'bento/components/clickable',
    'bento/entity',
    'bento/eventsystem',
    'bento/gui/counter',
    'bento/gui/text',
    'bento/utils',
    'bento/tween',
    'bento/gui/clickbutton'
], function (
    Bento,
    Vector2,
    Rectangle,
    Sprite,
    Clickable,
    Entity,
    EventSystem,
    Counter,
    Text,
    Utils,
    Tween,
    ClickButton
) {
    'use strict';
    return function (settings) {
        var wasHoldingThis = false;
        var clickable = new Clickable({
            onClick: function (data) {
                wasHoldingThis = false;
                if (ClickButton.currentlyPressing || !this.parent.visible) {
                    return;
                }
                ClickButton.currentlyPressing = this.parent;
                if (settings.onPressed) {
                    settings.onPressed.apply(this.parent, [data]);
                }
            },
            onClickUp: function (data) {
                if (wasHoldingThis) {
                    if (ClickButton.currentlyPressing === this.parent) {
                        ClickButton.currentlyPressing = null;
                    }
                    if (settings.onClick) {
                        settings.onClick.apply(this.parent, [data]);
                    }
                }
            },
            pointerUp: function (data) {
                if (ClickButton.currentlyPressing === this.parent) {
                    wasHoldingThis = true;
                    ClickButton.currentlyPressing = null;
                    if (settings.onRelease) {
                        settings.onRelease.apply(this.parent, [data]);
                    }
                }
            },
            sort: true
        });
        return clickable;
    };
});