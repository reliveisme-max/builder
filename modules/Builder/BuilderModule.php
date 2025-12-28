<?php

namespace Modules\Builder;

use Core\Database;

class BuilderModule
{

    public function index()
    {
        // 1. Quét danh sách các Element có trong hệ thống
        $components = $this->scanComponents();

        // 2. Lấy dữ liệu Header đã lưu từ Database
        $savedData = '[]';
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT data_json FROM settings WHERE section_key = 'header'");
            $stmt->execute();
            $result = $stmt->fetch();
            // Nếu có dữ liệu thì gán vào biến
            if ($result && !empty($result['data_json'])) {
                $savedData = $result['data_json'];
            }
        } catch (\Exception $e) {
            // Chưa có bảng settings hoặc lỗi DB -> Bỏ qua
        }

        // 3. Load View và truyền biến sang
        $viewPath = ROOT_PATH . '/modules/Builder/views/editor.php';
        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            die("View editor.php not found");
        }
    }

    private function scanComponents()
    {
        $elements = [];
        $path = ROOT_PATH . '/modules/Header/elements/*.php';
        foreach (glob($path) as $file) {
            $className = 'Modules\\Header\\Elements\\' . basename($file, '.php');
            if (class_exists($className)) {
                $instance = new $className();
                if ($instance instanceof \Core\Block) {
                    $elements[] = array_merge($instance->getInfo(), ['class' => $className]);
                }
            }
        }
        return $elements;
    }
}
