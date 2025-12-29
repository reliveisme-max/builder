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
        $bg = $settings['background-color'] ?? '#f3f4f6';
        $color = $settings['color'] ?? '#333333';
        $radius = intval($settings['border-radius'] ?? '4');
        $height = intval($settings['height'] ?? '40');

        return "
            <div class='inner-box flex items-center gap-2 px-4 cursor-pointer hover:opacity-90 transition' 
                 style='background-color: {$bg}; color: {$color}; border-radius: {$radius}px; height: {$height}px;'>
                <i class='ph ph-list text-lg'></i>
                <span class='text-xs font-bold uppercase whitespace-nowrap inner-text'>{$text}</span>
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
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Bo góc (px)</label>
                        <input type="number" data-style="border-radius" value="4" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700">
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Chiều cao (px)</label>
                        <input type="number" data-style="height" value="40" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700">
                    </div>
                </div>

                <hr class="border-gray-800">
                <label class="text-[10px] font-bold text-gray-500 uppercase mb-2 block">HIỂN THỊ TRÊN</label>
                <div class="flex flex-col gap-2">
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_desktop" class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Desktop (>1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_tablet" class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Tablet (768-1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_mobile" class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Mobile (<768px)</span></label>
                </div>
            </div>
        ';
    }
}
