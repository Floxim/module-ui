<div 
    {default $box_id = 'box' /}
    fx:b="box" 
    fx:scope="{$box_id}"
    fx:template="box" 
    fx:styled="id:{$box_id /}">
    {set $box = \Floxim\Ui\Box\Box::start($this) /}
    {set $all_fields = $item.getFields() /}
    <div 
        fx:each="$box.getGroups() as $group_num => $group" 
        fx:scope="groups.{$group_num}"
        fx:e="group">
        <div 
            fx:each="$group.fields as $field_num => $field_view" 
            fx:e="field"
            fx:scope="fields.{$field_num}"
            fx:b="field">
            {apply 
                $field_view.template 
                with 
                    $field_view,
                    $field = $all_fields[$field_view.keyword],
                    $value = $item[$field_view.keyword] /}
        </div>
    </div>
    {= $box.stop() /}
</div>
        
<div fx:template="value" fx:aif="$value">
    {if $field.type === 'datetime'}
        {apply floxim.ui.date:date with $date = $value /}
    {else}
        {$value /}
    {/if}
</div>

<a fx:template="link_value" fx:aif="$value" fx:omit="!$url" href="{$url}">
    {$value /}
</a>

<div fx:template="value_labeled">
    <span>{%name}Это{/%}</span>:
    {apply value /}
</div>
        
<div fx:template="test" fx:of="floxim.corporate.person:list">
    {set $box_groups format="yaml"}
        -
            - keyword: name
              template: value_labeled
        -
            - keyword: birthday
              template: value_labeled
        -
            - description
    {/set}
    <div fx:each="$items as $item">
        {apply box with $groups = $box_groups /}
    </div>
</div>