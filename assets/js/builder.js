document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row');
    
    window.activeElement = null; 

    // 0. RESTORE
    if (window.savedData && Array.isArray(window.savedData)) {
        restoreLayout(window.savedData);
    }

    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            if (rowData.style) rowEl.style.cssText = rowData.style;

            // XÓA VIỀN NẾU LỠ LƯU TRONG DB (Fix lỗi cũ)
            rowEl.style.outline = ''; 
            rowEl.style.outlineOffset = '';

            for (const [zoneName, elements] of Object.entries(rowData.columns)) {
                const zone = rowEl.querySelector(`.drop-zone[data-zone="${zoneName}"]`);
                if (!zone) continue;
                if (elements.length > 0) {
                    const ph = zone.querySelector('.empty-placeholder');
                    if(ph) ph.remove();
                }
                elements.forEach(elData => {
                    const shortName = elData.class.split('\\').pop(); 
                    const html = renderElementPreview(shortName, elData.class);
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    const newEl = div.firstElementChild;
                    if (elData.style) newEl.style.cssText = elData.style;
                    if (elData.content) {
                        if (elData.content.src && elData.content.src.length>5) newEl.querySelector('img').src = elData.content.src;
                        if (elData.content.text) {
                            const t = newEl.querySelector('.text-content, button, a'); if(t) t.innerText=elData.content.text;
                            const i = newEl.querySelector('input'); if(i) i.placeholder=elData.content.text;
                        }
                    }
                    attachEvents(newEl, elData.class);
                    zone.appendChild(newEl);
                });
            }
        });
    }

    // 1. DRAG DROP
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.class);
            e.dataTransfer.setData('name', item.innerText.trim());
            item.classList.add('opacity-50');
        });
        item.addEventListener('dragend', () => item.classList.remove('opacity-50'));
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault(); e.stopPropagation(); zone.classList.remove('drag-over');
            const cls = e.dataTransfer.getData('text/plain');
            const name = e.dataTransfer.getData('name');
            if (cls) {
                const ph = zone.querySelector('.empty-placeholder'); if (ph) ph.remove();
                const html = renderElementPreview(name, cls);
                const div = document.createElement('div'); div.innerHTML = html;
                const newEl = div.firstElementChild;
                attachEvents(newEl, cls);
                zone.appendChild(newEl);
                selectElement(newEl, cls);
            }
        });
    });

    // 2. CHỌN ROW (SỬA LỖI VIỀN XANH TẠI ĐÂY)
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.builder-element') || e.target.classList.contains('btn-delete')) return;
            
            // Xóa class active cũ
            if (window.activeElement) {
                window.activeElement.classList.remove('is-selected'); // Xóa viền Row
                window.activeElement.classList.remove('ring-2', 'ring-indigo-500'); // Xóa viền Element
            }
            
            window.activeElement = row;
            window.activeElement.classList.add('is-selected'); // Thêm viền bằng Class (Không lưu vào DB)
            
            const label = row.getAttribute('data-label') || 'Row';
            loadSettingsForm('api/row_form.php?label=' + encodeURIComponent(label));
        });
    });

    function attachEvents(element, className) {
        element.addEventListener('click', (ev) => { ev.stopPropagation(); selectElement(element, className); });
        const btn = element.querySelector('.btn-delete');
        if(btn) btn.addEventListener('click', (ev) => {
            ev.stopPropagation(); element.remove();
            propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Deleted</div>';
        });
    }

    function selectElement(element, className) {
        if (window.activeElement) {
            window.activeElement.classList.remove('is-selected');
            window.activeElement.classList.remove('ring-2', 'ring-indigo-500');
        }
        window.activeElement = element;
        window.activeElement.classList.add('ring-2', 'ring-indigo-500'); // Tailwind ring class (an toàn)
        loadSettingsForm('api/form.php?class=' + encodeURIComponent(className));
    }

    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 opacity-60"><i class="ph ph-spinner animate-spin text-3xl"></i><p class="text-xs">Loading...</p></div>';
        fetch(url).then(res => res.text()).then(html => { propertyPanel.innerHTML = html; if(window.initLiveEdit) window.initLiveEdit(); });
    }

    // 3. LIVE EDIT
    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (!window.activeElement) return;
                const type = this.dataset.style; const val = this.value;
                let target = window.activeElement; 

                switch (type) {
                    case 'text':
                        const txt = target.querySelector('.text-content, button, a'); if (txt) txt.innerText = val;
                        const inp = target.querySelector('input'); if (inp) inp.placeholder = val;
                        break;
                    case 'src': const img = target.querySelector('img'); if (img) img.src = val; break;
                    case 'color': target.style.color = val; target.querySelectorAll('i, a, span').forEach(el => el.style.color = 'inherit'); break;
                    case 'background-color': target.style.backgroundColor = val; const ch = target.querySelector('a, button, input'); if(ch) ch.style.backgroundColor='transparent'; break;
                    case 'font-size': target.style.fontSize = val + 'px'; break;
                    case 'font-weight': target.style.fontWeight = val; break;
                    case 'text-transform': target.style.textTransform = val; break;
                    case 'border-radius': target.style.borderRadius = val + 'px'; break;
                    case 'gap': target.style.gap = val + 'px'; break;
                    case 'width': const i = target.querySelector('img'); if(i) i.style.width=val+'px'; else target.style.width=val+(val.includes('%')?'':'px'); break;
                    case 'justify-content': if(!target.classList.contains('builder-row')) { target.style.display='flex'; target.style.width='100%'; target.style.justifyContent=val; } break;
                    case 'min-height': target.style.minHeight = val + 'px'; break;
                    case 'border-bottom-color': target.style.borderBottomColor = val; break;
                    case 'border-bottom-width': target.style.borderBottomWidth = val; target.style.borderBottomStyle = 'solid'; break;
                    case 'box-shadow': target.style.boxShadow = val; target.style.zIndex = val==='none'?'auto':'20'; break;
                }
            });
        });
    }

    // 4. RENDER PREVIEW
    function renderElementPreview(name, className) {
        let content = '', extra = '';
        if (name.includes('Menu')) content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none"><span>Điện thoại</span><span>Laptop</span><span>Apple</span></nav>`, extra='w-full';
        else if (name.includes('Logo')) content = `<div class="w-full flex justify-start pointer-events-none"><img src="https://fptshop.com.vn/img/fpt-shop.png" class="h-8 object-contain"></div>`, extra='w-full';
        else if (name.includes('Search')) content = `<div class="relative w-full min-w-[200px] pointer-events-none"><input type="text" placeholder="Tìm kiếm..." class="w-full bg-transparent text-inherit px-3 py-1.5 rounded-full text-xs border border-gray-300 outline-none shadow-sm"><i class="ph ph-magnifying-glass absolute right-3 top-2 opacity-50"></i></div>`, extra='w-full';
        else if (name.includes('Cart')) content = `<div class="flex flex-col items-center justify-center cursor-pointer pointer-events-none select-none px-2"><i class="ph ph-shopping-cart text-2xl"></i><span class="text-[10px] font-medium mt-0.5">Giỏ hàng</span></div>`;
        else if (name.includes('Account')) content = `<div class="flex items-center gap-2 cursor-pointer pointer-events-none select-none"><i class="ph ph-user text-2xl"></i><span class="text-xs font-bold">Login</span></div>`;
        else if (name.includes('Button')) content = `<a class="flex items-center justify-center w-full h-full px-4 py-2 pointer-events-none whitespace-nowrap font-bold" style="background-color: transparent; color: inherit;">Button</a>`;
        else if (name.includes('Social')) content = `<div class="flex items-center gap-3 pointer-events-none text-inherit"><i class="ph ph-facebook-logo text-lg"></i><i class="ph ph-instagram-logo text-lg"></i></div>`;
        else if (name.includes('Text')) content = `<div class="text-sm pointer-events-none whitespace-nowrap text-content"><span class="font-bold">Hotline:</span> 1800 6601</div>`;
        else if (name.includes('Line') || name.includes('Divider')) content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`;
        else if (name.includes('Danh mục') || name.includes('CategoryBtn')) content = `<div class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full cursor-pointer pointer-events-none"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap">Danh mục</span></div>`;
        else content = `<span class="font-bold text-sm pointer-events-none">${name}</span>`;

        return `<div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-1 rounded transition border border-transparent hover:border-blue-300 flex items-center justify-center ${extra}" data-class="${className}">${content}<div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110 hover:bg-red-600"><i class="ph ph-x text-xs font-bold"></i></div></div>`;
    }
});