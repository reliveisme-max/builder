<?php

namespace Modules\Header\Elements;

use Core\Block;

class Search extends Block
{
    public function getInfo()
    {
        return ['name' => 'Search Box', 'icon' => 'ph-magnifying-glass', 'group' => 'Basic'];
    }

    public function render($settings = [])
    {
        $placeholder = $settings['text'] ?? 'Bạn tìm gì...';
        $bg = $settings['background-color'] ?? '#f3f4f6';
        $color = $settings['color'] ?? '#333333';
        $radius = $settings['border-radius'] ?? '20';
        $width = $settings['width'] ?? '100';

        // Class search-box dùng để JS target vào
        return "
            <div class='search-box relative flex items-center h-9' style='width: {$width}%; background-color: {$bg}; border-radius: {$radius}px;'>
                <input type='text' placeholder='{$placeholder}' class='w-full h-full px-4 border-0 outline-none bg-transparent text-xs' style='color: {$color};'>
                <button class='px-3 h-full flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer border-0 bg-transparent' style='color: {$color};'>
                    <i class='ph ph-magnifying-glass text-lg'></i>
                </button>
            </div>
        ";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div><label class="text-xs text-gray-400 block mb-1">Placeholder</label><input type="text" value="Bạn tìm gì..." data-style="text" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs"></div>
                <div><label class="text-xs text-gray-400 block mb-1">Chiều rộng (%)</label><input type="range" data-style="width" min="20" max="100" value="100" class="prop-input w-full accent-indigo-500"></div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu nền</label><input type="color" data-style="background-color" value="#f3f4f6" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Màu chữ</label><input type="color" data-style="color" value="#333333" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>
                <div><label class="text-xs text-gray-400 block mb-1">Bo góc</label><input type="range" data-style="border-radius" min="0" max="30" value="20" class="prop-input w-full accent-indigo-500"></div>
            </div>
        ';
    }
}
