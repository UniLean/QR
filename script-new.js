// Khởi tạo biến global
let currentQRCode = null;
let logoImage = null;

// DOM elements
const urlInput = document.getElementById('url-input');
const sizeInput = document.getElementById('size-input');
const sizeValue = document.getElementById('size-value');
const errorLevel = document.getElementById('error-level');
const bgColor = document.getElementById('bg-color');
const bgColorText = document.getElementById('bg-color-text');
const fgColor = document.getElementById('fg-color');
const fgColorText = document.getElementById('fg-color-text');
const borderRadius = document.getElementById('border-radius');
const borderValue = document.getElementById('border-value');
const margin = document.getElementById('margin');
const marginValue = document.getElementById('margin-value');
const logoInput = document.getElementById('logo-input');
const fileInfo = document.getElementById('file-info');
const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const qrPreview = document.getElementById('qr-preview');
const qrInfo = document.getElementById('qr-info');

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateRangeValues();
    
    // Tạo QR code mẫu
    setTimeout(() => {
        urlInput.value = 'https://github.com';
        generateQRCode();
    }, 500);
});

// Khởi tạo các event listeners
function initializeEventListeners() {
    // Range sliders
    sizeInput.addEventListener('input', updateRangeValues);
    borderRadius.addEventListener('input', updateRangeValues);
    margin.addEventListener('input', updateRangeValues);
    
    // Color inputs
    bgColor.addEventListener('change', syncColorInputs);
    bgColorText.addEventListener('input', syncColorText);
    fgColor.addEventListener('change', syncColorInputs);
    fgColorText.addEventListener('input', syncColorText);
    
    // Form inputs
    urlInput.addEventListener('input', debounce(generateQRCode, 500));
    errorLevel.addEventListener('change', generateQRCode);
    sizeInput.addEventListener('input', debounce(generateQRCode, 300));
    borderRadius.addEventListener('input', debounce(generateQRCode, 300));
    margin.addEventListener('input', debounce(generateQRCode, 300));
    
    // Logo upload
    logoInput.addEventListener('change', handleLogoUpload);
    
    // Buttons
    generateBtn.addEventListener('click', generateQRCode);
    resetBtn.addEventListener('click', resetForm);
    downloadBtn.addEventListener('click', downloadQRCode);
}

// Cập nhật giá trị range sliders
function updateRangeValues() {
    sizeValue.textContent = sizeInput.value + 'px';
    borderValue.textContent = borderRadius.value + 'px';
    marginValue.textContent = margin.value;
}

// Đồng bộ color inputs
function syncColorInputs(e) {
    const colorInput = e.target;
    const textInput = colorInput.id === 'bg-color' ? bgColorText : fgColorText;
    textInput.value = colorInput.value;
    generateQRCode();
}

// Đồng bộ color text inputs
function syncColorText(e) {
    const textInput = e.target;
    const colorInput = textInput.id === 'bg-color-text' ? bgColor : fgColor;
    
    if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
        colorInput.value = textInput.value;
        generateQRCode();
    }
}

// Xử lý upload logo
function handleLogoUpload(e) {
    const file = e.target.files[0];
    
    if (!file) {
        logoImage = null;
        fileInfo.innerHTML = '';
        generateQRCode();
        return;
    }
    
    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn file hình ảnh', 'error');
        logoInput.value = '';
        return;
    }
    
    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB', 'error');
        logoInput.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            logoImage = img;
            fileInfo.innerHTML = `
                <div class="file-preview">
                    <img src="${e.target.result}" alt="Logo preview" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;">
                    <span>${file.name}</span>
                    <button type="button" class="remove-logo" onclick="removeLogo()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            generateQRCode();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Xóa logo
function removeLogo() {
    logoImage = null;
    logoInput.value = '';
    fileInfo.innerHTML = '';
    generateQRCode();
}

// Hàm tạo QR Code
function generateQRCode() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showPlaceholder();
        return;
    }
    
    // Hiển thị loading
    showLoading();
    
    try {
        // Tạo QR code với thư viện qrcode-generator
        const typeNumber = 0; // Tự động xác định type
        const errorCorrectionLevel = errorLevel.value;
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(url);
        qr.make();
        
        // Tạo canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const size = parseInt(sizeInput.value);
        const marginSize = parseInt(margin.value) * 4; // Nhân 4 để có margin tốt hơn
        const borderRadiusValue = parseInt(borderRadius.value);
        
        canvas.width = size;
        canvas.height = size;
        canvas.id = 'qr-canvas';
        
        // Vẽ nền
        ctx.fillStyle = bgColor.value;
        if (borderRadiusValue > 0) {
            drawRoundedRect(ctx, 0, 0, size, size, borderRadiusValue);
        } else {
            ctx.fillRect(0, 0, size, size);
        }
        
        // Vẽ các module QR
        const moduleCount = qr.getModuleCount();
        const cellSize = Math.floor((size - marginSize * 2) / moduleCount);
        const offsetX = (size - cellSize * moduleCount) / 2;
        const offsetY = (size - cellSize * moduleCount) / 2;
        
        ctx.fillStyle = fgColor.value;
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const x = offsetX + col * cellSize;
                    const y = offsetY + row * cellSize;
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
        
        // Vẽ logo nếu có
        if (logoImage) {
            const logoSize = size * 0.15; // Logo chiếm 15% kích thước QR
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            
            // Vẽ nền trắng cho logo
            ctx.fillStyle = '#ffffff';
            const padding = 8;
            ctx.fillRect(logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2);
            
            // Vẽ viền cho logo
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 2;
            ctx.strokeRect(logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2);
            
            // Vẽ logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }
        
        // Hiển thị QR code
        showQRCode(canvas, url);
        
    } catch (error) {
        console.error('Lỗi tạo QR code:', error);
        showNotification('Có lỗi xảy ra khi tạo mã QR. Vui lòng thử lại.', 'error');
        showPlaceholder();
    }
}

// Hàm vẽ hình chữ nhật bo góc
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Hiển thị loading
function showLoading() {
    qrPreview.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
            <p>Đang tạo mã QR...</p>
        </div>
    `;
}

// Hiển thị placeholder
function showPlaceholder() {
    qrPreview.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-qrcode"></i>
            <p>Mã QR sẽ hiển thị ở đây</p>
        </div>
    `;
    qrInfo.classList.add('hidden');
    downloadBtn.disabled = true;
    currentQRCode = null;
}

// Hiển thị QR code
function showQRCode(canvas, url) {
    qrPreview.innerHTML = '';
    qrPreview.appendChild(canvas);
    
    // Hiển thị thông tin QR
    updateQRInfo(url, canvas.width, errorLevel.value);
    
    // Enable download button
    downloadBtn.disabled = false;
    
    // Lưu QR code hiện tại
    currentQRCode = canvas;
}

// Cập nhật thông tin QR
function updateQRInfo(content, size, errorCorrection) {
    document.getElementById('info-content').textContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
    document.getElementById('info-size').textContent = size + 'x' + size + 'px';
    
    const errorLevels = {
        'L': 'Thấp (7%)',
        'M': 'Trung bình (15%)',
        'Q': 'Cao (25%)',
        'H': 'Rất cao (30%)'
    };
    document.getElementById('info-error').textContent = errorLevels[errorCorrection];
    
    qrInfo.classList.remove('hidden');
}

// Download QR code
function downloadQRCode() {
    if (!currentQRCode) {
        showNotification('Không có mã QR để tải xuống', 'error');
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = currentQRCode.toDataURL('image/png', 1.0);
        link.click();
        
        showNotification('Đã tải xuống thành công!', 'success');
    } catch (error) {
        console.error('Lỗi tải xuống:', error);
        showNotification('Có lỗi xảy ra khi tải xuống', 'error');
    }
}

// Reset form
function resetForm() {
    urlInput.value = '';
    sizeInput.value = 300;
    errorLevel.value = 'M';
    bgColor.value = '#ffffff';
    bgColorText.value = '#ffffff';
    fgColor.value = '#000000';
    fgColorText.value = '#000000';
    borderRadius.value = 0;
    margin.value = 4;
    logoInput.value = '';
    logoImage = null;
    fileInfo.innerHTML = '';
    
    updateRangeValues();
    showPlaceholder();
    
    showNotification('Đã đặt lại tất cả tùy chọn', 'success');
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Hiển thị với animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Hiển thị lỗi (deprecated, sử dụng showNotification thay thế)
function showError(message) {
    showNotification(message, 'error');
}
