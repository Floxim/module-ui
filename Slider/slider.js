Floxim.handle('.slider', function() {
    var $slider = $(this);
    new Slider($slider);
    
    function Slider($node) {
        var Slider = this;
        
        this.$node = $node;
        $node.data('slider', this);
        this.width = null;
        this.height = null;
        this.slides = null;
        this.autoplay = $node.data('autoplay');
        this.pause_time = $node.data('pause_time') || 3000;
        this.duration = $node.data('move_time') || 300;
        this.getSlides = function() {
            this.$slides = $node.elem('slide').filter(function() {
                var $el = $(this),
                    res = true;
                if ($el.is('.fx_entity_hidden')) {
                    res = $fx && $fx.front && $fx.front.mode !== 'view' && $fx.front.mode !== 'design';
                } else {
                    res = !$el.hasClass('fx_entity_adder_placeholder') || $el.hasClass('fx_entity_adder_placeholder_active');
                }
                return res;
            });
            return this.$slides;
        };
        this.$container = $node.elem('slides');
        
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
                Slider.$slides.css('height', res_height);
            }
        };
        
        this.init = function() {
            
            this.getSlides();
            this.$current = this.$slides.first();
            this.$arrows = $node.elem('arrow');
            this.$imgs = this.$slides.ctx('slide').elem('image-img');

            this.$imgs.on('load', function() {
                Slider.recountHeight();
            });
            
            this.$node.css({width:'auto',height:'auto'});
            this.width = $node.parent().width();
            this.height = parseInt($node.css('height')) || parseInt($node.css('max-height')) || 300;
            this.$slides.css('width', this.width);
            this.$node.css({
                width:this.width
            });
            this.recountHeight();
            this.$container.css('width', this.width * this.$slides.length*2);
            this.$arrows.off('click').on('click', function() {
                var dir = $(this).data('dir');
                Slider.stop();
                Slider.move(dir);
                /*
                if (Slider.is_moving) {
                    // ???
                    //Slider.$container.stop();
                } else {
                    Slider.move(dir);
                }
                */
            });
            if (this.autoplay) {
                this.autoMove(this.pause_time);
            }
            window.slider = this;
        };
        var automove_timeout = null;
        this.autoMove = function(pause_time) {
            clearTimeout(automove_timeout);
            automove_timeout = setTimeout(
                function() {
                    Slider.move('next', null, function() {
                        Slider.autoMove(pause_time);
                    });
                }, 
                pause_time
            );
        };
        
        this.is_moving = false;
        this.move = function(dir, duration, callback) {
            duration = duration || Slider.duration;
            dir = dir || 'next';
            var c_left = parseInt(Slider.$container.css('left')),
                new_left;
            if (dir === 'back') {
                new_left = '+=' + (this.width - c_left);
                Slider.$slides.first().before(Slider.$slides.last()); 
                Slider.$container.css('left', '-='+Slider.width );
                Slider.getSlides();
            } else {
                new_left = '-=' + (this.width + c_left);
            }
            this.is_moving = true;
            
            if (dir === 'next') {
                Slider.$current = Slider.$slides.eq(1);
            } else {
                Slider.$current = Slider.$slides.first();
            }
            console.log('now curr', Slider.$current.find('.slide__title').text());
            
            this.$container.addClass('fx_is_moving').animate({
                left: new_left
            }, {
                duration:duration,
                complete:function() {
                    if (dir === 'next') {
                        Slider.$container.append( Slider.$slides.first() );
                        Slider.$container.css('left', 0);
                        Slider.getSlides();
                        //Slider.$current = Slider.$slides.first();
                    }
                    Slider.is_moving = false;
                    Slider.$container.removeClass('fx_is_moving');
                    if (callback) {
                        callback();
                    }
                }
            });
        };
        
        this.stop = function() {
            this.$container.stop();
            clearTimeout(automove_timeout);
            this.is_moving = false;
        };
        var t_speed = 400;
        this.moveTo = function($slide) {
            var $slides = this.getSlides();
            if (!$slide.is($slides)) {
                return;
            }
            this.stop();
            var callback = function() {
                if (Slider.$current[0] === $slide[0]) {
                    Slider.$container.animate({
                        left:0
                    }, t_speed);
                    return;
                }
                Slider.move('next', t_speed, callback);
            };
            callback();
        };
        
        $(window).resize(function(e) {
            if (e.target !== window) {
                return;
            }
            Slider.init();
        });
        this.init();
        this.$node
            .off('.slider')
            .on('fx_after_show_adder_placeholder.slider', function(e) {
                Slider.init();
                Slider.moveTo($(e.target));
            })
            .on('fx_select.slider', '.slide', function(e) {
                Slider.stop();
                Slider.moveTo( $(this) );
            })
            .on('fx_deselect.slider', '.slide', function(e) {
                if (Slider.autoplay) {
                    Slider.autoMove(Slider.pause_time);
                }
            });
        $('html').off('.slider').on('fx_set_front_mode.slider', function() {
            Slider.init();
        });
    }
});