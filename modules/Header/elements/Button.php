<?php

namespace Modules\Header\Elements;

use Core\Block;

class Button extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Button',
            'icon' => 'ph-hand-pointing',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        return '
            <a href="#" class="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-blue-700 transition pointer-events-none whitespace-nowrap">
                Mua Ngay
            </a>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Nội dung nút</label>
                    <input type="text" value="Mua Ngay" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs" oninput="this.closest(\'body\').querySelector(\'.ring-2 a\').innerText = this.value">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Màu nền</label>
                        <input type="color" data-style="background-color" value="#2563eb" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Màu chữ</label>
                        <input type="color" data-style="color" value="#ffffff" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                    </div>
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Bo góc (Radius)</label>
                    <input type="range" data-style="border-radius" min="0" max="20" value="4" class="prop-input w-full accent-indigo-500">
                </div>
            </div>
        ';
    }
}
