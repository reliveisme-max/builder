document.addEventListener('DOMContentLoaded', () => {
    // 1. GLOBAL VARIABLES
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

    // 2. EVENTS & UI
    function setupViewSwitcher() {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                window.currentViewMode = mode;
                simulationFrame.className = `mode-${mode}`;
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

    function loadSettingsForm(url) {
        propertyPanel.innerHTML = '<div class="h-full flex items-center justify-center text-gray-400"><i class="ph ph-spinner animate-spin text-2xl"></i></div>';
        fetch(url)
            .then(response => response.text())
            .then(html => {
                propertyPanel.innerHTML = html;
                if (window.initLiveEdit) window.initLiveEdit();
            })
            .catch(err => {
                console.error(err);
                propertyPanel.innerHTML = '<div class="p-4 text-red-500 text-center">Lỗi tải Form.</div>';
            });
    }

    window.initLiveEdit = function() {
        const inputs = propertyPanel.querySelectorAll('.prop-input');
        if(!window.activeElement) return;

        const isRow = window.activeElement.classList.contains('builder-row');
        
        let previewEl = null;
        try {
            if (!isRow && liveHeaderContainer.children.length > 0) {
                const zone = window.activeElement.closest('.drop-zone');
                if (zone) {
                    const chips = Array.from(zone.querySelectorAll('.builder-element'));
                    const index = chips.indexOf(window.activeElement);
                    const zoneName = zone.getAttribute('data-zone'); 
                    if (zoneName) {
                        const pos = zoneName.split('_')[1]; 
                        const rowEl = window.activeElement.closest('.builder-row');
                        const allRows = Array.from(document.querySelectorAll('.builder-row'));
                        const rowIdx = allRows.indexOf(rowEl);
                        const previewRow = liveHeaderContainer.children[rowIdx];
                        if(previewRow) {
                            const col = previewRow.querySelector(`.col-${pos}`);
                            if(col && col.children[index]) previewEl = col.children[index]; 
                        }
                    }
                }
            }
        } catch(e) {}

        inputs.forEach(input => {
            const key = input.dataset.style;
            if(!key) return;

            let savedVal = '';
            if (isRow) {
                savedVal = window.activeElement.getAttribute('data-' + key);
                if (key === 'color' && !savedVal) savedVal = window.activeElement.getAttribute('data-color');
            } else {
                savedVal = window.activeElement.getAttribute('data-setting-' + key);
            }

            if (input.type === 'checkbox') input.checked = (savedVal === 'true');
            else if (input.type === 'color') {
                if (savedVal && savedVal.startsWith('#')) {
                    input.value = savedVal;
                } else if (!isRow && previewEl && (key === 'color' || key.includes('color'))) {
                    try {
                        const target = previewEl.querySelector('a, i, span') || previewEl;
                        const computedColor = getComputedStyle(target).color;
                        const hexColor = rgbToHex(computedColor);
                        if(hexColor) input.value = hexColor;
                    } catch(e){}
                }
                const textInput = document.getElementById(input.id.replace('-picker', '-text'));
                if(textInput) textInput.value = input.value;
            }
            else if (savedVal) input.value = savedVal;

            if (input.type === 'range' && input.nextElementSibling && savedVal) {
                input.nextElementSibling.innerText = savedVal + 'px';
            }

            const eventType = (input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'input';
            
            input.addEventListener(eventType, function() {
                const val = (input.type === 'checkbox') ? (input.checked ? 'true' : 'false') : input.value;
                if (isRow) {
                    window.activeElement.setAttribute('data-' + key, val);
                    if (key === 'row_hidden') {
                        if(val === 'true') window.activeElement.classList.add('opacity-50', 'grayscale');
                        else window.activeElement.classList.remove('opacity-50', 'grayscale');
                    }
                } else {
                    window.activeElement.setAttribute('data-setting-' + key, val);
                }
                updateLivePreview();
            });
        });

        if (!isRow) {
            const cls = window.activeElement.getAttribute('data-class');
            if (cls && (cls.includes('Menu') || cls.includes('Socials'))) setupRepeater(cls);
        }
    }

    function rgbToHex(rgb) {
        if(!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
        if(rgb.startsWith('#')) return rgb;
        const rgbValues = rgb.match(/\d+/g);
        if(!rgbValues) return '#000000';
        return "#" + ((1 << 24) + (parseInt(rgbValues[0]) << 16) + (parseInt(rgbValues[1]) << 8) + parseInt(rgbValues[2])).toString(16).slice(1);
    }

    function updateLivePreview() {
        if(!liveHeaderContainer) return;
        liveHeaderContainer.innerHTML = ''; 
        rows.forEach(row => {
            const rowHidden = row.getAttribute('data-row-hidden') === 'true';
            if (rowHidden) return;
            const rowDiv = document.createElement('div');
            rowDiv.className = 'header-row';
            
            let styleStr = '';
            const bg = row.getAttribute('data-background-color');
            if(bg) styleStr += `background-color: ${bg}; `;
            const color = row.getAttribute('data-color');
            if(color) styleStr += `color: ${color}; `;
            const sticky = row.getAttribute('data-sticky') === 'true';
            if (sticky) styleStr += 'position: sticky; top: 0; z-index: 999; ';
            const boxShadow = row.getAttribute('data-box-shadow');
            if (boxShadow && boxShadow !== 'none') styleStr += `box-shadow: ${boxShadow}; `;
            const minH = row.getAttribute('data-min-height');
            if (minH) styleStr += `min-height: ${minH}px; `;
            rowDiv.setAttribute('style', styleStr);

            const container = document.createElement('div');
            container.className = 'hb-inner-content';
            const widthMode = row.getAttribute('data-width-mode') || 'container';
            const contWidth = row.getAttribute('data-container-width') || '1200';
            const finalWidth = isNaN(contWidth) ? contWidth : contWidth + 'px';
            if(widthMode === 'full') {
                container.style.maxWidth = '100%';
                container.style.padding = '0 20px';
            } else {
                container.style.maxWidth = finalWidth;
            }

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
                    const nav = chip.querySelector('nav');
                    if (nav) settings['menu_config'] = nav.getAttribute('data-menu-config');
                    const soc = chip.querySelector('.social-group');
                    if (soc) settings['social_items'] = soc.getAttribute('data-social-items');
                    
                    const realHtml = renderRealHTML(cls, settings);
                    const wrapper = document.createElement('div');
                    wrapper.className = 'header-item-wrapper';
                    if (settings.hide_mobile === 'true') wrapper.classList.add('hidden-mobile');
                    if (settings.hide_tablet === 'true') wrapper.classList.add('hidden-tablet');
                    if (settings.hide_desktop === 'true') wrapper.classList.add('hidden-desktop');
                    if (settings.width) {
                         wrapper.style.width = settings.width.includes('%') ? settings.width : settings.width + 'px';
                    } else if (cls.includes('Search') && position === 'center' && window.currentViewMode !== 'desktop') {
                        wrapper.style.width = '100%';
                    } else if (cls.includes('Search')) {
                         wrapper.style.flex = '1';
                         wrapper.style.minWidth = '200px';
                         wrapper.className += ' is-search-center';
                    }
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
    window.updateLivePreview = updateLivePreview;

    function renderRealHTML(className, s) {
        const color = s.color || 'inherit'; const fontSize = s['font-size'] || '14';
        
        // --- [FIX HOVER BUTTON] ---
        if (className.includes('Button')) { 
            const bg = s['background-color'] || '#2563eb'; 
            const r = s['border-radius'] || '4'; 
            const h = s['height'] || '40';
            const hBg = s['hover_bg'] || bg;
            const hCol = s['hover_color'] || color;
            
            // Dùng CSS Variable để kết hợp với file CSS
            return `<a href="${s.href||'#'}" 
                    class="dynamic-button flex items-center justify-center px-4 text-xs font-bold transition whitespace-nowrap" 
                    style="background-color:${bg}; color:${color}; 
                           --btn-hover-bg: ${hBg}; --btn-hover-color: ${hCol}; 
                           border-radius:${r}px; height:${h}px; min-width: 80px; text-decoration:none; display:inline-flex;">${s.text||'Button'}</a>`; 
        }
        
        if (className.includes('CategoryBtn')) { 
            const bg = s['background-color'] || '#f3f4f6'; const r = s['border-radius'] || '4'; const h = s['height'] || '40';
            return `<div class="flex items-center gap-2 px-4 whitespace-nowrap" style="background:${bg}; color:${color}; border-radius:${r}px; height:${h}px; display:inline-flex;"><i class="ph ph-squares-four text-lg"></i><span class="text-xs font-bold uppercase">${s.text||'DANH MỤC'}</span><i class="ph ph-caret-down text-xs"></i></div>`; 
        }
        
        if (className.includes('Search')) { 
            if (s.layout === 'icon') return `<div class="cursor-pointer" style="color:${color}; font-size:20px;"><i class="ph ph-magnifying-glass"></i></div>`; 
            const h = s.height || 36; const r = s['border-radius'] || 20; const bg = s['background-color'] || '#f3f4f6'; const btnBg = s.button_bg || 'transparent'; 
            return `<form class="relative flex items-center w-full" style="height:${h}px; background:${bg}; border-radius:${r}px;"><input type="text" placeholder="${s.text||'Tìm kiếm...'}" class="flex-1 h-full px-4 border-0 bg-transparent text-xs outline-none min-w-0" style="color:${color}"><button type="button" class="px-3 h-full flex items-center justify-center" style="background:${btnBg}"><i class="ph ph-magnifying-glass text-lg"></i></button></form>`; 
        }
        
        if (className.includes('Logo')) { 
            let src = s.src;
            if (!src || src.includes('fpt-shop.png')) src = "https://placehold.co/150x40/png?text=LOGO";
            const w = s.width || '150'; const mw = s.mobile_width || w; 
            const isMobile = window.currentViewMode === 'mobile'; const finalW = isMobile ? mw : w; 
            return `<img src="${src}" style="width:${finalW}px; height:auto; object-fit:contain; display:block;">`; 
        }
        
        if (className.includes('Cart')) { 
            const icon = s.icon_type || 'ph-shopping-cart'; const size = s['font-size'] || '24';
            let extra = ''; 
            if (s.layout === 'icon_price') extra = `<span class="text-xs font-bold ml-2">1.250.000₫</span>`; 
            if (s.layout === 'icon_label') extra = `<span class="text-xs font-bold ml-2">Giỏ hàng</span>`; 
            return `<div class="flex items-center relative whitespace-nowrap" style="color:${color}"><div class="relative inline-flex items-center justify-center" style="width:${size}px; height:${size}px;"><i class="ph ${icon}" style="font-size:${size}px !important; line-height: 1 !important; display: block;"></i><span class="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">3</span></div>${extra}</div>`; 
        }
        
        if (className.includes('Menu')) { 
            let items = []; try { items = JSON.parse(s.menu_config || '[]'); } catch(e){} if (items.length === 0) items = [{text:'Trang chủ', href:'#'}]; 
            const gap = s.gap || 20; const size = s['font-size'] || '14'; const weight = s['font-weight'] || '500'; const transform = s['text-transform'] || 'none';
            let html = ''; items.forEach(i => html += `<a href="${i.href}" class="hover:text-blue-600 transition">${i.text}</a>`); 
            return `<nav class="flex items-center whitespace-nowrap" style="gap:${gap}px; color:${color}; font-size:${size}px; font-weight:${weight}; text-transform:${transform}">${html}</nav>`; 
        }
        
        if (className.includes('Socials')) { 
            let items = []; try { items = JSON.parse(s.social_items || '[]'); } catch(e){} if (items.length === 0) items = [{type:'icon', val:'ph-facebook-logo'}]; 
            const gap = s.gap || 15; const size = s['font-size'] || '20'; const shape = s.shape || 'none'; 
            let shapeClass = ''; if (shape === 'circle') shapeClass = 'rounded-full bg-gray-100 p-2'; if (shape === 'square') shapeClass = 'rounded bg-gray-100 p-2'; 
            let html = ''; items.forEach(i => { let content = (i.type === 'image') ? `<img src="${i.val}" style="width:${size}px; height:${size}px; object-fit:cover;">` : `<i class="ph ${i.val.includes('ph-')?i.val:'ph-'+i.val}" style="font-size:${size}px !important; line-height: 1;"></i>`; const boxSize = parseInt(size) + (shape === 'none' ? 0 : 12); html += `<a href="#" class="flex items-center justify-center ${shapeClass}" style="width:${boxSize}px; height:${boxSize}px;">${content}</a>`; }); 
            return `<div class="flex items-center" style="gap:${gap}px; color:${color}">${html}</div>`; 
        }
        
        if (className.includes('Account')) { const showIcon = s.show_icon !== 'false'; const iconHtml = showIcon ? `<div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2"><i class="ph ph-user text-lg"></i></div>` : ''; return `<div class="flex items-center whitespace-nowrap" style="color:${color}">${iconHtml}<div class="flex flex-col leading-tight"><span class="text-[10px] opacity-70">${s.text_welcome||'Xin chào!'}</span><span class="text-xs font-bold">${s.text_action||'Đăng nhập'}</span></div></div>`; }
        if (className.includes('Text')) { const align = s['text-align'] || 'left'; const size = s['font-size'] || '14'; return `<div style="color:${color}; font-size:${size}px; font-weight:${s['font-weight']||400}; text-align:${align}; width:100%;">${s.text_content||'Text'}</div>`; }
        if (className.includes('Divider')) return `<div style="height:${s.height||24}px; width:1px; border-left:${s.width||1}px ${s['border-style']||'solid'} ${s['background-color']||'#ccc'}"></div>`;
        return '<div>Unknown</div>';
    }

    function restoreLayout(data) {
        data.forEach(rowData => {
            const rowEl = document.querySelector(`.builder-row[data-label="${rowData.label}"]`);
            if (!rowEl) return;
            if (rowData.min_height) rowEl.setAttribute('data-min-height', rowData.min_height);
            else if (rowData.style) {
                 const minHMatch = rowData.style.match(/min-height:\s*([^;px]+)/);
                 if (minHMatch) rowEl.setAttribute('data-min-height', minHMatch[1]);
            }
            if (rowData.box_shadow) rowEl.setAttribute('data-box-shadow', rowData.box_shadow);
            else if (rowData.style) {
                const shadowMatch = rowData.style.match(/box-shadow:\s*([^;]+)/);
                if (shadowMatch) rowEl.setAttribute('data-box-shadow', shadowMatch[1]);
            }
            if (rowData.style) {
                const bgMatch = rowData.style.match(/background-color:\s*([^;]+)/);
                if (bgMatch && bgMatch[1]) rowEl.setAttribute('data-background-color', bgMatch[1]);
                const colorMatch = rowData.style.match(/(?:^|;\s*)color:\s*([^;]+)/);
                if (colorMatch && colorMatch[1]) rowEl.setAttribute('data-color', colorMatch[1]);
            }
            if(rowData.width_mode) rowEl.setAttribute('data-width-mode', rowData.width_mode);
            if(rowData.container_width) rowEl.setAttribute('data-container-width', rowData.container_width);
            if(rowData.row_hidden === 'true') {
                rowEl.setAttribute('data-row-hidden', 'true');
                rowEl.classList.add('opacity-50', 'grayscale');
            }
            if(rowData.style && rowData.style.includes('sticky')) {
                rowEl.setAttribute('data-sticky', 'true');
            }
            if (rowData.columns) {
                for (const [zoneKey, items] of Object.entries(rowData.columns)) {
                    const zone = rowEl.querySelector(`.drop-zone[data-zone="${zoneKey}"]`);
                    if (!zone) continue;
                    zone.innerHTML = ''; 
                    items.forEach(elData => {
                        const shortName = elData.class.split('\\').pop(); 
                        const iconClass = getIconByClass(shortName);
                        const displayName = getDisplayNameByClass(shortName);
                        const newChip = createChipElement(displayName, elData.class, iconClass);
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
                const d = document.createElement('div'); 
                d.className = 'bg-gray-900 p-2 rounded border border-gray-700 flex flex-col gap-2 mb-2 relative group'; 
                const btnDel = `<button onclick="window.delRep(${i})" class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-500 bg-gray-800 hover:bg-gray-700 rounded z-10"><i class="ph ph-x text-xs"></i></button>`;
                if(cls.includes('Menu')) { 
                    d.innerHTML = `${btnDel}<div class="pr-6"><input type="text" value="${item.text}" data-idx="${i}" data-key="text" class="rep-inp w-full bg-gray-800 text-white text-xs p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="Tên menu"></div><div><input type="text" value="${item.href}" data-idx="${i}" data-key="href" class="rep-inp w-full bg-gray-800 text-blue-400 text-[10px] p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="Link"></div>`; 
                } else { 
                    const isImg = item.type === 'image'; 
                    d.innerHTML = `${btnDel}<div class="flex gap-2 pr-6"><select data-idx="${i}" data-key="type" class="rep-inp bg-gray-800 text-white text-[10px] p-1 rounded border border-gray-600 w-16 focus:border-blue-500 outline-none" onchange="window.renderRep()"><option value="icon" ${!isImg?'selected':''}>Icon</option><option value="image" ${isImg?'selected':''}>Ảnh</option></select><input type="text" value="${item.val || ''}" data-idx="${i}" data-key="val" class="rep-inp flex-1 min-w-0 bg-gray-800 text-white text-xs p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="${isImg ? 'Link Ảnh' : 'Mã (vd: ph-user)'}"></div><div><input type="text" value="${item.link || ''}" data-idx="${i}" data-key="link" class="rep-inp w-full bg-gray-800 text-blue-400 text-[10px] p-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none" placeholder="Link liên kết (#)"></div>`; 
                }
                container.appendChild(d); 
            });
            document.querySelectorAll('.rep-inp').forEach(inpt => { 
                inpt.addEventListener('input', (e) => { 
                    data[e.target.dataset.idx][e.target.dataset.key] = e.target.value; 
                    update(); 
                }); 
            });
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

    function getDisplayNameByClass(name) {
        const n = name.toLowerCase();
        if(n.includes('logo')) return 'Logo Image';
        if(n.includes('search')) return 'Search Box';
        if(n.includes('cart')) return 'Giỏ hàng';
        if(n.includes('menu')) return 'Main Menu';
        if(n.includes('social')) return 'Social Icons';
        if(n.includes('account')) return 'Account / User';
        if(n.includes('button')) return 'Button';
        if(n.includes('text')) return 'Text / HTML';
        if(n.includes('category')) return 'Danh mục';
        if(n.includes('divider')) return 'Vertical Line';
        return name; 
    }

    function getIconByClass(name) {
        const n = name.toLowerCase(); 
        if(n.includes('logo')) return 'ph ph-image'; 
        if(n.includes('search')) return 'ph ph-magnifying-glass'; 
        if(n.includes('cart')) return 'ph ph-shopping-cart'; 
        if(n.includes('menu')) return 'ph ph-list'; 
        if(n.includes('social')) return 'ph ph-share-network'; 
        if(n.includes('account') || n.includes('user')) return 'ph ph-user'; 
        if(n.includes('button')) return 'ph ph-hand-pointing'; 
        if(n.includes('text')) return 'ph ph-text-t'; 
        if(n.includes('category')) return 'ph ph-squares-four'; 
        if(n.includes('divider') || n.includes('line')) return 'ph ph-line-vertical';
        return 'ph ph-cube';
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

    function setupDragAndDrop() {
        draggables.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                draggedItem = null; 
                e.dataTransfer.setData('type', 'create'); 
                e.dataTransfer.setData('class', item.dataset.class); 
                e.dataTransfer.setData('name', item.innerText.trim());
                const i = item.querySelector('i'); 
                e.dataTransfer.setData('icon', i ? i.className : 'ph ph-cube');
            });
        });
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => { zone.classList.remove('drag-over'); });
            zone.addEventListener('drop', (e) => {
                e.preventDefault(); zone.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type'); const afterElement = getDragAfterElement(zone, e.clientX);
                if (type === 'create') {
                    const cls = e.dataTransfer.getData('class'); 
                    const name = e.dataTransfer.getData('name'); 
                    const icon = e.dataTransfer.getData('icon');
                    const newChip = createChipElement(name, cls, icon);
                    if (afterElement) zone.insertBefore(newChip, afterElement); else zone.appendChild(newChip);
                    newChip.click(); 
                } else if (draggedItem) { 
                    if (afterElement) zone.insertBefore(draggedItem, afterElement); else zone.appendChild(draggedItem); 
                }
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

    function initBuilder() {
        console.log("Builder 3.3 Final Initializing...");

        document.querySelectorAll('.drop-zone').forEach(zone => {
            let label = zone.getAttribute('data-zone').split('_')[1] || 'Zone';
            zone.setAttribute('data-label', label);
        });

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

    initBuilder();
});