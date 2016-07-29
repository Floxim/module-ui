<?php
namespace Floxim\Ui;

use Floxim\Floxim\System\Fx as fx;

class Module extends \Floxim\Floxim\Component\Module\Entity {
    public function init()
    {
        fx::template()->register(
            array(
                'floxim.ui.slider',
                'floxim.ui.tiles',
                'floxim.ui.menu',
                'floxim.ui.list',
                'floxim.ui.box'
            )
        );
    }
    
    public function getDateFormats()
    {
        $formats = array(
            'j %month:gen% Y',
            '%Month% Y',
            'd.m.Y'
        );
        $res = array();
        foreach ($formats as $f) {
            $res[$f] = fx::date(time(), $f);
        }
        return $res;
    }
    
    public function getDefaultDateFormat()
    {
        return 'j %month:gen% Y';
    }
}