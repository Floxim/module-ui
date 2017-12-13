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
                'floxim.ui.box',
                'floxim.ui.record',
                'floxim.ui.nav'
            )
        );
    }
    
    public function getDateFormats()
    {
        $formats = array(
            'j %month:gen% Y',
            '%Month% Y',
            'd.m.Y',
            'd/m/Y',
            'H:i'
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