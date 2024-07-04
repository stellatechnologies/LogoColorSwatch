document.getElementById('imageInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const imgElement = new Image();
        imgElement.onload = () => processImage(imgElement);
        imgElement.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

var globalImages = [];  // Global array to store image data URLs

function processImage(imgElement) {
    const hexColor = document.getElementById('colorPicker').value;
    const rgb = hexToRgb(hexColor);

    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.width * 3;
    canvas.height = imgElement.height * 3;

    drawCheckerboard(canvas, ctx);
    const images = createImages(imgElement, rgb, { width: imgElement.width, height: imgElement.height });
    globalImages = images; // Store images globally or pass to another function
    drawImageGrid(images, ctx, { width: imgElement.width, height: imgElement.height });
    document.getElementById('downloadButton').classList.remove('hidden');
}


function loadImage() {
    const imgElement = new Image();
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        imgElement.onload = () => processImage(imgElement);
        imgElement.src = e.target.result;
    };

    reader.readAsDataURL(file);
}


function createImages(imgElement, rgb, size) {
    const images = [];

    // Create different variations
    const variations = [
        { background: null, color: rgb },
        { background: 'white', color: rgb },
        { background: 'black', color: rgb },
        { background: null, color: { r: 255, g: 255, b: 255 } },
        { background: 'custom', color: { r: 255, g: 255, b: 255 } },
        { background: 'black', color: { r: 255, g: 255, b: 255 } },
        { background: null, color: { r: 0, g: 0, b: 0 } },
        { background: 'white', color: { r: 0, g: 0, b: 0 } },
        { background: 'custom', color: { r: 0, g: 0, b: 0 } }
    ];

    variations.forEach(variation => {
        const imgData = createVariation(imgElement, variation.color, size, variation.background, rgb);
        images.push(imgData);
    });

    return images;
}

function createVariation(imgElement, color, size, background, rgb) {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');

    // Draw image onto canvas
    ctx.drawImage(imgElement, 0, 0);

    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 50 && data[i + 1] < 50 && data[i + 2] < 50) { // Detect darker pixels
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    // Apply background if specified
    if (background) {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = size.width;
        bgCanvas.height = size.height;
        const bgCtx = bgCanvas.getContext('2d');

        if (background === 'white') {
            bgCtx.fillStyle = 'white';
        } else if (background === 'black') {
            bgCtx.fillStyle = 'black';
        } else if (background === 'custom') {
            bgCtx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        }
        bgCtx.fillRect(0, 0, size.width, size.height);
        bgCtx.drawImage(canvas, 0, 0);
        return bgCanvas.toDataURL();
    }

    return canvas.toDataURL();
}

function drawCheckerboard(canvas, ctx) {
    const tileSize = 20; // Size of the check tiles
    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            if (x + tileSize > canvas.width || y + tileSize > canvas.height) {
                continue; // Skip drawing if the tile goes beyond the canvas
            }
            ctx.fillStyle = (x / tileSize % 2 === y / tileSize % 2) ? '#FFF' : '#CCC';
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }
}

function drawImageGrid(images, ctx, size) {
    let x = 0;
    let y = 0;
    images.forEach((imgSrc, index) => {
        const img = new Image();
        img.onload = () => {
            const posX = x * size.width;
            const posY = y * size.height;
            ctx.drawImage(img, posX, posY, size.width, size.height);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(posX, posY, size.width, size.height);  // Draw border around each image
            x++;
            if (x >= 3) {
                x = 0;
                y++;
            }
        };
        img.src = imgSrc;
    });
}

function hexToRgb(hex) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    };
}

function downloadCanvas() {
    const canvas = document.getElementById('imageCanvas');
    const imageUrl = canvas.toDataURL('image/png');

    // Download the full composite grid
    downloadImage(imageUrl, 'full_image.png');

    // Download each individual image
    globalImages.forEach((imgSrc, index) => {
        downloadImage(imgSrc, `image_${index + 1}.png`);
    });
}

function downloadImage(src, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');

// Update color picker when hex input changes
hexInput.addEventListener('input', function () {
    if (hexInput.value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
        colorPicker.value = hexInput.value;
    }
});

// Update hex input when color picker changes
colorPicker.addEventListener('input', function () {
    hexInput.value = colorPicker.value;
});