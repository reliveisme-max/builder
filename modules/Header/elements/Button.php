<?php

namespace Modules\Header\Elements;

use Core\Block;

class Button extends Block
{
    public function getInfo()
    {
        return ['name' => 'Button', 'icon' => 'ph-hand-pointing', 'group' => 'Basic'];
    }

    public function render($settings = [])
    {
        $text = $settings['text'] ?? 'Button';
        $href = $settings['href'] ?? '#';
        $bg = $settings['background-color'] ?? '#2563eb';
        $color = $settings['color'] ?? '#ffffff';

        // Hover
        $hBg = $settings['hover_bg'] ?? '#1d4ed8';
        $hColor = $settings['hover_color'] ?? '#ffffff';

        $radius = intval($settings['border-radius'] ?? '4');
        $borderW = intval($settings['border-width'] ?? '0');

        // Border color luôn là currentColor (theo màu chữ)
        return "<a href='{$href}' class='inner-box flex items-center justify-center py-2 px-4 text-xs font-bold transition duration-200' 
                data-original-bg='{$bg}' data-hover-bg='{$hBg}' 
                data-original-color='{$color}' data-hover-color='{$hColor}'
                style='background-color: {$bg}; color: {$color}; border-radius: {$radius}px; border: {$borderW}px solid currentColor; text-decoration: none;'>
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
                
                <label class="text-[10px] font-bold text-gray-500 uppercase">NORMAL STATE</label>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Background</label><input type="color" data-style="background-color" value="#2563eb" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Text Color</label><input type="color" data-style="color" value="#ffffff" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>

                <label class="text-[10px] font-bold text-gray-500 uppercase mt-2 block">HOVER STATE</label>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Hover Bg</label><input type="color" data-style="hover_bg" value="#1d4ed8" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Hover Text</label><input type="color" data-style="hover_color" value="#ffffff" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>

                <hr class="border-gray-800">
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Độ dày viền</label><input type="number" data-style="border-width" value="0" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Bo góc</label><input type="number" data-style="border-radius" value="4" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"></div>
                </div>
            </div>
        ';
    }
}
