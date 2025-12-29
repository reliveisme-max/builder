document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KHAI BÁO BIẾN ---
    const draggables = document.querySelectorAll('.draggable-item');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row'); 
    const liveHeaderContainer = document.getElementById('live-header-container'); 
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    const simulationFrame = document.getElementById('simulation-frame');

    let draggedItem = null;
    let sourceZone = null;

    window.activeElement = null;
    window.currentViewMode = 'desktop'; 

    // --- 2. KHỞI TẠO ---
    initBuilder();

    function initBuilder() {
        console.log("Builder 3.3 Initializing (Fix History & Sync)...");

        // Gán Label cho các Zone
        document.querySelectorAll('.drop-zone').forEach(zone => {
            let label = zone.getAttribute('data-zone').split('_')[1] || 'Zone';
            zone.setAttribute('data-label', label);
        });

        // Load dữ liệu cũ (Bọc try-catch để an toàn)
        try {
            if (window.savedData && Array.isArray(window.savedData) && window.savedData.length > 0) {
                restoreLayout(window.savedData);
            } else {
                updateAllZonesState();
                updateLivePreview();
            }
        } catch (e) {
            console.error("Lỗi restoreLayout:", e);
        }
        
        setupDragAndDrop();
        setupRowEvents();
        setupViewSwitcher();
    }

    // --- 3. VIEW SWITCHER ---
    function setupViewSwitcher() {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                window.currentViewMode = mode;

                simulationFrame.className = `mode-${mode}`;

                // Toggle class cho container để CSS Frontend nhận diện (Simulate Media Query)
                if(mode === 'mobile') liveHeaderContainer.classList.add('simulate-mobile');
                else liveHeaderContainer.classList.remove('simulate-mobile');

                viewBtns.forEach(b => { 
                    b.classList.remove('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200'); 
                    b.classList.add('text-gray-500', 'border-transparent'); 
                });
                btn.classList.add('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200');
                btn.classList.remove('text-gray-500', 'border-transparent');

                updateLivePreview();
            });
        });
    }

    // --- 4. RESTORE LAYOUT (FIX LỖI KHÔNG HIỆN LỊCH SỬ) ---
    function restoreLayout(data) {
        data.forEach(rowData => {
            // Tìm dòng tương ứng trong Editor
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            
            // 1. Khôi phục Cài đặt Row (Attributes)
            // Style string
            if(rowData.style) rowEl.setAttribute('style', rowData.style);
            
            // Các setting data-*
            if(rowData.width_mode) rowEl.setAttribute('data-width-mode', rowData.width_mode);
            if(rowData.container_width) rowEl.setAttribute('data-container-width', rowData.container_width);
            
            // [FIX QUAN TRỌNG] Khôi phục hiển thị Visual cho Editor Row
            // Màu nền
            if(rowData.style && rowData.style.includes('background-color')) {
                // Trích xuất màu từ chuỗi style (cách đơn giản)
                const bgMatch = rowData.style.match(/background-color:\s*([^;]+)/);
                if (bgMatch && bgMatch[1]) {
                    const bgVal = bgMatch[1];
                    rowEl.setAttribute('data-background-color', bgVal);
                    // Áp dụng ngay vào Editor Row để mắt người dùng thấy
                    const inner = rowEl.querySelector('.hb-inner-content');
                    if(inner) inner.style.backgroundColor = bgVal;
                }
            }
            
            // Ẩn hiện
            if(rowData.row_hidden === 'true') {
                rowEl.setAttribute('data-row-hidden', 'true');
                rowEl.classList.add('opacity-50', 'grayscale');
            }

            // Sticky
            if(rowData.style && rowData.style.includes('sticky')) {
                rowEl.setAttribute('data-sticky', 'true');
            }
            
            // 2. Khôi phục Elements (Chips)
            if (rowData.columns) {
                for (const [zoneKey, items] of Object.entries(rowData.columns)) {
                    const zone = rowEl.querySelector(`.drop-zone[data-zone="${zoneKey}"]`);
                    if (!zone) continue;
                    zone.innerHTML = ''; // Clear cũ
                    
                    items.forEach(elData => {
                        const shortName = elData.class.split('\\').pop(); 
                        const iconClass = getIconByClass(shortName);
                        const newChip = createChipElement(shortName, elData.class, iconClass);
                        
                        // Restore Settings vào Chip
                        if (elData.content) {
                            for (const [k, v] of Object.entries(elData.content)) {
                                newChip.setAttribute('data-setting-' + k, v);
                            }
                        }
                        zone.appendChild(newChip);
                    });
                }
            }
        });
        updateAllZonesState();
        updateLivePreview();
    }

    // --- 5. LIVE EDIT & SYNC ---
    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        if(!window.activeElement) return;

        const isRow = window.activeElement.classList.contains('builder-row');

        inputs.forEach(input => {
            const key = input.dataset.style;
            if(!key) return;

            // Load giá trị hiện tại lên Form
            let savedVal = '';
            if (isRow) {
                // Logic lấy value đặc biệt cho Row
                if (key === 'background-color') savedVal = window.activeElement.getAttribute('data-background-color');
                else if (key === 'color') savedVal = window.activeElement.style.color;
                else savedVal = window.activeElement.getAttribute('data-' + key);
            } else {
                savedVal = window.activeElement.getAttribute('data-setting-' + key);
            }

            // Gán vào input
            if (input.type === 'checkbox') input.checked = (savedVal === 'true');
            else if (input.type === 'color' && savedVal && savedVal.startsWith('#')) input.value = savedVal;
            else if (savedVal) input.value = savedVal;

            // Bắt sự kiện thay đổi
            const eventType = (input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'input';
            
            input.addEventListener(eventType, function() {
                const val = (input.type === 'checkbox') ? (input.checked ? 'true' : 'false') : input.value;

                if (isRow) {
                    // Cập nhật Visual cho Editor Row ngay lập tức
                    if (key === 'background-color') {
                        const inner = window.activeElement.querySelector('.hb-inner-content');
                        if(inner) inner.style.backgroundColor = val;
                        window.activeElement.setAttribute('data-background-color', val);
                    }
                    else if (key === 'row_hidden') {
                        window.activeElement.setAttribute('data-row-hidden', val);
                        if(val === 'true') window.activeElement.classList.add('opacity-50', 'grayscale');
                        else window.activeElement.classList.remove('opacity-50', 'grayscale');
                    }
                    else if (key === 'sticky') {
                        window.activeElement.setAttribute('data-sticky', val);
                    }
                    else {
                        window.activeElement.setAttribute('data-' + key, val);
                    }
                } else {
                    window.activeElement.setAttribute('data-setting-' + key, val);
                }
                
                updateLivePreview();
            });
        });

        if (!isRow) {
            const cls = window.activeElement.getAttribute('data-class');
            if (cls.includes('Menu') || cls.includes('Socials')) setupRepeater(cls);
        }
    }

    // --- 6. RENDER PREVIEW (HTML GENERATOR) ---
    window.updateLivePreview = function() {
        if(!liveHeaderContainer) return;
        liveHeaderContainer.innerHTML = ''; 

        rows.forEach(row => {
            const rowHidden = row.getAttribute('data-row-hidden') === 'true';
            if (rowHidden) return;

            // Row Wrapper
            const rowDiv = document.createElement('div');
            rowDiv.className = 'header-row';
            
            // Xây dựng Style cho Row
            let styleStr = '';
            const bg = row.getAttribute('data-background-color');
            if(bg) styleStr += `background-color: ${bg}; `;
            const color = row.style.color;
            if(color) styleStr += `color: ${color}; `;
            const sticky = row.getAttribute('data-sticky') === 'true';
            if (sticky) styleStr += 'position: sticky; top: 0; z-index: 999; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); ';
            const minH = row.getAttribute('data-min-height');
            if (minH) styleStr += `min-height: ${minH}px; `;
            
            rowDiv.setAttribute('style', styleStr);

            // Container
            const container = document.createElement('div');
            container.className = 'hb-inner-content';
            
            // Width Logic
            const widthMode = row.getAttribute('data-width-mode') || 'container';
            const contWidth = row.getAttribute('data-container-width') || '1200px';
            if(widthMode === 'full') {
                container.style.maxWidth = '100%';
                container.style.padding = '0 20px';
            } else {
                container.style.maxWidth = contWidth + (contWidth.includes('px')?'':'px');
            }

            // Columns (Left/Center/Right)
            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                if(!zoneName) return;
                const position = zoneName.split('_')[1]; 

                const colDiv = document.createElement('div');
                colDiv.className = `header-col col-${position}`;
                
                const chips = zone.querySelectorAll('.builder-element');
                chips.forEach(chip => {
                    const cls = chip.getAttribute('data-class');
                    const settings = {};
                    Array.from(chip.attributes).forEach(attr => {
                        if (attr.name.startsWith('data-setting-')) {
                            settings[attr.name.replace('data-setting-', '')] = attr.value;
                        }
                    });
                    
                    // Hack lấy JSON data
                    const nav = chip.querySelector('nav');
                    if (nav) settings['menu_config'] = nav.getAttribute('data-menu-config');
                    
                    const realHtml = renderRealHTML(cls, settings);
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = 'header-item-wrapper';
                    
                    // Responsive Classes
                    if (settings.hide_mobile === 'true') wrapper.classList.add('hidden-mobile');
                    if (settings.hide_tablet === 'true') wrapper.classList.add('hidden-tablet');
                    if (settings.hide_desktop === 'true') wrapper.classList.add('hidden-desktop');
                    
                    if (settings.width) wrapper.style.width = settings.width.includes('%') ? settings.width : settings.width + 'px';
                    if (cls.includes('Search') && position === 'center') wrapper.style.width = '100%';

                    wrapper.innerHTML = realHtml;
                    colDiv.appendChild(wrapper);
                });
                container.appendChild(colDiv);
            });

            rowDiv.appendChild(container);
            liveHeaderContainer.appendChild(rowDiv);
        });
        
        // CSS Injection (Support Mobile simulation in Div)
        injectResponsiveStyles();
    }

    // --- 7. HELPER: INJECT CSS FOR SIMULATION ---
    function injectResponsiveStyles() {
        if (document.getElementById('responsive-style-injection')) return;
        const style = document.createElement('style');
        style.id = 'responsive-style-injection';
        // Logic: Khi div cha có class .mode-mobile thì các class con hidden-mobile sẽ ẩn đi
        style.innerHTML = `
            #simulation-frame.mode-mobile .hidden-mobile { display: none !important; }
            #simulation-frame.mode-tablet .hidden-tablet { display: none !important; }
            #simulation-frame.mode-desktop .hidden-desktop { display: none !important; }
            
            /* Giả lập Mobile Wrap cho Preview trong Builder */
            #simulation-frame.mode-mobile .hb-inner-content { flex-wrap: wrap; padding-top: 10px; padding-bottom: 10px; }
            #simulation-frame.mode-mobile .header-col.col-left { order: 1; width: 50%; }
            #simulation-frame.mode-mobile .header-col.col-right { order: 2; width: 50%; }
            #simulation-frame.mode-mobile .header-col.col-center { order: 3; width: 100%; flex: 0 0 100%; margin-top: 10px; justify-content: center; }
        `;
        document.head.appendChild(style);
    }

    // ... (Giữ nguyên các hàm setupDragAndDrop, createChipElement, renderRealHTML như cũ) ...
    // COPY LẠI CÁC HÀM CŨ ĐỂ ĐẢM BẢO KHÔNG THIẾU
    
    function setupDragAndDrop() {
        draggables.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                draggedItem = null; e.dataTransfer.setData('type', 'create'); e.dataTransfer.setData('class', item.dataset.class); e.dataTransfer.setData('name', item.innerText.trim());
                const i = item.querySelector('i'); e.dataTransfer.setData('icon', i ? i.className : 'ph ph-cube');
            });
        });
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => { zone.classList.remove('drag-over'); });
            zone.addEventListener('drop', (e) => {
                e.preventDefault(); zone.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type'); const afterElement = getDragAfterElement(zone, e.clientX);
                if (type === 'create') {
                    const cls = e.dataTransfer.getData('class'); const name = e.dataTransfer.getData('name'); const icon = e.dataTransfer.getData('icon');
                    const newChip = createChipElement(name, cls, icon);
                    if (afterElement) zone.insertBefore(newChip, afterElement); else zone.appendChild(newChip);
                    newChip.click(); 
                } else if (draggedItem) { if (afterElement) zone.insertBefore(draggedItem, afterElement); else zone.appendChild(draggedItem); }
                checkZoneEmpty(zone); if (sourceZone && sourceZone !== zone) checkZoneEmpty(sourceZone); draggedItem = null; sourceZone = null;
                updateLivePreview();
            });
        });
    }
    
    function createChipElement(name, className, iconClass) {
        const div = document.createElement('div'); div.className = 'builder-element'; div.setAttribute('data-class', className); div.setAttribute('draggable', 'true');
        div.innerHTML = `<i class="${iconClass}"></i><span>${name}</span><div class="btn-delete"><i class="ph ph-x"></i></div>`;
        attachChipEvents(div); return div;
    }
    
    function attachChipEvents(el) {
        el.addEventListener('click', (e) => {
            e.stopPropagation(); if (window.activeElement) window.activeElement.classList.remove('is-selected');
            window.activeElement = el; el.classList.add('is-selected');
            loadSettingsForm('api/form.php?class=' + encodeURIComponent(el.getAttribute('data-class')));
        });
        const btn = el.querySelector('.btn-delete');
        if(btn) btn.addEventListener('click', (e) => { e.stopPropagation(); const p = el.parentNode; el.remove(); checkZoneEmpty(p); updateLivePreview(); propertyPanel.innerHTML = ''; });
        el.addEventListener('dragstart', (e) => { e.stopPropagation(); draggedItem = el; sourceZone = el.parentNode; el.classList.add('dragging'); e.dataTransfer.setData('type', 'move'); });
        el.addEventListener('dragend', () => { el.classList.remove('dragging'); if (sourceZone) checkZoneEmpty(sourceZone); if (el.parentNode) checkZoneEmpty(el.parentNode); updateLivePreview(); });
    }

    function renderRealHTML(className, s) {
        // ... (Giữ nguyên nội dung hàm renderRealHTML từ lần gửi trước - logic không đổi) ...
        const color = s.color || 'inherit'; const fontSize = s['font-size'] || '14';
        if (className.includes('Button')) { const bg = s['background-color'] || '#2563eb'; const r = s['border-radius'] || '4'; return `<a href="${s.href||'#'}" class="flex items-center justify-center py-2 px-4 text-xs font-bold transition" style="background:${bg}; color:${color}; border-radius:${r}px;">${s.text||'Button'}</a>`; }
        if (className.includes('CategoryBtn')) { const bg = s['background-color'] || '#f3f4f6'; const r = s['border-radius'] || '4'; return `<div class="flex items-center gap-2 px-4 py-2" style="background:${bg}; color:${color}; border-radius:${r}px;"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase">${s.text||'DANH MỤC'}</span><i class="ph ph-caret-down text-xs"></i></div>`; }
        if (className.includes('Search')) { if (s.layout === 'icon') return `<div class="cursor-pointer" style="color:${color}; font-size:20px;"><i class="ph ph-magnifying-glass"></i></div>`; const h = s.height || 36; const r = s['border-radius'] || 20; const bg = s['background-color'] || '#f3f4f6'; const btnBg = s.button_bg || 'transparent'; return `<form class="relative flex items-center w-full" style="height:${h}px; background:${bg}; border-radius:${r}px; min-width: 200px;"><input type="text" placeholder="${s.text||'Tìm kiếm...'}" class="flex-1 h-full px-4 border-0 bg-transparent text-xs outline-none" style="color:${color}"><button type="button" class="px-3 h-full flex items-center justify-center" style="background:${btnBg}"><i class="ph ph-magnifying-glass text-lg"></i></button></form>`; }
        if (className.includes('Logo')) { const src = s.src || "https://fptshop.com.vn/img/fpt-shop.png"; const w = s.width || '150'; const mw = s.mobile_width || w; const isMobile = window.currentViewMode === 'mobile'; const finalW = isMobile ? mw : w; return `<img src="${src}" style="width:${finalW}px; height:auto; object-fit:contain; display:block;">`; }
        if (className.includes('Cart')) { const icon = s.icon_type || 'ph-shopping-cart'; let extra = ''; if (s.layout === 'icon_price') extra = `<span class="text-xs font-bold ml-2">1.250.000₫</span>`; if (s.layout === 'icon_label') extra = `<span class="text-xs font-bold ml-2">Giỏ hàng</span>`; return `<div class="flex items-center relative" style="color:${color}"><div class="relative"><i class="ph ${icon}" style="font-size:${fontSize}px"></i><span class="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div>${extra}</div>`; }
        if (className.includes('Menu')) { let items = []; try { items = JSON.parse(s.menu_config || '[]'); } catch(e){} if (items.length === 0) items = [{text:'Trang chủ', href:'#'}]; const gap = s.gap || 20; let html = ''; items.forEach(i => html += `<a href="${i.href}" class="hover:text-blue-600 transition">${i.text}</a>`); return `<nav class="flex items-center whitespace-nowrap" style="gap:${gap}px; color:${color}; font-size:${fontSize}px; font-weight:${s['font-weight']||500}">${html}</nav>`; }
        if (className.includes('Socials')) { let items = []; try { items = JSON.parse(s.social_items || '[]'); } catch(e){} if (items.length === 0) items = [{type:'icon', val:'ph-facebook-logo'}]; const gap = s.gap || 15; const shape = s.shape || 'none'; let shapeClass = ''; if (shape === 'circle') shapeClass = 'rounded-full bg-gray-100 p-2'; if (shape === 'square') shapeClass = 'rounded bg-gray-100 p-2'; let html = ''; items.forEach(i => { let content = (i.type === 'image') ? `<img src="${i.val}" style="width:${fontSize}px; height:${fontSize}px; object-fit:cover;">` : `<i class="ph ${i.val.includes('ph-')?i.val:'ph-'+i.val}" style="font-size:${fontSize}px"></i>`; html += `<a href="#" class="flex items-center justify-center ${shapeClass}">${content}</a>`; }); return `<div class="flex items-center" style="gap:${gap}px; color:${color}">${html}</div>`; }
        if (className.includes('Account')) { const showIcon = s.show_icon !== 'false'; const iconHtml = showIcon ? `<div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2"><i class="ph ph-user text-lg"></i></div>` : ''; return `<div class="flex items-center" style="color:${color}">${iconHtml}<div class="flex flex-col leading-tight"><span class="text-[10px] opacity-70">${s.text_welcome||'Xin chào!'}</span><span class="text-xs font-bold">${s.text_action||'Đăng nhập'}</span></div></div>`; }
        if (className.includes('Text')) return `<div style="color:${color}; font-size:${fontSize}px; font-weight:${s['font-weight']||400}">${s.text_content||'Text'}</div>`;
        if (className.includes('Divider')) return `<div style="height:${s.height||24}px; width:1px; border-left:${s.width||1}px ${s['border-style']||'solid'} ${s['background-color']||'#ccc'}"></div>`;
        return '<div>Unknown</div>';
    }

    function setupRepeater(cls) {
        // ... (Giữ nguyên logic repeater) ...
        const container = document.getElementById(cls.includes('Menu')?'menu-items-container':'social-items-container');
        const hiddenInput = document.getElementById(cls.includes('Menu')?'hidden-menu-config':'hidden-social-items');
        const btnAdd = document.getElementById(cls.includes('Menu')?'btn-add-menu':'btn-add-social');
        if(!container) return;
        const attrKey = cls.includes('Menu') ? 'data-setting-menu_config' : 'data-setting-social_items';
        let raw = window.activeElement.getAttribute(attrKey);
        let data = []; try { data = JSON.parse(raw) || []; } catch(e){}
        function render() {
            container.innerHTML = '';
            data.forEach((item, i) => { 
                const d = document.createElement('div'); d.className = 'bg-gray-900 p-2 rounded border border-gray-700 flex flex-col gap-2 mb-2 relative group'; 
                const btnDel = `<button onclick="window.delRep(${i})" class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-500 bg-gray-800 hover:bg-gray-700 rounded z-10"><i class="ph ph-x text-xs"></i></button>`;
                if(cls.includes('Menu')) { d.innerHTML = `${btnDel}<div class="pr-6"><input type="text" value="${item.text}" data-idx="${i}" data-key="text" class="rep-inp w-full bg-gray-800 text-white text-xs p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="Tên menu"></div><div><input type="text" value="${item.href}" data-idx="${i}" data-key="href" class="rep-inp w-full bg-gray-800 text-blue-400 text-[10px] p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="Link"></div>`; } else { const isImg = item.type === 'image'; d.innerHTML = `${btnDel}<div class="flex gap-2 pr-6"><select data-idx="${i}" data-key="type" class="rep-inp bg-gray-800 text-white text-[10px] p-1 rounded border border-gray-600 w-16 focus:border-blue-500 outline-none" onchange="window.renderRep()"><option value="icon" ${!isImg?'selected':''}>Icon</option><option value="image" ${isImg?'selected':''}>Ảnh</option></select><input type="text" value="${item.val || ''}" data-idx="${i}" data-key="val" class="rep-inp flex-1 min-w-0 bg-gray-800 text-white text-xs p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="${isImg ? 'Link Ảnh' : 'Mã (vd: ph-user)'}"></div><div><input type="text" value="${item.link || ''}" data-idx="${i}" data-key="link" class="rep-inp w-full bg-gray-800 text-blue-400 text-[10px] p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="Link liên kết (#)"></div>`; }
                container.appendChild(d); 
            });
            document.querySelectorAll('.rep-inp').forEach(inpt => { inpt.addEventListener('input', (e) => { data[e.target.dataset.idx][e.target.dataset.key] = e.target.value; update(); }); });
        }
        function update() { const j = JSON.stringify(data); if(hiddenInput) hiddenInput.value = j; window.activeElement.setAttribute(attrKey, j); updateLivePreview(); }
        window.delRep = (i) => { data.splice(i, 1); render(); update(); };
        window.renderRep = () => { render(); }; 
        if(btnAdd) btnAdd.onclick = () => { if (cls.includes('Menu')) data.push({text:'New', href:'#'}); else data.push({type:'icon', val:'ph-star', link:'#'}); render(); update(); };
        render();
    }

    function setupRowEvents() {
        document.querySelectorAll('.row-settings-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = btn.closest('.builder-row');
                if (window.activeElement) window.activeElement.classList.remove('is-selected');
                window.activeElement = row; 
                loadSettingsForm('api/row_form.php?label=' + encodeURIComponent(row.getAttribute('data-label')));
            });
        });
    }

    function getIconByClass(name) {
        if(name.includes('Logo')) return 'ph-image'; if(name.includes('Search')) return 'ph-magnifying-glass'; if(name.includes('Cart')) return 'ph-shopping-cart'; if(name.includes('Menu')) return 'ph-list'; if(name.includes('Socials')) return 'ph-share-network'; if(name.includes('Account')) return 'ph-user'; if(name.includes('Button')) return 'ph-hand-pointing'; return 'ph-cube';
    }

    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.builder-element:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect(); const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) return { offset: offset, element: child }; else return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function checkZoneEmpty(zone) {
        const hasElement = zone.querySelector('.builder-element');
        if (!hasElement) zone.classList.add('is-empty'); else zone.classList.remove('is-empty');
    }

    function updateAllZonesState() {
        document.querySelectorAll('.drop-zone').forEach(checkZoneEmpty);
    }
});