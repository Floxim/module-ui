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
        {if !$show_images} no_images{/if}"
    fx:template="tiles"
    fx:name="Плитки"
    fx:size="high"
    fx:of="floxim.main.page:list">
    {@cols type="select" label="Число колонок" type="select" values="`range(1,5)`" default="4"}
    
    {default $show_images = true /}
    {default $image_width = 1200 / $cols /}
    {default $image_height = $image_width / $image_ratio /}
    {set $image_size = $image_width . '*' . $image_height /}
    
    {js}
        @module/Floxim/Ui/Js/Floxim.js
        tiles.js
    {/js}
    {css extend="1"}
        tiles.less
    {/css}
    {$items_prepend || :tile_block /}
    {$items || :tile_block /}
</div>
    
<div fx:template="tile_block" fx:e="tile" fx:b="tile">
    {apply tile /}
</div>
    
{template id="tile" test="is_string($item)" priority="2"}
    {$item /}
{/template}
    
<div 
    fx:template="tile[$item.isInstanceOf('floxim.main.page')]" 
    {if $show_images}
        {set $image_field = $item.hasField('image') ? 'image' : ( $item.hasField('photo') ? 'photo' : '%image' ) /}
        {set $img_mod = $item[$image_field] ? 'with-image' : 'no-image' /}
    {/if}
    fx:e="body {$img_mod} img_{$image_field}">
    {if $show_images}
        <div fx:e="row image">
            <a href="{$url}">
                <img fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size /}" />
            </a>
        </div>
    {/if}
	
    <a href="{$url}" fx:e="data">
        <div fx:e="row name"><span fx:e="name">{$name}</span></div>
        <div fx:e="row extra">
            <span fx:e="date">
                {if $item.isInstanceOf('floxim.corporate.project')}
                    {$date | '%Month% Y'}
                {elseif $item.isInstanceOf('floxim.blog.publication')}
                    {$publish_date | 'j %month:gen% Y'}
                {/if}
            </span>
        </div>
    </a>
</div>
            
{preset id="tiles#image" of="floxim.media.photo:list"}
    {use as="tile"}
        <div fx:e="image">
            Picc!
            <img src="{$image | 'max-width:200' /}" />
        </div>
    {/use}
{/preset}