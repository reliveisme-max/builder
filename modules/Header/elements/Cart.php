<?php

namespace Modules\Header\Elements;

use Core\Block;
use Core\DataHelper;

class Cart extends Block
{
    public function getInfo()
    {
        return ['name' => 'Giỏ hàng', 'icon' => 'ph-shopping-cart', 'group' => 'E-Commerce'];
    }

    public function render($settings = [])
    {
        $count = DataHelper::getCartCount();
        $color = $settings['color'] ?? 'inherit';
        $size = $settings['font-size'] ?? '24';

        return "
            <a href='cart.php' class='flex flex-col items-center justify-center cursor-pointer group relative px-2' style='text-decoration: none; color: {$color};'>
                <div class='relative'>
                    <i class='ph ph-shopping-cart' style='font-size: {$size}px;'></i>
                    <span class='absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white'>{$count}</span>
                </div>
                <span class='text-[10px] font-medium mt-0.5 opacity-90'>Giỏ hàng</span>
            </a>
        ";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div><label class="text-xs text-gray-400 block mb-1">Màu Icon/Text</label><input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                <div><label class="text-xs text-gray-400 block mb-1">Kích thước Icon</label><input type="range" data-style="font-size" min="16" max="40" value="24" class="prop-input w-full accent-indigo-500"></div>
            </div>
        ';
    }
}
