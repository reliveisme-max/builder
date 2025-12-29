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
        $layout = $settings['layout'] ?? 'form';
        $placeholder = $settings['text'] ?? 'Tìm kiếm...';
        $bg = $settings['background-color'] ?? '#f3f4f6';
        $color = $settings['color'] ?? '#333333';
        $radius = intval($settings['border-radius'] ?? '20');
        $height = intval($settings['height'] ?? '36');

        // Chỉ giữ lại tùy chỉnh màu nền nút icon
        $btnBg = $settings['button_bg'] ?? 'transparent';

        if ($layout === 'icon') {
            return "<div class='search-icon-only cursor-pointer hover:opacity-70' style='color: {$color}; font-size: 20px;'><i class='ph ph-magnifying-glass'></i></div>";
        }

        return "
            <form action='/search' class='search-box relative flex items-center' 
                  style='width: 100%; height: {$height}px; background-color: {$bg}; border-radius: {$radius}px; overflow: hidden;'>
                <input type='text' placeholder='{$placeholder}' class='flex-1 h-full px-4 border-0 outline-none bg-transparent text-xs' style='color: {$color};'>
                <button type='submit' class='px-3 h-full flex items-center justify-center opacity-60 hover:opacity-100' style='background-color:{$btnBg}; color:{$color}; border:none;'>
                    <i class='ph ph-magnifying-glass text-lg'></i>
                </button>
            </form>
        ";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Giao diện</label><select data-style="layout" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"><option value="form">Form nhập</option><option value="icon">Icon bấm</option></select></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Chiều cao</label><input type="number" data-style="height" value="36" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"></div>
                </div>
                <div><label class="text-xs text-gray-400 block mb-1">Placeholder</label><input type="text" value="Tìm kiếm..." data-style="text" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs"></div>
                
                <hr class="border-gray-800">
                <label class="text-[10px] text-gray-500 font-bold uppercase">Màu sắc</label>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Nền Form</label><input type="color" data-style="background-color" value="#f3f4f6" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Màu chữ</label><input type="color" data-style="color" value="#333333" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>
                <div><label class="text-xs text-gray-400 block mb-1">Màu nền nút tìm kiếm</label><input type="color" data-style="button_bg" value="#transparent" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                
                <div class="mt-2">
                    <label class="text-xs text-gray-400 block mb-1">Bo góc (px)</label>
                    <input type="range" data-style="border-radius" min="0" max="50" value="20" class="prop-input w-full accent-indigo-500">
                </div>
            </div>
        ';
    }
}
