// assets/js/frontend.js

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchModal();
});

// 1. XỬ LÝ MOBILE MENU (Tự động tạo nút 3 gạch)
function initMobileMenu() {
    // Tìm tất cả các Menu có trên Header
    const menus = document.querySelectorAll('.menu-nav');
    if (menus.length === 0) return;

    // Tạo HTML cho Mobile Drawer (Khung menu trượt)
    const drawerHTML = `
        <div id="mobile-drawer-overlay" class="drawer-overlay"></div>
        <div id="mobile-drawer" class="flex flex-col p-6 space-y-4">
            <div class="flex items-center justify-between border-b pb-4 mb-2">
                <span class="font-bold text-lg">Menu</span>
                <button id="close-drawer" class="text-2xl">&times;</button>
            </div>
            <div id="mobile-menu-links" class="flex flex-col space-y-3 text-sm font-medium">
                <!-- Links sẽ được copy vào đây -->
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    const closeBtn = document.getElementById('close-drawer');
    const linksContainer = document.getElementById('mobile-menu-links');

    // Duyệt qua từng menu để xử lý Responsive
    menus.forEach(menu => {
        // A. Ẩn menu gốc trên Mobile
        menu.classList.add('hidden', 'md:flex'); // Tailwind: ẩn mobile, hiện desktop

        // B. Tạo nút Hamburger (3 gạch) chèn ngay trước Menu gốc
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'md:hidden text-2xl px-2 focus:outline-none';
        hamburgerBtn.innerHTML = '<i class="ph ph-list"></i>';
        
        // C. Lấy màu chữ từ menu gốc để áp dụng cho icon 3 gạch
        if (menu.style.color) hamburgerBtn.style.color = menu.style.color;
        
        menu.parentNode.insertBefore(hamburgerBtn, menu);

        // D. Sự kiện Click mở menu
        hamburgerBtn.addEventListener('click', () => {
            // Copy links từ menu gốc vào drawer
            linksContainer.innerHTML = menu.innerHTML;
            
            // Style lại link cho đẹp trên mobile (dạng dọc)
            const links = linksContainer.querySelectorAll('a');
            links.forEach(a => {
                a.className = 'block py-2 border-b border-gray-100 hover:text-blue-600';
                a.style.color = '#333'; // Reset màu về đen cho dễ đọc trên nền trắng
            });

            // Mở Drawer
            drawer.classList.add('open');
            overlay.classList.add('open');
        });
    });

    // Đóng Drawer
    const closeDrawer = () => {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
    };
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
}

// 2. XỬ LÝ SEARCH POPUP
function initSearchModal() {
    const searchIcons = document.querySelectorAll('.search-icon-only');
    if (searchIcons.length === 0) return;

    // Tạo HTML cho Popup tìm kiếm
    const modalHTML = `
        <div id="search-modal">
            <div class="search-modal-close"><i class="ph ph-x"></i></div>
            <div class="w-full max-w-2xl px-4">
                <h3 class="text-center text-xl font-bold mb-4 text-gray-700 uppercase tracking-widest">Tìm kiếm sản phẩm</h3>
                <form action="/search" class="relative">
                    <input type="text" placeholder="Nhập từ khóa..." class="w-full text-2xl border-b-2 border-gray-300 py-4 outline-none bg-transparent focus:border-black transition">
                    <button type="submit" class="absolute right-0 top-4 text-3xl text-gray-400 hover:text-black">
                        <i class="ph ph-magnifying-glass"></i>
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('search-modal');
    const closeBtn = modal.querySelector('.search-modal-close');

    // Bấm vào icon kính lúp -> Mở Modal
    searchIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            modal.classList.add('open');
            modal.querySelector('input').focus();
        });
    });

    // Đóng Modal
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    
    // Bấm ESC để đóng
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('open');
    });
}