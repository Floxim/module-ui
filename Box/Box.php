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
    
    
    public static function addAdminAssets()
    {
        $path = fx::path('@module/Floxim/Ui/Box');
        fx::page()->addJsFile($path.'/box-builder.js');
        fx::page()->addCssBundle(
            array(
                $path.'/box-builder.less'
            )
        );
    }
    
    public function getAvailFields($context)
    {
        $field_source = $context->get('field_source');
        switch ($field_source) {
            case 'block':
                return $this->getAvailBlockFields($context->get('infoblock'));
            case 'item': default:
                return $this->getAvailItemFields($context->get('item'));
        }
    }
    
    protected function getAvailItemFields($item)
    {
        $avail = array();
        if (!$item) {
            return $avail;
        }
        $all = $item->getFields();
        
        $skip = array(
            'id',
            'type',
            'created',
            'is_published',
            'is_branch_published',
            'infoblock_id',
            'parent_id',
            'site_id',
            'link_type',
            'external_url',
            'linked_page_id',
            'url',
            'title',
            'h1',
            'meta',
            'priority'
        );
        
        $skip_types = array(
            'image',
            'link',
            'multilink'
        );
        
        foreach ($all as $f) {
            $kw = $f['keyword'];
            if (in_array($kw, $skip) || in_array($f['type'], $skip_types)) {
                continue;
            }
            $avail []= array(
                'keyword' => $kw,
                'name' => $f['name'],
                'template' => 'value'
            );
        }
        return $avail;
    }
    
    public function getAvailBlockFields()
    {
        //fx::log('gabf', $block);
        $avail = array(
            array(
                'keyword' => 'block:content',
                'name' => 'Содержание',
                'template' => 'floxim.layout.wrapper:wrapper_content'
            ),
            array(
                'keyword' => 'block:header',
                'name' => 'Заголовок',
                'template' => 'floxim.layout.wrapper:wrapper_header'
            )
        );
        return $avail;
    }

    public function __construct($context, $box_id, $loop = null)
    {
        if (fx::isAdmin()) {
            self::addAdminAssets();
            $this->avail = $this->getAvailFields($context);
        }
        $this->box_id = $box_id;
        $param_id = $this->getParamId();
        $data = $context->get($param_id);
        if (is_string($data) && !empty($data)) {
            $data = json_decode($data, true);
        }
        //fx::log($this, $data);
        if (!$data || !isset($data['is_stored'])) {
            $groups = $context->get('groups');
            $default_data = $this->prepareGroups($groups);
            $data = $data ? \Floxim\Floxim\System\Util::fullMerge($data, $default_data) : $default_data;
        }
        $this->data = $data;
        //fx::log('set data', $this->data);
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
    
    protected function hasField($keyword) 
    {
        foreach ($this->avail as $f) {
            if ($f['keyword'] === $keyword) {
                return true;
            }
        }
        return false;
    }
    
    protected function prepareGroups($groups)
    {
        $res = array(
            'groups' => array()
        );
        if (!$groups || !is_array($groups)) {
            $groups = array();
            if ($this->hasField('name')) {
                $groups []= array(
                    array('keyword' => 'name', 'field_link' => 1)
                );
            }
            
            if ($this->hasField('description')) {
                $groups []= array(
                    array('keyword' => 'description')
                );
            }
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
        
        $this->template->registerParam(
            $this->getParamId(),
            array(
                'type' => 'fx-box-builder',
                'label' => 'Поля',
                'value' => array_merge($this->data, array('is_stored' => true)),
                'params' => $this->params,
                'avail' => $this->avail
            )
        );
    }
}
