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

        // --- CSS FRONTEND ---
        echo '<style>
            /* 1. Container chính: Căn giữa chiều dọc (align-items: center) */
            .hb-inner-content { 
                display: flex; 
                align-items: center; /* FIX: Căn giữa chiều dọc */
                width: 100%; 
                margin: 0 auto; 
                gap: 15px; 
            }
            
            /* Cấu hình các Cột */
            .header-col { display: flex; align-items: center; height: 100%; gap: 15px; }
            
            /* Cột Giữa: Chiếm hết khoảng trống */
            .header-col.col-center { flex: 1 1 auto; justify-content: center; width: auto; }
            
            /* Cột Trái / Phải: Co khít nội dung */
            .header-col.col-left, .header-col.col-right { flex: 0 0 auto; width: auto; }
            .header-col.col-right { justify-content: flex-end; }
            
            /* 2. ITEM WRAPPER */
            .header-item-wrapper { 
                display: flex; 
                align-items: center; 
                width: auto; 
                position: relative;
            }
            
            /* FIX LOGO: Ảnh bên trong wrapper sẽ luôn fill 100% width của wrapper */
            /* Điều này giúp khi ta set width cho wrapper, ảnh logo sẽ to/nhỏ theo */
            .header-item-wrapper img { 
                width: 100%; 
                height: auto; 
                object-fit: contain; 
                display: block;
            }
            
            /* 3. RIÊNG SEARCH BOX Ở CỘT GIỮA */
            .header-item-wrapper.is-search-center {
                width: 100%;
                flex: 1;
            }
            .search-box { width: 100% !important; max-width: 100% !important; }
        </style>';

        echo '<header id="site-header" class="w-full relative bg-white shadow-sm font-sans text-sm z-50">';

        foreach ($structure as $rowData) {
            if (!isset($rowData['columns'])) continue;

            if (isset($rowData['row_hidden']) && $rowData['row_hidden'] === 'true') {
                continue;
            }

            $style = $rowData['style'] ?? '';
            // Xóa width cứng
            $style = preg_replace('/(max-)?width\s*:[^;]+;/', '', $style);

            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0; z-index: 999;';
            }

            $widthMode = $rowData['width_mode'] ?? 'container';
            $containerWidth = $rowData['container_width'] ?? '1200px';

            $innerStyle = "";
            if ($widthMode === 'full') {
                $innerStyle = "width: 100%; max-width: 100%; padding: 0 20px;";
            } else {
                $innerStyle = "width: 100%; max-width: {$containerWidth}; padding: 0 15px;";
            }

            echo "<div class='header-row w-full relative border-b border-transparent overflow-hidden flex flex-col justify-center' style='{$style}'>";
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

        $colClass = "col-{$position}";
        echo "<div class='header-col {$colClass}'>";
        if (!empty($targetData)) {
            foreach ($targetData as $item) {
                echo self::renderElement($item, $position);
            }
        }
        echo "</div>";
    }

    private static function renderElement($item, $position)
    {
        $className = $item['class'];
        $styleStr = $item['style'] ?? '';
        $content = $item['content'] ?? [];

        if (!class_exists($className)) {
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
        $extraClass = "";

        // --- XỬ LÝ LOGO MOBILE WIDTH ---
        $mobileCss = "";
        if (strpos($className, 'Logo') !== false && !empty($content['mobile_width'])) {
            $uniqueClass = 'logo-' . uniqid();
            $extraClass .= " " . $uniqueClass;
            $mw = $content['mobile_width'];
            // In thẳng CSS Media Query ra (hơi thô nhưng hiệu quả tức thì)
            echo "<style>@media (max-width: 768px) { .{$uniqueClass} { width: {$mw}px !important; } }</style>";
        }

        // Logic cũ
        if ($position === 'center' && strpos($className, 'Search') !== false) {
            $extraClass .= " is-search-center";
        } elseif (isset($styles['width'])) {
            $wrapperStyle = "width: {$styles['width']};";
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
            if (count($arr) == 2) {
                $result[trim($arr[0])] = trim($arr[1]);
            }
        }
        return $result;
    }
}
