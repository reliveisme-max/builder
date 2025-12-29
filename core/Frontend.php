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
            .hb-inner-content { display: flex; align-items: center; width: 100%; margin: 0 auto; gap: 15px; }
            .header-col { display: flex; align-items: center; height: 100%; gap: 15px; }
            .header-col.col-center { flex: 1 1 auto; justify-content: center; width: auto; }
            .header-col.col-left, .header-col.col-right { flex: 0 0 auto; width: auto; }
            .header-col.col-right { justify-content: flex-end; }
            
            .header-item-wrapper { display: flex; align-items: center; width: auto; position: relative; flex-shrink: 0; }
            .header-item-wrapper img { width: 100%; height: auto; object-fit: contain; display: block; }
            
            .header-item-wrapper.is-search-center { width: 100%; flex: 1; }
            .header-col.col-center .search-box { width: 100% !important; max-width: 100% !important; }

            /* --- VISIBILITY CLASSES --- */
            /* Mobile (< 768px) */
            @media (max-width: 767px) {
                .hidden-mobile { display: none !important; }
            }
            /* Tablet (768px -> 1024px) */
            @media (min-width: 768px) and (max-width: 1024px) {
                .hidden-tablet { display: none !important; }
            }
            /* Desktop (> 1024px) */
            @media (min-width: 1025px) {
                .hidden-desktop { display: none !important; }
            }
        </style>';

        echo '<header id="site-header" class="w-full relative bg-white shadow-sm font-sans text-sm z-50">';

        foreach ($structure as $rowData) {
            if (!isset($rowData['columns'])) continue;
            if (isset($rowData['row_hidden']) && $rowData['row_hidden'] === 'true') continue;

            $style = $rowData['style'] ?? '';
            $style = preg_replace('/(max-)?width\s*:[^;]+;/', '', $style);
            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0; z-index: 999;';
            }

            $widthMode = $rowData['width_mode'] ?? 'container';
            $containerWidth = $rowData['container_width'] ?? '1200px';
            $innerStyle = ($widthMode === 'full') ? "width: 100%; max-width: 100%; padding: 0 20px;" : "width: 100%; max-width: {$containerWidth}; padding: 0 15px;";

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
        echo "<div class='header-col col-{$position}'>";
        if (!empty($targetData)) {
            foreach ($targetData as $item) echo self::renderElement($item, $position);
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

        // Visibility Checks
        if (isset($content['hide_mobile']) && $content['hide_mobile'] === 'true') $extraClass .= " hidden-mobile";
        if (isset($content['hide_tablet']) && $content['hide_tablet'] === 'true') $extraClass .= " hidden-tablet";
        if (isset($content['hide_desktop']) && $content['hide_desktop'] === 'true') $extraClass .= " hidden-desktop";

        // Logo Mobile Width
        if (strpos($className, 'Logo') !== false && !empty($content['mobile_width'])) {
            $uniqueClass = 'logo-' . uniqid();
            $extraClass .= " " . $uniqueClass;
            $mw = $content['mobile_width'];
            echo "<style>@media (max-width: 768px) { .{$uniqueClass} { width: {$mw}px !important; } }</style>";
        }

        // Layout Logic
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
            if (count($arr) == 2) $result[trim($arr[0])] = trim($arr[1]);
        }
        return $result;
    }
}
