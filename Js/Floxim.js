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

Floxim.prototype.block = function(selector, callback) {
    var builder = function() {
        var $item = $(this);
        $item.data('floxim_block', new callback(this));
    };
    this.handle(selector, builder);
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
    
    return new Promise(
        function(resolve, reject) {
            $.ajax({
                url: params.url || '/~ajax/',
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

Floxim.prototype.reload = function($node, callback, data) {
    $node = $node.closest('.fx_infoblock');
    return this.ajax({
        infoblock_id:$node.data('fx_infoblock').id,
        data: data,
        dataType:'html'
    }).then(
        function(html) {
            var $new_ib = $(html);
            $node.before($new_ib);
            $node.remove();
            $new_ib.trigger('fx_infoblock_loaded');
            if (callback) {
                callback($new_ib);
            }
        }
    );
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

window.Floxim = new Floxim();

}) ( window.$fxj || window.jQuery );