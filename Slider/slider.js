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
        this.duration = $node.data('move_time') || 1300;
        this.offset = $node.data('slide_offset') || 0;
        this.recount_height = $node.data('slide_height') === 'auto' ? false : true;
        this.width_multiplier = $node.data('slide_width') || 1;
        
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
        
        this.logSlides = function(marker){
            var res = [],
                curr = this.$current[0];
            this.$slides.each(function(){
                var t = $(this).ctx('slide').elem('title').text();
                if (this === curr) {
                    t = '>> '+t;
                }
                res.push(t);
            });
            if (marker) {
                console.log(marker, res);
            } else {
                return res;
            }
        };
        
        this.recountHeight = function () {
            if (!this.recount_height) {
                return;
            }
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
        
        this.getSlideWidth = function() {
            return Math.round(this.width * this.width_multiplier);
        };
        
        this.getDefaultLeft = function() {
            return Math.round(this.getSlideWidth() * this.offset / 2);
        };
        
        this.init = function() {
            this.getSlides();
            
            if (!this.$current) {
                this.setCurrent( this.$slides.first() );
            }
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
            this.$slides.each(function() {
                var $slide = $(this);
                $slide.css('width', Slider.getSlideWidth($slide));
            });
            
            //debugger;
            //this.$slides.css('width', this.width);
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
            this.$slides.removeClass('slide_current');
            $slide.addClass('slide_current');
            //console.log('Curr:' + $slide.ctx('slide').elem('title').text(), this.logSlides());
        };
        
        this.getCurrentOffset = function() {
            return this.$slides.index(this.$current);
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
            var default_left = Slider.getDefaultLeft(),
                c_left = parseInt(Slider.$container.css('left')) + default_left,
                new_left,
                delta = this.getSlideWidth();
            
            if (dir === 'back') {
                new_left = '+=' + (delta - c_left);
                Slider.$slides.first().before(Slider.$slides.last()); 
                Slider.$container.css('left', '-='+delta);
                Slider.getSlides();
            } else {
                new_left = '-=' + (delta + c_left);
            }
                        
            this.is_moving = true;
            
            var c_offset = Slider.getCurrentOffset();
            //Slider.logSlides();
            if (dir === 'next') {
                Slider.setCurrent(Slider.$slides.eq( c_offset + 1));
            } else {
                Slider.setCurrent(Slider.$slides.eq( c_offset - 1 ));
            }
            
            this.$container.addClass('fx_is_moving').animate({
                left: new_left
            }, {
                duration:duration,
                easing:easing,
                complete:function() {
                    if (dir === 'next') {
                        Slider.$container.append( Slider.$slides.first() );
                        Slider.$container.css('left', Slider.getDefaultLeft()*-1);
                        Slider.getSlides();
                    }
                    //Slider.setCurrent(Slider.$slides.eq(Slider.offset));
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
        var t_speed = 1200;
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
            
            var c_index = $slides.index(Slider.$current),
                target_index = $slides.index($slide),
                dir;
            
            if (c_index > target_index) {
                dir = 'back';
            } else {
                dir =  target_index / $slides.length < 0.5 ? 'next' : 'back';
            }
            
            //this.logSlides();
            //console.log($slides.index($slide), $slides.length, dir);
            
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
        
        for (var i = 0; i < this.offset; i++) {
            this.$slides.first().before(this.$slides.last()); 
        }
        this.getSlides();
        this.$container.css('left', '-'+this.getDefaultLeft()+'px');
        
        this.$node
            .off('.slider')
            .on('fx_after_show_adder_placeholder.slider', function(e) {
                var prev_offset = Slider.getCurrentOffset(),
                    $prev_current = Slider.$current,
                    $placeholder = $(e.target);
                    
                Slider.init();
                //Slider.logSlides();
                
                var new_offset = Slider.getCurrentOffset();
                
                // placeholder added before current slide
                var placeholder_pos = prev_offset < new_offset ? 'before' : 'after';
                if (placeholder_pos === 'before') {
                    Slider.setCurrent($placeholder);
                } else {
                    Slider.is_moving_to_placeholder = true;
                    Slider.moveTo($placeholder, function() {
                        Slider.is_moving_to_placeholder = false;
                    });
                }
                $placeholder.off('.slider').on('fx_after_hide_adder_placeholder.slider', function(e) {
                    if (placeholder_pos === 'before') {
                        Slider.setCurrent($prev_current);
                        Slider.getSlides();
                        //Slider.logSlides();
                    } else {
                        setTimeout(
                            function() {
                                var $c_slides = Slider.getSlides();
                                Slider.setCurrent($c_slides.first());
                                //Slider.logSlides('before back');
                                Slider.is_moving_to_placeholder = true;
                                Slider.moveTo($prev_current, function() {
                                    Slider.is_moving_to_placeholder = false;
                                });
                            },
                            100
                        );
                    }
                });
            })
            .on('fx_select.slider', '.slide', function(e) {
                return;
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