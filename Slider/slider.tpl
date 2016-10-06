<div 
    fx:template="slider" 
    fx:name="Слайдер"
    fx:of="floxim.main.page:list, floxim.main.factoid:list, floxim.media.photo:list" 
    fx:b="slider type_{$infoblock.short_type /}" 
    fx:styled="Стиль слайдера"
    fx:size="wide,high"
    {if $autoplay}
        data-autoplay="true"
        data-pause_time="{$pause_time*1000}"
    {/if}
    data-move_time="{$move_time*1000}">
    
    {default $slide_image_field = 'image' /}
    
    {default $slide_image_size = 'max-width:1200px; max-height:600px;' /}
    
    {set $slide_width = 1 /}
    
    {set $image_ratio = 1 /}
    
    {set $slide_image_width = 1200 /}    
    {default $slide_image_height = 600 /}
    
    {@autoplay label="Слайдшоу" type="checkbox" default="0"}
    {@pause_time label="Пауза" type="number" min="1" max="20" step="1" parent="autoplay" default="3" units="с"}
    {@move_time label="Скорость" type="number" min="0.2" max="5" step="0.2" default="0.5"}
    
    {@show_points type="checkbox" default="0" label="Показывать точки" /}
    
    {js}
        @floxim_js/jquery.bem.js
        @module/Floxim/Ui/Js/Floxim.js
        slider.js
    {/js}
    
    <div fx:e="slides-wrapper">
        <div fx:e="slides">
            {$items || :slide /}
        </div>
    </div>
    <div fx:e="arrows">
        <a fx:e="arrow back" data-dir="back"><span></span></a>
        <a fx:e="arrow next" data-dir="next"><span></span></a>
    </div>
    
    <div fx:e="points" fx:if="$show_points">
        <div fx:each="$items" fx:add="false" fx:e="point" title="{$name}"></div>
    </div>
</div>

<div
    {if !$item[$slide_image_field]}
        {set $slide_image_field = %image /}
    {/if}
    fx:template="slide" 
    fx:e="slide" 
    fx:b="slide" 
    fx:styled="Стиль слайда"
    data-pic="{if $_is_admin}{$slide_image_field /}{/if}">
    
    {*
    {default $image_in_slide_width = 1 /}
    
    {set $image_ratio = $image_ratio * $image_in_slide_width /}
    
    {set $slide_image_width = $slide_image_width * $slide_width * $image_in_slide_width /}
    {set $slide_image_height = $slide_image_width / $image_ratio /}
    
    {set $slide_image_size = 'width: ' . $slide_image_width . '; height: ' . $slide_image_height /}
    *}
    {default $slide_image_size = '1200*500' /}
    
    <div fx:e="image" style="background-image:url({$item[$slide_image_field] | fx::image : $slide_image_size});">
        
    </div>
    <div fx:e="data">
        {apply floxim.ui.box:box with $box_id = 'slidebox' /}
    </div>
</div>