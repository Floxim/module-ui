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
            {apply columns_group el group /}
            {= $_is_admin ? $box.handleColumns() : '' /}
        {elseif $group.type === 'image'}
            {apply image_group  el group /}
        {else}
            {apply group  el group /}
        {/if}
    {/each}
{/template}

<div 
    fx:template="columns_group"
    fx:b="floxim.ui.grid:grid">
    
    {css from="floxim.ui.grid"}
        grid.less
    {/css}
    
    {- \Floxim\Ui\Grid\Grid::addAdminAssets() /}
    
    {each select="$columns as $column" scope="true"}
        {- $context.pushContainerWidth( $column.width / 12 ) /}
        <div 
            fx:e="col width_{$column.width}"
            fx:b="floxim.ui.grid:col"
            fx:styled-inline="id:{$column.id};">
                {apply groups with $groups = $column.groups /}
        </div>
        {- $context.popContainerWidth() /}
    {/each}
</div>

<div
    fx:template="image_group"
    fx:b="image-group"
    fx:styled-inline>
    <div fx:e="image">
        {default $ratio = 1.5 /}
        {default $image_fit = 'crop' /}
        {@image_link type="livesearch" tab="image" label="Ссылка?" values="`[['none', 'Нет'],['link','Ссылка']]`" default="none" /}
        
        {set $img_width = $context->getContainerWidth() /}
        
        {if $ratio !== 'none' && $image_fit === 'crop'}
            {set $img_height = $img_width / $ratio /}
            {set $img_size = $img_width . '*' . $img_height /}
        {else}
            {set $img_size = 'max-width:' . $img_width /}
        {/if}
        <a fx:omit="$image_link === 'none'" href="{$item.url}" class="link">
            <img fx:e="img" src="{$item[$group.keyword] | fx::image : $img_size /}" />
        </a>
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
    fx:style-defaults="
        {if $position !== 1}
            margin:1rem 0rem 0rem 0rem
        {/if}
    "
    fx:hide-empty>
    {each select="$fields as $field_view" scope="true"}
        {= $_is_admin ?  $box.startField( $field_view )  : '' /}
        {set $el = 'field ' . $field_view.keyword /}
        {apply $field_view.template el $el /}
    {/each}
</div>
        
<div fx:template="value" fx:aif="$value" fx:b="value" fx:styled="label:Стиль поля">
    {first}
        {set $field = $item.getField($field_view.keyword) /}
        {set $value = $item[$field_view.keyword] /}
        
        {@show_label label="Подпись?" type="checkbox" default="0" /}
        
        {if $field.type !== 'icon'}
            {@value_icon label="Иконка?" type="iconpicker" default="0" /}
        {/if}
        {if !$field || $field.type === 'string'}
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
        {else}
            {$value /}
        {/if}
    </div>
</div>

{template id="list_value"}
    {set $value = $item[$field_view.keyword] /}
    {apply floxim.ui.tiles:tiles el field with $items = $value /}
{/template}

{template id="link_value"}
    {set $value = $item[$field_view.keyword] /}
    {if $value}
        {apply box el field with $item = $value /}
    {/if}
{/template}

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
    fx:b="image-value"
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
    <img src="{$value | 'max-width:1600'}" alt="" />
</div>

<div fx:template="text_value">
    Text text
    {@test label="Это хороший текст?" type="checkbox" /}
    {if $test}крутей текст!{/if}
</div>

<div fx:template="header_value">
    Headr
</div>