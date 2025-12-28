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
        $borderW = intval($settings['border-width'] ?? '0');
        $borderColor = $settings['border-color'] ?? 'transparent';

        // FIX WIDTH:
        $rawWidth = $settings['width'] ?? '100';
        $width = (strpos($rawWidth, '%') !== false || strpos($rawWidth, 'px') !== false) ? $rawWidth : $rawWidth . '%';

        // NEW: FIX HEIGHT (Mặc định 36px)
        $height = intval($settings['height'] ?? '36');

        $borderStyle = "border: {$borderW}px solid {$borderColor};";

        if ($layout === 'icon') {
            return "<div class='search-icon-only cursor-pointer hover:opacity-70' style='color: {$color}; font-size: 20px;'><i class='ph ph-magnifying-glass'></i></div>";
        }

        return "
            <form action='/search' class='search-box relative flex items-center' 
                  style='width: {$width}; height: {$height}px; min-width: 200px; background-color: {$bg}; border-radius: {$radius}px; {$borderStyle}'>
                <input type='text' placeholder='{$placeholder}' class='w-full h-full px-4 border-0 outline-none bg-transparent text-xs' style='color: {$color};'>
                <button type='submit' class='px-3 h-full flex items-center justify-center opacity-60 hover:opacity-100 border-0 bg-transparent' style='color: {$color};'>
                    <i class='ph ph-magnifying-glass text-lg'></i>
                </button>
            </form>
        ";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Giao diện</label>
                    <select data-style="layout" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                        <option value="form">Ô nhập liệu (Form)</option>
                        <option value="icon">Chỉ hiện Icon</option>
                    </select>
                </div>
                <div><label class="text-xs text-gray-400 block mb-1">Placeholder</label><input type="text" value="Tìm kiếm..." data-style="text" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs"></div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu nền</label><input type="color" data-style="background-color" value="#f3f4f6" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Màu chữ</label><input type="color" data-style="color" value="#333333" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                     <div><label class="text-xs text-gray-400 block mb-1">Màu viền</label><input type="color" data-style="border-color" value="#dddddd" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                     <div><label class="text-xs text-gray-400 block mb-1">Độ dày viền</label><input type="number" data-style="border-width" value="0" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"></div>
                </div>
                
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Bo góc (px)</label>
                    <input type="range" data-style="border-radius" min="0" max="50" value="20" class="prop-input w-full accent-indigo-500">
                </div>

                <!-- NEW: CÀI ĐẶT CHIỀU CAO -->
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Chiều cao (px)</label>
                    <div class="flex items-center gap-2">
                        <input type="range" data-style="height" min="30" max="60" value="36" class="prop-input flex-1 accent-indigo-500" oninput="this.nextElementSibling.innerText = this.value + \'px\'">
                        <span class="text-xs text-gray-500 w-8 text-right">36px</span>
                    </div>
                </div>

                <div>
                    <label class="text-xs text-gray-400 block mb-1">Chiều rộng (%)</label>
                    <input type="range" data-style="width" min="20" max="100" value="100" class="prop-input w-full accent-indigo-500">
                </div>
            </div>
        ';
    }
}
