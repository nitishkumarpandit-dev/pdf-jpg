// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pdfScale = 1.0;
let isDarkMode = false;

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const pdfCanvas = document.getElementById('pdfCanvas');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const convertBtn = document.getElementById('convertBtn');
const batchConvertBtn = document.getElementById('batchConvertBtn');
const qualitySelect = document.getElementById('quality');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const zoomLevelSpan = document.getElementById('zoomLevel');
const themeToggle = document.getElementById('themeToggle');

// Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handlePdfFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handlePdfFile(file);
    }
});

prevButton.addEventListener('click', () => {
    if (pageNum > 1) {
        pageNum--;
        renderPage();
    }
});

nextButton.addEventListener('click', () => {
    if (pageNum < pdfDoc.numPages) {
        pageNum++;
        renderPage();
    }
});

convertBtn.addEventListener('click', convertToJpg);
batchConvertBtn.addEventListener('click', convertAllPages);
zoomInBtn.addEventListener('click', () => {
    pdfScale += 0.25;
    updateZoomLevel();
    renderPage();
});

zoomOutBtn.addEventListener('click', () => {
    if (pdfScale > 0.25) {
        pdfScale -= 0.25;
        updateZoomLevel();
        renderPage();
    }
});

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
});

// Functions
async function handlePdfFile(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        pageNum = 1;
        totalPagesSpan.textContent = pdfDoc.numPages;
        previewArea.hidden = false;
        renderPage();
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF file. Please try again.');
    }
}

async function renderPage() {
    try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: pdfScale });

        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;

        const renderContext = {
            canvasContext: pdfCanvas.getContext('2d'),
            viewport: viewport
        };

        await page.render(renderContext).promise;
        currentPageSpan.textContent = pageNum;
    } catch (error) {
        console.error('Error rendering page:', error);
        alert('Error rendering PDF page. Please try again.');
    }
}

function updateZoomLevel() {
    zoomLevelSpan.textContent = `${Math.round(pdfScale * 100)}%`;
}

function applyImageEffects(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);

    for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] = Math.min(255, Math.max(0, data[i] + brightness));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));

        // Contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function addWatermark(canvas, text) {
    if (!text) return canvas;

    const ctx = canvas.getContext('2d');
    ctx.save();

    ctx.globalAlpha = 0.3;
    ctx.font = '24px Arial';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Rotate and draw watermark diagonally
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(text, 0, 0);

    ctx.restore();
    return canvas;
}

function rotateCanvas(canvas, angle) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (angle === 90 || angle === 270) {
        tempCanvas.width = canvas.height;
        tempCanvas.height = canvas.width;
    } else {
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
    }

    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(angle * Math.PI / 180);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return tempCanvas;
}

function convertToImage() {
    try {
        const quality = parseFloat(qualitySelect.value);
        const format = document.getElementById('format').value;
        const rotation = parseInt(document.getElementById('rotation').value);
        const watermarkText = document.getElementById('watermark').value;

        // Create a temporary canvas for editing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = pdfCanvas.width;
        tempCanvas.height = pdfCanvas.height;
        tempCanvas.getContext('2d').drawImage(pdfCanvas, 0, 0);

        // Apply effects
        let processedCanvas = applyImageEffects(tempCanvas);
        processedCanvas = rotateCanvas(processedCanvas, rotation);
        processedCanvas = addWatermark(processedCanvas, watermarkText);

        // Convert to desired format
        const imageData = processedCanvas.toDataURL(format, quality);

        // Create download link
        const link = document.createElement('a');
        const extension = format.split('/')[1];
        link.download = `page_${pageNum}.${extension}`;
        link.href = imageData;
        link.click();
    } catch (error) {
        console.error('Error converting image:', error);
        alert('Error converting image. Please try again.');
    }
}

async function convertAllPages() {
    try {
        const quality = parseFloat(qualitySelect.value);
        const totalPages = pdfDoc.numPages;

        for (let i = 1; i <= totalPages; i++) {
            pageNum = i;
            await renderPage();
            const imageData = pdfCanvas.toDataURL('image/jpeg', quality);

            const link = document.createElement('a');
            link.download = `page_${i}.jpg`;
            link.href = imageData;
            link.click();

            // Small delay to prevent browser from freezing
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        alert('All pages have been converted successfully!');
    } catch (error) {
        console.error('Error in batch conversion:', error);
        alert('Error during batch conversion. Please try again.');
    }
}