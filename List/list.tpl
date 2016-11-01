<div 
    fx:template="list" 
    fx:name="Список с картинками" 
    fx:of="floxim.main.page:list#2, floxim.main.factoid:list, floxim.media.photo:list" 
    {set $list_type = str_replace(".", "-", $infoblock.controller) /}
    fx:b="list {$list_mods}" 
    fx:styled="Стиль списка"
    fx:size="wide,high">
    {default $pic_part = 0.3 /}
    {default $full_width = 1400 /}
    {default $pic_ratio = 'none' /}
    
    {set $pic_width = $pic_part * $full_width /}
    
    {if $pic_ratio == 'none'}
        {set $image_size = 'max-width:' . $pic_width /}
    {else}
        {set $pic_height = $pic_width / $pic_ratio /}
        {set $image_size = $pic_width . '*' . $pic_height /}
    {/if}
    {css}
        list.less
    {/css}
    
    <div fx:each="$items" fx:e="item">
        <div fx:e="image" fx:hide-empty>
            {set $image_field = $item.hasField('image') ? 'image' : '%image'  /}
            <div fx:e="image-wrapper" fx:hide-empty>
                <img fx:e="image-img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size}" />
            </div>
        </div>
        <div fx:e="data">
            {apply floxim.ui.box:box with $box_id = 'listbox' /}
        </div>
    </div>
        
    {apply floxim.main.content:pagination with $pagination /}
</div>