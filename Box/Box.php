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
            $box = new self($template, $box_id);
        } else {
            $obj_var = 'box_obj_'.$box_id;
            if (isset($loop[$obj_var])) {
                $box = $loop[$obj_var];
            } else {
                $box = new self($template, $box_id, $loop);
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
        $res = null;
        switch ($field_source) {
            case 'block':
                $res = $this->getAvailBlockFields($context->get('infoblock'));
                break;
            case 'item': default:
                $res = $this->getAvailItemFields($context->get('item'));
                break;
        }
        return $res;
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
            //'image',
            'link'//,
            //'multilink'
        );
        
        $special_fields = $item->getBoxFields();
        
        $special_field_keywords = [];
        $forced_fields = [];
        
        foreach ($special_fields as $special_field) {
            if (is_string($special_field)) {
                $forced_fields []= $special_field;
            } elseif (isset($special_field['keyword'])) {
                $special_field_keywords []= $special_field['keyword'];
            }
        }
        
        foreach ($all as $f) {
            $kw = $f['keyword'];
            if (
                (in_array($kw, $skip) || in_array($f['type'], $skip_types))
                && !in_array($kw, $forced_fields)
            ) {
                continue;
            }
            if (in_array($kw, $special_field_keywords)) {
                continue;
            }
            
            $field = array(
                'keyword' => $kw,
                'name' => $f['name']
            );
            
            switch ($f['type']) {
                default:
                    $field['template'] = 'value';
                    $field['templates'] = [
                        ['id' => 'text_value', 'name' => 'Текст'],
                        ['id' => 'value', 'name' => 'Значение'],
                        ['id' => 'header_value', 'name' => 'Заголовок']
                    ];
                    break;
                case 'multilink':
                    $field['template'] = 'list_value';
                    break;
                case 'icon':
                    $field['template'] = 'icon_value';
                    break;
                case 'image':
                    $field['template'] = 'image_value';
                    $field['type'] = 'image';
                    $field['is_group'] = true;
                    break;
            }
            $avail []= $field;
        }
        
        foreach ($special_fields as $sf) {
            if (is_array($sf)) {
                $avail []= $sf;
            }
        }
        $right_col_id = fx::util()->uid();
        $avail []= array(
            'type' => 'columns',
            'name' => 'Колонки',
            'is_group' => true,
            'template' => 'columns',
            'columns' => [
                [
                    'width' => 4,
                    'groups' => [],
                    'id' => fx::util()->uid()
                ],
                [
                    'width' => 8,
                    'groups' => [],
                    'id' => $right_col_id,
                    $right_col_id .'_style' => [
                        'padding' => '0rem 0rem 0rem 2rem'
                    ]
                ]
            ]
        );
        return $avail;
    }
    
    protected $templates = [];

    public function startField($field)
    {
        if (!isset($this->templates[$field['keyword']])) {
            return;
        }
        $this->template->registerParam(
            'template', 
            [
                'label' => 'Шаблон',
                'type' => 'livesearch',
                'values' => $this->templates[$field['keyword']],
                'value' => $field['template']
            ]
        );
    }
    
    public function getAvailBlockFields()
    {
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
    
    protected $scope_depth = 0;

    public function __construct($template, $box_id, $loop = null)
    {
        $this->template = $template;
        $context = $template->context;
        
        if (fx::isAdmin()) {
            self::addAdminAssets();
            $this->avail = $this->getAvailFields($context);
            foreach ($this->avail as $f) {
                if (isset($f['templates']) && isset($f['keyword']) ) {
                    $this->templates[$f['keyword']] = $f['templates'];
                }
            }
        }
        $this->box_id = $box_id;
        $param_id = $this->getParamId();
        $this->scope_depth = $context->getScopeDepth();
        
        $data = $context->get($param_id);
        
        if (is_string($data) && !empty($data)) {
            $data = json_decode($data, true);
        }
        
        if (!$data || !isset($data['is_stored'])) {
            $default_data = $this->prepareGroups($data);
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
        $param_id = $this->getParamId();
        $template->context->startScope($param_id);
        $template->context->push(
            array_merge($this->data, [$param_id => null])
        );
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
    
    
    protected $handled_cols = [];
    
    public function handleColumns()
    {
        $path = $this->template->context->getScopePath(1);
        if (isset($this->handled_cols[$path])) {
            return;
        }
        
        $params = [];
        $path_length = mb_strlen($path);
        foreach ($this->params as $k => $v) {
            if (mb_substr($k, 0, $path_length) !== $path) {
                continue;
            }
            $tale = mb_substr($k, $path_length + 1);
            $tale_parts = explode('.', $tale);
            if (count($tale_parts) !== 3) {
                continue;
            }
            $params[$tale] = $v;
        }
        
        $data = $this->template->context->get('columns');
        
        if (!$data) {
            $data = \Floxim\Ui\Grid\Grid::getDefaultCols();
        }
        
        $this->template->registerParam(
            'columns', 
            array(
                'type' => 'fx-grid-builder',
                'label' => 'Колонки',
                'prop_name' => null,
                'value' => $data,
                'params' => $params
            )
        );
        
        $this->handled_cols[$path] = true;
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
            'groups' =>  array()
        );
        if (!$groups || !is_array($groups)) {
            $c_item = $this->template->context->get('item');
            if ($c_item && method_exists($c_item, 'getDefaultBoxFields')) {
                $groups = $c_item->getDefaultBoxFields();
                foreach ($groups as &$g) {
                    if (isset($g['type']) && $g['type'] === 'image' && !isset($g['template'])) {
                        $g['template'] = 'image_value';
                        $g['is_group'] = true;
                    }
                }
            } else {
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
        }
        foreach ($groups as $group) {
            if (!is_array($group)) {
                $group = array($group);
            }
            if (!isset($group['fields']) && !isset($group['is_group'])) {
                $group = array('fields' => $group);
            }
            if (isset($group['fields'])) {
                foreach ($group['fields'] as &$field) {
                    if (!is_array($field)) {
                        $field = array('keyword' => $field);
                    }
                    if (!isset($field['template'])) {
                        $field['template'] = 'value';
                    }
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
        $path = $context->getScopePath($this->scope_depth + 1);
        if ($path) {
            $path .= '.';
        }
        $path .= $name;
        $this->params[$path] = $data;
    }

    public function export() {
        $value = array_merge($this->data, array('is_stored' => "1"));
        $this->template->registerParam(
            $this->getParamId(),
            array(
                'type' => 'fx-box-builder',
                'label' => 'Поля',
                'value' => $value,
                'params' => $this->params,
                'avail' => $this->avail
            )
        );
    }
}
