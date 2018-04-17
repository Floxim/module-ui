<?php

namespace Floxim\Ui\Box;

use Floxim\Floxim\System\Fx as fx;

class BoxFile implements \ArrayAccess {

    /*
     *  $context->set(
     *      "file_instance",
 *          \Floxim\Ui\Box\BoxFile::create(
     *          $context->get("value")
 *          ),
     *      $context->getVarMeta()
     * );
     */

    protected $file = null;
    protected $props = [];

    public static function create ($file)
    {
        return new static($file);
    }

    public function __construct($file)
    {
        $this->file = $file;
    }

    public function getBoxFields() {
        return [
            [
                'keyword' => 'name',
                'label' => 'Название',
                'template' => 'floxim.ui.box:text_value'
            ],
            [
                'keyword' => 'size',
                'label' => 'Размер',
                'template' => 'floxim.ui.box:text_value'
            ],
            [
                'keyword' => 'type',
                'label' => 'Тип',
                'template' => 'floxim.ui.box:text_value'
            ]
        ];
    }

    public function getSize()
    {
        return fx::files($this->file, 'size');
    }

    public function getName()
    {
        return fx::files($this->file, 'name');
    }

    public function getType()
    {
        return fx::files($this->file, 'type');
    }

    public function getUrl()
    {
        return fx::path()->http($this->file);
    }

    public function getField($field)
    {
        return [
            'keyword' => $field,
            'type' => 'text'
        ];
    }

    public function offsetGet($offset)
    {
        try {
            if (!isset($this->props[$offset])) {
                //$this->props[$offset] = call_user_func([$this, 'get'.fx::util()->underscoreToCamel($offset)]);
                $this->props[$offset] = $this->{'get' . fx::util()->underscoreToCamel($offset)}();
            }
            return $this->props[$offset];
        } catch (\Exception $e) {
            fx::log('ex', $e);
            return 'xxx';
        }
    }

    public function offsetSet($offset, $value)
    {
        // TODO: Implement offsetSet() method.
    }

    public function offsetExists($offset)
    {
        return in_array($offset, ['type' , 'name', 'size', 'url']);
        // TODO: Implement offsetExists() method.
    }

    public function offsetUnset($offset)
    {
        // TODO: Implement offsetUnset() method.
    }
}