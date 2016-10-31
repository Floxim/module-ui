<div 
    {default $box_id = 'box' /}
    {set $box = \Floxim\Ui\Box\Box::start($this) /}
    fx:e="{$box_element}{$box_id /}{/$}"
    fx:b="box" 
    fx:template="box" 
    fx:styled-inline>
    {css}box.less{/css}
    <div 
        fx:each="$groups as $group" 
        fx:scope
        fx:e="group"
        fx:b="group"
        fx:styled-inline
        fx:hide-empty>
        <div 
            fx:each="$fields as $field_view" 
            fx:scope
            fx:e="field"
            fx:hide-empty>
            
            {apply 
                $field_view.template 
                with 
                    $field = $item.getField($field_view.keyword),
                    $value = $item[$field_view.keyword] /}
        </div>
    </div>
    {= $box.stop() /}
</div>
        
<div fx:template="value" fx:aif="$value" fx:b="value" fx:styled="label:Стиль поля">
    {if true}
        {@show_label label="Подпись?" type="checkbox" default="0" /}
        {@value_icon label="Иконка?" type="iconpicker" default="0" /}
    {/if}
    {if $field.type === 'string'}
        {@field_link label="Ссылка?" type="checkbox" default="0" /}
    {/if}
    
    
    <div fx:if="$show_label" fx:e="label">
        {%value_label}{$field.name /}{/%}
    </div>
    
    {set $res_value}
        <span fx:if="$value_icon" class="{= \Floxim\Floxim\Asset\Icons::getClass( $value_icon) }" fx:e="icon"></span>
        {if $field.type === 'datetime'}
            {apply floxim.ui.date:date with $date = $value /}
        {else}
            {$value /}
        {/if}
    {/set}
    
    {if $field_link}
        <a href="{$url}" fx:e="value">{$res_value /}</a>
    {else}
        <div fx:e="value">{$res_value /}</div>
    {/if}
</div>

<a fx:template="link_value" fx:aif="$value" fx:omit="!$url" href="{$url}">
    {$value /}
</a>