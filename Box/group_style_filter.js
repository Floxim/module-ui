function floxim_ui_box_group_style_filter(fields, params, values) {
    var res = [];
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        switch (f.name) {
            case 'width':
                var wt = params.width_type,
                    wv = params.width_value;
                
                if (wv*1 !== 1) {
                    f.type = 'number';
                    f.step = 5;
                    f.max = 100;
                    f.units = '%';
                    f.default = 100;
                } else {
                    if (wt === 'layout') {
                        delete f.values.layout;
                    } else {
                        delete f.values.full;
                    }
                }
                
                res.push(f);
                break;
            case 'fields_margin':
            case 'align_items':
                if (params.count_fields > 1) {
                    res.push(f);
                }
                break;
            default:
                res.push(f);
                break;
        }
    }
    return res;
}