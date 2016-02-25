<?php
namespace Floxim\Ui;

use Floxim\Floxim\System\Fx as fx;

class Module extends \Floxim\Floxim\Component\Module\Entity {
    public function init()
    {
        fx::template()->import('floxim.ui.slider');
        fx::template()->import('floxim.ui.tiles');
        fx::template()->import('floxim.ui.menu');
    }
}