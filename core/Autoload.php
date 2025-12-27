<?php
spl_autoload_register(function ($class) {
    // 1. Định nghĩa danh sách Namespace -> Thư mục
    // Lưu ý: Key là Namespace, Value là tên thư mục thực tế
    $prefixes = [
        'Core\\' => 'core',
        'Modules\\' => 'modules'
    ];

    // 2. Duyệt qua các prefix
    foreach ($prefixes as $prefix => $dir) {
        // Kiểm tra xem Class đang gọi có bắt đầu bằng prefix này không
        // Ví dụ: Modules\Builder\BuilderModule có bắt đầu bằng Modules\
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            continue;
        }

        // 3. Lấy phần tên Class phía sau (bỏ prefix)
        // Ví dụ: Builder\BuilderModule
        $relativeClass = substr($class, $len);

        // 4. Tạo đường dẫn file vật lý
        // Thay thế namespace separator (\) bằng directory separator của hệ điều hành
        $file = ROOT_PATH . DIRECTORY_SEPARATOR . $dir . DIRECTORY_SEPARATOR . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';

        // 5. Nếu file tồn tại thì require
        if (file_exists($file)) {
            require $file;
            return; // Đã tìm thấy, dừng lại
        } else {
            // [DEBUG] - Nếu vẫn lỗi, hãy bỏ comment dòng dưới để xem nó đang tìm file ở đâu
            // echo "<h3>Không tìm thấy file: " . $file . "</h3>";
        }
    }
});
