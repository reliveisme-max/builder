document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function() {
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Saving...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        const structure = [];
        document.querySelectorAll('#canvas-frame .builder-row').forEach(row => {
            const rowData = {
                label: row.getAttribute('data-label'),
                style: row.getAttribute('style') || '',
                columns: {}
            };
            row.querySelectorAll('.drop-zone').forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                const elements = [];
                zone.querySelectorAll('.builder-element').forEach(el => {
                    const content = {};
                    const cls = el.getAttribute('data-class');
                    
                    const img = el.querySelector('img');
                    if (img) content.src = img.src;

                    if (!cls.includes('Menu')) {
                        const txt = el.querySelector('.text-content, button, a');
                        if (txt) content.text = txt.innerText;
                        const inp = el.querySelector('input');
                        if (inp) content.text = inp.placeholder;
                    }

                    elements.push({
                        class: cls,
                        style: el.getAttribute('style') || '', // Lấy style của Wrapper
                        content: content
                    });
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
                btn.innerHTML = '<i class="ph ph-check"></i> Saved!';
                btn.classList.replace('bg-[#111827]', 'bg-green-600');
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.replace('bg-green-600', 'bg-[#111827]');
                    btn.classList.remove('opacity-75');
                }, 1500);
            } else { alert('Lỗi: ' + data.message); btn.innerHTML = originalText; btn.disabled = false; }
        })
        .catch(err => { alert('Lỗi mạng!'); btn.innerHTML = originalText; btn.disabled = false; });
    });
});