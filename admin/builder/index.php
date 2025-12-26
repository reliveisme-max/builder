<?php 
/*==========================================================================
   # INIT - Nạp cấu hình hệ thống
==========================================================================*/
// Nhảy ra 2 cấp từ builder -> admin -> để tìm config.php ở gốc
$config_file = dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . 'config.php';

if (file_exists($config_file)) {
    require_once $config_file; // Sau dòng này ROOT_DIR mới tồn tại
} else {
    die("Lỗi: Không tìm thấy file config.php tại: " . $config_file);
}

// Gọi module-manager sau khi đã có ROOT_DIR
require_once ROOT_DIR . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'modules' . DIRECTORY_SEPARATOR . 'module-manager.php'; 

$blocks = get_registered_blocks();
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Web Builder Professional</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <link rel="stylesheet" href="../../assets/css/builder-style.css">
</head>

<body>

    <aside id="builder-sidebar">
        /*==========================================================================
        # SIDEBAR - Danh sách Blocks
        ==========================================================================*/
        <h2 class="sidebar-title"><i class="fa fa-cubes"></i> Thư viện Blocks</h2>
        <div id="block-library">
            <?php foreach($blocks as $id => $info): ?>
            <div class="block-item" data-id="<?php echo $id; ?>">
                <i class="fa <?php echo $info['icon']; ?>"></i> &nbsp; <?php echo $info['title']; ?>
            </div>
            <?php endforeach; ?>
        </div>
        <button id="save-layout" class="btn-primary">LƯU GIAO DIỆN</button>
    </aside>

    <main id="builder-viewport">
        <div id="drop-canvas">
            <div class="canvas-placeholder">Kéo thả Header vào đây</div>
        </div>
    </main>

    <script src="../../assets/js/builder-logic.js"></script>
</body>

</html>