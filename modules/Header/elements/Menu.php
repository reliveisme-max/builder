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
            <div class="space-y-4">
                <!-- Màu sắc & Font -->
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Màu chữ</label>
                        <input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded cursor-pointer">
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Font Size</label>
                        <input type="number" data-style="font-size" value="14" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs">
                    </div>
                </div>

                <!-- Typography -->
                <div class="space-y-2">
                    <label class="text-xs text-gray-400 font-bold uppercase">Typography</label>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">Kiểu chữ</span>
                        <select data-style="text-transform" class="prop-input bg-gray-800 text-white text-xs p-1 rounded border border-gray-700">
                            <option value="none">Thường</option>
                            <option value="uppercase">IN HOA</option>
                            <option value="capitalize">Viết Hoa</option>
                        </select>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">Độ đậm</span>
                        <select data-style="font-weight" class="prop-input bg-gray-800 text-white text-xs p-1 rounded border border-gray-700">
                            <option value="400">Normal</option>
                            <option value="500">Medium</option>
                            <option value="600">Semi Bold</option>
                            <option value="700">Bold</option>
                        </select>
                    </div>
                </div>

                <!-- Layout -->
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Khoảng cách (Gap)</label>
                    <input type="range" data-style="gap" min="10" max="60" value="24" class="prop-input w-full accent-indigo-500">
                </div>
            </div>
        ';
    }
}
