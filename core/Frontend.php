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
            // Check dữ liệu
            if (!isset($rowData['columns'])) continue;

            $style = $rowData['style'] ?? '';

            // Fix Sticky
            if (strpos($style, 'sticky') !== false && strpos($style, 'top:') === false) {
                $style .= '; top: 0;';
            }

            // --- FIX CĂN GIỮA (MIDDLE) ---
            // 1. Thêm 'flex items-center' vào row cha để nội dung luôn nằm giữa theo chiều dọc
            // 2. Thêm 'py-2' để tạo khoảng thở nhẹ
            echo "<div class='header-row relative border-b border-transparent py-2 flex items-center' style='{$style}'>";

            // Container: Thêm w-full để nó ko bị co lại khi cha là flex
            echo "<div class='container mx-auto px-4 w-full'>";

            // Inner Wrapper: Chứa 3 cột
            echo "<div class='flex items-center justify-between w-full'>";

            echo self::renderZone($rowData['columns'], 'left');
            echo self::renderZone($rowData['columns'], 'center');
            echo self::renderZone($rowData['columns'], 'right');

            echo "</div>"; // End Inner Wrapper
            echo "</div>"; // End Container
            echo "</div>"; // End Row
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

        // Thêm gap-6 để các item cách xa nhau ra chút
        echo "<div class='header-col {$flex} flex items-center gap-6 {$justify}'>";

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
        $content = $item['content'] ?? [];

        if (class_exists($className)) {
            $element = new $className();
            $rawHtml = $element->render($content);

            // Wrapper cũng phải flex items-center để nội dung bên trong (icon + text) căn giữa
            return "<div class='header-item-wrapper flex items-center' style='{$style}'>{$rawHtml}</div>";
        }
        return "";
    }
}
