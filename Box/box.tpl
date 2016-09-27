<div 
    {default $box_id = 'box' /}
    {set $box = \Floxim\Ui\Box\Box::start($this) /}
    fx:e="{$box_element}{$box_id /}{/$}"
    fx:b="box" 
    fx:template="box" 
    fx:styled-inline>
    
    <div 
        fx:each="$groups as $group" 
        fx:scope
        fx:e="group"
        fx:b="group"
        fx:styled-inline>
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
    {@show_label label="Подпись?" type="checkbox" default="0" /}
    
    <div fx:if="$show_label" fx:e="label">
        {%value_label}{$field.name /}{/%}
    </div>
    {if $field.type === 'string'}
        {@field_link label="Ссылка?" type="checkbox" default="0" /}
    {/if}
    <div fx:e="value">
        <a href="{$url}" fx:omit="!$field_link">
            {if $field.type === 'datetime'}
                {apply floxim.ui.date:date with $date = $value /}
            {else}
                {$value /}
            {/if}
        </a>
    </div>
</div>

<a fx:template="link_value" fx:aif="$value" fx:omit="!$url" href="{$url}">
    {$value /}
</a>