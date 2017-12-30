(function($) {
    $(function () {

        var cl = 'floxim--ui--hidden--popup',
            bodyClass = cl + '--body_popup-active';

        $('.' + cl).each(function () {
            $('body').append(this);
        });

        $('html').on(
            'click',
            '.' + cl + '__overlay, .' + cl + '__close',
            function () {
                var $popup = $(this).closest('.' + cl);
                close_popup($popup);
                return false;
            }
        );

        function getListPage($ib) {
            var $cPaginationLink = $('.floxim--ui--pagination--pagination__item_active', $ib);
            var list_page = 1;
            if ($cPaginationLink.length) {
                var cPaginationPage = $cPaginationLink.attr('href').match(/page=(\d+)/);
                if (cPaginationPage) {
                    list_page = cPaginationPage[1]
                }
            }
            return list_page;
        }

        function getListCurrentUrl($ib) {
            var $cPaginationLink = $('.floxim--ui--pagination--pagination__item_active', $ib);
            return Floxim.getUrlFromPath($cPaginationLink.attr('href'));
        }

        function close_popup($popup, options) {
            if ($popup.length === 0) {
                return;
            }
            $popup.addClass(cl + '_hidden');
            $popup.trigger('popup_hide');
            options = options || {};
            $(document.body).removeClass(bodyClass).css('width', '');
            if (options.pushState !== false) {
                var prevState = $popup.data('historyPrevState');
                if (prevState) {
                    Floxim.pushState(prevState[0], prevState[1]);
                }
            }
        }

        function bind_nav($popup, infoblock_id, base_link, options) {
            if (!base_link) {
                return;
            }
            var historyPrevState = [document.location.href, window.history.state];

            var $listInfoblock = $(base_link).closest('.fx_infoblock'),
                listInfoblockData = $listInfoblock.data('fx_infoblock'),
                $popupHeader = $popup.find('.floxim--ui--header--header');

            if (options.pushState !== false) {
                Floxim.pushState(
                    base_link.getAttribute('href'),
                    {
                        action: 'popup',
                        infoblock_id: infoblock_id,
                        list_infoblock_id: listInfoblockData.id,
                        list_page: getListPage($listInfoblock),
                        title: $popupHeader.text()
                    }
                );
            }
            var $nav = $('.' + cl + '__nav', $popup);
            if (!$nav.length) {
                return;
            }
            // close prev popups
            $('.' + cl).each(function () {
                if (this === $popup[0]) {
                    return;
                }
                var $prevPopup = $(this);
                if ($prevPopup.data('popup_infoblock_id') === infoblock_id) {
                    historyPrevState = $prevPopup.data('historyPrevState');
                    $prevPopup.remove();
                }
            });
            historyPrevState[0] = getListCurrentUrl($listInfoblock);
            $popup.data('historyPrevState', historyPrevState);
            var $back = $('.' + cl + '__nav-link_dir_back', $nav);
            var $next = $('.' + cl + '__nav-link_dir_next', $nav);
            var $container = $(base_link).closest('.fx_infoblock');
            var getPopupLinks = function ($c) {
                return $('a[href]', $c).filter(function () {
                    var ib = this.href.match(/\#popup-(\d+)/);
                    if ($(this).closest('.fx_entity_adder_placeholder').length > 0) {
                        return false;
                    }
                    return ib && ib[1] === infoblock_id;
                });
            }
            var getPaginationLink = function (dir) {
                var pcl = 'floxim--ui--pagination--pagination__item';
                var $res = $('.' + pcl + '_type_' + dir, $container).not('.' + pcl + '_disabled');
                return $res.length ? $res[0] : null;
            }
            var $links = getPopupLinks($container);
            var c_index = $links.index(base_link);

            var data = [
                [$back, null, getPaginationLink('prev')],
                [$next, null, getPaginationLink('next'), 1]
            ];
            var c_url = base_link.getAttribute('href');

            var getNavLink = function (link) {
                var href = link.getAttribute('href');
                if (href !== c_url) {
                    return [link, href.replace(/#.+$/, '')]
                }
            }

            for (var i = c_index - 1; i >= 0; i--) {
                var found = getNavLink($links[i]);
                if (found) {
                    data[0][1] = found;
                    break;
                }
            }
            for (var i = c_index + 1; i < $links.length; i++) {
                var found = getNavLink($links[i]);
                if (found) {
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
                        (function (found) {
                            return function () {
                                open_popup(infoblock_id, found[1], found[0]);
                            }
                        })(found)
                    );
                } else if (pglink) {
                    $link.on(
                        'click',
                        (function (pglink, nextPageIndex) {
                            return function () {
                                $container.one('fx_infoblock_unloaded', function (e, params) {
                                    setTimeout(function () {
                                        var $links = getPopupLinks(params.$newIb),
                                            $link = nextPageIndex === 1 ? $links.first() : $links.last();
                                        $link.click();
                                    }, 100);
                                })
                                $(pglink).trigger('click', {pushState: false});
                            }
                        })(pglink, nextPageIndex)
                    )
                } else {
                    $link.hide();
                }
            }
        }

        function get_popup(infoblock_id, base_url, base_link, options) {
            return new Promise(function (resolve) {
                Floxim.ajax(
                    {
                        base_url: base_url,
                        infoblock_id: infoblock_id,
                        $target: $('body')
                    }
                ).then(function ($res) {
                    var $popup = $res.is('.' + cl) ? $res : $res.find('.' + cl);

                    $popup.data('popup_base_url', base_url);
                    $popup.data('popup_infoblock_id', infoblock_id);
                    if (window.$fx && $fx.front.mode === 'edit') {
                        $fx.front.hilight($fxj($popup[0]));
                    }
                    bind_nav($popup, infoblock_id, base_link, options);
                    resolve($popup);
                    return;
                });
            });
        }

        function show_popup($popup) {
            $popup.removeClass(cl + '_hidden');
            $popup.find(':input:visible, [tabindex]').not('[tabindex="-1"]').first().focus();
            $popup.trigger('popup_show');
            $(document.body).css('width', document.body.clientWidth).addClass(bodyClass);

            var showAfterIbUpdate = function (e, $newIb) {
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

        function open_popup(infoblock_id, base_url, base_link, options) {
            if (window.$fx) {
                $fx.front.deselect_item();
            }
            get_popup(
                infoblock_id,
                base_url,
                base_link,
                options || {}
            ).then(
                show_popup
            );
        }

        $('html').on('click', 'a[href]', function (e) {
            var popup_url = this.href.match(/(.+)\#popup-(.+)$/);

            if (!popup_url) {
                return;
            }

            if (
                window.$fx &&
                $fx.front.mode === 'edit' &&
                !e.metaKey &&
                !e.ctrlKey &&
                !$(this).find('.fx_icon-type-follow').length
            ) {
                return;
            }

            var base_url = popup_url[1],
                infoblock_id = popup_url[2];

            open_popup(infoblock_id, base_url, this);
            e.stopImmediatePropagation();
            return false;
        });

        Floxim.onPopState(function (e, prev) {
            var state = e.state;
            if (!state || state.action !== 'popup') {
                close_popup($('.' + cl), {pushState: false});
                return;
            }
            var fullUrl = document.location.href,
                url = Floxim.getPathFromUrl(fullUrl),
                $listInfoblock = $('.fx_infoblock_' + state.list_infoblock_id),
                cListPage = getListPage($listInfoblock);

            function rewindToPage(page) {
                return new Promise(function (resolve) {
                    if (page === cListPage) {
                        resolve($listInfoblock);
                        return;
                    }
                    var dir = page > cListPage ? 'next' : 'prev',
                        $link = $('.floxim--ui--pagination--pagination__item_type_' + dir, $listInfoblock);
                    $listInfoblock.one('fx_infoblock_unloaded', function (e, params) {
                        setTimeout(function () {
                            resolve(params.$newIb);
                        }, 50);
                    })
                    $link.trigger('click', {pushState: false});
                });
            }

            rewindToPage(state.list_page).then(function ($listInfoblock) {
                var $listLinks = $('a[href]', $listInfoblock),
                    listLink = null;
                $listLinks.each(function () {
                    var c_url = Floxim.getPathFromUrl(this.getAttribute('href'));
                    if (c_url === url) {
                        listLink = this;
                        return false;
                    }
                });
                open_popup(state.infoblock_id, fullUrl, listLink, {pushState: false})
            })
        });

    });
})(window.jQuery);