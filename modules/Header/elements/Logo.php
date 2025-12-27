<?php

namespace Modules\Header\Elements;

use Core\Block;

class Logo extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Logo FPT',
            'icon' => 'ph-image', // Class icon của Phosphor
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        $width = $settings['width'] ?? '150px';
        return "<img src='https://fptshop.com.vn/img/fpt-shop.png' style='width: {$width}' alt='FPT Logo' class='pointer-events-none'>";
    }

    public function getForm()
    {
        return '
            <div class="mb-2">
                <label class="text-xs text-gray-400">Chiều rộng</label>
                <input type="text" name="width" value="150px" class="w-full bg-gray-700 text-white text-xs p-1 rounded border border-gray-600">
            </div>
        ';
    }
}
