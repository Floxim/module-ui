<div 
    fx:b="grid" 
    fx:of="show"
    fx:template="grid"
    fx:name="Колонки"
    fx:styled-inline>
    
    {css}grid.less{/css}
    
    {set $grid = \Floxim\Ui\Grid\Grid::start($this) /}
    
    {each select="$cols as $col" scope="true"}
        {- $context.pushContainerWidth( $col.width / 12 ) /}
        {set $size = $context.getContainerWidth() > 500 ? 'wide' : 'narrow' /}
        <div 
            fx:e="col width_{$col.width}"
            fx:b="col"
            fx:area="$col.area_id"
            fx:area-name="$col.area_name"
            fx:area-render="manual"
            fx:area-size="$size"
            fx:styled-inline="id:{$col.id};">

            {set $blocks = $grid.getBlocks() /}

            {if $blocks}
                {each $blocks as $ib}
                    {$ib.render() /}
                {/each}
            {/if}
        </div>
        {- $context.popContainerWidth() /}
    {/each}
    {= $grid.stop() /}
</div>