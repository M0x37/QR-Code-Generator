document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qr-input');
    const qrTypeRadios = document.querySelectorAll('input[name="qr-type"]');
    const previewText = document.getElementById('preview-text');
    const qrSizeSlider = document.getElementById('qr-size');
    const qrSizeValueSpan = document.getElementById('qr-size-value');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    const qrcodeContainer = document.getElementById('qrcode');

    let qrcode = null; // Variable to hold the QRCode instance

    // Function to generate QR code
    const generateQrCode = () => {
        const inputValue = qrInput.value.trim();
        const size = parseInt(qrSizeSlider.value, 10);

        // Clear previous QR code
        qrcodeContainer.innerHTML = '';

        if (inputValue) {
            qrcode = new QRCode(qrcodeContainer, {
                text: inputValue,
                width: size,
                height: size,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            previewText.textContent = inputValue;
        } else {
            previewText.textContent = 'Geben Sie etwas ein, um einen QR-Code zu generieren.';
        }
    };

    // Event Listeners
    qrTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            // Update placeholder based on selection
            if (radio.value === 'url') {
                qrInput.placeholder = 'z.B. m0x2.de';
            } else {
                qrInput.placeholder = 'Geben Sie hier Ihren Text ein';
            }
            generateQrCode(); // Regenerate QR code if type changes
        });
    });

    qrInput.addEventListener('input', generateQrCode);

    qrSizeSlider.addEventListener('input', () => {
        qrSizeValueSpan.textContent = `${qrSizeSlider.value}px`;
        generateQrCode(); // Regenerate QR code with new size
    });

    downloadQrBtn.addEventListener('click', () => {
        if (qrcode && qrInput.value.trim()) {
            // qrcode.js generates a canvas element inside the container
            const qrCanvas = qrcodeContainer.querySelector('canvas');
            if (qrCanvas) {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = qrCanvas.toDataURL('image/png');
                link.click();
            } else {
                alert('QR-Code konnte nicht heruntergeladen werden. Stellen Sie sicher, dass ein QR-Code generiert wurde.');
            }
        } else {
            alert('Bitte geben Sie einen Wert ein, um einen QR-Code zu generieren und herunterzuladen.');
        }
    });

    // Initial QR code generation on page load
    generateQrCode();
});
