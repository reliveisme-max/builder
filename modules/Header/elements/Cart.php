<?php

namespace Modules\Header\Elements;

use Core\Block;

class Cart extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Giỏ hàng',
            'icon' => 'ph-shopping-cart',
            'group' => 'E-Commerce'
        ];
    }

    public function render($settings = [])
    {
        return '
            <div class="flex flex-col items-center justify-center cursor-pointer group relative px-2">
                <div class="relative">
                    <i class="ph ph-shopping-cart text-2xl group-hover:text-red-500 transition"></i>
                    <span class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span>
                </div>
                <span class="text-[10px] font-medium mt-0.5 group-hover:text-red-500 transition">Giỏ hàng</span>
            </div>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                 <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu icon</label>
                    <input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" checked class="rounded bg-gray-700 border-gray-600">
                    <label class="text-xs text-gray-300">Hiển thị số lượng</label>
                </div>
            </div>
        ';
    }
}
