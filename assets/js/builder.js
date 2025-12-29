document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KHAI BÁO BIẾN ---
    const draggables = document.querySelectorAll('.draggable-item');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row'); // Các dòng ở Editor Panel
    const liveHeaderContainer = document.getElementById('live-header-container'); // Nơi hiển thị kết quả
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    const simulationFrame = document.getElementById('simulation-frame');

    let draggedItem = null;
    let sourceZone = null;

    window.activeElement = null;
    window.currentViewMode = 'desktop'; 

    // --- 2. KHỞI TẠO ---
    initBuilder();

    function initBuilder() {
        console.log("Builder Initialized");

        // Gán Label cho các Zone
        document.querySelectorAll('.drop-zone').forEach(zone => {
            let label = zone.getAttribute('data-zone').split('_')[1] || 'Zone';
            zone.setAttribute('data-label', label);
        });

        // Load dữ liệu cũ hoặc render mới
        if (window.savedData && Array.isArray(window.savedData) && window.savedData.length > 0) {
            restoreLayout(window.savedData);
        } else {
            updateAllZonesState();
            updateLivePreview();
        }
        
        setupDragAndDrop();
        setupRowEvents();
        setupViewSwitcher();
    }

    // --- 3. CHUYỂN ĐỔI GIAO DIỆN (MOBILE/PC) ---
    function setupViewSwitcher() {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                window.currentViewMode = mode;

                // Animation khung mô phỏng
                simulationFrame.className = `mode-${mode}`;

                // Active style nút bấm
                viewBtns.forEach(b => { 
                    b.classList.remove('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200'); 
                    b.classList.add('text-gray-500', 'border-transparent'); 
                });
                btn.classList.add('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200');
                btn.classList.remove('text-gray-500', 'border-transparent');

                // Render lại để áp dụng CSS ẩn/hiện
                updateLivePreview();
            });
        });
    }

    // --- 4. KÉO THẢ (DRAG & DROP LOGIC) ---
    function setupDragAndDrop() {
        // A. Kéo từ Sidebar (Tạo mới)
        draggables.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                draggedItem = null; 
                e.dataTransfer.setData('type', 'create');
                e.dataTransfer.setData('class', item.dataset.class);
                e.dataTransfer.setData('name', item.innerText.trim());
                // Lấy class icon để hiển thị xuống Chip
                const iconElement = item.querySelector('i');
                const iconClass = iconElement ? iconElement.className : 'ph ph-cube';
                e.dataTransfer.setData('icon', iconClass);
            });
        });

        // B. Xử lý vùng thả (Drop Zones)
        const zones = document.querySelectorAll('.drop-zone');
        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault(); // Bắt buộc để cho phép Drop
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');

                const type = e.dataTransfer.getData('type');
                const afterElement = getDragAfterElement(zone, e.clientX);

                // TRƯỜNG HỢP 1: Tạo mới từ Sidebar
                if (type === 'create') {
                    const cls = e.dataTransfer.getData('class');
                    const name = e.dataTransfer.getData('name');
                    const icon = e.dataTransfer.getData('icon');
                    
                    const newChip = createChipElement(name, cls, icon);
                    
                    if (afterElement) zone.insertBefore(newChip, afterElement);
                    else zone.appendChild(newChip);
                    
                    newChip.click(); // Mở cài đặt ngay
                }
                // TRƯỜNG HỢP 2: Di chuyển Chip cũ
                else if (draggedItem) {
                    if (afterElement) zone.insertBefore(draggedItem, afterElement);
                    else zone.appendChild(draggedItem);
                }

                // Dọn dẹp & Update
                checkZoneEmpty(zone);
                if (sourceZone && sourceZone !== zone) checkZoneEmpty(sourceZone);
                draggedItem = null; sourceZone = null;
                
                updateLivePreview();
            });
        });
    }

    // Tạo HTML cho Chip (Thẻ nhỏ)
    function createChipElement(name, className, iconClass) {
        const div = document.createElement('div');
        div.className = 'builder-element';
        div.setAttribute('data-class', className);
        div.setAttribute('draggable', 'true');
        
        div.innerHTML = `<i class="${iconClass}"></i><span>${name}</span><div class="btn-delete"><i class="ph ph-x"></i></div>`;

        attachChipEvents(div);
        return div;
    }

    // Gán sự kiện cho Chip
    function attachChipEvents(el) {
        // Click -> Mở Settings
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.activeElement) window.activeElement.classList.remove('is-selected');
            window.activeElement = el; 
            el.classList.add('is-selected');
            
            const cls = el.getAttribute('data-class');
            loadSettingsForm('api/form.php?class=' + encodeURIComponent(cls));
        });

        // Click Xóa
        const btnDel = el.querySelector('.btn-delete');
        if(btnDel) {
            btnDel.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                const parent = el.parentNode;
                el.remove(); 
                checkZoneEmpty(parent); 
                updateLivePreview();
                propertyPanel.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50"><p class="text-xs">Deleted</p></div>'; 
            });
        }

        // Kéo đi
        el.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            draggedItem = el;
            sourceZone = el.parentNode;
            el.classList.add('dragging');
            e.dataTransfer.setData('type', 'move');
        });

        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            if (sourceZone) checkZoneEmpty(sourceZone);
            if (el.parentNode) checkZoneEmpty(el.parentNode);
            updateLivePreview();
        });
    }

    // --- 5. RENDER PREVIEW (Đồng bộ Editor -> HTML thật) ---
    window.updateLivePreview = function() {
        if(!liveHeaderContainer) return;
        liveHeaderContainer.innerHTML = ''; 

        rows.forEach(row => {
            const rowHidden = row.getAttribute('data-row-hidden') === 'true';
            if (rowHidden) return;

            // Tạo Row HTML
            const rowDiv = document.createElement('div');
            rowDiv.className = 'header-row w-full relative border-b border-transparent';
            if(row.getAttribute('style')) rowDiv.setAttribute('style', row.getAttribute('style'));

            // Container
            const container = document.createElement('div');
            container.className = 'hb-inner-content flex items-center mx-auto px-4 w-full max-w-[1200px] h-full';
            container.style.gap = '15px';
            
            // Xử lý Zone
            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const position = zoneName.split('_')[1]; // left, center, right

                const colDiv = document.createElement('div');
                colDiv.className = `header-col col-${position} flex items-center h-full`;
                colDiv.style.gap = '15px';
                
                if (position === 'left') { colDiv.style.flex = '0 0 auto'; }
                else if (position === 'right') { colDiv.style.flex = '0 0 auto'; colDiv.style.justifyContent = 'flex-end'; }
                else if (position === 'center') { colDiv.style.flex = '1 1 auto'; colDiv.style.justifyContent = 'center'; }

                // Render Chip thành HTML
                const chips = zone.querySelectorAll('.builder-element');
                chips.forEach(chip => {
                    const cls = chip.getAttribute('data-class');
                    const settings = {};
                    Array.from(chip.attributes).forEach(attr => {
                        if (attr.name.startsWith('data-setting-')) {
                            settings[attr.name.replace('data-setting-', '')] = attr.value;
                        }
                    });
                    
                    // Hack nhẹ cho Menu/Socials
                    const nav = chip.querySelector('nav');
                    if (nav) settings['menu_config'] = nav.getAttribute('data-menu-config');
                    
                    const realHtml = renderRealHTML(cls, settings);
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = 'header-item-wrapper';
                    
                    // Class ẩn hiện responsive
                    if (settings.hide_mobile === 'true') wrapper.classList.add('hidden-mobile');
                    if (settings.hide_tablet === 'true') wrapper.classList.add('hidden-tablet');
                    if (settings.hide_desktop === 'true') wrapper.classList.add('hidden-desktop');
                    
                    // Width logic
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

        injectResponsiveStyles();
    }

    // Hàm sinh HTML chi tiết cho từng Element
    function renderRealHTML(className, s) {
        const color = s.color || 'inherit';
        const fontSize = s['font-size'] || '14';
        
        if (className.includes('Button')) {
            const bg = s['background-color'] || '#2563eb';
            const radius = s['border-radius'] || '4';
            return `<a href="${s.href||'#'}" class="flex items-center justify-center py-2 px-4 text-xs font-bold transition" style="background:${bg}; color:${color}; border-radius:${radius}px;">${s.text||'Button'}</a>`;
        }
        if (className.includes('CategoryBtn')) {
             const bg = s['background-color'] || '#f3f4f6';
             const radius = s['border-radius'] || '4';
             return `<div class="flex items-center gap-2 px-4 py-2" style="background:${bg}; color:${color}; border-radius:${radius}px;"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase">${s.text||'DANH MỤC'}</span><i class="ph ph-caret-down text-xs"></i></div>`;
        }
        if (className.includes('Search')) {
            if (s.layout === 'icon') return `<div class="cursor-pointer" style="color:${color}; font-size:20px;"><i class="ph ph-magnifying-glass"></i></div>`;
            const h = s.height || 36;
            const r = s['border-radius'] || 20;
            const bg = s['background-color'] || '#f3f4f6';
            const btnBg = s.button_bg || 'transparent';
            return `<form class="relative flex items-center w-full" style="height:${h}px; background:${bg}; border-radius:${r}px; min-width: 200px;"><input type="text" placeholder="${s.text||'Tìm kiếm...'}" class="flex-1 h-full px-4 border-0 bg-transparent text-xs outline-none" style="color:${color}"><button type="button" class="px-3 h-full flex items-center justify-center" style="background:${btnBg}"><i class="ph ph-magnifying-glass text-lg"></i></button></form>`;
        }
        if (className.includes('Logo')) {
            const src = s.src || "https://fptshop.com.vn/img/fpt-shop.png";
            const w = s.width || '150';
            const mw = s.mobile_width || w; 
            const isMobile = window.currentViewMode === 'mobile';
            const finalW = isMobile ? mw : w; 
            return `<img src="${src}" style="width:${finalW}px; height:auto; object-fit:contain; display:block;">`;
        }
        if (className.includes('Cart')) {
            const icon = s.icon_type || 'ph-shopping-cart';
            let extra = '';
            if (s.layout === 'icon_price') extra = `<span class="text-xs font-bold ml-2">1.250.000₫</span>`;
            if (s.layout === 'icon_label') extra = `<span class="text-xs font-bold ml-2">Giỏ hàng</span>`;
            return `<div class="flex items-center relative" style="color:${color}"><div class="relative"><i class="ph ${icon}" style="font-size:${fontSize}px"></i><span class="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div>${extra}</div>`;
        }
        if (className.includes('Menu')) {
            let items = []; try { items = JSON.parse(s.menu_config || '[]'); } catch(e){}
            if (items.length === 0) items = [{text:'Trang chủ', href:'#'}, {text:'Sản phẩm', href:'#'}];
            const gap = s.gap || 20;
            let html = ''; items.forEach(i => html += `<a href="${i.href}" class="hover:text-blue-600 transition">${i.text}</a>`);
            return `<nav class="flex items-center whitespace-nowrap" style="gap:${gap}px; color:${color}; font-size:${fontSize}px; font-weight:${s['font-weight']||500}">${html}</nav>`;
        }
        if (className.includes('Socials')) {
            let items = []; try { items = JSON.parse(s.social_items || '[]'); } catch(e){}
            if (items.length === 0) items = [{type:'icon', val:'ph-facebook-logo'}];
            const gap = s.gap || 15;
            const shape = s.shape || 'none';
            let shapeClass = '';
            if (shape === 'circle') shapeClass = 'rounded-full bg-gray-100 p-2';
            if (shape === 'square') shapeClass = 'rounded bg-gray-100 p-2';
            let html = '';
            items.forEach(i => {
                let content = (i.type === 'image') ? `<img src="${i.val}" style="width:${fontSize}px; height:${fontSize}px; object-fit:cover;">` : `<i class="ph ${i.val.includes('ph-')?i.val:'ph-'+i.val}" style="font-size:${fontSize}px"></i>`;
                html += `<a href="#" class="flex items-center justify-center ${shapeClass}">${content}</a>`;
            });
            return `<div class="flex items-center" style="gap:${gap}px; color:${color}">${html}</div>`;
        }
        if (className.includes('Account')) {
             const showIcon = s.show_icon !== 'false';
             const iconHtml = showIcon ? `<div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2"><i class="ph ph-user text-lg"></i></div>` : '';
             return `<div class="flex items-center" style="color:${color}">${iconHtml}<div class="flex flex-col leading-tight"><span class="text-[10px] opacity-70">${s.text_welcome||'Xin chào!'}</span><span class="text-xs font-bold">${s.text_action||'Đăng nhập'}</span></div></div>`;
        }
        if (className.includes('Text')) return `<div style="color:${color}; font-size:${fontSize}px; font-weight:${s['font-weight']||400}">${s.text_content||'Text'}</div>`;
        if (className.includes('Divider')) return `<div style="height:${s.height||24}px; width:1px; border-left:${s.width||1}px ${s['border-style']||'solid'} ${s['background-color']||'#ccc'}"></div>`;

        return `<div class="text-xs font-bold text-red-500">Unknown</div>`;
    }

    function injectResponsiveStyles() {
        if (document.getElementById('responsive-style-injection')) return;
        const style = document.createElement('style');
        style.id = 'responsive-style-injection';
        style.innerHTML = `
            #simulation-frame.mode-mobile .hidden-mobile { display: none !important; }
            #simulation-frame.mode-tablet .hidden-tablet { display: none !important; }
            #simulation-frame.mode-desktop .hidden-desktop { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    // --- 6. UTILS ---
    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.builder-element:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
            else return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function checkZoneEmpty(zone) {
        const hasElement = zone.querySelector('.builder-element');
        if (!hasElement) zone.classList.add('is-empty');
        else zone.classList.remove('is-empty');
    }

    // --- 7. LOAD SETTINGS & EDIT ---
    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex items-center justify-center text-gray-500"><i class="ph ph-spinner animate-spin text-2xl"></i></div>';
        fetch(url).then(res => res.text()).then(html => { 
            propertyPanel.innerHTML = html; 
            if(window.initLiveEdit) window.initLiveEdit(); 
        });
    }

    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        if(!window.activeElement) return;

        inputs.forEach(input => {
            const key = input.dataset.style;
            if(!key) return;
            const savedVal = window.activeElement.getAttribute('data-setting-' + key);
            
            if (input.type === 'checkbox') input.checked = (savedVal === 'true');
            else if (savedVal) input.value = savedVal;

            const eventType = (input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'input';
            
            input.addEventListener(eventType, function() {
                const val = (input.type === 'checkbox') ? (input.checked ? 'true' : 'false') : input.value;
                window.activeElement.setAttribute('data-setting-' + key, val);
                updateLivePreview();
            });
        });

        // Setup Repeater
        const cls = window.activeElement.getAttribute('data-class');
        if (cls.includes('Menu') || cls.includes('Socials')) setupRepeater(cls);
    }

    function setupRepeater(cls) {
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
        function update() { 
            const j = JSON.stringify(data); 
            if(hiddenInput) hiddenInput.value = j; 
            window.activeElement.setAttribute(attrKey, j); 
            updateLivePreview(); 
        }
        window.delRep = (i) => { data.splice(i, 1); render(); update(); };
        window.renderRep = () => { render(); }; 
        if(btnAdd) btnAdd.onclick = () => { if (cls.includes('Menu')) data.push({text:'New', href:'#'}); else data.push({type:'icon', val:'ph-star', link:'#'}); render(); update(); };
        render();
    }

    // --- 8. RESTORE & ROW EVENTS ---
    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            if(rowData.style) rowEl.setAttribute('style', rowData.style);
            
            if (rowData.columns) {
                for (const [zoneKey, items] of Object.entries(rowData.columns)) {
                    const zone = rowEl.querySelector(`.drop-zone[data-zone="${zoneKey}"]`);
                    if (!zone) continue;
                    zone.innerHTML = '';
                    items.forEach(elData => {
                        const shortName = elData.class.split('\\').pop(); 
                        const iconClass = getIconByClass(shortName);
                        const newChip = createChipElement(shortName, elData.class, iconClass);
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

    function getIconByClass(name) {
        if(name.includes('Logo')) return 'ph-image';
        if(name.includes('Search')) return 'ph-magnifying-glass';
        if(name.includes('Cart')) return 'ph-shopping-cart';
        if(name.includes('Menu')) return 'ph-list';
        if(name.includes('Socials')) return 'ph-share-network';
        if(name.includes('Account')) return 'ph-user';
        if(name.includes('Button')) return 'ph-hand-pointing';
        return 'ph-cube';
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

    function updateAllZonesState() {
        document.querySelectorAll('.drop-zone').forEach(checkZoneEmpty);
    }
});