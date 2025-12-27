<?php

namespace Modules\Header\Elements;

use Core\Block;

class Menu extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Main Menu',
            'icon' => 'ph-list',
            'group' => 'Navigation'
        ];
    }

    public function render($settings = [])
    {
        // Mặc định hiển thị danh sách giả lập
        return '
            <nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden">
                <a href="#" class="hover:text-blue-600 transition">Điện thoại</a>
                <a href="#" class="hover:text-blue-600 transition">Laptop</a>
                <a href="#" class="hover:text-blue-600 transition">Apple</a>
                <a href="#" class="hover:text-blue-600 transition">PC - Linh kiện</a>
                <a href="#" class="hover:text-blue-600 transition">Phụ kiện</a>
            </nav>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu chữ</label>
                    <input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded cursor-pointer">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Font Size (px)</label>
                    <input type="number" data-style="font-size" value="14" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Khoảng cách (Gap)</label>
                    <input type="range" data-style="gap" min="10" max="50" class="prop-input w-full">
                </div>
            </div>
        ';
    }
}
