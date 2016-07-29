<div fx:b="box" fx:template="box" fx:styled="id:{$box_id}box{/$}">
    {$lines | count /} lines!
    <div fx:each="$lines as $line" fx:e="line" fx:b="line" fx:styled="id:{$line.id}">
        <div fx:each="$line.fields as $field" fx:b="field" fx:styled="id:{$field.id}">
            {*{$field | fx::debug /}*}
            {apply $field.template with $value = $item[$field.keyword] /}
        </div>
    </div>
</div>
        
<div fx:template="value" fx:aif="$value">
    [show {$field.keyword /}]
    {$value /}
</div>
        
<div fx:template="test" fx:of="floxim.corporate.person:list">
    {set $box_lines format="yaml"}
        - fields:
            - keyword: name
              template: value
            - keyword: description
              template: value
        - fields:
            - keyword: date
              template: value
    {/set}
    <div fx:each="$items as $item">
        {apply box with $lines = $box_lines /}
    </div>
</div>