(function($) {

Floxim.handle('.fx-handle-parent-hover', function(i, n) {
    var $n = $(n),
        $par = $n.parent();
    if ($par.data('fx-hover-handler-added')) {
        return;
    }
    $par.data('fx-hover-handler-added', true);
    var leaveTimeout;
    $par.on('mouseenter', function() {
        clearTimeout(leaveTimeout);
        $n.css('outline', '');
        $par.addClass('fx-is-hover');
    }).on('mouseleave', function() {
        console.log('mouse leaved');
        $n.css('outline', '1px solid #0F0');
        leaveTimeout = setTimeout(function() {
            $par.removeClass('fx-is-hover');
        }, 1000);
    });
})

$('html').on('mouseenter', '.fx_front_overlay', function () {
    console.log('mouse on frontovr!');
})

})(window.$fxj || window.jQuery);