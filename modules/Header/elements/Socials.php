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
        $defaultJson = json_encode([
            ['type' => 'icon', 'val' => 'ph-facebook-logo', 'link' => '#'],
            ['type' => 'icon', 'val' => 'ph-instagram-logo', 'link' => '#']
        ]);

        $config = $settings['social_items'] ?? $defaultJson;
        $items = json_decode($config, true);
        if (!is_array($items)) $items = [];

        $color = $settings['color'] ?? 'inherit';
        $size = intval($settings['font-size'] ?? '20');
        $gap = intval($settings['gap'] ?? '15');
        $shape = $settings['shape'] ?? 'none';

        $shapeClass = '';
        if ($shape === 'circle') $shapeClass = 'rounded-full bg-gray-100 p-2 hover:bg-gray-200';
        if ($shape === 'square') $shapeClass = 'rounded bg-gray-100 p-2 hover:bg-gray-200';

        $html = '';
        // Kích thước box chứa icon (để đảm bảo tròn/vuông đẹp)
        $boxSize = $size + 10;

        foreach ($items as $item) {
            $type = $item['type'] ?? 'icon';
            $val  = $item['val'] ?? '';
            $link = $item['link'] ?? '#';

            $content = '';
            if ($type === 'image') {
                $content = "<img src='{$val}' alt='Social' style='width: {$size}px; height: {$size}px; object-fit: cover; display: block;'>";
            } else {
                $iconClass = (strpos($val, 'ph-') === false) ? 'ph-' . $val : $val;
                $content = "<i class='ph {$iconClass}' style='font-size: {$size}px;'></i>";
            }

            $html .= "<a href='{$link}' target='_blank' class='social-link hover:opacity-80 transition flex items-center justify-center {$shapeClass}' 
                        style='width: {$boxSize}px; height: {$boxSize}px; text-decoration: none; color: inherit;' title='Social'>{$content}</a>";
        }

        return "<div class='flex items-center social-group' data-social-items='" . htmlspecialchars($config, ENT_QUOTES, 'UTF-8') . "' style='gap: {$gap}px; color: {$color};'>{$html}</div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <div class="bg-blue-900/20 p-2 rounded border border-blue-800 text-[10px] text-blue-200">
                    <i class="ph ph-info"></i> Lấy tên icon tại: <a href="https://phosphoricons.com" target="_blank" class="text-blue-400 underline">phosphoricons.com</a>
                </div>

                <label class="text-xs text-gray-400 block font-bold uppercase">Danh sách Icons</label>
                <div id="social-items-container" class="space-y-3"></div>
                <button type="button" id="btn-add-social" class="w-full py-2 border border-dashed border-gray-600 text-gray-400 text-xs rounded hover:border-gray-400 hover:text-white transition flex items-center justify-center gap-2"><i class="ph ph-plus"></i> Thêm Icon</button>
                <textarea data-style="social_items" id="hidden-social-items" class="prop-input hidden"></textarea>
                <hr class="border-gray-800">
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Hình dáng</label>
                        <select data-style="shape" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                            <option value="none">Trống (None)</option>
                            <option value="circle">Hình tròn (Circle)</option>
                            <option value="square">Hình vuông (Square)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Màu Icon</label>
                        <input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Size Icon (px)</label><input type="number" data-style="font-size" value="20" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Khoảng cách (px)</label><input type="number" data-style="gap" value="15" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs"></div>
                </div>

                <hr class="border-gray-800">
                <label class="text-[10px] font-bold text-gray-500 uppercase mb-2 block">HIỂN THỊ TRÊN</label>
                <div class="flex flex-col gap-2">
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_desktop" class="prop-input w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Desktop (>1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_tablet" class="prop-input w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Tablet (768-1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_mobile" class="prop-input w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Mobile (<768px)</span></label>
                </div>
            </div>
        ';
    }
}
