<?php

/**
 * UI BAKERY STYLE - HEADER BUILDER
 * Cấu trúc: 3 cột (Sidebar - Workspace - Properties)
 * Phong cách: Minimalist, Sạch sẽ, Không Dot Grid
 */
require_once dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . 'config.php';
require_once ROOT_DIR . '/admin/modules/module-manager.php';
$blocks = get_registered_blocks();
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS Header Builder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">

    <script src="https://unpkg.com/@phosphor-icons/web"></script>

    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>

    <link rel="stylesheet" href="../../assets/css/builder-style.css">
</head>

<body class="clean-studio-layout">

    <aside id="sidebar-left">
        <div class="sidebar-header">
            <i class="ph-fill ph-circles-four"></i>
            <span>Components</span>
        </div>

        <div class="sidebar-search">
            <div class="search-input-wrap">
                <i class="ph ph-magnifying-glass"></i>
                <input type="text" placeholder="Tìm kiếm linh kiện...">
            </div>
        </div>

        <div class="sidebar-scroll-area">
            <div class="section-label">Frequently used</div>
            <div id="block-library">
                <?php foreach ($blocks as $id => $info): ?>
                    <div class="block-card" data-id="<?php echo $id; ?>">
                        <div class="icon-box">
                            <i class="<?php echo $info['icon']; ?>"></i>
                        </div>
                        <span class="block-title"><?php echo $info['title']; ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </aside>

    <main id="builder-main">
        <nav class="top-toolbar">
            <div class="toolbar-left">
                <div class="breadcrumb-nav">Editor / <span>Header Builder</span></div>
            </div>
            <div class="toolbar-center">
                <div class="device-switcher">
                    <i class="ph ph-desktop"></i>
                    <span>1200 px</span>
                    <i class="ph ph-caret-down"></i>
                </div>
            </div>
            <div class="toolbar-right">
                <button class="btn-action preview">Preview</button>
                <button class="btn-action finish">Finish editing</button>
            </div>
        </nav>

        <div id="workspace-viewport">
            <div id="header-floating-card">
                <div class="header-row row-top" data-label="TOP BAR">
                    <div class="slot drop-zone" data-pos="left"></div>
                    <div class="slot drop-zone" data-pos="center"></div>
                    <div class="slot drop-zone" data-pos="right"></div>
                </div>
                <div class="header-row row-main" data-label="MAIN HEADER">
                    <div class="slot drop-zone" data-pos="left"></div>
                    <div class="slot drop-zone" data-pos="center"></div>
                    <div class="slot drop-zone" data-pos="right"></div>
                </div>
            </div>

            <div class="preview-content-hint">
                <i class="ph ph-layout" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Nội dung website sẽ hiển thị tại đây</p>
            </div>
        </div>
    </main>

    <aside id="sidebar-right">
        <div class="panel-header">PROPERTIES</div>
        <div id="properties-panel">
            <div class="empty-selection">
                <i class="ph ph-cursor-click"></i>
                <p>Chọn một linh kiện trên Header để thiết lập thuộc tính</p>
            </div>
        </div>
    </aside>

    <script src="../../assets/js/builder-logic.js"></script>
</body>

</html>