document.addEventListener('DOMContentLoaded', function() {
    // 1. Khởi tạo Kéo linh kiện (Dùng group 'shared' đồng bộ)
    new Sortable(document.getElementById('block-library'), {
        group: { name: 'shared', pull: 'clone', put: false },
        sort: false, animation: 150
    });

    // 2. Khởi tạo các Ô thả (Slots)
    document.querySelectorAll('.slot').forEach(slot => {
        new Sortable(slot, {
            group: 'shared',
            animation: 150,
            onAdd: function (evt) {
    const blockId = evt.item.getAttribute('data-id');
    // Thay thế icon bằng khối linh kiện
    evt.item.innerHTML = `<div class="node-dropped" onclick="openProperties('${blockId}', this)">${blockId.toUpperCase()}</div>`;
    
    // PHẢI GỌI HÀM NÀY ĐỂ PREVIEW CẬP NHẬT
    updateLivePreview(); 
}
        });
    });
});

/**
 * Hàm mở bảng thuộc tính bên phải
 */
function openProperties(type, element) {
    // Xóa trạng thái active cũ
    document.querySelectorAll('.node-dropped').forEach(el => el.classList.remove('is-active'));
    element.classList.add('is-active');

    const panel = document.getElementById('property-editor'); // ID từ index.php của bạn
    
    // Tạo giao diện cài đặt dựa trên loại linh kiện
    let html = `
        <div class="prop-group">
            <label class="prop-label">Tên linh kiện</label>
            <input type="text" class="prop-control" value="${type.toUpperCase()}" readonly>
        </div>
        <div class="prop-group">
            <label class="prop-label">Màu sắc chủ đạo</label>
            <input type="color" class="prop-control" style="height:40px; padding:2px;" onchange="updatePreviewColor(this.value)">
        </div>
        <div class="prop-group">
            <label class="prop-label">Căn chỉnh</label>
            <select class="prop-control">
                <option>Trái</option>
                <option>Giữa</option>
                <option>Phải</option>
            </select>
        </div>
    `;
    
    panel.innerHTML = html;
}

/*==========================================================================
   # HÀM RENDER LIVE PREVIEW THỰC TẾ (Nâng cấp)
==========================================================================*/
async function updateLivePreview() {
    const targetHeader = document.getElementById('header-render-target');
    if (!targetHeader) return;

    // Tạo cấu trúc chứa các hàng render
    targetHeader.innerHTML = '<div class="preview-loading">Đang cập nhật...</div>';

    let finalHtml = `<div class="real-header-preview">`;

    // Duyệt qua từng hàng Skeleton (Top, Main, Bottom)
    const rows = document.querySelectorAll('.builder-row');
    
    for (const row of rows) {
        const rowLabel = row.getAttribute('data-label');
        const nodes = row.querySelectorAll('.node-dropped');
        
        if (nodes.length > 0) {
            finalHtml += `<div class="preview-row" data-row="${rowLabel}">
                            <div class="preview-row-inner" style="display:flex; justify-content:space-between; width:100%; max-width:1200px; margin:0 auto; padding:10px 0;">`;
            
            // Render 3 vị trí: Trái - Giữa - Phải
            const positions = ['left', 'center', 'right'];
            for (const pos of positions) {
                const slot = row.querySelector(`.slot[data-pos="${pos}"]`);
                const blockInSlot = slot.querySelector('.node-dropped');
                
                finalHtml += `<div class="preview-col-${pos}" style="flex:1; display:flex; align-items:center; justify-content:${pos === 'center' ? 'center' : (pos === 'right' ? 'flex-end' : 'flex-start')}">`;
                
                if (blockInSlot) {
                    const blockId = blockInSlot.getAttribute('data-id');
                    // Gọi server để lấy HTML thật của linh kiện
                    const response = await fetch('get-block.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'block_id=' + blockId
                    });
                    const blockHtml = await response.text();
                    finalHtml += blockHtml;
                }
                
                finalHtml += `</div>`;
            }
            
            finalHtml += `</div></div>`;
        }
    }

    finalHtml += `</div>`;
    targetHeader.innerHTML = finalHtml;
}

// Đảm bảo trong hàm onAdd của Sortable có gọi updateLivePreview()