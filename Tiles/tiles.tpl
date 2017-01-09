<div
    fx:b="tiles"
    fx:template="tiles"
    fx:name="Плитки"
    fx:size="high"
    fx:styled-inline
    fx:style-defaults="
        cols: {= $items->limit  && $items->limit < 3 ? $items->limit : 3 /}
    "
    fx:of="floxim.main.content:list#3">
    {css}flex-tiles.less{/css}
    <div fx:e="wrapper">
        {*
        {$items_prepend || :tile_block /}
        *}
        {each $items as $item}
            {apply floxim.ui.box:box el tile with $box_id = 'tilebox' /}
        {/each}
        {*
        {$items || :tile /}
        *}
    </div>
</div>
{*
<div fx:template="tile_block" fx:e="tile" fx:b="tile">
    {apply tile /}
</div>
*}
    
{template id="tile" test="is_string($item)" priority="2"}
    <div fx:e='tile'>{$item /}</div>
{/template}

{template id="tile"}
    {apply floxim.ui.box:box el tile with $box_id = 'tilebox' /}
{/template}