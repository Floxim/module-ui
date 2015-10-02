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
        this.min_height = 200;
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
            if (this.$imgs.length === 0) {
                return;
            }
            // default height
            var res_height = Slider.height;
            this.$imgs.each(function() {
                if (this.complete) {
                    var pic_height = $(this).height();
                    res_height = res_height === null ? pic_height : Math.min(res_height, pic_height);
                }
            });
            
            //if (res_height !== Slider.height) {
            if (res_height > Slider.min_height) {
                Slider.height = res_height;
                Slider.$node.css('height', res_height);
                Slider.$slides.css('height', res_height);
            }
            //}
        };
        
        this.init = function() {
            this.getSlides();
            //this.$current = this.$slides.first();
            this.setCurrent( this.$slides.first() );
            this.$arrows = $node.elem('arrow');
            
            if (this.$slides.length < 2) {
                this.$arrows.hide();
            }
            
            if (this.$slides.length === 0) {
                return;
            }
            
            this.$imgs = this.$slides.ctx('slide').elem('image-img');

            this.$imgs.on('load', function() {
                Slider.recountHeight();
            });
            
            this.$container.css('width', 1);
            
            this.$node.css({width:'auto',height:'auto'});
            this.width = $node.parent().width();
            
            //this.height = parseInt($node.css('height')) || parseInt($node.css('max-height')) || 300;
            this.height = parseInt($node.css('max-height')) || null;
            this.$slides.css('width', this.width);
            this.$node.css({
                width:this.width
            });
            
            this.recountHeight();
            this.$container.css('width', this.width * this.$slides.length*2);
            
            if (this.$slides.length < 2) {
                return;
            }
            
            this.$arrows.show().off('click').on('click', function() {
                var dir = $(this).data('dir');
                Slider.stop();
                Slider.move(dir);
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
        
        this.setCurrent = function($slide) {
            this.$current = $slide;
            /*
            if (!$slider.is('.slider_reviews')) {
                //console.trace();
                console.log('Current: '+$slide.ctx('slide').elem('title').text());
            }
            */
        };
        
        this.is_moving = false;
        this.move = function(dir, speed, callback) {
            if (Slider.$slides.length === 0) {
                return;
            }
            var duration = Slider.duration,
                easing = 'swing';
            
            if (typeof speed === 'number') {
                duration = speed;
            } else if (speed) {
                if (speed.duration) {
                    duration = speed.duration;
                }
                if (speed.easing) {
                    easing = speed.easing;
                }
            }
            
            dir = dir && /^(next|back)$/.test(dir) ? dir : 'next';
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
                Slider.setCurrent(Slider.$slides.eq(1));
            } else {
                Slider.setCurrent(Slider.$slides.first());
            }
            
            this.$container.addClass('fx_is_moving').animate({
                left: new_left
            }, {
                duration:duration,
                easing:easing,
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
        var t_speed = 200;
        this.moveTo = function($slide, callback_final) {
            var $slides = this.getSlides();
            if (typeof $slide === 'number') {
                $slide = $slides.eq($slide);
            }
            if (!$slide.is($slides)) {
                return;
            }
            if ($slides.length === 0) {
                return;
            }
            
            var dir = $slides.index($slide) / $slides.length < 0.5 ? 'next' : 'back';
            
            this.stop();
            function callback_move() {
                if (Slider.$current[0] === $slide[0]) {
                    Slider.$container.animate({
                        left:0
                    }, t_speed);
                    if (callback_final) {
                        callback_final();
                    }
                    return;
                }
                Slider.move(dir, {duration:t_speed, easing:'linear'}, callback_move);
            };
            callback_move();
        };
        
        var ok = 0;
        
        this.setInitialOrder = function() {
            while (this.$slides[0] !== this.$real_first[0] && ok < 100) {
                ok++;
                this.$slides.last().after(this.$slides.first());
                this.getSlides();
                console.log('doo');
            }
        };
        
        $(window).resize(function(e) {
            if (e.target !== window) {
                return;
            }
            Slider.init();
        });
        
        this.init();
        
        this.$real_first = this.$slides.first();
        
        this.$node
            .off('.slider')
            .on('fx_after_show_adder_placeholder.slider', function(e) {
                Slider.init();
                Slider.is_moving_to_placeholder = true;
                Slider.moveTo($(e.target), function() {
                    Slider.is_moving_to_placeholder = false;
                });
            })
            .on('fx_select.slider', '.slide', function(e) {
                if (Slider.is_moving_to_placeholder) {
                    return;
                }
                Slider.moveTo( $(this) );
            })
            .on('fx_deselect.slider', '.slide', function(e) {
                if (Slider.autoplay) {
                    Slider.autoMove(Slider.pause_time);
                }
            })
            .on('fx_start_sorting', function() {
                console.log('statso');
                Slider.setInitialOrder();
                var slide_width = $slider.parent().width() / Slider.$slides.length;
                Slider.$slides.css({
                    width:slide_width,
                    height:''
                }).addClass('slide_is-sorted');
                $slider.addClass('slider_is-sorted');
            })
            .on('fx_stop_sorting', function() {
                Slider.init();
                Slider.$slides.removeClass('slide_is-sorted');
                $slider.removeClass('slider_is-sorted');
                $fx.front.deselect_item();
            });
        $('html').off('.slider').on('fx_set_front_mode.slider', function() {
            Slider.init();
        });
    }
});