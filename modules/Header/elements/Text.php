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
        $content = $settings['text'] ?? '<span class="font-bold">Hotline:</span> 1800 6601';
        return "<div class='text-sm pointer-events-none whitespace-nowrap text-content'>{$content}</div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Nội dung (Hỗ trợ HTML)</label>
                    <!-- SỬA Ở ĐÂY -->
                    <input type="text" value="Hotline: 1800 6601" data-style="text" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Cỡ chữ</label>
                    <input type="number" data-style="font-size" value="14" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                </div>
                 <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu chữ</label>
                    <input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                </div>
            </div>
        ';
    }
}
