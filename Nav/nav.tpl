<nav
    fx:template="nav" 
    fx:of="floxim.main.page:list"
    fx:b="nav">
        {css}nav.less{/css}
        {apply recursive_nav with $lv = 1 /}
        <div fx:e="sandwich"></div>
</nav>
        
<div
    fx:template="recursive_nav" 
    fx:e="level level_{$lv}"
    fx:b="level"
    fx:styled-inline="id:l{$lv};">
    {each $items as $item}
        {set
            $el = 'item' .
                (fx::env()->isCurrentPage($item) ? ' item_current' : '') .
                (fx::env()->isInPath($item) ? ' item_in-path' : '')
        /}
        {apply 
            floxim.ui.box:box 
            el $el
            with 
                $box_id = 'l' . $lv . 'box',
                $box_label = 'Поля ' . $lv  . ' уровня',
                $default_box_groups = array(
                    array(
                        array(
                            'keyword' => 'name',
                            'name' => 'Название'
                        )
                    )
                ),
                $box_extra_fields = array(
                    array(
                        'name' => 'Подразделы',
                        'template' => 'floxim.ui.nav:submenu',
                        'field' => 'submenu',
                        'keyword' => 'submenu'
                    )
                )
             /}
    {/each}
</div>

{template id="submenu"}
    {if count($item.submenu)}
        {apply recursive_nav with $items = $item.submenu, $lv = $lv+1 /}
    {/if}
{/template}