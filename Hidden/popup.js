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

    function bind_nav($popup, infoblock_id, base_url, base_link) {
        if (!base_link) {
            return;
        }
        var $nav = $('.' + cl + '__nav', $popup);
        if (!$nav.length) {
            return;
        }
        // close prev popups
        $('.' + cl).each(function() {
            if (this === $popup[0]) {
                return;
            }
            var $prevPopup = $(this);
            if ($prevPopup.data('popup_infoblock_id') === infoblock_id) {
                $prevPopup.remove();
            }
        });
        var $back = $('.' + cl + '__nav-link_dir_back', $nav);
        var $next = $('.' + cl + '__nav-link_dir_next', $nav);
        var $container = $(base_link).closest('.fx_infoblock');
        var getPopupLinks = function($c) {
            return $('a[href]', $c).filter(function() {
                var ib = this.href.match(/\#popup-(\d+)/);
                if ($(this).closest('.fx_entity_adder_placeholder').length > 0) {
                    return false;
                }
                return ib  && ib[1] === infoblock_id;
            });
        }
        var getPaginationLink = function(dir) {
            var pcl = 'floxim--ui--pagination--pagination__item';
            var $res = $('.'+ pcl +'_type_'+dir, $container).not('.'+pcl+'_disabled');
            return $res.length ? $res[0] : null;
        }
        var $links = getPopupLinks($container);
        var c_index = $links.index(base_link);

        var data = [
            [$back, null, getPaginationLink('prev')],
            [$next, null, getPaginationLink('next'), 1]
        ];
        var c_url = base_link.getAttribute('href');

        var getNavLink = function(link) {
            var href = link.getAttribute('href');
            if (href !== c_url) {
                return [link, href.replace(/#.+$/, '')]
            }
        }

        for (var i = c_index - 1; i >= 0; i--) {
            var found = getNavLink($links[i]);
            if ( found ) {
                data[0][1] = found;
                break;
            }
        }
        for (var i = c_index + 1; i < $links.length; i++) {
            var found = getNavLink($links[i]);
            if ( found ) {
                data[1][1] = found;
                break;
            }
        }
        for (var i = 0; i < data.length; i++) {
            var $link = data[i][0],
                found = data[i][1],
                pglink = data[i][2],
                nextPageIndex = data[i][3];
            $link.off('click');
            if (found) {
                $link.on(
                    'click',
                    (function(found) {
                        return function () {
                            open_popup(infoblock_id, found[1], found[0]);
                        }
                    })(found)
                );
            } else if (pglink) {
                $link.on(
                    'click',
                    (function (pglink, nextPageIndex) {
                        return function() {
                            $container.one('fx_infoblock_unloaded', function (e, params) {
                                setTimeout(function() {
                                    var $links = getPopupLinks(params.$newIb),
                                        $link = nextPageIndex === 1 ? $links.first() : $links.last();
                                    $link.click();
                                }, 100);
                            })
                            $(pglink).click();
                        }
                    })(pglink, nextPageIndex)
                )
            } else {
                $link.hide();
            }
        }
    }
    
    function get_popup(infoblock_id, base_url, base_link) {
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
                $popup.data('popup_infoblock_id', infoblock_id);
                if (window.$fx && $fx.front.mode === 'edit') {
                    $fx.front.hilight($fxj($popup[0]));
                }
                bind_nav($popup, infoblock_id, base_url, base_link);
                resolve($popup);
                return;
            });
        });
    }

    function show_popup($popup) {
        $popup.removeClass(cl+'_hidden');
        $popup.find(':input:visible, [tabindex]').not('[tabindex="-1"]').first().focus();
        $popup.trigger('popup_show');
        var showAfterIbUpdate = function(e, $newIb) {
            if ($newIb) {
                show_popup($newIb);
            }
        };
        if (window.$fxj) {
            window.$fxj($popup[0])
                .off('fx_infoblock_unloaded', showAfterIbUpdate)
                .on('fx_infoblock_unloaded', showAfterIbUpdate);
        }
    }
    
    function open_popup(infoblock_id, base_url, base_link) {
        if (window.$fx) {
            $fx.front.deselect_item();
        }
        get_popup(
            infoblock_id, 
            base_url,
            base_link
        ).then(
            show_popup
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
        
        open_popup(infoblock_id, base_url, this);
        e.stopImmediatePropagation();
        return false;
    });
});