<div 
    fx:template="list" 
    fx:name="Список с картинками" 
    fx:of="floxim.main.page:list#2, floxim.main.factoid:list" 
    {set $list_type = str_replace(".", "-", $infoblock.controller) /}
    fx:b="list {$list_mods}" 
    fx:styled="Стиль списка"
    fx:size="wide,high">
    {*{default $image_size = '340*240' /}*}
    {default $image_size = 'max-width:450' /}
    {css}
        list.less
    {/css}
    
    <div fx:each="$items" fx:e="item">
        <div fx:e="image" fx:hide-empty>
            {set $image_field = $item.hasField('image') ? 'image' : '%image'  /}
            <div fx:e="image-wrapper">
                <img fx:e="image-img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size}" />
            </div>
        </div>
        <div fx:e="data">
            {apply floxim.ui.box:box with $box_id = 'listbox' /}
        </div>
    </div>
        
    {apply floxim.main.content:pagination with $pagination /}
</div>

{*
{template id="list_image_side"}
    {set $image_field = $item.hasField('image') ? 'image' : '%image'  /}
    <img fx:e="image-img" fx:aif="$item[$image_field]" src="{$item[$image_field] | fx::image : $image_size}" />
{/template}

{template id="list_data"}
    <div fx:e="title"><fx:a fx:e="item-link">{$name}</fx:a></div>
    <div fx:e="description">
        {$description}
    </div>
    <div fx:e="extra">
        {apply list_extra /}
    </div>
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
*}