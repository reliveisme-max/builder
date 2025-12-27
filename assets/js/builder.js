document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    let draggedItem = null;

    // 1. KÉO (DRAG START)
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            e.dataTransfer.setData('text/plain', item.dataset.class); // Lưu tên class PHP (VD: Modules\Header\Elements\Logo)
            e.dataTransfer.setData('name', item.innerText.trim());    // Lưu tên hiển thị
            item.classList.add('opacity-50');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('opacity-50');
            draggedItem = null;
        });
    });

    // 2. VÙNG THẢ (DROP ZONES)
    dropZones.forEach(zone => {
        // Hiệu ứng khi kéo qua
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Bắt buộc để cho phép drop
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        // 3. KHI THẢ (DROP)
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const componentClass = e.dataTransfer.getData('text/plain');
            const componentName = e.dataTransfer.getData('name');

            if (componentClass) {
                // Xóa placeholder cũ nếu có
                const placeholder = zone.querySelector('.empty-placeholder');
                if (placeholder) placeholder.remove();

                // Tạo Element hiển thị trong Canvas
                const elementHtml = renderElementPreview(componentName, componentClass);
                
                // Append vào vùng thả (Cho phép 1 vùng chứa nhiều item)
                const div = document.createElement('div');
                div.innerHTML = elementHtml;
                const newEl = div.firstElementChild;
                
                // Gắn sự kiện xóa cho nút X
                newEl.querySelector('.btn-delete').addEventListener('click', function(e) {
                    e.stopPropagation();
                    newEl.remove();
                    // Nếu zone trống thì hiện lại placeholder (Option)
                });

                // Gắn sự kiện click để active (Sau này làm Properties)
                newEl.addEventListener('click', function() {
                    document.querySelectorAll('.builder-element').forEach(el => el.classList.remove('ring-2', 'ring-indigo-500'));
                    newEl.classList.add('ring-2', 'ring-indigo-500');
                    // showProperties(componentClass); // Gọi hàm hiển thị setting bên phải
                });

                zone.appendChild(newEl);
            }
        });
    });

    // HÀM RENDER HTML GIẢ LẬP (CLIENT SIDE)
    // Thực tế sau này sẽ gọi AJAX để lấy HTML chuẩn từ PHP render()
    function renderElementPreview(name, className) {
        let content = '';
        let style = '';

        // Giả lập HTML dựa trên tên (Tạm thời)
        if (name.includes('Logo')) {
            content = '<img src="https://fptshop.com.vn/img/fpt-shop.png" class="h-8 object-contain pointer-events-none">';
        } else if (name.includes('Search')) {
            content = `
                <div class="relative w-full min-w-[200px]">
                    <input type="text" placeholder="Tìm kiếm..." class="w-full bg-gray-100 text-black px-3 py-1.5 rounded text-xs border-0 outline-none">
                    <i class="ph ph-magnifying-glass absolute right-2 top-2 text-gray-500"></i>
                </div>`;
        } else if (name.includes('Cart')) {
            content = `
                <div class="flex flex-col items-center cursor-pointer text-xs">
                    <div class="relative">
                        <i class="ph ph-shopping-cart text-xl"></i>
                        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3 h-3 flex items-center justify-center rounded-full">0</span>
                    </div>
                    <span>Giỏ hàng</span>
                </div>`;
        } else if (name.includes('Menu')) { // NẾU LÀ MENU
            style = 'width: 100%;';
            content = `
                <nav class="flex items-center gap-4 text-sm font-medium whitespace-nowrap overflow-hidden">
                    <span>Điện thoại</span>
                    <span>Laptop</span>
                    <span>Apple</span>
                    <span>PC</span>
                    <span>Phụ kiện</span>
                </nav>`;
        } else {
            // Mặc định
            content = `<span class="font-bold">${name}</span>`;
        }

        return `
            <div class="builder-element relative group cursor-pointer hover:bg-black/5 p-2 rounded transition border border-transparent hover:border-blue-300" 
                 data-class="${className}" style="${style}">
                
                ${content}

                <!-- Nút xóa -->
                <div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110" title="Xóa">
                    <i class="ph ph-x text-xs font-bold"></i>
                </div>
            </div>
        `;
    }
});
// assets/js/builder.js

document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const propertyPanel = document.getElementById('property-panel');
    let activeElement = null; // Biến lưu element đang được chọn

    // 1. KÉO THẢ (DRAG & DROP)
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.class);
            e.dataTransfer.setData('name', item.innerText.trim());
            item.classList.add('opacity-50');
        });
        item.addEventListener('dragend', () => item.classList.remove('opacity-50'));
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const componentClass = e.dataTransfer.getData('text/plain');
            const componentName = e.dataTransfer.getData('name');

            if (componentClass) {
                // Xóa placeholder
                const placeholder = zone.querySelector('.empty-placeholder');
                if (placeholder) placeholder.remove();

                // Render Preview
                const html = renderElementPreview(componentName, componentClass);
                const div = document.createElement('div');
                div.innerHTML = html;
                const newEl = div.firstElementChild;

                // Gắn sự kiện Click để mở Properties
                newEl.addEventListener('click', (e) => {
                    e.stopPropagation(); // Ngăn click lan ra ngoài
                    selectElement(newEl, componentClass);
                });

                // Nút xóa
                newEl.querySelector('.btn-delete').addEventListener('click', (e) => {
                    e.stopPropagation();
                    newEl.remove();
                    propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Đã xóa element</div>';
                });

                zone.appendChild(newEl);
                // Tự động chọn element vừa thả
                selectElement(newEl, componentClass);
            }
        });
    });

    // 2. HÀM CHỌN ELEMENT & LOAD FORM
    function selectElement(element, className) {
        // Xóa active cũ
        if (activeElement) activeElement.classList.remove('ring-2', 'ring-indigo-500');
        
        // Active mới
        activeElement = element;
        activeElement.classList.add('ring-2', 'ring-indigo-500');

        // Hiện loading
        propertyPanel.innerHTML = '<div class="p-10 text-center text-gray-500"><i class="ph ph-spinner animate-spin text-2xl"></i><br>Loading options...</div>';

        // Gọi API lấy Form PHP
        fetch('api/form.php?class=' + encodeURIComponent(className))
            .then(res => res.text())
            .then(html => {
                propertyPanel.innerHTML = html;
                initLiveEdit(); // Kích hoạt chức năng sửa trực tiếp
            })
            .catch(err => {
                propertyPanel.innerHTML = '<div class="p-4 text-red-500 text-xs">Lỗi tải form</div>';
            });
    }

    // 3. HÀM LIVE EDIT (Sửa bên phải -> Cập nhật bên trái)
    function initLiveEdit() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (!activeElement) return;

                const styleType = this.dataset.style; // Ví dụ: color, font-size...
                const value = this.value;

                // Tìm element con cần sửa (thường là thẻ a, span, p...)
                // Hoặc sửa trực tiếp activeElement
                const target = activeElement.querySelector('nav, span, p, div') || activeElement;

                if (styleType === 'color') {
                    target.style.color = value;
                    // Nếu là menu thì sửa cả thẻ a
                    target.querySelectorAll('a').forEach(a => a.style.color = value);
                } 
                else if (styleType === 'font-size') {
                    target.style.fontSize = value + 'px';
                }
                else if (styleType === 'gap') {
                    target.style.gap = value + 'px';
                }
            });
        });
    }

    // Helper: Render HTML giả lập (Client side preview)
    function renderElementPreview(name, className) {
        let content = '';
        let extraClass = '';
        
        // Logic giả lập hiển thị dựa trên tên Element
        if (name.includes('Menu')) {
            content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit">
                        <span>Điện thoại</span><span>Laptop</span><span>Apple</span><span>Samsung</span>
                       </nav>`;
            extraClass = 'w-full';
        } 
        else if (name.includes('Logo')) {
            content = '<img src="https://fptshop.com.vn/img/fpt-shop.png" class="h-8 object-contain pointer-events-none">';
        } 
        else if (name.includes('Search')) {
            content = `<div class="relative w-full min-w-[200px]">
                        <input type="text" placeholder="Bạn tìm gì..." class="w-full bg-gray-100 text-black px-3 py-1.5 rounded-full text-xs border-0 outline-none">
                        <i class="ph ph-magnifying-glass absolute right-3 top-2 text-gray-500"></i>
                       </div>`;
            extraClass = 'w-full';
        }
        else if (name.includes('Account')) {
             content = `<div class="flex items-center gap-2 cursor-pointer pointer-events-none">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><i class="ph ph-user text-gray-600"></i></div>
                <div class="flex flex-col leading-tight"><span class="text-[10px] text-gray-500">Member</span><span class="text-xs font-bold">Login</span></div>
            </div>`;
        }
        else {
            content = `<span class="font-bold text-sm">${name}</span>`;
        }

        return `
            <div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-2 rounded transition border border-transparent hover:border-blue-300 ${extraClass}" 
                 data-class="${className}">
                ${content}
                <div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110" title="Xóa">
                    <i class="ph ph-x text-xs font-bold"></i>
                </div>
            </div>
        `;
    }
});