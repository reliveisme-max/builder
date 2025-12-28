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
        // Lấy link ảnh, nếu không có thì dùng ảnh demo FPT
        $src = $settings['src'] ?? 'https://fptshop.com.vn/img/fpt-shop.png';

        // --- LOGIC RENDER FIX LỖI VỠ KHUNG ---
        // 1. Wrapper div: height 100% để căn giữa theo chiều dọc của dòng cha.
        // 2. Img: 
        //    - width: 100% (để nhận kích thước từ Wrapper bên ngoài do Builder chỉnh).
        //    - max-height: 55px (QUAN TRỌNG: Giới hạn chiều cao để không đẩy dòng Header bị dày lên).
        //    - object-fit: contain (Giữ tỉ lệ ảnh, không bị méo).

        return "<div class='w-full flex' style='height: 100%; align-items: center; justify-content: inherit;'>
                    <img src='{$src}' alt='Logo' style='width: 100%; height: auto; max-height: 55px; object-fit: contain;'>
                </div>";
    }

    public function getForm()
    {
        return '
            <div class="space-y-4">
                <!-- 1. NHẬP LINK ẢNH -->
                <div>
                    <label class="text-xs text-gray-400 block mb-1 font-bold">URL Ảnh</label>
                    <div class="flex gap-2">
                        <input type="text" data-style="src" placeholder="https://..." class="prop-input flex-1 bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">Paste link ảnh vào đây (Ví dụ: link logo Google, Facebook...)</p>
                </div>

                <hr class="border-gray-800">

                <!-- 2. KÍCH THƯỚC (WIDTH) -->
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Kích thước (Width)</label>
                    <div class="flex items-center gap-2">
                         <input type="range" data-style="width" min="50" max="300" value="150" class="prop-input flex-1 accent-indigo-500">
                         <span class="text-xs text-gray-500 w-8 text-right">px</span>
                    </div>
                </div>

                <!-- 3. CĂN CHỈNH (ALIGNMENT) -->
                <div>
                    <label class="text-xs text-gray-400 block mb-2">Căn chỉnh</label>
                    <div class="flex bg-gray-800 rounded p-1 border border-gray-700">
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'flex-start\')"><i class="ph ph-text-align-left"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'center\')"><i class="ph ph-text-align-center"></i></button>
                        <button type="button" class="flex-1 p-1 hover:bg-gray-700 rounded text-gray-400" onclick="triggerAlign(this, \'flex-end\')"><i class="ph ph-text-align-right"></i></button>
                    </div>
                    <!-- Input ẩn để hứng giá trị justify-content -->
                    <input type="hidden" data-style="justify-content" class="prop-input" id="align-input">
                    
                    <script>
                        function triggerAlign(btn, val) {
                            document.getElementById(\'align-input\').value = val;
                            document.getElementById(\'align-input\').dispatchEvent(new Event(\'input\'));
                            
                            // Đổi màu nút active
                            btn.parentElement.querySelectorAll(\'button\').forEach(b => b.classList.remove(\'bg-indigo-600\', \'text-white\'));
                            btn.classList.add(\'bg-indigo-600\', \'text-white\');
                        }
                    </script>
                </div>
            </div>
        ';
    }
}
