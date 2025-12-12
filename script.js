document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qr-input');
    const qrSizeSlider = document.getElementById('qr-size');
    const qrSizeValueSpan = document.getElementById('qr-size-value');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    const copyQrBtn = document.getElementById('copy-qr-btn');
    const copyImageBtn = document.getElementById('copy-image-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const qrcodeContainer = document.getElementById('qrcode');
    const previewText = document.getElementById('preview-text');
    const statusEl = document.getElementById('status');

    let qrcode = null;

    const getSelectedType = () => document.querySelector('input[name="qr-type"]:checked')?.value || 'url';

    const showStatus = (msg, timeout = 2000) => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.add('visible');
        clearTimeout(showStatus._t);
        showStatus._t = setTimeout(() => {
            statusEl.textContent = '';
            statusEl.classList.remove('visible');
        }, timeout);
    };

    const generateQrCode = () => {
        const inputValue = qrInput.value.trim();
        const size = parseInt(qrSizeSlider.value, 10) || 256;
        const type = getSelectedType();

        // Prepare value to encode (for URLs add scheme if missing)
        let encodedValue = inputValue;
        if (type === 'url' && inputValue && !/^https?:\/\//i.test(inputValue)) {
            encodedValue = 'https://' + inputValue;
        }

        qrcodeContainer.innerHTML = '';

        if (inputValue) {
            // wrap canvas in a nicer visual container
            const wrap = document.createElement('div');
            wrap.className = 'qr-canvas-wrap';
            qrcodeContainer.appendChild(wrap);

            qrcode = new QRCode(wrap, {
                text: encodedValue,
                width: size,
                height: size,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            previewText.textContent = encodedValue;

            // small pop animation for the newly generated QR
            requestAnimationFrame(() => {
                wrap.classList.remove('qrcode-pop');
                void wrap.offsetWidth;
                wrap.classList.add('qrcode-pop');
            });
        } else {
            previewText.textContent = 'Geben Sie etwas ein, um einen QR-Code zu generieren.';
        }
    };

    // Update placeholder when type changes
    document.querySelectorAll('input[name="qr-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'url') {
                qrInput.placeholder = 'z. B. m0x2.de';
            } else {
                qrInput.placeholder = 'Geben Sie hier Ihren Text ein';
            }
            generateQrCode();
        });
    });

    qrInput.addEventListener('input', generateQrCode);

    qrSizeSlider.addEventListener('input', () => {
        qrSizeValueSpan.textContent = `${qrSizeSlider.value}px`;
        generateQrCode();
    });

    // Download PNG
    downloadQrBtn.addEventListener('click', () => {
        const inputValue = qrInput.value.trim();
        if (!inputValue) {
            showStatus('Bitte zuerst einen Wert eingeben.');
            return;
        }
        const qrCanvas = qrcodeContainer.querySelector('canvas');
        if (qrCanvas) {
            const link = document.createElement('a');
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `qrcode-${ts}.png`;
            link.href = qrCanvas.toDataURL('image/png');
            link.click();
            showStatus('Download gestartet');
        } else {
            showStatus('Kein QR-Code zum Herunterladen vorhanden.');
        }
    });

    // Copy encoded value to clipboard
    copyQrBtn.addEventListener('click', async () => {
        const inputValue = qrInput.value.trim();
        if (!inputValue) {
            showStatus('Bitte zuerst einen Wert eingeben.');
            return;
        }
        const type = getSelectedType();
        let toCopy = inputValue;
        if (type === 'url' && !/^https?:\/\//i.test(inputValue)) toCopy = 'https://' + inputValue;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(toCopy);
            } else {
                const ta = document.createElement('textarea');
                ta.value = toCopy;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            showStatus('Kopiert!');
        } catch (err) {
            showStatus('Kopieren nicht möglich');
        }
    });

    // Copy QR-image (canvas) to clipboard (ClipboardItem)
    if (copyImageBtn) {
        copyImageBtn.addEventListener('click', async () => {
            const qrCanvas = qrcodeContainer.querySelector('canvas');
            if (!qrCanvas) {
                showStatus('Kein QR-Code zum Kopieren vorhanden.');
                return;
            }

            if (navigator.clipboard && navigator.clipboard.write) {
                qrCanvas.toBlob(async (blob) => {
                    try {
                        const data = [new ClipboardItem({ 'image/png': blob })];
                        await navigator.clipboard.write(data);
                        showStatus('QR-Bild kopiert!');
                    } catch (err) {
                        showStatus('Kopieren des Bildes nicht möglich.');
                    }
                });
            } else {
                showStatus('Ihr Browser unterstützt das Kopieren von Bildern nicht.');
            }
        });
    }

    // Theme toggle (dark/light) using data-theme on document.documentElement
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
        localStorage.setItem('qr-theme', theme);
    };

    if (themeToggleBtn) {
        // initialize theme
        const saved = localStorage.getItem('qr-theme') || 'dark';
        applyTheme(saved);

        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            showStatus(next === 'light' ? 'Helles Theme' : 'Dunkles Theme');
        });
    }

    // Initial generate
    generateQrCode();
});
