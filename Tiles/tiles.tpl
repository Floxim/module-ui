<div
    fx:b="tiles"
    fx:template="tiles"
    fx:name="Плитки"
    fx:size="high"
    fx:styled-inline
    fx:style-defaults="
        {set $container_max = min( max(1, round( $context->getContainerWidth() / 300 ) ), 4) /}
        cols: {= $items->limit ? min( $items->limit , $container_max) : $container_max /}
    "
    fx:of="floxim.main.content:list#3">
    {css}flex-tiles.less{/css}
    {default $cols = 1 /}
    <div fx:e="wrapper">
        {each $items as $item}
            {- $context.pushContainerWidth( 1 / $cols ) /}
            {apply floxim.ui.box:box el tile with $box_id = 'tilebox' /}
            {- $context.popContainerWidth() /}
        {/each}
    </div>
</div>

{template id="tile" test="is_string($item)" priority="2"}
    <div fx:e='tile'>{$item /}</div>
{/template}

{template id="tile"}
    {apply floxim.ui.box:box el tile with $box_id = 'tilebox' /}
{/template}