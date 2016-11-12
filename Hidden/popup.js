$(function() {
    
    var cl = 'floxim--ui--hidden--popup';
    
    $('.'+cl).each(function() {
        $('body').append(this);
    });
    
    $('html').on(
        'click', 
        '.'+cl+'__overlay', 
        function() {
            $(this).closest('.'+cl).addClass(cl+'_hidden'); 
            return false;
        }
    );
    
    function get_popup(infoblock_id, base_url) {
        return new Promise(function(resolve) {
            var $popup = $('.'+cl+'_id_popup-'+infoblock_id);
            if ($popup.length) {
                resolve($popup);
                return;
            }
            $.ajax({
                url:'/~ajax/',
                data: {
                    _ajax_infoblock_id:infoblock_id,
                    _ajax_base_url: base_url || document.location.href
                },
                type:'post',
                success: function(res) {
                    var $res = $(res);
                    $('body').append($res);
                    resolve($res);
                }
            });
        });
    }
    
    function open_popup(infoblock_id, base_url) {
        get_popup(
            infoblock_id, 
            base_url
        ).then(
            function($popup) {
                $popup.removeClass(cl+'_hidden');
                $popup.find(':input:visible, [tabindex]').not('[tabindex="-1"]').first().focus();
            }
        );
    }
    
    $('html').on('click', 'a[href]', function(e) {
        var popup_url = this.href.match(/(.+)\#popup-(.+)$/);
        if (!popup_url) {
            return;
        }
        
        var base_url = popup_url[1],
            infoblock_id = popup_url[2];
        
        open_popup(infoblock_id, base_url)
        e.stopImmediatePropagation();
        return false;
    });
});