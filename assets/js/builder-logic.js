document.addEventListener('DOMContentLoaded', function() {
    new Sortable(document.getElementById('block-library'), {
        group: { name: 'shared', pull: 'clone', put: false },
        sort: false, animation: 150
    });

    document.querySelectorAll('.drop-zone').forEach(slot => {
        new Sortable(slot, {
            group: 'shared',
            animation: 150,
            onAdd: function (evt) {
                const itemEl = evt.item;
                const blockId = itemEl.getAttribute('data-id');
                
                fetch('get-block.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'block_id=' + blockId
                })
                .then(res => res.text())
                .then(html => {
                    itemEl.innerHTML = `<div class="dropped-el" onclick="alert('Mở option cho '+ '${blockId}')">${html}</div>`;
                    itemEl.style.cssText = "width:auto; border:none; background:transparent;";
                });
            }
        });
    });
});