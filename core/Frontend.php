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

        // Render Header Wrapper
        echo '<header id="site-header" class="w-full relative bg-white shadow-sm font-sans text-sm z-50">';

        foreach ($structure as $rowData) {
            if (!isset($rowData['columns'])) continue;
            // Check hidden
            if (isset($rowData['row_hidden']) && $rowData['row_hidden'] === 'true') continue;

            // 1. Xử lý Style của Row
            // Lấy style string từ DB (đã bao gồm bg, color, shadow, min-height do JS save)
            $style = $rowData['style'] ?? '';

            // Xóa width/max-width trong style string cũ để tránh xung đột với logic container mới
            $style = preg_replace('/(max-)?width\s*:[^;]+;/', '', $style);

            // Xử lý Sticky (nếu JS lưu dạng flag)
            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0; z-index: 999;';
            }

            // 2. Xử lý Container Width
            $widthMode = $rowData['width_mode'] ?? 'container';
            $rawWidth = $rowData['container_width'] ?? '1200';
            // Tự động thêm px nếu là số
            $finalWidth = (is_numeric($rawWidth)) ? $rawWidth . 'px' : $rawWidth;

            if ($widthMode === 'full') {
                $innerStyle = "width: 100%; max-width: 100%; padding: 0 20px;";
            } else {
                $innerStyle = "width: 100%; max-width: {$finalWidth}; padding: 0 15px;";
            }

            // Render Row HTML
            echo "<div class='header-row' style='{$style}'>";
            echo "<div class='hb-inner-content' style='{$innerStyle}'>";
            self::renderZone($rowData['columns'], 'left');
            self::renderZone($rowData['columns'], 'center');
            self::renderZone($rowData['columns'], 'right');
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
        echo "<div class='header-col col-{$position}'>";
        if (!empty($targetData)) {
            foreach ($targetData as $item) echo self::renderElement($item, $position);
        }
        echo "</div>";
    }

    private static function renderElement($item, $position)
    {
        $className = $item['class'];
        // Lấy settings content
        $content = $item['content'] ?? [];

        // --- FIX LOGIC ẢNH LOGO (Đồng bộ với JS) ---
        if (strpos($className, 'Logo') !== false) {
            $src = $content['src'] ?? '';
            // Nếu không có src hoặc src là ảnh lỗi FPT -> Dùng placeholder
            if (empty($src) || strpos($src, 'fpt-shop.png') !== false) {
                $content['src'] = "https://placehold.co/150x40/png?text=LOGO";
            }
        }

        // Kiểm tra class tồn tại
        if (!class_exists($className)) {
            if (strpos($className, '\\') === false) {
                $className = 'Modules\\Header\\Elements\\' . $className;
            }
            if (!class_exists($className)) return "";
        }

        // Tạo instance và render HTML
        $element = new $className();
        $html = $element->render($content);

        // --- XỬ LÝ WRAPPER STYLE (Width, Visibility, Flex) ---
        $wrapperStyle = "";
        $extraClass = "";

        // Visibility Classes
        if (isset($content['hide_mobile']) && $content['hide_mobile'] === 'true') $extraClass .= " hidden-mobile";
        if (isset($content['hide_tablet']) && $content['hide_tablet'] === 'true') $extraClass .= " hidden-tablet";
        if (isset($content['hide_desktop']) && $content['hide_desktop'] === 'true') $extraClass .= " hidden-desktop";

        // Width Logic (Đồng bộ với JS)
        if (!empty($content['width'])) {
            // Nếu user set width cụ thể
            $w = $content['width'];
            $finalW = is_numeric($w) ? $w . 'px' : $w;
            $wrapperStyle .= "width: {$finalW};";
        } elseif ($position === 'center' && strpos($className, 'Search') !== false) {
            // Search ở giữa -> Flex grow (class is-search-center đã style bên css)
            $extraClass .= " is-search-center";
        }

        // Mobile Logo Width Logic (Responsive)
        if (strpos($className, 'Logo') !== false && !empty($content['mobile_width'])) {
            $uniqueClass = 'logo-' . uniqid();
            $extraClass .= " " . $uniqueClass;
            $mw = $content['mobile_width'];
            // Inject CSS inline nhỏ để xử lý mobile width cho logo
            echo "<style>@media (max-width: 768px) { .{$uniqueClass} img { width: {$mw}px !important; } }</style>";
        }

        return "<div class='header-item-wrapper {$extraClass}' style='{$wrapperStyle}'>{$html}</div>";
    }
}