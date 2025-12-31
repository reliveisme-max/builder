<?php

namespace Modules\Header\Elements;

use Core\Block;

class Button extends Block
{
    public function getInfo()
    {
        return ['name' => 'Button', 'icon' => 'ph-hand-pointing', 'group' => 'Basic'];
    }

    // Phần render PHP này dành cho Frontend (khi F5 trang chủ)
    public function render($settings = [])
    {
        $text = $settings['text'] ?? 'Button';
        $href = $settings['href'] ?? '#';
        $bg = $settings['background-color'] ?? '#2563eb';
        $color = $settings['color'] ?? '#ffffff';
        $hBg = $settings['hover_bg'] ?? '#1d4ed8';
        $hColor = $settings['hover_color'] ?? '#ffffff';
        $radius = intval($settings['border-radius'] ?? '4');
        $height = intval($settings['height'] ?? '40'); // Mặc định 40px

        // Class 'inner-box' dùng để JS frontend bắt sự kiện hover
        return "<a href='{$href}' class='inner-box flex items-center justify-center px-4 text-xs font-bold transition duration-200' 
                data-original-bg='{$bg}' data-original-color='{$color}' 
                data-hover-bg='{$hBg}' data-hover-color='{$hColor}'
                style='background-color: {$bg}; color: {$color}; border-radius: {$radius}px; height: {$height}px; text-decoration: none; display: inline-flex;'>
                {$text}
            </a>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Text</label><input type="text" data-style="text" value="Button" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Link</label><input type="text" data-style="href" value="#" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"></div>
                </div>
                
                <hr class="border-gray-800">
                <label class="text-[10px] font-bold text-gray-500 uppercase">TRẠNG THÁI THƯỜNG</label>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu nền</label><input type="color" data-style="background-color" value="#2563eb" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Màu chữ</label><input type="color" data-style="color" value="#ffffff" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>
                
                <label class="text-[10px] font-bold text-gray-500 uppercase mt-2 block">TRẠNG THÁI HOVER</label>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Nền Hover</label><input type="color" data-style="hover_bg" value="#1d4ed8" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Chữ Hover</label><input type="color" data-style="hover_color" value="#ffffff" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>
                
                <hr class="border-gray-800">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Bo góc (px)</label>
                        <input type="number" data-style="border-radius" value="4" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs">
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Chiều cao (px)</label>
                        <input type="number" data-style="height" value="40" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs">
                    </div>
                </div>
                
                <hr class="border-gray-800">
                <label class="text-[10px] font-bold text-gray-500 uppercase mb-2 block">HIỂN THỊ TRÊN</label>
                <div class="flex flex-col gap-2">
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_desktop" class="prop-input w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Desktop (>1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_tablet" class="prop-input w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Tablet (768-1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_mobile" class="prop-input w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Mobile (<768px)</span></label>
                </div>
            </div>
        ';
    }
}
