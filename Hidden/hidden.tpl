{template id="popup_block" of="show" name="Попап"}
    {set $popup_id = 'popup-' . $infoblock.id /}
    {apply popup
        with $area_name = $popup_id,
             $popup_id = $popup_id,
             $popup_content = ''
    /}       
{/template}

<div fx:template="popup" fx:b="popup id_{$popup_id} hidden" fx:styled="label:Стиль попапа">
    {css}popup.less{/css}
    {first}
        {defualt $size = 'auto' /}
    {/first}
    {js}
        Floxim.js from floxim.ui.js
        popup.js
    {/js}
    <div fx:e="overlay"></div>
    <div fx:e="content">
        <span fx:e="close"></span>
        {if $popup_content}
            <div fx:e="content-area">{$popup_content /}</div>
        {elseif $area_name}
            <div fx:e="content-area" fx:area="$area_name"></div>
        {/if}
    </div>
    {@show_nav label="Навигация?" type="checkbox" /}
    <div fx:if="$show_nav" fx:e="nav">
        <a fx:e="nav-link dir_back"></a>
        <a fx:e="nav-link dir_next"></a>
    </div>
</div>