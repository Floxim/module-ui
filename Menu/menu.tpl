<nav
    fx:template="menu" 
    fx:styled="Стиль меню"
    fx:abstract
    fx:of="floxim.main.page:list"
    fx:b="menu layout_{$menu_layout} dropdown">
        {js}menu.js{/js}
        {css}menu.less{/css}
        
        {apply recursive_menu with $lv = 1 /}
        <div fx:e="sandwich"></div>
</nav>
        
<ul fx:template="recursive_menu" fx:e="level level_{$lv}">
    <li 
        fx:each="$items"
        fx:e="item 
              level_{$lv}
              {if $is_active}active{/if}
              {if count($submenu)}has-children{/if}">

        <a {if $url} href="{$url}" {/if} fx:e="link {if $is_active}active{/if}">
            <span fx:e="link-name">
                <span fx:if="$icon" class="{= fx::icon($icon) }"></span>
                {$name}
            </span>
        </a>

        {if count($submenu)}
            {call recursive_menu with $items = $submenu, $lv = $lv+1 /}
        {/if}
    </li>
</ul>
            
{preset menu#vertical name="Вертикальное меню" size="narrow,high"}
    menu_layout: vertical
{/preset}

{preset menu#horizontal name="Горизонтальное меню"}
    menu_layout: horizontal
{/preset}