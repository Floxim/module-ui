<div
    fx:b="
        tiles 
        cols_{$cols}
        type_{$infoblock.short_type}
        {$class}
        {if !$show_images} no_images{/if}"
    fx:template="tiles"
    fx:name="Плитки"
    fx:size="high"
    fx:of="page:list">
    
    {@cols type="select" label="Число колонок" type="select" values="`range(1,5)`" default="4"}
    
    {default $show_images = true /}
    {default $image_width = 1200 / $cols /}
    {default $image_height = $image_width / 1.4 /}
    {set $image_size = $image_width . '*' . $image_height /}
    
    {js}
        tiles.js
    {/js}
    {css extend="1"}
        tiles.less
    {/css}
    
    <div fx:each="$items_prepend" fx:e="tile" fx:b="tile">
        {apply tile /}
    </div>
    <div 
        fx:each="$items" 
        fx:e="tile" fx:b="tile">
        {apply tile /}
    </div>
</div>
    
{template id="tile" test="is_string($item)" priority="2"}
    {$item /}
{/template}
    
<div fx:template="tile[$item.isInstanceOf('floxim.main.page')]" fx:e="body">
    {if $show_images}
        {set $image_field = $.hasField('image') ? 'image' : '%image' /}
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