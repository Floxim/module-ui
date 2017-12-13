$(function() {

var cl = 'floxim--ui--pagination--pagination';

function loadInfoblockPage($ib, url) {
    var qs = url.match(/\?(.+)/),
        params = {
            query: qs ? qs[1] : '',
            base_url: document.location.href.replace(/(\?|&)page=\d+/, '')
        },
        pageNum = params.query.match(/page=(\d+)/);
    return Floxim.reload($ib, params).then(function($newIb) {
        var $panel = $('.fx-admin-panel'),
            panelHeight = $panel.length ? $panel.height() : 0;
        $('html').animate({
            'scrollTop': ($newIb.offset().top - 30 - panelHeight)
        })
        document.title = document.title.replace(/ \-\- Страница \d+$/, '')
        if (pageNum) {
            document.title += ' -- Страница '+pageNum[1]
        }
    });
}

Floxim.block(cl, function() {
    var $n = this.$node,
        $ib = $n.closest('.fx_infoblock'),
        state = {
            action: 'pagination',
            infoblock: $ib.data('fx_infoblock')
        },
        hasLinks = $ib.find('a[href]').not('.'+cl+'__item_disabled').length;
    if (!hasLinks) {
        return;
    }
    if (!history.state || history.state.action !== 'pagination') {
        Floxim.replaceState(document.location.href, state);
        console.log('repl stat')
    }
    $n.on('click', 'a[href]', function(e) {
        var href = this.getAttribute('href'),
            ibData = $ib.data('fx_infoblock');
        loadInfoblockPage($ib, href).then(function() {
            Floxim.pushState(
                href,
                state
            );
        });
        return false;
    });
})

Floxim.onPopState(function(e, prev) {
    var state = e.state;
    if (state.action === 'pagination') {
        var $ib = $('.fx_infoblock_'+state.infoblock.id),
            url = document.location.href;
        loadInfoblockPage($ib, url);
    }
});

});