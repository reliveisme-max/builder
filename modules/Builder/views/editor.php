<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relive Builder</title>

    <!-- Resources -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/builder.css">

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        /* --- 1. GENERAL --- */
        .workspace-bg {
            background-color: #f3f4f6;
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        /* --- 2. DROP ZONES --- */
        .drop-zone {
            transition: all 0.2s ease;
            position: relative;
            min-height: 100%;
        }

        /* Viền mặc định mờ */
        .drop-zone:empty,
        .drop-zone:has(.empty-placeholder) {
            border: 1px dashed #e5e7eb;
        }

        /* Hover vào dòng thì hiện viền cột */
        .builder-row:hover .drop-zone:empty {
            border-color: #d1d5db;
        }

        .drop-zone.drag-over {
            background-color: #eff6ff !important;
            border: 1px dashed #3b82f6 !important;
            z-index: 10;
        }

        /* --- 3. PLACEHOLDER --- */
        .empty-placeholder {
            color: #9ca3af;
            font-size: 11px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 32px;
            user-select: none;
            cursor: default;
        }

        .empty-placeholder::before {
            content: '+';
            font-size: 14px;
            margin-right: 4px;
            color: #d1d5db;
        }

        /* --- 4. ROW HANDLE (TAB BÊN TRÁI) --- */
        .row-handle {
            position: absolute;
            left: -120px;
            /* Đẩy hẳn ra ngoài */
            top: 0;
            bottom: 0;
            width: 120px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            opacity: 0;
            transition: all 0.2s ease;
            pointer-events: none;
            z-index: 50;
        }

        .builder-row:hover .row-handle,
        .row-handle:hover {
            opacity: 1;
            pointer-events: auto;
        }

        .handle-btn {
            background-color: #3b82f6;
            color: white;
            padding: 4px 10px;
            border-radius: 4px 0 0 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transform: translateX(5px);
            transition: transform 0.2s;
        }

        .builder-row:hover .handle-btn {
            transform: translateX(0);
        }

        .handle-btn:hover {
            background-color: #2563eb;
        }

        /* Active State */
        .builder-row.is-selected .row-handle {
            opacity: 1;
        }

        .builder-row.is-selected .handle-btn {
            background-color: #4f46e5;
            font-weight: bold;
        }
    </style>
</head>

<body
    class="bg-[#111827] text-gray-300 h-screen flex overflow-hidden text-sm selection:bg-indigo-500 selection:text-white">

    <!-- LEFT SIDEBAR -->
    <aside class="w-[260px] bg-[#18181b] border-r border-gray-800 flex flex-col flex-shrink-0 z-30">
        <div
            class="h-14 border-b border-gray-800 flex items-center px-4 font-semibold text-white tracking-wide shadow-sm">
            <i class="ph ph-cube text-xl mr-2 text-indigo-500"></i> Components
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
                <div class="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest">Blocks</div>
                <div class="grid grid-cols-2 gap-2">
                    <?php if (!empty($components)): foreach ($components as $comp): ?>
                            <div class="draggable-item bg-[#27272a] hover:bg-[#323236] hover:text-white p-3 rounded-md cursor-grab border border-transparent hover:border-gray-600 transition flex flex-col items-center gap-2 group shadow-sm"
                                draggable="true" data-class="<?php echo $comp['class']; ?>">
                                <i
                                    class="ph <?php echo $comp['icon']; ?> text-2xl text-gray-400 group-hover:text-blue-400 transition transform group-hover:scale-110"></i>
                                <span
                                    class="text-xs font-medium text-gray-400 group-hover:text-white text-center"><?php echo $comp['name']; ?></span>
                            </div>
                    <?php endforeach;
                    endif; ?>
                </div>
            </div>
        </div>
    </aside>

    <!-- CENTER WORKSPACE -->
    <main class="flex-1 flex flex-col min-w-0 bg-[#f3f4f6]">
        <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
            <span class="text-gray-800 font-bold text-lg">Header Builder</span>
            <div class="flex items-center gap-3">
                <div class="bg-gray-100 rounded-lg p-1 flex gap-1 border border-gray-200">
                    <button
                        class="w-8 h-8 rounded-md bg-white text-gray-800 shadow-sm flex items-center justify-center"><i
                            class="ph ph-desktop"></i></button>
                    <button class="w-8 h-8 rounded-md hover:bg-white text-gray-500 hover:text-gray-800 transition"><i
                            class="ph ph-device-tablet"></i></button>
                    <button class="w-8 h-8 rounded-md hover:bg-white text-gray-500 hover:text-gray-800 transition"><i
                            class="ph ph-device-mobile"></i></button>
                </div>
                <div class="w-px h-6 bg-gray-300 mx-2"></div>
                <button id="btn-save"
                    class="bg-[#111827] hover:bg-black text-white px-5 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg text-xs uppercase tracking-wide">
                    <i class="ph ph-floppy-disk text-lg"></i> Save
                </button>
            </div>
        </header>

        <div class="flex-1 overflow-auto p-8 flex justify-center workspace-bg relative">
            <div id="canvas-frame"
                class="w-full max-w-[1200px] flex flex-col min-h-[800px] transition-all duration-300">

                <!-- Browser Mockup -->
                <div
                    class="h-9 bg-[#e5e7eb] rounded-t-lg border border-b-0 border-[#d1d5db] flex items-center px-4 gap-2 select-none sticky top-0 z-30">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#eab308]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                    </div>
                    <div
                        class="ml-4 flex-1 max-w-[400px] bg-white h-6 rounded text-[10px] flex items-center px-3 text-gray-400 border border-gray-300">
                        https://fptshop.com.vn</div>
                </div>

                <!-- MAIN CANVAS -->
                <div
                    class="bg-white shadow-2xl rounded-b-lg overflow-visible border border-[#d1d5db] flex-1 flex flex-col relative">

                    <!-- 1. TOP BAR -->
                    <div class="builder-row group min-h-[40px] bg-[#f8f9fa] flex items-stretch border-b border-gray-100 relative"
                        data-label="Top Bar">
                        <!-- Handle -->
                        <div class="row-handle">
                            <div class="handle-btn"><i class="ph ph-gear-six"></i> Top Bar</div>
                        </div>

                        <div class="drop-zone flex-1 border-r border-dashed border-gray-200 p-2 flex items-center"
                            data-zone="top_left">
                            <div class="empty-placeholder">Left</div>
                        </div>
                        <div class="drop-zone flex-1 border-r border-dashed border-gray-200 p-2 flex items-center justify-center"
                            data-zone="top_center">
                            <div class="empty-placeholder">Center</div>
                        </div>
                        <div class="drop-zone flex-1 p-2 flex items-center justify-end" data-zone="top_right">
                            <div class="empty-placeholder">Right</div>
                        </div>
                    </div>

                    <!-- 2. MAIN HEADER -->
                    <div class="builder-row group min-h-[90px] bg-white flex items-stretch border-b border-gray-100 shadow-sm z-10 relative"
                        data-label="Main Header">
                        <!-- Handle -->
                        <div class="row-handle">
                            <div class="handle-btn"><i class="ph ph-gear-six"></i> Main Header</div>
                        </div>

                        <div class="drop-zone flex-1 border-r border-dashed border-gray-200 p-2 flex items-center"
                            data-zone="main_left">
                            <div class="empty-placeholder">Logo</div>
                        </div>
                        <div class="drop-zone flex-[2] border-r border-dashed border-gray-200 p-2 flex items-center justify-center"
                            data-zone="main_center">
                            <div class="empty-placeholder">Search</div>
                        </div>
                        <div class="drop-zone flex-1 p-2 flex items-center justify-end gap-2" data-zone="main_right">
                            <div class="empty-placeholder">Actions</div>
                        </div>
                    </div>

                    <!-- 3. BOTTOM HEADER -->
                    <div class="builder-row group min-h-[50px] bg-white flex items-stretch border-b border-gray-100 relative"
                        data-label="Bottom Header">
                        <!-- Handle -->
                        <div class="row-handle">
                            <div class="handle-btn"><i class="ph ph-gear-six"></i> Bottom</div>
                        </div>

                        <div class="drop-zone flex-1 border-r border-dashed border-gray-200 p-2 flex items-center"
                            data-zone="bottom_left">
                            <div class="empty-placeholder">Left</div>
                        </div>
                        <div class="drop-zone flex-[3] border-r border-dashed border-gray-200 p-2 flex items-center justify-center"
                            data-zone="bottom_center">
                            <div class="empty-placeholder">Menu</div>
                        </div>
                        <div class="drop-zone flex-1 p-2 flex items-center justify-end" data-zone="bottom_right">
                            <div class="empty-placeholder">Right</div>
                        </div>
                    </div>

                    <!-- Content Body -->
                    <div class="flex-1 bg-gray-50 p-8 pointer-events-none opacity-50 relative z-0">
                        <div class="w-full h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- RIGHT SIDEBAR -->
    <aside class="w-[300px] bg-[#18181b] border-l border-gray-800 flex flex-col flex-shrink-0 z-30">
        <div
            class="h-14 border-b border-gray-800 flex items-center px-4 justify-between font-semibold text-white shadow-sm">
            <span>Properties</span>
        </div>
        <div id="property-panel" class="flex-1 overflow-y-auto p-5 text-center text-gray-500 text-xs">Select an element
        </div>
    </aside>

    <script>
        window.savedData = <?php echo $savedData ? $savedData : '[]'; ?>;
    </script>

    <script src="assets/js/builder.js"></script>
    <script src="assets/js/ajax.js"></script>
</body>

</html>