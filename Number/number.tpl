<span
    fx:template="number"
    fx:e="number"
    {if $_is_admin} data-fx_val_to_edit="{$number /}"{/if}>

    {@number_format
    type="select"
    label="Формат числа"
    values="`fx::module('floxim.ui')->getNumberFormats()`"
    /}

    {if !$number_format}
        {set $number_format = fx::module('floxim.ui')->getDefaultNumberFormat() /}
    {/if}
    {= \Floxim\Ui\Module::numberFormat( $number,  $number_format ) /}
</span>