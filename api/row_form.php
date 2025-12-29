<?php
// api/row_form.php
$rowLabel = $_GET['label'] ?? 'Row Settings';
?>
<div class="p-4 border-b border-gray-800 mb-4">
    <h3 class="font-bold text-white text-sm flex items-center gap-2">
        <i class="ph ph-layout text-indigo-500"></i>
        Cài đặt: <?php echo htmlspecialchars($rowLabel); ?>
    </h3>
</div>

<div class="px-4 pb-20 space-y-6">

    <!-- 1. Ẩn/Hiện dòng -->
    <div class="flex items-center justify-between bg-red-900/20 border border-red-900/50 p-3 rounded">
        <label class="text-xs text-red-200 font-bold">Ẩn dòng này (Hide)</label>
        <input type="checkbox" data-style="row_hidden" class="prop-input w-4 h-4 rounded bg-gray-900 border-gray-600 accent-red-500 cursor-pointer">
    </div>

    <!-- 2. GIAO DIỆN -->
    <div class="space-y-4">
        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Giao diện</label>
        <div>
            <label class="text-xs text-gray-400 block mb-1">Màu nền (Background)</label>
            <div class="flex gap-2">
                <input type="color" data-style="background-color" class="prop-input w-8 h-8 bg-transparent border border-gray-700 rounded p-0 cursor-pointer">
                <input type="text" placeholder="#ffffff" class="flex-1 bg-gray-800 text-white text-xs px-2 rounded border border-gray-700">
            </div>
        </div>
        <div>
            <label class="text-xs text-gray-400 block mb-1">Màu chữ mặc định</label>
            <div class="flex gap-2">
                <input type="color" data-style="color" class="prop-input w-8 h-8 bg-transparent border border-gray-700 rounded p-0 cursor-pointer">
                <div class="flex-1 text-[10px] text-gray-500 flex items-center">Áp dụng cho text/icon con</div>
            </div>
        </div>
    </div>

    <hr class="border-gray-800">

    <!-- 3. LAYOUT & KÍCH THƯỚC -->
    <div class="space-y-4">
        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Layout & Kích thước</label>
        <div>
            <label class="text-xs text-gray-400 block mb-1">Kiểu bao bao (Container)</label>
            <select data-style="width-mode" class="prop-input w-full bg-gray-800 text-white text-xs p-2 rounded border border-gray-700">
                <option value="container">Giới hạn (Container)</option>
                <option value="full">Toàn màn hình (Full Width)</option>
            </select>
        </div>
        <div>
            <label class="text-xs text-gray-400 block mb-1">Độ rộng (Max Width)</label>
            <div class="flex items-center gap-2">
                <input type="range" data-style="container-width" min="1000" max="1920" step="10" value="1200" class="prop-input flex-1 accent-indigo-500" oninput="this.nextElementSibling.innerText = this.value + 'px'">
                <span class="text-xs text-gray-500 w-10 text-right">1200px</span>
            </div>
        </div>
        
        <hr class="border-gray-800 border-dashed">
        
        <div>
            <label class="text-xs text-gray-400 block mb-1">Chiều cao tối thiểu</label>
            <div class="flex items-center gap-2">
                <input type="range" data-style="min-height" min="40" max="150" value="50" class="prop-input flex-1 accent-indigo-500" oninput="this.nextElementSibling.innerText = this.value + 'px'">
                <span class="text-xs text-gray-500 w-10 text-right">50px</span>
            </div>
        </div>
    </div>

    <!-- 4. HIỆU ỨNG -->
    <div class="space-y-4">
        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hiệu ứng</label>
        <div class="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
            <label class="text-xs text-gray-300">Sticky (Ghim khi cuộn)</label>
            <!-- Quan trọng: đã thêm data-style="sticky" -->
            <input type="checkbox" data-style="sticky" class="prop-input w-4 h-4 rounded bg-gray-700 border-gray-600 accent-indigo-500 cursor-pointer">
        </div>
        <div>
            <label class="text-xs text-gray-400 block mb-1">Đổ bóng (Box Shadow)</label>
            <select data-style="box-shadow" class="prop-input bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 w-full">
                <option value="none">None</option>
                <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Nhẹ (Light)</option>
                <option value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Vừa (Medium)</option>
                <option value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Đậm (Heavy)</option>
            </select>
        </div>
    </div>
</div>