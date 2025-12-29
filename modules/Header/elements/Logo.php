<?php

namespace Modules\Header\Elements;

use Core\Block;

class Logo extends Block
{
    public function getInfo()
    {
        return ['name' => 'Logo Image', 'icon' => 'ph-image', 'group' => 'Basic'];
    }

    public function render($settings = [])
    {
        $src = $settings['src'] ?? 'https://fptshop.com.vn/img/fpt-shop.png';
        $width = $settings['width'] ?? '150'; // Desktop
        // Mobile width sẽ được xử lý ở Frontend bằng CSS media query hoặc JS nếu cần

        return "<div class='w-full flex items-center' style='height: 100%;'>
                    <img src='{$src}' alt='Logo' style='width: 100% !important; height: auto; object-fit: contain;'>
                </div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <div><label class="text-xs text-gray-400 block mb-1">URL Ảnh</label><input type="text" data-style="src" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Độ rộng Desktop (px)</label>
                    <div class="flex items-center gap-2">
                         <input type="range" data-style="width" min="50" max="500" value="150" class="prop-input flex-1 accent-indigo-500" oninput="this.nextElementSibling.innerText = this.value + \'px\'">
                         <span class="text-xs text-gray-500 w-8 text-right">150px</span>
                    </div>
                </div>

                <div>
                    <label class="text-xs text-gray-400 block mb-1">Độ rộng Mobile (px)</label>
                    <div class="flex items-center gap-2">
                         <input type="number" data-style="mobile_width" value="100" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700">
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">*Chỉ áp dụng khi xem trên điện thoại</p>
                </div>
            </div>
        ';
    }
}
