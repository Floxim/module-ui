<fx:elem 
    fx:template="header" 
    {default $level = 2 /}
    fx:element-name="h{$level}2{/$}" 
    fx:b="header level_{$level /}"
    fx:styled="Стиль заголовка">
    {css}header.less{/css}
    {*
    {@header_size 
        label="Размер заголовка" 
        values="`array('auto' => '-авто-',  '1' => 'Огромный',  '2' => 'Большой',  '3' => 'Средний', '4' => 'Небольшой', '5' => 'Мелкий')`" 
        type="select" 
        default="auto" /}
        *}
    <fx:a href="$header_link" fx:e="text">{$header}</fx:a>
</fx:elem>