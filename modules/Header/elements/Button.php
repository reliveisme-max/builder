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
        $bg = $settings['background-color'] ?? '#2563eb';
        $color = $settings['color'] ?? '#ffffff';
        $radius = $settings['border-radius'] ?? '4';
        $padX = $settings['padding-x'] ?? '16';

        return "<a href='#' class='inner-box flex items-center justify-center py-2 text-xs font-bold whitespace-nowrap transition hover:opacity-90' 
                style='background-color: {$bg}; color: {$color}; border-radius: {$radius}px; padding-left: {$padX}px; padding-right: {$padX}px; text-decoration: none;'>
                {$text}
            </a>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div><label class="text-xs text-gray-400 block mb-1">Text</label><input type="text" value="Button" data-style="text" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs"></div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Background</label><input type="color" data-style="background-color" value="#2563eb" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Color</label><input type="color" data-style="color" value="#ffffff" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded"></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Radius</label><input type="number" data-style="border-radius" value="4" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Padding X</label><input type="number" data-style="padding-x" value="16" class="prop-input w-full bg-gray-800 text-white p-1 rounded text-xs"></div>
                </div>
            </div>
        ';
    }
}
