<div fx:template="popup" fx:of="show" fx:b="popup id_{$area_name} hidden">
    {first}
        {set $area_name = 'popup-' . $infoblock.id /}
    {/first}
    {js}popup.js{/js}
    {css}popup.less{/css}
    <span fx:e="close"></span>
    
    <div fx:e="overlay"></div>
    <div fx:e="content" fx:area="$area_name">
        
    </div>
</div>