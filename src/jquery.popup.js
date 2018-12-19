
jQuery.popup = (function ($) {
    
    var DATA = {
        TITLE: 'data-ui-title',
        MAX_WIDTH: 'data-ui-maxwidth',
        
        ACTIVE: 'data-ui-active',
        CLICKABLE_BG: 'data-ui-clickablebg',

        SETTING: 'popup-setting'
    }

    var isInitialized = function(popup) {
        return popup.data(DATA.SETTING) && popup.attr('class') == 'popup' ? true : false;
    }

    var open = function (popup) {
        if(!isInitialized(popup))
            return;
        
        popup.attr(DATA.ACTIVE, 'true');
        
        var setting = popup.data(DATA.SETTING);
        if (typeof setting.onOpened === 'function')
            setting.onOpened(popup);
    }

    var close = function(popup) {
        if(!isInitialized(popup))
            return;

        popup.removeAttr(DATA.ACTIVE);

        var setting = popup.data(DATA.SETTING);
        if(typeof setting.onClosed === 'function')
            setting.onClosed(popup);
    }
    
    var renderPopupCloser = function () {
        return $('<a>', {
            href: '/',
            class: 'popup-close',
            click: function () {
                close($(this).closest('.popup'));
                return false;
            }
        });
    }

    var renderPopup = function (item, setting) {
        var isClickableBg = item.attr(DATA.CLICKABLE_BG) == 'true' || item.attr(DATA.CLICKABLE_BG) != 'false' && setting.clickableBg;

        return $('<div>', {
            id: item.attr('id'),
            class: 'popup',
            style: isClickableBg ? null : 'cursor:default;',
            click: (isClickableBg ? function () {
                if($(this).data(DATA.CLICKABLE_BG) == true)
                    close($(this));
                $(this).data(DATA.CLICKABLE_BG, true);
            } : null),

            append: $('<div>', {
                class: 'popup-window',
                style: 'max-width:' + (item.attr(DATA.MAX_WIDTH) || setting.maxWidth) + ';',
                click: (isClickableBg ? function () {
                    $(this).closest('.popup').data(DATA.CLICKABLE_BG, false);
                } : null),

                append: renderPopupCloser().add($('<div>', {
                    class: 'popup-header',

                    append: $('<span>', {
                        class: 'h-title',
                        text: item.attr(DATA.TITLE) || setting.title
                    }).add(renderPopupCloser())
                })).add($('<div>', {
                    class: 'popup-content clearfix',

                    append: item
                }))
            })
        }).data(DATA.SETTING, setting).data(DATA.CLICKABLE_BG, true);
    }

    var updatePopup = function(popup, setting) {
        var item = popup.find('.popup-item');
        var isClickableBg = item.attr(DATA.CLICKABLE_BG) == 'true' || item.attr(DATA.CLICKABLE_BG) != 'false' && setting.clickableBg;

        popup.data(DATA.SETTING, setting)
            .css('cursor', isClickableBg ? null : 'default')
            .unbind('click');
        
        var popupWindow = popup.children('.popup-window')
            .unbind('click');
        if (isClickableBg) {
            popup.bind('click', function () {
                if ($(this).data(DATA.CLICKABLE_BG) == true)
                    close($(this));
                $(this).data(DATA.CLICKABLE_BG, true);
            });
            popupWindow.bind('click', function () {
                $(this).closest('.popup').data(DATA.CLICKABLE_BG, false);
            });
        }
        popupWindow.css('max-width', item.attr(DATA.MAX_WIDTH) || setting.maxWidth);
        popup.find('.popup-header .h-title').text(item.attr(DATA.TITLE) || setting.title);
    }

    //command may be is option
    $.fn.popup = function (command) {
        var setting = { };
        $.extend(setting, defaults);

        var commands = {
            initialize: function (option) {
                if (option) $.extend(setting, option);
                return this.each(function () {
                    var item = $(this);

                    var isChild = item.closest('.popup').length ? true : false;
                    var isActive = item.attr(DATA.ACTIVE) == 'true' || item.attr(DATA.ACTIVE) != 'false' && setting.active;

                    if (!item.attr('id') && !isChild)
                        $.error('Object must contain an id attribute and .popup-item class to initialize in jQuery.popup');

                    if (!item.attr('id') && isChild) {
                        console.warn('Re-initialization interrupted! Because the (' + 
                            item[0].tagName.toLowerCase() + '.' + 
                            (item.attr('class') || '').replace(/ /g, '.') + ') object was initialized earlier.');
                        return;
                    }

                    var popup = item;
                    if(isInitialized(popup)) {
                        updatePopup(popup, setting);
                    } else {
                        popup = renderPopup(item, setting)
                        .appendTo('body');
                        item.removeAttr('id');
                    }

                    if (isActive)
                        open(popup);
                });
            },

            open: function () {
                return this.each(function () {
                    var popup = $(this).closest('.popup') || $(this);
                    if(popup.attr(DATA.ACTIVE) != 'true')
                        open(popup);
                });
            },

            close: function () {
                return this.each(function () {
                    var popup = $(this).closest('.popup') || $(this);
                    if(popup.attr(DATA.ACTIVE) == 'true')
                        close(popup);
                });
            }
        };

        if (commands[command]) {
            return commands[command].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof command === 'object' || !command) {
            // Default to "initialize"
            return commands.initialize.apply(this, arguments);
        } else {
            $.error('Method ' + command + ' does not exist on jQuery.popup');
        }
    }

    var defaults = {
        title: 'Default title',
        maxWidth: '80%',

        active: false,
        clickableBg: true,

        onOpened: function (sender) {
            //
        },
        onClosed: function (sender) {
            //
        }
    };

    return {
        setDefaults: function(property, value) {
            if(typeof defaults[property] === 'undefined') {
                console.error('Property "' + property + '" does not exist');
                return;
            }
            defaults[property] = value;
        },
        getDefaults: function(property) {
            if(typeof defaults[property] === 'undefined') {
                console.error('Property "' + property + '" does not exist');
                return undefined;
            }
            return defaults[property];
        }
    }

})(jQuery);