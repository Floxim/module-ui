<?php

namespace Floxim\Ui\Box;

use \Floxim\Floxim\System\Fx as fx;

class Box {
    
    protected $data = array();
    /**
     *
     * @var \Floxim\Floxim\Template\Template;
     */
    protected $template = null;
    
    protected $box_id = null;
    
    protected $containing_loop = null;
    
    protected $avail = array();
    
    protected $params = array();
    
    public static function start($template)
    {
        $ctx = $template->context;
        
        $loop = $ctx->get('loop');
        $box_id = $ctx->get('box_id');
        
        if (!$loop) {
            $box = new self($ctx, $box_id);
        } else {
            $obj_var = 'box_obj_'.$box_id;
            if (isset($loop[$obj_var])) {
                $box = $loop[$obj_var];
            } else {
                $box = new self($ctx, $box_id, $loop);
                $loop[$obj_var] = $box;
            }
        }
        $box->run($template);
        return $box;
    }
    
    
    public function __construct($context, $box_id, $loop = null)
    {
        if (fx::isAdmin()) {

            $path = fx::path('@module/Floxim/Ui/Box');
            fx::page()->addJsFile($path.'/box-builder.js');
            fx::page()->addCssBundle(
                array(
                    $path.'/box-builder.less'
                )
            );
            $item = $context->get('item');
            $this->avail = $item->getFields();
        }
        $this->box_id = $box_id;
        $param_id = $this->getParamId();
        $data = $context->get($param_id);
        if (is_string($data) && !empty($data)) {
            $data = json_decode($data, true);
        }
        if (!$data || !isset($data['is_stored'])) {
            $groups = $context->get('groups');
            $default_data = self::prepareGroups($groups);
            $data = $data ? \Floxim\Floxim\System\Util::fullMerge($data, $default_data) : $default_data;
        }
        $this->data = $data;
        if ($loop) {
            $this->containing_loop = $loop;
            $box = $this;
            $loop->onStop( function() use ($box) {
                $box->export();
            });
        }
    }
    
    protected function getParamId()
    {
        return 'box_'.$this->box_id;
    }
    
    public function run($template)
    {
        $this->template = $template;
        $template->context->startScope($this->getParamId());
        $template->context->push($this->data);
        $this->template->pushTemplateParamHandler($this);
    }
    
    public function stop()
    {
        $this->template->popTemplateParamHandler();
        $this->template->context->stopScope();
        $this->template->context->pop();
        if (is_null($this->containing_loop)) {
            $this->export();
        }
    }
    
    protected static function prepareGroups($groups)
    {
        $res = array(
            'groups' => array()
        );
        if (!$groups || !is_array($groups)) {
            $groups = array(
                array(
                    array('keyword' => 'name', 'field_link' => 1)
                ),
                array(
                    array('keyword' => 'description')
                )
            );
        }
        foreach ($groups as $group) {
            if (!is_array($group)) {
                $group = array($group);
            }
            if (!isset($group['fields'])) {
                $group = array('fields' => $group);
            }
            foreach ($group['fields'] as &$field) {
                if (!is_array($field)) {
                    $field = array('keyword' => $field);
                }
                if (!isset($field['template'])) {
                    $field['template'] = 'value';
                }
            }
            $res['groups'][]= $group;
        }
        return $res;
    }
    
    public function getGroups()
    {
        return $this->data['groups'];
    }
    
    public function registerParam($name, $data, $context)
    {
        $path = $context->getScopePath().'.'.$name;
        $path = preg_replace("~^[^\.]*?\.~", '', $path);
        $this->params[$path] = $data;
    }

    public function export() {
        $avail = array();
        $skip = array(
            'id',
            'is_published',
            'is_branch_published',
            'infoblock_id',
            'parent_id',
            'site_id',
            'link_type',
            'external_url',
            'linked_page_id',
            'meta'
        );
        foreach ($this->avail as $f) {
            $kw = $f['keyword'];
            if (in_array($kw, $skip)) {
                continue;
            }
            $avail []= array(
                'keyword' => $kw,
                'template' => 'value'
            );
        }
        $this->template->registerParam(
            'box_'.$this->box_id,
            array(
                'type' => 'fx-box-builder',
                'code' => true,
                'label' => 'Box',
                'value' => array_merge($this->data, array('is_stored' => true)),
                'params' => $this->params,
                'avail' => $avail
            )
        );
    }
}
