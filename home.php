<?php
// home.php
require_once 'config/app.php';
require_once 'core/Autoload.php';
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trang chủ FPT Shop (Demo Builder)</title>

    <!-- TailwindCSS & Icons -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>

    <!-- Font -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Custom CSS cho Frontend (Mobile Menu, Popup) -->
    <link rel="stylesheet" href="assets/css/frontend.css">

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        .container {
            max-width: 1200px;
        }
    </style>
</head>

<body class="bg-gray-100">

    <!-- 1. HEADER (Render từ Database) -->
    <?php \Core\Frontend::renderHeader(); ?>
    <!-- 2. NỘI DUNG DEMO -->
    <main class="container mx-auto px-4 py-8 space-y-8 min-h-screen">
        <div
            class="w-full h-[400px] bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-300 text-4xl font-bold border border-gray-200">
            BANNER SLIDER
        </div>

        <h2 class="text-2xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <?php for ($i = 1; $i <= 4; $i++): ?>
                <div
                    class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 group cursor-pointer">
                    <div class="h-40 md:h-48 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">IMG
                    </div>
                    <h3 class="font-medium text-gray-800 group-hover:text-blue-600 transition text-sm md:text-base">iPhone
                        15 Pro Max</h3>
                    <div class="mt-2 flex items-center justify-between">
                        <span class="text-red-600 font-bold text-sm md:text-base">34.990.000₫</span>
                    </div>
                </div>
            <?php endfor; ?>
        </div>
    </main>

    <footer class="bg-white border-t mt-12 py-12 text-center text-gray-500">
        &copy; 2025 FPT Shop Demo
    </footer>

    <!-- Frontend Logic (Mobile Menu, Search Popup) -->
    <script src="assets/js/frontend.js"></script>

</body>

</html>