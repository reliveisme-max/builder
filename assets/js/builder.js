document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO BIẾN ---
    const draggables = document.querySelectorAll('.draggable-item');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row');
    const canvasFrame = document.getElementById('canvas-frame');
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    
    window.activeElement = null; 

    // --- 1. SETUP DOM TRƯỚC (QUAN TRỌNG) ---
    // Phải chạy xong cái này mới được gán sự kiện Drag/Drop
    initBuilderLayout();

    function initBuilderLayout() {
        if (window.savedData && Array.isArray(window.savedData) && window.savedData.length > 0) {
            restoreLayout(window.savedData);
        } else {
            rows.forEach(row => ensureInnerContent(row));
        }
        
        // Sau khi DOM ổn định -> Gán sự kiện Drag Drop
        initDragDropEvents();
    }

    // --- 2. HÀM XỬ LÝ KÉO THẢ (Đã tách riêng) ---
    function initDragDropEvents() {
        // DRAG START (Cột bên trái)
        draggables.forEach(item => {
            // Remove listener cũ để tránh duplicate nếu gọi lại
            item.removeEventListener('dragstart', handleDragStart);
            item.addEventListener('dragstart', handleDragStart);
        });

        // DROP ZONES (Vùng thả)
        // Query lại DOM để lấy đúng các zone sau khi đã bị di chuyển bởi ensureInnerContent
        const currentDropZones = document.querySelectorAll('.drop-zone');
        
        currentDropZones.forEach(zone => {
            // Remove listeners cũ
            zone.removeEventListener('dragover', handleDragOver);
            zone.removeEventListener('dragleave', handleDragLeave);
            zone.removeEventListener('drop', handleDrop);

            // Add listeners mới
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });
    }

    // --- CÁC HANDLER KÉO THẢ ---
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', this.dataset.class);
        e.dataTransfer.setData('name', this.innerText.trim());
    }

    function handleDragOver(e) {
        e.preventDefault(); // Bắt buộc để cho phép thả
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const cls = e.dataTransfer.getData('text/plain');
        const name = e.dataTransfer.getData('name');

        if (cls) {
            // Xóa placeholder
            const ph = this.querySelector('.empty-placeholder');
            if (ph) ph.remove();

            const html = renderElementPreview(name, cls);
            const div = document.createElement('div');
            div.innerHTML = html;
            const newEl = div.firstElementChild;

            attachEvents(newEl, cls);
            this.appendChild(newEl);
            selectElement(newEl, cls);
        }
    }

    // --- 3. CÁC HÀM XỬ LÝ DOM & RESTORE ---
    function ensureInnerContent(row) {
        row.style.width = '100%';
        row.classList.add('relative');

        let inner = row.querySelector('.hb-inner-content');
        if (!inner) {
            inner = document.createElement('div');
            inner.className = 'hb-inner-content flex items-stretch h-full mx-auto';
            inner.style.width = '100%';
            inner.style.maxWidth = '1200px';

            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => {
                zone.classList.add('flex-1');
                inner.appendChild(zone);
            });
            row.appendChild(inner);
        }
        return inner;
    }

    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            
            const innerContent = ensureInnerContent(rowEl);

            if (rowData.style) {
                let bgStyle = rowData.style.replace(/max-width:[^;]+;/g, '').replace(/width:[^;]+;/g, '');
                rowEl.style.cssText += bgStyle;
            }
            rowEl.style.width = '100%'; 
            innerContent.style.width = '100%';

            const wMode = rowData.width_mode || 'container';
            const wVal = rowData.container_width || '1200px';
            rowEl.setAttribute('data-width-mode', wMode);
            rowEl.setAttribute('data-container-width', wVal);

            if (wMode === 'full') innerContent.style.maxWidth = '100%';
            else innerContent.style.maxWidth = wVal;

            if (rowData.columns) {
                for (const [zoneName, elements] of Object.entries(rowData.columns)) {
                    const zone = innerContent.querySelector(`.drop-zone[data-zone="${zoneName}"]`);
                    if (!zone) continue;

                    zone.innerHTML = ''; // Clear cũ
                    
                    elements.forEach(elData => {
                        const shortName = elData.class.split('\\').pop(); 
                        const html = renderElementPreview(shortName, elData.class, elData.content); 
                        const div = document.createElement('div'); div.innerHTML = html;
                        const newEl = div.firstElementChild;
                        if (!newEl) return;

                        // Restore Data
                        if (elData.content) {
                            const c = elData.content;
                            // Settings
                            ['layout', 'shape', 'icon_type', 'hover_style', 'text-transform', 'font-size', 'color', 'background-color', 'width'].forEach(k => { if(c[k]) newEl.setAttribute('data-setting-'+k, c[k]); });

                            if(c.menu_config) newEl.querySelector('nav')?.setAttribute('data-menu-config', c.menu_config);
                            if(c.social_items) newEl.querySelector('.social-group')?.setAttribute('data-social-items', c.social_items);
                            if(c.text) { 
                                const t = newEl.querySelector('.inner-text, .text-content, button, a'); 
                                if(t) t.innerText = c.text; 
                                const i = newEl.querySelector('input'); if(i) i.placeholder = c.text;
                            }
                            if(c.href) newEl.querySelector('a')?.setAttribute('href', c.href);
                            if(c.src) newEl.querySelector('img')?.setAttribute('src', c.src);
                            if(c.text_content) newEl.querySelector('.text-content').innerText = c.text_content;

                            // Account
                            if(c.text_welcome) newEl.querySelector('.inner-text-welcome').innerText = c.text_welcome;
                            if(c.text_action) newEl.querySelector('.inner-text-action').innerText = c.text_action;
                            if(c.link_login) newEl.querySelector('a')?.setAttribute('href', c.link_login);
                            
                            if(c.hover_bg) newEl.querySelector('a')?.setAttribute('data-hover-bg', c.hover_bg);
                            if(c.hover_color) newEl.querySelector('a')?.setAttribute('data-hover-color', c.hover_color);
                        }

                        // Restore Style
                        if (elData.style) {
                            let target = getStyleTarget(newEl, elData.class);
                            if(target) target.style.cssText += elData.style;
                            if (elData.class.includes('Menu')) renderRepeaterHTML(newEl, 'Menu');
                            if (elData.class.includes('Socials')) renderRepeaterHTML(newEl, 'Socials');
                        }
                        
                        attachEvents(newEl, elData.class);
                        zone.appendChild(newEl);
                    });
                }
            }
        });
    }

    // --- 4. CLICK EVENTS ---
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.builder-element') || e.target.classList.contains('btn-delete')) return;
            ensureInnerContent(row);
            
            if (window.activeElement) window.activeElement.classList.remove('is-selected', 'ring-2', 'ring-indigo-500');
            window.activeElement = row;
            window.activeElement.classList.add('is-selected');

            loadSettingsForm('api/row_form.php?label=' + encodeURIComponent(row.getAttribute('data-label')));
        });
    });

    function attachEvents(element, className) {
        element.addEventListener('click', (ev) => { ev.stopPropagation(); selectElement(element, className); });
        
        // Delete without confirm
        const btn = element.querySelector('.btn-delete');
        if(btn) btn.addEventListener('click', (ev) => { 
            ev.stopPropagation(); 
            element.remove(); 
            propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Deleted</div>'; 
        });
        
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

    // --- 5. LIVE EDIT ---
    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        if(!window.activeElement) return;
        const cls = window.activeElement.getAttribute('data-class') || '';

        if (cls.includes('Menu') || cls.includes('Socials')) setupRepeater(cls);

        inputs.forEach(input => {
            const type = input.dataset.style;
            if(!type) return;

            // Fill Values
            if (window.activeElement.hasAttribute('data-setting-' + type)) input.value = window.activeElement.getAttribute('data-setting-' + type);
            
            if (window.activeElement.classList.contains('builder-row')) {
                if (type === 'width-mode') input.value = window.activeElement.getAttribute('data-width-mode') || 'container';
                if (type === 'container-width') input.value = parseInt(window.activeElement.getAttribute('data-container-width')) || 1200;
                if (type === 'min-height') input.value = parseInt(window.activeElement.style.minHeight) || 50;
                if (type === 'background-color') { const rgb = window.activeElement.style.backgroundColor; if(rgb) input.value = rgbToHex(rgb); }
            }
            if(type === 'src') { const img = window.activeElement.querySelector('img'); if(img) input.value = img.getAttribute('src'); }

            // Events
            input.addEventListener('input', function() {
                if (!window.activeElement || this.id.includes('hidden')) return;
                const val = this.value;
                const target = getStyleTarget(window.activeElement, cls);
                
                // Save setting
                if(['layout','shape','icon_type','font-size','color','width'].includes(type)) {
                    window.activeElement.setAttribute('data-setting-' + type, val);
                }

                switch (type) {
                    case 'width-mode':
                        window.activeElement.setAttribute('data-width-mode', val);
                        const inner = ensureInnerContent(window.activeElement);
                        inner.style.width = '100%';
                        inner.style.maxWidth = (val === 'full') ? '100%' : (window.activeElement.getAttribute('data-container-width') || '1200px');
                        break;
                    case 'container-width':
                        window.activeElement.setAttribute('data-container-width', val + 'px');
                        if (window.activeElement.getAttribute('data-width-mode') !== 'full') {
                            const inr = ensureInnerContent(window.activeElement);
                            inr.style.maxWidth = val + 'px';
                        }
                        break;
                    case 'min-height': window.activeElement.style.minHeight = val + 'px'; break;
                    case 'background-color':
                        if (window.activeElement.classList.contains('builder-row')) window.activeElement.style.backgroundColor = val;
                        else { target.style.backgroundColor = val; if(cls.includes('Button')) target.setAttribute('data-original-bg', val); }
                        break;
                    case 'color': 
                        target.style.color = val; 
                        target.querySelectorAll('i, a, span').forEach(el => el.style.color = 'inherit');
                        if(cls.includes('Button')) target.setAttribute('data-original-color', val);
                        break;
                    case 'font-size': 
                        if(cls.includes('Cart')) { const i = window.activeElement.querySelector('i'); if(i) i.style.fontSize = val + 'px'; }
                        else target.style.fontSize = val + 'px'; 
                        break;
                    case 'width': target.style.width = val.includes('%') ? val : val + 'px'; break;
                    case 'border-radius': target.style.borderRadius = val + 'px'; break;
                    case 'gap': target.style.gap = val + 'px'; break;
                    
                    case 'text': const t = window.activeElement.querySelector('.inner-text, .text-content, button, a'); if(t) t.innerText = val; const inp = window.activeElement.querySelector('input'); if(inp) inp.placeholder = val; break;
                    case 'src': const img = window.activeElement.querySelector('img'); if(img) img.src = val; break;

                    case 'layout':
                        if (cls.includes('Search')) {
                            const old = window.activeElement.querySelector('form, .search-icon-only'); if(old) old.remove();
                            let html = (val === 'icon') ? `<div class="search-icon-only cursor-pointer hover:opacity-70" style="color:inherit;font-size:20px"><i class="ph ph-magnifying-glass"></i></div>` : `<form class="search-box relative flex items-center h-9 w-full bg-gray-100 rounded-full pointer-events-none" style="min-width:200px"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 bg-transparent text-xs"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></form>`;
                            window.activeElement.insertAdjacentHTML('afterbegin', html);
                        }
                        if (cls.includes('Cart')) {
                            const wrap = window.activeElement.querySelector('.flex'); 
                            const span = wrap.querySelector('span:not(.absolute)'); if(span) span.remove();
                            if(val === 'icon_price') wrap.insertAdjacentHTML('beforeend', `<span class='text-xs font-bold ml-2'>1.250.000₫</span>`);
                            if(val === 'icon_label') wrap.insertAdjacentHTML('beforeend', `<span class='text-xs font-bold ml-2'>Giỏ hàng</span>`);
                        }
                        break;
                    case 'icon_type': if (cls.includes('Cart')) { const i = window.activeElement.querySelector('i'); if(i) i.className = `ph ${val}`; } break;
                    case 'shape': if(cls.includes('Socials')) { const links = target.querySelectorAll('a'); links.forEach(a => { a.className = 'social-link hover:opacity-80 transition flex items-center justify-center'; if(val === 'circle') a.classList.add('rounded-full', 'bg-gray-100', 'p-2'); if(val === 'square') a.classList.add('rounded', 'bg-gray-100', 'p-2'); }); } break;
                }
            });
        });
    }

    // --- HELPER FUNCTIONS ---
    function setupRepeater(cls) {
        const container = document.getElementById(cls.includes('Menu') ? 'menu-items-container' : 'social-items-container');
        const hiddenInput = document.getElementById(cls.includes('Menu') ? 'hidden-menu-config' : 'hidden-social-items');
        const btnAdd = document.getElementById(cls.includes('Menu') ? 'btn-add-menu' : 'btn-add-social');
        
        if (!container || !hiddenInput || !btnAdd) return;
        const targetEl = cls.includes('Menu') ? window.activeElement.querySelector('nav') : window.activeElement.querySelector('.social-group');
        const attrName = cls.includes('Menu') ? 'data-menu-config' : 'data-social-items';
        let currentData = [];
        try { currentData = JSON.parse(targetEl.getAttribute(attrName)) || []; } catch(e) { currentData = []; }
        hiddenInput.value = JSON.stringify(currentData);

        function renderUI() {
            container.innerHTML = '';
            currentData.forEach((item, i) => {
                const div = document.createElement('div');
                div.className = 'bg-gray-800 p-2 rounded border border-gray-700 flex flex-col gap-2 mb-2 relative';
                if (cls.includes('Menu')) {
                    div.innerHTML = `<div class="flex gap-2"><input type="text" value="${item.text}" data-idx="${i}" data-key="text" class="rep-inp flex-1 bg-gray-900 text-white text-xs p-1 rounded border border-gray-600"><button type="button" onclick="window.delRep(${i})" class="text-red-500"><i class="ph ph-trash"></i></button></div><input type="text" value="${item.href}" data-idx="${i}" data-key="href" class="rep-inp w-full bg-gray-900 text-gray-400 text-[10px] p-1 rounded border border-gray-600">`;
                } else {
                    div.innerHTML = `<div class="flex gap-2"><select data-idx="${i}" data-key="icon" class="rep-inp bg-gray-900 text-white text-xs p-1 rounded border border-gray-600 flex-1"><option value="ph-facebook-logo">Facebook</option><option value="ph-instagram-logo">Instagram</option><option value="ph-youtube-logo">Youtube</option><option value="ph-tiktok-logo">TikTok</option></select><button type="button" onclick="window.delRep(${i})" class="text-red-500"><i class="ph ph-trash"></i></button></div>`;
                }
                container.appendChild(div);
            });
            document.querySelectorAll('.rep-inp').forEach(inp => {
                inp.addEventListener('input', (e) => { currentData[e.target.dataset.idx][e.target.dataset.key] = e.target.value; update(); });
            });
            if (!cls.includes('Menu')) { document.querySelectorAll('select.rep-inp').forEach(sel => { sel.value = currentData[sel.dataset.idx].icon; }); }
        }
        function update() {
            const json = JSON.stringify(currentData); hiddenInput.value = json;
            if(targetEl) { targetEl.setAttribute(attrName, json); renderRepeaterHTML(window.activeElement, cls.includes('Menu') ? 'Menu' : 'Socials'); }
        }
        window.delRep = (i) => { currentData.splice(i, 1); renderUI(); update(); };
        btnAdd.onclick = () => { currentData.push(cls.includes('Menu') ? {text:'Link', href:'#'} : {icon:'ph-link', link:'#'}); renderUI(); update(); };
        renderUI();
    }

    function renderRepeaterHTML(el, type) {
        if (type === 'Menu') { const nav = el.querySelector('nav'); try { const items = JSON.parse(nav.getAttribute('data-menu-config')); let h = ''; items.forEach(i => h += `<a href="${i.href}" class="hover:text-blue-600 transition px-1">${i.text}</a>`); nav.innerHTML = h; } catch(e){} }
        if (type === 'Socials') { const grp = el.querySelector('.social-group'); try { const items = JSON.parse(grp.getAttribute('data-social-items')); let h = ''; const shape = window.activeElement.getAttribute('data-setting-shape') || 'none'; const shapeClass = (shape === 'circle') ? 'rounded-full bg-gray-100 p-2' : ((shape === 'square') ? 'rounded bg-gray-100 p-2' : ''); items.forEach(i => h += `<a href="${i.link}" target="_blank" class="social-link hover:opacity-80 transition flex items-center justify-center ${shapeClass}"><i class="ph ${i.icon}"></i></a>`); grp.innerHTML = h; } catch(e){} }
    }

    function rgbToHex(rgb) {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
        if (rgb.startsWith('#')) return rgb;
        let sep = rgb.indexOf(",") > -1 ? "," : " ";
        rgb = rgb.substr(4).split(")")[0].split(sep);
        let r = (+rgb[0]).toString(16), g = (+rgb[1]).toString(16), b = (+rgb[2]).toString(16);
        if (r.length == 1) r = "0" + r; if (g.length == 1) g = "0" + g; if (b.length == 1) b = "0" + b;
        return "#" + r + g + b;
    }

    function getStyleTarget(root, cls) {
        if(!cls) return root; 
        if (cls.includes('Button') || cls.includes('CategoryBtn')) return root.querySelector('.inner-box');
        if (cls.includes('Search')) return root.querySelector('.search-box, .search-icon-only');
        if (cls.includes('Menu') || cls.includes('Socials')) return root.querySelector('nav, .social-group');
        if (cls.includes('Divider')) return root.querySelector('div');
        if (cls.includes('Text')) return root.querySelector('.text-content');
        if (cls.includes('Logo')) return root.querySelector('img'); 
        return root;
    }

    // --- PREVIEW HTML GENERATOR ---
    function renderElementPreview(name, className, contentData = {}) {
        const c = contentData || {}; 
        let content = ''; let extraClass = '';

        if (className.includes('Cart')) {
             let extra = '';
             if (c.layout === 'icon_price') extra = `<span class='text-xs font-bold ml-2'>1.250.000₫</span>`;
             if (c.layout === 'icon_label') extra = `<span class='text-xs font-bold ml-2'>Giỏ hàng</span>`;
             const iconCls = c.icon_type || 'ph-shopping-cart';
             const size = c['font-size'] || 24;
             const color = c['color'] || 'inherit';
             content = `<div class="flex items-center pointer-events-none px-2" style="color: ${color}"><div class="relative"><i class="ph ${iconCls}" style="font-size: ${size}px"></i><span class="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div>${extra}</div>`;
        }
        else if (className.includes('Button')) content = `<a class="inner-box flex items-center justify-center py-2 px-4 rounded text-xs font-bold transition duration-200 pointer-events-none" style="background-color:#2563eb; color:#fff;" data-original-bg="#2563eb" data-original-color="#fff">Button</a>`;
        else if (className.includes('CategoryBtn')) content = `<div class="inner-box flex items-center gap-2 px-4 py-2 pointer-events-none" style="background-color:#f3f4f6; color:#333; border-radius:4px"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap inner-text">DANH MỤC</span><i class="ph ph-caret-down text-xs ml-1"></i></div>`;
        else if (className.includes('Socials')) content = `<div class="flex items-center social-group gap-3 pointer-events-none" data-social-items='[{"icon":"ph-facebook-logo","link":"#"}]' style="font-size:18px"><a class="social-link flex items-center justify-center"><i class="ph ph-facebook-logo"></i></a></div>`;
        else if (className.includes('Search')) { if (c.layout === 'icon') content = `<div class="search-icon-only cursor-pointer hover:opacity-70" style="color: inherit; font-size: 20px;"><i class="ph ph-magnifying-glass"></i></div>`; else { content = `<form class="search-box relative flex items-center h-9 w-full bg-gray-100 rounded-full pointer-events-none" style="min-width:200px"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 bg-transparent text-xs"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></form>`; extraClass = 'w-full'; } }
        else if (className.includes('Menu')) { content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none menu-nav" data-menu-config='[{"text":"Trang chủ","href":"/"}]'><span>Trang chủ</span></nav>`; extraClass = 'w-full'; }
        else if (className.includes('Logo')) { const src = c.src || "https://fptshop.com.vn/img/fpt-shop.png"; content = `<div class="w-full flex justify-start pointer-events-none"><img src="${src}" class="h-8 object-contain"></div>`; }
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