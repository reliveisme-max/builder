<?php
require_once '../../config.php';
require_once ROOT_DIR . '/admin/modules/module-manager.php';

if (isset($_POST['block_id'])) {
    $block_id = $_POST['block_id'];
    $blocks = get_registered_blocks();
    if (isset($blocks[$block_id])) {
        include $blocks[$block_id]['file'];
    }
}
