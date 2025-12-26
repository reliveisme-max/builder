<?php
/*==========================================================================
   # SYSTEM CONFIG - Kết nối Database relive_builder_db
==========================================================================*/
if (!defined('ROOT_DIR')) {
    define('ROOT_DIR', realpath(__DIR__));
}

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "relive_builder_db"; // Giữ đúng tên của bạn

$conn = mysqli_connect($host, $user, $pass, $dbname);
if (!$conn) {
    die("Kết nối Database thất bại: " . mysqli_connect_error());
}
