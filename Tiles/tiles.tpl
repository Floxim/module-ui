<div
    fx:b="tiles"
    fx:template="tiles"
    fx:name="Плитки"
    fx:size="high"
    fx:styled-inline
    fx:of="floxim.main.content:list">    
    {css}flex-tiles.less{/css}
    <div fx:e="wrapper">
        {$items_prepend || :tile_block /}
        {$items || :tile_block /}
    </div>
</div>
    
<div fx:template="tile_block" fx:e="tile" fx:b="tile">
    {apply tile /}
</div>
    
{template id="tile" test="is_string($item)" priority="2"}
    {$item /}
{/template}

{template id="tile"}
    {apply floxim.ui.box:box with $box_id = 'tilebox' /}
{/template}
    
{*
<div
    fx:template="tile" 
    fx:e="body">
    
    {default $cols = 3 /}
    {default $full_width = 1400 /}
    {default $image_ratio = 1.4 /}
    {default $pic_crop = true /}
    
    {default $image_width = $full_width / $cols /}
    
    {if $image_ratio !== 'none'}
        {default $image_height = $image_width / $image_ratio /}
    {/if}
    
    {default $image_field = $item.hasField('image') ? 'image' : ( $item.hasField('photo') ? 'photo' : '%image' ) /}
    
    {if $pic_crop && $image_width && $image_height}
        {set $image_size = ceil($image_width) . '*' . ceil($image_height) /}
    {else}
        {set $image_size = 'max-width:' . ceil($image_width) . '; max-height: ' . ceil($image_height) /}
    {/if}
    
    <div fx:e="image" fx:hide-empty>
        <a href="{$item.url}" fx:omit="!$item.url">
            <img fx:e="img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size /}" />
        </a>
    </div>
    
    <div fx:e="data">
        {apply floxim.ui.box:box with $box_id = 'tilebox' /}
    </div>
</div>

*}