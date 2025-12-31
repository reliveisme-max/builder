<?php
// api/save.php
header('Content-Type: application/json');

// 1. Nạp config và Database
require_once '../config/app.php';
require_once '../core/Database.php';

try {
    // 2. Nhận dữ liệu JSON từ Ajax
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['structure'])) {
        throw new Exception('Dữ liệu gửi lên không hợp lệ (Thiếu structure)');
    }

    // 3. Kết nối DB
    $db = \Core\Database::getInstance()->getConnection();

    // 4. LOGIC CHUẨN: CHECK TỒN TẠI -> INSERT HOẶC UPDATE
    // Bước 4a: Kiểm tra xem trong bảng settings đã có dòng header chưa
    $checkStmt = $db->prepare("SELECT id FROM settings WHERE section_key = 'header'");
    $checkStmt->execute();
    $row = $checkStmt->fetch();

    // Chuẩn bị dữ liệu JSON để lưu (Giữ nguyên tiếng Việt không bị mã hóa)
    $jsonToSave = json_encode($data['structure'], JSON_UNESCAPED_UNICODE);

    if ($row) {
        // --- TRƯỜNG HỢP 1: ĐÃ CÓ -> UPDATE ---
        $sql = "UPDATE settings SET data_json = ?, updated_at = NOW() WHERE section_key = 'header'";
        $stmt = $db->prepare($sql);
        if ($stmt->execute([$jsonToSave])) {
            echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
        } else {
            throw new Exception('Lỗi SQL Update: Không thể ghi dữ liệu.');
        }
    } else {
        // --- TRƯỜNG HỢP 2: CHƯA CÓ -> INSERT (TẠO MỚI) ---
        $sql = "INSERT INTO settings (section_key, data_json, updated_at) VALUES ('header', ?, NOW())";
        $stmt = $db->prepare($sql);
        if ($stmt->execute([$jsonToSave])) {
            echo json_encode(['status' => 'success', 'message' => 'Tạo mới và lưu thành công!']);
        } else {
            throw new Exception('Lỗi SQL Insert: Không thể tạo dòng mới.');
        }
    }
} catch (Exception $e) {
    http_response_code(500); // Trả về mã lỗi 500 để JS nhận biết
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}