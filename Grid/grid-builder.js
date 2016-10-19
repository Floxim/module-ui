(function() {

var cl = 'floxim-ui-grid-builder';

$t.add(
    'input',
    function(_c, _o) {
        var input_val = (typeof _c.value === 'string') ? _c.value : JSON.stringify(_c.value);
        return  '<div class="'+cl+'">'+
                    '<input type="hidden" value=\''+input_val+'\' data-json-val="true" class="'+cl+'__value" name="'+ _c.name+'" />'+
                    '<div class="'+cl+'__canvas"></div>'+
                '</div>';
    },
    function(_c) {
        return _c.type === 'fx-grid-builder';
    },
    1,
    function($node, params) {
        new grid_builder($node, params);
    }
);

function grid_builder($node, params) {
    
    this.params = params;
    
    this.$node = $node;
    
    this.$node.data('grid-builder', this);
    
    var that = this;
    
    var width = 360;
    
    var width_rex = new RegExp(cl+'__col_width_(\-?\\d+)');
    
    function setColWidth($col, width) {
        var c = $col.attr('class');
        c = c.replace(width_rex, cl+'__col_width_'+width);
        $col.attr('class', c);
        
        var vals = $col.data('vals');
        vals.width = width;
        $col.data('vals', vals);
        
        $col.find('.'+cl+'__col-width').text(width);
    }
    
    function addColWidth($col, delta) {
        var cw = getColWidth($col);
        setColWidth($col, cw + delta);
    }
    
    function getColWidth($col) {
        try {
            return $col.attr('class').match(width_rex)[1]*1;
        } catch (e) {
            console.log(e, $col);
        }
    }
    
    this.drawCol = function(col, index) {
        if (!col.id) {
            col.id = $fx.uid();
        }
        if (!col.name) {
            col.name = this.getFreeName();
        }
        
        if (!col.width) {
            col.width = 2;
        }
        
        var $col = $(
            '<div '+
                'class="'+cl+'__col '+cl+'__col_width_'+col.width+'" '+
                'data-name="'+col.name+'" data-index="'+index+'">'+
                '<span class="'+cl+'__col-title">'+col.name+'</span>'+
                '<span class="'+cl+'__col-width">'+col.width+'</span>'+
                '<span class="'+cl+'__col-killer">&times;</span>'+
            '</div>'
        );
        $col.data('vals', col);
        
        return $col;
    };
    
    this.getFreeName = function() {
        var letters = ['a','b','c','d','e','f','g','h'];
        for (var i = 0; i < letters.length; i++) {
            var l = letters[i].toUpperCase(),
                $col = this.$canvas.find('div[data-name="'+l+'"]');
            if ( $col.length === 0 ) {
                return l;
            }
        }
    };
    
    this.draw = function() {
        $fx.disableSelection(this.$canvas);
        for (var i = 0; i < this.params.value.cols.length; i++) {
            var col = this.params.value.cols[i],
                $col = this.drawCol(col, i);
            this.$canvas.append($col);
        }
        
        var $adder = $('<div class="'+cl+'__adder">+</div>');
        
        $adder.click(function() {
            if (that.$canvas.hasClass(cl+'__canvas_no-add')) {
                return false;
            }
            that.addCol();
        });
        
        this.$canvas.append($adder);
        
        this.$canvas.sortable({
            axis:'x',
            items:'>.'+cl+'__col',
            stop:function() {
                that.update();
            }
        });
        
        this.$canvas.on('click', '.'+cl+'__col-killer', function() {
            if (that.$canvas.hasClass(cl+'__canvas_no-kill')) {
                return false;
            }
            var $col = $(this).closest('.'+cl+'__col');
            that.removeCol($col);
            return false;
        }).on('click', '.'+cl+'__col', function() {
            that.showSettings($(this));
        });
        
        $.each(this.params.params, function(path, data) {
            path = path.split('.');
            var index = path[1],
                prop = path[path.length - 1];
                
            var $el = that.$canvas.find('div[data-index="'+index+'"]'),
                el_params = $el.data('params') || {};
                
            el_params[prop] = data;
            $el.data('params', el_params);
        });
    };
    
    this.getCols = function() {
        var $cols = this.$canvas.find('.'+cl+'__col').not('.'+cl+'__col_removed');
        return $cols;
    };
    
    this.addCol = function() {
        var $cols = that.getCols(),
            index = $cols.length,
            c_width = null,
            eq_width = index < 4, // first 4 items
            col_width = 2;
    
        if (eq_width) {
            $.each($cols, function() {
                var col_width = getColWidth($(this));
                if (c_width === null) {
                    c_width = col_width;
                    return;
                }
                if (col_width !== c_width) {
                    eq_width = false;
                    return false;
                }
            });
        }
        if (eq_width) {
            col_width = 12 / ($cols.length + 1);
            
            $cols.each(function() {
                setColWidth( $(this), col_width );
            });
        } else {
            var left = col_width,
                c_index = index - 1;
            while (c_index >= 0 && left > 0) {
                var $neighbour = $cols.eq(c_index),
                    n_width = getColWidth($neighbour),
                    can_be_eaten = Math.min(n_width - 2, left);
                if (can_be_eaten > 0) {
                    setColWidth($neighbour, n_width - can_be_eaten);
                    left -= can_be_eaten;
                }
                c_index--;
            }
            
        }
            
        
        var $new_col = that.drawCol(
            {
                width:col_width
            }, 
            index
        );

        $cols.last().after($new_col);
        $cols.one('transitionend webkitTransitionEnd oTransitionEnd', function() {
            that.update();
        });
    };

    this.removeCol = function($col) {
        var $cols = that.getCols(),
            c_width = getColWidth($col),
            c_index = $col.data('index')*1;

        var $neighbours = $cols
                .filter('*[data-index="'+(c_index-1)+'"], *[data-index="'+(c_index+1)+'"]')

        if ($neighbours.length > 1) {
            var width_a = getColWidth($neighbours.eq(0)),
                width_b = getColWidth($neighbours.eq(1));
            if (width_a > width_b) {
                $neighbours = $neighbours.eq(0);
            } else if (width_a < width_b) {
                $neighbours = $neighbours.eq(1);
            }
        }

        if ($neighbours.length === 1) {
            addColWidth(
                $neighbours, 
                c_width
            );
        } else {
            var $n1 = $neighbours.eq(0),
                $n2 = $neighbours.eq(1);
            addColWidth($n1, Math.floor(c_width/2));
            addColWidth($n2, Math.ceil(c_width/2));
        }
        
        $col.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
            $col.remove();
            that.update();
        });
        
        $col.addClass(cl+'__col_removed');
    };
    
    this.showSettings = function($el) {
        if (!$fx.front) {
            return false;
        }
        var params = $el.data('params'),
            data = $el.data('vals'),
            index = $el.data('index');
    
        if (!params) {
            console.log('no params');
            return;
        }
        
        var fields = [];
        
        $.each(params, function(field_key, field) {
            field.name = field_key;
            fields.push( $.extend(true, {}, field) );
        });
        
        
        $fx.front.prepare_infoblock_visual_fields([fields]).then(function(res) {
            fields = res[0];
            $.each(fields, function(index, field) {
                 if (field.type === 'group' && field.fields) {
                     for (var i = 0; i < field.fields.length; i++) {
                         var cf = field.fields[i];
                         cf.name = field.name+'['+cf.name+']';
                     }
                 }
            });
            
            function update_data($form) {
                var $el = $('div[data-index="'+index+'"]'),
                    $builder  = $el.closest('.'+cl),
                    builder = $builder.data('grid-builder'), 
                    new_data = $form.formToHash(
                        function(f) {
                            return f.name !== 'fx_form_target' && f.name !== 'pressed_button';
                        }
                    );
                
                data = $.extend($el.data('vals'), new_data);
                
                $el.data('vals', data);
                builder.update();
            }
            
            $fx.front_panel.show_form(
                {
                    header: 'Настраиваем колонку &laquo;'+data.name+'&raquo;',
                    fields: fields,
                    form_buttons: ['cancel']
                },
                {
                    view:'horizontal',
                    onready: function($form) {
                        $form.on('change', function() {
                            update_data($form);
                        });
                    },
                    onsubmit: function(e) {
                        update_data($(e.target));
                        $fx.front_panel.hide();
                        return false;
                    }
                }
            );
        });
    };
    
    this.updateState = function() {
        var add_class = cl+'__canvas_no-add',
            kill_class = cl+'__canvas_no-kill';
        
        var $cols = this.getCols();
        
        $.each($cols, function(index) {
            $(this).attr('data-index', index).data('index', index);
        });
        
        this.$canvas.removeClass(add_class+' '+kill_class);
        if ($cols.length > 5) {
            this.$canvas.addClass(add_class);
        } else if ($cols.length < 2) {
            this.$canvas.addClass(kill_class);
        }
    };
    
    this.update = function() {
        
        this.updateState();
        var $cols = this.getCols();
        
        var res = {
            is_stored:true,
            cols: []
        };
        $cols.each(function() {
            res.cols.push ($(this).data('vals'));
        });
        this.$input.val(JSON.stringify(res)).trigger('change');
        this.addDraggers();
    };
    
    var $body = $('body');
    
    this.addDraggers = function() {
        var $cols = this.getCols();
        this.$canvas.find('.'+cl+'__col-drag').remove();
        $cols.each(function(index) {
            if (index === $cols.length - 1) {
                return;
            }
            var col = this,
                canvas = that.$canvas[0],
                $col = $(this),
                $next_col = $cols.filter('*[data-index="'+(index+1)+'"]'),
                $drag,
                c_width = getColWidth($col);
                
            function fix_drag() {
                var col_box = col.getBoundingClientRect(),
                    canvas_box = canvas.getBoundingClientRect();
                $drag.css('left', col_box.right - canvas_box.left + 1);
            }
                
            
            $drag = $('<span class="'+cl+'__col-drag"></span>');
            $col.data('dragger', $drag);
            $col.after($drag);
            $drag.on('mousedown', function(e) {
                var mdx = e.pageX,
                    canvas_box = canvas.getBoundingClientRect(),
                    drag_box = this.getBoundingClientRect(),
                    left = drag_box.left - canvas_box.left + 3,
                    col_left = col.getBoundingClientRect().left;

                fix_drag();
                
                that.$canvas.addClass(cl+'__canvas_dragging');

                var move = function(e) {
                    var x = e.pageX,
                        diff = mdx - x,
                        new_left = left - diff;

                    $drag.css('left', new_left);
                    var col_diff = x - col_left,
                        new_width = Math.ceil(12 / (width / col_diff)),
                        width_diff = c_width - new_width;
                    
                    if (width_diff !== 0 && new_width >= 1) {
                        var next_width = getColWidth($next_col) + width_diff;
                        if (next_width >= 1) {
                            setColWidth($col, new_width);
                            setColWidth($next_col, next_width);
                            c_width = new_width;
                        }
                    }
                    return false;
                };

                $body.on('mousemove', move);

                $body.one('mouseup', function() {
                    $body.off('mousemove', move);
                    that.$canvas.removeClass(cl+'__canvas_dragging');
                    that.update();
                });
            });
            
            fix_drag();
        });
    };
    
    this.init = function() {
        this.$input = this.$node.find('.'+cl+'__value');
        this.$canvas = this.$node.find('.'+cl+'__canvas');
        this.draw();
        this.updateState();
        this.$canvas.one('mouseover', function() {
            that.addDraggers();
        });
    };
    
    that.init();
}

})();