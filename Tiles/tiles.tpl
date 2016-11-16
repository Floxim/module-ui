<div
    fx:b="tiles"
    fx:template="tiles"
    fx:name="Плитки"
    fx:size="high"
    fx:styled-inline
    fx:of="floxim.main.page:list, floxim.main.factoid:list, floxim.media.photo:list">    
    {css}flex-tiles.less{/css}
    <div fx:e="wrapper">
        {$items_prepend || :tile_block /}
        {$items || :tile_block /}
    </div>
</div>
    
<div fx:template="tile_block" fx:e="tile" fx:b="tile" fx:styled='label:Стиль отдельной плитки'>
    {apply tile /}
</div>
    
{template id="tile" test="is_string($item)" priority="2"}
    {$item /}
{/template}
    
<div
    fx:template="tile" 
    fx:e="body">
    
    <div fx:e="image" fx:hide-empty>
        {default $cols = 3 /}
        {default $full_width = 1400 /}
        {default $image_ratio = 1.4 /}
        {default $image_width = $full_width / $cols /}
        {default $image_height = $image_width / $image_ratio /}
        {default $pic_crop = true /}
        
        {if $pic_crop}
            {set $image_size = ceil($image_width) . '*' . ceil($image_height) /}
        {else}
            {set $image_size = 'max-width:' . ceil($image_width) . '; max-height: ' . ceil($image_height) /}
        {/if}
        
        {default $image_field = $item.hasField('image') ? 'image' : ( $item.hasField('photo') ? 'photo' : '%image' ) /}
        <img fx:e="img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size /}" />
    </div>
    <div fx:e="data">
        {apply floxim.ui.box:box with $box_id = 'tilebox' /}
    </div>
</div>