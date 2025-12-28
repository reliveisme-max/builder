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

<div class="px-4 pb-20 space-y-5">

    <!-- 1. BACKGROUND & COLOR -->
    <div class="space-y-3">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Giao diện</label>

        <div>
            <label class="text-xs text-gray-400 block mb-1">Màu nền (Background)</label>
            <div class="flex gap-2">
                <input type="color" data-style="background-color"
                    class="prop-input w-8 h-8 bg-transparent border border-gray-700 rounded p-0 cursor-pointer">
                <input type="text" placeholder="#ffffff"
                    class="flex-1 bg-gray-800 text-white text-xs px-2 rounded border border-gray-700">
            </div>
        </div>

        <div>
            <label class="text-xs text-gray-400 block mb-1">Màu chữ mặc định</label>
            <input type="color" data-style="color"
                class="prop-input w-full h-8 bg-transparent border border-gray-700 rounded cursor-pointer">
            <p class="text-[10px] text-gray-600 mt-1">Áp dụng cho text không có màu riêng.</p>
        </div>
    </div>

    <hr class="border-gray-800">

    <!-- 2. DIMENSIONS -->
    <div class="space-y-3">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Kích thước</label>

        <div>
            <label class="text-xs text-gray-400 block mb-1">Chiều cao (Min Height)</label>
            <div class="flex items-center gap-2">
                <input type="range" data-style="min-height" min="30" max="150" value="50"
                    class="prop-input flex-1 accent-indigo-500">
                <span class="text-xs text-gray-500 w-8 text-right">px</span>
            </div>
        </div>

        <div>
            <label class="text-xs text-gray-400 block mb-1">Border Bottom</label>
            <div class="flex items-center gap-2">
                <input type="color" data-style="border-bottom-color"
                    class="prop-input w-8 h-8 bg-transparent border border-gray-700 rounded p-0">
                <select data-style="border-bottom-width"
                    class="prop-input flex-1 bg-gray-800 text-white text-xs p-1.5 rounded border border-gray-700">
                    <option value="0px">None</option>
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                    <option value="4px">4px</option>
                </select>
            </div>
        </div>
    </div>

    <hr class="border-gray-800">

    <!-- 3. ADVANCED (Sticky, Shadow) -->
    <div class="space-y-3">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Hiệu ứng</label>

        <div class="flex items-center justify-between">
            <label class="text-xs text-gray-300">Sticky (Ghim khi cuộn)</label>
            <input type="checkbox" onchange="toggleSticky(this)"
                class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-indigo-500">
        </div>

        <div class="flex items-center justify-between">
            <label class="text-xs text-gray-300">Box Shadow (Đổ bóng)</label>
            <select data-style="box-shadow"
                class="prop-input bg-gray-800 text-white text-xs p-1 rounded border border-gray-700 w-24">
                <option value="none">None</option>
                <option value="0 1px 3px 0 rgb(0 0 0 / 0.1)">Nhẹ</option>
                <option value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Vừa</option>
                <option value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Đậm</option>
            </select>
        </div>
    </div>
</div>

<script>
    // Hàm xử lý Sticky (thêm class sticky)
    function toggleSticky(cb) {
        if (!activeElement) return;
        if (cb.checked) {
            activeElement.style.position = 'sticky';
            activeElement.style.top = '0';
            activeElement.style.zIndex = '999';
        } else {
            activeElement.style.position = 'relative';
            activeElement.style.top = 'auto';
        }
    }
</script>