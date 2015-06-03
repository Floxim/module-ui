(function($) {
    
var Floxim = function() {
    
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
        $(selector).each ( callback );
    });
    return Floxim;
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
    
    if (params.template) {
        data._ajax_template = params.template;
    }
    
    if (params.data) {
        $.extend(data, params.data);
    }
    
    var xhr = $.ajax({
        url:'/~ajax/',
        type:'post',
        data:data,
        dataType: params.dataType || 'html',
        success: function(res, status, xhr) {
            window.Floxim.handleAjaxAssets(xhr);
            if (params.success) {
                return params.success(res, status, xhr);
            }
        }
    });
    
    return xhr;
};

Floxim.prototype.reload = function($node, callback, data) {
    $node = $node.closest('.fx_infoblock');
    return this.ajax({
        infoblock_id:$node.data('fx_infoblock').id,
        data: data,
        dataType:'html',
        success: function(html) {
            var $new_ib = $(html);
            $node.before($new_ib);
            $node.remove();
            $new_ib.trigger('fx_infoblock_loaded');
            if (callback) {
                callback($new_ib);
            }
        }
    });
};

Floxim.prototype.load = function (params) {
    var callback = function(res) {
        var $target = params.target ? $(params.target) : $('body'),
            $res = $(res);
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

Floxim.prototype.loaded = function($node) {
    $node.trigger('fx_infoblock_loaded');
};

window.Floxim = new Floxim();

}) ( window.$fxj || window.jQuery );