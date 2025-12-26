<?php
/*==========================================================================
   # CONFIG - System Core
==========================================================================*/
if (!defined('ROOT_DIR')) {
    define('ROOT_DIR', realpath(__DIR__));
}

$conn = mysqli_connect("localhost", "root", "", "relive_builder_db");
if (!$conn) die("Database connection error.");
