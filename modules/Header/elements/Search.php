<?php

namespace Modules\Header\Elements;

use Core\Block;

class Search extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Search Box',
            'icon' => 'ph-magnifying-glass',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        return '
            <div class="relative w-full pointer-events-none">
                <input type="text" placeholder="Tìm kiếm..." class="w-full bg-white text-black h-9 px-3 rounded text-sm border-0">
                <i class="ph ph-magnifying-glass absolute right-2 top-2 text-gray-500"></i>
            </div>
        ';
    }
}
