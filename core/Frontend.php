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

            // 1. Style Row
            $style = $rowData['style'] ?? '';
            $style = preg_replace('/(max-)?width\s*:[^;]+;/', '', $style);

            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0; z-index: 999;';
            }

            // 2. Container Width
            $widthMode = $rowData['width_mode'] ?? 'container';
            $rawWidth = $rowData['container_width'] ?? '1200';
            $finalWidth = (is_numeric($rawWidth)) ? $rawWidth . 'px' : $rawWidth;

            if ($widthMode === 'full') {
                $innerStyle = "width: 100%; max-width: 100%; padding: 0 20px;";
            } else {
                $innerStyle = "width: 100%; max-width: {$finalWidth}; padding: 0 15px;";
            }

            // [NEW] 3. Gap (Khoảng cách giữa Left-Center-Right)
            // Mặc định khoảng cách giữa 3 cột lớn là 30px
            $innerStyle .= " gap: 30px;";

            // [NEW] 4. Item Gap (Khoảng cách các phần tử con trong 1 cột)
            // Lấy từ cài đặt, mặc định 15px
            $itemGap = $rowData['gap'] ?? '15';

            // Render Row HTML
            echo "<div class='header-row' style='{$style}'>";
            echo "<div class='hb-inner-content' style='{$innerStyle}'>";
            self::renderZone($rowData['columns'], 'left', $itemGap);
            self::renderZone($rowData['columns'], 'center', $itemGap);
            self::renderZone($rowData['columns'], 'right', $itemGap);
            echo "</div></div>";
        }
        echo '</header>';
    }

    private static function renderZone($columns, $position, $gap)
    {
        $targetData = [];
        foreach ($columns as $key => $elements) {
            if (strpos($key, $position) !== false) {
                $targetData = $elements;
                break;
            }
        }

        // Thêm style gap vào đây để các phần tử con cách nhau ra
        echo "<div class='header-col col-{$position}' style='gap: {$gap}px;'>";
        if (!empty($targetData)) {
            foreach ($targetData as $item) echo self::renderElement($item, $position);
        }
        echo "</div>";
    }

    private static function renderElement($item, $position)
    {
        $className = $item['class'];
        $content = $item['content'] ?? [];

        // Fix Logo Placeholder nếu ảnh lỗi
        if (strpos($className, 'Logo') !== false) {
            $src = $content['src'] ?? '';
            if (empty($src) || strpos($src, 'fpt-shop.png') !== false) {
                $content['src'] = "https://placehold.co/150x40/png?text=LOGO";
            }
        }

        if (!class_exists($className)) {
            if (strpos($className, '\\') === false) {
                $className = 'Modules\\Header\\Elements\\' . $className;
            }
            if (!class_exists($className)) return "";
        }

        $element = new $className();
        $html = $element->render($content);

        $wrapperStyle = "";
        $extraClass = "";

        // Responsive Visibility
        if (isset($content['hide_mobile']) && $content['hide_mobile'] === 'true') $extraClass .= " hidden-mobile";
        if (isset($content['hide_tablet']) && $content['hide_tablet'] === 'true') $extraClass .= " hidden-tablet";
        if (isset($content['hide_desktop']) && $content['hide_desktop'] === 'true') $extraClass .= " hidden-desktop";

        // Width Logic
        if (!empty($content['width'])) {
            $w = $content['width'];
            $finalW = is_numeric($w) ? $w . 'px' : $w;
            $wrapperStyle .= "width: {$finalW};";
        } elseif ($position === 'center' && strpos($className, 'Search') !== false) {
            $extraClass .= " is-search-center";
        }

        // Prevent Shrink (Tránh bị bóp méo khi màn hình nhỏ)
        $wrapperStyle .= " flex-shrink: 0;";

        // Mobile Logo Width Logic
        if (strpos($className, 'Logo') !== false && !empty($content['mobile_width'])) {
            $uniqueClass = 'logo-' . uniqid();
            $extraClass .= " " . $uniqueClass;
            $mw = $content['mobile_width'];
            echo "<style>@media (max-width: 768px) { .{$uniqueClass} img { width: {$mw}px !important; } }</style>";
        }

        return "<div class='header-item-wrapper {$extraClass}' style='{$wrapperStyle}'>{$html}</div>";
    }

    private static function parseStyleString($str)
    {
        $result = [];
        $parts = explode(';', $str);
        foreach ($parts as $part) {
            if (trim($part) === '') continue;
            $arr = explode(':', $part, 2);
            if (count($arr) == 2) $result[trim($arr[0])] = trim($arr[1]);
        }
        return $result;
    }
}
