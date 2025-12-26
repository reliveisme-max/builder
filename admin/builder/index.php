<?php 
require_once dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . 'config.php';
require_once ROOT_DIR . '/admin/modules/module-manager.php';
$blocks = get_registered_blocks();
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>SaaS Header Builder Pro</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <link rel="stylesheet" href="../../assets/css/builder-style.css">
</head>

<body>

    <aside id="sidebar-left">
        <div class="sidebar-header">COMPONENTS</div>
        <div class="sidebar-scroll">
            <div id="block-library">
                <?php foreach ($blocks as $id => $info): ?>
                <div class="block-card" data-id="<?php echo $id; ?>">
                    <div class="icon-box"><i class="<?php echo $info['icon']; ?>"></i></div>
                    <span><?php echo $info['title']; ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </aside>

    <main id="builder-main">
        <div class="workspace-scroll">
            <div class="builder-1200">
                <div class="builder-row" data-label="Top Bar">
                    <div class="slot drop-zone" data-pos="left"></div>
                    <div class="slot drop-zone" data-pos="center"></div>
                    <div class="slot drop-zone" data-pos="right"></div>
                </div>
                <div class="builder-row main-row" data-label="Main Header">
                    <div class="slot drop-zone" data-pos="left"></div>
                    <div class="slot drop-zone" data-pos="center"></div>
                    <div class="slot drop-zone" data-pos="right"></div>
                </div>
            </div>
        </div>
    </main>

    <script src="../../assets/js/builder-logic.js"></script>
</body>

</html>