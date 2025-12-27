<?php

namespace Modules\Builder;

class BuilderModule
{

    public function index()
    {
        // 1. Tự động quét các Component có sẵn
        $components = $this->scanComponents();

        // 2. Load View giao diện Editor và truyền biến $components sang
        // Lưu ý: Đường dẫn view tương đối
        $viewPath = ROOT_PATH . '/modules/Builder/views/editor.php';

        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            die("Không tìm thấy file giao diện Editor!");
        }
    }

    private function scanComponents()
    {
        $elements = [];
        // Đường dẫn tới thư mục chứa các Element
        $path = ROOT_PATH . '/modules/Header/elements/*.php';

        foreach (glob($path) as $file) {
            $className = 'Modules\\Header\\Elements\\' . basename($file, '.php');
            if (class_exists($className)) {
                $instance = new $className();
                // Chỉ lấy những class kế thừa từ Block
                if ($instance instanceof \Core\Block) {
                    $elements[] = array_merge($instance->getInfo(), ['class' => $className]);
                }
            }
        }
        return $elements;
    }
}
