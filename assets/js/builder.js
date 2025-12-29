document.addEventListener('DOMContentLoaded', () => {
    // --- 1. BIẾN TOÀN CỤC ---
    const draggables = document.querySelectorAll('.draggable-item');
    const propertyPanel = document.getElementById('property-panel');
    const rows = document.querySelectorAll('.builder-row');
    const canvasFrame = document.getElementById('canvas-frame');
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    
    let draggedItem = null;
    let sourceZone = null;

    window.activeElement = null;
    // QUAN TRỌNG: Biến lưu chế độ xem hiện tại
    window.currentViewMode = 'desktop'; 

    // --- 2. KHỞI TẠO ---
    initBuilder();

    function initBuilder() {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            let label = zone.getAttribute('data-zone').split('_')[1] || 'Zone';
            zone.setAttribute('data-label', label);
        });

        rows.forEach(row => ensureInnerContent(row));
        
        if (window.savedData && Array.isArray(window.savedData) && window.savedData.length > 0) {
            restoreLayout(window.savedData);
        }
        
        updateAllZonesState();
        
        // Mặc định ban đầu
        window.currentViewMode = 'desktop';
        updateVisibilityView(); 
        
        setupDragAndDrop();
        setupRowEvents();
    }

    // --- 3. LAYOUT LOGIC ---
    function ensureInnerContent(row) {
        row.style.width = '100%'; row.classList.add('relative');
        let inner = row.querySelector('.hb-inner-content');
        if (!inner) {
            inner = document.createElement('div');
            inner.className = 'hb-inner-content';
            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => inner.appendChild(zone));
            row.appendChild(inner);
        }
        inner.querySelectorAll('.drop-zone').forEach(z => {
            z.classList.remove('flex-1', 'flex-[2]', 'flex-[3]', 'w-full');
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
        if (!hasElement) zone.classList.add('is-empty');
        else zone.classList.remove('is-empty');
    }

    // --- [FIX] LOGIC ẨN HIỆN CHÍNH XÁC ---
    function updateVisibilityView() {
        const mode = window.currentViewMode || 'desktop';

        document.querySelectorAll('.builder-element').forEach(el => {
            // Lấy giá trị trực tiếp, nếu null thì coi như false
            const hideMobile = el.getAttribute('data-setting-hide_mobile') === 'true';
            const hideTablet = el.getAttribute('data-setting-hide_tablet') === 'true';
            const hideDesktop = el.getAttribute('data-setting-hide_desktop') === 'true';
            
            // Xóa class ẩn trước
            el.classList.remove('is-hidden-view');

            // Logic kiểm tra chặt chẽ
            if (mode === 'mobile' && hideMobile) {
                el.classList.add('is-hidden-view');
            } 
            else if (mode === 'tablet' && hideTablet) {
                el.classList.add('is-hidden-view');
            } 
            else if (mode === 'desktop' && hideDesktop) {
                el.classList.add('is-hidden-view');
            }
        });
    }

    // --- 4. DRAG & DROP ---
    function setupDragAndDrop() {
        draggables.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                draggedItem = null; 
                e.dataTransfer.setData('type', 'create');
                e.dataTransfer.setData('class', item.dataset.class);
                e.dataTransfer.setData('name', item.innerText.trim());
            });
        });

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
                const afterElement = getDragAfterElement(zone, e.clientX);

                if (type === 'create') {
                    const cls = e.dataTransfer.getData('class');
                    const name = e.dataTransfer.getData('name');
                    const html = renderElementPreview(name, cls);
                    const div = document.createElement('div'); div.innerHTML = html;
                    const newEl = div.firstElementChild;
                    attachElementEvents(newEl, cls);

                    if (afterElement) zone.insertBefore(newEl, afterElement);
                    else zone.appendChild(newEl);
                    newEl.click();
                }
                else if (draggedItem) {
                    if (afterElement) zone.insertBefore(draggedItem, afterElement);
                    else zone.appendChild(draggedItem);
                }

                checkZoneEmpty(zone);
                if (sourceZone && sourceZone !== zone) checkZoneEmpty(sourceZone);
                draggedItem = null; sourceZone = null;
                
                // Cập nhật lại view sau khi thả
                updateVisibilityView();
            });
        });
    }

    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.builder-element:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
            else return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- 5. EVENTS ---
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
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.activeElement) window.activeElement.classList.remove('is-selected', 'ring-2', 'ring-indigo-500');
            window.activeElement = el; el.classList.add('ring-2', 'ring-indigo-500');
            loadSettingsForm('api/form.php?class=' + encodeURIComponent(cls));
        });

        el.querySelectorAll('a').forEach(link => link.addEventListener('click', (e) => e.preventDefault()));

        const btn = el.querySelector('.btn-delete');
        if(btn) btn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            const parent = el.parentNode;
            el.remove(); 
            checkZoneEmpty(parent); 
            propertyPanel.innerHTML = '<div class="p-5 text-center text-gray-500 text-xs">Deleted</div>'; 
        });

        el.setAttribute('draggable', 'true');
        el.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            draggedItem = el;
            sourceZone = el.parentNode;
            el.classList.add('dragging');
            e.dataTransfer.setData('type', 'move');
            e.dataTransfer.effectAllowed = 'move';
        });

        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            if (sourceZone) checkZoneEmpty(sourceZone);
            if (el.parentNode) checkZoneEmpty(el.parentNode);
        });

        // Hover Effect
        if(cls.includes('Button')) {
            const a = el.querySelector('.inner-box');
            if(a) {
                a.addEventListener('mouseenter', () => { 
                    const hBg = a.getAttribute('data-hover-bg');
                    const hCol = a.getAttribute('data-hover-color');
                    if(hBg) a.style.backgroundColor = hBg;
                    if(hCol) a.style.color = hCol;
                });
                a.addEventListener('mouseleave', () => { 
                    const oBg = a.getAttribute('data-original-bg');
                    const oCol = a.getAttribute('data-original-color');
                    if(oBg) a.style.backgroundColor = oBg;
                    if(oCol) a.style.color = oCol;
                });
            }
        }
    }

    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex items-center justify-center text-gray-500"><i class="ph ph-spinner animate-spin text-2xl"></i></div>';
        fetch(url).then(res => res.text()).then(html => { propertyPanel.innerHTML = html; if(window.initLiveEdit) window.initLiveEdit(); });
    }

    // --- 6. RESTORE ---
    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            const innerContent = ensureInnerContent(rowEl);
            
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
                    zone.innerHTML = ''; 
                    items.forEach(elData => {
                        const shortName = elData.class.split('\\').pop(); 
                        const html = renderElementPreview(shortName, elData.class, elData.content); 
                        const div = document.createElement('div'); div.innerHTML = html;
                        const newEl = div.firstElementChild;
                        if (!newEl) return;

                        if (elData.content) {
                            const c = elData.content;
                            const settingsToRestore = [
                                'layout','shape','icon_type','hover_style','text-transform',
                                'font-size','color','background-color','width','height',
                                'mobile_width','gap','font-weight','custom_link','show_icon',
                                'button_type','button_bg','button_color','button_text',
                                'text_content', 'text_align', 'border-radius', 'hover_bg', 'hover_color', 
                                'hide_mobile', 'hide_tablet', 'hide_desktop'
                            ];
                            settingsToRestore.forEach(k => { 
                                if(c[k]) newEl.setAttribute('data-setting-'+k, c[k]); 
                            });

                            if(c.menu_config) newEl.querySelector('nav')?.setAttribute('data-menu-config', c.menu_config);
                            if(c.social_items) newEl.querySelector('.social-group')?.setAttribute('data-social-items', c.social_items);
                            
                            const innerBox = newEl.querySelector('.inner-box');
                            if(innerBox) {
                                if(c.hover_bg) innerBox.setAttribute('data-hover-bg', c.hover_bg);
                                if(c.hover_color) innerBox.setAttribute('data-hover-color', c.hover_color);
                            }

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
                            if(c.text_welcome) newEl.querySelector('.inner-text-welcome').innerText = c.text_welcome;
                            if(c.text_action) newEl.querySelector('.inner-text-action').innerText = c.text_action;
                            if(c.link_login) newEl.querySelector('a')?.setAttribute('href', c.link_login);
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
        updateVisibilityView();
    }

    // --- 7. LIVE EDIT ---
    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        if(!window.activeElement) return;
        const cls = window.activeElement.getAttribute('data-class') || '';
        const isRow = window.activeElement.classList.contains('builder-row');

        if (cls.includes('Menu') || cls.includes('Socials')) setupRepeater(cls);

        inputs.forEach(input => {
            const type = input.dataset.style;
            if(!type) return;

            // Load Values
            if (window.activeElement.hasAttribute('data-setting-' + type)) {
                const val = window.activeElement.getAttribute('data-setting-' + type);
                if (input.type === 'checkbox') input.checked = (val === 'true');
                else if (input.type === 'color' && !val.startsWith('#')) { /*skip*/ }
                else input.value = val;
            } else {
                if (type === 'hover_bg' && cls.includes('Button')) {
                    const child = window.activeElement.querySelector('.inner-box');
                    if (child && child.getAttribute('data-hover-bg')) input.value = child.getAttribute('data-hover-bg');
                }
                if (type === 'hover_color' && cls.includes('Button')) {
                    const child = window.activeElement.querySelector('.inner-box');
                    if (child && child.getAttribute('data-hover-color')) input.value = child.getAttribute('data-hover-color');
                }
                if (type === 'border-radius') {
                    const target = getStyleTarget(window.activeElement, cls);
                    input.value = parseInt(target.style.borderRadius) || 4;
                }
                if(type === 'font-size') {
                    const target = getStyleTarget(window.activeElement, cls);
                    let s = window.getComputedStyle(target).fontSize;
                    if(cls.includes('Cart') || cls.includes('Socials')) {
                        const i = window.activeElement.querySelector('i, img');
                        if(i) s = window.getComputedStyle(i).fontSize || window.getComputedStyle(i).width;
                    }
                    input.value = parseInt(s) || 14; 
                }
            }
            
            if (isRow) { 
                 if (type === 'width-mode' && !input.value) input.value = 'container';
                 if (type === 'container-width' && !input.value) input.value = 1200;
            }

            input.addEventListener('input', function() {
                const val = (input.type === 'checkbox') ? (input.checked ? 'true' : 'false') : input.value;
                const target = getStyleTarget(window.activeElement, cls);
                
                const keysToSave = [
                    'layout','shape','icon_type','font-size','color','width', 'height', 
                    'mobile_width', 'gap', 'font-weight', 'text-transform', 'hover_style',
                    'custom_link', 'show_icon', 'button_type', 'button_bg', 'button_color',
                    'text_content', 'text_align', 'hover_bg', 'hover_color', 'border-radius', 
                    'hide_mobile', 'hide_tablet', 'hide_desktop'
                ];
                if(keysToSave.includes(type)) window.activeElement.setAttribute('data-setting-' + type, val);

                switch (type) {
                    // --- CẬP NHẬT VIEW NGAY LẬP TỨC ---
                    case 'hide_mobile': 
                    case 'hide_tablet':
                    case 'hide_desktop': 
                        updateVisibilityView(); // Ăn ngay
                        break;

                    case 'shape': if (cls.includes('Socials')) renderRepeaterHTML(window.activeElement, 'Socials'); break;
                    case 'border-radius': target.style.borderRadius = val + 'px'; break;
                    case 'hover_bg': const btnH = window.activeElement.querySelector('.inner-box'); if(btnH) btnH.setAttribute('data-hover-bg', val); break;
                    case 'hover_color': const btnC = window.activeElement.querySelector('.inner-box'); if(btnC) btnC.setAttribute('data-hover-color', val); break;
                    case 'background-color': if (isRow) window.activeElement.style.backgroundColor = val; else { target.style.backgroundColor = val; if(cls.includes('Button')) target.setAttribute('data-original-bg', val); } break;
                    case 'color': target.style.color = val; target.querySelectorAll('i, a, span, input').forEach(el => el.style.color = 'inherit'); if(cls.includes('Button')) target.setAttribute('data-original-color', val); break;
                    case 'height': if (cls.includes('Search')) { const b = window.activeElement.querySelector('.search-box'); if(b) b.style.height = val + 'px'; } else target.style.height = val + 'px'; break;
                    case 'width': if (cls.includes('Search')) target.style.cssText += `; width: ${val}% !important;`; else target.style.width = val.includes('%') ? val : val + 'px'; break;
                    case 'gap': target.style.gap = val + 'px'; break;
                    case 'font-size': if(cls.includes('Cart')) { const i = window.activeElement.querySelector('i'); if(i) i.style.fontSize = val + 'px'; } else if(cls.includes('Socials')) { target.querySelectorAll('i').forEach(el => el.style.fontSize = val + 'px'); target.querySelectorAll('img').forEach(el => { el.style.width = val + 'px'; el.style.height = val + 'px'; }); } else target.style.fontSize = val + 'px'; break;
                    case 'font-weight': target.style.fontWeight = val; break;
                    case 'text-transform': target.style.textTransform = val; break;
                    case 'icon_type': if (cls.includes('Cart')) { const i = window.activeElement.querySelector('i'); if(i) { i.className = `ph ${val}`; const currentSize = window.activeElement.getAttribute('data-setting-font-size') || 24; i.style.fontSize = currentSize + 'px'; } } break;
                    case 'show_icon': const iconDiv = window.activeElement.querySelector('.w-8.h-8'); if(iconDiv) iconDiv.style.display = (val === 'true') ? 'flex' : 'none'; break;
                    case 'button_bg': const btnS = window.activeElement.querySelector('button[type="submit"]'); if(btnS) btnS.style.backgroundColor = val; break;
                    case 'row_hidden': if (val === 'true') { window.activeElement.setAttribute('data-row-hidden', 'true'); window.activeElement.classList.add('is-hidden'); } else { window.activeElement.removeAttribute('data-row-hidden'); window.activeElement.classList.remove('is-hidden'); } break;
                    case 'text': const t = window.activeElement.querySelector('.inner-text, .text-content, button, a'); if(t) t.innerText = val; const inp = window.activeElement.querySelector('input'); if(inp) inp.placeholder = val; break;
                    case 'src': const img = window.activeElement.querySelector('img'); if(img) img.src = val; break;
                    case 'text_content': if(target.classList.contains('text-content')) target.innerText = val; break;
                    case 'text_align': target.style.textAlign = val; break;
                }
            });
        });
    };

    // --- 8. HELPERS ---
    // (Phần này giữ nguyên từ bản trước)
    function setupRepeater(cls) {
        const container = document.getElementById(cls.includes('Menu')?'menu-items-container':'social-items-container');
        const hiddenInput = document.getElementById(cls.includes('Menu')?'hidden-menu-config':'hidden-social-items');
        const btnAdd = document.getElementById(cls.includes('Menu')?'btn-add-menu':'btn-add-social');
        if(!container || !hiddenInput || !btnAdd) return;
        const target = cls.includes('Menu') ? window.activeElement.querySelector('nav') : window.activeElement.querySelector('.social-group');
        const attr = cls.includes('Menu') ? 'data-menu-config' : 'data-social-items';
        let data = []; try { data = JSON.parse(target.getAttribute(attr)) || []; } catch(e){ data = []; } 
        hiddenInput.value = JSON.stringify(data);
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
        function update() { const j = JSON.stringify(data); hiddenInput.value = j; if(target) { target.setAttribute(attr, j); renderRepeaterHTML(window.activeElement, cls.includes('Menu')?'Menu':'Socials'); } }
        window.delRep = (i) => { data.splice(i, 1); render(); update(); };
        window.renderRep = () => { render(); }; 
        btnAdd.onclick = () => { if (cls.includes('Menu')) data.push({text:'Menu Item', href:'#'}); else data.push({type:'icon', val:'ph-star', link:'#'}); render(); update(); };
        render();
    }
    function renderRepeaterHTML(el, type) { if(type==='Menu') { const n=el.querySelector('nav'); try{ const d=JSON.parse(n.getAttribute('data-menu-config')); let h=''; d.forEach(i=>h+=`<a href="${i.href}" class="hover:text-blue-600 transition px-1">${i.text}</a>`); n.innerHTML=h; }catch(e){} } if(type==='Socials') { const g=el.querySelector('.social-group'); try{ const d=JSON.parse(g.getAttribute('data-social-items')); const size = el.getAttribute('data-setting-font-size') || 20; const shape = el.getAttribute('data-setting-shape'); let shapeClass = ''; if (shape === 'circle') shapeClass = 'rounded-full bg-gray-100 p-2 hover:bg-gray-200'; if (shape === 'square') shapeClass = 'rounded bg-gray-100 p-2 hover:bg-gray-200'; let h=''; d.forEach(i => { let content = ''; if(i.type === 'image') { content = `<img src="${i.val}" style="width:${size}px; height:${size}px; object-fit:cover; display:block;">`; } else { let iconCls = i.val || 'ph-warning'; if (!iconCls.includes('ph-') && !iconCls.includes('fa-')) iconCls = 'ph-' + iconCls; content = `<i class="ph ${iconCls}" style="font-size:${size}px"></i>`; } h += `<a href="${i.link}" class="social-link hover:opacity-80 transition flex items-center justify-center ${shapeClass}">${content}</a>`; }); g.innerHTML=h; }catch(e){} } }
    function rgbToHex(rgb) { if(!rgb || rgb==='rgba(0, 0, 0, 0)') return '#ffffff'; if(rgb.startsWith('#')) return rgb; let sep=rgb.indexOf(",")>-1?",":" "; rgb=rgb.substr(4).split(")")[0].split(sep); let r=(+rgb[0]).toString(16),g=(+rgb[1]).toString(16),b=(+rgb[2]).toString(16); if(r.length==1)r="0"+r; if(g.length==1)g="0"+g; if(b.length==1)b="0"+b; return "#"+r+g+b; }
    function getStyleTarget(root, cls) { if(!cls) return root; if(cls.includes('Button')||cls.includes('CategoryBtn')) return root.querySelector('.inner-box'); if(cls.includes('Search')) return root.querySelector('.search-box, .search-icon-only'); if(cls.includes('Menu')||cls.includes('Socials')) return root.querySelector('nav, .social-group'); if(cls.includes('Divider')) return root.querySelector('div'); if(cls.includes('Text')) return root.querySelector('.text-content'); if(cls.includes('Logo')) return root; return root; }
    function renderElementPreview(name, className, contentData = {}) {
        let content = ''; let extraClass = ''; const c = contentData || {}; 
        if (className.includes('Button')) content = `<a class="inner-box flex items-center justify-center py-2 px-4 rounded text-xs font-bold transition duration-200 pointer-events-none" style="background-color:#2563eb; color:#fff;" data-original-bg="#2563eb" data-original-color="#fff">Button</a>`;
        else if (className.includes('CategoryBtn')) content = `<div class="inner-box flex items-center gap-2 px-4 py-2 pointer-events-none" style="background-color:#f3f4f6; color:#333; border-radius:4px"><i class="ph ph-list text-lg"></i><span class="text-xs font-bold uppercase whitespace-nowrap inner-text">DANH MỤC</span><i class="ph ph-caret-down text-xs ml-1"></i></div>`;
        else if (className.includes('Socials')) content = `<div class="flex items-center social-group gap-3 pointer-events-none" data-social-items='[{"icon":"ph-facebook-logo","link":"#"}]' style="font-size:18px"><a class="social-link flex items-center justify-center"><i class="ph ph-facebook-logo"></i></a></div>`;
        else if (className.includes('Search')) { const h = c.height || 36; if (c.layout === 'icon') { content = `<div class="search-icon-only cursor-pointer hover:opacity-70" style="color: inherit; font-size: 20px;"><i class="ph ph-magnifying-glass"></i></div>`; } else { content = `<form class="search-box relative flex items-center w-full bg-gray-100 rounded-full pointer-events-none" style="min-width:200px; width: 100%; height: ${h}px"><input type="text" placeholder="Tìm kiếm..." class="w-full h-full px-4 border-0 bg-transparent text-xs"><i class="ph ph-magnifying-glass absolute right-3 opacity-50"></i></form>`; extraClass = 'w-full'; } }
        else if (className.includes('Menu')) { content = `<nav class="flex items-center gap-6 text-sm font-medium whitespace-nowrap overflow-hidden text-inherit pointer-events-none menu-nav" data-menu-config='[{"text":"Trang chủ","href":"/"}]'><span>Trang chủ</span></nav>`; extraClass = 'w-full'; }
        else if (className.includes('Logo')) { const src = c.src || "https://fptshop.com.vn/img/fpt-shop.png"; content = `<div class="w-full flex justify-start pointer-events-none"><img src="${src}" class="h-8 object-contain"></div>`; }
        else if (className.includes('Cart')) { let extra = ''; if (c.layout === 'icon_price') extra = `<span class='text-xs font-bold ml-2'>1.250.000₫</span>`; if (c.layout === 'icon_label') extra = `<span class='text-xs font-bold ml-2'>Giỏ hàng</span>`; const iconCls = c.icon_type || 'ph-shopping-cart'; content = `<div class="flex items-center pointer-events-none px-2 text-inherit"><div class="relative"><i class="ph ${iconCls} text-2xl"></i><span class="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div>${extra}</div>`; }
        else if (className.includes('Account')) { content = `<a class="flex items-center gap-2 pointer-events-none text-inherit"><div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><i class="ph ph-user text-lg"></i></div><div class="flex flex-col leading-tight"><span class="text-[10px] inner-text-welcome">Xin chào!</span><span class="text-xs font-bold inner-text-action">Đăng nhập</span></div></a>`; }
        else if (className.includes('Text')) { content = `<div class="text-sm pointer-events-none whitespace-nowrap text-content text-inherit" style="line-height:1.5">Nội dung tùy chỉnh...</div>`; }
        else if (className.includes('Divider')) { content = `<div class="h-6 w-px bg-gray-300 mx-2 pointer-events-none"></div>`; }
        else { content = `<span class="font-bold text-sm pointer-events-none">${name}</span>`; }

        return `
            <div class="builder-element relative group cursor-pointer hover:bg-blue-50/50 p-1 rounded transition border border-transparent hover:border-blue-300 flex items-center justify-center ${extraClass}" data-class="${className}">
                ${content}
                <div class="btn-delete absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:scale-110 hover:bg-red-600">
                    <i class="ph ph-x text-xs font-bold"></i>
                </div>
            </div>
        `;
    }
    
    // View Switcher (FIX: Cập nhật mode ngay lập tức)
    viewBtns.forEach(btn => { 
        btn.addEventListener('click', () => { 
            const mode = btn.dataset.mode;
            window.currentViewMode = mode; // Lưu mode
            canvasFrame.style.maxWidth = (mode === 'mobile') ? '375px' : (mode === 'tablet' ? '768px' : '100%'); 
            
            viewBtns.forEach(b => { b.classList.remove('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200'); b.classList.add('text-gray-500', 'border-transparent'); });
            btn.classList.add('bg-white', 'text-gray-800', 'shadow-sm', 'border-gray-200');
            btn.classList.remove('text-gray-500', 'border-transparent');

            // Gọi luôn, không timeout nữa
            updateVisibilityView(); 
        }); 
    });
});