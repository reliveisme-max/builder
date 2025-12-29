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
                const rowData = {
                    label: row.getAttribute('data-label'),
                    // Các cài đặt Row
                    width_mode: row.getAttribute('data-width-mode') || 'container',
                    container_width: row.getAttribute('data-container-width') || '1200px',
                    row_hidden: row.getAttribute('data-row-hidden') || 'false',
                    columns: {}
                };

                // Xây dựng chuỗi Style cho Row (để Frontend render)
                let rowStyle = '';
                const bg = row.getAttribute('data-background-color');
                if (bg) rowStyle += `background-color: ${bg}; `;
                
                const color = row.style.color;
                if (color) rowStyle += `color: ${color}; `;

                const sticky = row.getAttribute('data-sticky');
                if (sticky === 'true') rowStyle += `position: sticky; top: 0; z-index: 999; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); `;

                const minH = row.getAttribute('data-min-height');
                if (minH) rowStyle += `min-height: ${minH}px; `;

                rowData.style = rowStyle;

                // 2. Lấy thông tin các Zone và Element
                row.querySelectorAll('.drop-zone').forEach(zone => {
                    const zoneName = zone.getAttribute('data-zone');
                    const elements = [];

                    zone.querySelectorAll('.builder-element').forEach(chip => {
                        const cls = chip.getAttribute('data-class');
                        const content = {};

                        // Quét tất cả các attribute 'data-setting-*' đã lưu trên Chip
                        Array.from(chip.attributes).forEach(attr => {
                            if (attr.name.startsWith('data-setting-')) {
                                const key = attr.name.replace('data-setting-', '');
                                content[key] = attr.value;
                            }
                        });

                        // Xử lý riêng cho Menu/Socials (JSON data)
                        // (Mặc dù đã lưu trong data-setting-, nhưng kiểm tra lại cho chắc)
                        if (cls.includes('Menu')) {
                            const nav = chip.querySelector('nav'); 
                            if(nav && nav.getAttribute('data-menu-config')) {
                                content['menu_config'] = nav.getAttribute('data-menu-config');
                            }
                        }

                        // Lưu vào danh sách
                        elements.push({ 
                            class: cls, 
                            style: '', // Style giờ đã nằm trong content settings
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
            
        } catch (e) {
            console.error("Critical Error:", e);
            alert("Lỗi JS khi lưu dữ liệu.");
            btn.innerHTML = originalHTML; 
            btn.disabled = false;
        }
    });
});