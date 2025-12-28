<?php

namespace Modules\Header\Elements;

use Core\Block;

class Search extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Search Box',
            'icon' => 'ph-magnifying-glass',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        // FIX: Lấy text placeholder
        $placeholder = $settings['text'] ?? 'Bạn tìm gì...';

        return "<div class='relative w-full' style='min-width: 200px'>
                    <input type='text' placeholder='{$placeholder}' class='w-full h-full px-3 py-1.5 border-0 outline-none bg-transparent' style='font-size: inherit; color: inherit;'>
                    <i class='ph ph-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 opacity-50'></i>
                </div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Placeholder</label>
                    <input type="text" value="Bạn tìm gì..." class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs"
                           oninput="window.activeElement.querySelector(\'input\').placeholder = this.value">
                </div>
                
                <!-- ... Giữ nguyên các phần Width, Radius cũ ... -->
                
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu nền Input</label>
                    <input type="color" data-style="background-color" value="#f3f4f6" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                </div>
            </div>
        ';
    }
}
