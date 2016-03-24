Floxim.block('.menu', function(menu) {
    var $menu = $(menu),
        $body = $('body'),
        body_style = $body.attr('style');
    
    $('.menu__sandwich', $menu).click(function() {
        $menu.toggleClass('menu_expanded');
        if ($menu.hasClass('menu_expanded')) {
            body_style = $body.attr('style') || '';
            $body.css({
                overflow:'hidden'
            });
        } else {
            $body.attr('style', body_style);
            console.log('set stl', body_style);
        }
    });
    if ($menu.is('.menu_dropdown')) {
        
        function expand($item) {
            if (!$item.length) {
                return;
            }
            expand($item.parent().closest('.menu__item'));
            $item.addClass('menu__item_expanded');
        }
        function collapse($item) {
            if (!$item.length) {
                return;
            }
            $item = $item.closest('.menu__item_expanded');
            if ($item.is('.fx_has_selection')) {
                return;
            }
            $item.removeClass('menu__item_expanded');
            //collapse($item.parent().closest('.menu__item'));
        };
        function collapse_delayed($item) {
            $item.data(
                'collapse_timeout',
                setTimeout(
                    function() {
                        collapse($item);
                    },
                    300
                )
            );
        }
        function handle_mouseleave(e, $item) {
            var $to = $(e.toElement);
            if ( $to.closest('.fx_inline_adder_overlay').length > 0) {
                $to.one('mouseleave', function(e) {
                    handle_mouseleave(e, $item);
                });
                return;
            }
            collapse_delayed($item);
        }
        $menu
            .on('mouseenter', '.menu__item', function(e) {
                var $item = $(this);
                clearTimeout($item.data('collapse_timeout'));
                expand($item);
            })
            .on('fx_select', '.menu__item', function(e) {
                expand($(this));
            })
            .on('mouseleave', '.menu__item', function(e) {
                handle_mouseleave(e, $(this));
            })
            .on('fx_deselect', '.menu__item', function(e) {
                collapse_delayed($(this));
            });
    }
});