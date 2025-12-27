<?php

namespace Modules\Header\Elements;

use Core\Block;

class Logo extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Logo FPT',
            'icon' => 'ph-image', // Class icon của Phosphor
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        $width = $settings['width'] ?? '150px';
        return "<img src='https://fptshop.com.vn/img/fpt-shop.png' style='width: {$width}' alt='FPT Logo' class='pointer-events-none'>";
    }

    public function getForm()
    {
        return '
            <div class="mb-2">
                <label class="text-xs text-gray-400">Chiều rộng</label>
                <input type="text" name="width" value="150px" class="w-full bg-gray-700 text-white text-xs p-1 rounded border border-gray-600">
            </div>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Kích thước (Width)</label>
                    <input type="range" data-style="width" min="50" max="300" value="150" class="prop-input w-full accent-indigo-500">
                </div>

                <div>
                    <label class="text-xs text-gray-400 block mb-2">Căn chỉnh (Alignment)</label>
                    <div class="flex bg-gray-800 rounded p-1 border border-gray-700">
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'flex-start\')"><i class="ph ph-text-align-left"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'center\')"><i class="ph ph-text-align-center"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'flex-end\')"><i class="ph ph-text-align-right"></i></button>
                    </div>
                    <!-- Input ẩn để hứng giá trị -->
                    <input type="hidden" data-style="justify-content" class="prop-input" id="align-input">
                    
                    <script>
                        function triggerAlign(btn, val) {
                            document.getElementById(\'align-input\').value = val;
                            document.getElementById(\'align-input\').dispatchEvent(new Event(\'input\'));
                            // Reset style btns
                            btn.parentElement.querySelectorAll(\'button\').forEach(b => b.classList.remove(\'bg-indigo-600\', \'text-white\'));
                            btn.classList.add(\'bg-indigo-600\', \'text-white\');
                        }
                    </script>
                </div>
            </div>
        ';
    }
}
