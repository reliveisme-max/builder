document.addEventListener('DOMContentLoaded', () => {
    // --- 1. BIẾN TOÀN CỤC ---
    const draggables = document.querySelectorAll('.draggable-item');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row');
    const canvasFrame = document.getElementById('canvas-frame');
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    
    let draggedItem = null; // Lưu element đang được kéo (Move)
    let sourceZone = null;  // Lưu vùng xuất phát

    window.activeElement = null; 

    // --- 2. KHỞI TẠO ---
    initBuilder();

    function initBuilder() {
        // Gán label cho dropzone để CSS hiển thị (UX)
        document.querySelectorAll('.drop-zone').forEach(zone => {
            let label = zone.getAttribute('data-zone').split('_')[1] || 'Zone';
            zone.setAttribute('data-label', label);
        });

        // Đảm bảo cấu trúc HTML
        rows.forEach(row => ensureInnerContent(row));
        
        // Khôi phục dữ liệu cũ nếu có
        if (window.savedData && Array.isArray(window.savedData) && window.savedData.length > 0) {
            restoreLayout(window.savedData);
        }
        
        // Cập nhật trạng thái rỗng/có nội dung cho các ô
        updateAllZonesState();

        // Kích hoạt các sự kiện
        setupDragAndDrop();
        setupRowEvents();
    }

    // --- 3. XỬ LÝ LAYOUT ---
    function ensureInnerContent(row) {
        row.style.width = '100%'; 
        row.classList.add('relative');

        let inner = row.querySelector('.hb-inner-content');
        if (!inner) {
            inner = document.createElement('div');
            inner.className = 'hb-inner-content';
            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => inner.appendChild(zone));
            row.appendChild(inner);
        }

        // Reset class cũ của Tailwind để CSS builder.css hoạt động
        inner.querySelectorAll('.drop-zone').forEach(z => {
            z.classList.remove('flex-1', 'flex-[2]', 'flex-[3]', 'w-full');
            
            // Inline style hỗ trợ (phòng khi CSS chưa load kịp)
            const zName = z.getAttribute('data-zone') || '';
            if (zName.includes('left')) z.style.justifyContent = 'flex-start';
            if (zName.includes('right')) z.style.justifyContent = 'flex-end';
            if (zName.includes('center')) z.style.justifyContent = 'center';
        });
        return inner;
    }

    function updateAllZonesState() {
        document.querySelectorAll('.drop-zone').forEach(checkZoneEmpty);
    }

    function checkZoneEmpty(zone) {
        const hasElement = zone.querySelector('.builder-element');
        if (!hasElement) {
            zone.classList.add('is-empty');
        } else {
            zone.classList.remove('is-empty');
        }
    }

    // --- 4. KÉO THẢ (DRAG & DROP) ---
    function setupDragAndDrop() {
        // A. Kéo từ Sidebar (Tạo mới)
        draggables.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                draggedItem = null; 
                e.dataTransfer.setData('type', 'create');
                e.dataTransfer.setData('class', item.dataset.class);
                e.dataTransfer.setData('name', item.innerText.trim());
            });
        });

        // B. Xử lý tại vùng thả (Drop Zones)
        const zones = document.querySelectorAll('.drop-zone');
        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');

                const type = e.dataTransfer.getData('type');
                // Tính toán vị trí thả để chèn vào giữa
                const afterElement = getDragAfterElement(zone, e.clientX);

                // TRƯỜNG HỢP 1: TẠO MỚI
                if (type === 'create') {
                    const cls = e.dataTransfer.getData('class');
                    const name = e.dataTransfer.getData('name');
                    
                    const html = renderElementPreview(name, cls);
                    const div = document.createElement('div'); div.innerHTML = html;
                    const newEl = div.firstElementChild;
                    
                    attachElementEvents(newEl, cls);

                    if (afterElement) zone.insertBefore(newEl, afterElement);
                    else zone.appendChild(newEl);
                    
                    newEl.click(); // Tự động chọn element mới
                }
                // TRƯỜNG HỢP 2: DI CHUYỂN (MOVE)
                else if (draggedItem) {
                    if (afterElement) zone.insertBefore(draggedItem, afterElement);
                    else zone.appendChild(draggedItem);
                }

                // Cập nhật lại giao diện (ẩn/hiện placeholder)
                checkZoneEmpty(zone);
                if (sourceZone && sourceZone !== zone) {
                    checkZoneEmpty(sourceZone);
                }
                
                draggedItem = null;
                sourceZone = null;
            });
        });
    }

    // Hàm tìm vị trí con trỏ chuột so với các element khác
    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.builder-element:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- 5. CÁC SỰ KIỆN KHÁC ---
    function setupRowEvents() {
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.builder-element') || e.target.closest('.btn-delete')) return;
                ensureInnerContent(row);
                if (window.activeElement) window.activeElement.classList.remove('is-selected', 'ring-2', 'ring-indigo-500');
                window.activeElement = row; window.activeElement.classList.add('is-selected');
                loadSettingsForm('api/row_form.php?label=' + encodeURIComponent(row.getAttribute('data-label')));
            });
        });
    }

    function attachElementEvents(el, cls) {
        // Sự kiện Click chọn
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.activeElement) window.activeElement.classList.remove('is-selected', 'ring-2', 'ring-indigo-500');
            window.activeElement = el; el.classList.add('ring-2', 'ring-indigo-500');
            loadSettingsForm('api/form.php?class=' + encodeURIComponent(cls));
        });

        // Sự kiện Xóa
        const btn = el.querySelector('.btn-delete');
        if(btn) btn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            const parent = el.parentNode;
            el.remove(); 
            checkZoneEmpty(parent); 
            propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Deleted</div>'; 
        });

        // Sự kiện Kéo (Drag Start)
        el.setAttribute('draggable', 'true');
        el.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            draggedItem = el;
            sourceZone = el.parentNode;
            el.classList.add('dragging');
            e.dataTransfer.setData('type', 'move');
            e.dataTransfer.effectAllowed = 'move';
        });

        // Sự kiện Kéo xong (Drag End)
        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            if (sourceZone) checkZoneEmpty(sourceZone);
            if (el.parentNode) checkZoneEmpty(el.parentNode);
        });

        // Hover Effect cho Button
        if(cls.includes('Button')) {
            const a = el.querySelector('a');
            if(a) {
                a.addEventListener('mouseenter', () => { a.style.backgroundColor = a.getAttribute('data-hover-bg') || a.getAttribute('data-original-bg'); a.style.color = a.getAttribute('data-hover-color') || a.getAttribute('data-original-color'); });
                a.addEventListener('mouseleave', () => { a.style.backgroundColor = a.getAttribute('data-original-bg'); a.style.color = a.getAttribute('data-original-color'); });
            }
        }
    }

    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex items-center justify-center text-gray-500"><i class="ph ph-spinner animate-spin text-2xl"></i></div>';
        fetch(url).then(res => res.text()).then(html => { propertyPanel.innerHTML = html; if(window.initLiveEdit) window.initLiveEdit(); });
    }

    // --- 6. KHÔI PHỤC DỮ LIỆU (RESTORE) ---
    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            const innerContent = ensureInnerContent(rowEl);
            
            // Khôi phục style Row
            if (rowData.style) {
                let bgStyle = rowData.style.replace(/max-width:[^;]+;/g, '').replace(/width:[^;]+;/g, '');
                rowEl.style.cssText += bgStyle;
            }
            const wMode = rowData.width_mode || 'container';
            const wVal = rowData.container_width || '1200px';
            rowEl.setAttribute('data-width-mode', wMode);
            rowEl.setAttribute('data-container-width', wVal);
            if (rowData.row_hidden === 'true') { rowEl.setAttribute('data-row-hidden', 'true'); rowEl.classList.add('is-hidden'); } else { rowEl.classList.remove('is-hidden'); }
            if (wMode === 'full') innerContent.style.maxWidth = '100%'; else innerContent.style.maxWidth = wVal;

            if (rowData.columns) {
                for (const [zoneKey, items] of Object.entries(rowData.columns)) {
                    const zone = innerContent.querySelector(`.drop-zone[data-zone="${zoneKey}"]`);
                    if (!zone) continue;
                    
                    zone.innerHTML = ''; // Xóa sạch để render lại
                    
                    items.forEach(elData => {
                        const shortName = elData.class.split('\\').pop(); 
                        const html = renderElementPreview(shortName, elData.class, elData.content); 
                        const div = document.createElement('div'); div.innerHTML = html;
                        const newEl = div.firstElementChild;
                        if (!newEl) return;

                        if (elData.content) {
                            const c = elData.content;
                            // Restore settings attributes
                            ['layout', 'shape', 'icon_type', 'hover_style', 'text-transform', 'font-size', 'color', 'background-color', 'width', 'height'].forEach(k => { if(c[k]) newEl.setAttribute('data-setting-'+k, c[k]); });
                            
                            if(c.menu_config) newEl.querySelector('nav')?.setAttribute('data-menu-config', c.menu_config);
                            if(c.social_items) newEl.querySelector('.social-group')?.setAttribute('data-social-items', c.social_items);
                            
                            // Restore Text (Bảo vệ các element phức tạp)
                            if(c.text) { 
                                const protectedClasses = ['Search', 'Account', 'Cart', 'CategoryBtn'];
                                const isProtected = protectedClasses.some(p => elData.class.includes(p));
                                if (!isProtected) {
                                    const t = newEl.querySelector('.inner-text, .text-content, button, a'); 
                                    if(t) t.innerText=c.text; 
                                }
                                const i = newEl.querySelector('input'); if(i) i.placeholder = c.text; 
                            }

                            if(c.href) newEl.querySelector('a')?.setAttribute('href', c.href);
                            if(c.src) newEl.querySelector('img')?.setAttribute('src', c.src);
                            if(c.text_content) newEl.querySelector('.text-content').innerText = c.text_content;
                            
                            // Account Data
                            if(c.text_welcome) newEl.querySelector('.inner-text-welcome').innerText = c.text_welcome;
                            if(c.text_action) newEl.querySelector('.inner-text-action').innerText = c.text_action;
                            if(c.link_login) newEl.querySelector('a')?.setAttribute('href', c.link_login);
                            
                            if(c.hover_bg) newEl.querySelector('a')?.setAttribute('data-hover-bg', c.hover_bg);
                            if(c.hover_color) newEl.querySelector('a')?.setAttribute('data-hover-color', c.hover_color);
                        }
                        if (elData.style) {
                            let target = getStyleTarget(newEl, elData.class);
                            if(target) target.style.cssText += elData.style;
                            const inp = target.querySelector('input'); if(inp) inp.style.backgroundColor='transparent';
                            if (elData.class.includes('Menu')) renderRepeaterHTML(newEl, 'Menu');
                            if (elData.class.includes('Socials')) renderRepeaterHTML(newEl, 'Socials');
                        }
                        attachElementEvents(newEl, elData.class);
                        zone.appendChild(newEl);
                    });
                }
            }
        });
        updateAllZonesState();
    }

    // --- 7. LIVE EDIT & HELPERS ---
    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        if(!window.activeElement) return;
        const cls = window.activeElement.getAttribute('data-class') || '';
        const isRow = window.activeElement.classList.contains('builder-row');

        if (cls.includes('Menu') || cls.includes('Socials')) setupRepeater(cls);

        inputs.forEach(input => {
            const type = input.dataset.style;
            if(!type) return;

            if (window.activeElement.hasAttribute('data-setting-' + type)) input.value = window.activeElement.getAttribute('data-setting-' + type);
            if (isRow) {
                if (type === 'width-mode') input.value = window.activeElement.getAttribute('data-width-mode') || 'container';
                if (type === 'container-width') input.value = parseInt(window.activeElement.getAttribute('data-container-width')) || 1200;
                if (type === 'min-height') input.value = parseInt(window.activeElement.style.minHeight) || 50;
                if (type === 'background-color') { const rgb = window.activeElement.style.backgroundColor; if(rgb) input.value = rgbToHex(rgb); }
                if (type === 'row_hidden') input.checked = window.activeElement.getAttribute('data-row-hidden') === 'true';
            }
            if(type === 'src') { const img = window.activeElement.querySelector('img'); if(img) input.value = img.getAttribute('src'); }
            if(type === 'font-size' && cls.includes('Cart')) { const i = window.activeElement.querySelector('i'); if(i) input.value = parseInt(i.style.fontSize)||24; }

            input.addEventListener('input', function() {
                const val = (input.type === 'checkbox') ? input.checked : input.value;
                const target = getStyleTarget(window.activeElement, cls);
                
                if(['layout','shape','icon_type','font-size','color','width', 'height'].includes(type)) window.activeElement.setAttribute('data-setting-' + type, val);

                switch (type) {
                    case 'height': 
                        if (cls.includes('Search')) { const b = window.activeElement.querySelector('.search-box'); if(b) b.style.height = val + 'px'; } 
                        else target.style.height = val + 'px'; 
                        break;
                    case 'width': 
    if (cls.includes('Search')) {
        // Search thì dùng cssText !important
        target.style.cssText += `; width: ${val}% !important;`;
    }
    else {
        // Các cái khác (bao gồm Logo) thì dùng style.width bình thường
        // Vì target của Logo giờ là Wrapper nên nó sẽ nhận width px
        target.style.width = val.includes('%') ? val : val + 'px'; 
    }
    break;
                    case 'row_hidden': if (val) { window.activeElement.setAttribute('data-row-hidden', 'true'); window.activeElement.classList.add('is-hidden'); } else { window.activeElement.removeAttribute('data-row-hidden'); window.activeElement.classList.remove('is-hidden'); } break;
                    case 'width-mode': window.activeElement.setAttribute('data-width-mode', val); const inner = window.activeElement.querySelector('.hb-inner-content'); if (inner) inner.style.maxWidth = (val === 'full') ? '100%' : (window.activeElement.getAttribute('data-container-width') || '1200px'); break;
                    case 'container-width': window.activeElement.setAttribute('data-container-width', val + 'px'); if (window.activeElement.getAttribute('data-width-mode') !== 'full') { window.activeElement.querySelector('.hb-inner-content').style.maxWidth = val + 'px'; } break;
                    case 'min-height': window.activeElement.style.minHeight = val + 'px'; break;
                    case 'background-color': if (isRow) window.activeElement.style.backgroundColor = val; else { target.style.backgroundColor = val; if(cls.includes('Button')) target.setAttribute('data-original-bg', val); } break;
                    case 'color': target.style.color = val; target.querySelectorAll('i, a, span, input').forEach(el => el.style.color = 'inherit'); if(cls.includes('Button')) target.setAttribute('data-original-color', val); break;
                    case 'font-size': if(cls.includes('Cart')) { const i = window.activeElement.querySelector('i'); if(i) i.style.fontSize = val + 'px'; } else target.style.fontSize = val + 'px'; break;
                    case 'gap': target.style.gap = val + 'px'; break;
                    case 'border-radius': target.style.borderRadius = val + 'px'; break;
                    case 'text': const t = window.activeElement.querySelector('.inner-text, .text-content, button, a'); if(t) t.innerText = val; const inp = window.activeElement.querySelector('input'); if(inp) inp.placeholder = val; break;
                    case 'src': const img = window.activeElement.querySelector('img'); if(img) img.src = val; break;
                    case 'layout':
                        if (cls.includes('Search')) { const old = window.activeElement.querySelector('form, .search-icon-only'); if(old) old.remove(); let html = (val === 'icon') ? `<div class="search-icon-only cursor-pointer hover:opacity-70" style="color:inherit;font-size:20px"><i class="ph ph-magnifying-glass"></i></div>` : `<form class="search-box relative flex items-center h-9 w-full bg-gray-100 rounded-full pointer-events-none" style="min-width:200px; width: 100%"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 bg-transparent text-xs"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></form>`; window.activeElement.insertAdjacentHTML('afterbegin', html); }
                        if (cls.includes('Cart')) { const wrap = window.activeElement.querySelector('.flex'); const span = wrap.querySelector('span:not(.absolute)'); if(span) span.remove(); if(val === 'icon_price') wrap.insertAdjacentHTML('beforeend', `<span class='text-xs font-bold ml-2'>1.250.000₫</span>`); if(val === 'icon_label') wrap.insertAdjacentHTML('beforeend', `<span class='text-xs font-bold ml-2'>Giỏ hàng</span>`); }
                        break;
                    case 'icon_type': if (cls.includes('Cart')) { const i = window.activeElement.querySelector('i'); if(i) i.className = `ph ${val}`; } break;
                    case 'shape': if(cls.includes('Socials')) { const lks = target.querySelectorAll('a'); lks.forEach(a => { a.className = 'social-link hover:opacity-80 transition flex items-center justify-center'; if(val === 'circle') a.classList.add('rounded-full', 'bg-gray-100', 'p-2'); if(val === 'square') a.classList.add('rounded', 'bg-gray-100', 'p-2'); }); } break;
                }
            });
        });
    };

    function setupRepeater(cls) {
        const container = document.getElementById(cls.includes('Menu')?'menu-items-container':'social-items-container');
        const hiddenInput = document.getElementById(cls.includes('Menu')?'hidden-menu-config':'hidden-social-items');
        const btnAdd = document.getElementById(cls.includes('Menu')?'btn-add-menu':'btn-add-social');
        if(!container || !hiddenInput || !btnAdd) return;
        const target = cls.includes('Menu') ? window.activeElement.querySelector('nav') : window.activeElement.querySelector('.social-group');
        const attr = cls.includes('Menu') ? 'data-menu-config' : 'data-social-items';
        let data = []; try { data = JSON.parse(target.getAttribute(attr)) || []; } catch(e){ data = []; } hiddenInput.value = JSON.stringify(data);
        function render() {
            container.innerHTML = ''; data.forEach((item, i) => { const d = document.createElement('div'); d.className = 'bg-gray-800 p-2 rounded border border-gray-700 flex flex-col gap-2 mb-2'; if(cls.includes('Menu')) d.innerHTML = `<div class="flex gap-2"><input type="text" value="${item.text}" data-idx="${i}" data-key="text" class="rep-inp flex-1 bg-gray-900 text-white text-xs p-1 rounded"><button onclick="window.delRep(${i})" class="text-red-500">X</button></div><input type="text" value="${item.href}" data-idx="${i}" data-key="href" class="rep-inp w-full bg-gray-900 text-gray-400 text-[10px] p-1 rounded">`; else d.innerHTML = `<div class="flex gap-2"><select data-idx="${i}" data-key="icon" class="rep-inp bg-gray-900 text-white text-xs p-1 rounded flex-1"><option value="ph-facebook-logo">Facebook</option><option value="ph-instagram-logo">Instagram</option><option value="ph-youtube-logo">Youtube</option><option value="ph-tiktok-logo">TikTok</option></select><button onclick="window.delRep(${i})" class="text-red-500">X</button></div>`; container.appendChild(d); });
            document.querySelectorAll('.rep-inp').forEach(inpt => { inpt.addEventListener('input', (e) => { data[e.target.dataset.idx][e.target.dataset.key] = e.target.value; update(); }); });
            if(!cls.includes('Menu')) { document.querySelectorAll('select.rep-inp').forEach(s => s.value = data[s.dataset.idx].icon); }
        }
        function update() { const j = JSON.stringify(data); hiddenInput.value = j; if(target) { target.setAttribute(attr, j); renderRepeaterHTML(window.activeElement, cls.includes('Menu')?'Menu':'Socials'); } }
        window.delRep = (i) => { data.splice(i, 1); render(); update(); };
        btnAdd.onclick = () => { data.push(cls.includes('Menu')?{text:'Link',href:'#'}:{icon:'ph-link',link:'#'}); render(); update(); };
        render();
    }
    
    // --- 8. HELPER FUNCTIONS ---
    function renderRepeaterHTML(el, type) { if(type==='Menu') { const n=el.querySelector('nav'); try{ const d=JSON.parse(n.getAttribute('data-menu-config')); let h=''; d.forEach(i=>h+=`<a href="${i.href}" class="hover:text-blue-600 transition px-1">${i.text}</a>`); n.innerHTML=h; }catch(e){} } if(type==='Socials') { const g=el.querySelector('.social-group'); try{ const d=JSON.parse(g.getAttribute('data-social-items')); let h=''; const s=window.activeElement.getAttribute('data-setting-shape'); const sc=(s==='circle')?'rounded-full bg-gray-100 p-2':((s==='square')?'rounded bg-gray-100 p-2':''); d.forEach(i=>h+=`<a href="${i.link}" class="social-link hover:opacity-80 transition flex items-center justify-center ${sc}"><i class="ph ${i.icon}"></i></a>`); g.innerHTML=h; }catch(e){} } }
    
    function rgbToHex(rgb) { if(!rgb || rgb==='rgba(0, 0, 0, 0)') return '#ffffff'; if(rgb.startsWith('#')) return rgb; let sep=rgb.indexOf(",")>-1?",":" "; rgb=rgb.substr(4).split(")")[0].split(sep); let r=(+rgb[0]).toString(16),g=(+rgb[1]).toString(16),b=(+rgb[2]).toString(16); if(r.length==1)r="0"+r; if(g.length==1)g="0"+g; if(b.length==1)b="0"+b; return "#"+r+g+b; }
    
    function getStyleTarget(root, cls) { 
    if(!cls) return root; 
    if(cls.includes('Button')||cls.includes('CategoryBtn')) return root.querySelector('.inner-box'); 
    if(cls.includes('Search')) return root.querySelector('.search-box, .search-icon-only'); 
    if(cls.includes('Menu')||cls.includes('Socials')) return root.querySelector('nav, .social-group'); 
    if(cls.includes('Divider')) return root.querySelector('div'); 
    if(cls.includes('Text')) return root.querySelector('.text-content'); 
    
    // FIX: Với Logo, trả về 'root' (Wrapper) thay vì 'img'.
    // Wrapper to bao nhiêu thì ảnh Logo bên trong sẽ to bấy nhiêu (nhờ CSS width: 100%).
    if(cls.includes('Logo')) return root; 

    return root; 
}
    
    function renderElementPreview(name, className, contentData = {}) {
        let content = ''; let extraClass = ''; const c = contentData || {}; 
        
        // Render Button
        if (className.includes('Button')) {
            content = `<a class="inner-box flex items-center justify-center py-2 px-4 rounded text-xs font-bold transition duration-200 pointer-events-none" style="background-color:#2563eb; color:#fff;" data-original-bg="#2563eb" data-original-color="#fff">Button</a>`;
        }
        // Render CategoryBtn
        else if (className.includes('CategoryBtn')) {
            content = `<div class="inner-box flex items-center gap-2 px-4 py-2 pointer-events-none" style="background-color:#f3f4f6; color:#333; border-radius:4px"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap inner-text">DANH MỤC</span><i class="ph ph-caret-down text-xs ml-1"></i></div>`;
        }
        // Render Socials
        else if (className.includes('Socials')) {
            content = `<div class="flex items-center social-group gap-3 pointer-events-none" data-social-items='[{"icon":"ph-facebook-logo","link":"#"}]' style="font-size:18px"><a class="social-link flex items-center justify-center"><i class="ph ph-facebook-logo"></i></a></div>`;
        }
        // Render Search (Always Full Width in Preview)
        else if (className.includes('Search')) { 
            const h = c.height || 36; 
            if (c.layout === 'icon') {
                content = `<div class="search-icon-only cursor-pointer hover:opacity-70" style="color: inherit; font-size: 20px;"><i class="ph ph-magnifying-glass"></i></div>`; 
            } else { 
                content = `<form class="search-box relative flex items-center w-full bg-gray-100 rounded-full pointer-events-none" style="min-width:200px; width: 100%; height: ${h}px"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 bg-transparent text-xs"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></form>`; 
                extraClass = 'w-full'; 
            } 
        }
        // Render Menu
        else if (className.includes('Menu')) { 
            content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none menu-nav" data-menu-config='[{"text":"Trang chủ","href":"/"}]'><span>Trang chủ</span></nav>`; 
            extraClass = 'w-full'; 
        }
        // Render Logo
        else if (className.includes('Logo')) { 
            const src = c.src || "https://fptshop.com.vn/img/fpt-shop.png"; 
            content = `<div class="w-full flex justify-start pointer-events-none"><img src="${src}" class="h-8 object-contain"></div>`; 
        }
        // Render Cart
        else if (className.includes('Cart')) { 
            let extra = ''; 
            if (c.layout === 'icon_price') extra = `<span class='text-xs font-bold ml-2'>1.250.000₫</span>`; 
            if (c.layout === 'icon_label') extra = `<span class='text-xs font-bold ml-2'>Giỏ hàng</span>`; 
            const iconCls = c.icon_type || 'ph-shopping-cart'; 
            content = `<div class="flex items-center pointer-events-none px-2 text-inherit"><div class="relative"><i class="ph ${iconCls} text-2xl"></i><span class="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div>${extra}</div>`; 
        }
        // Render Account
        else if (className.includes('Account')) { 
            content = `<a class="flex items-center gap-2 pointer-events-none text-inherit"><div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><i class="ph ph-user text-lg"></i></div><div class="flex flex-col leading-tight"><span class="text-[10px] inner-text-welcome">Xin chào!</span><span class="text-xs font-bold inner-text-action">Đăng nhập</span></div></a>`; 
        }
        // Render Text
        else if (className.includes('Text')) { 
            content = `<div class="text-sm pointer-events-none whitespace-nowrap text-content text-inherit" style="line-height:1.5">Nội dung tùy chỉnh...</div>`; 
        }
        // Render Divider
        else if (className.includes('Divider')) { 
            content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`; 
        }
        // Default
        else { 
            content = `<span class="font-bold text-sm pointer-events-none">${name}</span>`; 
        }

        return `
            <div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-1 rounded transition border border-transparent hover:border-blue-300 flex items-center justify-center ${extraClass}" data-class="${className}">
                ${content}
                <div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110 hover:bg-red-600">
                    <i class="ph ph-x text-xs font-bold"></i>
                </div>
            </div>
        `;
    }
    
    // View Mode Switcher
    viewBtns.forEach(btn => { 
        btn.addEventListener('click', () => { 
            canvasFrame.style.maxWidth = (btn.dataset.mode === 'mobile') ? '375px' : (btn.dataset.mode === 'tablet' ? '768px' : '100%'); 
        }); 
    });
});