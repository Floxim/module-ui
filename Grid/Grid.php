<?php

namespace Floxim\Ui\Grid;

use \Floxim\Floxim\System\Fx as fx;

class Grid {
    
    public static function start($tpl)
    {
        return new self($tpl);
    }
    
    protected $context = null;
    protected $params = array();
    protected $data;
    
    public static function addAdminAssets()
    {
        if (fx::isAdmin()) {
            $path = fx::path('@module/Floxim/Ui/Grid');
            fx::page()->addJsFile($path.'/grid-builder.js');
            fx::page()->addCssBundle(
                array(
                    $path.'/grid-builder.less'
                )
            );
        }
    }
    
    public function __construct($template)
    {
        self::addAdminAssets();
        $ctx = $template->context;
        $data = $ctx->get($this->getParamId());
        if ($data && is_string($data)) {
            $data = json_decode($data, 1);
        }
        if (!$data) {
            $data = $this->getDefaultData();
        }
        $this->data = $data;
        $this->run($template);
    }
    
    protected function run($template)
    {
        $this->template = $template;
        $template->context->startScope($this->getParamId());
        $template->context->push($this->data);
        $template->pushTemplateParamHandler($this);
    }


    protected function getDefaultData()
    {
        $data = array(
            'cols' => array(
                array(
                    'id' => fx::util()->uid(),
                    'name' => 'A',
                    'width' => 6
                ),
                array(
                    'id' => fx::util()->uid(),
                    'name' => 'B',
                    'width' => 6
                )
            )
        );
        return $data;
    }
    
    protected function getParamId()
    {
        return 'grid';
    }
    
    public function stop() {
        $this->template->popTemplateParamHandler();
        $this->template->registerParam(
            $this->getParamId(), 
            array(
                'type' => 'fx-grid-builder',
                //'type' => 'text',
                //'code' => true,
                'label' => 'Grid',
                'value' => array_merge($this->data, array('is_stored' => true)),
                'params' => $this->params
            )
        );
    }
    
    public function registerParam($name, $data, $context)
    {
        $path = $context->getScopePath().'.'.$name;
        $path = preg_replace("~^[^\.]*?\.~", '', $path);
        $this->params[$path] = $data;
    }
    
    public function getAreaId() 
    {
        $col = $this->template->context->get('col');
        return $col['id'];
    }
    
    public function getBlocks()
    {
        $area_id = $this->getAreaId();
        $blocks = fx::page()->getAreaInfoblocks($area_id);
        if (count($blocks) === 0) {
            return null;
        }
        return $blocks;
    }
}