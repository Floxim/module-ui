<fx:elem 
    fx:template="header" 
    fx:element-name="h{$level}2{/$}" 
    fx:b="header level_{$level /}"
    fx:styled="Стиль заголовка">
    {first}
        {default $level = 2 /}
        {default $header_link_target = false /}
    {/first}
    {css}header.less{/css}
    <fx:a href="$header_link" {if $header_link_target == 'blank'}target="_blank"{/if} fx:e="text">{$header}</fx:a>
</fx:elem>