<?php

namespace Modules\Header\Elements;

use Core\Block;

class Socials extends Block
{
    public function getInfo()
    {
        return ['name' => 'Social Icons', 'icon' => 'ph-share-network', 'group' => 'Basic'];
    }

    public function render($settings = [])
    {
        // Mặc định JSON mẫu
        $defaultJson = json_encode([
            ['icon' => 'ph-facebook-logo', 'link' => '#'],
            ['icon' => 'ph-instagram-logo', 'link' => '#'],
            ['icon' => 'ph-youtube-logo', 'link' => '#']
        ]);

        $config = $settings['social_items'] ?? $defaultJson;
        $items = json_decode($config, true);
        if (!is_array($items)) $items = [];

        $color = $settings['color'] ?? 'inherit';
        $size = $settings['font-size'] ?? '18';
        $gap = $settings['gap'] ?? '12';
        $shape = $settings['shape'] ?? 'none'; // none, circle, square

        // CSS cho Shape
        $shapeClass = '';
        if ($shape === 'circle') $shapeClass = 'rounded-full bg-gray-100 p-2 hover:bg-gray-200';
        if ($shape === 'square') $shapeClass = 'rounded bg-gray-100 p-2 hover:bg-gray-200';

        $html = '';
        foreach ($items as $item) {
            $icon = $item['icon'] ?? 'ph-link';
            $link = $item['link'] ?? '#';
            $html .= "<a href='{$link}' target='_blank' class='social-link hover:opacity-80 transition flex items-center justify-center {$shapeClass}' title='Social'>
                        <i class='ph {$icon}'></i>
                      </a>";
        }

        return "<div class='flex items-center social-group' data-social-items='" . htmlspecialchars($config, ENT_QUOTES, 'UTF-8') . "' 
                     style='gap: {$gap}px; color: {$color}; font-size: {$size}px;'>{$html}</div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <label class="text-xs text-gray-400 block font-bold uppercase">Danh sách Icons</label>
                <div id="social-items-container" class="space-y-2"></div>
                <button type="button" id="btn-add-social" class="w-full py-2 border border-dashed border-gray-600 text-gray-400 text-xs rounded hover:border-gray-400 hover:text-white transition">+ Thêm Icon</button>
                <textarea data-style="social_items" id="hidden-social-items" class="prop-input hidden"></textarea>
                
                <hr class="border-gray-800">
                
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Hình dáng</label>
                    <select data-style="shape" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                        <option value="none">Trống (Chỉ Icon)</option>
                        <option value="circle">Hình tròn (Circle)</option>
                        <option value="square">Hình vuông (Square)</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu Icon</label><input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Size</label><input type="number" data-style="font-size" value="18" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"></div>
                </div>
                <div><label class="text-xs text-gray-400 block mb-1">Khoảng cách</label><input type="range" data-style="gap" min="4" max="30" value="12" class="prop-input w-full accent-indigo-500"></div>
            </div>
        ';
    }
}
