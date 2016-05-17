<div 
    fx:template="slider" 
    fx:of="floxim.main.page:list" 
    fx:b="slider {$class} type_{$infoblock.short_type /}" 
    fx:styled
    fx:size="wide,high"
    {if $autoplay}
        data-autoplay="true"
        data-pause_time="{$pause_time*1000}"
    {/if}
    data-move_time="{$move_time*1000}">
    {default $slide_image_field = 'image' /}
    {default $slide_image_size = 'max-width:1200px; max-height:600px;' /}
    {@autoplay label="Слайдшоу" type="checkbox" default="0"}
    {@pause_time label="Пауза, сек." type="number" parent="autoplay" default="3"}
    {@move_time label="Скорость, сек." type="number" default="0.5"}
    
    {@ratio label="Пропорции" type="number" min="0.2" max="1" step="0.05" default="0.4" /}
    
    {js}
        @floxim_js/jquery.bem.js
        @module/Floxim/Ui/Js/Floxim.js
        slider.js
    {/js}
    {css}
        slider.less
    {/css}
    <div fx:e="slides-wrapper" style="padding-bottom:{= $ratio * 100}%;">
        <div fx:e="slides">
            {$items || :slide /}
        </div>
    </div>
    <div fx:e="arrows">
        <a fx:e="arrow back" data-dir="back"><span></span></a>
        <a fx:e="arrow next" data-dir="next"><span></span></a>
    </div>
    <div fx:e="points"></div>
</div>

<div fx:template="slide" fx:e="slide" fx:b="slide">
    {if !$item[$slide_image_field]}
        {set $slide_image_field = '%image' /}
    {/if}
    <div fx:e="image" style="background-image:url({$item[$slide_image_field] | fx::image : $slide_image_size});">
            
    </div>
    <div fx:e="data">{$item | :slide_data /}</div>
</div>

{template id="slide_data"}
    <fx:a fx:e="title">{$name}</fx:a>
    <div fx:e="description" fx:aif="$description">{$description}</div>
    <div fx:e="link"><a href="{$url}">{$%more label="Текст ссылки"}Узнать больше{/$}</a></div>
{/template}

{preset id="slider#photo" of="floxim.media.photo:list" replace="1"}
    {use as="slide_data"}
        <div fx:e="description" fx:aif="description">{$description /}</div>
    {/use}
{/preset}

{preset id="slider#service" of="floxim.corporate.service:list" replace="1"}
    {use as="slide_data"}
        <fx:a fx:e="title">{$name}</fx:a>
        <div fx:e="description" fx:aif="$description">{$description}</div>
        <div fx:e="link" fx:aif="$price"><a href="{$url}">{$price /}</a></div>
    {/use}
{/preset}