<?php
namespace Floxim\Ui;

use Floxim\Floxim\System\Fx as fx;

class Module extends \Floxim\Floxim\Component\Module\Entity {
    public function init()
    {
        fx::template()->import('floxim.ui.slider');
        fx::template()->import('floxim.ui.tiles');
        fx::template()->import('floxim.ui.menu');
        fx::template()->import('floxim.ui.list');
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