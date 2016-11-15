{template id="popup_block" of="show"}
    {set $popup_id = 'popup-' . $infoblock.id /}
    {apply popup
        with $area_name = $popup_id,
             $popup_id = $popup_id,
             $popup_content = ''
    /}       
{/template}

<div fx:template="popup" fx:of="show" fx:b="popup id_{$popup_id} hidden size_{$size}">
    {first}
        {defualt $size = 'auto' /}
    {/first}
    {js}
        /module/Floxim/Ui/Js/Floxim.js
        popup.js
    {/js}
    {css}popup.less{/css}
    <span fx:e="close"></span>
    <div fx:e="overlay"></div>
    {if $popup_content}
        <div fx:e="content">{$popup_content /}</div>
    {elseif $area_name}
        <div fx:e="content" fx:area="$area_name"></div>
    {/if}
</div>