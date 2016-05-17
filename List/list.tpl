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
        <fx:a fx:e="item-link">
            <div fx:e="item-pre-extra" fx:hide-empty>
                {apply list_pre_extra /}
            </div>
            <div fx:e="image" fx:hide-empty>
                {apply list_image_side /}
            </div>
            <div fx:e="data">
                {apply list_data /}
            </div>
        </fx:a>
    </div>
            
    {apply floxim.main.content:pagination with $pagination /}
</div>

{template id="list_image_side"}
    {set $image_field = $item.hasField('image') ? 'image' : '%image'  /}
    <img fx:e="image-img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size}" />
    <div fx:e="image-side-extra" fx:hide-empty>
        {apply list_image_side_extra /}
    </div>
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

{template id="list_extra" test="$item.isInstanceOf('floxim.corporate.service')"}
    <div fx:e="price" fx:aif="$price">{$price /}</div>
{/template}
    
{template id="list_extra" test="$item.isInstanceOf('floxim.blog.publication')"}
    <span fx:e="date">{apply floxim.ui.date:date with $date = $publish_date /}</span>
{/template}

{template id="list_extra" test="$item.isInstanceOf('floxim_saas.content.reviews')"}
    <div fx:e="date">{$date | fx::date : 'd.m.Y' /}</div>
{/template}

{preset id="list#factoid" of="floxim.main.factoid:list" replace="1"}
    {use as="list_data"}
        <div fx:e="title">{$name /}</div>
        <div fx:e="description">{$description /}</div>
        <div fx:if="$url" fx:e="more">
            <span fx:e="more-link">{$%link_text}Подробнее{/%}</span>
        </div>
    {/use}
{/preset}