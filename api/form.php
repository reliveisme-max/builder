<?php
// api/form.php
require_once '../config/app.php';
require_once '../core/Autoload.php';

// Nhận tên Class từ request
$className = $_GET['class'] ?? '';

if ($className && class_exists($className)) {
    $element = new $className();

    // Kiểm tra xem class đó có phải là Block hợp lệ không
    if ($element instanceof \Core\Block) {
        $info = $element->getInfo();
        $formHtml = $element->getForm();

        // Trả về HTML Form đã được bọc
        echo '<div class="p-4 border-b border-gray-800 mb-4">
                <h3 class="font-bold text-white text-sm flex items-center gap-2">
                    <i class="ph ' . $info['icon'] . ' text-indigo-500"></i>
                    ' . $info['name'] . '
                </h3>
              </div>
              <div class="px-4 pb-20 form-container">
                ' . $formHtml . '
              </div>';
    } else {
        echo '<div class="p-4 text-red-500">Invalid Block</div>';
    }
} else {
    echo '<div class="p-4 text-gray-500 text-center">Element not found</div>';
}
