/*==========================================================================
   # CANVAS LOGIC - Xử lý kéo thả Header
==========================================================================*/
document.addEventListener('DOMContentLoaded', function() {
    
    // Thư viện blocks
    new Sortable(document.getElementById('block-library'), {
        group: { name: 'builder-group', pull: 'clone', put: false },
        sort: false,
        animation: 150
    });

    // Vùng thả canvas
    new Sortable(document.getElementById('drop-canvas'), {
        group: 'builder-group',
        animation: 150,
        onAdd: function (evt) {
            const itemEl = evt.item;
            const blockId = itemEl.getAttribute('data-id');

            fetch('get-block.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'block_id=' + blockId
            })
            .then(response => response.text())
            .then(html => {
                itemEl.innerHTML = html;
                itemEl.style.cssText = "background:transparent; padding:0; border:none;";
            });
        }
    });
});