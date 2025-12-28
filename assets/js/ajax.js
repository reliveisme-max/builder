// assets/js/ajax.js
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) { console.error("Lỗi: Không tìm thấy nút Save"); return; }

    saveBtn.addEventListener('click', function() {
        const btn = this;
        const originalText = btn.innerHTML;
        
        // 1. Loading UI
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Saving...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        // 2. SCAN CANVAS -> JSON
        const structure = [];
        const rows = document.querySelectorAll('#canvas-frame .builder-row');

        rows.forEach(row => {
            const rowData = {
                label: row.getAttribute('data-label'),
                style: row.getAttribute('style') || '', 
                columns: {}
            };

            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const elements = [];

                zone.querySelectorAll('.builder-element').forEach(el => {
                    // Lấy Style inline
                    let style = el.getAttribute('style') || '';
                    
                    // Lấy Nội dung (Content)
                    const content = {};
                    const cls = el.getAttribute('data-class');

                    // A. Lấy Link Ảnh (Logo)
                    const img = el.querySelector('img');
                    if (img) content.src = img.src;

                    // B. Lấy Text (Button, Text HTML) - Trừ Menu ra
                    if (!cls.includes('Menu')) {
                        const textNode = el.querySelector('.text-content, button, a');
                        if (textNode) content.text = textNode.innerText;
                        
                        const inputNode = el.querySelector('input');
                        if (inputNode) content.text = inputNode.placeholder;
                    }

                    elements.push({
                        class: cls,
                        style: style,
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
                btn.innerHTML = '<i class="ph ph-check"></i> Saved!';
                btn.classList.replace('bg-[#111827]', 'bg-green-600');
                btn.classList.replace('bg-indigo-600', 'bg-green-600');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.replace('bg-green-600', 'bg-[#111827]');
                    btn.classList.remove('opacity-75');
                }, 2000);
            } else {
                alert('Lỗi: ' + data.message);
                resetBtn(btn, originalText);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Lỗi kết nối server!');
            resetBtn(btn, originalText);
        });
    });

    function resetBtn(btn, text) {
        btn.innerHTML = text;
        btn.disabled = false;
        btn.classList.remove('opacity-75');
    }
});