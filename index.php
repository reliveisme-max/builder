<?php
// Entry Point
require_once 'config/app.php';
require_once 'core/Autoload.php';

use Modules\Builder\BuilderModule;

// Khởi tạo Module Builder và hiển thị
$app = new BuilderModule();
$app->index();
