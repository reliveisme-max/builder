<?php

namespace Modules\Header\Elements;

use Core\Block;

class CategoryBtn extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Danh mục',
            'icon' => 'ph-list-dashes',
            'group' => 'Navigation'
        ];
    }

    public function render($settings = [])
    {
        return '
            <div class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition">
                <i class="ph ph-list text-lg"></i>
                <span class="text-xs font-bold uppercase whitespace-nowrap">Danh mục</span>
                <i class="ph ph-caret-down text-xs"></i>
            </div>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                 <div>
                    <label class="text-xs text-gray-400 block mb-1">Background</label>
                    <input type="color" data-style="background-color" value="#f3f4f6" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu chữ</label>
                    <input type="color" data-style="color" value="#000000" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                </div>
            </div>
        ';
    }
}
