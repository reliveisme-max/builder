<?php
session_start();
// Fake data để test
$_SESSION['user'] = ['name' => 'Khách hàng', 'email' => 'test@gmail.com'];
$_SESSION['cart_count'] = 2;

require_once 'config/app.php';
require_once 'core/Autoload.php';
require_once 'core/DataHelper.php';
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FPT Shop Demo Home</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>

<body class="bg-gray-100 font-sans text-gray-900">

    <!-- WRAPPER CHÍNH: GIỚI HẠN 1200PX ĐỂ KHỚP VỚI BUILDER -->
    <div class="w-full max-w-[1200px] mx-auto bg-white shadow-xl min-h-screen relative">

        <!-- Render Header -->
        <?php \Core\Frontend::renderHeader(); ?>

        <!-- Content Demo -->
        <main class="container mx-auto px-4 py-8 space-y-8">
            <div
                class="w-full h-[400px] bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 text-4xl font-bold border border-dashed border-gray-300">
                BANNER SLIDER
            </div>
            <h2 class="text-xl font-bold">Sản phẩm nổi bật</h2>
            <div class="grid grid-cols-4 gap-4">
                <?php for ($i = 0; $i < 4; $i++): ?>
                    <div class="bg-white p-4 border rounded-lg hover:shadow-lg transition">
                        <div class="h-40 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">IMG</div>
                        <div class="font-bold text-sm">iPhone 15 Pro Max</div>
                        <div class="text-red-600 font-bold text-sm">34.990.000₫</div>
                    </div>
                <?php endfor; ?>
            </div>
        </main>
    </div>

</body>

</html>