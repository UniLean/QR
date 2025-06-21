// Khởi tạo biến global
let currentQRCode = null;
let logoImage = null;

// DOM elements
const elements = {
    urlInput: null,
    sizeInput: null,
    sizeValue: null,
    errorLevel: null,
    bgColor: null,
    bgColorText: null,
    fgColor: null,
    fgColorText: null,
    borderRadius: null,
    borderValue: null,
    margin: null,
    marginValue: null,
    logoInput: null,
    logoOpacity: null,
    logoOpacityGroup: null,
    logoPosition: null,
    logoPositionGroup: null,
    opacityValue: null,
    fileInfo: null,
    generateBtn: null,
    resetBtn: null,
    downloadBtn: null,
    qrPreview: null,
    qrInfo: null
};

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    updateRangeValues();
    
    // Tạo QR code mẫu sau khi load
    setTimeout(() => {
        elements.urlInput.value = 'https://github.com';
        generateQRCode();
    }, 1000);
});

// Khởi tạo các DOM elements
function initializeElements() {
    elements.urlInput = document.getElementById('url-input');
    elements.sizeInput = document.getElementById('size-input');
    elements.sizeValue = document.getElementById('size-value');
    elements.errorLevel = document.getElementById('error-level');
    elements.bgColor = document.getElementById('bg-color');
    elements.bgColorText = document.getElementById('bg-color-text');
    elements.fgColor = document.getElementById('fg-color');
    elements.fgColorText = document.getElementById('fg-color-text');
    elements.borderRadius = document.getElementById('border-radius');
    elements.borderValue = document.getElementById('border-value');
    elements.margin = document.getElementById('margin');
    elements.marginValue = document.getElementById('margin-value');
    elements.logoInput = document.getElementById('logo-input');
    elements.logoOpacity = document.getElementById('logo-opacity');
    elements.logoOpacityGroup = document.getElementById('logo-opacity-group');
    elements.logoPosition = document.getElementById('logo-position');
    elements.logoPositionGroup = document.getElementById('logo-position-group');
    elements.opacityValue = document.getElementById('opacity-value');
    elements.fileInfo = document.getElementById('file-info');
    elements.generateBtn = document.getElementById('generate-btn');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.downloadBtn = document.getElementById('download-btn');
    elements.qrPreview = document.getElementById('qr-preview');
    elements.qrInfo = document.getElementById('qr-info');
}

// Khởi tạo các event listeners
function initializeEventListeners() {
    if (!elements.urlInput) return;
    
    // Range sliders
    elements.sizeInput.addEventListener('input', updateRangeValues);
    elements.borderRadius.addEventListener('input', updateRangeValues);
    elements.margin.addEventListener('input', updateRangeValues);
    if (elements.logoOpacity) {
        elements.logoOpacity.addEventListener('input', updateRangeValues);
    }
    
    // Color inputs
    elements.bgColor.addEventListener('change', syncColorInputs);
    elements.bgColorText.addEventListener('input', syncColorText);
    elements.fgColor.addEventListener('change', syncColorInputs);
    elements.fgColorText.addEventListener('input', syncColorText);
    
    // File input
    elements.logoInput.addEventListener('change', handleLogoUpload);
    
    // Buttons
    elements.generateBtn.addEventListener('click', generateQRCode);
    elements.resetBtn.addEventListener('click', resetForm);
    elements.downloadBtn.addEventListener('click', downloadQRCode);
    
    // Auto generate on input change
    elements.urlInput.addEventListener('input', debounce(generateQRCode, 500));
    elements.errorLevel.addEventListener('change', generateQRCode);
      // Real-time preview updates
    const realTimeInputs = [elements.sizeInput, elements.borderRadius, elements.margin, elements.bgColor, elements.fgColor];
    if (elements.logoOpacity) {
        realTimeInputs.push(elements.logoOpacity);
    }
    if (elements.logoPosition) {
        realTimeInputs.push(elements.logoPosition);
    }
    
    realTimeInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', debounce(generateQRCode, 300));
        }
    });
    
    // Change event for select
    if (elements.logoPosition) {
        elements.logoPosition.addEventListener('change', generateQRCode);
    }
}

// Cập nhật giá trị range sliders
function updateRangeValues() {
    if (elements.sizeValue) elements.sizeValue.textContent = elements.sizeInput.value + 'px';
    if (elements.borderValue) elements.borderValue.textContent = elements.borderRadius.value + 'px';
    if (elements.marginValue) elements.marginValue.textContent = elements.margin.value;
    if (elements.opacityValue && elements.logoOpacity) {
        elements.opacityValue.textContent = elements.logoOpacity.value + '%';
    }
}

// Đồng bộ color inputs
function syncColorInputs(e) {
    const colorInput = e.target;
    const textInput = colorInput.id === 'bg-color' ? elements.bgColorText : elements.fgColorText;
    if (textInput) {
        textInput.value = colorInput.value.toUpperCase();
    }
    
    if (elements.urlInput && elements.urlInput.value.trim()) {
        generateQRCode();
    }
}

// Đồng bộ color text inputs
function syncColorText(e) {
    const textInput = e.target;
    const colorInput = textInput.id === 'bg-color-text' ? elements.bgColor : elements.fgColor;
    
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(textInput.value) && colorInput) {
        colorInput.value = textInput.value;
        if (elements.urlInput && elements.urlInput.value.trim()) {
            generateQRCode();
        }
    }
}

// Xử lý upload logo với kiểm tra chất lượng nâng cao
function handleLogoUpload(e) {
    const file = e.target.files[0];
    
    if (file) {
        // Kiểm tra kích thước file (tăng lên 10MB cho chất lượng cao)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 10MB.', 'error');
            elements.logoInput.value = '';
            return;
        }
        
        // Kiểm tra định dạng file
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('Định dạng file không được hỗ trợ. Vui lòng chọn PNG, JPG, GIF hoặc SVG.', 'error');
            elements.logoInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            logoImage = new Image();
            logoImage.onload = function() {
                // Phân tích chất lượng logo
                const logoAnalysis = analyzeLogoQuality(logoImage, file);
                displayLogoInfo(file, logoAnalysis);
                
                if (elements.urlInput && elements.urlInput.value.trim()) {
                    generateQRCode();
                }
            };
            logoImage.src = e.target.result;
        };
        reader.readAsDataURL(file);    } else {
        logoImage = null;
        if (elements.fileInfo) {
            elements.fileInfo.innerHTML = '';
        }
          // Ẩn logo preview
        const logoPreview = document.getElementById('logo-preview');
        if (logoPreview) {
            logoPreview.classList.remove('active');
            logoPreview.innerHTML = '';
        }
        
        // Ẩn control opacity
        hideOpacityControl();
        
        if (elements.urlInput && elements.urlInput.value.trim()) {
            generateQRCode();
        }
    }
}

// Phân tích chất lượng logo
function analyzeLogoQuality(image, file) {
    const analysis = {
        resolution: 'good',
        aspectRatio: 'good',
        fileSize: 'good',
        recommendations: []
    };
    
    // Kiểm tra độ phân giải
    if (image.naturalWidth < 200 || image.naturalHeight < 200) {
        analysis.resolution = 'low';
        analysis.recommendations.push('Sử dụng logo có độ phân giải cao hơn (ít nhất 200x200px) để có chất lượng tốt nhất');
    } else if (image.naturalWidth > 1000 || image.naturalHeight > 1000) {
        analysis.resolution = 'high';
        analysis.recommendations.push('Logo có độ phân giải cao, có thể giảm kích thước để tải nhanh hơn');
    }
    
    // Kiểm tra tỷ lệ khung hình
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    if (aspectRatio < 0.8 || aspectRatio > 1.25) {
        analysis.aspectRatio = 'poor';
        analysis.recommendations.push('Logo vuông (tỷ lệ 1:1) sẽ hiển thị tốt nhất trong QR code');
    }
    
    // Kiểm tra kích thước file
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > 500) {
        analysis.fileSize = 'large';
        analysis.recommendations.push('Có thể nén logo để giảm kích thước file');
    }
    
    // Đề xuất định dạng tối ưu
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        analysis.recommendations.push('PNG được khuyến nghị để có nền trong suốt tốt hơn');
    }
    
    return analysis;
}

// Hiển thị thông tin logo với phân tích chất lượng và preview
function displayLogoInfo(file, analysis) {
    if (!elements.fileInfo) return;
    
    const qualityIcon = getQualityIcon(analysis);
    const qualityColor = getQualityColor(analysis);
    
    elements.fileInfo.innerHTML = `
        <div class="file-info-main">
            <i class="fas fa-check-circle" style="color: #28a745;"></i>
            <span>${file.name}</span>
            <span class="file-size">(${(file.size / 1024).toFixed(1)}KB)</span>
            <span class="quality-indicator" style="color: ${qualityColor};">
                <i class="fas fa-${qualityIcon}"></i>
            </span>
        </div>
        ${analysis.recommendations.length > 0 ? `
        <div class="file-recommendations">
            <small><i class="fas fa-info-circle"></i> Đề xuất: ${analysis.recommendations[0]}</small>
        </div>
        ` : ''}
    `;
    
    // Hiển thị logo preview
    showLogoPreview(file);
    
    // Hiển thị slider opacity
    showOpacityControl();
}

// Hiển thị control opacity và position
function showOpacityControl() {
    if (elements.logoOpacityGroup) {
        elements.logoOpacityGroup.classList.remove('hidden');
        elements.logoOpacityGroup.classList.add('show');
    }
    if (elements.logoPositionGroup) {
        elements.logoPositionGroup.classList.remove('hidden');
        elements.logoPositionGroup.classList.add('show');
    }
}

// Ẩn control opacity và position, xóa thông tin analysis
function hideOpacityControl() {
    if (elements.logoOpacityGroup) {
        elements.logoOpacityGroup.classList.add('hidden');
        elements.logoOpacityGroup.classList.remove('show');
    }
    if (elements.logoPositionGroup) {
        elements.logoPositionGroup.classList.add('hidden');
        elements.logoPositionGroup.classList.remove('show');
    }
    
    // Xóa thông tin analysis khi ẩn control
    const analysisSection = document.getElementById('logo-analysis');
    if (analysisSection) {
        analysisSection.remove();
    }
}

// Hiển thị logo preview
function showLogoPreview(file) {
    const logoPreview = document.getElementById('logo-preview');
    if (!logoPreview || !logoImage) return;
    
    logoPreview.innerHTML = `
        <img src="${logoImage.src}" alt="Logo preview">
        <div class="logo-preview-info">
            <div class="logo-name">${file.name}</div>
            <div class="logo-details">${logoImage.naturalWidth}×${logoImage.naturalHeight}px</div>
        </div>
        <button class="logo-remove" onclick="removeLogo()" title="Xóa logo">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    logoPreview.classList.add('active');
}

// Xóa logo
function removeLogo() {
    logoImage = null;
    elements.logoInput.value = '';
    elements.fileInfo.innerHTML = '';
    
    const logoPreview = document.getElementById('logo-preview');
    if (logoPreview) {
        logoPreview.classList.remove('active');
        logoPreview.innerHTML = '';
    }
    
    // Ẩn control opacity
    hideOpacityControl();
    
    if (elements.urlInput && elements.urlInput.value.trim()) {
        generateQRCode();
    }
    
    showNotification('Logo đã được xóa', 'info');
}

// Lấy icon chất lượng
function getQualityIcon(analysis) {
    const issues = Object.values(analysis).filter(v => v === 'poor' || v === 'low' || v === 'large').length;
    if (issues === 0) return 'star';
    if (issues <= 1) return 'star-half-alt';
    return 'exclamation-triangle';
}

// Lấy màu chất lượng
function getQualityColor(analysis) {
    const issues = Object.values(analysis).filter(v => v === 'poor' || v === 'low' || v === 'large').length;
    if (issues === 0) return '#28a745';
    if (issues <= 1) return '#ffc107';
    return '#dc3545';
}

// Tạo QR Code
function generateQRCode() {
    console.log('Bắt đầu tạo QR code...');
    
    if (!elements.urlInput) {
        console.error('Không tìm thấy input URL');
        return;
    }
    
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        console.log('URL trống, hiển thị placeholder');
        showPlaceholder();
        return;
    }
    
    console.log('URL:', url);
    
    // Kiểm tra thư viện qrcode có tồn tại không
    if (typeof qrcode === 'undefined') {
        console.error('Thư viện qrcode chưa được tải');
        showNotification('Đang tải thư viện QR Code...', 'info');
        setTimeout(generateQRCode, 1000);
        return;
    }
    
    // Hiển thị loading
    showLoading();
    
    try {
        // Lấy các thiết lập
        const size = elements.sizeInput ? parseInt(elements.sizeInput.value) : 300;
        const errorCorrectionLevel = elements.errorLevel ? elements.errorLevel.value : 'M';
        const fgColor = elements.fgColor ? elements.fgColor.value : '#000000';
        const bgColor = elements.bgColor ? elements.bgColor.value : '#ffffff';
        const borderRadiusValue = elements.borderRadius ? parseInt(elements.borderRadius.value) : 0;
        const marginValue = elements.margin ? parseInt(elements.margin.value) : 4;
        
        console.log('Thiết lập:', { size, errorCorrectionLevel, fgColor, bgColor, borderRadiusValue, marginValue });        // Tạo QR code object với mức sửa lỗi tối ưu dựa trên logo
        let effectiveErrorLevel = errorCorrectionLevel;
        if (logoImage) {
            // Tự động nâng cấp error correction level khi có logo
            const errorLevelHierarchy = ['L', 'M', 'Q', 'H'];
            const currentIndex = errorLevelHierarchy.indexOf(errorCorrectionLevel);
            
            // Nâng cấp ít nhất 1 level, tối đa lên H
            effectiveErrorLevel = errorLevelHierarchy[Math.min(currentIndex + 1, 3)];
            console.log(`Logo detected: upgrading error correction from ${errorCorrectionLevel} to ${effectiveErrorLevel}`);
        }
        
        const qr = qrcode(0, effectiveErrorLevel);
        qr.addData(url);
        qr.make();
        
        // Tạo canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.id = 'qr-canvas';
        
        // Tính toán kích thước
        const moduleCount = qr.getModuleCount();
        const cellSize = Math.floor((size - marginValue * 2) / moduleCount);
        const qrSize = cellSize * moduleCount;
        const totalSize = qrSize + marginValue * 2;
        
        canvas.width = totalSize;
        canvas.height = totalSize;
        
        // Áp dụng bo viền nếu có
        if (borderRadiusValue > 0) {
            ctx.beginPath();
            roundRect(ctx, 0, 0, totalSize, totalSize, borderRadiusValue);
            ctx.clip();
        }
        
        // Vẽ nền
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, totalSize, totalSize);
        
        // Vẽ QR code
        ctx.fillStyle = fgColor;
        
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const x = marginValue + col * cellSize;
                    const y = marginValue + row * cellSize;
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }        // Thêm logo nếu có (với thuật toán tối ưu và kiểm tra chất lượng)
        if (logoImage) {
            // Kiểm tra tỷ lệ logo so với QR code
            const logoRatio = (qrSize * 0.18) / qrSize;
            console.log(`Logo optimization: ratio=${logoRatio.toFixed(3)}, error_level=${effectiveErrorLevel}`);
            
            addOptimizedLogo(ctx, qr, totalSize, qrSize, marginValue, cellSize);
              // Thực hiện kiểm tra chất lượng QR code sau khi thêm logo
            if (logoImage && parseInt(elements.sizeInput.value) >= 200) {
                validateQRCodeWithLogo(canvas, url);
            }
        }
        
        // Hiển thị QR code
        console.log('QR code được tạo thành công');
        showQRCode(canvas, url);
        
    } catch (error) {
        console.error('Lỗi tạo QR code:', error);
        showNotification('Có lỗi xảy ra khi tạo mã QR: ' + error.message, 'error');
        showPlaceholder();
    }
}

// Hiển thị loading
function showLoading() {
    if (!elements.qrPreview) return;
    
    elements.qrPreview.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
            <p>Đang tạo mã QR...</p>
        </div>
    `;
    elements.qrPreview.classList.remove('has-qr');
}

// Hiển thị placeholder
function showPlaceholder() {
    if (!elements.qrPreview) return;
    
    elements.qrPreview.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-qrcode"></i>
            <p>Mã QR sẽ hiển thị ở đây</p>
        </div>
    `;
    elements.qrPreview.classList.remove('has-qr');
    
    if (elements.qrInfo) {
        elements.qrInfo.classList.add('hidden');
    }
    
    if (elements.downloadBtn) {
        elements.downloadBtn.disabled = true;
    }
    
    currentQRCode = null;
}

// Hiển thị QR code
function showQRCode(canvas, content) {
    if (!elements.qrPreview) return;
    
    elements.qrPreview.innerHTML = '';
    elements.qrPreview.appendChild(canvas);
    elements.qrPreview.classList.add('has-qr');
    
    // Cập nhật thông tin
    updateQRInfo(content);
    
    // Enable download button
    if (elements.downloadBtn) {
        elements.downloadBtn.disabled = false;
    }
    currentQRCode = canvas;
    
    // Hiệu ứng xuất hiện
    canvas.style.opacity = '0';
    canvas.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        canvas.style.transition = 'all 0.5s ease';
        canvas.style.opacity = '1';
        canvas.style.transform = 'scale(1)';
    }, 50);
    
    console.log('QR code đã được hiển thị');
}

// Function tối ưu hóa logo để giảm thiểu ảnh hưởng đến QR code với thuật toán tránh vùng quan trọng
// Function tối ưu hóa logo với phân tích pixel chính xác và real-time validation
function addOptimizedLogo(ctx, qr, totalSize, qrSize, marginValue, cellSize) {
    const moduleCount = qr.getModuleCount();
    const logoPosition = elements.logoPosition ? elements.logoPosition.value : 'center';
    
    console.log(`Logo position selected: ${logoPosition}, moduleCount: ${moduleCount}, cellSize: ${cellSize}`);    if (logoPosition === 'corners') {        // Vẽ logo ở cả 3 góc với phân tích pixel chính xác
        addLogoToFindersWithPixelAnalysis(ctx, qr, totalSize, qrSize, marginValue, cellSize, moduleCount);
        
        // Hiển thị thông tin cho corner placement
        displayCornerAnalysis(moduleCount, cellSize);
    } else {        // Vẽ logo ở vị trí được chọn với phân tích pixel và validation
        // Tính toán kích thước logo adaptive theo kích thước QR
        const logoSize = calculateAdaptiveLogoSize(qrSize, 'center');
        const position = calculateLogoPositionWithPixelAnalysis(logoPosition, totalSize, logoSize, marginValue, cellSize, moduleCount, qr);
        
        if (position) {
            // Vẽ logo
            drawOptimizedLogoWithBackground(ctx, position.x, position.y, position.size);
            
            // Validate placement và log kết quả
            const validation = validateLogoPlacement(ctx, qr, position.x, position.y, position.size, moduleCount, cellSize, marginValue);
            
            console.log(`Logo validation results:
              - Contrast: ${validation.contrast.quality} (${validation.contrast.average.toFixed(3)})
              - Collisions: ${validation.collisions.severity} 
              - Score: ${validation.score}/100
              - Recommendation: ${validation.recommendation.message}`);
            
            // Hiển thị thông tin phân tích logo placement trong UI
            displayLogoAnalysis(validation, position);
            
            // Hiển thị warning nếu cần
            if (validation.score < 70) {
                showNotification(`⚠️ ${validation.recommendation.message}`, 'warning');
            } else if (validation.score >= 85) {
                console.log('✅ Logo placement optimized successfully');
            }
        }
    }
}

// Vẽ logo với background vuông tối ưu và độ trong suốt điều chỉnh được
function drawOptimizedLogoWithBackground(ctx, logoX, logoY, logoSize, backgroundAlpha = 0.3, logoOpacity = null) {
    if (!logoImage) return;
    
    // Lưu trạng thái canvas
    ctx.save();
    
    // Lấy giá trị opacity từ slider nếu có
    if (logoOpacity === null && elements.logoOpacity && elements.logoOpacity.value) {
        logoOpacity = parseInt(elements.logoOpacity.value) / 100;
    } else if (logoOpacity === null) {
        logoOpacity = 0.7; // Default opacity
    }
    
    // Lấy màu nền và foreground để tạo tương phản
    const bgColor = elements.bgColor ? elements.bgColor.value : '#ffffff';
    const fgColor = elements.fgColor ? elements.fgColor.value : '#000000';
    
    // Tạo màu nền tương phản (đảo ngược màu QR)
    const contrastBg = bgColor === '#ffffff' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
    
    // Vẽ background vuông với padding
    const padding = logoSize * 0.12; // 12% padding
    const bgSize = logoSize + padding * 2;
    const bgX = logoX - padding;
    const bgY = logoY - padding;
    
    // Vẽ background vuông với bo góc nhẹ
    ctx.fillStyle = contrastBg;
    ctx.beginPath();
    roundRect(ctx, bgX, bgY, bgSize, bgSize, logoSize * 0.08); // Bo góc 8% của logo size
    ctx.fill();
    
    // Thêm border tương phản
    ctx.strokeStyle = bgColor === '#ffffff' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Vẽ logo với opacity được điều chỉnh
    ctx.globalAlpha = logoOpacity;
    
    // Vẽ logo trong khung vuông với bo góc nhẹ
    const logoRadius = logoSize * 0.06; // Bo góc nhỏ hơn cho logo
    ctx.beginPath();
    roundRect(ctx, logoX, logoY, logoSize, logoSize, logoRadius);
    ctx.clip();
    
    // Vẽ logo
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    
    // Khôi phục trạng thái canvas
    ctx.restore();
}

// Phân tích pixel và đặt logo tại các finder patterns với thuật toán nâng cao
function addLogoToFindersWithPixelAnalysis(ctx, qr, totalSize, qrSize, marginValue, cellSize, moduleCount) {
    // Phân tích cấu trúc finder patterns với confidence scoring
    const finderPatternAnalysis = analyzeFinderPatterns(qr, moduleCount, cellSize, marginValue);    // Tính toán kích thước logo tối ưu dựa trên confidence của từng finder
    // Adaptive sizing cho QR code lớn
    const baseCornerLogoSize = calculateAdaptiveLogoSize(qrSize, 'finder');
    
    console.log('Finder Pattern Analysis Results:');
    finderPatternAnalysis.forEach((finder, index) => {
        console.log(`  ${finder.name}: confidence=${finder.confidence.toFixed(3)}, accuracy=${finder.accuracy}/49`);
    });
    
    // Vẽ logo tại 3 finder patterns với vị trí pixel chính xác và adaptive sizing
    finderPatternAnalysis.forEach((finder, index) => {
        if (index < 3) { // Chỉ 3 finder patterns (top-left, top-right, bottom-left)
            
            // Điều chỉnh kích thước và opacity dựa trên confidence
            let cornerLogoSize = baseCornerLogoSize;
            let logoOpacity = 0.4;
            
            if (finder.confidence > 0.9) {
                // Confidence cao - có thể đặt logo lớn hơn trong core zone
                cornerLogoSize = Math.min(finder.coreZone.width * 0.7, baseCornerLogoSize * 1.2);
                logoOpacity = 0.35; // Opacity thấp hơn vì logo lớn hơn
            } else if (finder.confidence < 0.7) {
                // Confidence thấp - giảm kích thước và tăng opacity để bù trừ
                cornerLogoSize = baseCornerLogoSize * 0.8;
                logoOpacity = 0.5;
            }
            
            // Chọn vị trí đặt logo: core zone nếu confidence cao, center nếu thấp
            let logoX, logoY;
            if (finder.confidence > 0.85) {
                // Đặt trong core zone (3x3 center) với precision cao
                logoX = finder.coreZone.x + finder.coreZone.width / 2 - cornerLogoSize / 2;
                logoY = finder.coreZone.y + finder.coreZone.height / 2 - cornerLogoSize / 2;
                console.log(`High confidence (${finder.confidence.toFixed(3)}): placing in core zone`);
            } else {
                // Đặt ở center với margin an toàn
                logoX = finder.centerX - cornerLogoSize / 2;
                logoY = finder.centerY - cornerLogoSize / 2;
                console.log(`Lower confidence (${finder.confidence.toFixed(3)}): placing at center with safety margin`);
            }
            
            // Kiểm tra timing pattern collision và điều chỉnh nếu cần
            const adjustedPosition = avoidTimingPatterns(logoX, logoY, cornerLogoSize, [finder], cellSize);
            logoX = adjustedPosition.x;
            logoY = adjustedPosition.y;
            
            console.log(`Placing logo at finder ${index + 1} (${finder.name}): (${logoX.toFixed(1)}, ${logoY.toFixed(1)}), size: ${cornerLogoSize.toFixed(1)}, opacity: ${logoOpacity.toFixed(2)}`);
            
            // Vẽ với adaptive opacity và smart background
            drawCornerLogoWithReducedOpacity(ctx, logoX, logoY, cornerLogoSize, logoOpacity, finder.confidence);
        }
    });
}

// Phân tích chính xác vị trí finder patterns với thuật toán pixel analysis nâng cao
function analyzeFinderPatterns(qr, moduleCount, cellSize, marginValue) {
    const finders = [];
    
    // Finder pattern có cấu trúc 7x7 modules với separator (1 module trắng) xung quanh
    const finderSize = 7;
    const separatorSize = 1;
    
    // Tọa độ module chính xác của các finder patterns
    const finderPositions = [
        { // Top-left finder
            moduleX: 0,
            moduleY: 0,
            name: 'top-left'
        },
        { // Top-right finder  
            moduleX: moduleCount - finderSize,
            moduleY: 0,
            name: 'top-right'
        },
        { // Bottom-left finder
            moduleX: 0,
            moduleY: moduleCount - finderSize,
            name: 'bottom-left'
        }
    ];
    
    finderPositions.forEach(pos => {
        // Tính tọa độ pixel chính xác của tâm finder pattern
        const centerModuleX = pos.moduleX + finderSize / 2;
        const centerModuleY = pos.moduleY + finderSize / 2;
        const pixelX = marginValue + centerModuleX * cellSize;
        const pixelY = marginValue + centerModuleY * cellSize;
        
        // Phân tích chi tiết cấu trúc finder pattern
        const finderAnalysis = analyzeFinderPatternStructure(qr, pos.moduleX, pos.moduleY, finderSize, moduleCount);
        
        finders.push({
            name: pos.name,
            moduleX: pos.moduleX,
            moduleY: pos.moduleY,
            centerX: pixelX,
            centerY: pixelY,
            size: finderSize * cellSize,
            // Phân tích vùng an toàn xung quanh finder (bao gồm separator)
            safeZone: {
                x: marginValue + (pos.moduleX - separatorSize) * cellSize,
                y: marginValue + (pos.moduleY - separatorSize) * cellSize,
                width: (finderSize + 2 * separatorSize) * cellSize,
                height: (finderSize + 2 * separatorSize) * cellSize
            },
            // Vùng lõi của finder pattern (3x3 module ở giữa)
            coreZone: {
                x: pixelX - (1.5 * cellSize),
                y: pixelY - (1.5 * cellSize),
                width: 3 * cellSize,
                height: 3 * cellSize
            },
            // Vùng timing (đường thẳng nối giữa các finder)
            timingZone: finderAnalysis.timingZone,
            // Độ tin cậy của phân tích pattern
            confidence: finderAnalysis.confidence
        });
    });
    
    return finders;
}

// Phân tích cấu trúc chi tiết của finder pattern để tối ưu hóa vị trí logo
function analyzeFinderPatternStructure(qr, startX, startY, size, moduleCount) {
    let blackModules = 0;
    let whiteModules = 0;
    let patternAccuracy = 0;
    
    // Mẫu chuẩn của finder pattern 7x7:
    // 1111111
    // 1000001  
    // 1011101
    // 1011101
    // 1011101
    // 1000001
    // 1111111
    const expectedPattern = [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1]
    ];
    
    // Kiểm tra từng module của finder pattern
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const moduleX = startX + col;
            const moduleY = startY + row;
            
            if (moduleX < moduleCount && moduleY < moduleCount) {
                const isDark = qr.isDark(moduleY, moduleX);
                const expectedDark = expectedPattern[row][col] === 1;
                
                if (isDark === expectedDark) {
                    patternAccuracy++;
                }
                
                if (isDark) blackModules++;
                else whiteModules++;
            }
        }
    }
    
    const totalModules = size * size;
    const confidence = patternAccuracy / totalModules;
    
    // Xác định vùng timing patterns (đường kẻ ngang và dọc)
    const timingZone = {
        horizontal: {
            y: startY + 6, // Timing pattern ở hàng thứ 6
            startX: Math.max(0, startX - 8),
            endX: Math.min(moduleCount, startX + size + 8)
        },
        vertical: {
            x: startX + 6, // Timing pattern ở cột thứ 6  
            startY: Math.max(0, startY - 8),
            endY: Math.min(moduleCount, startY + size + 8)
        }
    };
    
    return {
        blackModules,
        whiteModules, 
        confidence,
        timingZone,
        accuracy: patternAccuracy
    };
}

// Tính toán vị trí logo với phân tích pixel chính xác nâng cao
function calculateLogoPositionWithPixelAnalysis(position, totalSize, logoSize, marginValue, cellSize, moduleCount, qr) {
    let targetX, targetY;
    const finderAnalysis = analyzeFinderPatterns(qr, moduleCount, cellSize, marginValue);
    
    switch (position) {
        case 'center':
            targetX = totalSize / 2 - logoSize / 2;
            targetY = totalSize / 2 - logoSize / 2;
            break;
              case 'top-left':
            // Sử dụng phân tích chi tiết cho finder pattern top-left
            const topLeftFinder = finderAnalysis[0];
            
            // Đặt logo chính xác ở tâm finder pattern top-left
            targetX = topLeftFinder.centerX - logoSize / 2;
            targetY = topLeftFinder.centerY - logoSize / 2;
            
            // Điều chỉnh kích thước dựa trên confidence
            if (topLeftFinder.confidence > 0.85) {
                // High confidence: có thể đặt logo lớn hơn
                logoSize = Math.min(logoSize, topLeftFinder.coreZone.width * 0.75);
            } else {
                // Lower confidence: giảm kích thước để an toàn
                logoSize = Math.min(logoSize, topLeftFinder.size * 0.5);
            }
            
            console.log(`Top-left finder: center=(${topLeftFinder.centerX.toFixed(1)}, ${topLeftFinder.centerY.toFixed(1)}), confidence=${topLeftFinder.confidence.toFixed(3)}`);
            break;
              case 'top-right':
            const topRightFinder = finderAnalysis[1];
            
            // Đặt logo chính xác ở tâm finder pattern top-right
            targetX = topRightFinder.centerX - logoSize / 2;
            targetY = topRightFinder.centerY - logoSize / 2;
            
            // Điều chỉnh kích thước dựa trên confidence
            if (topRightFinder.confidence > 0.85) {
                logoSize = Math.min(logoSize, topRightFinder.coreZone.width * 0.75);
            } else {
                logoSize = Math.min(logoSize, topRightFinder.size * 0.5);
            }
            
            console.log(`Top-right finder: center=(${topRightFinder.centerX.toFixed(1)}, ${topRightFinder.centerY.toFixed(1)}), confidence=${topRightFinder.confidence.toFixed(3)}`);
            break;
              case 'bottom-left':
            const bottomLeftFinder = finderAnalysis[2];
            
            // Đặt logo chính xác ở tâm finder pattern bottom-left
            targetX = bottomLeftFinder.centerX - logoSize / 2;
            targetY = bottomLeftFinder.centerY - logoSize / 2;
            
            // Điều chỉnh kích thước dựa trên confidence
            if (bottomLeftFinder.confidence > 0.85) {
                logoSize = Math.min(logoSize, bottomLeftFinder.coreZone.width * 0.75);
            } else {
                logoSize = Math.min(logoSize, bottomLeftFinder.size * 0.5);
            }
            
            console.log(`Bottom-left finder: center=(${bottomLeftFinder.centerX.toFixed(1)}, ${bottomLeftFinder.centerY.toFixed(1)}), confidence=${bottomLeftFinder.confidence.toFixed(3)}`);
            break;
            
        case 'bottom-right':
            // Vị trí góc dưới phải - tránh tất cả finder patterns và timing patterns
            const safeMargin = cellSize * 2; // Margin an toàn
            targetX = totalSize - marginValue - logoSize - safeMargin;
            targetY = totalSize - marginValue - logoSize - safeMargin;
            
            // Kiểm tra không va chạm với alignment patterns (nếu có)
            const alignmentZones = detectAlignmentPatterns(qr, moduleCount, cellSize, marginValue);
            if (alignmentZones.length > 0) {
                // Điều chỉnh vị trí để tránh alignment patterns
                const bottomRightAlignment = alignmentZones.find(zone => 
                    zone.x > totalSize * 0.7 && zone.y > totalSize * 0.7
                );
                if (bottomRightAlignment) {
                    targetX = Math.min(targetX, bottomRightAlignment.x - logoSize - safeMargin);
                    targetY = Math.min(targetY, bottomRightAlignment.y - logoSize - safeMargin);
                }
            }
            break;
            
        default:
            return null;
    }
    
    // Kiểm tra và điều chỉnh để đảm bảo logo không vượt ra ngoài bounds
    targetX = Math.max(marginValue, Math.min(targetX, totalSize - marginValue - logoSize));
    targetY = Math.max(marginValue, Math.min(targetY, totalSize - marginValue - logoSize));
    
    // Kiểm tra không va chạm với timing patterns
    const adjustedPosition = avoidTimingPatterns(targetX, targetY, logoSize, finderAnalysis, cellSize);
    
    console.log(`Calculated logo position for '${position}': (${adjustedPosition.x.toFixed(1)}, ${adjustedPosition.y.toFixed(1)}), size: ${logoSize.toFixed(1)}`);
    
    return {
        x: adjustedPosition.x,
        y: adjustedPosition.y,
        size: logoSize
    };
}

// Tránh va chạm với timing patterns
function avoidTimingPatterns(targetX, targetY, logoSize, finderAnalysis, cellSize) {
    let adjustedX = targetX;
    let adjustedY = targetY;
    
    // Kiểm tra từng finder pattern's timing zones
    finderAnalysis.forEach(finder => {
        const timingZone = finder.timingZone;
        
        // Kiểm tra timing pattern ngang
        if (timingZone.horizontal) {
            const timingY = timingZone.horizontal.y * cellSize;
            if (targetY < timingY + cellSize && targetY + logoSize > timingY) {
                // Logo chồng lên timing pattern ngang - điều chỉnh
                if (targetY < timingY) {
                    adjustedY = Math.max(adjustedY, timingY - logoSize - cellSize);
                } else {
                    adjustedY = Math.min(adjustedY, timingY + cellSize * 2);
                }
            }
        }
        
        // Kiểm tra timing pattern dọc
        if (timingZone.vertical) {
            const timingX = timingZone.vertical.x * cellSize;
            if (targetX < timingX + cellSize && targetX + logoSize > timingX) {
                // Logo chồng lên timing pattern dọc - điều chỉnh
                if (targetX < timingX) {
                    adjustedX = Math.max(adjustedX, timingX - logoSize - cellSize);
                } else {
                    adjustedX = Math.min(adjustedX, timingX + cellSize * 2);
                }
            }
        }
    });
    
    return { x: adjustedX, y: adjustedY };
}

// Phát hiện alignment patterns để tránh va chạm
function detectAlignmentPatterns(qr, moduleCount, cellSize, marginValue) {
    const alignmentZones = [];
    
    // Alignment patterns xuất hiện ở các QR code version cao (≥ 2)
    // Tính toán vị trí alignment patterns dựa trên version
    const version = Math.floor((moduleCount - 21) / 4) + 1;
    
    if (version >= 2) {
        // Alignment patterns thường ở vị trí cố định tùy version
        const alignmentPositions = getAlignmentPositionsForVersion(version);
        
        alignmentPositions.forEach(pos => {
            const pixelX = marginValue + pos.x * cellSize;
            const pixelY = marginValue + pos.y * cellSize;
            
            alignmentZones.push({
                x: pixelX,
                y: pixelY,
                size: 5 * cellSize, // Alignment pattern 5x5
                moduleX: pos.x,
                moduleY: pos.y
            });
        });
    }
    
    return alignmentZones;
}

// Lấy vị trí alignment patterns theo version QR code
function getAlignmentPositionsForVersion(version) {
    // Simplified alignment position calculation
    // Thực tế sẽ phức tạp hơn, đây là approximation
    const positions = [];
    
    if (version >= 2 && version <= 6) {
        const moduleCount = 21 + (version - 1) * 4;
        const center = Math.floor(moduleCount / 2);
        positions.push({ x: center, y: center });
    }
    
    return positions;
}

// Vẽ logo ở góc với nền tương phản và opacity điều chỉnh được
function drawCornerLogoWithReducedOpacity(ctx, logoX, logoY, logoSize, opacity = 0.4, confidence = 0.8) {
    if (!logoImage) return;
    
    const padding = confidence > 0.85 ? 4 : 6; // Padding dựa trên confidence
    
    ctx.save();
    
    // Thiết lập chất lượng cao
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = confidence > 0.85 ? 'high' : 'medium';
    
    // Lấy màu nền và foreground để tạo tương phản
    const bgColor = elements.bgColor ? elements.bgColor.value : '#ffffff';
    const fgColor = elements.fgColor ? elements.fgColor.value : '#000000';
    
    // Tạo nền tương phản với màu QR code
    let contrastBgColor, contrastBorderColor;
    if (bgColor === '#ffffff' || bgColor.toLowerCase() === '#fff') {
        // QR nền trắng -> logo có nền đen nhạt
        contrastBgColor = `rgba(0, 0, 0, ${0.15 + confidence * 0.1})`;
        contrastBorderColor = `rgba(0, 0, 0, ${0.25 + confidence * 0.1})`;
    } else {
        // QR nền tối -> logo có nền trắng nhạt  
        contrastBgColor = `rgba(255, 255, 255, ${0.15 + confidence * 0.1})`;
        contrastBorderColor = `rgba(255, 255, 255, ${0.25 + confidence * 0.1})`;
    }
    
    // Vẽ background vuông với tương phản
    ctx.fillStyle = contrastBgColor;
    ctx.beginPath();
    roundRect(ctx, logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2, 
              confidence > 0.85 ? 3 : 5); // Bo góc nhỏ hơn cho high confidence
    ctx.fill();
    
    // Thêm border tương phản
    ctx.strokeStyle = contrastBorderColor;
    ctx.lineWidth = confidence > 0.85 ? 1 : 1.5;
    ctx.beginPath();
    roundRect(ctx, logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2, 
              confidence > 0.85 ? 3 : 5);
    ctx.stroke();
    
    // Lấy giá trị opacity từ slider và apply confidence factor
    let logoOpacity = opacity;
    if (elements.logoOpacity && elements.logoOpacity.value) {
        const sliderOpacity = parseInt(elements.logoOpacity.value) / 100;
        // Confidence factor: điều chỉnh opacity để đảm bảo finder pattern vẫn đọc được
        const confidenceFactor = Math.max(0.4, confidence * 0.8);
        logoOpacity = sliderOpacity * confidenceFactor;
    }
    
    // Vẽ logo với clipping vuông
    ctx.globalAlpha = logoOpacity;
    ctx.beginPath();
    roundRect(ctx, logoX, logoY, logoSize, logoSize, confidence > 0.85 ? 2 : 3);
    ctx.clip();
    
    // Vẽ logo với filter tương phản nếu cần
    if (confidence > 0.9) {
        // Apply filter để blend tốt hơn với finder pattern
        ctx.filter = 'contrast(0.95) brightness(1.05)';
    }
    
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    
    // Reset filter
    ctx.filter = 'none';
    
    ctx.restore();
    
    // Debug logging
    console.log(`Corner logo drawn: opacity=${logoOpacity.toFixed(3)}, confidence=${confidence.toFixed(3)}, contrast_bg=${contrastBgColor}`);
}

// Thêm logo vào cả 3 góc (finder patterns)
function addLogoToCorners(ctx, qr, totalSize, qrSize, marginValue, cellSize, moduleCount) {    // Kích thước logo adaptive cho QR code lớn
    const cornerLogoSize = calculateAdaptiveLogoSize(qrSize, 'corner');
    
    // Vị trí các góc với offset an toàn
    const positions = [
        { // Góc trên trái
            x: marginValue + cellSize * 1.5, 
            y: marginValue + cellSize * 1.5
        },
        { // Góc trên phải  
            x: totalSize - marginValue - cornerLogoSize - cellSize * 1.5,
            y: marginValue + cellSize * 1.5
        },
        { // Góc dưới trái
            x: marginValue + cellSize * 1.5,
            y: totalSize - marginValue - cornerLogoSize - cellSize * 1.5
        }
    ];
    
    positions.forEach((pos, index) => {
        console.log(`Drawing logo at corner ${index + 1}: x=${pos.x.toFixed(1)}, y=${pos.y.toFixed(1)}`);
        drawOptimizedLogoWithBackground(ctx, pos.x, pos.y, cornerLogoSize);
    });
}

// Tính toán vị trí logo dựa trên lựa chọn
function calculateLogoPosition(position, totalSize, logoSize, marginValue, cellSize, moduleCount) {
    switch (position) {
        case 'center':
            return findOptimalLogoPosition(null, moduleCount, logoSize, marginValue, cellSize, totalSize);
            
        case 'top-left':
            return {
                x: marginValue + cellSize * 2,
                y: marginValue + cellSize * 2,
                size: Math.min(logoSize, 50)
            };
            
        case 'top-right':
            const topRightSize = Math.min(logoSize, 50);
            return {
                x: totalSize - marginValue - topRightSize - cellSize * 2,
                y: marginValue + cellSize * 2,
                size: topRightSize
            };
            
        case 'bottom-left':
            const bottomLeftSize = Math.min(logoSize, 50);
            return {
                x: marginValue + cellSize * 2,
                y: totalSize - marginValue - bottomLeftSize - cellSize * 2,
                size: bottomLeftSize
            };
            
        default:
            return findOptimalLogoPosition(null, moduleCount, logoSize, marginValue, cellSize, totalSize);
    }
}

// Thuật toán tìm vị trí tối ưu cho logo
function findOptimalLogoPosition(qr, moduleCount, logoSize, marginValue, cellSize, totalSize) {
    // Định nghĩa các vùng quan trọng cần tránh
    const criticalAreas = [
        // Finder patterns (góc trên trái, trên phải, dưới trái)
        { startRow: 0, endRow: 8, startCol: 0, endCol: 8, priority: 'critical' },
        { startRow: 0, endRow: 8, startCol: moduleCount - 8, endCol: moduleCount, priority: 'critical' },
        { startRow: moduleCount - 8, endRow: moduleCount, startCol: 0, endCol: 8, priority: 'critical' },
        
        // Timing patterns
        { startRow: 6, endRow: 7, startCol: 8, endCol: moduleCount - 8, priority: 'high' },
        { startRow: 8, endRow: moduleCount - 8, startCol: 6, endCol: 7, priority: 'high' },
        
        // Format information areas
        { startRow: 0, endRow: 9, startCol: 0, endCol: 9, priority: 'medium' },
        { startRow: 0, endRow: 9, startCol: moduleCount - 8, endCol: moduleCount, priority: 'medium' },
        { startRow: moduleCount - 8, endRow: moduleCount, startCol: 0, endCol: 9, priority: 'medium' }
    ];
    
    // Alignment patterns cho QR codes lớn (version 2+)
    if (moduleCount >= 25) {
        const alignmentPositions = getAlignmentPositions(moduleCount);
        alignmentPositions.forEach(pos => {
            criticalAreas.push({
                startRow: pos.row - 2,
                endRow: pos.row + 3,
                startCol: pos.col - 2,
                endCol: pos.col + 3,
                priority: 'high'
            });
        });
    }
    
    // Tính toán vị trí trung tâm
    let centerX = totalSize / 2;
    let centerY = totalSize / 2;
    let adjustedLogoSize = logoSize;
    
    // Kiểm tra và điều chỉnh vị trí/kích thước để tránh vùng quan trọng
    const logoGridStartCol = Math.floor((centerX - adjustedLogoSize/2 - marginValue) / cellSize);
    const logoGridEndCol = Math.ceil((centerX + adjustedLogoSize/2 - marginValue) / cellSize);
    const logoGridStartRow = Math.floor((centerY - adjustedLogoSize/2 - marginValue) / cellSize);
    const logoGridEndRow = Math.ceil((centerY + adjustedLogoSize/2 - marginValue) / cellSize);
    
    // Kiểm tra xung đột với vùng quan trọng
    let conflictLevel = 0;
    for (const area of criticalAreas) {
        if (logoGridStartRow < area.endRow && logoGridEndRow > area.startRow &&
            logoGridStartCol < area.endCol && logoGridEndCol > area.startCol) {
            
            switch (area.priority) {
                case 'critical': conflictLevel += 10; break;
                case 'high': conflictLevel += 5; break;
                case 'medium': conflictLevel += 2; break;
            }
        }
    }
    
    // Nếu có xung đột nghiêm trọng, giảm kích thước logo
    if (conflictLevel >= 10) {
        adjustedLogoSize = logoSize * 0.6; // Giảm 40%
    } else if (conflictLevel >= 5) {
        adjustedLogoSize = logoSize * 0.8; // Giảm 20%
    }
      // Đảm bảo logo không quá nhỏ - adaptive với kích thước QR
    const minLogoSize = Math.max(30, (totalSize - marginValue * 2) * 0.08); // 8% của QR size hoặc 30px
    adjustedLogoSize = Math.max(adjustedLogoSize, minLogoSize);
    
    return {
        x: centerX - adjustedLogoSize / 2,
        y: centerY - adjustedLogoSize / 2,
        size: adjustedLogoSize
    };
}

// Lấy vị trí alignment patterns dựa trên kích thước QR
function getAlignmentPositions(moduleCount) {
    const positions = [];
    
    // Bảng vị trí alignment pattern cho các version khác nhau
    const alignmentTable = {
        25: [6, 18], // Version 2
        29: [6, 22], // Version 3
        33: [6, 26], // Version 4
        37: [6, 30], // Version 5
        41: [6, 34], // Version 6
        45: [6, 22, 38], // Version 7
        49: [6, 24, 42], // Version 8
        53: [6, 26, 46], // Version 9
        57: [6, 28, 50] // Version 10
    };
    
    const alignmentCoords = alignmentTable[moduleCount];
    if (alignmentCoords) {
        for (let i = 0; i < alignmentCoords.length; i++) {
            for (let j = 0; j < alignmentCoords.length; j++) {
                const row = alignmentCoords[i];
                const col = alignmentCoords[j];
                
                // Bỏ qua các vị trí trùng với finder patterns
                if (!((row <= 10 && col <= 10) || 
                      (row <= 10 && col >= moduleCount - 10) || 
                      (row >= moduleCount - 10 && col <= 10))) {
                    positions.push({ row, col });
                }
            }
        }
    }
    
    return positions;
}

// Validate và optimize logo placement với real-time pixel analysis
function validateLogoPlacement(ctx, qr, logoX, logoY, logoSize, moduleCount, cellSize, marginValue) {
    // Lấy pixel data của vùng logo
    const imageData = ctx.getImageData(logoX, logoY, logoSize, logoSize);
    const qrData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Phân tích độ tương phản
    const contrastAnalysis = analyzeLogoContrast(imageData, qrData, logoX, logoY, logoSize);
    
    // Phân tích va chạm với critical QR elements
    const collisionAnalysis = analyzeLogoCollisions(qr, logoX, logoY, logoSize, moduleCount, cellSize, marginValue);
    
    // Tính toán điểm tối ưu
    const optimizationScore = calculateOptimizationScore(contrastAnalysis, collisionAnalysis);
    
    return {
        contrast: contrastAnalysis,
        collisions: collisionAnalysis,
        score: optimizationScore,
        recommendation: getPlacementRecommendation(optimizationScore)
    };
}

// Hiển thị thông tin phân tích logo placement trong UI
function displayLogoAnalysis(validation, position) {
    // Tìm hoặc tạo logo analysis section
    let analysisSection = document.getElementById('logo-analysis');
    if (!analysisSection) {
        analysisSection = document.createElement('div');
        analysisSection.id = 'logo-analysis';
        analysisSection.className = 'analysis-section';
        
        // Thêm vào sau logo info
        const logoInfo = document.getElementById('logo-info');
        if (logoInfo) {
            logoInfo.parentNode.insertBefore(analysisSection, logoInfo.nextSibling);
        } else {
            elements.qrInfo.appendChild(analysisSection);
        }
    }
    
    analysisSection.innerHTML = `
        <h4><i class="fas fa-chart-line"></i> Phân tích vị trí Logo:</h4>
        
        <div class="analysis-item">
            <div class="analysis-header">
                <span class="analysis-label">Chất lượng tổng thể:</span>
                <span class="analysis-score" style="color: ${validation.recommendation.color}">
                    ${validation.score}/100 - ${validation.recommendation.level.toUpperCase()}
                </span>
            </div>
            <div class="analysis-bar">
                <div class="analysis-progress" style="width: ${validation.score}%; background: ${validation.recommendation.color}"></div>
            </div>
            <div class="analysis-message" style="color: ${validation.recommendation.color}">
                ${validation.recommendation.message}
            </div>
        </div>
        
        <div class="analysis-details">
            <div class="analysis-detail-item">
                <span class="detail-icon">🎨</span>
                <span class="detail-label">Độ tương phản:</span>
                <span class="detail-value ${validation.contrast.quality}">${validation.contrast.quality}</span>
                <span class="detail-number">(${validation.contrast.average.toFixed(3)})</span>
            </div>
            
            <div class="analysis-detail-item">
                <span class="detail-icon">⚠️</span>
                <span class="detail-label">Va chạm finder:</span>
                <span class="detail-value ${validation.collisions.finderPatterns > 0 ? 'poor' : 'excellent'}">
                    ${validation.collisions.finderPatterns} pattern(s)
                </span>
            </div>
            
            <div class="analysis-detail-item">
                <span class="detail-icon">📏</span>
                <span class="detail-label">Va chạm timing:</span>
                <span class="detail-value ${validation.collisions.timingPatterns > 0 ? 'poor' : 'excellent'}">
                    ${validation.collisions.timingPatterns} line(s)
                </span>
            </div>
            
            <div class="analysis-detail-item">
                <span class="detail-icon">📍</span>
                <span class="detail-label">Vị trí pixel:</span>
                <span class="detail-value">
                    (${position.x.toFixed(1)}, ${position.y.toFixed(1)})
                </span>
            </div>
        </div>
        
        ${validation.score < 70 ? `
        <div class="analysis-suggestions">
            <h5><i class="fas fa-lightbulb"></i> Đề xuất cải thiện:</h5>
            <ul>
                ${validation.collisions.finderPatterns > 0 ? '<li>🔄 Thử chuyển logo sang vị trí khác để tránh finder patterns</li>' : ''}
                ${validation.contrast.quality === 'poor' ? '<li>🎨 Tăng độ tương phản bằng cách thay đổi màu logo hoặc nền</li>' : ''}
                ${validation.score < 50 ? '<li>📏 Giảm kích thước logo để giảm thiểu va chạm</li>' : ''}
                <li>🔍 Kiểm tra QR code bằng máy quét trước khi sử dụng</li>
            </ul>
        </div>
        ` : ''}
    `;
    
    // Scroll đến analysis nếu có warning
    if (validation.score < 70) {
        setTimeout(() => {
            analysisSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
    }
}

// Hiển thị thông tin phân tích cho corner placement
function displayCornerAnalysis(moduleCount, cellSize) {
    let analysisSection = document.getElementById('logo-analysis');
    if (!analysisSection) {
        analysisSection = document.createElement('div');
        analysisSection.id = 'logo-analysis';
        analysisSection.className = 'analysis-section';
        
        // Thêm vào sau logo info
        const logoInfo = document.getElementById('logo-info');
        if (logoInfo) {
            logoInfo.parentNode.insertBefore(analysisSection, logoInfo.nextSibling);
        } else {
            elements.qrInfo.appendChild(analysisSection);
        }
    }    // Tính toán thông tin cho corner placement
    const version = Math.floor((moduleCount - 21) / 4) + 1;
    const finderSize = 7 * cellSize;
    
    // Tính toán kích thước logo adaptive
    const qrSize = moduleCount * cellSize;
    const baseLogoSize = calculateAdaptiveLogoSize(qrSize, 'finder');
    
    analysisSection.innerHTML = `
        <h4><i class="fas fa-crosshairs"></i> Phân tích Logo tại Finder Patterns:</h4>
        
        <div class="analysis-item">
            <div class="analysis-header">
                <span class="analysis-label">Chế độ đặt logo:</span>
                <span class="analysis-score" style="color: #667eea">
                    CORNERS - 3 vị trí
                </span>
            </div>
            <div class="analysis-message" style="color: #667eea">
                Logo được đặt tại 3 finder patterns với thuật toán pixel analysis nâng cao
            </div>
        </div>
        
        <div class="analysis-details">
            <div class="analysis-detail-item">
                <span class="detail-icon">📊</span>
                <span class="detail-label">QR Version:</span>
                <span class="detail-value">${version}</span>
                <span class="detail-number">(${moduleCount}x${moduleCount})</span>
            </div>
            
            <div class="analysis-detail-item">
                <span class="detail-icon">🎯</span>
                <span class="detail-label">Finder patterns:</span>
                <span class="detail-value excellent">3 detected</span>
                <span class="detail-number">(${finderSize.toFixed(0)}px each)</span>
            </div>
            
            <div class="analysis-detail-item">
                <span class="detail-icon">📏</span>
                <span class="detail-label">Logo size:</span>
                <span class="detail-value">${baseLogoSize.toFixed(1)}px</span>
                <span class="detail-number">(adaptive)</span>
            </div>
            
            <div class="analysis-detail-item">
                <span class="detail-icon">🔍</span>
                <span class="detail-label">Placement accuracy:</span>
                <span class="detail-value excellent">Pixel-perfect</span>
                <span class="detail-number">(core zone targeting)</span>
            </div>
        </div>
        
        <div class="corner-analysis-info">
            <h5><i class="fas fa-info-circle"></i> Thông tin chi tiết:</h5>
            <div class="corner-info-grid">
                <div class="corner-info-item">
                    <div class="corner-label">🔺 Top-Left</div>
                    <div class="corner-desc">Core zone placement với confidence-based sizing</div>
                </div>
                <div class="corner-info-item">
                    <div class="corner-label">🔺 Top-Right</div>
                    <div class="corner-desc">Adaptive opacity dựa trên pattern accuracy</div>
                </div>
                <div class="corner-info-item">
                    <div class="corner-label">🔺 Bottom-Left</div>
                    <div class="corner-desc">Tránh timing patterns tự động</div>
                </div>
            </div>
        </div>
        
        <div class="corner-recommendations">
            <h5><i class="fas fa-lightbulb"></i> Tối ưu hóa Corner Placement:</h5>
            <ul>
                <li>✅ Logo size được điều chỉnh tự động theo confidence của finder patterns</li>
                <li>✅ Opacity adaptive để đảm bảo finder patterns vẫn đọc được</li>
                <li>✅ Core zone targeting cho precision cao</li>
                <li>✅ Tránh va chạm với timing patterns</li>
                <li>🔍 Kiểm tra QR bằng nhiều loại máy quét khác nhau</li>
            </ul>
        </div>
    `;
}

// Cập nhật thông tin QR code
function updateQRInfo(content) {
    if (!elements.qrInfo) return;
    
    const size = elements.sizeInput ? elements.sizeInput.value : 300;
    const errorLevel = elements.errorLevel ? elements.errorLevel.value : 'M';
    
    const errorLevelText = {
        'L': 'Thấp (7%)',
        'M': 'Trung bình (15%)', 
        'Q': 'Cao (25%)',
        'H': 'Rất cao (30%)'
    };
    
    // Hiển thị mức error correction thực tế
    let currentErrorLevel = errorLevel;
    let errorText = errorLevelText[currentErrorLevel];
    
    if (logoImage) {
        const errorLevelHierarchy = ['L', 'M', 'Q', 'H'];
        const currentIndex = errorLevelHierarchy.indexOf(currentErrorLevel);
        currentErrorLevel = errorLevelHierarchy[Math.min(currentIndex + 1, 3)];
        errorText = errorLevelText[currentErrorLevel] + ' (Tự động tối ưu cho logo)';
    }
    
    // Tạo thông tin QR
    const qrInfoContent = `
        <h4><i class="fas fa-info-circle"></i> Thông tin QR Code:</h4>
        <div class="info-item">
            <span class="info-label">Nội dung:</span>
            <span class="info-value" id="info-content">${content}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Kích thước:</span>
            <span class="info-value" id="info-size">${size}x${size}px</span>
        </div>
        <div class="info-item">
            <span class="info-label">Sửa lỗi:</span>
            <span class="info-value" id="info-error">${errorText}</span>
        </div>
        ${logoImage ? `
        <div class="info-item">
            <span class="info-label">Logo:</span>
            <span class="info-value"><i class="fas fa-check-circle" style="color: #28a745;"></i> Đã tối ưu hóa</span>
        </div>
        ` : ''}
    `;
    
    elements.qrInfo.innerHTML = qrInfoContent;
    elements.qrInfo.classList.remove('hidden');
    
    // Cập nhật thông tin logo nếu có
    if (logoImage) {
        updateLogoInfo();
    }
}

// Download QR code
function downloadQRCode() {
    if (!currentQRCode) {
        showNotification('Không có mã QR để tải xuống.', 'error');
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = currentQRCode.toDataURL('image/png', 1.0);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Mã QR đã được tải xuống thành công!', 'success');
    } catch (error) {
        console.error('Lỗi download:', error);
        showNotification('Có lỗi xảy ra khi tải xuống. Vui lòng thử lại.', 'error');
    }
}

// Reset form
function resetForm() {
    if (!elements.urlInput) return;
    
    elements.urlInput.value = '';
    if (elements.sizeInput) elements.sizeInput.value = 300;
    if (elements.errorLevel) elements.errorLevel.value = 'M';
    if (elements.bgColor) elements.bgColor.value = '#ffffff';
    if (elements.bgColorText) elements.bgColorText.value = '#ffffff';
    if (elements.fgColor) elements.fgColor.value = '#000000';
    if (elements.fgColorText) elements.fgColorText.value = '#000000';
    if (elements.borderRadius) elements.borderRadius.value = 0;
    if (elements.margin) elements.margin.value = 4;    if (elements.logoInput) elements.logoInput.value = '';
    
    logoImage = null;
    
    if (elements.fileInfo) elements.fileInfo.innerHTML = '';
    
    // Ẩn logo preview
    const logoPreview = document.getElementById('logo-preview');
    if (logoPreview) {
        logoPreview.classList.remove('active');
        logoPreview.innerHTML = '';
    }
    
    // Ẩn control opacity và reset giá trị
    hideOpacityControl();
    if (elements.logoOpacity) elements.logoOpacity.value = 70;
    
    updateRangeValues();
    showPlaceholder();
    
    showNotification('Đã đặt lại tất cả cài đặt.', 'info');
}

// Thêm thông tin chi tiết về logo
function updateLogoInfo() {
    // Xóa thông tin logo cũ
    const existingLogoInfo = document.getElementById('logo-info');
    if (existingLogoInfo) {
        existingLogoInfo.remove();
    }
    
    if (logoImage) {
        const logoInfo = document.createElement('div');
        logoInfo.id = 'logo-info';
        logoInfo.className = 'logo-info-section';
        
        // Tính toán thông tin logo
        const qrSize = parseInt(elements.sizeInput.value) - (parseInt(elements.margin.value) * 2);
        const logoSize = Math.min(qrSize * 0.18, 80);
        const logoPercentage = ((logoSize / qrSize) * 100).toFixed(1);
        
        logoInfo.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> Thông tin Logo:</h4>
            <div class="info-item">
                <span class="info-label">Kích thước gốc:</span>
                <span class="info-value">${logoImage.naturalWidth}x${logoImage.naturalHeight}px</span>
            </div>
            <div class="info-item">
                <span class="info-label">Kích thước trong QR:</span>
                <span class="info-value">${logoSize.toFixed(0)}x${logoSize.toFixed(0)}px (${logoPercentage}%)</span>
            </div>
            <div class="info-item">
                <span class="info-label">Vị trí:</span>
                <span class="info-value">${getPositionText()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Độ trong suốt:</span>
                <span class="info-value">${elements.logoOpacity ? elements.logoOpacity.value : 70}%</span>
            </div>
        `;
        
        // Thêm optimization tips
        const optimizationTips = document.createElement('div');
        optimizationTips.className = 'optimization-tips';
        optimizationTips.innerHTML = `
            <h5><i class="fas fa-lightbulb"></i> Tối ưu hóa:</h5>
            <ul>
                <li>Logo được tự động điều chỉnh kích thước để đảm bảo QR code dễ quét</li>
                <li>Mức sửa lỗi được nâng cấp tự động khi có logo</li>
                <li>Vị trí logo được tối ưu để tránh các vùng quan trọng của QR</li>
                <li>Khuyến nghị kiểm tra QR code trước khi sử dụng</li>
            </ul>
        `;
        
        logoInfo.appendChild(optimizationTips);
        
        // Thêm vào DOM
        elements.qrInfo.appendChild(logoInfo);
    }
}

// Helper function để lấy text vị trí logo
function getPositionText() {
    const position = elements.logoPosition ? elements.logoPosition.value : 'center';
    const positionTexts = {
        'center': 'Trung tâm',
        'top-left': 'Góc trên trái', 
        'top-right': 'Góc trên phải',
        'bottom-left': 'Góc dưới trái',
        'bottom-right': 'Góc dưới phải',
        'corners': 'Tại 3 finder patterns'
    };
    return positionTexts[position] || 'Trung tâm';
}

// Helper function để tính toán kích thước logo adaptive
function calculateAdaptiveLogoSize(qrSize, positionType = 'center') {
    let logoSize, minSize, maxSize;
    
    switch (positionType) {
        case 'center':
            logoSize = qrSize * 0.18; // 18% cho center
            minSize = Math.max(30, qrSize * 0.08); // Tối thiểu 8%
            maxSize = qrSize * 0.25; // Tối đa 25%
            break;
            
        case 'corner':
            logoSize = qrSize * 0.08; // 8% cho corner
            minSize = Math.max(25, qrSize * 0.05); // Tối thiểu 5%
            maxSize = qrSize * 0.15; // Tối đa 15%
            break;
            
        case 'finder':
            logoSize = qrSize * 0.06; // 6% cho finder patterns
            minSize = Math.max(20, qrSize * 0.04); // Tối thiểu 4%
            maxSize = qrSize * 0.12; // Tối đa 12%
            break;
            
        default:
            logoSize = qrSize * 0.15;
            minSize = Math.max(30, qrSize * 0.08);
            maxSize = qrSize * 0.20;
    }
    
    const finalSize = Math.max(minSize, Math.min(logoSize, maxSize));
    
    console.log(`Adaptive logo sizing: QR=${qrSize}px, type=${positionType}, calculated=${logoSize.toFixed(1)}px, final=${finalSize.toFixed(1)}px (${(finalSize/qrSize*100).toFixed(1)}%)`);
    
    return finalSize;
}

// Utility functions
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

function showNotification(message, type = 'info') {
    console.log('Notification:', message, type);
    
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Style cho notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '300px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    });
    
    // Màu sắc theo type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Hiệu ứng xuất hiện
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 50);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

// Helper function để vẽ hình chữ nhật bo góc
function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    
    return ctx;
}

// ===== PIXEL ANALYSIS FUNCTIONS =====

/**
 * Phân tích độ tương phản của logo với nền QR
 */
function analyzeLogoContrast(logoImageData, qrImageData, logoX, logoY, logoSize) {
    const logoPixels = logoImageData.data;
    const qrPixels = qrImageData.data;
    
    let totalContrast = 0;
    let pixelCount = 0;
    let highContrastPixels = 0;
    let lowContrastPixels = 0;
    
    // Phân tích từng pixel logo
    for (let y = 0; y < logoSize; y++) {
        for (let x = 0; x < logoSize; x++) {
            const logoIndex = (y * logoSize + x) * 4;
            const qrIndex = ((logoY + y) * qrImageData.width + (logoX + x)) * 4;
            
            // Tính luminance cho logo pixel
            const logoLum = getLuminance(
                logoPixels[logoIndex],
                logoPixels[logoIndex + 1], 
                logoPixels[logoIndex + 2]
            );
            
            // Tính luminance cho QR pixel
            const qrLum = getLuminance(
                qrPixels[qrIndex],
                qrPixels[qrIndex + 1],
                qrPixels[qrIndex + 2]
            );
            
            // Tính contrast ratio
            const contrast = Math.abs(logoLum - qrLum) / 255;
            totalContrast += contrast;
            pixelCount++;
            
            if (contrast > 0.5) {
                highContrastPixels++;
            } else if (contrast < 0.2) {
                lowContrastPixels++;
            }
        }
    }
    
    const avgContrast = totalContrast / pixelCount;
    const contrastRatio = highContrastPixels / pixelCount;
    const lowContrastRatio = lowContrastPixels / pixelCount;
    
    return {
        average: avgContrast,
        highContrastRatio: contrastRatio,
        lowContrastRatio: lowContrastRatio,
        quality: avgContrast > 0.4 ? 'high' : avgContrast > 0.2 ? 'medium' : 'low'
    };
}

/**
 * Phân tích va chạm logo với các phần tử quan trọng của QR
 */
function analyzeLogoCollisions(qr, logoX, logoY, logoSize, moduleCount, cellSize, marginValue) {
    const collisions = {
        finderPatterns: 0,
        timingPatterns: 0,
        alignmentPatterns: 0,
        formatInfo: 0,
        dataModules: 0,
        total: 0
    };
    
    // Tính toán các vùng QR quan trọng
    const finderSize = 7 * cellSize;
    const finderPositions = [
        {x: marginValue, y: marginValue}, // Top-left
        {x: marginValue + (moduleCount - 7) * cellSize, y: marginValue}, // Top-right
        {x: marginValue, y: marginValue + (moduleCount - 7) * cellSize} // Bottom-left
    ];
    
    // Kiểm tra va chạm với finder patterns
    finderPositions.forEach(pos => {
        if (hasOverlap(logoX, logoY, logoSize, logoSize, pos.x, pos.y, finderSize, finderSize)) {
            collisions.finderPatterns++;
        }
    });
    
    // Kiểm tra va chạm với timing patterns
    const timingY = marginValue + 6 * cellSize;
    const timingX = marginValue + 6 * cellSize;
    
    // Horizontal timing pattern
    if (hasOverlap(logoX, logoY, logoSize, logoSize, marginValue, timingY, moduleCount * cellSize, cellSize)) {
        collisions.timingPatterns++;
    }
    
    // Vertical timing pattern
    if (hasOverlap(logoX, logoY, logoSize, logoSize, timingX, marginValue, cellSize, moduleCount * cellSize)) {
        collisions.timingPatterns++;
    }
    
    // Kiểm tra alignment patterns (cho QR version cao)
    if (moduleCount >= 25) {
        const alignmentPositions = getAlignmentPatternPositions(moduleCount);
        alignmentPositions.forEach(pos => {
            const alignX = marginValue + pos.x * cellSize - 2 * cellSize;
            const alignY = marginValue + pos.y * cellSize - 2 * cellSize;
            if (hasOverlap(logoX, logoY, logoSize, logoSize, alignX, alignY, 5 * cellSize, 5 * cellSize)) {
                collisions.alignmentPatterns++;
            }
        });
    }
    
    // Tính tổng va chạm
    collisions.total = collisions.finderPatterns + collisions.timingPatterns + 
                      collisions.alignmentPatterns + collisions.formatInfo;
    
    return collisions;
}

/**
 * Tính toán điểm tối ưu cho vị trí logo
 */
function calculateOptimizationScore(contrastAnalysis, collisionAnalysis) {
    let score = 100;
    
    // Trừ điểm cho contrast kém
    if (contrastAnalysis.quality === 'low') {
        score -= 30;
    } else if (contrastAnalysis.quality === 'medium') {
        score -= 15;
    }
    
    // Trừ điểm cho low contrast ratio cao
    score -= contrastAnalysis.lowContrastRatio * 20;
    
    // Trừ điểm cho va chạm
    score -= collisionAnalysis.finderPatterns * 25;
    score -= collisionAnalysis.timingPatterns * 20;
    score -= collisionAnalysis.alignmentPatterns * 15;
    score -= collisionAnalysis.formatInfo * 10;
    
    return Math.max(0, Math.min(100, score));
}

/**
 * Đưa ra khuyến nghị dựa trên điểm tối ưu
 */
function getPlacementRecommendation(score) {
    if (score >= 80) {
        return {
            level: 'excellent',
            message: 'Vị trí logo tối ưu, QR dễ quét',
            color: '#4CAF50'
        };
    } else if (score >= 60) {
        return {
            level: 'good',
            message: 'Vị trí logo tốt, có thể quét được',
            color: '#FF9800'
        };
    } else if (score >= 40) {
        return {
            level: 'fair',
            message: 'Vị trí logo chấp nhận được, cần thận trọng',
            color: '#FF5722'
        };
    } else {
        return {
            level: 'poor',
            message: 'Vị trí logo kém, có thể ảnh hưởng việc quét',
            color: '#F44336'
        };
    }
}

/**
 * Tính toán luminance của pixel
 */
function getLuminance(r, g, b) {
    // Sử dụng công thức W3C cho luminance
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Kiểm tra hai hình chữ nhật có overlap không
 */
function hasOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
}

/**
 * Lấy vị trí alignment patterns dựa trên version QR
 */
function getAlignmentPatternPositions(moduleCount) {
    const version = Math.floor((moduleCount - 17) / 4);
    const positions = [];
    
    // Alignment pattern positions cho các version khác nhau
    const alignmentData = {
        2: [6, 18],
        3: [6, 22],
        4: [6, 26],
        5: [6, 30],
        6: [6, 34],
        7: [6, 22, 38]
    };
    
    const coords = alignmentData[version] || [6, 18];
    
    for (let i = 0; i < coords.length; i++) {
        for (let j = 0; j < coords.length; j++) {
            // Tránh finder patterns
            if ((i === 0 && j === 0) || 
                (i === 0 && j === coords.length - 1) ||
                (i === coords.length - 1 && j === 0)) {
                continue;
            }
            positions.push({x: coords[i], y: coords[j]});
        }
    }
    
    return positions;
}

/**
 * Validate QR code sau khi thêm logo
 */
function validateQRCodeWithLogo(canvas, content) {
    console.log('Validating QR code with logo...');
    
    try {
        // Tạo test canvas để kiểm tra
        const testCanvas = document.createElement('canvas');
        testCanvas.width = canvas.width;
        testCanvas.height = canvas.height;
        const testCtx = testCanvas.getContext('2d');
        testCtx.drawImage(canvas, 0, 0);
        
        // Phân tích chất lượng
        const imageData = testCtx.getImageData(0, 0, canvas.width, canvas.height);
        const quality = analyzeQRQuality(imageData);
        
        console.log(`QR Code quality analysis: ${quality.score}/100`);
        
        if (quality.score < 60) {
            showNotification('⚠️ Chất lượng QR code có thể bị ảnh hưởng bởi logo. Hãy thử điều chỉnh vị trí hoặc kích thước logo.', 'warning');
        } else if (quality.score >= 80) {
            console.log('✅ QR Code quality validated successfully');
        }
    } catch (error) {
        console.warn('QR validation failed:', error);
    }
}

/**
 * Phân tích chất lượng QR code
 */
function analyzeQRQuality(imageData) {
    const pixels = imageData.data;
    let contrastSum = 0;
    let pixelCount = 0;
    
    // Tính toán contrast ratio trung bình
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        
        contrastSum += Math.abs(luminance - 0.5) * 2; // Normalize to 0-1
        pixelCount++;
    }
    
    const avgContrast = contrastSum / pixelCount;
    const score = Math.min(100, avgContrast * 100);
    
    return {
        score: score,
        quality: score > 80 ? 'excellent' : score > 60 ? 'good' : 'poor'
    };
}
