document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row'); // Lấy danh sách các dòng
    
    // Biến toàn cục để dùng được trong hàm toggleSticky bên PHP
    window.activeElement = null; 

    // =================================================
    // 1. LOGIC KÉO THẢ (DRAG & DROP)
    // =================================================
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
            e.stopPropagation();
            zone.classList.remove('drag-over');
            
            const componentClass = e.dataTransfer.getData('text/plain');
            const componentName = e.dataTransfer.getData('name');

            if (componentClass) {
                const placeholder = zone.querySelector('.empty-placeholder');
                if (placeholder) placeholder.remove();

                const html = renderElementPreview(componentName, componentClass);
                const div = document.createElement('div');
                div.innerHTML = html;
                const newEl = div.firstElementChild;

                // Click vào Element -> Chọn Element
                newEl.addEventListener('click', (ev) => {
                    ev.stopPropagation(); 
                    selectElement(newEl, componentClass);
                });

                // Click nút Xóa
                const btnDelete = newEl.querySelector('.btn-delete');
                if(btnDelete) {
                    btnDelete.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        newEl.remove();
                        propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Đã xóa element</div>';
                        if (zone.children.length === 0) zone.innerHTML = '<div class="empty-placeholder">Drop Here</div>';
                    });
                }

                zone.appendChild(newEl);
                selectElement(newEl, componentClass);
            }
        });
    });

    // =================================================
    // 2. LOGIC CHỌN ROW (DÒNG) - MỚI
    // =================================================
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            // Nếu click trúng nút xóa hoặc element con thì bỏ qua
            if (e.target.closest('.builder-element') || e.target.classList.contains('btn-delete')) return;

            // Xóa highlight cũ
            if (window.activeElement) {
                window.activeElement.classList.remove('ring-2', 'ring-indigo-500');
                if(window.activeElement.classList.contains('builder-row')) window.activeElement.style.outline = 'none';
            }

            // Highlight Row mới
            window.activeElement = row;
            window.activeElement.style.outline = '2px solid #6366f1'; // Viền xanh cho Row
            window.activeElement.style.outlineOffset = '-2px';

            // Load Form
            const label = row.getAttribute('data-label') || 'Row';
            loadSettingsForm('api/row_form.php?label=' + encodeURIComponent(label));
        });
    });

    // =================================================
    // 3. CÁC HÀM HỖ TRỢ
    // =================================================
    
    function selectElement(element, className) {
        if (window.activeElement) {
            window.activeElement.classList.remove('ring-2', 'ring-indigo-500');
            if(window.activeElement.classList.contains('builder-row')) window.activeElement.style.outline = 'none';
        }
        
        window.activeElement = element;
        window.activeElement.classList.add('ring-2', 'ring-indigo-500');
        loadSettingsForm('api/form.php?class=' + encodeURIComponent(className));
    }

    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 opacity-60"><i class="ph ph-spinner animate-spin text-3xl"></i><p class="text-xs">Loading options...</p></div>';
        
        fetch(url)
            .then(res => res.text())
            .then(html => {
                propertyPanel.innerHTML = html;
                initLiveEdit(); 
            })
            .catch(err => {
                propertyPanel.innerHTML = '<div class="p-4 text-red-500 text-xs text-center">Lỗi tải form. Kiểm tra lại file API.</div>';
            });
    }

    // HÀM LIVE EDIT (QUAN TRỌNG: Cập nhật CSS Realtime)
    function initLiveEdit() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (!window.activeElement) return;

                const styleType = this.dataset.style; 
                const value = this.value;
                
                // Xác định đối tượng cần style (Row hoặc Element con)
                let target = window.activeElement;
                if (!window.activeElement.classList.contains('builder-row')) {
                    target = window.activeElement.querySelector('nav, input, img, button, .text-content') || window.activeElement;
                }

                switch (styleType) {
                    // --- ẢNH ---
                    case 'src':
                        const img = window.activeElement.querySelector('img');
                        if (img) img.src = value;
                        break;
                    
                    // --- MÀU SẮC ---
                    case 'color':
                        target.style.color = value;
                        // Nếu là Row: Đổi màu placeholder và các icon con
                        if(window.activeElement.classList.contains('builder-row')) {
                             window.activeElement.querySelectorAll('.empty-placeholder').forEach(el => el.style.color = value);
                             window.activeElement.querySelectorAll('i, span').forEach(el => el.style.color = value);
                        } else {
                             target.querySelectorAll('a, i, span').forEach(el => el.style.color = value);
                        }
                        break;
                    
                    case 'background-color':
                         // Nếu là Row: Đổi màu nền chính nó
                         if(window.activeElement.classList.contains('builder-row')) {
                             window.activeElement.style.backgroundColor = value;
                         } else {
                             const bgTarget = window.activeElement.querySelector('input, button, div') || window.activeElement;
                             bgTarget.style.backgroundColor = value;
                         }
                         break;

                    // --- TYPOGRAPHY ---
                    case 'font-size': target.style.fontSize = value + 'px'; break;
                    case 'font-weight': target.style.fontWeight = value; break;
                    case 'text-transform': target.style.textTransform = value; break;
                    
                    // --- BOX MODEL ---
                    case 'border-radius':
                        const radTarget = window.activeElement.querySelector('input, button, div') || window.activeElement;
                        radTarget.style.borderRadius = value + 'px';
                        break;
                    case 'width':
                         const imgTarget = window.activeElement.querySelector('img');
                         if(imgTarget) imgTarget.style.width = value + 'px';
                         else {
                             const wTarget = window.activeElement.querySelector('input, .w-full') || window.activeElement;
                             wTarget.style.width = value + (value.includes('%') ? '' : 'px');
                         }
                        break;
                    case 'gap': target.style.gap = value + 'px'; break;
                    
                    // --- FLEXBOX ALIGN ---
                    case 'justify-content': 
                        if (!window.activeElement.classList.contains('builder-row')) {
                            window.activeElement.style.display = 'flex';
                            window.activeElement.style.width = '100%';
                            window.activeElement.style.justifyContent = value;
                        }
                        break;
                    
                    // --- ROW SPECIFIC ---
                    case 'min-height': window.activeElement.style.minHeight = value + 'px'; break;
                    case 'border-bottom-color': window.activeElement.style.borderBottomColor = value; break;
                    case 'border-bottom-width': 
                        window.activeElement.style.borderBottomWidth = value;
                        window.activeElement.style.borderBottomStyle = 'solid';
                        break;
                     case 'box-shadow':
                        window.activeElement.style.boxShadow = value;
                        window.activeElement.style.zIndex = value === 'none' ? 'auto' : '20';
                        break;
                }
            });
        });
    }

    // 4. RENDER PREVIEW (Đủ 10 Elements)
    function renderElementPreview(name, className) {
        let content = '';
        let extraClass = '';
        
        if (name.includes('Menu')) {
            content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none">
                        <span>Điện thoại</span><span>Laptop</span><span>Apple</span><span>Samsung</span><span>PC</span>
                       </nav>`;
            extraClass = 'w-full';
        } 
        else if (name.includes('Logo')) {
            content = `<div class="w-full flex justify-start pointer-events-none"><img src="https://fptshop.com.vn/img/fpt-shop.png" class="h-8 object-contain"></div>`;
            extraClass = 'w-full';
        } 
        else if (name.includes('Search')) {
            content = `<div class="relative w-full min-w-[200px] pointer-events-none"><input type="text" placeholder="Bạn tìm gì..." class="w-full bg-gray-100 text-black px-3 py-1.5 rounded-full text-xs border-0 outline-none shadow-inner"><i class="ph ph-magnifying-glass absolute right-3 top-2 text-gray-500"></i></div>`;
            extraClass = 'w-full';
        }
        else if (name.includes('Cart')) {
             content = `<div class="flex flex-col items-center justify-center cursor-pointer pointer-events-none select-none px-2"><div class="relative"><i class="ph ph-shopping-cart text-2xl"></i><span class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div><span class="text-[10px] font-medium mt-0.5">Giỏ hàng</span></div>`;
        }
        else if (name.includes('Account')) {
             content = `<div class="flex items-center gap-2 cursor-pointer pointer-events-none select-none"><div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><i class="ph ph-user text-gray-600"></i></div><div class="flex flex-col leading-tight"><span class="text-[10px] text-gray-500">Member</span><span class="text-xs font-bold">Login</span></div></div>`;
        }
        else if (name.includes('Social')) {
            content = `<div class="flex items-center gap-3 pointer-events-none text-inherit"><i class="ph ph-facebook-logo text-lg"></i><i class="ph ph-instagram-logo text-lg"></i><i class="ph ph-tiktok-logo text-lg"></i></div>`;
        }
        else if (name.includes('Line') || name.includes('Vertical')) {
            content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`;
        }
        else if (name.includes('Button')) {
            content = `<a class="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold pointer-events-none whitespace-nowrap">Button</a>`;
        }
        else if (name.includes('Danh mục')) {
            content = `<div class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full cursor-pointer pointer-events-none"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap">Danh mục</span></div>`;
        }
        else if (name.includes('Text')) {
            content = `<div class="text-sm pointer-events-none whitespace-nowrap text-content"><span class="font-bold">Hotline:</span> 1800 6601</div>`;
        }
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
});