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
        
        $ib = $ctx->getFromTop('infoblock');
        
        $data = $ctx->get($this->getParamId());
        if ($data && is_string($data)) {
            $data = json_decode($data, 1);
        }
        if (!$data) {
            $data = self::getDefaultData();
        }
        $this->data = $data;
        foreach ($this->data['cols'] as &$col) {
            $col['area_id'] = $ib['id'].'-'.$col['id'];
            $col['area_name'] = $ib['name'].' / '.$col['name'];
        }
        $this->run($template);
    }
    
    protected function run($template)
    {
        $this->template = $template;
        $template->context->startScope($this->getParamId());
        //fx::log('starging', $this->data, $template->context->getFromTop('infoblock'));
        $template->context->push($this->data);
        $template->pushTemplateParamHandler($this);
    }
    
    
    public static function addBuilder($template, $prop_name = 'cols')
    {
        $data = $template->context->get($prop_name);
        
        if (!$data) {
            $data = self::getDefaultData();
            $data = $data['cols'];
        }
        
        $template->registerParam(
            $prop_name, 
            array(
                'type' => 'fx-grid-builder',
                'label' => 'Колонки',
                'prop_name' => null,
                'value' => $data
            )
        );
    }
    
    public static function getDefaultCols()
    {
        return array(
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
        );
    }

    protected static function getDefaultData()
    {
        $data = array(
            'cols' => self::getDefaultCols()
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
                'label' => 'Колонки',
                'value' => array_merge($this->data, array('is_stored' => true)),
                'params' => $this->params
            )
        );
        $this->template->context->stopScope();
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
        return $col['area_id'];
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