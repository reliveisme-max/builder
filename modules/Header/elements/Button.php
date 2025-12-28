<?php

namespace Modules\Header\Elements;

use Core\Block;

class Button extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Button',
            'icon' => 'ph-hand-pointing',
            'group' => 'Basic'
        ];
    }

    public function render($settings = [])
    {
        // FIX: Lấy text từ settings, nếu không có thì mặc định là 'Button'
        $text = $settings['text'] ?? 'Button';

        // Lưu ý: Style (màu nền, bo góc) đã được Frontend.php xử lý ở div bao ngoài
        // Thẻ a bên trong chỉ cần inherit và full size
        return "<a href='#' class='flex items-center justify-center w-full h-full px-4 py-2 pointer-events-none whitespace-nowrap' style='color: inherit; text-decoration: none;'>
                {$text}
            </a>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Nội dung nút</label>
                    <!-- Sự kiện oninput giúp cập nhật text ngay lập tức trên canvas -->
                    <input type="text" value="Button" class="prop-input w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs" 
                           oninput="updateText(this)">
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Màu nền</label>
                        <input type="color" data-style="background-color" value="#2563eb" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Màu chữ</label>
                        <input type="color" data-style="color" value="#ffffff" class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded">
                    </div>
                </div>
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Bo góc (Radius)</label>
                    <input type="range" data-style="border-radius" min="0" max="20" value="4" class="prop-input w-full accent-indigo-500">
                </div>
                
                <!-- Script nhỏ để cập nhật text real-time -->
                <script>
                    function updateText(input) {
                        // Tìm thẻ a hoặc button trong element đang active
                        const target = window.activeElement.querySelector("a, button");
                        if(target) target.innerText = input.value;
                    }
                </script>
            </div>
        ';
    }
}
