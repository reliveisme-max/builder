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
            // Fix sticky
            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0;';
            }

            // ROW: Flex để căn giữa dọc
            echo "<div class='header-row relative border-b border-transparent flex items-center' style='{$style}'>";

            // CONTAINER: Thêm h-full để nó cao bằng Row
            echo "<div class='container mx-auto px-4 w-full h-full'>";

            // INNER WRAPPER: Thêm h-full để nó cao bằng Container
            echo "<div class='flex items-center justify-between w-full h-full'>";

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
        $flex = 'flex-1';
        if ($position === 'center') {
            $justify = 'justify-center';
            $flex = 'flex-[2]';
        }
        if ($position === 'right') {
            $justify = 'justify-end';
        }

        // COLUMN: Thêm h-full để nó cao bằng cha, giúp căn giữa (items-center) hoạt động chuẩn
        echo "<div class='header-col {$flex} flex items-center gap-6 {$justify} h-full'>";

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

        // WRAPPER ELEMENT: h-full để nội dung bên trong có thể căn chỉnh theo chiều cao dòng
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
