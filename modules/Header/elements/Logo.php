<?php

namespace Modules\Header\Elements;

use Core\Block;

class Logo extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Logo Image',
            'icon' => 'ph-image',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        // Ưu tiên lấy src từ settings đã lưu, nếu không có thì dùng ảnh mặc định
        $src = $settings['src'] ?? 'https://fptshop.com.vn/img/fpt-shop.png';

        // QUAN TRỌNG: Không set width cứng ở đây nữa.
        // Frontend.php sẽ áp dụng style width vào div bao ngoài.
        // Thẻ img chỉ cần width: 100% để đi theo div cha.

        return "<div class='w-full flex' style='height: 100%; align-items: center;'>
                    <img src='{$src}' alt='Logo' style='width: 100%; height: auto; object-fit: contain;'>
                </div>";
    }

    public function getForm()
    {
        // Form giữ nguyên như cũ
        return '
            <div class="space-y-4">
                <div>
                    <label class="text-xs text-gray-400 block mb-1 font-bold">URL Ảnh</label>
                    <input type="text" data-style="src" class="prop-input bg-gray-800 text-white p-2 rounded w-full text-xs">
                </div>
                <hr class="border-gray-800">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Kích thước (Width)</label>
                    <input type="range" data-style="width" min="50" max="300" value="150" class="prop-input w-full accent-indigo-500">
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-2">Căn lề</label>
                    <div class="flex bg-gray-800 rounded p-1 border border-gray-700">
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'flex-start\')"><i class="ph ph-text-align-left"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'center\')"><i class="ph ph-text-align-center"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'flex-end\')"><i class="ph ph-text-align-right"></i></button>
                    </div>
                    <input type="hidden" data-style="justify-content" class="prop-input" id="align-input">
                    <script>
                        function triggerAlign(btn, val) {
                            document.getElementById(\'align-input\').value = val;
                            document.getElementById(\'align-input\').dispatchEvent(new Event(\'input\'));
                        }
                    </script>
                </div>
            </div>
        ';
    }
}
