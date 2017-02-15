(function() {

var cl = 'floxim-ui-box-builder';

$t.add(
    'input',
    function(_c, _o) {
        return  '<div class="'+cl+'">'+
                    '<input type="hidden" data-json-val="true" class="'+cl+'__value" name="'+ _c.name+'" />'+
                    '<div class="'+cl+'__canvas"></div>'+
                    '<div class="'+cl+'__box-config"></div>'+
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
    
    if (!params.base_path) {
        params.base_path = [
            $fx_fields.name_to_path(params.name).slice(1)
        ];
    }
    
    this.params = params;
    
    $node.data('box-builder', this);
    
    this.drawGroup = function(group, $target, path, replace) {
        
        
        var $group = replace ? $target : $('<div class="'+cl+'__group"></div>');
        
        if (replace) {
            $group.html('');
        }
        
        var group_is_empty = group.is_empty === true; //!path && !replace;
        
        if (path !== undefined) {
            $group.attr('data-path', path);
        } 
        
        if (group.is_single) {
            $group.addClass(cl+'__group_single');
        } else if (group_is_empty) {
            $group.addClass(cl+'__group_empty');
        }
        
        
        if (group.type === 'columns') {
            group.tip_label = 'колонки';
            
            $group.addClass(cl+'__cols');
            
            for (var i = 0; i < group.columns.length; i++) {
                var c_col = group.columns[i];
                if (!c_col.groups) {
                    c_col.groups = [];
                }
                this.drawColumn(c_col, $group, path+'.columns.'+i);
            }
        } else if (group.type === 'image') {
            group.tip_label = 'изображение';
            $group.addClass(cl+'__image').removeClass(cl+'__group');
            var has_groups = !!(group.groups && group.groups.length > 0);
            
            this.drawGroup(
                {
                    is_empty: true,
                    is_single: !has_groups
                }, 
                $group
            );
            
            if (has_groups) {
                for (var i = 0; i < group.groups.length; i++) {
                    this.drawGroup(group.groups[i], $group, path+'.groups.'+i);
                    this.drawGroup({is_empty:true}, $group);
                }
            }
        }
        
        if (group.fields) {
            for (var i = 0; i < group.fields.length; i++) {
                var f = group.fields[i];
                this.drawField(f, $group, path + '.fields.' + i);
            }
        }
        if (path || replace) {
            var group_data = {};
            $.each(group, function(k, v) {
                if (k !== 'fields') {
                    group_data[k] = v;
                }
            });
            $group.data('vals', group_data);
        }
        if (!replace) {
            $target.append($group);
        }
        
        if (!group_is_empty) {
            var tip_label = group.tip_label || 'строку';
            var $settings = $(
                '<div class="'+cl+'__group-controls">'+
                    '<div class="'+cl+'__group-remove" title="Удалить '+tip_label+'">&times;</div>'+
                    '<div class="'+cl+'__group-settings" title="Настроить '+tip_label+'"></div>'+
                '</div>'
            );
            $group.append($settings);
        }
        
        return $group;
    };
    
    this.drawColumn = function(col, $target, path) {
        var $col = $('<div class="'+cl+'__col" data-path="'+path+'"></div>');
        $target.append($col);
        $col.data('vals', col);
        var has_groups = !!(col.groups && col.groups.length > 0);
        
        this.drawGroup(
            {
                is_empty: true,
                is_single: !has_groups
            }, 
            $col
        );
        
        if (has_groups) {
            for (var i = 0; i < col.groups.length; i++) {
                this.drawGroup(col.groups[i], $col, path+'.groups.'+i);
                this.drawGroup({is_empty:true}, $col);
            }
        }
        return $col;
    };
    
    this.drawField = function(field, $target, path) {
        var field_meta = this.fields_map[field.keyword],
            field_is_available = !!field_meta;
        
        if (!field_is_available) {
            field_meta = {
                name: field.name || field.keyword
            };
        }
        
        
        var $field = $(
            '<div class="'+cl+'__field">'+
                '<span class="'+cl+'__field-label" title="Настроить элемент">'+
                    field_meta.name+
                '</span>'+
                (
                    field_is_available ? '' : 
                    '<span class="'+cl+'__field-unavail-marker" title="Поле отсутствует у данных такого типа">!</span>'
                )+
                '<span class="'+cl+'__field-kill" title="Удалить элемент"></span>'+
            '</div>'
        );

        if (!field_is_available) {
            $field.addClass(cl+'__field_unavail');
            $field.find('.'+cl+'__field-label').attr('title', '');
        }
        

        if (path !== undefined) {
            $field.attr('data-path', path);
        }
        
        var stored_field = $.extend(true, {}, field);
        
        delete stored_field.templates;
        
        $field.data('vals', stored_field);
        $field.data('meta', field_meta);
        $target.append($field);
    };
    
    this.redrawColumns = function($el) {
        var vals = $el.data('vals'),
            path = $el.data('path'),
            $controls = $el.find('> .'+cl+'__group-controls');
    
        $el.html('');
        for (var i = 0; i < vals.columns.length; i++) {
            this.drawColumn(vals.columns[i], $el, path+'.columns.'+i);
        }
        $el.append($controls);
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
        
        var $field = that.$node.closest('.field');
        $field.css('height', $field.height());
        that.$node.css('position','fixed');
        
    };
    
    this.stopDrag = function(e, ui) {
        
        var $item = ui.item,
            vals = $item.data('vals'),
            $group = $item.closest('.'+cl+'__group');
        
        if (vals.is_group) {
            var group_is_not_empty = $group.find('> .'+cl+'__field').length > 1;
            if (group_is_not_empty) {
                if (vals.type !== 'image') {
                    return;
                }
            } else {
                that.drawGroup(vals, $group, null, true);
            }
        }
        
        var empty_class = cl+'__group_empty';
        that.$canvas.find('.'+cl+'__group').each(function() {
            var $g = $(this);
            $g.removeClass(active_empty_class);
            $g.toggleClass(empty_class, $g.find('.'+cl+'__field').length === 0);
        });
        
        that.updateValue();
    };
    
    this.draw = function(value) {
        
        if (!value.groups || !value.groups instanceof Array) {
            value.groups = [];
        }
        
        this.drawGroup({is_empty:value.groups.length > 0}, this.$canvas);
        
        this.$canvas.attr('data-path', '');
        
        var box_vals = {};
        $.each(value, function(i, v) {
            if (typeof params.params[i] !== 'undefined') {
                box_vals[i] = v;
            }
        });
        this.$canvas.data('vals', box_vals);
        
        
        for (var i = 0; i < value.groups.length; i++) {
            this.drawGroup(value.groups[i], this.$canvas, 'groups.'+i);
            this.drawGroup({is_empty:true}, this.$canvas);
        }
        this.$node.find('.'+cl+'__group:not(.'+cl+'__cols)').sortable(
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
    };
    
    this.updateValue = function() {
        var res = {
            is_stored:"1",
            groups: []
        };
        res = $.extend(res, this.$canvas.data('vals'));
        
        function get_container_groups($node) {
            var $children = $node.children(),
                res = [];
            $children.each(function() {
                var $c = $(this);
                var group_data = $c.data('vals') || {};
                
                if ($c.is('.'+cl+'__cols')) {
                    group_data.columns = get_columns($c);
                    res.push(group_data);
                } else if ($c.is('.'+cl+'__image')) {
                    group_data.groups = get_container_groups($c);
                    res.push(group_data);
                } else {
                    var fields = get_group_fields($c);
                    if (fields.length) {
                        group_data.fields = fields;
                        res.push(group_data);
                    }
                }
            });
            return res;
        }
        
        function get_group_fields($node) {
            var fields = [];
            $node.children().each(function() {
                var child_vals = $(this).data('vals');
                if (child_vals) {
                    fields.push(child_vals);
                }
            });
            return fields;
        }
        
        function get_columns($node) {
            var res = [];
            $node.children().each(function() {
                var $col = $(this),
                    col_vals = $col.data('vals') || {};
                col_vals.groups = get_container_groups($col);
                res.push(col_vals);
            });
            return res;
        }
        
        res.groups = get_container_groups(this.$canvas);
        
        var new_val = JSON.stringify(res),
            old_val = this.$input[0].value;
        
        if (old_val !== new_val) {
            this.$input.val(new_val).trigger('change');
        }
    };
    
    this.getParams = function(path) {
        if (typeof path ==='undefined') {
            console.log('undpath');
            console.trace();
        }
        var res = {},
            level = path === '' ? 0 : path.split('.').length;
        
        $.each(this.params.params, function(k, v) {
            var parts = k.split('.');
            if (parts.length !== level + 1) {
                return;
            }
            var base = parts.slice(0, level).join('.');
            if (base !== path)  {
                return;
            }
            res[ parts[ parts.length - 1] ] = v;
        });
        return res;
    };
    
    this.extractParams = function($ib, item_path) {
        var path = this.params.base_path.slice(),
            base = path.shift(),
            data_prop = base[0] === 'template_visual' ? 'fx_template_params' : 'fx_wrapper_params',
            ib_data = $ib.data(data_prop),
            data = null;
    
        for (var i = 0 ; i < ib_data.length; i++) {
            var c_param = ib_data[i];
            if (c_param[0] === base[1] && typeof c_param[1].params !== 'undefined') {
                data = c_param[1].params;
                break;
            }
        }
        
        if (!data) {
            console.log(path, base);
            throw new Error('no data');
        }
        
        while (path.length > 0) {
            var c_item = path.shift();
            data = data[c_item].params;
        }
        
        var res = {},
            path_length = item_path.length;
    
        $.each(data, function(k, v) {
            if (k.slice(0, path_length + 1) !== item_path+'.') {
                return;
            }
            var c_path = k.slice(path_length + 1);
            if (c_path.split('.').length > 1) {
                return;
            }
            res[ c_path ] = v;
        });
        
        return res;
    };
    
    this.paramsToFields = function(params, path) {
        var fields = [];
        
        $.each(params, function(field_key, field) {
            field.name = field_key;
            if (field.type === 'fx-box-builder') {
                field.base_path = that.params.base_path.slice();
                field.base_path.push(
                    path + '.' + field.name
                );
            }
            fields.push(field);
        });
        return new Promise(function(resolve) {
            $fx.front.prepare_infoblock_visual_fields([fields]).then(function(res) {
                fields = res[0];
                $.each(fields, function(i, field) {
                    if (field.names_updated) {
                        return;
                    }
                    if (field.type === 'group' && field.fields) {
                        for (var i = 0; i < field.fields.length; i++) {
                            var cf = field.fields[i];
                            cf.name = field.name+'['+cf.name+']';
                        }
                    }
                    field.names_updated = true;
                });
                resolve(fields);
            });
        });
    };
    
    this.showSettings = function($el) {
        var data = $el.data('vals'),
            path = $el.data('path'),
            params = this.getParams(path),
            meta = $el.data('meta') || {},
            $original_form = $el.closest('form'),
            $settings_form = null;
    
        
        function reload_handler(e) {
            var new_params = that.extractParams($(e.target), path);
            that.paramsToFields(new_params, path).then(function(fields) {
                $fx.form.update({fields: fields}, $settings_form);
            });
        };
        
        
        if (!params) {
            console.log('no params');
            return;
        }
        
        
        
        this.paramsToFields(params, path).then(function(fields) {
            
            
            function get_data($form) {
                return $form.formToHash(
                    function(f) {
                        return f.name !== 'fx_form_target' && f.name !== 'pressed_button';
                    }
                );
            }
            
            function update_data(new_data) {
                var c_name = that.params.name,
                    $inp = $original_form.find('[name="'+c_name+'"]'),
                    $builder = $inp.closest('.'+cl),
                    $el = $builder.find('[data-path="'+path+'"]'),
                    builder = $builder.data('box-builder'),
                    data = $el.data('vals');
            
                $.each(new_data, function(k, v) {
                    data[k] = v;
                });
                
                if ($el.is('.'+cl+'__cols')) {
                    that.redrawColumns($el);
                }
                
                $el.data('vals', data);
                builder.updateValue();
            }
            
            var initial_data = null;
            
            var header_name = 'строку';
            
            if (path === '') {
                header_name = 'контейнер';
            } else if (data && data.keyword && meta.name) {
                header_name = 'поле &laquo;'+(meta.name || data.keyword)+'&raquo;';
            } else if (data.type === 'columns') {
                header_name = 'колонки';
            }
            
            
            $fx.front_panel.show_form(
                {
                    header: 
                        'Настраиваем ' + header_name,
                    fields: fields,
                    form_buttons: ['cancel']
                },
                {
                    view:'horizontal',
                    onready: function($form) {
                        $settings_form = $form;
                        initial_data = get_data($form);
                        $form.on('change', function() {
                            update_data(get_data($form));
                        });
                        $('html').on('fx_infoblock_loaded', reload_handler);
                    },
                    onsubmit: function(e) {
                        update_data(get_data($(e.target)));
                        $fx.front_panel.hide();
                        $('html').off('fx_infoblock_loaded', reload_handler);
                        return false;
                    },
                    oncancel: function($form) {
                        var c_data = get_data($form);
                        if (JSON.stringify(c_data) !== JSON.stringify(initial_data)) {
                            update_data(initial_data);
                        }
                        $('html').off('fx_infoblock_loaded', reload_handler);
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
        that.$avail.css({
            left:canvas_box.right,
            display:'block'
        });
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
            that.$avail.css({
                left:'',
                display:'none'
            });
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
            .on('click', '.'+cl+'__field', function(e) {
                var $field = $(this);
                if (!$field.is('.'+cl+'__field_unavail')) {
                    that.showSettings($(this));
                }
                return false;
            })
            .on('click', '.'+cl+'__group-settings', function(e) {
                that.showSettings($(this).closest('.'+cl+'__group, .'+cl+'__image'));
                return false;
            })
            .on('click', '.'+cl+'__group-remove', function(e) {
                $(this).closest('.'+cl+'__group, .'+cl+'__image').remove();
                that.updateValue();
                return false;
            });
        
        this.$node.on('click', '.'+cl+'__box-config', function(e) {
            that.showSettings(that.$canvas);
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
        
        this.$avail.on('click', '.'+cl+'__field', function(e) {
            
            if (!that.$avail.hasClass(cl+'__avail_active')) {
                return;
            }
            
            var $field = $(this),
                empty_class = cl+'__group_empty',
                field_meta = $field.data('meta');
                
            var $target_group = that.$canvas.find('>.'+cl+'__group')[field_meta.position || 'last']();
                
            if (field_meta.is_group) {
                that.drawGroup($field.data('vals'), $target_group, null, true);
            } else {
                $target_group.append($field);
            }
            
            $target_group.removeClass(empty_class);
            if (typeof closeAvail === 'function') {
                closeAvail();
            }
            that.updateValue();
            return false;
        });
    };
    
    this.init();
}

})();