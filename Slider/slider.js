function Slider($node) {
    var bl = 'floxim--ui--slider--slider';
    var Slider = this;
    
    $node.data('slider', this);

    this.update_slides = function() {
        this.$slides = $node.find('.'+bl+'__slide').filter(function() {
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
    
    this.init = function() {
        this.loop = false;
        this.$container = $node.find('.'+bl+'__slides');
        this.$node = $node;
        this.update_slides();
        this.$slides.each(function(index) {
            $(this).data('original_index', index);
        });
        this.init_arrows();
        this.init_nav();
        this.autoplay = $node.data('autoplay');
        this.pause_time = $node.data('pause_time') || 3000;
        this.duration = $node.data('move_time') || 1300;
        
        if (this.autoplay) {
            this.auto_move();
        }
    };
    
    this.init_arrows = function() {
        var $arrows = $('.'+bl+'__arrow', this.$node);
        if (this.$slides.length < 2) {
            $arrows.hide();
        }
        $arrows
            .show()
            .off('.slider')
            .on('click.slider', function() {
                var $arrow = $(this),
                class_disabled = bl+'__arrow_disabled';
                if ($arrow.hasClass(class_disabled)) {
                    return;
                }
                var dir = $arrow.data('dir');
                $arrow.addClass(class_disabled);
                Slider.move(dir);
                // prevent double-click
                setTimeout(function() {
                    $arrow.removeClass(class_disabled);
                }, 400);
            });
    };
    
    this.update_current_target = function() {
        var delta = 0,
            $target;
        for (var i = 0; i < this.move_stack.length; i++) {
            var cs = this.move_stack[i];
            delta += cs.dir === 'back' ? -1 : 1;
            if (cs.dir === 'back' && cs.flipped) {
                delta += 1;
            }
        }
        if (delta < 0) {
            $target = this.$slides.eq( this.$slides.length + delta);
        } else {
            $target = this.$slides.eq(delta);
        }
        
        var $c_point = $target.data('point');
        if ($c_point) {
            this.$points.filter('.'+bl+'__point_active').removeClass(bl+'__point_active');
            $target.data('point').addClass(bl+'__point_active');
        }
    };
    
    this.paused = false;
    
    this.pause = function() {
        this.stop();
        clearTimeout(this.automove_timeout);
        this.paused = true;
    };
    
    this.play = function() {
        this.paused = false;
        this.next_move();
    };
    
    this.init_nav = function() {
        var $points =  $('.'+bl+'__point', this.$node);
        this.$points = $points;
        $points.each(function(index) {
            var $point = $(this),
                $slide = Slider.$slides.eq(index);
            $point.data('slide', $slide);
            $slide.data('point', $point);
            if (index === 0) {
                $point.addClass('slider__point_active');
            }
        });
        this.$node
            .off('click.slider_points')
            .on('click.slider_points', '.'+bl+'__point', function() {
                var $point = $(this),
                    $slide = $point.data('slide');
                Slider.move_to($slide);
            });
    };
    
    this.move_to = function($slide, callback) {
        var target_index = this.$slides.index( $slide ),
            c_step = this.get_current_step(),
            current_index = 0,
            len = this.$slides.length;
    
        var $current_slide = this.$slides.eq(current_index),
            
            dir = 'next';
        
        if (c_step) {
            if (c_step.dir === 'next') {
                if (target_index === 0) {
                    target_index = len - 1;
                } else {
                    target_index -= 1;
                }
            }
        }
        
        this.move_stack = c_step ? [c_step] : [];
        
        if (target_index === len / 2) {
            dir = $current_slide.data('original_index') > $slide.data('original_index') ? 'back' : 'next';
        } else if (target_index > len / 2) {
            var current_index = current_index + len;
            dir = 'back';
        }
        var count = Math.abs(target_index - current_index);
        
        callback = typeof callback === 'function' ? callback : function() {};
        
        if (count === 0) {
            if (c_step) {
                c_step.callback = callback;
            } else {
                callback();
            }
        } else {
            for (var i = 0; i < count; i++) {
                this.move(dir, i === count - 1 ? callback : null);
            }
        }
        this.update_current_target();
    };

    this.move_stack = [];

    this.get_current_step = function() {
        if (this.move_stack.length > 0) {
            return this.move_stack[0];
        }
    };

    this.push_step = function(step) {
        this.move_stack.push(step);
        this.recount_speed();
    };

    this.pop_step = function(){
        this.move_stack.pop();
        this.recount_speed();
    };

    this.shift_step = function() {
        var res = this.move_stack.shift();
        return res;
    };

    this.recount_speed = function() {
        var len = this.move_stack.length;
        for (var i = 0; i < len; i++) {
            var cs = this.move_stack[i];
            cs.multiplier = len;
        }
    };
    
    this.automove_timeout = null;
    this.auto_move = function() {
        clearTimeout(this.automove_timeout);
        this.automove_timeout = setTimeout(
            function() {
                Slider.move('next');
            }, 
            Slider.pause_time
        );
    };

    this.move = function(dir, callback) {

        if (this.move_stack.length > 1) {
            var last_dir = this.move_stack[ this.move_stack.length - 1 ].dir;
            if (dir !== last_dir) {
                this.pop_step();
                this.update_current_target();
                return;
            }
        }

        var new_step = {
            dir:dir,
            callback: callback,
            multiplier: 1
        };

        var current_step = this.get_current_step();
        if (current_step) {
            this.stop();
            if (this.move_stack.length === 1 && current_step.dir !== dir) {
                this.shift_step();
                if (dir === 'back') {
                    new_step.flipped = true;
                }
            }
        }

        this.push_step(new_step);

        this.update_current_target();
        
        ///if (!current_step) {
        this.next_move();
        //}
    };

    this.stop = function() {
        this.$container.stop();
    };

    this.next_move = function() {
        if (this.paused) {
            return;
        }
        var step = this.get_current_step();
        if (!step) {
            this.stop();
            if (this.autoplay) {
                this.auto_move();
            }
            return;
        }
        clearTimeout(this.automove_timeout);
        this.move_step(step);
    };

    this.flip = function(step) {
        if (step.flipped) {
            return;
        }
        var dir = step.dir;
            
        
        if (dir === 'next') {
            var $moved_slide = Slider.$slides.first(),
                moved_left = $moved_slide[0].getBoundingClientRect().left,
                $next_slide = $moved_slide.next(),
                next_left = $next_slide[0].getBoundingClientRect().left,
                delta = next_left - moved_left;
            
            Slider.$container.append( $moved_slide );
            Slider.$container.css('left', '+=' + delta);
        } else {
            var $moved_slide = Slider.$slides.last(),
                moved_left = $moved_slide[0].getBoundingClientRect().left,
                $prev_slide = $moved_slide.prev(),
                prev_left = $prev_slide[0].getBoundingClientRect().left,
                delta = moved_left - prev_left;
            Slider.$slides.first().before($moved_slide); 
            Slider.$container.css('left', '-='+ delta );
        }
        Slider.update_slides();
        step.flipped = true;
    };

    this.move_step = function(step) {
        var dir = step.dir;

        if (dir === 'back') {
            this.flip(step);
        }

        var $target_slide = this.$slides.eq(dir === 'next' ? 1 : 0);
        if ($target_slide.length === 0) {
            return;
        }

        var container_left = Slider.$container[0].getBoundingClientRect().left,
            target_left = $target_slide[0].getBoundingClientRect().left,
            new_left = (target_left - container_left) * -1;

        step.start = parseInt(this.$container.css('left'));
        step.end = new_left;

        var delta = Math.abs( step.start - step.end ),
            duration = (this.duration / 1000) * delta / step.multiplier;

        step.complete = function() {
            var callbacks = step.callback;
            if (! (callbacks instanceof Array ) ) {
                callbacks = [callbacks];
            }
            for (var i = 0; i< callbacks.length; i++) {
                var cb = callbacks[i];
                if (typeof cb === 'function') {
                    cb();
                }
            }
            if (dir === 'next') {
                Slider.flip(step);
            }
            Slider.shift_step();
            Slider.stop();
            Slider.next_move();
            Slider.$container.removeClass('fx_is_moving');
        };

        var easing = Slider.move_stack.length > 0 ? 'linear' : 'swing';

        Slider.$container.addClass('fx_is_moving');
        
        Slider.$container.animate({
            left: step.end
        }, {
            duration:duration,
            easing: easing,
            progress: function(prop, progress, value) {
                step.progress = progress;
                step.value = value;
            },
            complete: step.complete
        });
    };
    
    this.init();
}


Floxim.handle('.floxim--ui--slider--slider', function() {
    var bl = 'floxim--ui--slider--slider';
    var $slider = $(this);
    var slider = new Slider($slider);
    
    $slider.on('fx_select.slider', '.'+bl+'__slide', function(e) {
        if (slider.is_moving_to_placeholder) {
            return;
        }
        slider.move_to( $(this) , function() {
            slider.pause();
        });
    })
    .on('fx_deselect.slider', '.'+bl+'__slide', function(e) {
        slider.play();
        if (slider.autoplay) {
            slider.auto_move();
        }
    })
    .on('fx_after_show_adder_placeholder', function(e) {
        var $new_slide = $(e.target);
        if (!$new_slide.is('.'+bl+'__slide')) {
            return;
        }
        slider.update_slides();
        slider.is_moving_to_placeholder = true;
        slider.move_to($new_slide, function() {
            slider.pause();
            slider.is_moving_to_placeholder = false;
        });
    })
    .on('fx_after_hide_adder_placeholder', function(e) {
        slider.update_slides();
        slider.update_current_target();
        slider.play();
    });
});