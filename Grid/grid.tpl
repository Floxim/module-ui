<div 
    fx:b="grid" 
    fx:of="show"
    fx:template="grid"
    fx:name="Колонки"
    fx:styled-inline>
    
    {css}grid.less{/css}
    
    {set $grid = \Floxim\Ui\Grid\Grid::start($this) /}
    
    <div 
        fx:each="$cols as $col" 
        fx:scope
        fx:e="col width_{$col.width}"
        fx:b="col"
        fx:area="$col.id"
        fx:area-name="$col.name"
        fx:area-render="manual"
        fx:styled-inline="id:{$col.id};">
        
        {set $blocks = $grid.getBlocks() /}
        
        {if $blocks}
            {each $blocks as $ib}
                {$ib.render() /}
            {/each}
        {else}
            {*<div fx:e="placeholder">Тут будут блоки!</div>*}
        {/if}
    </div>
    {= $grid.stop() /}
</div>