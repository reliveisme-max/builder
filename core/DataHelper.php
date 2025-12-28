<?php

namespace Core;

class DataHelper
{

    // 1. Dữ liệu Menu (Giả lập từ DB)
    public static function getMenuItems()
    {
        return [
            ['label' => 'Trang chủ', 'url' => 'home.php'],
            ['label' => 'Điện thoại', 'url' => '#'],
            ['label' => 'Laptop', 'url' => '#'],
            ['label' => 'Apple', 'url' => '#'],
            ['label' => 'Samsung', 'url' => '#'],
            ['label' => 'Xiaomi', 'url' => '#'],
            ['label' => 'Phụ kiện', 'url' => '#'],
            ['label' => 'Máy cũ', 'url' => '#'],
            ['label' => 'Sim thẻ', 'url' => '#'],
        ];
    }

    // 2. Lấy số lượng giỏ hàng
    public static function getCartCount()
    {
        if (session_status() == PHP_SESSION_NONE) session_start();
        return $_SESSION['cart_count'] ?? 0;
    }

    // 3. Lấy thông tin User đăng nhập
    public static function getUser()
    {
        if (session_status() == PHP_SESSION_NONE) session_start();
        return $_SESSION['user'] ?? null;
    }
}
