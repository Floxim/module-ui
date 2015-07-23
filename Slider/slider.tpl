<div fx:template="slider" fx:of="floxim.main.page:list" fx:b="slider">
    {default $slide_image_field = 'image' /}
    {js}
        @floxim_js/jquery.bem.js
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
    <div fx:e="image">
        <img fx:e="image-img" src="{$item[$slide_image_field] | 'width:1200px; max-height:600px;'}" />
        <div fx:e="image-underlay"></div>
    </div>
    <div fx:e="data">{$item | :slide_data /}</div>
</div>

{template id="slide_data"}
    <div fx:e="title"><a href="{$url}">{$name}</a></div>
    <div fx:e="description">{$description}</div>
    <div fx:e="link"><a href="{$url}">{$%more}Узнать больше{/$}</a></div>
{/template}