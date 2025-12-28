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
        $width = $settings['width'] ?? '150';
        // Logic Width: Mặc định là width desktop, trên mobile có thể dùng CSS media query nếu muốn, tạm thời fix width max
        return "<div class='w-full flex items-center justify-inherit' style='height: 100%;'>
                    <img src='{$src}' alt='Logo' style='width: {$width}px; height: auto; max-height: 55px; object-fit: contain;'>
                </div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <div><label class="text-xs text-gray-400 block mb-1">URL Ảnh</label><input type="text" data-style="src" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Chiều rộng (Width)</label>
                    <div class="flex items-center gap-2">
                         <input type="range" data-style="width" min="50" max="300" value="150" class="prop-input flex-1 accent-indigo-500">
                         <span class="text-xs text-gray-500 w-8 text-right">px</span>
                    </div>
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-2">Căn chỉnh</label>
                    <div class="flex bg-gray-800 rounded p-1 border border-gray-700">
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="document.getElementById(\'align-inp\').value=\'flex-start\';document.getElementById(\'align-inp\').dispatchEvent(new Event(\'input\'))"><i class="ph ph-text-align-left"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="document.getElementById(\'align-inp\').value=\'center\';document.getElementById(\'align-inp\').dispatchEvent(new Event(\'input\'))"><i class="ph ph-text-align-center"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="document.getElementById(\'align-inp\').value=\'flex-end\';document.getElementById(\'align-inp\').dispatchEvent(new Event(\'input\'))"><i class="ph ph-text-align-right"></i></button>
                    </div>
                    <input type="hidden" data-style="justify-content" id="align-inp" class="prop-input">
                </div>
            </div>
        ';
    }
}
