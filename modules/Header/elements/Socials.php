<?php

namespace Modules\Header\Elements;

use Core\Block;

class Socials extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Social Icons',
            'icon' => 'ph-facebook-logo',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        return '
            <div class="flex items-center gap-3 pointer-events-none">
                <i class="ph ph-facebook-logo text-lg cursor-pointer hover:opacity-80"></i>
                <i class="ph ph-instagram-logo text-lg cursor-pointer hover:opacity-80"></i>
                <i class="ph ph-tiktok-logo text-lg cursor-pointer hover:opacity-80"></i>
                <i class="ph ph-youtube-logo text-lg cursor-pointer hover:opacity-80"></i>
            </div>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu Icon</label>
                    <input type="color" data-style="color" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Kích thước (Size)</label>
                    <input type="number" data-style="font-size" value="18" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Khoảng cách (Gap)</label>
                    <input type="range" data-style="gap" min="4" max="20" value="12" class="prop-input w-full accent-indigo-500">
                </div>
            </div>
        ';
    }
}
