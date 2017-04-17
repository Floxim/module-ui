<div 
    fx:template="record" fx:name="Поля" fx:of="*:record"
    fx:b="record"
    fx:with="$item">
    {css}record.less{/css}
    {apply floxim.ui.tiles:tile with $cols = 1 /}
</div>