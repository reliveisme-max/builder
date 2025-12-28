<?php

namespace Modules\Header\Elements;

use Core\Block;

class Divider extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Vertical Line',
            'icon' => 'ph-line-vertical',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        return '
            <div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu kẻ</label>
                    <input type="color" data-style="background-color" value="#d1d5db" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Chiều cao (Height)</label>
                    <input type="range" data-style="height" min="10" max="50" value="24" class="prop-input w-full accent-indigo-500">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Margin (Khoảng cách 2 bên)</label>
                    <input type="range" data-style="margin-inline" min="0" max="20" value="8" class="prop-input w-full accent-indigo-500">
                </div>
            </div>
        ';
    }
}
