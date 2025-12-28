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

            echo "<div class='header-row relative' style='{$style}'>";
            echo "<div class='container mx-auto px-4 h-full flex items-center'>";

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
            $flex = 'flex-[2]';
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
        $style = $item['style'] ?? '';
        // Lấy content (text, src) từ JSON
        $content = $item['content'] ?? [];

        if (class_exists($className)) {
            $element = new $className();

            // TRUYỀN CONTENT VÀO HÀM RENDER
            $rawHtml = $element->render($content);

            return "<div class='header-item-wrapper flex items-center' style='{$style}'>{$rawHtml}</div>";
        }
        return "";
    }
}
