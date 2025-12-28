<?php

namespace Modules\Header\Elements;

use Core\Block;

class Text extends Block
{
    public function getInfo()
    {
        return ['name' => 'Text / HTML', 'icon' => 'ph-text-t', 'group' => 'Basic'];
    }

    public function render($settings = [])
    {
        $content = $settings['text_content'] ?? 'Nội dung...';
        $color = $settings['color'] ?? 'inherit';

        // FIX
        $size = intval($settings['font-size'] ?? '14');

        $weight = $settings['font-weight'] ?? '400';
        $align = $settings['text-align'] ?? 'left';

        return "<div class='text-content' style='color: {$color}; font-size: {$size}px; font-weight: {$weight}; text-align: {$align}; line-height: 1.5;'>{$content}</div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <div><label class="text-xs text-gray-400 block mb-1 font-bold">Nội dung</label><textarea data-style="text_content" rows="3" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700">Nội dung...</textarea></div>
                <hr class="border-gray-800">
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu chữ</label><input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Size</label><input type="number" data-style="font-size" value="14" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Độ đậm</label><select data-style="font-weight" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"><option value="400">Thường</option><option value="600">Đậm</option><option value="700">Rất Đậm</option></select></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Căn lề</label><select data-style="text-align" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></div>
                </div>
            </div>
        ';
    }
}
