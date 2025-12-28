document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const propertyPanel = document.getElementById('property-panel');
    let activeElement = null;

    // 1. KÉO (DRAG START)
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.class);
            e.dataTransfer.setData('name', item.innerText.trim());
            item.classList.add('opacity-50');
        });
        item.addEventListener('dragend', () => item.classList.remove('opacity-50'));
    });

    // 2. XỬ LÝ VÙNG THẢ
    dropZones.forEach(zone => {
        // Drag Over
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            zone.classList.add('drag-over');
        });

        // Drag Leave
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        // 3. KHI THẢ (DROP) - FIX LỖI DOUBLE DROP TẠI ĐÂY
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation(); // <--- QUAN TRỌNG: Ngăn sự kiện nổi bọt (Fix lỗi kéo 1 ra 2)
            
            zone.classList.remove('drag-over');
            
            const componentClass = e.dataTransfer.getData('text/plain');
            const componentName = e.dataTransfer.getData('name');

            if (componentClass) {
                // Bước 1: Xóa placeholder (Dòng chữ mờ mờ)
                const placeholder = zone.querySelector('.empty-placeholder');
                if (placeholder) placeholder.remove();

                // Bước 2: Tạo HTML từ JS
                const html = renderElementPreview(componentName, componentClass);
                
                // Bước 3: Tạo DOM Element thật
                const div = document.createElement('div');
                div.innerHTML = html;
                const newEl = div.firstElementChild;

                // Bước 4: Gắn sự kiện Click (Chọn)
                newEl.addEventListener('click', (ev) => {
                    ev.stopPropagation(); // Ngăn click lan ra zone
                    selectElement(newEl, componentClass);
                });

                // Bước 5: Gắn sự kiện Xóa
                const btnDelete = newEl.querySelector('.btn-delete');
                if(btnDelete) {
                    btnDelete.addEventListener('click', (ev) => {
                        ev.stopPropagation(); // Ngăn click lan ra element cha
                        newEl.remove();
                        propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Đã xóa element</div>';
                        
                        // Nếu zone trống thì trả lại placeholder (Optional)
                         if (zone.children.length === 0) {
                             zone.innerHTML = '<div class="empty-placeholder">Drop Here</div>';
                         }
                    });
                }

                // Bước 6: Thêm vào vùng thả
                zone.appendChild(newEl);
                
                // Tự động active element vừa thả
                selectElement(newEl, componentClass);
            }
        });
    });

    // 4. HÀM CHỌN ELEMENT & LOAD FORM
    function selectElement(element, className) {
        // Xóa active cũ
        if (activeElement) activeElement.classList.remove('ring-2', 'ring-indigo-500');
        
        // Active mới
        activeElement = element;
        activeElement.classList.add('ring-2', 'ring-indigo-500');

        // Hiện loading
        propertyPanel.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 opacity-60"><i class="ph ph-spinner animate-spin text-3xl"></i><p class="text-xs">Loading options...</p></div>';

        // Gọi API lấy Form PHP
        fetch('api/form.php?class=' + encodeURIComponent(className))
            .then(res => res.text())
            .then(html => {
                propertyPanel.innerHTML = html;
                initLiveEdit(); 
            })
            .catch(err => {
                propertyPanel.innerHTML = '<div class="p-4 text-red-500 text-xs text-center">Lỗi tải form cài đặt.<br>Hãy kiểm tra file api/form.php</div>';
            });
    }

    // 5. HÀM LIVE EDIT (FINAL VERSION - Support cả Row & Element)
    function initLiveEdit() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (!activeElement) return;

                const styleType = this.dataset.style; 
                const value = this.value;
                
                // Logic target: Nếu đang chọn Row thì target chính là row
                // Nếu đang chọn Element thì tìm con bên trong
                let target = activeElement;
                if (!activeElement.classList.contains('builder-row')) {
                    target = activeElement.querySelector('nav, input, img, button, .text-content') || activeElement;
                }

                switch (styleType) {
                    case 'src':
                        const img = activeElement.querySelector('img');
                        if (img) img.src = value;
                        break;
                    case 'color':
                        target.style.color = value;
                        // Nếu là row thì gán màu cho cả con cháu
                        if(activeElement.classList.contains('builder-row')) {
                             activeElement.querySelectorAll('.empty-placeholder').forEach(el => el.style.color = value);
                        } else {
                             target.querySelectorAll('a, i, span').forEach(el => el.style.color = value);
                        }
                        break;
                    case 'background-color':
                         // Nếu là row thì gán bg trực tiếp
                         if(activeElement.classList.contains('builder-row')) {
                             activeElement.style.backgroundColor = value;
                         } else {
                             const bgTarget = activeElement.querySelector('input, button, div') || activeElement;
                             bgTarget.style.backgroundColor = value;
                         }
                         break;
                    case 'font-size':
                        target.style.fontSize = value + 'px';
                        break;
                    case 'font-weight':
                        target.style.fontWeight = value;
                        break;
                    case 'text-transform':
                        target.style.textTransform = value;
                        break;
                    case 'border-radius':
                        const borderTarget = activeElement.querySelector('input, button, div') || activeElement;
                        borderTarget.style.borderRadius = value + 'px';
                        break;
                    case 'width':
                         const imgTarget = activeElement.querySelector('img');
                         if(imgTarget) imgTarget.style.width = value + 'px';
                         else {
                             const wTarget = activeElement.querySelector('input, .w-full') || activeElement;
                             wTarget.style.width = value + (value.includes('%') ? '' : 'px');
                         }
                        break;
                    case 'gap':
                        target.style.gap = value + 'px';
                        break;
                    case 'justify-content': 
                        if (!activeElement.classList.contains('builder-row')) {
                            activeElement.style.display = 'flex';
                            activeElement.style.width = '100%';
                            activeElement.style.justifyContent = value;
                        }
                        break;
                    
                    // --- ROW SPECIFIC ---
                    case 'min-height':
                        activeElement.style.minHeight = value + 'px';
                        break;
                    case 'border-bottom-color':
                        activeElement.style.borderBottomColor = value;
                        break;
                    case 'border-bottom-width':
                        activeElement.style.borderBottomWidth = value;
                        activeElement.style.borderBottomStyle = 'solid';
                        break;
                     case 'box-shadow':
                        activeElement.style.boxShadow = value;
                        activeElement.style.zIndex = value === 'none' ? 'auto' : '20';
                        break;
                }
            });
        });
    }

    // 6. RENDER HTML PREVIEW (GIAO DIỆN GIẢ LẬP)
    function renderElementPreview(name, className) {
        let content = '';
        let extraClass = '';
        
        // --- 1. MENU ---
        if (name.includes('Menu')) {
            content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none">
                        <span>Điện thoại</span><span>Laptop</span><span>Apple</span><span>Samsung</span><span>PC</span>
                       </nav>`;
            extraClass = 'w-full';
        } 
        // --- 2. LOGO ---
        else if (name.includes('Logo')) {
            // Bọc trong div flex w-full để hỗ trợ căn lề
            content = `<div class="w-full flex justify-start pointer-events-none">
                         <img src="https://fptshop.com.vn/img/fpt-shop.png" class="h-8 object-contain">
                       </div>`;
            extraClass = 'w-full'; 
        } 
        // --- 3. SEARCH ---
        else if (name.includes('Search')) {
            content = `<div class="relative w-full min-w-[200px] pointer-events-none">
                        <input type="text" placeholder="Bạn tìm gì..." class="w-full bg-gray-100 text-black px-3 py-1.5 rounded-full text-xs border-0 outline-none shadow-inner">
                        <i class="ph ph-magnifying-glass absolute right-3 top-2 text-gray-500"></i>
                       </div>`;
            extraClass = 'w-full';
        }
        // --- 4. CART (MỚI) ---
        else if (name.includes('Giỏ hàng') || name.includes('Cart')) {
             content = `<div class="flex flex-col items-center justify-center cursor-pointer pointer-events-none select-none px-2">
                <div class="relative">
                    <i class="ph ph-shopping-cart text-2xl"></i>
                    <span class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span>
                </div>
                <span class="text-[10px] font-medium mt-0.5">Giỏ hàng</span>
            </div>`;
        }
        // --- 5. ACCOUNT ---
        else if (name.includes('Account') || name.includes('User')) {
             content = `<div class="flex items-center gap-2 cursor-pointer pointer-events-none select-none">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><i class="ph ph-user text-gray-600"></i></div>
                <div class="flex flex-col leading-tight"><span class="text-[10px] text-gray-500">Member</span><span class="text-xs font-bold">Login</span></div>
            </div>`;
        }
        // --- 6. TEXT / HOTLINE (MỚI) ---
        else if (name.includes('Text')) {
            content = `<div class="text-sm pointer-events-none whitespace-nowrap"><span class="font-bold">Hotline:</span> 1800 6601</div>`;
        }
        // --- 7. CATEGORY BUTTON (MỚI) ---
        else if (name.includes('Danh mục')) {
            content = `<div class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full cursor-pointer pointer-events-none">
                <i class="ph ph-list text-lg"></i>
                <span class="text-xs font-bold uppercase whitespace-nowrap">Danh mục</span>
            </div>`;
        }
        // 8. SOCIALS
        else if (name.includes('Social')) {
            content = `<div class="flex items-center gap-3 pointer-events-none text-inherit">
                <i class="ph ph-facebook-logo text-lg"></i>
                <i class="ph ph-instagram-logo text-lg"></i>
                <i class="ph ph-tiktok-logo text-lg"></i>
            </div>`;
        }
        // 9. DIVIDER
        else if (name.includes('Vertical') || name.includes('Line')) {
            content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`;
        }
        // 10. BUTTON
        else if (name.includes('Button')) {
            content = `<a class="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold pointer-events-none whitespace-nowrap">Button</a>`;
        }
        // --- DEFAULT ---
        else {
            content = `<span class="font-bold text-sm pointer-events-none">${name}</span>`;
        }

        return `
            <div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-2 rounded transition border border-transparent hover:border-blue-300 ${extraClass}" 
                 data-class="${className}">
                
                ${content}

                <div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110 hover:bg-red-600" title="Xóa">
                    <i class="ph ph-x text-xs font-bold"></i>
                </div>
            </div>
        `;
    }
    // 7. XỬ LÝ CHỌN ROW (DÒNG)
    const rows = document.querySelectorAll('.builder-row');
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            // Nếu click trúng element con thì không chọn row
            if (e.target.closest('.builder-element') || e.target.classList.contains('btn-delete')) {
                return;
            }

            // Xóa active cũ của element và row
            if (activeElement) {
                activeElement.classList.remove('ring-2', 'ring-indigo-500');
                // Nếu active cũ là row, xóa border xanh của row
                if(activeElement.classList.contains('builder-row')) {
                    activeElement.style.outline = 'none';
                }
            }

            // Active Row mới
            activeElement = row;
            // Dùng outline để highlight row (không dùng ring vì bị khuất)
            activeElement.style.outline = '2px solid #6366f1'; 
            activeElement.style.outlineOffset = '-2px';

            // Load Form Settings cho Row
            const label = row.getAttribute('data-label') || 'Row';
            propertyPanel.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 opacity-60"><i class="ph ph-spinner animate-spin text-3xl"></i><p class="text-xs">Loading row settings...</p></div>';

            fetch('api/row_form.php?label=' + encodeURIComponent(label))
                .then(res => res.text())
                .then(html => {
                    propertyPanel.innerHTML = html;
                    initLiveEdit(); // Tái sử dụng hàm live edit
                });
        });
    });

});