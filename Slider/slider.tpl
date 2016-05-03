<div 
    fx:template="slider" 
    fx:of="floxim.main.page:list" 
    fx:b="slider {$class}" 
    fx:styled
    fx:size="wide,high"
    {if $autoplay}
        data-autoplay="true"
        data-pause_time="{$pause_time*1000}"
    {/if}
    {if $max_height}
            style="max-height: {$max_height}px"
    {/if}
    {if $slide_height}
        data-slide_height="{$slide_height}"
    {/if}
    {if $slide_width}
        data-slide_width="{$slide_width /}"
    {/if}
    {if $slide_offset}
        data-slide_offset="{$slide_offset /}"
    {/if}
    data-move_time="{$move_time*1000}">
    {default $slide_image_field = 'image' /}
    {default $slide_image_size = 'width:1200px; max-height:600px;' /}
    {@autoplay label="Слайдшоу" type="checkbox" default="0"}
    {@pause_time label="Пауза, сек." type="number" parent="autoplay" default="3"}
    {@move_time label="Скорость, сек." type="number" default="0.5"}
    {js}
        @floxim_js/jquery.bem.js
        @module/Floxim/Ui/Js/Floxim.js
        slider.js
    {/js}
    {css}
        slider.less
        slide.less
    {/css}
    <div fx:e="slides">
        {$items || :slide /}
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
    <div fx:e="image darken">
        <img fx:e="image-img" src="{$item[$slide_image_field] | fx::image : $slide_image_size}" />
        <div fx:e="image-underlay"></div>
    </div>
    <div fx:e="data">{$item | :slide_data /}</div>
</div>

{template id="slide_data"}
    <fx:a fx:e="title">{$name}</fx:a>
    <div fx:e="description">{$description}</div>
    <div fx:e="link"><a href="{$url}">{$%more label="Текст ссылки"}Узнать больше{/$}</a></div>
{/template}

{preset id="slider#photo" of="floxim.media.photo:list"}
    {use as="slide"}
        <div fx:e="slide" fx:b="slide">
            <div fx:e="image" fx:omit>
                <img fx:e="image-img" src="{$image | fx::image : $slide_image_size}" />
            </div>
        </div>
    {/use}
{/preset}