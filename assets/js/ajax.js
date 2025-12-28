// assets/js/ajax.js
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function() {
        const btn = this;
        const originalText = btn.innerHTML;
        
        // 1. Loading
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Saving...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        // 2. QUÉT DỮ LIỆU
        const structure = [];
        const rows = document.querySelectorAll('#canvas-frame .builder-row');

        rows.forEach(row => {
            const rowData = {
                label: row.getAttribute('data-label'),
                style: row.getAttribute('style') || '', // Lưu màu nền, height Row
                columns: {}
            };

            const zones = row.querySelectorAll('.drop-zone');
            zones.forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const elements = [];

                zone.querySelectorAll('.builder-element').forEach(el => {
                    // Lấy style inline (Width, Color, Font...)
                    let style = el.getAttribute('style') || '';
                    
                    // Lấy nội dung đặc biệt (Content)
                    const content = {};
                    
                    // 1. Lấy SRC ảnh (Logo)
                    const img = el.querySelector('img');
                    if (img) content.src = img.src;

                    // 2. Lấy Text (Button, Text HTML)
                    const textNode = el.querySelector('.text-content, button, a, span.font-bold');
                    if (textNode && !el.dataset.class.includes('Menu')) { 
                        // Trừ Menu ra vì Menu ko lưu text kiểu này
                        content.text = textNode.innerText;
                    }

                    // 3. Lấy href (Nếu có link)
                    const link = el.querySelector('a');
                    if (link) content.href = link.getAttribute('href');

                    elements.push({
                        class: el.getAttribute('data-class'),
                        style: style,
                        content: content
                    });
                });

                rowData.columns[zoneName] = elements;
            });

            structure.push(rowData);
        });

        // 3. GỬI VỀ SERVER
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
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.replace('bg-green-600', 'bg-[#111827]');
                    btn.classList.remove('opacity-75');
                }, 1500);
            } else {
                alert('Lỗi: ' + data.message);
                resetBtn(btn, originalText);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Lỗi kết nối Server!');
            resetBtn(btn, originalText);
        });
    });

    function resetBtn(btn, text) {
        btn.innerHTML = text;
        btn.disabled = false;
        btn.classList.remove('opacity-75');
    }
});