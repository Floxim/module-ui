<div 
    {default $box_id = 'box' /}
    {set $box = \Floxim\Ui\Box\Box::start($this) /}
    fx:e="{$box_element}{$box_id /}{/$}"
    fx:b="box" 
    fx:template="box"
    fx:styled-inline
    data-item="{$item | fx::void /}">
    {css}box.less{/css}
    {js}box.js{/js}
    
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
    class="" {* <- hack: add class first to make data from styled-inline available later *}
    fx:template="image_group"
    fx:b="
        image-group
        size_{= $ratio == 'none' ? 'auto' : 'fixed' /}
        fit_{$image_fit /}
        {if $has_children}has-children{else}no-children{/if}"
    fx:styled-inline="lightness_image: {$item[$group.keyword] /};"
    fx:link="tab: image;"
    {default $ratio = 1.5 /}
    {default $image_fit = 'crop' /}
    {set $img_width = $context->getContainerWidth() /}
    {if $ratio !== 'none' && $image_fit === 'crop'}
        {set $img_height = $img_width / $ratio /}
        {set $img_size = $img_width . '*' . $img_height /}
    {else}
        {set $img_size = 'max-width:' . $img_width /}
    {/if}
    {if $has_children}
        style="background-image: url('{$item[$group.keyword] | fx::image : $img_size /}');"
    {/if}>


    {first}
        {set $has_children = count( $group.groups ) > 0 /}
    {/first}

    {css}image-group.less{/css}

    {if $has_children}
        <div fx:e="image-spacer">
            {if $image_fit == 'original'}
                <img src="{$item[$group.keyword] /}" editable="false" />
            {else}
                <img src="{$item[$group.keyword] editable='false' | fx::image : $img_size /}" />
            {/if}
        </div>
        <div fx:e="content" fx:b="box" fx:hide-empty>
            {apply groups with $groups = $group.groups /}
        </div>
    {else}
        {if $image_fit == 'original'}
            <img fx:e="image" src="{$item[$group.keyword] /}" />
        {else}
            <img fx:e="image theimg" src="{$item[$group.keyword] | fx::image : $img_size /}" />
        {/if}
    {/if}
</div>

<div 
    fx:template="group"
    fx:e="group"
    fx:b="group"
    fx:link="tab: main;"
    fx:styled-inline
    fx:style-defaults="
        {if $position !== 1}
            margin:1rem 0rem 0rem 0rem
        {/if}
    "
    fx:style-params="
        count_fields: {$fields | count /};
        width_type: {$context.getContainerWidthType() /};
        width_value: {$context.getContainerWidthValue() /};
    "
    class="{if $show_group === 'parent_hover'}fx-handle-parent-hover{/if}"
    fx:hide-empty>
    {each select="$fields as $field_view" scope="true"}
        {= $_is_admin ?  $box.startField( $field_view )  : '' /}
        {set $el = 'field ' . $field_view.keyword /}
        {apply $field_view.template el $el /}
    {/each}
</div>
        
<div fx:template="value" fx:aif="$value" fx:b="value">
    {first}
        {set $field = $item.getField($field_view.keyword) /}
        {set $value = $item[$field_view.keyword] /}
        
        {@show_label 
            label="Подпись?" 
            type="livesearch" 
            values="`array('0' => 'нет', 'left' => 'слева', 'top' => 'сверху')`" 
            default="0" /}
        
        {if $field.type !== 'icon'}
            {@value_icon label="Иконка?" type="iconpicker" default="0" /}
        {/if}
        {if !$field || $field.type === 'string'}
        {@field_link source="\Floxim\Ui\Box\Box::getLinkParam" /}
        {/if}
    {/first}
    
    <div fx:if="$show_label" fx:e="label">
        {%value_label}{$field.name /}{/%}
    </div>
    
    <div fx:link-if="$field_link" {if $field_link == 'blank'}target="_blank"{/if} fx:e="value">
        {set $text_value}
            <span fx:if="$value_icon" class="{= fx::icon( $value_icon ) }" fx:e="icon"></span>
            {if $field.type === 'datetime'}
                {apply floxim.ui.date:date with $date = $value /}
            {else}
                {$value /}
            {/if}
        {/set}
        {apply floxim.main.text:text with $text = $text_value /}
    </div>
</div>
    
{template id="display_value" nows="true"}
    {if $field.type === 'datetime'}
        {apply floxim.ui.date:date with $date = $value /}
    {elseif in_array($field.type, array('int', 'float', 'number')) }
        {apply floxim.ui.number:number with $number = $value /}
    {elseif $field.type === 'select'}
        {set $entity_offset = $field.keyword . '_entity' /}
        {set $select_entity = $item[ $entity_offset ] /}
        {$select_entity.name /}
    {else}
        {$value /}
    {/if}
{/template}

{template id="list_value"}
    {set $value = $item[$field_view.keyword] /}
    {set $sorted_value = \Floxim\Ui\Box\Box::prepareLinkedList($value, $link_sorting) /}
    {@param
        name="link_sorting"
        label="Сортировка"
        type="sort_picker"
        :sorter_options="\Floxim\Ui\Box\Box::getSorterOptions($context->get('item'), $context->getFrom($context->get('field_view'), 'keyword'))" /}

    {apply floxim.ui.tiles:tiles el field with $items = $sorted_value /}
{/template}

{template id="link_value"}
    {set $value = $item[$field_view.keyword] /}
    {if $value}
        {with $value}
            {apply box el field with $item = $value /}
        {/with}
    {else}
        {set $placeholders = $item.getAdderPlaceholders($field_view.keyword) /}
        {each $placeholders as $item}
            {apply box el field with $item = $item /}
        {/each}
    {/if}

{/template}

<div 
    fx:template="icon_value" 
    fx:aif="$value" 
    fx:link-if="$field_link"
    {if $field_link == 'blank'}target="_blank"{/if}
    fx:b="icon-value" 
    class="{$value | fx::icon /}" 
    fx:styled="label:Стиль иконки">
    {first}
        {set $field = $item.getField($field_view.keyword) /}
        {set $value = $item[$field_view.keyword] /}
        {if $item.url}
            {@field_link source="\Floxim\Ui\Box\Box::getLinkParam" /}
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

<div 
    fx:link
    fx:b="floxim.main.text:text" 
    fx:styled="Стиль текста" 
    fx:template="text_value" 
    fx:aif="$value">
    {css from="floxim.main.text"}text.less{/css}
    {first}
        {set $value = $item[$field_view.keyword] /}
        {set $field = $item.getField($field_view.keyword) /}

    {/first}
    {apply display_value /}
</div>

<div fx:template="header_value" fx:aif="$value">
    {first}
        {set $value = $item[$field_view.keyword] /}
        
        {set $field = $item.getField($field_view.keyword) /}
        
        {if !$field || in_array($field.type, ['string','datetime']) }
            {@field_link source="\Floxim\Ui\Box\Box::getLinkParam" /}
        {/if}
    {/first}
    {set $header_value}{apply display_value /}{/set}
    {apply 
        floxim.ui.header:header 
        with 
            $header = $header_value, 
            $header_link = $field_link ? $item.url . ( substr($field_link, 0, 1) === '#' ? $field_link : '' ) : false,
            $header_link_target = $field_link
    /}
</div>

<div 
    fx:template="button_value" 
    fx:link
    fx:aif="$value" 
    fx:b="floxim.form.form:button"
    fx:styled="label:Стиль кнопки">
    {first}
        {set $value = $item[$field_view.keyword] /}
        {set $field = $item.getField($field_view.keyword) /}
    {/first}
    <span>{$value /}</span>
</div>

<div 
    fx:template="free_text"
    fx:b="floxim.main.text:text" 
    fx:styled="Стиль текста">
    {css from="floxim.main.text"}text.less{/css}
    {*{@value_mode type="livesearch" label="Значение" values="`[['same', 'Везде одинаковое'],['different','Разное']]`" /}*}
    {default $default_value = 'Придумайте текст' /}
    {@default_value type="string" label="Текст" /}
    
    
    {%default_value /}
</div>

<div 
    fx:template="free_button" 
    fx:link
    fx:b="floxim.form.form:button"
    fx:styled="label:Стиль кнопки">
    <span>
        {default $default_value = 'Кнопка' /}
        {@default_value type="string" label="Надпись" /}
        {%default_value /}
    </span>
</div>
    
<div fx:template="formatted_value"
     fx:b="floxim.main.text:text"
     fx:styled="label:Стиль; id:all"
     fx:aif="$value"
     data-value-format="{%value_format type="fx-box-format" label="Формат" | json_encode /}"
     fx:nows>
    {first}
        {set $value = $item[$field_view.keyword] /}
        {set $field = $item.getField($field_view.keyword) /}
        {@value_format label="Формат" type="fx-box-format" :default="['','']" /}
        {set $value_prefix = $value_format[0] /}
        {set $value_postfix = $value_format[1] /}
    {/first}
    <span fx:if="$value_prefix">{$value_prefix /}</span>
    <span 
        fx:b="floxim.main.text:text"
        fx:styled="label:Стиль значения; id: val">
        {apply display_value /}
    </span>
    <span fx:if="$value_postfix">{$value_postfix /}</span>
</div>

<div fx:template="formatted_header_value" fx:aif="$value" fx:nows fx:b="formatted-header-value">
    {first}
        {set $value = $item[$field_view.keyword] /}
        {set $field = $item.getField($field_view.keyword) /}
        {@value_format label="Формат" type="fx-box-format" :default="['','']" /}
        {set $value_prefix = $value_format[0] /}
        {set $value_postfix = $value_format[1] /}
    {/first}
    {set $header_value}
        <span fx:e="prefix" fx:if="$value_prefix">{$value_prefix /}</span>
        <span fx:link>{apply display_value /}</span>
        <span fx:e="postfix" fx:if="$value_postfix">{$value_postfix /}</span>
    {/set}
    {apply
        floxim.ui.header:header
        with
        $header = $header_value
    /}
</div>

<div fx:template="file_value" fx:aif="$value">
    {first}
        {set $value = $item[$field_view.keyword] /}
        {set $field = $item.getField($field_view.keyword) /}
    {/first}
    {set $file_instance = \Floxim\Ui\Box\BoxFile::create($value) /}
    {apply box with $item = $file_instance, $box_id = 'filebox', $field_source = 'item', $url = $file_instance.url /}
</div>