<nav
    fx:template="nav" 
    fx:of="floxim.main.page:list"
    fx:b="nav">
        {apply recursive_nav with $lv = 1 /}
        <div fx:e="sandwich"></div>
</nav>
        
<div
    fx:template="recursive_nav" 
    fx:e="level level_{$lv}"
    fx:b="level"
    fx:styled-inline="id:l{$lv};">
    {each $items as $item}
        {apply 
            floxim.ui.box:box 
            el item
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