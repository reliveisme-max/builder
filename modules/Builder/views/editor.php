<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relive Builder - Split View</title>

    <!-- TailwindCSS & Icons -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/builder.css">

    <style>
    body {
        font-family: 'Inter', sans-serif;
        overflow: hidden;
    }

    /* TÙY CHỈNH THANH CUỘN */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
    }

    /* VÙNG SÂN KHẤU (PREVIEW) */
    #stage-area {
        background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
        background-size: 20px 20px;
        background-color: #f9fafb;
        box-shadow: inset 0 -10px 20px rgba(0, 0, 0, 0.05);
        transition: all 0.3s;
    }

    /* KHUNG MÔ PHỎNG (Điện thoại/PC) */
    #simulation-frame {
        background: white;
        margin: 0 auto;
        transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.25);
        position: relative;
        display: flex;
        flex-direction: column;
    }

    /* CHẾ ĐỘ MOBILE VIEW */
    #simulation-frame.mode-mobile {
        width: 375px !important;
        height: 100%;
        border: 8px solid #1f2937;
        border-radius: 30px;
        overflow: hidden;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    /* Tai thỏ giả cho Mobile */
    #simulation-frame.mode-mobile::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 25px;
        background: #1f2937;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        z-index: 9999;
    }

    /* CHẾ ĐỘ TABLET VIEW */
    #simulation-frame.mode-tablet {
        width: 768px !important;
        height: 95%;
        border: 8px solid #1f2937;
        border-radius: 20px;
        overflow: hidden;
        margin-top: 20px;
    }

    /* CHẾ ĐỘ DESKTOP (Mặc định) */
    #simulation-frame.mode-desktop {
        width: 100% !important;
        height: 100%;
        border: none;
        border-radius: 0;
        overflow-y: auto;
    }

    /* Ẩn thanh cuộn của iframe/preview container */
    #preview-content {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background: white;
    }

    /* Wrapper Header trong Preview (Không cho tương tác chuột, chỉ xem) */
    .preview-header-wrapper {
        pointer-events: none;
    }
    </style>
</head>

<body class="bg-gray-50 h-screen flex text-sm text-gray-700">

    <!-- 1. LEFT SIDEBAR (Components) -->
    <aside class="w-[240px] bg-[#18181b] border-r border-gray-800 flex flex-col flex-shrink-0 z-50">
        <div
            class="h-14 border-b border-gray-800 flex items-center px-4 font-semibold text-white tracking-wide shadow-sm">
            <i class="ph ph-cube text-xl mr-2 text-indigo-500"></i> Builder
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
                <div class="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest">Blocks</div>
                <div class="grid grid-cols-2 gap-2">
                    <?php if (!empty($components)): ?>
                    <?php foreach ($components as $comp): ?>
                    <div class="draggable-item bg-[#27272a] hover:bg-[#323236] hover:text-white p-3 rounded-md cursor-grab border border-transparent hover:border-gray-600 transition flex flex-col items-center gap-2 group shadow-sm"
                        draggable="true" data-class="<?php echo $comp['class']; ?>">
                        <i
                            class="ph <?php echo $comp['icon']; ?> text-2xl text-gray-400 group-hover:text-blue-400 transition transform group-hover:scale-110 duration-200"></i>
                        <span
                            class="text-xs font-medium text-gray-400 group-hover:text-white text-center"><?php echo $comp['name']; ?></span>
                    </div>
                    <?php endforeach; ?>
                    <?php else: ?>
                    <div class="col-span-2 text-center text-gray-500">Empty</div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </aside>

    <!-- 2. MAIN AREA (Split View) -->
    <main class="flex-1 flex flex-col min-w-0 relative">

        <!-- TOOLBAR -->
        <header
            class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-40 relative">
            <div class="flex items-center gap-2">
                <span class="text-gray-800 font-bold text-lg tracking-tight">Header Builder</span>
            </div>

            <div class="flex items-center gap-3">
                <!-- View Mode Switcher -->
                <div class="bg-gray-100 rounded-lg p-1 flex gap-1 border border-gray-200">
                    <button
                        class="view-mode-btn w-8 h-8 rounded-md bg-white text-gray-800 shadow-sm flex items-center justify-center border border-gray-200 transition"
                        data-mode="desktop" title="Desktop View">
                        <i class="ph ph-desktop"></i>
                    </button>
                    <button
                        class="view-mode-btn w-8 h-8 rounded-md text-gray-500 hover:text-gray-800 flex items-center justify-center border border-transparent transition"
                        data-mode="tablet" title="Tablet View">
                        <i class="ph ph-device-tablet"></i>
                    </button>
                    <button
                        class="view-mode-btn w-8 h-8 rounded-md text-gray-500 hover:text-gray-800 flex items-center justify-center border border-transparent transition"
                        data-mode="mobile" title="Mobile View">
                        <i class="ph ph-device-mobile"></i>
                    </button>
                </div>

                <div class="w-px h-6 bg-gray-300 mx-2"></div>

                <button id="btn-save"
                    class="bg-[#111827] hover:bg-black text-white px-5 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg shadow-gray-400/20 text-xs uppercase tracking-wide">
                    <i class="ph ph-floppy-disk text-lg"></i> Save
                </button>
            </div>
        </header>

        <!-- TẦNG 1: SÂN KHẤU (PREVIEW AREA) -->
        <div id="stage-area" class="flex-1 overflow-hidden relative flex flex-col">
            <!-- Khung mô phỏng -->
            <div id="simulation-frame" class="mode-desktop">

                <!-- NỘI DUNG LIVE PREVIEW -->
                <div id="preview-content">
                    <!-- Header sẽ được JS clone và render vào đây -->
                    <div id="live-header-container" class="preview-header-wrapper"></div>

                    <!-- Nội dung giả lập bên dưới (Placeholder Body) -->
                    <div class="p-4 bg-white opacity-50 grayscale pointer-events-none select-none">
                        <div class="w-full h-[300px] bg-gray-200 rounded-lg mb-4"></div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="h-40 bg-gray-100 rounded"></div>
                            <div class="h-40 bg-gray-100 rounded"></div>
                            <div class="h-40 bg-gray-100 rounded"></div>
                            <div class="h-40 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TẦNG 2: BÀN ĐIỀU KHIỂN (EDITOR PANEL) -->
        <div id="editor-panel"
            class="h-[350px] bg-white border-t border-gray-300 flex flex-col z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] relative">

            <!-- Header của Panel -->
            <div
                class="h-9 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 text-xs font-bold text-gray-500 uppercase select-none">
                <span><i class="ph ph-faders mr-1"></i> Structure & Settings (Drag & Drop Here)</span>
                <span class="text-indigo-600 cursor-pointer hover:underline" onclick="toggleEditorHeight()">
                    <i class="ph ph-arrows-out-line-vertical"></i> Resize
                </span>
            </div>

            <!-- Vùng chứa các dòng (Top/Main/Bottom) -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 relative">

                <!-- 1. TOP BAR -->
                <div class="builder-row" data-label="Top Bar">
                    <div class="row-label row-settings-trigger">
                        <span>TOP</span>
                    </div>
                    <div class="hb-inner-content">
                        <div class="drop-zone w-1/4 flex justify-start" data-zone="top_left"></div>
                        <div class="drop-zone flex-1 flex justify-center" data-zone="top_center"></div>
                        <div class="drop-zone w-1/4 flex justify-end" data-zone="top_right"></div>
                    </div>
                </div>

                <!-- 2. MAIN HEADER -->
                <div class="builder-row" data-label="Main Header">
                    <div class="row-label row-settings-trigger">
                        <span>MAIN</span>
                    </div>
                    <div class="hb-inner-content" style="min-height: 80px;">
                        <div class="drop-zone w-1/4 flex justify-start" data-zone="main_left">
                            <div class="empty-placeholder">Left</div>
                        </div>
                        <div class="drop-zone flex-1 flex justify-center" data-zone="main_center">
                            <div class="empty-placeholder">Center</div>
                        </div>
                        <div class="drop-zone w-1/4 flex justify-end" data-zone="main_right">
                            <div class="empty-placeholder">Right</div>
                        </div>
                    </div>
                </div>

                <!-- 3. BOTTOM HEADER -->
                <div class="builder-row" data-label="Bottom Header">
                    <div class="row-label row-settings-trigger">
                        <span>BTM</span>
                    </div>
                    <div class="hb-inner-content">
                        <div class="drop-zone w-1/6 flex justify-start" data-zone="bottom_left"></div>
                        <div class="drop-zone flex-1 flex justify-center" data-zone="bottom_center">
                            <div class="empty-placeholder">Menu</div>
                        </div>
                        <div class="drop-zone w-1/6 flex justify-end" data-zone="bottom_right"></div>
                    </div>
                </div>

            </div>
        </div>
    </main>

    <!-- 3. RIGHT SIDEBAR (Properties) -->
    <aside class="w-[300px] bg-[#18181b] border-l border-gray-800 flex flex-col flex-shrink-0 z-50">
        <div
            class="h-14 border-b border-gray-800 flex items-center px-4 justify-between font-semibold text-white shadow-sm">
            <span>Properties</span>
            <i class="ph ph-trash hover:text-red-500 cursor-pointer transition p-2 rounded hover:bg-gray-800"
                title="Delete Element" id="global-delete-btn"></i>
        </div>
        <div id="property-panel" class="flex-1 overflow-y-auto p-5">
            <div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
                <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center"><i
                        class="ph ph-sliders text-3xl"></i></div>
                <p class="text-xs text-center px-8 leading-5">Click vào Element ở dưới<br>để sửa cài đặt.</p>
            </div>
        </div>
    </aside>

    <script>
    // Dữ liệu đã lưu từ DB
    window.savedData = <?php echo $savedData ? $savedData : '[]'; ?>;

    // Hàm tiện ích Resize Panel
    function toggleEditorHeight() {
        const panel = document.getElementById('editor-panel');
        const h = panel.style.height;
        if (h === '500px') panel.style.height = '350px';
        else panel.style.height = '500px';
    }
    </script>

    <!-- Load Scripts -->
    <script src="assets/js/builder.js"></script>
    <script src="assets/js/ajax.js"></script>
</body>

</html>