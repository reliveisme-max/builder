<?php

namespace Core; // <--- Dòng này cực kỳ quan trọng, thiếu là lỗi ngay

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $conn;

    private function __construct()
    {
        // Đảm bảo ROOT_PATH đã được định nghĩa, nếu chưa thì require config
        if (!defined('DB_HOST')) {
            $configPath = __DIR__ . '/../config/app.php';
            if (file_exists($configPath)) {
                require_once $configPath;
            }
        }

        try {
            $this->conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die("Lỗi kết nối Database: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->conn;
    }
}
