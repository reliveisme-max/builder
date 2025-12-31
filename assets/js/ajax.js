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
            const rows = document.querySelectorAll('#editor-panel .builder-row');

            rows.forEach(row => {
                const rowData = {
                    label: row.getAttribute('data-label'),
                    width_mode: row.getAttribute('data-width-mode') || 'container',
                    container_width: row.getAttribute('data-container-width') || '1200',
                    row_hidden: row.getAttribute('data-row-hidden') || 'false',
                    
                    min_height: row.getAttribute('data-min-height') || '50',
                    box_shadow: row.getAttribute('data-box-shadow') || 'none',
                    // [NEW] Lưu khoảng cách Gap
                    gap: row.getAttribute('data-gap') || '15',
                    
                    columns: {}
                };

                // Style string cho Row
                let rowStyle = '';
                const bg = row.getAttribute('data-background-color');
                if (bg) rowStyle += `background-color: ${bg}; `;
                const color = row.getAttribute('data-color');
                if (color) rowStyle += `color: ${color}; `;
                const sticky = row.getAttribute('data-sticky');
                if (sticky === 'true') rowStyle += `position: sticky; top: 0; z-index: 999; `;
                if (rowData.box_shadow && rowData.box_shadow !== 'none') rowStyle += `box-shadow: ${rowData.box_shadow}; `;
                if (rowData.min_height) rowStyle += `min-height: ${rowData.min_height}px; `;

                rowData.style = rowStyle;

                row.querySelectorAll('.drop-zone').forEach(zone => {
                    const zoneName = zone.getAttribute('data-zone');
                    const elements = [];
                    zone.querySelectorAll('.builder-element').forEach(chip => {
                        const cls = chip.getAttribute('data-class');
                        const content = {};
                        Array.from(chip.attributes).forEach(attr => {
                            if (attr.name.startsWith('data-setting-')) {
                                const key = attr.name.replace('data-setting-', '');
                                content[key] = attr.value;
                            }
                        });
                        if (cls.includes('Menu')) {
                            const nav = chip.querySelector('nav'); 
                            if(nav && nav.getAttribute('data-menu-config')) content['menu_config'] = nav.getAttribute('data-menu-config');
                        }
                        if (cls.includes('Socials')) {
                            const grp = chip.querySelector('.social-group'); 
                            if(grp && grp.getAttribute('data-social-items')) content['social_items'] = grp.getAttribute('data-social-items');
                        }
                        elements.push({ class: cls, style: '', content: content });
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
                    alert('Lỗi Server: ' + data.message);
                    btn.innerHTML = originalHTML; btn.disabled = false;
                }
            })
            .catch(err => {
                console.error(err); 
                alert('Lỗi kết nối mạng!');
                btn.innerHTML = originalHTML; btn.disabled = false;
            });
            
        } catch (e) {
            console.error("Critical Error:", e);
            alert("Lỗi Javascript.");
            btn.innerHTML = originalHTML; btn.disabled = false;
        }
    });
});