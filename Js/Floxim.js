(function($) {
var Floxim = function() {
    
};

Floxim.prototype.handle = function(selector, callback) {
    $('html').on('fx_infoblock_loaded', function() {
        var $nodes = $([]);
        if ($(this).is(selector)) {
            $nodes = $nodes.add( this );
        }
        $nodes = $nodes.add ( $(selector, this));
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
    
    if (params.data) {
        $.extend(data, params.data);
    }
    
    var xhr = $.ajax({
        url:'/~ajax/',
        type:'post',
        data:data,
        dataType: params.dataType || 'html',
        success: params.success
    });
    
    return xhr;
};

window.Floxim = new Floxim();

}) ( $fxj || jQuery );