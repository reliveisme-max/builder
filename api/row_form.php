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

    <!-- THÊM: Ẩn/Hiện dòng -->
    <div class="flex items-center justify-between bg-red-900/20 border border-red-900/50 p-3 rounded">
        <label class="text-xs text-red-200 font-bold">Ẩn dòng này (Hide)</label>
        <input type="checkbox" data-style="row_hidden"
            class="prop-input w-4 h-4 rounded bg-gray-900 border-gray-600 accent-red-500 cursor-pointer">
    </div>

    <!-- 1. GIAO DIỆN -->
    <div class="space-y-4">
        <!-- (Giữ nguyên code cũ) -->
        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Giao diện</label>
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
            <div class="flex gap-2">
                <input type="color" data-style="color"
                    class="prop-input w-8 h-8 bg-transparent border border-gray-700 rounded p-0 cursor-pointer">
                <div class="flex-1 text-[10px] text-gray-500 flex items-center">Áp dụng cho text/icon con</div>
            </div>
        </div>
    </div>

    <hr class="border-gray-800">

    <!-- 2. KÍCH THƯỚC (Giữ nguyên) -->
    <div class="space-y-4">
        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Layout & Kích thước</label>
        <div>
            <label class="text-xs text-gray-400 block mb-1">Kiểu bao bao (Container)</label>
            <select id="sel-width-mode" data-style="width-mode" onchange="toggleContainerWidth(this.value)"
                class="prop-input w-full bg-gray-800 text-white text-xs p-2 rounded border border-gray-700">
                <option value="container">Giới hạn (Container)</option>
                <option value="full">Toàn màn hình (Full Width)</option>
            </select>
        </div>
        <div id="container-width-control">
            <label class="text-xs text-gray-400 block mb-1">Độ rộng (Max Width)</label>
            <div class="flex items-center gap-2">
                <input type="range" id="input-width" data-style="container-width" min="1000" max="1920" step="10"
                    value="1200" class="prop-input flex-1 accent-indigo-500"
                    oninput="document.getElementById('display-width').innerText = this.value + 'px'">
                <span id="display-width" class="text-xs text-gray-500 w-10 text-right">1200px</span>
            </div>
        </div>
        <hr class="border-gray-800 border-dashed">
        <div>
            <label class="text-xs text-gray-400 block mb-1">Chiều cao tối thiểu</label>
            <div class="flex items-center gap-2">
                <input type="range" id="input-height" data-style="min-height" min="40" max="150" value="50"
                    class="prop-input flex-1 accent-indigo-500"
                    oninput="document.getElementById('display-height').innerText = this.value + 'px'">
                <span id="display-height" class="text-xs text-gray-500 w-10 text-right">50px</span>
            </div>
        </div>
        <script>
            function toggleContainerWidth(val) {
                const el = document.getElementById('container-width-control');
                if (val === 'full') el.style.display = 'none';
                else el.style.display = 'block';
            }
            setTimeout(() => {
                const val = document.getElementById('sel-width-mode').value;
                toggleContainerWidth(val);
            }, 100);
        </script>
    </div>

    <!-- 3. HIỆU ỨNG (Giữ nguyên) -->
    <div class="space-y-4">
        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hiệu ứng</label>
        <div class="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
            <label class="text-xs text-gray-300">Sticky (Ghim khi cuộn)</label>
            <input type="checkbox" id="chk-sticky" onchange="toggleSticky(this)"
                class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-indigo-500 cursor-pointer">
        </div>
        <div>
            <label class="text-xs text-gray-400 block mb-1">Đổ bóng (Box Shadow)</label>
            <select data-style="box-shadow"
                class="prop-input bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 w-full">
                <option value="none">None</option>
                <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Nhẹ (Light)</option>
                <option value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Vừa (Medium)</option>
                <option value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Đậm (Heavy)</option>
            </select>
        </div>
    </div>
</div>

<script>
    function toggleSticky(cb) {
        if (!window.activeElement) return;
        if (cb.checked) {
            window.activeElement.style.position = 'sticky';
            window.activeElement.style.top = '0';
            window.activeElement.style.zIndex = '999';
        } else {
            window.activeElement.style.position = 'relative';
            window.activeElement.style.top = 'auto';
        }
    }
    (function syncCurrentValues() {
        if (!window.activeElement) return;
        const style = window.getComputedStyle(window.activeElement);
        const h = parseInt(style.minHeight);
        if (!isNaN(h)) {
            const range = document.getElementById('input-height');
            const display = document.getElementById('display-height');
            if (range && display) {
                range.value = Math.max(h, 40);
                display.innerText = range.value + 'px';
            }
        }
        const pos = style.position;
        if (pos === 'sticky') document.getElementById('chk-sticky').checked = true;
    })();
</script>