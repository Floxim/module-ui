<nav
    fx:template="menu" 
    fx:styled="Стиль меню"
    fx:abstract
    fx:of="floxim.main.page:list"
    fx:b="menu layout_{$menu_layout} style_{$menu_style} dropdown">
        {js}menu.js{/js}
        {css}menu.less{/css}
        
        {apply recursive_menu with $lv = 1 /}
        <div fx:e="sandwich"></div>
        <ul fx:template="recursive_menu" fx:e="level level_{$lv}">
            <li 
                fx:each="$items"
                fx:e="item 
                      level_{$lv}
                      {if $is_active}active{/if}
                      {if count($submenu)}has-children{/if}">
                
                <a href="{$url}" fx:e="link {if $is_active}active{/if}">
                    <span fx:e="link-name">{$name}</span>
                </a>

                {if count($submenu)}
                    {call recursive_menu with $items = $submenu, $lv = $lv+1 /}
                {/if}
            </li>
        </ul>
</nav>
            
{preset menu#vertical name="Вертикальное меню" size="narrow,high"}
    menu_layout: vertical
{/preset}

{preset menu#horizontal name="Горизонтальное меню" size="low,wide"}
    menu_layout: horizontal
{/preset}