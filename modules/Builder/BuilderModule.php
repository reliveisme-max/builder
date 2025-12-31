<?php

namespace Modules\Builder;

use Core\Database;

class BuilderModule
{

    public function index()
    {
        // 1. Quét danh sách các Element (Components) có trong hệ thống
        $components = $this->scanComponents();

        // 2. Lấy dữ liệu Header đã lưu từ Database
        // Mặc định là mảng JSON rỗng nếu chưa có gì
        $savedData = '[]';

        try {
            $db = Database::getInstance()->getConnection();

            // Lấy cột data_json từ bảng settings với section_key = 'header'
            // Đảm bảo tên bảng và tên cột khớp với ảnh chụp phpMyAdmin của bạn
            $stmt = $db->prepare("SELECT data_json FROM settings WHERE section_key = 'header'");
            $stmt->execute();
            $result = $stmt->fetch();

            // Nếu tìm thấy dòng dữ liệu
            if ($result && !empty($result['data_json'])) {
                $savedData = $result['data_json'];
            }
        } catch (\Exception $e) {
            // Nếu lỗi (ví dụ chưa config DB đúng), giữ nguyên mặc định [] để không sập web
            // error_log("Builder Load Error: " . $e->getMessage());
        }

        // 3. Load View và truyền biến sang ($components, $savedData)
        $viewPath = ROOT_PATH . '/modules/Builder/views/editor.php';
        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            die("Critical Error: View file editor.php not found at " . $viewPath);
        }
    }

    private function scanComponents()
    {
        $elements = [];
        // Đường dẫn file vật lý tới folder elements
        $path = ROOT_PATH . '/modules/Header/elements/*.php';

        foreach (glob($path) as $file) {
            // Lấy tên class từ tên file (Ví dụ: Logo.php -> Logo)
            $baseName = basename($file, '.php');
            $className = 'Modules\\Header\\Elements\\' . $baseName;

            if (class_exists($className)) {
                $instance = new $className();
                // Kiểm tra xem class này có phải là Block hợp lệ không
                if ($instance instanceof \Core\Block) {
                    // Gộp thông tin Icon/Tên + Tên Class đầy đủ
                    $elements[] = array_merge($instance->getInfo(), ['class' => $className]);
                }
            }
        }
        return $elements;
    }
}