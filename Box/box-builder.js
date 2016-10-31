(function() {

var cl = 'floxim-ui-box-builder';

$t.add(
    'input',
    function(_c, _o) {
        return  '<div class="'+cl+'">'+
                    '<input type="hidden" data-json-val="true" class="'+cl+'__value" name="'+ _c.name+'" />'+
                    '<div class="'+cl+'__canvas"></div>'+
                    '<div class="'+cl+'__adder">+</div>'+
                    '<div class="'+cl+'__avail"></div>'+
                '</div>';
    },
    function(_c) {
        return _c.type === 'fx-box-builder';
    },
    1,
    function($node, params) {
        new box_builder($node, params);
    }
);

function box_builder($node, params) {
    
    var that = this;
    
    this.$node = $node;
    this.params = params;
    
    $node.data('box-builder', this);
    
    this.drawGroup = function(group, index) {
        var $group = $('<div class="'+cl+'__group"></div>');
        if (index !== undefined) {
            $group.attr('data-index', index);
        } else {
            $group.addClass(cl+'__group_empty')
        }
        if (group.fields) {
            for (var i = 0; i < group.fields.length; i++) {
                this.drawField(group.fields[i], $group, index + '-' + i);
            }
        }
        var group_data = {};
        $.each(group, function(k, v) {
            if (k !== 'fields') {
                group_data[k] = v;
            }
        });
        $group.data('vals', group_data);
        this.$canvas.append($group);
        return $group;
    };
    
    this.drawField = function(field, $target, index) {
        var field_meta = this.fields_map[field.keyword] || {};
        if (!field_meta.name) {
            field_meta.name = field.keyword;
        }
        var $field = $(
            '<div class="'+cl+'__field">'+
                '<span class="'+cl+'__field-label">'+field_meta.name+'</span>'+
                '<span class="'+cl+'__field-kill"></span>'+
            '</div>'
        );
        if (index !== undefined) {
            $field.attr('data-index', index);
        }
        $field.data('vals', field);
        $target.append($field);
    };
    
    var active_empty_class = cl+'__group_empty-active';
    
    this.startDrag = function(e, ui) {
        var $empty_groups = that.$canvas.find('.'+cl+'__group_empty'),
            $c_group = ui.item.closest('.'+cl+'__group'),
            $empty_group = $([]);
        
        (closeAvail || function(){})();
        
        if ($c_group.length > 0) {
            var $group_fields = $c_group.find('.'+cl+'__field:not(.ui-sortable-placeholder)');
            if ($group_fields.length === 1) {
                $empty_group = $c_group;
            }
        }
        $empty_groups.each(function() {
            var $eg = $(this);
            if ($eg.next().is($empty_group) || $eg.prev().is($empty_group)) {
                return;
            }
            $eg.addClass(active_empty_class);
        });
    };
    
    this.stopDrag = function() {
        var empty_class = cl+'__group_empty';
        that.$canvas.find('.'+cl+'__group').each(function() {
            var $g = $(this);
            $g.removeClass(active_empty_class);
            $g.toggleClass(empty_class, $g.find('.'+cl+'__field').length === 0);
        });
        that.updateValue();
    };
    
    this.draw = function(value) {
        this.drawGroup({});
        
        this.$canvas.attr('data-index', 'root');
        
        var box_vals = {};
        $.each(value, function(i, v) {
            if (typeof params.params[i] !== 'undefined') {
                box_vals[i] = v;
            }
        });
        this.$canvas.data('vals', box_vals);
        
        if (!value.groups || !value.groups instanceof Array) {
            value.groups = [];
        }
        for (var i = 0; i < value.groups.length; i++) {
            this.drawGroup(value.groups[i], i);
            this.drawGroup({});
        }
        this.$node.find('.'+cl+'__group').sortable(
            {
                items:'>.'+cl+'__field',
                tolerance:'pointer',
                connectWith:'.'+cl+'__canvas .'+cl+'__group',
                start: that.startDrag,
                stop: that.stopDrag,
                scroll:false,
                appendTo: document.body
            }
        );
        $.each(this.params.params, function(path, data) {
            path = path.split('.');
            var base = path[0],
                index = path[1];
            
            if (base !== 'groups') {
                index = 'root';
            } else {
                if (path.length > 4) {
                    index += '-'+path[3];
                }
            }
            var param_name = path [ path.length - 1 ];
            
            var $el = that.$node.find('div[data-index="'+index+'"]'),
                el_params = $el.data('params');
                
            if (!el_params) {
                el_params = {};
            }
            el_params[param_name] = data;
            $el.data('params', el_params);
        });
    };
    
    this.updateValue = function() {
        var res = {
            is_stored:true,
            groups: []
        };
        res = $.extend(res, this.$canvas.data('vals'));
        
        this.$node.find('.'+cl+'__group').each(function() {
            var fields = [],
                $group = $(this);
            
            $group.find('.'+cl+'__field').each(function() {
                fields.push( $(this).data('vals') );
            });
            if (fields.length > 0) {
                var group_data = $group.data('vals');
                res.groups.push( $.extend(group_data, {
                    fields: fields
                }) );
            }
        });
        this.$input.val(JSON.stringify(res)).trigger('change');
    };
    
    this.showSettings = function($el) {
        var params = $el.data('params'),
            data = $el.data('vals'),
            index = $el.data('index'),
            $original_form = $el.closest('form');
    
        if (!params) {
            console.log('no params');
            return;
        }
        
        var fields = [];
        
        $.each(params, function(field_key, field) {
            field.name = field_key;
            fields.push(field);
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
                var c_name = that.params.name,
                    $inp = $original_form.find('[name="'+c_name+'"]'),
                    $builder = $inp.closest('.'+cl),
                    $el = $builder.find('[data-index="'+index+'"]'),
                    builder = $builder.data('box-builder'), 
                    new_data = $form.formToHash(
                        function(f) {
                            return f.name !== 'fx_form_target' && f.name !== 'pressed_button';
                        }
                    );
                
                data = $.extend($el.data('vals'), new_data);
                
                $el.data('vals', data);
                builder.updateValue();
            }
           
            $fx.front_panel.show_form(
                {
                    header: 
                        data && data.keyword ? 
                            'Настраиваем поле &laquo;'+data.keyword+'&raquo;' :
                            'Настраиваем строку №'+(index*1 + 1),
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
    
    
    var adder_active_class = cl+'__adder_active',
        closeAvail = null;
    
    function showAvail() {
        that.$adder.addClass(adder_active_class);
        that.$avail.addClass(cl+'__avail_active');
        var avail_box = that.$avail[0].getBoundingClientRect(),
            canvas_box = that.$canvas[0].getBoundingClientRect(),
            doc_box = document.body.getBoundingClientRect();
        that.$avail.css('left', canvas_box.right);
        if (doc_box.right - canvas_box.right < avail_box.width + 20) {
            that.$adder.css('right', canvas_box.width - 7);
            that.$avail.css('left', canvas_box.left - avail_box.width);
        } else {
            
        }
        closeAvail = $fx.close_stack.push(
            function() {
                hideAvail();
            },
            that.$avail
        );
    }
    
    function hideAvail() {
        that.$adder.removeClass(adder_active_class).css('right', '');
        that.$avail.removeClass(cl+'__avail_active').one('transitionend', function() {
            that.$avail.css('left');
        });
    }
    
    this.init = function () {
        this.$input = $node.find('.'+cl+'__value');
        this.$canvas = $node.find('.'+cl+'__canvas');
        this.$avail = $node.find('.'+cl+'__avail');
        
        this.$adder = $node.find('.'+cl+'__adder');
        
        this.$adder.click(function() {
            if (that.$adder.hasClass(adder_active_class)) {
                closeAvail();
            } else {
                showAvail();
            }
        });
        
        this.fields_map = {};
        
        for (var i = 0; i < this.params.avail.length; i++) {
            var cf = this.params.avail[i];
            
            this.fields_map[cf.keyword] = cf;
            
            this.drawField(cf, this.$avail);
        }
        
        this.draw(params.value);
        this.$input.val(JSON.stringify(this.params.value));
        
        this.$canvas
            .on('click', '.'+cl+'__field-kill', function() {
                $(this).parent().remove();
                that.updateValue();
                return false;
            })
            .on('click', '.'+cl+'__field, .'+cl+'__group', function(e) {
                that.showSettings($(this));
                e.stopImmediatePropagation();
                return false;
            });
        
        this.$avail.sortable({
            connectWith:'.'+cl+'__canvas .'+cl+'__group',
            start: that.startDrag,
            stop: that.stopDrag,
            appendTo: '.fx_admin_form__body',
            helper: 'clone',
            scroll:false
        });
        
        this.$avail.on('click', '.'+cl+'__field', function() {
            var $target_group = that.$canvas.find('>.'+cl+'__group').last(),
                $field = $(this),
                empty_class = cl+'__group_empty';
            $target_group.append($field);
            
            $target_group.removeClass(empty_class);
            closeAvail();
            that.updateValue();
            return false;
        });
        setTimeout(function() {
            $node.closest('.field').find('label').on('click', function() {
                that.showSettings(that.$canvas);
            });
        }, 200);
    };
    
    this.init();
}

})();