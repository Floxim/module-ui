(function() {

var cl = 'floxim-ui-box-builder';

$t.add(
    'input',
    function(_c, _o) {
        return  '<div class="'+cl+'">'+
                    '<input type="text" class="'+cl+'__value" name="'+ _c.name+'" />'+
                    '<div class="'+cl+'__canvas"></div>'+
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
    
    this.drawGroup = function(group) {
        var $group = $('<div class="'+cl+'__group"></div>');
        if (group.fields) {
            for (var i = 0; i < group.fields.length; i++) {
                this.drawField(group.fields[i], $group);
            }
        }
        this.$canvas.append($group);
    };
    
    this.drawField = function(field, $target) {
        var $field = $(
            '<div class="'+cl+'__field">'+
                '<span class="'+cl+'__field-label">'+field.keyword+'</span>'+
                '<span class="'+cl+'__field-settings">...</span>'+
                '<span class="'+cl+'__field-kill"></span>'+
            '</div>'
        );
        $field.data('field', field);
        $target.append($field);
    };
    
    this.draw = function(value) {
        this.drawGroup({});
        for (var i = 0; i < value.groups.length; i++) {
            this.drawGroup(value.groups[i]);
            this.drawGroup({});
        }
        this.$node.find('.'+cl+'__group').sortable(
            {
                items:'>.'+cl+'__field',
                tolerance:'pointer',
                connectWith:'.'+cl+'__canvas .'+cl+'__group',
                stop:function() {
                    that.updateValue();
                }
            }
        );
    };
    
    this.updateValue = function() {
        var res = {
            groups: []
        };
        this.$node.find('.'+cl+'__group').each(function() {
            var fields = [];
            $(this).find('.'+cl+'__field').each(function() {
                fields.push( $(this).data('field') );
            });
            if (fields.length > 0) {
                res.groups.push({
                    fields: fields
                });
            }
        });
        this.$input.val(JSON.stringify(res)).trigger('change');
    };
    
    this.showFieldSettings = function($f) {
        var data = $f.data('field');
        
        var fields = [];
        
        $.each(data.params, function(field_key, field) {
            field.name = field_key;
            fields.push(field);
        });
        
        $fx.front_panel.show_form(
            {
                fields: fields
            },
            {
                style:'alert',
                onready: function($f) {
                    console.log('form ready', $f);
                    $f.on('change', function() {
                        var new_data = {};
                            
                        $.each( $f.serializeArray(), function() {
                            new_data[this.name] = this.value;
                        });
                        data = $.extend(data, new_data);
                        $f.data('field', data);
                        that.updateValue();
                        //console.log(data, new_data);
                    });
                },
                onsubmit: function(e) {
                    console.log('subm', arguments);
                    return false;
                }
            }
        );
    };
    
    this.init = function () {
        this.$input = $node.find('.'+cl+'__value');
        this.$canvas = $node.find('.'+cl+'__canvas');
        this.$avail = $node.find('.'+cl+'__avail');
        this.draw(params.value);
        this.$input.val(JSON.stringify(this.params.value));
        
        this.$canvas
            .on('click', '.'+cl+'__field-kill', function() {
                $(this).parent().remove();
                that.updateValue();
                return false;
            })
            .on('click', '.'+cl+'__field', function() {
                var $f = $(this),
                    data =  $f.data('field');
                if (data.params) {
                    that.showFieldSettings($(this));
                }
            });
        
        for (var i = 0; i < this.params.avail.length; i++) {
            this.drawField(this.params.avail[i], this.$avail);
        }
        
        this.$avail.sortable({
            connectWith:'.'+cl+'__canvas .'+cl+'__group',
            stop:function() {
                that.updateValue();
            }
        });
    };
    
    this.init();
}

})();