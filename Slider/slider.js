Floxim.handle('.slider', function() {
    var $slider = $(this);
    new Slider($slider);
    
    function Slider($node) {
        var Slider = this;
        
        this.$node = $node;
        this.width = null;
        this.height = null;
        this.slides = null;
        this.getSlides = function() {
            this.$slides = $node.elem('slide').not('.fx_entity_adder_placeholder');
        };
        this.getSlides();
        this.$container = $node.elem('slides');
        this.$current = this.$slides.first();
        this.$arrows = $node.elem('arrow');
        this.$imgs = this.$slides.ctx('slide').elem('image-img');
        
        this.$imgs.on('load', function() {
            Slider.recountHeight();
        });
        
        this.recountHeight = function () {
            // default height
            var res_height = Slider.height;
            this.$imgs.each(function() {
                if (this.complete) {
                    res_height = Math.min(res_height, $(this).height());
                }
            });
            if (!res_height !== Slider.height) {
                Slider.height = res_height;
                Slider.$node.css('height', res_height);
                //Slider.$slides.elem('image-overlay').css('height', res_height);
                Slider.$slides.css('height', res_height);
            }
        };
        
        this.init = function() {
            this.$node.css({width:'auto',height:'auto'});
            this.width = $node.parent().width();
            this.height = parseInt($node.css('height')) || parseInt($node.css('max-height')) || 300;
            this.$slides.css('width', this.width);
            this.$node.css({
                width:this.width
            });
            this.recountHeight();
            this.$container.css('width', this.width * this.$slides.length*2);
        };
        
        this.is_moving = false;
        this.move = function(dir) {
            if (dir === 'back') {
                Slider.$slides.first().before(Slider.$slides.last()); 
                Slider.$container.css('left', '-='+Slider.width );
                Slider.getSlides();
            }
            this.is_moving = true;
            this.$container.animate({
                left: (dir === 'next' ? '-=' : '+=') + this.width
            }, {
                duration:300,
                complete:function() {
                    if (dir === 'next') {
                        Slider.$container.append( Slider.$slides.first() );
                        Slider.$container.css('left', 0);
                        Slider.getSlides();
                    }
                    Slider.is_moving = false;
                }
            });
        };
        this.$arrows.on('click', function() {
            var dir = $(this).data('dir');
            
            if (Slider.is_moving) {
                Slider.$container.stop();
            } else {
                Slider.move(dir);
            }
        });
        $(window).resize(function(e) {
            if (e.target !== window) {
                return;
            }
            Slider.init();
        });
        this.init();
    }
});