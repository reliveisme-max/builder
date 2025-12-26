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
                // Thay thế icon bằng khối linh kiện có thể tương tác
                evt.item.innerHTML = `<div class="node-dropped" onclick="openProperties('${blockId}', this)">${blockId.toUpperCase()}</div>`;
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
   # HÀM ĐỒNG BỘ LIVE PREVIEW (CẬP NHẬT MỚI)
==========================================================================*/
function updateLivePreview() {
    // 1. Lấy vùng đích trên Preview
    const targetHeader = document.getElementById('header-render-target');
    if (!targetHeader) return;

    // 2. Thu thập dữ liệu từ các hàng Skeleton (Top, Main, Bottom)
    let rowsData = {};
    document.querySelectorAll('.header-row').forEach(row => {
        const rowType = row.getAttribute('data-label'); // Ví dụ: "Top Bar"
        rowsData[rowType] = [];

        // Lấy tất cả linh kiện trong các slot của hàng này
        row.querySelectorAll('.node-dropped').forEach(node => {
            rowsData[rowType].push(node.getAttribute('data-id'));
        });
    });

    // 3. Gửi dữ liệu về Server để lấy HTML render thật
    // Lưu ý: Tạm thời chúng ta sẽ render đơn giản, sau này có thể làm AJAX phức tạp hơn
    let previewHtml = `<div class="preview-header-wrapper">`;
    
    for (const [rowName, blocks] of Object.entries(rowsData)) {
        if (blocks.length > 0) {
            previewHtml += `<div class="preview-row-item"><strong>${rowName}:</strong> ${blocks.join(' | ')}</div>`;
        }
    }
    
    previewHtml += `</div>`;
    targetHeader.innerHTML = previewHtml;
}