<?php
// api/save.php
header('Content-Type: application/json');

// 1. Nạp config và Database
require_once '../config/app.php';
require_once '../core/Database.php';

try {
    // 2. Nhận dữ liệu JSON từ JS
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        throw new Exception('Không nhận được dữ liệu JSON hợp lệ');
    }

    // 3. Kết nối DB (Dùng namespace Core)
    $db = \Core\Database::getInstance()->getConnection();

    // 4. Update vào DB
    // Lưu ý: Đảm bảo bạn đã chạy SQL tạo bảng settings rồi
    $stmt = $db->prepare("UPDATE settings SET data_json = ?, updated_at = NOW() WHERE section_key = 'header'");

    // Nếu chưa có dòng header thì Insert (Phòng hờ)
    if ($stmt->rowCount() == 0) {
        $check = $db->query("SELECT id FROM settings WHERE section_key = 'header'");
        if ($check->rowCount() == 0) {
            $stmt = $db->prepare("INSERT INTO settings (data_json, section_key) VALUES (?, 'header')");
        }
    }

    $jsonToSave = json_encode($data['structure'], JSON_UNESCAPED_UNICODE);

    if ($stmt->execute([$jsonToSave])) {
        echo json_encode(['status' => 'success', 'message' => 'Đã lưu thành công!']);
    } else {
        throw new Exception('Lỗi SQL: Không thể ghi vào Database');
    }
} catch (Exception $e) {
    http_response_code(500); // Báo lỗi 500 để JS biết
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
