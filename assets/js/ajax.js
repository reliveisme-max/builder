document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function() {
        const btn = this;
        const originalHTML = btn.innerHTML;
        
        // 1. Loading UI
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> SAVING...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        // 2. Scan Data
        const structure = [];
        const rows = document.querySelectorAll('.builder-row');

        rows.forEach(row => {
            const rowData = {
                label: row.getAttribute('data-label'),
                // Lưu style của Row (bao gồm min-height, background-color...)
                style: row.getAttribute('style') || '',
                
                // Lưu cấu hình Container
                width_mode: row.getAttribute('data-width-mode') || 'container',
                container_width: row.getAttribute('data-container-width') || '1200px',
                
                // Lưu trạng thái Ẩn/Hiện
                row_hidden: row.getAttribute('data-row-hidden') || 'false',
                
                columns: {}
            };

            row.querySelectorAll('.drop-zone').forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const elements = [];

                zone.querySelectorAll('.builder-element').forEach(el => {
                    const cls = el.getAttribute('data-class');
                    let savedStyle = el.getAttribute('style') || '';
                    
                    // A. LẤY STYLE TỪ CÁC ELEMENT CON
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
                            'font-weight', 'text-transform', 'gap', 'width', 'height', // <--- QUAN TRỌNG: Lưu height
                            'text-align', 'border-color', 'border-width', 'border-style',
                            'line-height'
                        ];
                        // Copy style từ con vào JSON
                        stylesToSave.forEach(prop => {
                            if (child.style[prop]) savedStyle += `${prop}: ${child.style[prop]}; `;
                        });
                    }

                    // B. LẤY CONTENT & SETTINGS
                    const content = {};
                    
                    // Lấy text/link cơ bản
                    if (!cls.includes('Menu') && !cls.includes('Socials')) {
                        const txt = el.querySelector('.text-content, button, a, .inner-text'); 
                        if (txt) content.text = txt.innerText;
                        const inp = el.querySelector('input'); 
                        if (inp) content.text = inp.placeholder;
                    }

                    const linkEl = el.querySelector('a');
                    if (linkEl && !cls.includes('Socials') && !cls.includes('Menu') && !cls.includes('Account')) {
                        content.href = linkEl.getAttribute('href');
                    }
                    
                    const img = el.querySelector('img');
                    if (img) content.src = img.getAttribute('src'); // Dùng getAttribute để lấy src gốc

                    // Repeater Configs
                    const nav = el.querySelector('nav'); 
                    if (nav && nav.getAttribute('data-menu-config')) content['menu_config'] = nav.getAttribute('data-menu-config');

                    const socialGrp = el.querySelector('.social-group');
                    if (socialGrp && socialGrp.getAttribute('data-social-items')) content['social_items'] = socialGrp.getAttribute('data-social-items');

                    // Button Hover Attributes
                    if (child && cls.includes('Button')) {
                        if (child.getAttribute('data-hover-bg')) content['hover_bg'] = child.getAttribute('data-hover-bg');
                        if (child.getAttribute('data-hover-color')) content['hover_color'] = child.getAttribute('data-hover-color');
                    }
                    
                    // Account Texts
                    const accW = el.querySelector('.inner-text-welcome'); if(accW) content['text_welcome'] = accW.innerText;
                    const accA = el.querySelector('.inner-text-action'); if(accA) content['text_action'] = accA.innerText;
                    if(cls.includes('Account')) { const al = el.querySelector('a'); if(al) content['link_login'] = al.getAttribute('href'); }
                    
                    // Text HTML Content
                    const txtContent = el.querySelector('.text-content'); if (txtContent) content['text_content'] = txtContent.innerText;

                    // --- QUAN TRỌNG: LƯU CÁC SETTING ĐẶC BIỆT ---
                    // Thêm 'height' và 'width' vào đây để nó được lưu vào biến $settings của PHP
                    const specialSettings = ['layout', 'shape', 'icon_type', 'hover_style', 'text-transform', 'height', 'width', 'font-size', 'color', 'background-color'];
                    
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

        // 3. Send API
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
    });
});