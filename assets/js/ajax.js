document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function() {
        const btn = this;
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> SAVING...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        try {
            const structure = [];
            const rows = document.querySelectorAll('.builder-row');

            rows.forEach(row => {
                const rowData = {
                    label: row.getAttribute('data-label'),
                    style: row.getAttribute('style') || '',
                    width_mode: row.getAttribute('data-width-mode') || 'container',
                    container_width: row.getAttribute('data-container-width') || '1200px',
                    row_hidden: row.getAttribute('data-row-hidden') || 'false',
                    columns: {}
                };

                row.querySelectorAll('.drop-zone').forEach(zone => {
                    const zoneName = zone.getAttribute('data-zone');
                    const elements = [];

                    zone.querySelectorAll('.builder-element').forEach(el => {
                        const cls = el.getAttribute('data-class');
                        let savedStyle = el.getAttribute('style') || '';
                        
                        // 1. LẤY STYLE CƠ BẢN TỪ CON
                        let child = null;
                        if (cls.includes('Button') || cls.includes('CategoryBtn')) child = el.querySelector('.inner-box');
                        else if (cls.includes('Search')) child = el.querySelector('.search-box, .search-icon-only');
                        else if (cls.includes('Menu') || cls.includes('Socials')) child = el.querySelector('nav, .social-group');
                        else if (cls.includes('Text')) child = el.querySelector('.text-content');
                        else if (cls.includes('Divider')) child = el.querySelector('div');

                        if (child) {
                            const stylesToSave = [
                                'background-color', 'color', 'border-radius', 
                                'padding-left', 'padding-right', 'font-size', 
                                'font-weight', 'text-transform', 'gap', 'width', 'height',
                                'text-align', 'border-color', 'border-width', 'border-style',
                                'line-height'
                            ];
                            stylesToSave.forEach(prop => {
                                if (child.style[prop]) savedStyle += `${prop}: ${child.style[prop]}; `;
                            });
                        }

                        // 2. LẤY CONTENT & SETTINGS
                        const content = {};
                        
                        // Text & Link cơ bản (Trừ các element phức tạp)
                        const complexElements = ['Menu', 'Socials', 'Account', 'Cart', 'CategoryBtn', 'Search'];
                        const isComplex = complexElements.some(name => cls.includes(name));

                        if (!isComplex) {
                            const txt = el.querySelector('.text-content, button, a, .inner-text'); 
                            if (txt) content.text = txt.innerText;
                            const inp = el.querySelector('input'); 
                            if (inp) content.text = inp.placeholder;
                        }

                        const linkEl = el.querySelector('a');
                        if (linkEl && !isComplex) {
                            content.href = linkEl.getAttribute('href');
                        }
                        
                        const img = el.querySelector('img');
                        if (img) content.src = img.getAttribute('src');

                        // Config Nâng cao
                        const nav = el.querySelector('nav'); 
                        if (nav) content['menu_config'] = nav.getAttribute('data-menu-config');

                        const socialGrp = el.querySelector('.social-group');
                        if (socialGrp) content['social_items'] = socialGrp.getAttribute('data-social-items');

                        // Hover Colors
                        if (child && cls.includes('Button')) {
                            if (child.getAttribute('data-hover-bg')) content['hover_bg'] = child.getAttribute('data-hover-bg');
                            if (child.getAttribute('data-hover-color')) content['hover_color'] = child.getAttribute('data-hover-color');
                        }
                        
                        // Account Data
                        const accW = el.querySelector('.inner-text-welcome'); if(accW) content['text_welcome'] = accW.innerText;
                        const accA = el.querySelector('.inner-text-action'); if(accA) content['text_action'] = accA.innerText;
                        if(cls.includes('Account')) { const al = el.querySelector('a'); if(al) content['link_login'] = al.getAttribute('href'); }
                        
                        // Text Content
                        const txtContent = el.querySelector('.text-content'); if (txtContent) content['text_content'] = txtContent.innerText;

                        // --- DANH SÁCH SETTING ĐẶC BIỆT (FULL) ---
                        const specialSettings = [
                            'layout', 'shape', 'icon_type', 'hover_style', 'text-transform', 
                            'height', 'width', 'font-size', 'color', 'background-color',
                            'mobile_width', 'gap', 'font-weight', 'custom_link', 'show_icon', 
                            'button_type', 'button_bg', 'button_color', 'button_text',
                            'text_content', 'text_align', 'hover_bg', 'hover_color', 'border-radius',
                            'hide_mobile', 'hide_tablet', 'hide_desktop' // <-- Đã thêm đủ 3 chế độ ẩn
                        ];

                        specialSettings.forEach(key => {
                            if (el.hasAttribute('data-setting-' + key)) {
                                content[key] = el.getAttribute('data-setting-' + key);
                            }
                        });

                        elements.push({ class: cls, style: savedStyle, content: content });
                    });
                    rowData.columns[zoneName] = elements;
                });
                structure.push(rowData);
            });

            fetch('api/save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ structure: structure })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    btn.innerHTML = '<i class="ph ph-check"></i> SAVED!';
                    btn.classList.remove('bg-[#111827]'); btn.classList.add('bg-green-600');
                    setTimeout(() => {
                        btn.innerHTML = originalHTML; btn.disabled = false;
                        btn.classList.remove('opacity-75', 'bg-green-600'); btn.classList.add('bg-[#111827]');
                    }, 1500);
                } else {
                    alert('Lỗi: ' + data.message);
                    btn.innerHTML = originalHTML; btn.disabled = false;
                }
            })
            .catch(err => {
                console.error(err); alert('Lỗi kết nối Server!');
                btn.innerHTML = originalHTML; btn.disabled = false;
            });
            
        } catch (e) {
            console.error("Critical Error:", e);
            alert("Lỗi JS khi lưu.");
            btn.innerHTML = originalHTML; btn.disabled = false;
        }
    });
});