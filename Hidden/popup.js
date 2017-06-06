$(function() {
    
    var cl = 'floxim--ui--hidden--popup';
    
    $('.'+cl).each(function() {
        $('body').append(this);
    });
    
    $('html').on(
        'click', 
        '.'+cl+'__overlay', 
        function() {
            var $popup = $(this).closest('.'+cl);
            $popup.addClass(cl+'_hidden'); 
            $popup.trigger('popup_hide');
            return false;
        }
    );
    
    function get_popup(infoblock_id, base_url) {
        return new Promise(function(resolve) {
            var $popups = $('.'+cl+'_id_popup-'+infoblock_id);
            
            var c_url = document.location.href.replace(/#.+$/, ''),
                local_found = false;
            
            $popups.each(function() {
                var $popup = $(this);
                if (
                    !base_url || $popup.data('popup_base_url') === base_url || base_url === c_url
                ) {
                    // check if form in popup was sent
                    return; 
                    resolve($popup);
                    local_found = true;
                    return false;
                }
            });
            
            if (local_found) {
                return;
            }
            
            Floxim.ajax(
                {
                    base_url: base_url,
                    infoblock_id: infoblock_id,
                    $target: $('body')
                }
            ).then(function($res) {
                var $popup = $res.is('.'+cl) ? $res : $res.find('.'+cl);
                
                $popup.data('popup_base_url', base_url);
                if (window.$fx && $fx.front.mode === 'edit') {
                    $fx.front.hilight($fxj($popup[0]));
                }
                resolve($popup);
                return;
            });
        });
    }
    
    function open_popup(infoblock_id, base_url) {
        if (window.$fx) {
            $fx.front.deselect_item();
        }
        get_popup(
            infoblock_id, 
            base_url
        ).then(
            function($popup) {
                $popup.removeClass(cl+'_hidden');
                $popup.find(':input:visible, [tabindex]').not('[tabindex="-1"]').first().focus();
                $popup.trigger('popup_show');
            }
        );
    }
    
    $('html').on('click', 'a[href]', function(e) {
        var popup_url = this.href.match(/(.+)\#popup-(.+)$/);
        
        if (!popup_url) {
            return;
        }
        
        if (
            window.$fx && 
            $fx.front.mode === 'edit' && 
            !e.metaKey && 
            !e.ctrlKey && 
            ! $(this).find('.fx_icon-type-follow').length
        ) {
            return;
        }
        
        var base_url = popup_url[1],
            infoblock_id = popup_url[2];
        
        open_popup(infoblock_id, base_url);
        e.stopImmediatePropagation();
        return false;
    });
});