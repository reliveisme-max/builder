<?php

namespace Modules\Header\Elements;

use Core\Block;

class CategoryBtn extends Block
{
    public function getInfo()
    {
        return ['name' => 'Danh mục', 'icon' => 'ph-list', 'group' => 'Navigation'];
    }

    public function render($settings = [])
    {
        $text = $settings['text'] ?? 'DANH MỤC';
        $icon = $settings['icon_class'] ?? 'ph-list';
        $bg = $settings['background-color'] ?? '#f3f4f6';
        $color = $settings['color'] ?? '#333333';

        // FIX
        $radius = intval($settings['border-radius'] ?? '4');

        return "
            <div class='inner-box flex items-center gap-2 px-4 py-2 cursor-pointer hover:opacity-90 transition' 
                 style='background-color: {$bg}; color: {$color}; border-radius: {$radius}px;'>
                <i class='ph {$icon} text-lg'></i>
                <span class='text-xs font-bold whitespace-nowrap inner-text uppercase'>{$text}</span>
                <i class='ph ph-caret-down text-xs ml-1'></i>
            </div>
        ";
    }
    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div><label class="text-xs text-gray-400 block mb-1">Text</label><input type="text" value="DANH MỤC" data-style="text" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs"></div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu nền</label><input type="color" data-style="background-color" value="#f3f4f6" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Màu chữ</label><input type="color" data-style="color" value="#333333" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>
                
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Bo góc (Radius)</label>
                    <input type="range" data-style="border-radius" min="0" max="50" value="4" class="prop-input w-full accent-indigo-500">
                </div>
            </div>
        ';
    }
}
