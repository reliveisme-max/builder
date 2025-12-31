document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function() {
        const btn = this;
        const originalHTML = btn.innerHTML;
        
        // Hiệu ứng Loading
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> SAVING...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        try {
            const structure = [];
            // Chỉ quét các dòng trong Editor Panel
            const rows = document.querySelectorAll('#editor-panel .builder-row');

            rows.forEach(row => {
                // 1. Lấy thông tin Row
                // Lưu ý: Lấy trực tiếp từ các data-attribute đã được builder.js cập nhật
                const rowData = {
                    label: row.getAttribute('data-label'),
                    width_mode: row.getAttribute('data-width-mode') || 'container',
                    container_width: row.getAttribute('data-container-width') || '1200',
                    row_hidden: row.getAttribute('data-row-hidden') || 'false',
                    
                    // Các chỉ số quan trọng (Lưu thô để Restore cho dễ)
                    min_height: row.getAttribute('data-min-height') || '50',
                    box_shadow: row.getAttribute('data-box-shadow') || 'none',
                    
                    columns: {}
                };

                // 2. Xây dựng chuỗi Style (Để Frontend PHP render ra CSS)
                let rowStyle = '';
                
                // Màu nền
                const bg = row.getAttribute('data-background-color');
                if (bg) rowStyle += `background-color: ${bg}; `;
                
                // Màu chữ
                const color = row.getAttribute('data-color');
                if (color) rowStyle += `color: ${color}; `;

                // Sticky (Ghim)
                const sticky = row.getAttribute('data-sticky');
                if (sticky === 'true') {
                    rowStyle += `position: sticky; top: 0; z-index: 999; `;
                }

                // Box Shadow
                if (rowData.box_shadow && rowData.box_shadow !== 'none') {
                    rowStyle += `box-shadow: ${rowData.box_shadow}; `;
                }

                // Min Height
                if (rowData.min_height) rowStyle += `min-height: ${rowData.min_height}px; `;

                rowData.style = rowStyle;

                // 3. Quét các Zone và Element bên trong
                row.querySelectorAll('.drop-zone').forEach(zone => {
                    const zoneName = zone.getAttribute('data-zone');
                    const elements = [];

                    zone.querySelectorAll('.builder-element').forEach(chip => {
                        const cls = chip.getAttribute('data-class');
                        const content = {};

                        // Quét tất cả các attribute 'data-setting-*'
                        Array.from(chip.attributes).forEach(attr => {
                            if (attr.name.startsWith('data-setting-')) {
                                const key = attr.name.replace('data-setting-', '');
                                content[key] = attr.value;
                            }
                        });

                        // Xử lý dữ liệu JSON đặc biệt (Menu/Socials)
                        if (cls.includes('Menu')) {
                            const nav = chip.querySelector('nav'); 
                            if(nav && nav.getAttribute('data-menu-config')) {
                                content['menu_config'] = nav.getAttribute('data-menu-config');
                            }
                        }
                        if (cls.includes('Socials')) {
                            const grp = chip.querySelector('.social-group'); 
                            if(grp && grp.getAttribute('data-social-items')) {
                                content['social_items'] = grp.getAttribute('data-social-items');
                            }
                        }

                        // Lưu vào danh sách
                        elements.push({ 
                            class: cls, 
                            style: '', // Style giờ đã nằm trong content settings hoặc CSS class
                            content: content 
                        });
                    });
                    rowData.columns[zoneName] = elements;
                });
                structure.push(rowData);
            });

            // Gửi về Server
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
                    alert('Lỗi Server: ' + data.message);
                    btn.innerHTML = originalHTML; 
                    btn.disabled = false;
                }
            })
            .catch(err => {
                console.error(err); 
                alert('Lỗi kết nối mạng hoặc lỗi cú pháp JSON!');
                btn.innerHTML = originalHTML; 
                btn.disabled = false;
            });
            
        } catch (e) {
            console.error("Critical Error:", e);
            alert("Lỗi Javascript khi lưu dữ liệu.");
            btn.innerHTML = originalHTML; 
            btn.disabled = false;
        }
    });
});