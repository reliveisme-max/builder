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

            // 1. Lấy Style của Row (Background, Height...)
            $style = $rowData['style'] ?? '';

            // Xử lý Sticky
            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0;';
            }

            // 2. Xử lý Container Width (Giống Flatsome)
            $widthMode = $rowData['width_mode'] ?? 'container';
            $containerWidth = $rowData['container_width'] ?? '1200px';

            $innerClass = 'flex items-center justify-between h-full px-4';
            $innerStyle = '';

            if ($widthMode === 'full') {
                $innerClass .= ' w-full';
            } else {
                $innerClass .= ' mx-auto';
                $innerStyle = "max-width: {$containerWidth}; width: 100%;";
            }

            echo "<div class='header-row relative border-b border-transparent overflow-hidden' style='{$style}'>";
            echo "<div class='{$innerClass}' style='{$innerStyle}'>";

            // Render Zones
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
            if (count($targetData) > 0) $flex = 'flex-[2]';
        }
        if ($position === 'right') {
            $justify = 'justify-end';
        }

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
        if (isset($styles['width']) && strpos($className, 'Logo') !== false) {
            $wrapperStyle .= "width: {$styles['width']};";
        }

        // Search Full Width Logic
        if (strpos($className, 'Search') !== false && isset($styles['width'])) {
            $wrapperStyle .= "width: {$styles['width']};";
        }

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
