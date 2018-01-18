(function($) {

var Floxim = function() {
    
};

Floxim.prototype.on = function($node, event_name, selector, callback) {
    $node.on(event_name, selector, function(e) {
        if (window.Floxim.isView() || e.ctrlKey || e.fxForced) {
            return callback.apply(this, arguments);
        }
        var $el = $(this);
        $el.addClass('fx_click_handler');
        $el.data('fx_click_handler', function() {
            e.fxForced = true;
            $el.trigger(e);
        });
    });
};

Floxim.prototype.ready = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

Floxim.prototype.handle = function(selector, callback) {
    $('html').on('fx_infoblock_loaded', function(e) {
        var $nodes = $([]),
            $ib = $(e.target);
            
        if ($ib.is(selector)) {
            $nodes = $nodes.add( $ib );
        }
        $nodes = $nodes.add ( $(selector, $ib));
        $nodes.each( callback );
    });
    $(function() {
        $(selector).each ( function(index, node) {
            if (node.hasAttribute('data-fx_block_is_pending')) {
                return;
            }
            callback.apply (node, [index, node]);
        });
    });
    return Floxim;
};

function bemBlock($node, name, proto) {
    this.name = name;
    this.$node = $node;
    
    this.init = function() {
        console.log('default init');
    };
    
    $.extend( this, proto );
    
    var that = this;
    
    this.prepareSelector = function(selector) {
        return selector.replace(/#/g, '.'+that.name);
    };
    
    this.find = function(selector) {
        return $node.find( this.prepareSelector( selector ) );
    };
    
    this.on = function(event, selector, callback) {
        this.$node.on(event, that.prepareSelector(selector), callback);
    };
};

Floxim.prototype.block = function(name, proto) {
    if (typeof proto === "function") {
        proto = {
            init: proto
        };
    }
    var builder = function() {
        var $node = $(this),
            block = new bemBlock($node, name, proto);
    
        $node.data('floxim_block', block);
        block.init();
    };
    this.handle('.'+name, builder);
};

Floxim.prototype.ajax = function(params) {
    var data = {
        _ajax_base_url: params.base_url || document.location.href
    };
    
    if (params.infoblock_id) {
        data._ajax_infoblock_id = params.infoblock_id;
    }
    
    if (params.controller) {
        data._ajax_controller = params.controller;
        if (params.action) {
            data._ajax_controller += ':' + params.action;
        }
    }
    
    if (params.params) {
        data._ajax_controller_params = params.params;
    }
    
    var that = this;
    
    if (params.redraw) {
        var redraw = {},
            $redraw_nodes = params.redraw;
    
        if (typeof $redraw_nodes === 'string') {
            $redraw_nodes = $($redraw_nodes);
        }
        
        $.each($redraw_nodes, function () {
            var $ib = $(this).closest('.fx_infoblock'),
                meta = $ib.data('fx_infoblock');
            if (!meta) {
                return;
            }
            redraw[meta.id] = {container: that.getContainerProps($ib)};
        });
        data._ajax_redraw = redraw;
    }
    
    if (params.template) {
        data._ajax_template = params.template;
    }
    
    if (params.$block) {
        data._ajax_container_props = this.getContainerProps(params.$block);
    }
    
    if (params.data) {
        $.extend(data, params.data);
    }
    
    var that = this;

    var url = params.url || '/~ajax/';
    if (params.query) {
        url += (url.indexOf('?') !== -1 ? '&' : '?') + params.query.replace(/^\?/, '')
    }
    
    return new Promise(
        function(resolve, reject) {
            $.ajax({
                url: url,
                type:'post',
                data:data,
                dataType: params.dataType || 'html',
                success: function(res, status, xhr) {
                    try {
                        var response = that.parseResponse(res);
                        if (params.$target) {
                            var $res = $( $.trim(response) );
                            params.$target.append($res);
                            $res.trigger('fx_infoblock_loaded');
                            resolve($res);
                            return;
                        }
                        resolve(response);
                    } catch (e) {
                        reject(e);
                    }
                },
                error: function(res) {
                    reject(res);
                }
            });
        }
    );
};

Floxim.prototype.updateInfoblock = function($old_infoblock, new_html) {
    var $new_infoblock = $( $.trim(new_html) );
    $old_infoblock.before($new_infoblock);
    $old_infoblock.remove();
    $new_infoblock.trigger('fx_infoblock_loaded');
};

Floxim.prototype.parseResponse = function(data) {
    var json = null,
        that = this;
    try {
        json = (typeof data === 'string') ? $.parseJSON(data) : $.extend(true, {}, data);
    } catch (e) {
        return data;
    }
    
    if (!json || !json.format || json.format !== 'fx-response') {
        return data;
    }
    
    
    var js_assets = json.js;
    if (js_assets) {
        if (!window.fx_assets_js) {
            window.fx_assets_js = [];
        }
        for (var i = 0; i < js_assets.length; i++) {
            var asset = js_assets[i];
            var is_loaded = $.inArray(asset, window.fx_assets_js);
            if (is_loaded !== -1) {
                continue;
            }
            (function(asset) {
                $.ajax({
                    url:asset,
                    async:false,
                    dataType: 'script',
                    success: function() {
                        window.fx_assets_js.push(asset);
                    }
                });
            })(asset);
        }
    }

    var css_assets = json.css || [];

    for (var i = 0; i < css_assets.length; i++) {
        var asset = css_assets[i];
        if (typeof asset === 'string') {
            if ($('link[href="'+asset+'"]').length === 0) {
                $('head').append('<link type="text/css" rel="stylesheet" href="'+asset+'" />');
            }
        } else {
            if (asset.styles instanceof Array ) {
                for (var j = 0; j < asset.styles.length; j++) {
                    var c_asset = asset.styles[j];
                    if ($('link[href="'+c_asset+'"]').length === 0) {
                        $('head').append('<link type="text/css" rel="stylesheet" href="'+c_asset+'" />');
                    }
                }
            }
            if (window.$fx) {
                window.$fx.handleCssAsset(asset)
            }
        }
    }
    
    if (json.redraw) {
        setTimeout(
            function() {
                $.each(json.redraw, function(ib_id, html) {
                    var $old = $('.fx_infoblock_'+ib_id);
                    that.updateInfoblock($old, html);
                });
            }, 
            100
        );
    }
    
    var response = json.response;
    if ( typeof response !== 'string') {
        response = JSON.stringify(response);
    }
    return response;
};

Floxim.prototype.reload = function($node, params) {
    $node = $node.closest('.fx_infoblock');
    params = $.extend(
        true,
        {},
        {
            infoblock_id:$node.data('fx_infoblock').id,
            dataType:'html'
        },
        params
    );
    var that = this;
    return new Promise(function(resolve, reject) {
        that.ajax(params).then(
            function (html) {
                var $new_ib = $(html);
                $node.before($new_ib);
                $node.trigger('fx_infoblock_unloaded', {
                    $newIb: $new_ib
                });
                $node.remove();
                $new_ib.trigger('fx_infoblock_loaded');
                resolve($new_ib)
            }
        );
    });
};

Floxim.prototype.load = function (params) {
    var callback = function(res) {
        var $target;
        if (typeof params.target === 'function' ) {
            $target = params.target(res);
        } else if (params.target) {
            $target = $(params.target);
        } else {
            $target = $('body');
        }
        var $res = $(res);
        $target.append($res);
        window.Floxim.loaded($res);
        if (params.success) {
            params.success($res);
        }
    };
    var xhr = this.ajax(
        $.extend(
            {}, 
            params, 
            {success:callback}
        )
    );
    return xhr;
};

Floxim.prototype.getMode = function() {
    var $fx = window.$fx;
    if (!$fx || !$fx.front) {
        return 'view';
    }
    return $fx.front.mode;
};

Floxim.prototype.isView = function() {
    return this.getMode() === 'view';
};

Floxim.prototype.handleAjaxAssets = function(xhr) {
    var js_assets_json = xhr.getResponseHeader('fx_assets_js'),
        js_assets = js_assets_json ? $.parseJSON(js_assets_json) : [],
        css_assets_json = xhr.getResponseHeader('fx_assets_css'),
        css_assets = css_assets_json ? $.parseJSON(css_assets_json) : [],
        $head = $('head');
        
    if (!window.fx_assets_js) {
        window.fx_assets_js = [];
        $('head script[src]').each(function() {
            window.fx_assets_js.push( this.getAttribute('src') );
        });
    }
    
    for (var i = 0; i < js_assets.length; i++) {
        var asset = js_assets[i];
        var is_loaded = $.inArray(asset, window.fx_assets_js);
        if (is_loaded !== -1) {
            continue;
        }
        (function(asset) {
            $.ajax({
                url:asset,
                async:false,
                dataType: 'script',
                success: function() {
                    window.fx_assets_js.push(asset);
                }
            });
        })(asset);
    }

    for (var i = 0; i < css_assets.length; i++) {
        var asset = css_assets[i];
        $head.append('<link type="text/css" rel="stylesheet" href="'+asset+'" />');
    }
};

Floxim.prototype.getModifiers = function($node, name) {
    var rex = new RegExp('^'+name+'_(.+?)(_(.+))?$'),
        classes = $node.attr('class').split(' '),
        res = {};
    for (var i = 0; i < classes.length; i++) {
        var match = classes[i].match(rex);
        if (match) {
            res[match[1]] = match[3] === undefined ? true : match[3];
        }
    }
    return res;
};

function cn($n) {
    return $n[0].className.split(" ").join("\n");
}

window.cn = cn;

Floxim.prototype.setModifiers = function($node, block, mods) {
    var prev = this.getModifiers($node, block);
    $.each(mods, function(mod, value) {
        var className = block+'_'+mod + (typeof value === 'boolean' ? '' : '_'+value);
        if (value === false) {
            $node.removeClass(className);
        } else {
            if (prev[mod]) {
                $node.removeClass(block+'_'+mod+'_'+prev[mod]);
            }
            $node.addClass(className)
        }
    });
}

Floxim.prototype.getContainerProps = function($n) {
    var res = {},
        $pars = $n.parents('.fx-block'),
        that = this;
    
    $.each($pars, function() {
        var mods = that.getModifiers($(this), 'fx-block');
        $.each(mods, function( k, v) {
            var p = k.match(/own-(.+)/);
            if (!p) {
                return;
            }
            p = p[1];
            if (typeof res[p] === 'undefined') {
                res[p] = v;
            }
        });
    } );
    return res;
};

Floxim.prototype.setContainerProps = function($n, props, inherited) {
    var block = 'fx-block',
        that = this;
    if (!$n.is('.'+block)) {
        $n.children().each(function() {
            that.setContainerProps($(this), props, true);
        })
        return;
    }
    var mods = this.getModifiers($n, block),
        diff = {},
        pc = cn($n);
    
    $.each(props, function(prop, val) {
        var own = mods['own-'+prop]
        if (
            (inherited && own) ||
            (!inherited && own === val)
        ) {
            return;
        }
        diff[prop] = val;
    });
    if (JSON.stringify(diff) === '{}') {
        return;
    }
    var mods = {};
    var assign_to_self = ['lightness'];
    $.each(diff, function(prop, value) {
        var prefix = assign_to_self.indexOf(prop) !== -1 
                ? ''
                : (inherited ? 'parent-' : 'own-');
        if (typeof value !== 'undefined') {
            mods[prefix + prop] = value;
        } else {
            mods[prefix + prop] = false;
            mods['has-' + prop] = false;
        }
    });
    this.setModifiers($n, block, mods);
    var nc = cn($n);
    $n.children().each(function() {
        that.setContainerProps($(this), diff, true);
    })
};

Floxim.prototype.loaded = function($node) {
    $node.trigger('fx_infoblock_loaded');
};


Equalizer = function($nodes, prop, value) {
    if (typeof $nodes === 'string') {
        $nodes = $($nodes);
    }
    if (typeof value === 'undefined') {
        value = 'max';
    }
    
    var hash = (prop+'_'+value).replace(/[^a-z0-9_-]+/, '_');
    var that = this;
    
    this.count = function() {
        if (value !== 'min' && value !== 'max') {
            return value;
        }
        var cv = null;
        $nodes.filter(':visible').each(function() {
            var nv = parseInt($(this).css(prop));
            if (cv === null || Math[value](nv, cv) === nv)  {
                cv = nv;
            }
        });
        return cv;
    };
    
    this.update = function() {
        this.reset();
        var new_value = this.count();
        $nodes.css(prop, new_value);
    };
    
    this.reset  = function() {
        $nodes.css(prop, '');
    };
    
    this.detach = function() {
        $nodes.off('input.'+hash);
    };
    
    
    $nodes.off('input.'+hash).on('input.'+hash, function() {
        that.update();
    });
};

Floxim.prototype.equalize = function($nodes, prop, value) {
    var Eq = new Equalizer($nodes, prop, value);
    Eq.update();
    return Eq;
    
};

$('html').on('click', '[data-action="reload"]', function() {
    var $ib = $(this).closest('.fx_infoblock');
    window.Floxim.reload($ib);
});


Floxim.prototype.onPopState = function(callback) {
    if (!this.popStateListeners) {
        this.popStateListeners = []
    }
    this.popStateListeners.push(callback);
};

Floxim.prototype.offPopState = function(callback) {
    if (!this.popStateListeners) {
        return;
    }
    var index = this.popStateListeners.indexOf(callback)
    if (index !== -1) {
        this.popStateListeners.splice(index, 1)
    }
}

Floxim.prototype.onPushState = function(callback) {
    if (!this.pushStateListeners) {
        this.pushStateListeners = []
    }
    this.pushStateListeners.push(callback);
};

Floxim.prototype.offPushState = function(callback) {
    if (!this.pushStateListeners) {
        return;
    }
    var index = this.pushStateListeners.indexOf(callback)
    if (index !== -1) {
        this.pushStateListeners.splice(index, 1)
    }
}

Floxim.prototype.pushState = function(url, state) {
    if (!this.stateStack) {
        this.stateStack = [];
    }
    this.stateStack.push([url, state]);
    if (window.history && window.history.pushState) {
        window.history.pushState(state, '', url);
        setTitle(state.title);
    }
    if (this.pushStateListeners) {
        for (var i = 0 ; i < this.pushStateListeners.length; i++) {
            this.pushStateListeners[i](url, state)
        }
    }
};

function setTitle(title) {
    if (typeof document.initialTitle === 'undefined') {
        document.initialTitle = document.title;
    }
    if (!title) {
        title = document.initialTitle
    }
    document.title = title;
}

Floxim.prototype.replaceState = function(url, state) {
    if (window.history && window.history.replaceState) {
        window.history.replaceState(state, '', url);
    }
}

Floxim.prototype.handlePopState = function(e) {
    var prevState = this.stateStack ? this.stateStack.pop() : undefined;
    if (e.state) {
        setTitle(e.state.title);
    }
    for (var i = 0; i < this.popStateListeners.length; i++) {
        var listener = this.popStateListeners[i];
        var res = listener(e, prevState);
        if (res === false) {
            break;
        }
    }
};

Floxim.prototype.getPathFromUrl  = function (url) {
    return url.replace(/^https?:\/\/[^\/]+/, '')
}

Floxim.prototype.getUrlFromPath = function(path) {
    if (/^https?:\/\//.test(path)) {
        return path;
    }
    return document.location.protocol + '//' + document.location.host + path;
}

window.Floxim = new Floxim();

$(window).on('popstate', function(e) {
    window.Floxim.handlePopState(e.originalEvent);
});

function getMediaMode() {
    return window.innerWidth > 800 ? 'desktop' : 'mobile';
}

function csplit(c) {
    return c.replace(/\s+/g, ' ').replace(/^\s|\s$/g, '').split(' ');
}

function cdiff(c1, c2) {
    c1 = csplit(c1);
    c2 = csplit(c2);
    var res = [];
    c1.forEach(function(v) {
        if (c2.indexOf(v) === -1) {
            res.push(' - ' + v);
        }
    });
    c2.forEach(function(v) {
        if (c1.indexOf(v) === -1) {
            res.push(' + ' + v);
        }
    });
    return res.join("\n");
}

function onMediaUpdate(newMode) {
    var $nodes = $('[data-container-mobile]');
    $nodes.each(function() {
        var $n = $(this),
            mob_data = $n.data('container-mobile'),
            desk_data = $n.data('container-desktop');
        if (!desk_data) {
            desk_data = {};
            var mods = window.Floxim.getModifiers($n, 'fx-block');
            $.each(mob_data, function(prop) {
                desk_data[prop] = mods['own-'+prop] || mods['parent-'+prop];
            });
            $n.data('container-desktop', desk_data);
        }
        var dataToSet = newMode === 'mobile' ? mob_data : desk_data
        window.Floxim.setContainerProps($n, dataToSet);
    });
}

$(function() {
    window.mediaMode = getMediaMode();
    $(window).on('resize', function() {
        var newMode = getMediaMode();
        if (window.mediaMode !== newMode) {
            onMediaUpdate(newMode);
            window.mediaMode = newMode;
        }
    });
    onMediaUpdate(window.mediaMode);
    var hover_lightnes_sel = '.fx-block_hover-lightness_light, .fx-block_hover-lightness_dark';
    $(document.body).on('mouseenter', hover_lightnes_sel, function(e) {
        var $n = $(this);
        var mods = window.Floxim.getModifiers($n, 'fx-block');
        var prevLightness = mods['lightness'];
        var newLightness = mods['hover-lightness'];
        window.Floxim.setContainerProps($n, {lightness: newLightness});
        $n.one('mouseleave', function() {
            window.Floxim.setContainerProps($n, {lightness: prevLightness});
        });
    })
});

}) ( window.$fxj || window.jQuery );