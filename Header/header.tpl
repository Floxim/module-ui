<fx:elem fx:template="header" fx:element-name="h{$level}2{/$}" fx:b="header style_{$header_style}">
    {@header_style type="style" mask="header_style_*" label="Стиль заголовка" /}
    <span fx:e="text">{$header}</span>
</fx:elem>