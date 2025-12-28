document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function() {
        const btn = this;
        const originalHTML = btn.innerHTML;
        
        // 1. Hiệu ứng Loading
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> SAVING...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        // 2. Quét dữ liệu từ Canvas
        const structure = [];
        const rows = document.querySelectorAll('#canvas-frame .builder-row');

        rows.forEach(row => {
            const rowData = {
                label: row.getAttribute('data-label'),
                style: row.getAttribute('style') || '',
                columns: {}
            };

            row.querySelectorAll('.drop-zone').forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const elements = [];

                zone.querySelectorAll('.builder-element').forEach(el => {
                    const cls = el.getAttribute('data-class');
                    let savedStyle = el.getAttribute('style') || '';
                    
                    // A. LẤY STYLE CỦA PHẦN TỬ CON (QUAN TRỌNG)
                    let child = null;
                    if (cls.includes('Button') || cls.includes('CategoryBtn')) child = el.querySelector('a, button, .inner-box');
                    else if (cls.includes('Search')) child = el.querySelector('.search-box, .search-icon-only');
                    else if (cls.includes('Menu') || cls.includes('Socials')) child = el.querySelector('nav, .social-group');
                    else if (cls.includes('Text')) child = el.querySelector('.text-content');
                    else if (cls.includes('Divider')) child = el.querySelector('div');

                    if (child) {
                        // Danh sách các thuộc tính cần lưu
                        const stylesToSave = [
                            'background-color', 'color', 'border-radius', 
                            'padding-left', 'padding-right', 'font-size', 
                            'font-weight', 'text-transform', 'gap', 'width', 
                            'text-align', 'border-color', 'border-width', 'border-style',
                            'line-height'
                        ];
                        stylesToSave.forEach(prop => {
                            if (child.style[prop]) {
                                savedStyle += `${prop}: ${child.style[prop]}; `;
                            }
                        });
                    }

                    // B. LẤY NỘI DUNG (CONTENT)
                    const content = {};
                    
                    // 1. Text & Input Placeholder
                    // Loại trừ Menu để tránh lấy text của từng item menu
                    if (!cls.includes('Menu') && !cls.includes('Socials')) {
                        const txt = el.querySelector('.text-content, button, a, .inner-text'); 
                        if (txt) content.text = txt.innerText;
                        
                        const inp = el.querySelector('input'); 
                        if (inp) content.text = inp.placeholder;
                    }

                    // 2. Link (href) & Image (src)
                    const linkEl = el.querySelector('a');
                    // Chỉ lấy href của Button hoặc Link đơn, không lấy của list Socials/Menu
                    if (linkEl && !cls.includes('Socials') && !cls.includes('Menu') && !cls.includes('Account')) {
                        content.href = linkEl.getAttribute('href');
                    }
                    
                    const img = el.querySelector('img');
                    if (img) content.src = img.src;

                    // 3. Cấu hình đặc biệt (Attributes)
                    
                    // Menu Config
                    const nav = el.querySelector('nav'); 
                    if (nav && nav.getAttribute('data-menu-config')) {
                        content['menu_config'] = nav.getAttribute('data-menu-config');
                    }

                    // Socials Items (QUAN TRỌNG: Lúc nãy thiếu cái này nên F5 mất icon)
                    const socialGrp = el.querySelector('.social-group');
                    if (socialGrp && socialGrp.getAttribute('data-social-items')) {
                        content['social_items'] = socialGrp.getAttribute('data-social-items');
                    }

                    // Button Hover Attributes
                    if (child && cls.includes('Button')) {
                        if (child.getAttribute('data-hover-bg')) content['hover_bg'] = child.getAttribute('data-hover-bg');
                        if (child.getAttribute('data-hover-color')) content['hover_color'] = child.getAttribute('data-hover-color');
                    }
                    
                    // Account Texts
                    const accW = el.querySelector('.inner-text-welcome');
                    if(accW) content['text_welcome'] = accW.innerText;
                    const accA = el.querySelector('.inner-text-action');
                    if(accA) content['text_action'] = accA.innerText;
                    if(cls.includes('Account')) { 
                        const al = el.querySelector('a'); 
                        if(al) content['link_login'] = al.getAttribute('href'); 
                    }

                    // Text HTML Content
                    const txtContent = el.querySelector('.text-content');
                    if (txtContent) content['text_content'] = txtContent.innerText;

                    elements.push({
                        class: cls,
                        style: savedStyle,
                        content: content
                    });
                });
                rowData.columns[zoneName] = elements;
            });
            structure.push(rowData);
        });

        // 3. Gửi về Server
        fetch('api/save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ structure: structure })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                btn.innerHTML = '<i class="ph ph-check"></i> SAVED!';
                btn.classList.remove('bg-[#111827]');
                btn.classList.add('bg-green-600');
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'bg-green-600');
                    btn.classList.add('bg-[#111827]');
                }, 1500);
            } else {
                alert('Lỗi: ' + data.message);
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        })
        .catch(err => {
            console.error(err);
            alert('Lỗi kết nối Server!');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        });
    });
});