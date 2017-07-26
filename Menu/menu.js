Floxim.block('floxim--ui--menu--menu', function() {
    var $menu = this.$node,
        $body = $('body'),
        body_style = $body.attr('style'),
        bl = 'floxim--ui--menu--menu';
    
    $('.'+bl+'__sandwich', $menu).click(function() {
        $menu.toggleClass(bl+'_expanded');
        if ($menu.hasClass(bl+'_expanded')) {
            body_style = $body.attr('style') || '';
            $body.css({
                overflow:'hidden'
            });
        } else {
            $body.attr('style', body_style);
        }
    });
    if (!$menu.is('.'+bl+'_dropdown')) {
        return;
    }
    function expand($item) {
        if (!$item.length || !$item.is('.'+bl+'__item_has-children')) {
            return;
        }
        var $current_expanded = $item.parent().find('> .'+bl+'__item_expanded');
        if ($current_expanded.length) {
            collapse($current_expanded);
        }
        expand($item.parent().closest('.'+bl+'__item'));
        $item.addClass(bl+'__item_expanded');
    }
    function collapse($item) {
        if (!$item.length) {
            return;
        }
        $item = $item.closest('.'+bl+'__item_expanded');
        if ($item.is('.fx_has_selection')) {
            return;
        }
        $item.removeClass(bl+'__item_expanded');
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
        .on('mouseenter', '.'+bl+'__item', function(e) {
            var $item = $(this);
            $item.parents('.'+bl+'__item').each(function() {
                clearTimeout($(this).data('collapse_timeout'));
            });
            expand($item);
            return false;
        })
        .on('fx_select', '.'+bl+'__item', function(e) {
            expand($(this));
        })
        .on('mouseleave', '.'+bl+'__item_expanded', function(e) {
            handle_mouseleave(e, $(this));
            return false;
        })
        .on('fx_deselect', '.'+bl+'__item', function(e) {
            collapse_delayed($(this));
        });
});