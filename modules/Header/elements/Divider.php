<?php

namespace Modules\Header\Elements;

use Core\Block;

class Divider extends Block
{
    public function getInfo()
    {
        return ['name' => 'Vertical Line', 'icon' => 'ph-line-vertical', 'group' => 'Basic'];
    }

    public function render($settings = [])
    {
        $color = $settings['background-color'] ?? '#d1d5db';
        $height = $settings['height'] ?? '24';
        $width = $settings['width'] ?? '1';
        $style = $settings['border-style'] ?? 'solid';

        return "<div class='mx-2 pointer-events-none' style='height: {$height}px; width: 0; border-left: {$width}px {$style} {$color};'></div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Màu sắc</label><input type="color" data-style="background-color" value="#d1d5db" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Chiều cao</label><input type="number" data-style="height" value="24" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Độ dày</label><input type="number" data-style="width" value="1" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Kiểu</label><select data-style="border-style" class="prop-input w-full bg-gray-800 text-white p-1 rounded border border-gray-700 text-xs"><option value="solid">Liền (Solid)</option><option value="dashed">Gạch (Dashed)</option><option value="dotted">Chấm (Dotted)</option></select></div>
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
