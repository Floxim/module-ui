(function($) {

var cl = 'floxim-ui-box-format';

$t.add(
    'input',
    function(_c, _o) {
        var val = formatField.prepareValue(_c.value);
        return  '<div class="'+cl+'">'+
            '<input type="hidden" data-json-val="true" class="'+cl+'__value" name="'+ _c.name+'" />'+
            '<span class="'+cl+'__ce" contenteditable="true">'+val[0]+'</span>'+
            '<span class="'+cl+'__val">'+(_c.fixedLabel || 'значение')+'</span>'+
            '<span class="'+cl+'__ce" contenteditable="true">'+val[1]+'</span>'+
            '</div>';
    },
    function(_c) {
        return _c.type === 'fx-box-format';
    },
    1,
    function($node, params) {
        new formatField($node, params);
    }
);

function formatField($node, params) {
    this.$node = $node;
    var $ces = $('.'+cl+'__ce', this.$node);
    var $inp = $('input', this.$node);
    $inp.val(JSON.stringify(formatField.prepareValue(params.value)));

    this.$node.on('change paste input', '.'+cl+'__ce', function(e) {
        var $ce = $(e.target).closest('.'+cl+'__ce'),
            html = $ce.html(),
            stored = $inp.val();
        if (/</.test(html)) {
            $ce.html(html.replace(/<.+?>/gm, ''))
        }
        var val = [
            $ces.first().text(),
            $ces.last().text()
        ];
        $inp.val(JSON.stringify(val));
        if ($inp.val() !== stored) {
            $inp.trigger('change');
        }
    });
}

formatField.prepareValue = function(v) {
    if (typeof v === 'string' && v.length) {
        try {
            v = JSON.parse(v);
        } catch (e) {
            console.log('err parsing', e, v);
            v = null;
        }
    }
    if (!v) {
        v = ['',''];
    }
    return v;
}

})($fxj);