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
    // BỔ SUNG: data-id="${blockId}" vào thẻ div bên dưới
    evt.item.innerHTML = `<div class="node-dropped" data-id="${blockId}" onclick="openProperties('${blockId}', this)">${blockId.toUpperCase()}</div>`;
    
    updateLivePreview(); 
}
        });
    });
});

// Đối tượng lưu trữ cấu hình cho từng linh kiện đã thả
let blockSettings = {};

* Hàm mở bảng thuộc tính linh hoạt theo loại linh kiện
 */
function openProperties(type, element) {
    document.querySelectorAll('.node-dropped').forEach(el => el.classList.remove('is-active'));
    element.classList.add('is-active');

    // Lấy ID duy nhất của node này (có thể dùng timestamp nếu bạn kéo nhiều cái cùng loại)
    const nodeId = element.getAttribute('data-node-id') || Date.now();
    element.setAttribute('data-node-id', nodeId);
    
    if (!blockSettings[nodeId]) blockSettings[nodeId] = { type: type };

    const panel = document.getElementById('property-editor');
    let html = `<div class="prop-group"><label class="prop-label">Linh kiện: ${type.toUpperCase()}</label></div>`;

    // Phân loại linh kiện để hiện thị controls đúng
    switch(type) {
        case 'logo':
            html += `
                <div class="prop-group">
                    <label class="prop-label">Kiểu Logo</label>
                    <select class="prop-control" onchange="updateBlockData('${nodeId}', 'logoType', this.value)">
                        <option value="text">Dạng chữ (Text)</option>
                        <option value="image">Dạng ảnh (Image)</option>
                    </select>
                </div>
                <div id="logo-text-settings">
                    <div class="prop-group">
                        <label class="prop-label">Nội dung Logo</label>
                        <input type="text" class="prop-control" value="STUDIOLOGO" oninput="updateBlockData('${nodeId}', 'text', this.value)">
                    </div>
                    <div class="prop-group">
                        <label class="prop-label">Màu chữ</label>
                        <input type="color" class="prop-control" value="#1a1c1e" onchange="updateBlockData('${nodeId}', 'color', this.value)">
                    </div>
                </div>`;
            break;

        case 'search':
            html += `
                <div class="prop-group">
                    <label class="prop-label">Lời nhắc (Placeholder)</label>
                    <input type="text" class="prop-control" value="Tìm kiếm..." oninput="updateBlockData('${nodeId}', 'placeholder', this.value)">
                </div>
                <div class="prop-group">
                    <label class="prop-label">Màu nút bấm</label>
                    <input type="color" class="prop-control" value="#333333" onchange="updateBlockData('${nodeId}', 'btnColor', this.value)">
                </div>`;
            break;

        default:
            html += `<div class="prop-empty">Linh kiện này chưa có tùy chỉnh chuyên sâu</div>`;
    }

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

/**
 * Hàm đổi màu linh kiện đang chọn (Demo tính năng chỉnh sửa)
 */
function updatePreviewColor(color) {
    const activeNode = document.querySelector('.node-dropped.is-active');
    if (activeNode) {
        activeNode.style.backgroundColor = color;
        // Sau này sẽ bổ sung logic đổi màu trên cả Live Preview
    }
}
/**
 * Hàm cập nhật dữ liệu và render lại Preview ngay lập tức
 */
function updateBlockData(nodeId, key, value) {
    if (!blockSettings[nodeId]) blockSettings[nodeId] = {};
    blockSettings[nodeId][key] = value;

    // Gọi hàm render lại preview để thấy thay đổi ngay lập tức
    updateLivePreview();
}