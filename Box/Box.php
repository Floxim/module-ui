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
        
        if (!$loop || $loop['has_scope']) {
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
        static $done = false;
        if ($done) {
            return;
        }
        $path = fx::path('@module/Floxim/Ui/Box');
        fx::page()->addJs([$path.'/box-builder.js', $path.'/format-field.js'], ['to' => 'admin']);
        fx::page()->addCss(
            [
                $path.'/box-builder.less'
            ],
            ['to' => 'admin']
        );
        $done = true;
    }
    
    protected $field_source = null;
    
    protected function getFieldSource()
    {
        if (is_null($this->field_source)) {
            $this->field_source = $this->template->context->get('field_source');
        }
        return $this->field_source;
    }
    
    public function getAvailFields()
    {
        $context = $this->template->context;
        $field_source = $this->getFieldSource();
        $res = null;
        switch ($field_source) {
            case 'block':
                $res = $this->getAvailBlockFields($context->get('infoblock'));
                break;
            case 'item': default:
                $res = $this->getAvailItemFields($context->get('item'));
                break;
        }
        $res = array_merge($res, $this->getCommonAvailFields());
        return $res;
    }
    
    protected function getCommonAvailFields()
    {
        $right_col_id = fx::util()->uid();
        $res []= array(
            'type' => 'columns',
            'name' => 'Колонки',
            'is_group' => true,
            'template' => 'columns',
            'keyword' => '_columns',
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
        $res []= [
            'name' => 'Произвольный текст',
            'template' => 'free_text',
            'keyword' => '_free_text'
        ];
        $res []= [
            'name' => 'Кнопка',
            'template' => 'free_button',
            'keyword' => '_free_button'
        ];
        return $res;
    }


    protected function getAvailItemFields($item, $level = 0)
    {
        $avail = array();
        if (!$item) {
            return $avail;
        }
        $all = $item instanceof \Floxim\Floxim\System\Entity ? $item->getFields() : [];

        $skip = array(
            'id',
            'type',
            'created',
            'is_published',
            'is_branch_published',
            'infoblock_id',
            //'parent_id',
            'site_id',
            'link_type',
            'external_url',
            'linked_page_id',
            'url',
            'title',
            'h1',
            'meta',
            'priority',
            'user_id',
            'children'
        );
        
        $skip_types = array(
            'group'
            //'image',
            //'link'//,
            //'multilink'
        );
        
        $special_fields = (array) $item->getBoxFields();
        $passed_fields = $this->template->context->get('box_extra_fields');
        if ($passed_fields){
            $special_fields = array_merge($special_fields, $passed_fields);
        }
        
        $special_field_keywords = [];
        $forced_fields = [];
        
        foreach ($special_fields as $special_field) {
            if (is_string($special_field)) {
                $forced_fields []= $special_field;
            } elseif (isset($special_field['keyword'])) {
                $special_field_keywords []= $special_field['keyword'];
            }
        }
        
        $link_fields = [];

        foreach ($all as $f) {
            $kw = $f['keyword'];
            $com = $f['component'];
            $field_label = $f['name'];
            if (
                (in_array($kw, $skip) || in_array($f['type'], $skip_types))
                && !in_array($kw, $forced_fields)
            ) {
                continue;
            }
            if (in_array($kw, $special_field_keywords)) {
                continue;
            }
            
            $field = array();
            
            $value_templates = [
                ['id' => 'text_value', 'name' => 'Текст'],
                ['id' => 'header_value', 'name' => 'Заголовок'],
                ['id' => 'button_value', 'name' => 'Кнопка'],
                ['id' => 'formatted_value', 'name' => 'По формату'],
                ['id' => 'formatted_header_value', 'name' => 'Заголовок по формату']
            ];
            
            switch ($f['type']) {
                default:
                    if ($f['keyword'] === 'name') {
                        $field['template'] = 'header_value';
                    } else {
                        $field['template'] = 'text_value';
                    }
                    $field['templates'] = $value_templates;
                    break;
                case 'link':
                    $field['template'] = 'link_value';
                    $kw = $f->getPropertyName();
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
                case 'file':
                    $field['template'] = 'file_value';
                    $field['type'] = 'file';
                    break;
            }
            
            $field['keyword'] = $kw;
            $field['component'] = $com['keyword'];
            $field['name'] = $field_label;
            
            if ($f['type'] === 'link') {
                $link_fields []= $field;
            } else {
                $avail []= $field;
            }
            
            if ($f['type'] === 'link' && $level === 0) {
                $rel_stub = $f->getTargetFinder($item)->create();
                $rel_fields = $this->getAvailItemFields($rel_stub, $level + 1);
                foreach ($rel_fields as &$rel_field) {
                    $rel_field['keyword'] = ':'.$kw.'.'.$rel_field['keyword'];
                    $rel_field['name'] = '<span class="floxim-ui-box-builder__field-prefix">' .
                                             $field_label . 
                                         '</span> '.
                                         $rel_field['name'];
                    
                    
                    $link_fields []= $rel_field;
                }
            }
        }
        
        foreach ($link_fields as $lf) {
            $avail []= $lf;
        }
        
        foreach ($special_fields as $sf) {
            if (is_array($sf)) {
                if (!isset($sf['template'])) {
                    $sf['template'] = 'formatted_value';
                    if (!isset($sf['templates'])) {
                        $sf['templates'] = $value_templates;
                    }
                }
                if (!isset($sf['name'])) {
                    $sf['name'] = isset($sf['label']) ? $sf['label'] : $sf['keyword'];
                }
                $avail []= $sf;
            }
        }
        return $avail;
    }
    
    protected $templates = [];

    public function startField($field)
    {
        if (!isset($field['keyword']) || !isset($this->templates[$field['keyword']])) {
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
    
    public function getAvailBlockFields($infoblock)
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
                'template' => 'floxim.layout.wrapper:wrapper_header',
                'position' => 'first'
            )
        );
        $action = $infoblock['action'];
        if (preg_match("~^list~", $action)) {
            $avail []= array(
                'keyword' => 'block:pagination',
                'name' => 'Постраничная навигация',
                'template' => 'floxim.ui.pagination:pagination'
            );
        }
        $ctr = $infoblock->initController();
        if (method_exists($ctr, 'getAvailableParts')) {
            $avail = array_merge($avail, $ctr->getAvailableParts());
        }
        return $avail;
    }
    
    protected $scope_depth = 0;
    protected $box_label = '';

    public function __construct($template, $box_id, $loop = null)
    {
        $this->template = $template;
        $context = $template->context;
        $this->box_label = $context->get('box_label');
        
        if (fx::isAdmin()) {
            self::addAdminAssets();
            $this->avail = $this->getAvailFields();
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
            if (isset($f['keyword']) && $f['keyword'] === $keyword) {
                return true;
            }
        }
        return false;
    }
    
    protected function getDefaultGroups()
    {
        $groups_from_context = $this->template->context->get('default_box_groups');
        if ($groups_from_context) {
            return $groups_from_context;
        }
        $c_item = $this->template->context->get('item');
        $groups = [];
        switch ($this->getFieldSource()) {
            case 'item':
            default:
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
                break;
            case 'block':
                $groups = [
                    [
                        ['keyword' => 'block:content', 'template' => 'floxim.layout.wrapper:wrapper_content']
                    ]
                ];
                //$groups = [];
                break;
        }
        return $groups;
    }

    /**
     * Параметры для сортировочного поля
     * Получаем базовый тип данных и поле-релейшн
     * Возвращаем список полей для сортировки
     */
    public static function getSorterOptions($item, $field) {
        static $cache = [];
        if (! ($item instanceof \Floxim\Floxim\Component\Basic\Entity) || empty($field)) {
            return null;
        }
        $hash = $item->getType().'@'.$field;
        if (array_key_exists($hash, $cache)) {
            return $cache[$hash];
        }
        $relField = $item->getField($field);
        if (!$relField) {
            $cache[$hash] = null;
            return null;
        }

        $targetComName = $relField->getTargetName();
        $targetCom = fx::getComponentByKeyword($targetComName);
        $relTarget = $relField->getRelation()[2];
        $targetFields = $targetCom->getAllFields()->find(function($f) use ($relTarget) {
            return $f['keyword'] !== $relTarget;
        });
        $res = [
            'sortable_fields' => self::getSortableFields($targetFields)
        ];
        $cache[$hash] = $res;
        return $res;
    }

    /**
     * @param $fields
     * @param int $level
     * @return array
     */
    protected static function getSortableFields($fields, $level = 0) {
        $res = [];
        $priorityMap = [
            'string' => 1,
            'link' => 0.5,
            'int' => 2,
            'float' => 3,
            'datetime' => 4,
            'priority' => 5
        ];
        foreach ($fields as $f) {
            $priority = isset($priorityMap[$f['type']]) ? $priorityMap[$f['type']] : 0;
            if ($priority === 0) {
                continue;
            }
            if ($f instanceof \Floxim\Floxim\Field\FieldLink) {
                if ($level >= 1) {
                    continue;
                }
                $targetComName = $f->getTargetName();
                $targetCom = fx::getComponentByKeyword($targetComName);
                if (!$targetCom) {
                    continue;
                }
                $targetFields = $targetCom->getAllFields();
                if (!$targetFields) {
                    continue;
                }
                $targetSortableFields = Box::getSortableFields($targetFields, $level + 1);
                foreach ($targetSortableFields as &$tsf) {
                    $tsf['id'] = $f->getFormat('prop_name').'.'.$tsf['id'];
                }
                $res []= [
                    'id' => $f['keyword'],
                    'name' => $f['name'],
                    'expanded' => false,
                    'disabled' => true,
                    'children' => $targetSortableFields,
                    'priority' => $priority
                ];
            } else {
                $res[]= [
                    'id' => $f['keyword'],
                    'name' => $f['name'],
                    'priority' => $priority,
                    'sortable' => $f['type'] === 'priority' && $level === 0
                ];
            }
        }
        usort($res, function($a, $b) {
            return $b['priority'] - $a['priority'] > 0 ? 1 : -1;
        });
        return $res;
    }

    public static function prepareLinkedList($list, $sort)
    {
        if ( ! ($list instanceof \Floxim\Floxim\System\Collection) || !$sort) {
            return $list;
        }
        if (!is_array($sort) || !isset($sort['field'])) {
            return $list;
        }
        $f = $sort['field'];
        $dir = isset($sort['dir']) ? $sort['dir'] : 'asc';
        $res = $list->copy();
        $res->sort(
            function($a, $b) use ($f, $dir) {
                $fa = $a->dig($f);
                $fb = $b->dig($f);
                $r = $fa > $fb ? 1 : ($fa < $fb ? -1 : 0);
                return $dir === 'asc' ? $r : $r * -1;
            }
        );
        $res->is_sortable = isset($sort['sortable']) && $sort['sortable'] ? $f : false;
        return $res;
        //return $list;
    }
    
    protected function prepareGroups($groups)
    {
        $res = array(
            'groups' =>  array()
        );
        if (!$groups || !is_array($groups)) {
            $groups = $this->getDefaultGroups();
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
                        $field['template'] = 'text_value';
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
        if (isset($data['use_inline_default']) && $data['use_inline_default']) {
            fx::digSet($this->data, $path, $data['value']);
        }
        if (isset($this->params[$path])) {
            $this->params[$path] = fx::util()->fullMerge($this->params[$path], $data);
        } else {
            $this->params[$path] = $data;
        }
    }

    public function export() {
        $value = array_merge($this->data, array('is_stored' => "1"));
        $box_label = $this->box_label ? $this->box_label : $this->template->context->get('box_label');
        if (!$box_label) {
            $box_label = 'Поля';
        }
        $this->template->registerParam(
            $this->getParamId(),
            array(
                'type' => 'fx-box-builder',
                'label' => $box_label,
                'value' => $value,
                'params' => $this->params,
                'avail' => $this->avail
            )
        );
    }
    
    public static function getLinkParam($context)
    {
        static $popup_ibs = null;
        if (is_null($popup_ibs)) {
            $popup_ibs = fx::data('infoblock')
                            ->where('site_id', fx::env('site_id'))
                            ->where('controller', 'floxim.ui.hidden')
                            ->all();
        }
        $values = [
            [0, 'Нет'],
            ['link', 'Да'],
            ['blank', 'В новом окне']
        ];
        if (count($popup_ibs) > 0) {
            $page = $context->getClosestEntity(
                function($entity) {
                    return $entity instanceof \Floxim\Floxim\System\Entity && ($entity['url']);
                }
            );
            if (
                $page &&
                is_object($page) &&
                method_exists($page, 'isInstanceOf') &&
                !$page->isInstanceOf('floxim.main.page')
            ) {
                $page_url = $page['url'];
                $page = fx::data('floxim.main.page')->getByUrl($page_url);
            }
            $popup_vals = ['children' => [], 'name' => 'Попап', 'id' => 'popup', 'disabled' => true];
            foreach ($popup_ibs as $popup_ib) {
                if ($popup_ib->isAvailableOnPage($page)) {
                    $popup_vals['children'] []= [
                        '#popup-'.$popup_ib['id'],
                        $popup_ib['name']
                    ];
                }
            }
            if (count($popup_vals['children']) > 0) {
                $values []= $popup_vals;
            }
        }
        return [
            'label' => "Ссылка?",
            'type' => "livesearch",
            'values' => $values,
            'default' => "0"
        ];
    }
}
