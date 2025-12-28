<?php

namespace Core;

use Core\Database;

class Frontend
{
    public static function renderHeader()
    {
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT data_json FROM settings WHERE section_key = 'header'");
            $stmt->execute();
            $row = $stmt->fetch();
        } catch (\Exception $e) {
            return;
        }

        if (!$row) return;
        $structure = json_decode($row['data_json'], true);
        if (!$structure) return;

        echo '<header id="site-header" class="w-full relative bg-white shadow-sm font-sans text-sm z-50">';

        foreach ($structure as $rowData) {
            if (!isset($rowData['columns'])) continue;

            $style = $rowData['style'] ?? '';
            // Xử lý sticky
            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0;';
            }

            // --- FIX 1: Xóa 'py-2' để chiều cao chuẩn theo Builder ---
            // Thêm 'overflow-hidden' để tránh content lồi ra làm vỡ khung
            echo "<div class='header-row relative border-b border-transparent flex items-center overflow-hidden' style='{$style}'>";

            echo "<div class='container mx-auto px-4 w-full h-full'>"; // Thêm h-full
            echo "<div class='flex items-center justify-between w-full h-full'>"; // Thêm h-full

            // Render Zones
            echo self::renderZone($rowData['columns'], 'left');
            echo self::renderZone($rowData['columns'], 'center');
            echo self::renderZone($rowData['columns'], 'right');

            echo "</div></div></div>";
        }
        echo '</header>';
    }

    private static function renderZone($columns, $position)
    {
        $targetData = [];
        foreach ($columns as $key => $elements) {
            if (strpos($key, $position) !== false) {
                $targetData = $elements;
                break;
            }
        }

        $justify = 'justify-start';
        // --- FIX 2: Đồng bộ tỷ lệ cột với Builder ---
        // Trong Builder: Topbar là flex-1 đều. Main Header là Logo fix, Center flex-2.
        // Ở đây ta để logic linh hoạt:
        $flex = 'flex-1';

        if ($position === 'center') {
            $justify = 'justify-center';
            // Nếu là Main Header (thường chứa Search), cho rộng hơn
            // Logic tạm: Nếu có nhiều element thì flex-grow
            if (count($targetData) > 0) $flex = 'flex-[2]';
        }
        if ($position === 'right') {
            $justify = 'justify-end';
        }

        // Thêm 'h-full' để cột cao bằng dòng
        echo "<div class='header-col {$flex} flex items-center gap-4 {$justify} h-full'>";

        if (!empty($targetData)) {
            foreach ($targetData as $item) {
                echo self::renderElement($item);
            }
        }
        echo "</div>";
    }

    private static function renderElement($item)
    {
        $className = $item['class'];
        $styleStr = $item['style'] ?? '';
        $content = $item['content'] ?? [];

        if (!class_exists($className)) return "";

        $styles = self::parseStyleString($styleStr);
        $mergedSettings = array_merge($content, $styles);

        $element = new $className();
        $html = $element->render($mergedSettings);

        $wrapperStyle = "";
        // Logo cần width wrapper, nhưng chiều cao phải auto để không vỡ dòng
        if (isset($styles['width']) && strpos($className, 'Logo') !== false) {
            $wrapperStyle .= "width: {$styles['width']};";
        }

        // --- FIX 3: Wrapper ảnh hưởng chiều cao ---
        // Thêm max-height: 100% để phần tử con không cao hơn dòng cha
        return "<div class='header-item-wrapper flex items-center' style='{$wrapperStyle}; max-height: 100%;'>{$html}</div>";
    }

    private static function parseStyleString($str)
    {
        $result = [];
        $parts = explode(';', $str);
        foreach ($parts as $part) {
            if (trim($part) === '') continue;
            list($key, $val) = explode(':', $part, 2);
            $result[trim($key)] = trim($val);
        }
        return $result;
    }
}
