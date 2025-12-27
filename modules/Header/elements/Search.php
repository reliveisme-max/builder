<?php

namespace Modules\Header\Elements;

use Core\Block;

class Search extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Search Box',
            'icon' => 'ph-magnifying-glass',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        return '
            <div class="relative w-full pointer-events-none">
                <input type="text" placeholder="Tìm kiếm..." class="w-full bg-white text-black h-9 px-3 rounded text-sm border-0">
                <i class="ph ph-magnifying-glass absolute right-2 top-2 text-gray-500"></i>
            </div>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <!-- Size & Shape -->
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Chiều rộng (%)</label>
                    <input type="range" data-style="width" min="50" max="100" value="100" class="prop-input w-full accent-indigo-500">
                </div>
                
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Bo góc (Radius)</label>
                    <div class="flex items-center gap-2">
                        <input type="range" data-style="border-radius" min="0" max="50" value="4" class="prop-input flex-1 accent-indigo-500">
                        <span class="text-xs text-gray-500">px</span>
                    </div>
                </div>

                <!-- Colors -->
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Màu nền Input</label>
                    <div class="flex gap-2">
                        <div class="w-6 h-6 rounded-full bg-white border cursor-pointer ring-1 ring-white" onclick="document.getElementById(\'bg-search\').value=\'#ffffff\'; document.getElementById(\'bg-search\').dispatchEvent(new Event(\'input\'))"></div>
                        <div class="w-6 h-6 rounded-full bg-gray-100 border cursor-pointer" onclick="document.getElementById(\'bg-search\').value=\'#f3f4f6\'; document.getElementById(\'bg-search\').dispatchEvent(new Event(\'input\'))"></div>
                        <div class="w-6 h-6 rounded-full bg-gray-200 border cursor-pointer" onclick="document.getElementById(\'bg-search\').value=\'#e5e7eb\'; document.getElementById(\'bg-search\').dispatchEvent(new Event(\'input\'))"></div>
                        <input type="color" id="bg-search" data-style="background-color" value="#f3f4f6" class="prop-input w-8 h-6 bg-transparent border border-gray-700 rounded p-0">
                    </div>
                </div>
            </div>
        ';
    }
}
