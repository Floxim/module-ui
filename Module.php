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

    public function getNumberFormats()
    {
        $formats = [
            [
                [0, '', ''],
                '100500'
            ],
            [
                [0, '', ' '],
                '100 500'
            ],
            [
                [2, ',', ' '],
                '100 500,00'
            ]
        ];
        $res = [];
        foreach ($formats as $f) {
            $res[json_encode($f[0])] = $f[1];
        }
        return $res;
    }

    public function getDefaultNumberFormat()
    {
        return '[0,"",""]';
    }

    static $formatterClosures = [];

    public static function numberFormat($number, $format)
    {
        if (!isset(self::$formatterClosures[$format])) {
            list($decimals, $dec_point, $thousands_sep) = json_decode($format);
            self::$formatterClosures[$format] = function($val) use ($decimals, $dec_point, $thousands_sep) {
                return call_user_func('number_format', $val, $decimals, $dec_point, $thousands_sep);
            };
        }
        return call_user_func(self::$formatterClosures[$format], $number);
    }
}