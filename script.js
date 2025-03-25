// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pdfScale = 1.5;

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
const qualitySelect = document.getElementById('quality');

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

function convertToJpg() {
    try {
        const quality = parseFloat(qualitySelect.value);
        const imageData = pdfCanvas.toDataURL('image/jpeg', quality);

        // Create download link
        const link = document.createElement('a');
        link.download = `page_${pageNum}.jpg`;
        link.href = imageData;
        link.click();
    } catch (error) {
        console.error('Error converting to JPG:', error);
        alert('Error converting to JPG. Please try again.');
    }
}