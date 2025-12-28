document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row');
    const canvasFrame = document.getElementById('canvas-frame');
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    
    window.activeElement = null; 

    // --- 0. RESTORE DATA ---
    if (window.savedData && Array.isArray(window.savedData) && window.savedData.length > 0) {
        restoreLayout(window.savedData);
    }

    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            
            // Tìm container bên trong row
            const innerContent = rowEl.querySelector('.hb-inner-content');

            // 1. Restore Row Style (Background áp dụng cho rowEl)
            if (rowData.style) {
                // Chỉ lấy các style liên quan đến background/border/color áp dụng cho Row
                // Loại bỏ width/max-width khỏi style string nếu có (để tránh xung đột cũ)
                let bgStyle = rowData.style.replace(/max-width:[^;]+;/g, '').replace(/width:[^;]+;/g, '');
                rowEl.style.cssText += bgStyle;
            }
            rowEl.style.outline = ''; 

            // 2. RESTORE CONTAINER SETTINGS (Width áp dụng cho innerContent)
            if (rowData.width_mode) {
                rowEl.setAttribute('data-width-mode', rowData.width_mode);
                if (innerContent) {
                    if (rowData.width_mode === 'full') {
                        innerContent.style.maxWidth = '100%';
                    } else {
                        // Mặc định container width
                        const w = rowData.container_width || '1200px';
                        innerContent.style.maxWidth = w;
                    }
                }
            }
            
            // Restore Container Width Value
            if (rowData.container_width) {
                rowEl.setAttribute('data-container-width', rowData.container_width);
                if (innerContent && rowData.width_mode !== 'full') {
                    innerContent.style.maxWidth = rowData.container_width;
                }
            }

            // 3. RESTORE COLUMNS & ITEMS
            for (const [zoneName, elements] of Object.entries(rowData.columns)) {
                const zone = rowEl.querySelector(`.drop-zone[data-zone="${zoneName}"]`);
                if (!zone) continue;

                zone.querySelectorAll('.builder-element').forEach(el => el.remove());

                if (elements.length > 0) { const ph = zone.querySelector('.empty-placeholder'); if(ph) ph.remove(); }
                
                elements.forEach(elData => {
                    const shortName = elData.class.split('\\').pop(); 
                    const html = renderElementPreview(shortName, elData.class, elData.content); 
                    const div = document.createElement('div'); div.innerHTML = html;
                    const newEl = div.firstElementChild;
                    if (!newEl) return;

                    if (elData.content) {
                        const c = elData.content;
                        const settingsKeys = ['layout', 'shape', 'icon_type', 'hover_style', 'text-transform'];
                        settingsKeys.forEach(key => { if (c[key]) newEl.setAttribute('data-setting-' + key, c[key]); });

                        if(c.menu_config) { const nav=newEl.querySelector('nav'); if(nav) nav.setAttribute('data-menu-config', c.menu_config); }
                        if(c.social_items) { const grp=newEl.querySelector('.social-group'); if(grp) grp.setAttribute('data-social-items', c.social_items); }
                        
                        if(c.text) { const t=newEl.querySelector('.text-content, button, a, .inner-text'); if(t) t.innerText=c.text; const inp=newEl.querySelector('input'); if(inp) inp.placeholder=c.text; }
                        if(c.href) { const a=newEl.querySelector('a'); if(a) a.href=c.href; }
                        if(c.src) { const i=newEl.querySelector('img'); if(i) i.src=c.src; }
                        if(c.text_content) { const t=newEl.querySelector('.text-content'); if(t) t.innerText=c.text_content; }
                        
                        if(c.text_welcome) { const t=newEl.querySelector('.inner-text-welcome'); if(t) t.innerText=c.text_welcome; }
                        if(c.text_action) { const t=newEl.querySelector('.inner-text-action'); if(t) t.innerText=c.text_action; }
                        if(c.link_login) { const a=newEl.querySelector('a'); if(a) a.href=c.link_login; }

                        if(c.hover_bg) newEl.querySelector('a')?.setAttribute('data-hover-bg', c.hover_bg);
                        if(c.hover_color) newEl.querySelector('a')?.setAttribute('data-hover-color', c.hover_color);
                    }

                    if (elData.style) {
                        let target = getStyleTarget(newEl, elData.class);
                        if(target) {
                            target.style.cssText += elData.style;
                            const inp = target.querySelector('input'); if(inp) inp.style.backgroundColor='transparent';
                        }
                        if (elData.class.includes('Menu')) renderRepeaterHTML(newEl, 'Menu');
                        if (elData.class.includes('Socials')) renderRepeaterHTML(newEl, 'Socials');
                    }
                    
                    attachEvents(newEl, elData.class);
                    zone.appendChild(newEl);
                });
            }
        });
    }

    // --- 1. DRAG & DROP ---
    draggables.forEach(item => item.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', item.dataset.class); e.dataTransfer.setData('name', item.innerText.trim()); }));
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault(); zone.classList.remove('drag-over');
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
    rows.forEach(row => row.addEventListener('click', (e) => {
        if (e.target.closest('.builder-element') || e.target.classList.contains('btn-delete')) return;
        if (window.activeElement) window.activeElement.classList.remove('is-selected', 'ring-2', 'ring-indigo-500');
        window.activeElement = row; 
        window.activeElement.classList.add('is-selected');
        loadSettingsForm('api/row_form.php?label=' + encodeURIComponent(row.getAttribute('data-label')));
    }));

    function attachEvents(element, className) {
        element.addEventListener('click', (ev) => { ev.stopPropagation(); selectElement(element, className); });
        const btn = element.querySelector('.btn-delete');
        if(btn) btn.addEventListener('click', (ev) => { ev.stopPropagation(); element.remove(); propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Deleted</div>'; });
        if(className.includes('Button')) {
            const btnEl = element.querySelector('a');
            if(btnEl) {
                btnEl.addEventListener('mouseenter', () => {
                    btnEl.style.backgroundColor = btnEl.getAttribute('data-hover-bg') || btnEl.getAttribute('data-original-bg');
                    btnEl.style.color = btnEl.getAttribute('data-hover-color') || btnEl.getAttribute('data-original-color');
                });
                btnEl.addEventListener('mouseleave', () => {
                    btnEl.style.backgroundColor = btnEl.getAttribute('data-original-bg');
                    btnEl.style.color = btnEl.getAttribute('data-original-color');
                });
            }
        }
    }

    function selectElement(element, className) {
        if (window.activeElement) window.activeElement.classList.remove('is-selected', 'ring-2', 'ring-indigo-500');
        window.activeElement = element; window.activeElement.classList.add('ring-2', 'ring-indigo-500');
        loadSettingsForm('api/form.php?class=' + encodeURIComponent(className));
    }
    
    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex items-center justify-center text-gray-500"><i class="ph ph-spinner animate-spin text-2xl"></i></div>';
        fetch(url).then(res => res.text()).then(html => { propertyPanel.innerHTML = html; if(window.initLiveEdit) window.initLiveEdit(); });
    }

    // --- 3. LIVE EDIT (FIXED FOR LAYOUT) ---
    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        const cls = window.activeElement ? window.activeElement.getAttribute('data-class') : '';

        // REPEATER LOGIC
        if (cls && (cls.includes('Menu') || cls.includes('Socials'))) {
            const container = document.getElementById(cls.includes('Menu') ? 'menu-items-container' : 'social-items-container');
            const hiddenInput = document.getElementById(cls.includes('Menu') ? 'hidden-menu-config' : 'hidden-social-items');
            const btnAdd = document.getElementById(cls.includes('Menu') ? 'btn-add-menu' : 'btn-add-social');
            if (container && hiddenInput && btnAdd) {
                const targetEl = cls.includes('Menu') ? window.activeElement.querySelector('nav') : window.activeElement.querySelector('.social-group');
                const attrName = cls.includes('Menu') ? 'data-menu-config' : 'data-social-items';
                let currentData = [];
                try { const raw = targetEl.getAttribute(attrName); currentData = raw ? JSON.parse(raw) : []; } catch (e) { currentData = []; }
                hiddenInput.value = JSON.stringify(currentData);

                function renderRepeaterUI() {
                    container.innerHTML = '';
                    currentData.forEach((item, index) => {
                        const row = document.createElement('div');
                        row.className = 'bg-gray-800 p-2 rounded border border-gray-700 flex flex-col gap-2 relative';
                        if (cls.includes('Menu')) row.innerHTML = `<div class="flex gap-2"><input type="text" value="${item.text}" data-idx="${index}" data-key="text" placeholder="Tên" class="rep-field flex-1 bg-gray-900 text-white text-xs p-1.5 rounded border border-gray-600"><button type="button" onclick="rmRepItem(${index})" class="text-gray-500 hover:text-red-500"><i class="ph ph-trash"></i></button></div><input type="text" value="${item.href}" data-idx="${index}" data-key="href" placeholder="URL" class="rep-field w-full bg-gray-900 text-gray-400 text-[10px] p-1.5 rounded border border-gray-600">`;
                        else row.innerHTML = `<div class="flex gap-2"><select data-idx="${index}" data-key="icon" class="rep-field bg-gray-900 text-white text-xs p-1.5 rounded border border-gray-600 flex-1"><option value="ph-facebook-logo" ${item.icon=='ph-facebook-logo'?'selected':''}>Facebook</option><option value="ph-instagram-logo" ${item.icon=='ph-instagram-logo'?'selected':''}>Instagram</option><option value="ph-youtube-logo" ${item.icon=='ph-youtube-logo'?'selected':''}>Youtube</option><option value="ph-tiktok-logo" ${item.icon=='ph-tiktok-logo'?'selected':''}>TikTok</option><option value="ph-zalo-logo" ${item.icon=='ph-chat-circle-dots'?'selected':''}>Zalo</option><option value="ph-phone" ${item.icon=='ph-phone'?'selected':''}>Phone</option></select><button type="button" onclick="rmRepItem(${index})" class="text-gray-500 hover:text-red-500"><i class="ph ph-trash"></i></button></div><input type="text" value="${item.link}" data-idx="${index}" data-key="link" placeholder="Link..." class="rep-field w-full bg-gray-900 text-gray-400 text-[10px] p-1.5 rounded border border-gray-600">`;
                        container.appendChild(row);
                    });
                    document.querySelectorAll('.rep-field').forEach(f => f.addEventListener('input', (e) => { currentData[e.target.dataset.idx][e.target.dataset.key] = e.target.value; updateRepeater(); }));
                }
                function updateRepeater() { const jsonStr = JSON.stringify(currentData); hiddenInput.value = jsonStr; if(targetEl) { targetEl.setAttribute(attrName, jsonStr); renderRepeaterHTML(window.activeElement, cls.includes('Menu')?'Menu':'Socials'); } }
                window.rmRepItem = (i) => { currentData.splice(i, 1); renderRepeaterUI(); updateRepeater(); };
                btnAdd.onclick = () => { currentData.push(cls.includes('Menu') ? {text:'Mới', href:'#'} : {icon:'ph-link', link:'#'}); renderRepeaterUI(); updateRepeater(); };
                renderRepeaterUI();
            }
        }

        inputs.forEach(input => {
            if(window.activeElement) {
                const type = input.dataset.style;
                if (window.activeElement.hasAttribute('data-setting-' + type)) input.value = window.activeElement.getAttribute('data-setting-' + type);
                
                if (window.activeElement.classList.contains('builder-row')) {
                    if (type === 'width-mode') input.value = window.activeElement.getAttribute('data-width-mode') || 'container';
                    if (type === 'container-width') input.value = parseInt(window.activeElement.getAttribute('data-container-width')) || 1200;
                    if (type === 'min-height') input.value = parseInt(window.activeElement.style.minHeight) || 50;
                }
                
                // Button / Logo
                if(cls && cls.includes('Button')) { const a = window.activeElement.querySelector('a'); if(a) { if(type === 'hover_bg') input.value = a.getAttribute('data-hover-bg'); if(type === 'background-color') input.value = a.getAttribute('data-original-bg'); } }
                if(type === 'src') { const img = window.activeElement.querySelector('img'); if(img) input.value = img.getAttribute('src'); }
            }

            input.addEventListener('input', function() {
                if (!window.activeElement || this.id.includes('hidden')) return;
                const type = this.dataset.style; 
                const val = this.value;
                let target = getStyleTarget(window.activeElement, cls);

                if (['layout', 'shape', 'icon_type', 'hover_style', 'text-transform'].includes(type)) window.activeElement.setAttribute('data-setting-' + type, val);

                switch (type) {
    // --- CẬP NHẬT LOGIC CONTAINER ---
    case 'width-mode':
        window.activeElement.setAttribute('data-width-mode', val);
        const inner = window.activeElement.querySelector('.hb-inner-content');
        if (inner) {
            inner.style.width = '100%'; // <--- QUAN TRỌNG: Luôn ép width 100%
            if (val === 'full') {
                inner.style.maxWidth = '100%';
            } else {
                const w = window.activeElement.getAttribute('data-container-width') || '1200px';
                inner.style.maxWidth = w;
            }
        }
        break;
    
    case 'container-width':
        // Lưu giá trị px
        let pxVal = val + 'px'; 
        window.activeElement.setAttribute('data-container-width', pxVal);
        
        const mode = window.activeElement.getAttribute('data-width-mode');
        // Chỉ áp dụng max-width khi không phải chế độ Full Width
        if (mode !== 'full') {
            const innerC = window.activeElement.querySelector('.hb-inner-content');
            if(innerC) {
                innerC.style.width = '100%'; // <--- QUAN TRỌNG
                innerC.style.maxWidth = pxVal;
            }
        }
        break;
                        
                    case 'min-height': window.activeElement.style.minHeight = val + 'px'; break;

                    case 'text': const txt=window.activeElement.querySelector('.text-content, button, a, .inner-text'); if(txt) txt.innerText=val; const i=window.activeElement.querySelector('input'); if(i) i.placeholder=val; break;
                    case 'text_content': if(target.classList.contains('text-content')) target.innerText = val; else { const t=target.querySelector('.text-content'); if(t) t.innerText=val; } break;
                    case 'href': if(target.tagName==='A') target.href=val; else { const a=target.querySelector('a'); if(a) a.href=val; } break;
                    case 'src': const img=window.activeElement.querySelector('img'); if(img) img.src=val; break;
                    
                    case 'text_welcome': { const t = window.activeElement.querySelector('.inner-text-welcome'); if(t) t.innerText=val; } break;
                    case 'text_action': { const t = window.activeElement.querySelector('.inner-text-action'); if(t) t.innerText=val; } break;
                    case 'link_login': { const a = window.activeElement.querySelector('a'); if(a) a.href=val; } break;

                    case 'color': target.style.color=val; target.querySelectorAll('i, a, span, input').forEach(el=>el.style.color='inherit'); if(cls.includes('Button')) target.setAttribute('data-original-color', val); break;
                    case 'background-color': target.style.backgroundColor=val; if(cls.includes('Button')) target.setAttribute('data-original-bg', val); break;
                    case 'font-size': target.style.fontSize=val+'px'; break;
                    case 'border-radius': target.style.borderRadius=val+'px'; break;
                    case 'gap': target.style.gap=val+'px'; break;
                    case 'width': target.style.width = val.includes('%') ? val : val+'px'; break;
                    case 'border-color': target.style.borderColor=val; break;
                    case 'border-width': target.style.borderWidth=val+'px'; target.style.borderStyle='solid'; break;
                    case 'border-style': target.style.borderStyle=val; break;
                    case 'text-transform': target.style.textTransform=val; break;
                    case 'text-align': target.style.textAlign=val; break;
                    case 'hover_bg': target.setAttribute('data-hover-bg', val); break;
                    case 'hover_color': target.setAttribute('data-hover-color', val); break;

                    case 'layout': 
                        if (cls.includes('Search')) {
                            const old = window.activeElement.querySelector('form, .search-icon-only'); if(old) old.remove();
                            let newHtml = '';
                            if(val === 'icon') newHtml = `<div class="search-icon-only cursor-pointer hover:opacity-70" style="color: inherit; font-size: 20px;"><i class="ph ph-magnifying-glass"></i></div>`;
                            else newHtml = `<form class="search-box relative flex items-center h-9 w-full bg-gray-100 rounded-full pointer-events-none" style="min-width:200px"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 bg-transparent text-xs"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></form>`;
                            window.activeElement.insertAdjacentHTML('afterbegin', newHtml);
                        }
                        if (cls.includes('Cart')) {
                            const link = window.activeElement.querySelector('a');
                            const existingSpan = link.querySelector('span:not(.absolute)');
                            if(existingSpan) existingSpan.remove();
                            if(val === 'icon_price') link.insertAdjacentHTML('beforeend', `<span class='text-xs font-bold ml-2'>1.250.000₫</span>`);
                            if(val === 'icon_label') link.insertAdjacentHTML('beforeend', `<span class='text-xs font-bold ml-2'>Giỏ hàng</span>`);
                        }
                        break;
                    case 'icon_type': if (cls.includes('Cart')) { const icon = window.activeElement.querySelector('i'); icon.className = `ph ${val}`; } break;
                    case 'shape': if(cls.includes('Socials')) { const links = target.querySelectorAll('a'); links.forEach(a => { a.className = 'social-link hover:opacity-80 transition flex items-center justify-center'; if(val === 'circle') a.classList.add('rounded-full', 'bg-gray-100', 'p-2'); if(val === 'square') a.classList.add('rounded', 'bg-gray-100', 'p-2'); }); } break;
                }
            });
        });
    }

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => { b.classList.remove('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200'); b.classList.add('text-gray-500', 'border-transparent'); });
            btn.classList.add('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200'); btn.classList.remove('text-gray-500', 'border-transparent');
            const mode = btn.dataset.mode;
            canvasFrame.style.maxWidth = (mode === 'mobile') ? '375px' : (mode === 'tablet' ? '768px' : '100%');
        });
    });

    function getStyleTarget(root, cls) {
        if(!cls) return root; 
        if (cls.includes('Button') || cls.includes('CategoryBtn')) return root.querySelector('a, button, .inner-box');
        if (cls.includes('Search')) return root.querySelector('.search-box, .search-icon-only');
        if (cls.includes('Menu') || cls.includes('Socials')) return root.querySelector('nav, .social-group');
        if (cls.includes('Divider')) return root.querySelector('div');
        if (cls.includes('Text')) return root.querySelector('.text-content');
        if (cls.includes('Logo')) return root.querySelector('img'); 
        return root;
    }

    function renderRepeaterHTML(el, type) {
        if (type === 'Menu') { const nav = el.querySelector('nav'); try { const items = JSON.parse(nav.getAttribute('data-menu-config')); let h = ''; items.forEach(i => h += `<a href="${i.href}" class="hover:text-blue-600 transition px-1">${i.text}</a>`); nav.innerHTML = h; } catch(e){} }
        if (type === 'Socials') { const grp = el.querySelector('.social-group'); try { const items = JSON.parse(grp.getAttribute('data-social-items')); let h = ''; const isCircle = grp.innerHTML.includes('rounded-full'); const isSquare = grp.innerHTML.includes('rounded') && !isCircle; const shapeClass = isCircle ? 'rounded-full bg-gray-100 p-2' : (isSquare ? 'rounded bg-gray-100 p-2' : ''); items.forEach(i => h += `<a href="${i.link}" target="_blank" class="social-link hover:opacity-80 transition flex items-center justify-center ${shapeClass}"><i class="ph ${i.icon}"></i></a>`); grp.innerHTML = h; } catch(e){} }
    }

    function renderElementPreview(name, className, contentData = {}) {
        let content = ''; let extraClass = ''; const c = contentData || {}; 
        if (className.includes('Button')) content = `<a class="inner-box flex items-center justify-center py-2 px-4 rounded text-xs font-bold transition duration-200 pointer-events-none" style="background-color:#2563eb; color:#fff;" data-original-bg="#2563eb" data-original-color="#fff">Button</a>`;
        else if (className.includes('CategoryBtn')) content = `<div class="inner-box flex items-center gap-2 px-4 py-2 pointer-events-none" style="background-color:#f3f4f6; color:#333; border-radius:4px"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap inner-text">DANH MỤC</span><i class="ph ph-caret-down text-xs ml-1"></i></div>`;
        else if (className.includes('Socials')) content = `<div class="flex items-center social-group gap-3 pointer-events-none" data-social-items='[{"icon":"ph-facebook-logo","link":"#"}]' style="font-size:18px"><a class="social-link flex items-center justify-center"><i class="ph ph-facebook-logo"></i></a></div>`;
        else if (className.includes('Search')) { if (c.layout === 'icon') content = `<div class="search-icon-only cursor-pointer hover:opacity-70" style="color: inherit; font-size: 20px;"><i class="ph ph-magnifying-glass"></i></div>`; else { content = `<form class="search-box relative flex items-center h-9 w-full bg-gray-100 rounded-full pointer-events-none" style="min-width:200px"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 bg-transparent text-xs"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></form>`; extraClass = 'w-full'; } }
        else if (className.includes('Menu')) { content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none menu-nav" data-menu-config='[{"text":"Trang chủ","href":"/"}]'><span>Trang chủ</span></nav>`; extraClass = 'w-full'; }
        else if (className.includes('Logo')) { const src = c.src || "https://fptshop.com.vn/img/fpt-shop.png"; content = `<div class="w-full flex justify-start pointer-events-none"><img src="${src}" class="h-8 object-contain"></div>`; }
        else if (className.includes('Cart')) { let extra = ''; if (c.layout === 'icon_price') extra = `<span class='text-xs font-bold ml-2'>1.250.000₫</span>`; if (c.layout === 'icon_label') extra = `<span class='text-xs font-bold ml-2'>Giỏ hàng</span>`; const iconCls = c.icon_type || 'ph-shopping-cart'; content = `<div class="flex items-center pointer-events-none px-2 text-inherit"><div class="relative"><i class="ph ${iconCls} text-2xl"></i><span class="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div>${extra}</div>`; }
        else if (className.includes('Account')) content = `<a class="flex items-center gap-2 pointer-events-none text-inherit"><div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><i class="ph ph-user text-lg"></i></div><div class="flex flex-col leading-tight"><span class="text-[10px] inner-text-welcome">Xin chào!</span><span class="text-xs font-bold inner-text-action">Đăng nhập</span></div></a>`;
        else if (className.includes('Text')) content = `<div class="text-sm pointer-events-none whitespace-nowrap text-content text-inherit" style="line-height:1.5">Nội dung tùy chỉnh...</div>`;
        else if (className.includes('Divider')) content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`;
        else content = `<span class="font-bold text-sm pointer-events-none">${name}</span>`;

        return `
            <div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-1 rounded transition border border-transparent hover:border-blue-300 flex items-center justify-center ${extraClass}" data-class="${className}">
                ${content}
                <div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110 hover:bg-red-600">
                    <i class="ph ph-x text-xs font-bold"></i>
                </div>
            </div>
        `;
    }
});