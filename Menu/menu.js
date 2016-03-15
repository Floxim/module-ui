Floxim.block('.menu', function(menu) {
    var $menu = $(menu);
    $('.menu__sandwich', $menu).click(function() {
        $menu.toggleClass('menu_expanded');
    });
});