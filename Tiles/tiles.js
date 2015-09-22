Floxim.handle('.tiles', function() {
    var $container = $(this),
        cols = $container.attr('class').match(/tiles_cols_(\d+)/),
        $pics = $('img', $container);
        
    if (!cols) {
        console.log($container.attr('class'));
        return;
    }
    cols = cols[1]*1;
    
    function recountHeights() {
        var $row = $([]),
            $tiles = $('.tile:visible', $container);
        
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
        var c_height = 0;
        $row.each(function(index, item) {
            c_height = Math.max( $(item).height(), c_height);
        });
        $row.css('height', c_height);
    }
    
    recountHeights();
    
    $pics.on('load', function(e) {
        recountHeights();
    });
    $container.on('resize', function() {
        //recountHeights();
    });
});