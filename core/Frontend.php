<?php

namespace Core;

class Frontend
{

    // Hàm chính: Render Header ra ngoài Frontend
    public static function renderHeader()
    {
        // 1. Kết nối DB lấy dữ liệu JSON đã lưu
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT data_json FROM settings WHERE section_key = 'header'");
        $stmt->execute();
        $row = $stmt->fetch();

        if (!$row) return ''; // Chưa có dữ liệu thì không hiện gì

        $structure = json_decode($row['data_json'], true);
        if (!$structure) return '';

        $html = '<header id="site-header" class="w-full relative bg-white shadow-sm">';

        // 2. Duyệt qua từng dòng (Row: Top, Main, Bottom)
        foreach ($structure as $rowIndex => $rowData) {

            // Style của dòng (Màu nền, height, sticky...)
            $rowStyle = $rowData['style'] ?? '';

            // Bọc dòng trong thẻ div
            $html .= "<div class='header-row relative' style='{$rowStyle}'>";
            $html .= "<div class='container mx-auto px-4 h-full flex items-center justify-between'>";

            // 3. Render 3 cột (Left, Center, Right) cho mỗi dòng
            // Hàm helper để render vùng (Zone)
            $html .= self::renderZone($rowData['columns'], 'left');
            $html .= self::renderZone($rowData['columns'], 'center');
            $html .= self::renderZone($rowData['columns'], 'right');

            $html .= "</div></div>";
        }

        $html .= '</header>';
        echo $html;
    }

    // Hàm phụ: Render từng vùng (Zone)
    private static function renderZone($columns, $position)
    {
        $zoneKey = '';
        $justifyClass = '';

        // Xác định key trong JSON (ví dụ: main_left, top_center...)
        // Cách này hơi thủ công nhưng chính xác với cấu trúc JS đã lưu
        foreach ($columns as $key => $elements) {
            if (strpos($key, $position) !== false) {
                $zoneKey = $key;
                break;
            }
        }

        // CSS Tailwind để căn lề
        if ($position === 'left') $justifyClass = 'justify-start';
        if ($position === 'center') $justifyClass = 'justify-center flex-[2]'; // Cột giữa rộng gấp đôi
        if ($position === 'right') $justifyClass = 'justify-end';

        $html = "<div class='header-col flex items-center gap-4 flex-1 {$justifyClass}'>";

        // Nếu tìm thấy dữ liệu cột
        if ($zoneKey && !empty($columns[$zoneKey])) {
            foreach ($columns[$zoneKey] as $item) {
                $html .= self::renderElement($item);
            }
        }

        $html .= "</div>";
        return $html;
    }

    // Hàm phụ: Khởi tạo Class Element và lấy HTML
    private static function renderElement($itemData)
    {
        $className = $itemData['class'];

        // Dữ liệu settings gộp từ Style và Content đã lưu
        $settings = $itemData['content'] ?? [];
        $style = $itemData['style'] ?? '';

        if (class_exists($className)) {
            $element = new $className();

            // Gọi hàm render() của từng Block (Logo, Menu...)
            // Bọc thêm 1 div ở ngoài để áp dụng các Style tùy chỉnh (Màu, Font, Margin)
            return "<div class='header-element' style='{$style}'>" .
                $element->render($settings) .
                "</div>";
        }
        return "";
    }
}
