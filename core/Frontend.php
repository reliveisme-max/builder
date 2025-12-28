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

            if (isset($rowData['row_hidden']) && $rowData['row_hidden'] === 'true') {
                continue;
            }

            $style = $rowData['style'] ?? '';
            $style = preg_replace('/(max-)?width\s*:[^;]+;/', '', $style);

            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0;';
            }

            $widthMode = $rowData['width_mode'] ?? 'container';
            $containerWidth = $rowData['container_width'] ?? '1200px';

            $innerClass = 'hb-inner-content flex items-stretch h-full px-4 mx-auto';
            $innerStyle = '';

            if ($widthMode === 'full') {
                $innerStyle = "width: 100%; max-width: 100%;";
            } else {
                $innerStyle = "width: 100%; max-width: {$containerWidth};";
            }

            echo "<div class='header-row w-full relative border-b border-transparent overflow-hidden flex flex-col justify-center' style='{$style}'>";
            echo "<div class='{$innerClass}' style='{$innerStyle}'>";

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

        $justify = 'justify-start';
        // --- LOGIC MỚI: CO GIÃN TỰ ĐỘNG ---
        // Left/Right: Co lại vừa khít
        $flexStyle = 'flex: 0 0 auto; width: auto;';

        if ($position === 'center') {
            $justify = 'justify-center';
            // Center: Chiếm hết chỗ thừa
            $flexStyle = 'flex: 1 1 auto; width: auto;';
        }
        if ($position === 'right') {
            $justify = 'justify-end';
        }

        echo "<div class='header-col flex items-center h-full {$justify} gap-4' style='{$flexStyle}'>";

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
        if (isset($styles['width']) && (strpos($className, 'Logo') !== false || strpos($className, 'Search') !== false)) {
            $wrapperStyle .= "width: {$styles['width']};";
        }

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
