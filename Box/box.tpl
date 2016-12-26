<div 
    {default $box_id = 'box' /}
    {set $box = \Floxim\Ui\Box\Box::start($this) /}
    fx:e="{$box_element}{$box_id /}{/$}"
    fx:b="box" 
    fx:template="box" 
    fx:styled-inline>
    {css}box.less{/css}
    
    {apply groups /}
    
    {= $box.stop() /}
</div>

{template id="groups"}
    {each select="$groups as $group" scope="true"}
        {if $group.type === 'columns'}
            {apply columns_group /}
            {= $_is_admin ? $box.handleColumns() : '' /}
        {elseif $group.type === 'image'}
            {apply image_group /}
        {else}
            {apply group /}
        {/if}
    {/each}
{/template}

<div 
    fx:template="columns_group"
    fx:e="group"
    fx:b="floxim.ui.grid:grid">
    <div 
        fx:each="$columns as $column"
        fx:scope
        fx:e="col width_{$column.width}"
        fx:b="floxim.ui.grid:col"
        fx:styled-inline="id:{$column.id};">
            {apply groups with $groups = $column.groups /}
    </div>
</div>

<div
    fx:template="image_group"
    fx:e="group"
    fx:b="image-group"
    fx:styled-inline>
    <div fx:e="image">
        {default $ratio = 1.5 /}
        {set $img_width = 600 /}
        {if $ratio !== 'none'}
            {set $img_height = $img_width / $ratio /}
            {set $img_size = $img_width . '*' . $img_height /}
        {else}
            {set $img_size = 'max-width:' . $img_width /}
        {/if}
        <img fx:e="img" src="{$item[$group.keyword] | fx::image : $img_size /}" />
        <div fx:e="box-wrapper" fx:hide-empty>
            <div fx:e="box" fx:b="box" fx:hide-empty>
                {apply groups with $groups = $group.groups /}
            </div>
        </div>
    </div>
</div>

<div 
    fx:template="group"
    fx:e="group"
    fx:b="group"
    fx:styled-inline
    fx:hide-empty>
    <div 
        fx:each="$fields as $field_view" 
        fx:scope
        fx:e="field"
        fx:hide-empty>
        {apply $field_view.template /}
    </div>
</div>
        
<div fx:template="value" fx:aif="$value" fx:b="value" fx:styled="label:Стиль поля">
    {first}
        {set $field = $item.getField($field_view.keyword) /}
        {set $value = $item[$field_view.keyword] /}
        
        {@show_label label="Подпись?" type="checkbox" default="0" /}
        
        {if $field.type !== 'icon'}
            {@value_icon label="Иконка?" type="iconpicker" default="0" /}
        {/if}
        
        {if $field.type === 'string'}
            {@field_link label="Ссылка?" type="checkbox" default="0" /}
        {/if}
    {/first}
    
    <div fx:if="$show_label" fx:e="label">
        {%value_label}{$field.name /}{/%}
    </div>
    
    <div fx:link-if="$field_link" fx:e="value">
        <span fx:if="$value_icon" class="{= fx::icon( $value_icon ) }" fx:e="icon"></span>
        {if $field.type === 'datetime'}
            {apply floxim.ui.date:date with $date = $value /}
        {elseif $field.type === 'multilink'}
            {apply floxim.ui.tiles:tiles with $items = $value /}
        {else}
            {$value /}
        {/if}
    </div>
</div>

<div 
    fx:template="icon_value" 
    fx:aif="$value" 
    fx:link-if="$field_link"
    fx:b="icon-value" 
    class="{$value | fx::icon /}" 
    fx:styled="label:Стиль иконки">
    {first}
        {set $field = $item.getField($field_view.keyword) /}
        {set $value = $item[$field_view.keyword] /}
        {if $item.url}
            {@field_link label="Ссылка?" type="checkbox" default="0" /}
        {/if}
    {/first}
</div>

<div 
    fx:template="image_value" 
    fx:aif="$value" 
    fx:link-if="$field_link"
    fx:styled="label:Стиль картинки">
    {first}
        {set $field = $item.getField($field_view.keyword) /}
        {set $value = $item[$field_view.keyword] /}
        {if $item.url}
            {@field_link label="Ссылка?" type="checkbox" default="0" /}
        {/if}
    {/first}
    Картинко!
</div>