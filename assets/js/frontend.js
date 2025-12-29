// assets/js/frontend.js

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchModal();
    initButtonHover();
});

function initButtonHover() {
    // Tìm các nút có data-hover
    const buttons = document.querySelectorAll('.inner-box[data-hover-bg], .inner-box[data-hover-color]');
    
    buttons.forEach(btn => {
        // Lưu màu gốc nếu chưa có
        if (!btn.getAttribute('data-original-bg')) {
            btn.setAttribute('data-original-bg', getComputedStyle(btn).backgroundColor);
        }
        if (!btn.getAttribute('data-original-color')) {
            btn.setAttribute('data-original-color', getComputedStyle(btn).color);
        }

        btn.addEventListener('mouseenter', () => {
            const hBg = btn.getAttribute('data-hover-bg');
            const hCol = btn.getAttribute('data-hover-color');
            if (hBg) btn.style.setProperty('background-color', hBg, 'important');
            if (hCol) btn.style.setProperty('color', hCol, 'important');
        });

        btn.addEventListener('mouseleave', () => {
            const oBg = btn.getAttribute('data-original-bg');
            const oCol = btn.getAttribute('data-original-color');
            if (oBg) btn.style.backgroundColor = oBg;
            if (oCol) btn.style.color = oCol;
        });
    });
}

// ... (Giữ nguyên phần Mobile Menu và Search Modal cũ) ...
// 1. XỬ LÝ MOBILE MENU
function initMobileMenu() {
    const menus = document.querySelectorAll('.menu-nav');
    if (menus.length === 0) return;

    const drawerHTML = `
        <div id="mobile-drawer-overlay" class="drawer-overlay"></div>
        <div id="mobile-drawer" class="flex flex-col p-6 space-y-4">
            <div class="flex items-center justify-between border-b pb-4 mb-2">
                <span class="font-bold text-lg">Menu</span>
                <button id="close-drawer" class="text-2xl">&times;</button>
            </div>
            <div id="mobile-menu-links" class="flex flex-col space-y-3 text-sm font-medium"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    const closeBtn = document.getElementById('close-drawer');
    const linksContainer = document.getElementById('mobile-menu-links');

    menus.forEach(menu => {
        menu.classList.add('hidden', 'md:flex'); 
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'md:hidden text-2xl px-2 focus:outline-none';
        hamburgerBtn.innerHTML = '<i class="ph ph-list"></i>';
        if (menu.style.color) hamburgerBtn.style.color = menu.style.color;
        menu.parentNode.insertBefore(hamburgerBtn, menu);

        hamburgerBtn.addEventListener('click', () => {
            linksContainer.innerHTML = menu.innerHTML;
            const links = linksContainer.querySelectorAll('a');
            links.forEach(a => {
                a.className = 'block py-2 border-b border-gray-100 hover:text-blue-600';
                a.style.color = '#333'; 
            });
            drawer.classList.add('open');
            overlay.classList.add('open');
        });
    });

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

    searchIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            modal.classList.add('open');
            modal.querySelector('input').focus();
        });
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('open');
    });
}