<?php

namespace Modules\Header\Elements;

use Core\Block;

class Menu extends Block
{
    public function getInfo()
    {
        return ['name' => 'Main Menu', 'icon' => 'ph-list', 'group' => 'Navigation'];
    }
    public function render($settings = [])
    {
        $defaultJson = json_encode([['text' => 'Trang chủ', 'href' => '/'], ['text' => 'Sản phẩm', 'href' => '/shop']]);
        $config = $settings['menu_config'] ?? $defaultJson;
        $items = json_decode($config, true);
        if (!is_array($items)) $items = [];

        $color = $settings['color'] ?? 'inherit';
        $size = intval($settings['font-size'] ?? '14');
        $gap = intval($settings['gap'] ?? '20');
        $weight = $settings['font-weight'] ?? '500';
        $transform = $settings['text-transform'] ?? 'none';
        $hoverClass = "hover:text-blue-600";
        if (($settings['hover_style'] ?? '') === 'underline') $hoverClass = "hover:underline underline-offset-4";

        $html = '';
        foreach ($items as $item) {
            $html .= "<a href='{$item['href']}' class='{$hoverClass} transition'>{$item['text']}</a>";
        }
        return "<nav class='flex items-center whitespace-nowrap overflow-hidden menu-nav' data-menu-config='" . htmlspecialchars($config, ENT_QUOTES, 'UTF-8') . "' style='color: {$color}; font-size: {$size}px; gap: {$gap}px; text-transform: {$transform}; font-weight: {$weight};'>{$html}</nav>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <label class="text-xs text-gray-400 block font-bold uppercase">Danh sách Menu</label>
                <div id="menu-items-container" class="space-y-2"></div>
                <button type="button" id="btn-add-menu" class="w-full py-2 border border-dashed border-gray-600 text-gray-400 text-xs rounded hover:border-gray-400 hover:text-white transition">+ Thêm menu</button>
                <textarea data-style="menu_config" id="hidden-menu-config" class="prop-input hidden"></textarea>
                <hr class="border-gray-800">
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Kiểu chữ</label><select data-style="text-transform" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs border border-gray-700"><option value="none">Thường</option><option value="uppercase">IN HOA</option><option value="capitalize">Viết Hoa</option></select></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Độ đậm</label><select data-style="font-weight" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs border border-gray-700"><option value="400">400 (Thường)</option><option value="500">500 (Vừa)</option><option value="600">600 (Đậm)</option><option value="700">700 (Rất đậm)</option></select></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu chữ</label><input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Size (px)</label><input type="number" data-style="font-size" value="14" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"></div>
                </div>
                <div><label class="text-xs text-gray-400 block mb-1">Khoảng cách (Gap)</label><input type="range" data-style="gap" min="10" max="60" value="20" class="prop-input w-full accent-indigo-500"></div>

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
