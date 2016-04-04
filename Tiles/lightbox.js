Floxim.handle('.tiles_type_photo', function() {
    var $container = $(this);
    function get_overlay() {
        var $overlay = $container.data('lightbox_overlay');
        if (!$overlay) {
            $overlay = $('<div class="lightbox-overlay"></div>');
            $overlay.css({
                'z-index':100,
                position:'fixed',
                top:0,
                left:0,
                height:'100%',
                width:'100%',
                background:'rgba(0,0,0,0.5)'
            });
            $('body').append($overlay);
            $container.data('lightbox_overlay', $overlay);
            $overlay.click(function() {
                hide_box();
            });
        }
        return $overlay;
    }
    
    function hide_by_esc(e) {
        if(e.which === 27) {
            hide_box();
        }
    }
    
    function hide_box() {
        var $overlay = get_overlay();
        $overlay.hide();
        var $c_box = $overlay.data('lightbox_content');
        if ($c_box) {
            $c_box.remove();
        }
        $('html').off('keydown', hide_by_esc);
        $('html').off('keydown.lightbox');
    }
    
    function show_overlay($content) {
        var $overlay = get_overlay();
        $('html').on('keydown', hide_by_esc);
        $overlay.show().data('lightbox_content', $content);
    }
    
    function place_image($img) {
        var ph = $('.fx-admin-panel').height() * 1,
            $win = $(window),
            wh = $win.height() - ph,
            ww = $win.width(),
            ih = $img.height(),
            iw = $img.width(),
            $content = $img.parent();
        
        $content.attr('style', '');
        
        var max_height = (wh)*0.9,
            max_width = ww * 0.9;
        
        $img.css('max-height', max_height);
        
        if ($img.width() > max_width) {
            $img.css({
                'max-height':'none',
                'max-width':max_width
            });
        }
        
        ih = $img.height();
        iw = $img.width();
        
        var top = ph + (wh - ih) / 2,
            left = (ww - iw) / 2;
        $content.css({
            top:top+'px',
            left:left+'px',
            'z-index':101,
            position:'fixed'
        });
    }
    
    function show_image($item) {
        var $content = $('<div class="lightbox-content"></div>');
        
        var $img = $('<img src="'+$item.data('lightbox_image')+'" />');
        $content.css({
            position:'fixed',
            overflow:'hidden',
            width:1,
            height:1
        });
        $content.append($img);
        $('body').append($content);
        get_overlay().show();
        $img.on('load', function() {
            if ($fx) {
                $fx.front.deselect_item();
            }
            hide_box();
            show_overlay($content);
            place_image($(this));
            var $images = get_images(),
                c_index = $images.index($item),
                next_index = c_index + 1,
                prev_index = c_index - 1;
            
            if (next_index === $images.length) {
                next_index = 0;
            }
            if (prev_index < 0) {
                prev_index = $images.length - 1;
            }
            $img.click(function() {
                show_image($images.eq(next_index));
                return false;
            });
            $('html').off('keydown.lightbox').on('keydown.lightbox', function(e) {
                if (e.which === 39) {
                    show_image($images.eq(next_index));
                } else if (e.which === 37) {
                    show_image($images.eq(prev_index));
                }
            });
        });
    }
    
    function get_images() {
        return $('*[data-lightbox_image]');
    }
    
    $(this).on('click', '*[data-lightbox_image]', function(e) {
        var $item = $(this);
        if ($item.closest('.fx_hilight_hover').length && !e.ctrlKey) {
            return;
        }
        show_image($item);
        e.stopImmediatePropagation();
        return false;
    });
    
    get_images().css({cursor:'pointer'});
});