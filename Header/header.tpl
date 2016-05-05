<fx:elem 
    fx:template="header" 
    {default $level = 2 /}
    fx:element-name="h{$level}2{/$}" 
    fx:b="header level_{$level /}"
    fx:styled="Стиль заголовка">
    {css}header.less{/css}
    <fx:a href="$header_link" fx:e="text">{$header}</fx:a>
</fx:elem>