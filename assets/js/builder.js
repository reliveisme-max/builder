document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row');
    
    window.activeElement = null; 

    // --- 0. RESTORE DATA ---
    if (window.savedData && Array.isArray(window.savedData)) {
        restoreLayout(window.savedData);
    }

    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            if (rowData.style) rowEl.style.cssText = rowData.style;
            rowEl.style.outline = ''; // Clean outline

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
                    const div = document.createElement('div'); div.innerHTML = html;
                    const newEl = div.firstElementChild;

                    // Restore Style & Content
                    if (elData.style) newEl.style.cssText = elData.style;
                    if (elData.content) {
                        if (elData.content.src && elData.content.src.length > 5) newEl.querySelector('img').src = elData.content.src;
                        if (elData.content.text) {
                            const t = newEl.querySelector('.text-content, button, a, .inner-text'); 
                            if(t) t.innerText = elData.content.text;
                            const i = newEl.querySelector('input'); if(i) i.placeholder = elData.content.text;
                        }
                    }
                    attachEvents(newEl, elData.class);
                    zone.appendChild(newEl);
                });
            }
        });
    }

    // --- 1. DRAG & DROP ---
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

    // --- 2. EVENTS ---
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.builder-element') || e.target.classList.contains('btn-delete')) return;
            if (window.activeElement) {
                window.activeElement.classList.remove('is-selected');
                window.activeElement.classList.remove('ring-2', 'ring-indigo-500');
            }
            window.activeElement = row;
            window.activeElement.classList.add('is-selected');
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
        window.activeElement.classList.add('ring-2', 'ring-indigo-500');
        loadSettingsForm('api/form.php?class=' + encodeURIComponent(className));
    }

    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 opacity-60"><i class="ph ph-spinner animate-spin text-3xl"></i><p class="text-xs">Loading...</p></div>';
        fetch(url).then(res => res.text()).then(html => { propertyPanel.innerHTML = html; if(window.initLiveEdit) window.initLiveEdit(); });
    }

    // --- 3. LIVE EDIT (LOGIC MỚI - FIX STYLING) ---
    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (!window.activeElement) return;
                const type = this.dataset.style; 
                const val = this.value;
                const cls = window.activeElement.getAttribute('data-class') || '';

                // Logic tìm target để style
                let target = window.activeElement; // Default Wrapper

                // Nếu là Button hoặc CategoryBtn -> Style vào thẻ con
                if (cls.includes('Button') || cls.includes('CategoryBtn')) {
                    target = window.activeElement.querySelector('a, button, .inner-box');
                }
                // Nếu là Search -> Style vào box search
                else if (cls.includes('Search')) {
                    target = window.activeElement.querySelector('.search-box');
                    // Input trong search box phải trong suốt
                    const inp = target.querySelector('input'); 
                    if(inp) inp.style.backgroundColor = 'transparent';
                }

                switch (type) {
                    case 'text':
                        const txt = window.activeElement.querySelector('.text-content, button, a, .inner-text'); 
                        if (txt) txt.innerText = val;
                        const inp = window.activeElement.querySelector('input'); if (inp) inp.placeholder = val;
                        break;
                    case 'src': 
                        const img = window.activeElement.querySelector('img'); if (img) img.src = val; 
                        break;
                    case 'color': 
                        target.style.color = val; 
                        // Force con cái inherit màu
                        target.querySelectorAll('i, a, span, input').forEach(el => el.style.color = 'inherit');
                        break;
                    case 'background-color': 
                        target.style.backgroundColor = val; 
                        break;
                    case 'font-size': target.style.fontSize = val + 'px'; break;
                    case 'font-weight': target.style.fontWeight = val; break;
                    case 'text-transform': target.style.textTransform = val; break;
                    case 'border-radius': target.style.borderRadius = val + 'px'; break;
                    case 'gap': 
                        const flex = window.activeElement.querySelector('.flex'); 
                        if(flex) flex.style.gap = val + 'px';
                        else target.style.gap = val + 'px';
                        break;
                    case 'width': 
                        const i = window.activeElement.querySelector('img');
                        if(i) i.style.width = val + 'px';
                        else if(cls.includes('Search')) target.style.width = val + '%';
                        else target.style.width = val + (val.includes('%')?'':'px');
                        break;
                    case 'padding-x': // Padding ngang
                        target.style.paddingLeft = val + 'px'; target.style.paddingRight = val + 'px';
                        break;
                    case 'justify-content': 
                        if(!window.activeElement.classList.contains('builder-row')) {
                            window.activeElement.style.display='flex'; window.activeElement.style.width='100%'; window.activeElement.style.justifyContent=val;
                        }
                        break;
                    // Row
                    case 'min-height': window.activeElement.style.minHeight = val + 'px'; break;
                    case 'border-bottom-color': window.activeElement.style.borderBottomColor = val; break;
                    case 'border-bottom-width': window.activeElement.style.borderBottomWidth = val; window.activeElement.style.borderBottomStyle = 'solid'; break;
                    case 'box-shadow': window.activeElement.style.boxShadow = val; window.activeElement.style.zIndex = val==='none'?'auto':'20'; break;
                }
            });
        });
    }

    // --- 4. RENDER PREVIEW ---
    function renderElementPreview(name, className) {
        let content = '', extra = '';
        if (name.includes('Menu')) { content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none"><span>Điện thoại</span><span>Laptop</span><span>Apple</span></nav>`; extra='w-full'; }
        else if (name.includes('Logo')) { content = `<div class="w-full flex justify-start pointer-events-none"><img src="https://fptshop.com.vn/img/fpt-shop.png" class="h-8 object-contain"></div>`; extra='w-full'; }
        else if (name.includes('Search')) { content = `<div class="search-box relative flex items-center h-9 w-full bg-gray-100 rounded-full pointer-events-none overflow-hidden"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 outline-none bg-transparent text-xs text-inherit"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></div>`; extra='w-full'; }
        else if (name.includes('Cart')) { content = `<div class="flex flex-col items-center pointer-events-none px-2 text-inherit"><i class="ph ph-shopping-cart text-2xl"></i><span class="text-[10px]">Giỏ hàng</span></div>`; }
        else if (name.includes('Account')) { content = `<div class="flex items-center gap-2 pointer-events-none text-inherit"><i class="ph ph-user text-2xl"></i><span>Login</span></div>`; }
        else if (name.includes('Button')) { content = `<a class="inner-box flex items-center justify-center py-2 px-4 rounded text-xs font-bold pointer-events-none whitespace-nowrap bg-blue-600 text-white">Button</a>`; }
        else if (name.includes('Social')) { content = `<div class="flex items-center gap-3 pointer-events-none text-inherit"><i class="ph ph-facebook-logo text-lg"></i><i class="ph ph-instagram-logo text-lg"></i></div>`; }
        else if (name.includes('Text')) { content = `<div class="text-sm pointer-events-none whitespace-nowrap text-content text-inherit"><span class="font-bold">Hotline:</span> 1800 6601</div>`; }
        else if (name.includes('Line') || name.includes('Divider')) { content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`; }
        else if (name.includes('Danh mục') || name.includes('CategoryBtn')) { content = `<div class="inner-box flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full pointer-events-none text-gray-800"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap inner-text">Danh mục</span><i class="ph ph-caret-down text-xs"></i></div>`; }
        else { content = `<span class="font-bold text-sm pointer-events-none">${name}</span>`; }

        return `<div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-1 rounded transition border border-transparent hover:border-blue-300 flex items-center justify-center ${extra}" data-class="${className}">${content}<div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110 hover:bg-red-600"><i class="ph ph-x text-xs font-bold"></i></div></div>`;
    }
});