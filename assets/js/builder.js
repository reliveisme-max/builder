// assets/js/builder.js - FINAL DEBUG VERSION
document.addEventListener('DOMContentLoaded', () => {
    console.log("Builder JS Loaded v1.3"); // Kiểm tra xem file có chạy không

    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row');
    
    // Biến toàn cục
    window.activeElement = null; 

    // 1. EVENT: KÉO ELEMENT
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.class);
            e.dataTransfer.setData('name', item.innerText.trim());
            item.classList.add('opacity-50');
        });
        item.addEventListener('dragend', () => item.classList.remove('opacity-50'));
    });

    // 2. EVENT: VÙNG THẢ
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation(); // FIX DOUBLE DROP
            
            console.log("Dropped element");
            zone.classList.remove('drag-over');
            
            const componentClass = e.dataTransfer.getData('text/plain');
            const componentName = e.dataTransfer.getData('name');

            if (componentClass) {
                // Xóa placeholder
                const placeholder = zone.querySelector('.empty-placeholder');
                if (placeholder) placeholder.remove();

                const html = renderElementPreview(componentName, componentClass);
                const div = document.createElement('div');
                div.innerHTML = html;
                const newEl = div.firstElementChild;

                // Click Element
                newEl.addEventListener('click', (ev) => {
                    ev.stopPropagation(); 
                    console.log("Clicked Element");
                    selectElement(newEl, componentClass);
                });

                // Click Delete
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

    // 3. EVENT: CLICK VÀO DÒNG (ROW)
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            console.log("Clicked Row:", row);
            
            // Bỏ qua nếu click trúng nút xóa
            if (e.target.closest('.builder-element') || e.target.classList.contains('btn-delete')) return;

            if (window.activeElement) {
                window.activeElement.classList.remove('ring-2', 'ring-indigo-500');
                if(window.activeElement.classList.contains('builder-row')) window.activeElement.style.outline = 'none';
            }

            window.activeElement = row;
            window.activeElement.style.outline = '2px solid #6366f1';
            window.activeElement.style.outlineOffset = '-2px';

            const label = row.getAttribute('data-label') || 'Row';
            loadSettingsForm('api/row_form.php?label=' + encodeURIComponent(label));
        });
    });

    // --- HELPER FUNCTIONS ---
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
        propertyPanel.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 opacity-60"><i class="ph ph-spinner animate-spin text-3xl"></i><p class="text-xs">Loading...</p></div>';
        
        fetch(url)
            .then(res => {
                if(!res.ok) throw new Error("HTTP " + res.status);
                return res.text();
            })
            .then(html => {
                propertyPanel.innerHTML = html;
                initLiveEdit(); 
            })
            .catch(err => {
                console.error(err);
                propertyPanel.innerHTML = `<div class="p-4 text-red-500 text-xs text-center">Lỗi tải form: ${url}<br>Kiểm tra lại file API.</div>`;
            });
    }

    // assets/js/builder.js - Hàm initLiveEdit Cập nhật
    function initLiveEdit() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (!window.activeElement) return;

                const styleType = this.dataset.style; 
                const value = this.value;
                
                // Xác định đối tượng target
                let target = window.activeElement;
                if (!window.activeElement.classList.contains('builder-row')) {
                    target = window.activeElement.querySelector('nav, input, img, button, .text-content') || window.activeElement;
                }

                switch (styleType) {
                    // --- 1. XỬ LÝ NỘI DUNG CHỮ (FIX LỖI updateText) ---
                    case 'text':
                        // Nếu là Button hoặc Link
                        const btn = window.activeElement.querySelector('a, button');
                        if (btn) { 
                            btn.innerText = value; 
                        }
                        
                        // Nếu là Text/Hotline (cho phép HTML)
                        const txt = window.activeElement.querySelector('.text-content');
                        if (txt) { 
                            txt.innerHTML = value; 
                        }

                        // Nếu là Search Box (Placeholder)
                        const inp = window.activeElement.querySelector('input');
                        if (inp) { 
                            inp.placeholder = value; 
                        }
                        break;
                    // --------------------------------------------------

                    case 'src':
                        const img = window.activeElement.querySelector('img');
                        if (img) img.src = value;
                        break;
                    
                    case 'color':
                        target.style.color = value;
                        if(window.activeElement.classList.contains('builder-row')) {
                             window.activeElement.querySelectorAll('.empty-placeholder').forEach(el => el.style.color = value);
                             window.activeElement.querySelectorAll('i, span').forEach(el => el.style.color = value);
                        } else {
                             target.querySelectorAll('a, i, span').forEach(el => el.style.color = value);
                        }
                        break;
                    
                    case 'background-color':
                         if(window.activeElement.classList.contains('builder-row')) {
                             window.activeElement.style.backgroundColor = value;
                         } else {
                             const bgTarget = window.activeElement.querySelector('input, button, div') || window.activeElement;
                             bgTarget.style.backgroundColor = value;
                         }
                         break;

                    case 'font-size': target.style.fontSize = value + 'px'; break;
                    case 'font-weight': target.style.fontWeight = value; break;
                    case 'text-transform': target.style.textTransform = value; break;
                    
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
                    
                    case 'justify-content': 
                        if (!window.activeElement.classList.contains('builder-row')) {
                            window.activeElement.style.display = 'flex';
                            window.activeElement.style.width = '100%';
                            window.activeElement.style.justifyContent = value;
                        }
                        break;
                    
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

    function renderElementPreview(name, className) {
        let content = '';
        let extraClass = '';
        
        if (name.includes('Menu')) {
            content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none"><span>Điện thoại</span><span>Laptop</span><span>Apple</span></nav>`;
            extraClass = 'w-full';
        } else if (name.includes('Logo')) {
            content = `<div class="w-full flex justify-start pointer-events-none"><img src="https://fptshop.com.vn/img/fpt-shop.png" class="h-8 object-contain"></div>`;
            extraClass = 'w-full';
        } else if (name.includes('Search')) {
            content = `<div class="relative w-full min-w-[200px] pointer-events-none"><input type="text" placeholder="Tìm kiếm..." class="w-full bg-gray-100 text-black px-3 py-1.5 rounded-full text-xs border-0 outline-none"><i class="ph ph-magnifying-glass absolute right-3 top-2 text-gray-500"></i></div>`;
            extraClass = 'w-full';
        } else if (name.includes('Cart')) {
             content = `<div class="flex flex-col items-center justify-center cursor-pointer pointer-events-none select-none px-2"><i class="ph ph-shopping-cart text-2xl"></i><span class="text-[10px] font-medium mt-0.5">Giỏ hàng</span></div>`;
        } else if (name.includes('Account')) {
             content = `<div class="flex items-center gap-2 cursor-pointer pointer-events-none select-none"><i class="ph ph-user text-2xl"></i><span class="text-xs font-bold">Login</span></div>`;
        } else if (name.includes('Button')) {
            content = `<a class="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold pointer-events-none whitespace-nowrap">Button</a>`;
        } else if (name.includes('Social')) {
            content = `<div class="flex items-center gap-3 pointer-events-none text-inherit"><i class="ph ph-facebook-logo text-lg"></i><i class="ph ph-instagram-logo text-lg"></i></div>`;
        } else if (name.includes('Text')) {
            content = `<div class="text-sm pointer-events-none whitespace-nowrap text-content"><span class="font-bold">Hotline:</span> 1800 6601</div>`;
        } else if (name.includes('Line') || name.includes('Vertical')) {
            content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`;
        } else if (name.includes('Danh mục')) {
            content = `<div class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full cursor-pointer pointer-events-none"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap">Danh mục</span></div>`;
        } else {
            content = `<span class="font-bold text-sm pointer-events-none">${name}</span>`;
        }

        return `<div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-2 rounded transition border border-transparent hover:border-blue-300 ${extraClass}" data-class="${className}">${content}<div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110 hover:bg-red-600"><i class="ph ph-x text-xs font-bold"></i></div></div>`;
    }
});
// assets/js/ajax.js

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');

    if (!saveBtn) {
        console.error("LỖI: Không tìm thấy nút có ID là 'btn-save'. Kiểm tra lại file editor.php");
        return;
    }

    console.log("Ajax Save Script Loaded. Nút Save đã sẵn sàng.");

    saveBtn.addEventListener('click', function() {
        console.log("Đã click nút Save...");
        
        const btn = this;
        const originalText = btn.innerHTML;
        
        // 1. Hiệu ứng Loading
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Saving...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        // 2. QUÉT DỮ LIỆU TỪ CANVAS
        const structure = [];
        const rows = document.querySelectorAll('#canvas-frame .builder-row');

        rows.forEach(row => {
            const rowData = {
                label: row.getAttribute('data-label'),
                style: row.getAttribute('style') || '',
                columns: {}
            };

            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const elements = [];

                zone.querySelectorAll('.builder-element').forEach(el => {
                    const elData = {
                        class: el.getAttribute('data-class'),
                        style: el.getAttribute('style') || '',
                        content: {} 
                    };

                    // Lấy nội dung đè (Src ảnh, Text...)
                    const img = el.querySelector('img');
                    if (img) elData.content.src = img.src;

                    const text = el.querySelector('.text-content'); // Text
                    if (text) elData.content.text = text.innerText;
                    
                    const btnLink = el.querySelector('a, button'); // Button
                    if (btnLink) elData.content.text = btnLink.innerText;
                    
                    // Lấy justify-content nếu có (Logo alignment)
                    if (el.style.justifyContent) {
                         elData.content['justify-content'] = el.style.justifyContent;
                    }

                    elements.push(elData);
                });

                rowData.columns[zoneName] = elements;
            });

            structure.push(rowData);
        });

        console.log("Dữ liệu chuẩn bị gửi:", structure);

        // 3. GỬI VỀ SERVER
        fetch('api/save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ structure: structure })
        })
        .then(response => {
            // Kiểm tra nếu server trả về lỗi 500 hoặc 404
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            console.log("Server phản hồi:", data);
            
            if (data.status === 'success') {
                btn.innerHTML = '<i class="ph ph-check"></i> Saved!';
                btn.classList.remove('bg-[#111827]', 'bg-indigo-600'); 
                btn.classList.add('bg-green-600'); // Đổi màu xanh
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'bg-green-600');
                    btn.classList.add('bg-[#111827]'); // Trả về màu gốc
                }, 2000);
            } else {
                alert('Lỗi logic: ' + data.message);
                resetBtn(btn, originalText);
            }
        })
        .catch(error => {
            console.error('Lỗi mạng hoặc Server:', error);
            // Hiển thị lỗi chi tiết ra alert để dễ sửa
            alert('Có lỗi xảy ra!\nXem Console (F12) để biết chi tiết.\n' + error.message.substring(0, 100) + '...');
            resetBtn(btn, originalText);
        });
    });

    function resetBtn(btn, text) {
        btn.innerHTML = text;
        btn.disabled = false;
        btn.classList.remove('opacity-75');
    }
});