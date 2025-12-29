<?php

namespace Modules\Header\Elements;

use Core\Block;

class Cart extends Block
{
    public function getInfo()
    {
        return ['name' => 'Giỏ hàng', 'icon' => 'ph-shopping-cart', 'group' => 'E-Commerce'];
    }

    public function render($settings = [])
    {
        $layout = $settings['layout'] ?? 'icon';
        $iconType = $settings['icon_type'] ?? 'ph-shopping-cart';
        $color = $settings['color'] ?? 'inherit';
        $size = intval($settings['font-size'] ?? '24');
        $customLink = $settings['custom_link'] ?? '/cart';

        $price = '1.250.000₫';
        $count = '3';
        $extraHtml = '';
        if ($layout === 'icon_price') $extraHtml = "<span class='text-xs font-bold ml-2'>{$price}</span>";
        if ($layout === 'icon_label') $extraHtml = "<span class='text-xs font-bold ml-2'>Giỏ hàng</span>";

        return "
            <a href='{$customLink}' class='flex items-center cursor-pointer group relative px-2 hover:opacity-80 transition' style='text-decoration: none; color: {$color};'>
                <div class='relative flex items-center'>
                    <i class='ph {$iconType}' style='font-size: {$size}px;'></i>
                    <span class='absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white'>{$count}</span>
                </div>
                {$extraHtml}
            </a>
        ";
    }
    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div><label class="text-xs text-gray-400 block mb-1">Đường dẫn (Link)</label><input type="text" data-style="custom_link" value="/cart" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Giao diện</label>
                        <select data-style="layout" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                            <option value="icon">Chỉ Icon</option>
                            <option value="icon_price">Icon + Giá</option>
                            <option value="icon_label">Icon + Chữ</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Loại Icon</label>
                        <select data-style="icon_type" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                            <option value="ph-shopping-cart">Xe đẩy</option>
                            <option value="ph-bag">Túi xách</option>
                            <option value="ph-basket">Giỏ</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu sắc</label><input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Size Icon</label><input type="number" data-style="font-size" value="24" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"></div>
                </div>

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
