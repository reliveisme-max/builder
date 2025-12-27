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
    <!-- Link CSS gốc -->
    <link rel="stylesheet" href="assets/css/builder.css">

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        /* --- 1. GENERAL UI --- */
        .workspace-bg {
            background-color: #f3f4f6;
            /* Nền xám sáng */
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

        /* Viền mặc định: Nét đứt mờ */
        .drop-zone:empty,
        .drop-zone:has(.empty-placeholder) {
            border: 1px dashed #e5e7eb;
        }

        /* Hover vào dòng thì viền rõ hơn */
        .builder-row:hover .drop-zone:empty {
            border-color: #d1d5db;
        }

        /* Khi kéo item đè lên: Sáng màu */
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
            gap: 4px;
            height: 100%;
            min-height: 32px;
            border-radius: 4px;
            user-select: none;
            cursor: default;
        }

        .empty-placeholder:hover {
            color: #6b7280;
            background: rgba(0, 0, 0, 0.02);
        }

        .empty-placeholder::before {
            content: '+';
            font-size: 14px;
            color: #d1d5db;
        }

        /* --- 4. ROW LABELS --- */
        .row-label {
            position: absolute;
            left: -80px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 10px;
            color: #9ca3af;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            text-align: right;
            width: 70px;
        }

        #canvas-frame:hover .row-label {
            opacity: 1;
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
                        <div
                            class="col-span-2 text-center py-4 border border-dashed border-gray-700 rounded text-gray-500 text-xs">
                            Empty</div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </aside>

    <!-- CENTER WORKSPACE -->
    <main class="flex-1 flex flex-col min-w-0 bg-[#f3f4f6]">

        <!-- Toolbar -->
        <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
            <div class="flex items-center gap-2">
                <span class="text-gray-800 font-bold text-lg tracking-tight">Header Builder</span>
            </div>

            <div class="flex items-center gap-3">
                <div class="bg-gray-100 rounded-lg p-1 flex gap-1 border border-gray-200">
                    <button
                        class="w-8 h-8 rounded-md bg-white text-gray-800 shadow-sm flex items-center justify-center border border-gray-200"><i
                            class="ph ph-desktop"></i></button>
                    <button
                        class="w-8 h-8 rounded-md hover:bg-white text-gray-500 hover:text-gray-800 transition flex items-center justify-center"><i
                            class="ph ph-device-tablet"></i></button>
                    <button
                        class="w-8 h-8 rounded-md hover:bg-white text-gray-500 hover:text-gray-800 transition flex items-center justify-center"><i
                            class="ph ph-device-mobile"></i></button>
                </div>

                <div class="w-px h-6 bg-gray-300 mx-2"></div>

                <button id="btn-save"
                    class="bg-[#111827] hover:bg-black text-white px-5 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg shadow-gray-400/20 text-xs uppercase tracking-wide">
                    <i class="ph ph-floppy-disk text-lg"></i> Save
                </button>
            </div>
        </header>

        <!-- Canvas Area -->
        <div class="flex-1 overflow-auto p-8 flex justify-center workspace-bg relative">

            <!-- CANVAS FRAME -->
            <div id="canvas-frame"
                class="w-full max-w-[1200px] flex flex-col min-h-[800px] transition-all duration-300">

                <!-- BROWSER MOCKUP HEADER -->
                <div
                    class="h-9 bg-[#e5e7eb] rounded-t-lg border border-b-0 border-[#d1d5db] flex items-center px-4 gap-2 select-none sticky top-0 z-20 shadow-sm">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-[#ef4444] border border-[#dc2626]/20"></div>
                        <div class="w-3 h-3 rounded-full bg-[#eab308] border border-[#ca8a04]/20"></div>
                        <div class="w-3 h-3 rounded-full bg-[#22c55e] border border-[#16a34a]/20"></div>
                    </div>
                    <div
                        class="ml-4 flex-1 max-w-[400px] bg-white h-6 rounded text-[10px] flex items-center px-3 text-gray-400 border border-gray-300 shadow-sm">
                        https://fptshop.com.vn
                    </div>
                </div>

                <!-- MAIN CONTENT CONTAINER -->
                <div
                    class="bg-white shadow-2xl rounded-b-lg overflow-hidden border border-[#d1d5db] flex-1 flex flex-col">

                    <!-- 1. TOP BAR -->
                    <div
                        class="builder-row group min-h-[40px] bg-[#f8f9fa] flex items-stretch border-b border-gray-100 relative">
                        <span class="row-label">Top Bar</span>
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
                    <div
                        class="builder-row group min-h-[90px] bg-white flex items-stretch border-b border-gray-100 shadow-sm z-10 relative">
                        <span class="row-label">Main Header</span>
                        <div class="drop-zone flex-1 border-r border-dashed border-gray-200 p-2 flex items-center"
                            data-zone="main_left">
                            <div class="empty-placeholder">Logo</div>
                        </div>
                        <div class="drop-zone flex-[2] border-r border-dashed border-gray-200 p-2 flex items-center justify-center"
                            data-zone="main_center">
                            <div class="empty-placeholder">Search / Center</div>
                        </div>
                        <div class="drop-zone flex-1 p-2 flex items-center justify-end gap-2" data-zone="main_right">
                            <div class="empty-placeholder">Actions</div>
                        </div>
                    </div>

                    <!-- 3. BOTTOM HEADER (Clean White) -->
                    <div
                        class="builder-row group min-h-[50px] bg-white flex items-stretch border-b border-gray-100 relative">
                        <span class="row-label">Bottom</span>
                        <div class="drop-zone flex-1 border-r border-dashed border-gray-200 p-2 flex items-center"
                            data-zone="bottom_left">
                            <div class="empty-placeholder">Left</div>
                        </div>
                        <div class="drop-zone flex-[3] border-r border-dashed border-gray-200 p-2 flex items-center justify-center"
                            data-zone="bottom_center">
                            <div class="empty-placeholder">Navigation Menu</div>
                        </div>
                        <div class="drop-zone flex-1 p-2 flex items-center justify-end" data-zone="bottom_right">
                            <div class="empty-placeholder">Right</div>
                        </div>
                    </div>

                    <!-- PREVIEW BODY CONTENT -->
                    <div class="flex-1 bg-gray-50 p-8 pointer-events-none select-none relative overflow-hidden">
                        <div class="max-w-6xl mx-auto space-y-8 opacity-50 grayscale-[0.5]">
                            <div class="w-full h-[400px] bg-white rounded-lg shadow-sm border border-gray-200"></div>
                            <div class="grid grid-cols-4 gap-6">
                                <div class="h-64 bg-white rounded shadow-sm"></div>
                                <div class="h-64 bg-white rounded shadow-sm"></div>
                                <div class="h-64 bg-white rounded shadow-sm"></div>
                                <div class="h-64 bg-white rounded shadow-sm"></div>
                            </div>
                        </div>
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
            <i class="ph ph-trash hover:text-red-500 cursor-pointer transition p-2 rounded hover:bg-gray-800"
                title="Delete Element"></i>
        </div>
        <div id="property-panel" class="flex-1 overflow-y-auto p-5">
            <div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
                <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                    <i class="ph ph-sliders text-3xl"></i>
                </div>
                <p class="text-xs text-center px-8 leading-5">Select an element on the canvas<br>to edit its properties.
                </p>
            </div>
        </div>
    </aside>

    <!-- JS -->
    <script src="assets/js/builder.js"></script>
    <script src="assets/js/ajax.js"></script>
</body>

</html>