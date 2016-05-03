<div
    {default $image_ratio = 1.4 /}
    {default $force_size_ratio = false /}
    {default $short_type = $infoblock.short_type /}
    {default $layout = 'default' /}
    {if $force_size_ratio}data-size_ratio="{$image_ratio /}"{/if}
    fx:b="
        tiles 
        cols_{$cols}
        type_{$short_type}
        layout_{$layout}
        {$class}
        padding_{if $pads}on{else}off{/if}
        {if !$show_images} no_images{/if}"
    fx:styled
    fx:template="tiles"
    fx:name="Плитки"
    fx:size="high"
    fx:of="floxim.main.page:list">
    {@cols type="select" label="Число колонок" type="select" values="`range(1,5)`" default="4"}
    {@pads type='checkbox' label='Отступы' defalt="1" /}
    
    {default $show_images = true /}
    {default $image_width = 1200 / $cols /}
    {default $image_height = $image_width / $image_ratio /}
    {set $image_size = $image_width . '*' . $image_height /}
    {*
    {js}
        @module/Floxim/Ui/Js/Floxim.js
        tiles.js
    {/js}
    *}
    {css}flex-tiles.less{/css}
    {$items_prepend || :tile_block /}
    {$items || :tile_block /}
</div>
    
<div fx:template="tile_block" fx:e="tile" fx:b="tile">
    {apply tile /}
</div>
    
{template id="tile" test="is_string($item)" priority="2"}
    {$item /}
{/template}
    
<fx:a 
    fx:template="tile[$item.isInstanceOf('floxim.main.page')]" 
    {if $show_images}
        {set $image_field = $item.hasField('image') ? 'image' : ( $item.hasField('photo') ? 'photo' : '%image' ) /}
        {set $img_mod = $item[$image_field] ? 'with-image' : 'no-image' /}
    {/if}
    fx:e="body {$img_mod}">
    {if $show_images}
        <div fx:e="row image">
            <img fx:e="img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size /}" />
        </div>
    {/if}
	
    <div fx:e="data">
        <div fx:e="row name"><span fx:e="name">{$name}</span></div>
        <div fx:e="row extra" fx:hide-empty>
            {apply extra /}
        </div>
    </div>
</fx:a>
            
{preset id="tiles#image" of="floxim.media.photo:list"}
    {js}lightbox.js{/js}
    {use as="tile"}
        <div fx:e="image" data-lightbox_image="{$image editable="false"}" data-lightbox_title="{$description | htmlspecialchars}">
            <img fx:e="img" src="{$image | '400*300' /}" />
        </div>
    {/use}
{/preset}

{preset id="tiles#news" of="floxim.blog.news:list" replace="1"}
    {use as="extra"}
        {apply floxim.ui.date:date with $date = $item.publish_date /}
    {/use}
{/preset}