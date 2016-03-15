<div 
    fx:template="list" 
    fx:name="Список с картинками" 
    fx:of="floxim.main.page:list#2" 
    {set $list_type = str_replace(".", "-", $infoblock.controller) /}
    fx:b="list image-position_{$image_position} style_{$list_style /} type_{$list_type} {$list_mods}" 
    fx:size="wide,high">
    {default $image_size = '340*240' /}
    {css}
        list.less
    {/css}
    
    {@list_style type="style" mask="list_style_*" /}
    
    {@image_position 
        values="`array(
            'left' => 'Слева', 
            'right' => 'Справа', 
            'from-left' => 'Слева-справа', 
            'from-right' => 'Справа-слева')`"
        label="Позиция картинки"
        default="left"
    /}
    
    <div fx:each="$items" fx:e="item">
        <a href="{$url}" fx:e="item-link" fx:omit="!$url">
            {set $list_pre_extra}
                {apply list_pre_extra /}
            {/set}
            {set $image_side}
                {apply list_image_side /}
            {/set}
            <div fx:e="item-pre-extra" fx:if="$list_pre_extra">{$list_pre_extra /}</div>
            <div fx:e="image" fx:aif="trim($image_side) != ''">
                {$image_side /}
            </div>
            <div fx:e="data">
                {apply list_data /}
            </div>
        </a>
    </div>
    {apply floxim.main.content:pagination with $pagination /}
</div>

{template id="list_image_side"}
    {set $image_field = $item.hasField('image') ? 'image' : '%image'  /}
    <img fx:e="image-img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size}" />
    {set $image_side_extra}
        {apply list_image_side_extra /}
    {/set}
    <div fx:e="image-side-extra" fx:if="trim($image_side_extra)">{$image_side_extra /}</div>
{/template}

{template id="list_data"}
    <div fx:e="title">{$name}</div>
    <div fx:e="description">
        {$description}
    </div>
    
    <div fx:e="extra">
        {apply list_extra /}
    </div>
{/template}

{template id="list_image_side_extra"}{/template}

<div fx:template="list_extra[$item && $item.isInstanceOf('floxim_saas.content.service')]">
    {apply floxim_saas.content.service:price /}
</div>
    
<div fx:template="list_extra[$item && $item.isInstanceOf('floxim.blog.publication')]">
    <span fx:e="date">{$publish_date | 'd.m.Y'}</span>
</div>

<div fx:template="list_extra[$item && $item.isInstanceOf('floxim_saas.content.reviews')]">        
    <div fx:e="date">{$date | fx::date : 'd.m.Y' /}</div>
</div>