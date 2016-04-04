Floxim.handle('.tiles', function() {
    var $container = $(this),
        cols = $container.attr('class').match(/tiles_cols_(\d+)/),
        $pics = $('img', $container),
        size_ratio = $container.data('size_ratio')*1;
        
    if (!cols) {
        return;
    }
    cols = cols[1]*1;
    
    function recountHeights() {
        var $row = $([]),
            $tiles = $('.tile', $container);
        
        $tiles.css('height', 'auto');
        $tiles.each(function () {
            if ($row.length === cols) {
                recountRow($row);
                $row = $([]);
            }
            $row = $row.add($(this));
        });
        recountRow($row);
    }
    
    function recountRow($row) {
        /*
        var event = $.Event('fx_tiles_recount_row');
        event.$items = $row;
        $container.trigger(event);
        */
        var c_height = 0;
        $row.each(function() {
            var rect = this.getBoundingClientRect();
            if (size_ratio) {
                c_height = Math.floor(rect.width / size_ratio) - 1;
            } else {
                c_height = Math.max( rect.height, c_height);
            }
        });
        $row.css('height', c_height); 
    }
    
    recountHeights();
    
    
    $pics.on('load', function(e) {
        //console.log('trig rh');
        recountHeights();
    });
    
    $(window).on('resize', function(e) {
        if (e.target === window) {
            recountHeights();
        }
    });
    
    $container.on('fx_after_show_adder_placeholder', function() {
        recountHeights();
    });
    $('html').on('fx_set_front_mode', function() {
        recountHeights();
    });
});