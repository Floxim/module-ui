<span 
    fx:template="date" 
    fx:e="date">
    
    {@date_format
        type="select"
        label="Формат даты"
        :values="fx::module('floxim.ui')->getDateFormats()"
        /}
    
    {if !$date_format}
        {set $date_format = fx::module('floxim.ui')->getDefaultDateFormat() /}
    {/if}
    {$date | fx::date : $date_format /}
</span>