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

        // Header Wrapper
        echo '<header id="site-header" class="w-full relative bg-white shadow-sm font-sans text-sm z-50">';

        foreach ($structure as $rowData) {
            if (!isset($rowData['columns'])) continue;

            // 1. STYLE CỦA ROW (Màu nền, Chiều cao...)
            $style = $rowData['style'] ?? '';
            // Fix: Xóa width/max-width trong style cũ để tránh xung đột
            $style = preg_replace('/(max-)?width\s*:[^;]+;/', '', $style);

            // Xử lý Sticky
            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0;';
            }

            // 2. XỬ LÝ CONTAINER
            $widthMode = $rowData['width_mode'] ?? 'container';
            $containerWidth = $rowData['container_width'] ?? '1200px';

            // Class cho Inner: 
            // - flex: để chia cột
            // - h-full: chiếm hết chiều cao row
            // - items-center: CĂN GIỮA DỌC (Khắc phục lỗi bị lệch lên trên)
            $innerClass = 'hb-inner-content flex items-center justify-between h-full px-4';
            $innerStyle = '';

            if ($widthMode === 'full') {
                $innerClass .= ' w-full';
            } else {
                $innerClass .= ' mx-auto';
                $innerStyle = "max-width: {$containerWidth}; width: 100%;";
            }

            // 3. RENDER HTML
            // Row cha: Thêm 'flex items-center' để đảm bảo inner luôn ở giữa dọc nếu row có min-height lớn
            echo "<div class='header-row w-full relative border-b border-transparent overflow-hidden flex items-center' style='{$style}'>";

            // Inner content
            echo "<div class='{$innerClass}' style='{$innerStyle}'>";

            // Render 3 Zone
            echo self::renderZone($rowData['columns'], 'left');
            echo self::renderZone($rowData['columns'], 'center');
            echo self::renderZone($rowData['columns'], 'right');

            echo "</div></div>";
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
        $flex = 'flex-1';

        if ($position === 'center') {
            $justify = 'justify-center';
            if (count($targetData) > 0) $flex = 'flex-[2]'; // Ưu tiên center rộng hơn chút
        }
        if ($position === 'right') {
            $justify = 'justify-end';
        }

        // Cột: Thêm 'items-center' để các element con (Logo, Menu) căn giữa dòng
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

        if (!class_exists($className)) {
            // Fix namespace nếu lưu thiếu
            if (strpos($className, '\\') === false) {
                $className = 'Modules\\Header\\Elements\\' . $className;
            }
            if (!class_exists($className)) return "";
        }

        $styles = self::parseStyleString($styleStr);
        $mergedSettings = array_merge($content, $styles);

        $element = new $className();
        $html = $element->render($mergedSettings);

        $wrapperStyle = "";
        // Fix chiều rộng cho Logo và Search để không bị co rúm
        if (isset($styles['width']) && (strpos($className, 'Logo') !== false || strpos($className, 'Search') !== false)) {
            $wrapperStyle .= "width: {$styles['width']};";
        }

        // Wrapper item: flex items-center để icon và text không bị lệch
        return "<div class='header-item-wrapper flex items-center h-full' style='{$wrapperStyle}'>{$html}</div>";
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
