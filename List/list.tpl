<div 
    fx:template="list" 
    fx:name="Список с картинками" 
    fx:of="floxim.main.page:list#2" 
    fx:b="list image-position_{$image_position} style_{$list_style /}" 
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
            {set $image_field = $item.hasField('image') ? 'image' : '%image'  /}
            <div fx:e="image" fx:aif="$item[$image_field]">
                <img fx:e="image-img" src="{$item[$image_field] | fx::image : $image_size}" />
            </div>
            <div fx:e="data">
                <div fx:e="title">{$name}</div>
                <div fx:e="description">
                    {$description}
                </div>
                <div fx:e="extra">
                    {apply list_extra /}
                </div>
            </div>
        </a>
    </div>
    {apply floxim.main.content:pagination with $pagination /}
</div>

<div fx:template="list_extra[$item && $item.isInstanceOf('floxim_saas.content.service')]">
    {apply floxim_saas.content.service:price /}
</div>
    
<div fx:template="list_extra[$item && $item.isInstanceOf('floxim.blog.publication')]">
    <span fx:e="date">{$publish_date | 'd.m.Y'}</span>
</div>

<div fx:template="list_extra[$item && $item.isInstanceOf('floxim_saas.content.reviews')]">        
    <div fx:e="date">{$date | fx::date : 'd.m.Y' /}</div>
</div>