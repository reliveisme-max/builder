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

        // 2. SCAN CANVAS -> JSON
        const structure = [];
        const rows = document.querySelectorAll('#canvas-frame .builder-row');

        rows.forEach(row => {
            const rowData = {
                label: row.getAttribute('data-label'),
                style: row.getAttribute('style') || '', // Style của Row (Màu nền, Height)
                columns: {}
            };

            row.querySelectorAll('.drop-zone').forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const elements = [];

                zone.querySelectorAll('.builder-element').forEach(el => {
                    const cls = el.getAttribute('data-class');
                    
                    // --- LOGIC MỚI: LẤY STYLE CHUẨN ---
                    // Mặc định lấy style của wrapper
                    let savedStyle = el.getAttribute('style') || '';
                    
                    // Tìm phần tử con thực sự chứa giao diện (Nút, Input, Box...)
                    const child = el.querySelector('.inner-box, .search-box, button, a');
                    
                    if (child) {
                        // Trích xuất các style quan trọng từ con để lưu
                        const stylesToSave = [
                            'background-color', 
                            'color', 
                            'border-radius', 
                            'padding-left', 
                            'padding-right', 
                            'font-size', 
                            'font-weight', 
                            'text-transform'
                        ];
                        
                        stylesToSave.forEach(prop => {
                            if (child.style[prop]) {
                                savedStyle += `${prop}: ${child.style[prop]}; `;
                            }
                        });

                        // Riêng Search Box lấy thêm width từ con
                        if (cls.includes('Search') && child.style.width) {
                            savedStyle += `width: ${child.style.width}; `;
                        }
                    }
                    // ----------------------------------

                    const content = {};
                    
                    // Lấy nội dung (Ảnh, Text)
                    const img = el.querySelector('img');
                    if (img) content.src = img.src;

                    if (!cls.includes('Menu')) {
                        const txt = el.querySelector('.text-content, button, a, .inner-text');
                        if (txt) content.text = txt.innerText;
                        
                        const inp = el.querySelector('input');
                        if (inp) content.text = inp.placeholder;
                    }

                    elements.push({
                        class: cls,
                        style: savedStyle, // Lưu chuỗi style đã gộp
                        content: content
                    });
                });
                rowData.columns[zoneName] = elements;
            });
            structure.push(rowData);
        });

        // 3. SEND API
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
                resetBtn(btn, originalHTML);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Lỗi kết nối Server!');
            resetBtn(btn, originalHTML);
        });
    });

    function resetBtn(btn, html) {
        btn.innerHTML = html;
        btn.disabled = false;
        btn.classList.remove('opacity-75');
    }
});