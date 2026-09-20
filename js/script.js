// ==================================================
// LIVE BTC PRICE (header ticker)
// ==================================================
function loadHeaderTicker(attemptsLeft) {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr&include_24hr_change=true')
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            const price = data.bitcoin.usd.toLocaleString('en-US');
            const priceIdr = Math.round(data.bitcoin.idr).toLocaleString('id-ID');
            const change = data.bitcoin.usd_24h_change;

            const priceEl = document.getElementById('btc-price');
            priceEl.textContent = '$' + price + ' / Rp' + priceIdr;
            priceEl.classList.remove('skeleton-loading');

            const changeEl = document.getElementById('btc-change');
            const sign = change >= 0 ? '+' : '';
            changeEl.textContent = sign + change.toFixed(1) + '% (24h)';
            changeEl.className = change >= 0 ? 'btc-change positive' : 'btc-change negative';
        })
        .catch(error => {
            if (attemptsLeft > 0) {
                // CoinGecko kadang sesaat sibuk/rate-limit — coba lagi sebelum menyerah
                setTimeout(() => loadHeaderTicker(attemptsLeft - 1), 2000);
            } else {
                const priceEl = document.getElementById('btc-price');
                priceEl.textContent = 'N/A';
                priceEl.classList.remove('skeleton-loading');
                document.getElementById('btc-change').classList.remove('skeleton-loading');
            }
        });
}
loadHeaderTicker(3);


// ==================================================
// SCROLL ANIMATION (fade-in / slide-up)
// ==================================================
const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, { threshold: 0.15 });

animatedElements.forEach(el => observer.observe(el));

// ==================================================
// SUPPORT MY BITCOIN JOURNEY: MODAL QR DONASI
// (satu modal dipakai bareng untuk semua koin)
// ==================================================
const CRYPTO_DATA = {
    btc: {
        address: 'bc1qrm2295j3zhqaxx48evmgwmxnnypc66uzs4ej5x',
        logo: 'https://cdn.simpleicons.org/bitcoin/f7931a',
        label: '<strong style="color:#f7931a;">Bitcoin (Native SegWit)</strong>'
    },
    eth: {
        address: '0xa3b67598Bba5cbD8C519dC8f98EeB5A454EFa137',
        logo: 'https://cdn.simpleicons.org/ethereum/3c3c3d',
        label: '<strong style="color:#627eea;">Ethereum (ERC20)</strong>'
    },
    usdt: {
        address: '0xa3b67598Bba5cbD8C519dC8f98EeB5A454EFa137',
        logo: 'https://cdn.simpleicons.org/tether/26a17b',
        label: '<strong style="color:#26a17b;">USDT</strong> <strong style="color:#f0b90b;">(BEP20 - BNB Smart Chain)</strong>'
    },
    bnb: {
        address: '0xa3b67598Bba5cbD8C519dC8f98EeB5A454EFa137',
        logo: 'https://cdn.simpleicons.org/binance/F0B90B',
        label: '<strong style="color:#f0b90b;">BNB (BEP20 - BNB Smart Chain)</strong>'
    },
    xrp: {
        address: 'rhKT1k4EbfqcCKLDqtFjTJojgDm7m1HiGj',
        logo: 'https://cdn.simpleicons.org/xrp/25A768',
        label: '<strong style="color:#00aae4;">XRP (XRP Ledger)</strong>'
    },
    sol: {
        address: 'F5fWxfQqv9FWGHhbVEfnZE94GwL5gJdEv71hdkaeaa8U',
        logo: 'https://cdn.simpleicons.org/solana/9945FF',
        label: '<strong style="color:#9945FF;">Solana (SOL)</strong>'
    },
    lightning: {
        address: 'kapazz09@blink.sv',
        logo: 'https://cdn.simpleicons.org/lightning/2196f3',
        label: '<strong style="color:#f7b500;">Lightning Network</strong>'
    },
    qris: {
        isImage: true,
        image: 'assets/img/qris-payment.jpg',
        logo: 'assets/img/qris-icon.png',
        label: '<strong style="color:#333;">QRIS — Kedai Kapazz Freshqua</strong>'
    }
};

function openCryptoModal(coin) {
    const data = CRYPTO_DATA[coin];
    if (!data) return;

    const logoEl = document.getElementById('cryptoModalLogo');
    const qrBox = document.getElementById('cryptoModalQR');
    qrBox.innerHTML = '';

    if (data.isImage) {
        // QRIS: tampilkan kode QR asli dari bank/penyelenggara (bukan hasil
        // generate dari teks alamat), jadi tanpa overlay logo & tanpa
        // alamat yang bisa disalin — cukup di-scan langsung.
        logoEl.style.display = 'none';
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = 'QRIS';
        img.className = 'qris-payment-img';
        qrBox.appendChild(img);

        document.getElementById('cryptoModalDetail').innerHTML =
            data.label + '<p style="font-size:11px;color:#888;margin-top:8px;">Scan pakai aplikasi e-wallet atau ' +
            'm-banking apa saja yang mendukung QRIS.</p>';
    } else {
        logoEl.style.display = '';
        logoEl.src = data.logo;
        new QRCode(qrBox, data.address);

        document.getElementById('cryptoModalDetail').innerHTML =
            data.label + '<br><span class="copy-address" onclick="copyAddress(this)" data-address="' +
            data.address + '">' + data.address + ' <span class="copy-icon">📋</span></span>';
    }

    const backdrop = document.getElementById('cryptoModalBackdrop');
    const box = document.getElementById('cryptoModalBox');
    box.classList.remove('anim-coin');
    void box.offsetWidth;
    box.classList.add('anim-coin');

    backdrop.classList.add('open');
    document.body.classList.add('modal-open');
}

function closeCryptoModal() {
    document.getElementById('cryptoModalBackdrop').classList.remove('open');
    document.body.classList.remove('modal-open');
}

function closeCryptoModalOnBackdrop(event) {
    if (event.target.id === 'cryptoModalBackdrop') closeCryptoModal();
}

// ==================================================
// COPY ADDRESS TO CLIPBOARD
// ==================================================
function copyAddress(el) {
    const text = el.getAttribute('data-address');
    const icon = el.querySelector('.copy-icon');

    navigator.clipboard.writeText(text).then(() => {
        if (icon) {
            const original = icon.textContent;
            icon.textContent = '✅';
            setTimeout(() => { icon.textContent = original; }, 1500);
        }
    }).catch(() => {
        alert('Gagal menyalin. Silakan salin manual.');
    });
}

// ==================================================
// BITCOIN TOOLKIT: MODAL POPUP PER TOOL
// Tiap tool punya gaya animasi masuk sendiri, disesuaikan
// dengan "rasa" fungsinya masing-masing.
// ==================================================
const TOOL_ANIMATIONS = {
    quiz: 'anim-bounce',        // playful, kuis
    glossary: 'anim-fade-top',  // buka halaman referensi
    dca: 'anim-slide-up',       // dashboard naik dari bawah
    converter: 'anim-flip',     // "membalik" mata uang
    average: 'anim-slide-up-soft',
    halving: 'anim-zoom',       // dramatis, hitung mundur
    mining: 'anim-slide-up-heavy', // berat, industrial
    utxo: 'anim-slide-left',    // catatan buku besar
    channel: 'anim-slide-right-fast', // cepat = lightning
    wallet: 'anim-fade-scale'   // simpel, pencarian
};

// Tool yang digabung dalam 1 modal ber-tab. Tool yang tidak
// disebut di sini tetap berdiri sendiri seperti biasa.
const TOOL_GROUPS = {
    dca: 'calc', converter: 'calc', average: 'calc',
    quiz: 'edu', glossary: 'edu'
};
const GROUP_TABS_EL = { calc: 'calcTabs', edu: 'eduTabs' };

function activateGroupTabs(tool) {
    const group = TOOL_GROUPS[tool];
    document.querySelectorAll('.tool-tabs').forEach(el => el.style.display = 'none');
    if (!group) return;
    const tabBar = document.getElementById(GROUP_TABS_EL[group]);
    if (!tabBar) return;
    tabBar.style.display = 'flex';
    tabBar.querySelectorAll('.tool-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tool);
    });
}

function showTool(tool, element) {
    document.querySelectorAll('.tool-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    element.classList.add('active');

    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    const next = document.getElementById('tool-' + tool);
    if (next) next.classList.add('active');

    activateGroupTabs(tool);

    const backdrop = document.getElementById('toolModalBackdrop');
    const box = document.getElementById('toolModalBox');

    // Bersihkan kelas animasi sebelumnya, pasang yang sesuai tool ini
    box.className = 'tool-display';
    const animClass = TOOL_ANIMATIONS[tool] || 'anim-fade-scale';
    void box.offsetWidth; // restart animasi walau tool sama diklik lagi
    box.classList.add(animClass);

    backdrop.classList.add('open');
    document.body.classList.add('modal-open');

    // DCA / Converter / Average berbagi 1 live price — begitu modal
    // grup ini dibuka (di tab manapun), langsung ambil sekali otomatis.
    if (TOOL_GROUPS[tool] === 'calc' && typeof BitcoinTools !== 'undefined' && !BitcoinTools.btcPrice) {
        BitcoinTools.loadPrice();
    }
    if (tool === 'converter' && typeof BitcoinTools !== 'undefined' && BitcoinTools.loadCustomCurrencyRates) {
        BitcoinTools.loadCustomCurrencyRates();
    }
    if (tool === 'halving' && typeof BitcoinTools !== 'undefined' && BitcoinTools.renderHalvingCycleChart) {
        BitcoinTools.renderHalvingCycleChart();
    }
}

// Pindah tab TANPA menutup modal — dipakai tombol tab di dalam modal gabungan.
function switchToolTab(tool) {
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    const next = document.getElementById('tool-' + tool);
    if (next) next.classList.add('active');

    activateGroupTabs(tool);

    document.querySelectorAll('.tool-icon').forEach(icon => {
        icon.classList.toggle('active', icon.dataset.tool === tool);
    });

    if (TOOL_GROUPS[tool] === 'calc' && typeof BitcoinTools !== 'undefined' && !BitcoinTools.btcPrice) {
        BitcoinTools.loadPrice();
    }
    if (tool === 'converter' && typeof BitcoinTools !== 'undefined' && BitcoinTools.loadCustomCurrencyRates) {
        BitcoinTools.loadCustomCurrencyRates();
    }
}

function closeToolModal() {
    document.getElementById('toolModalBackdrop').classList.remove('open');
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.tool-icon').forEach(icon => icon.classList.remove('active'));
}

function closeToolModalOnBackdrop(event) {
    if (event.target.id === 'toolModalBackdrop') closeToolModal();
}

// ==================================================
// SWIPE ANTAR TAB (DCA/Converter/Average & Quiz/Glossary)
// Geser jari ke kiri/kanan di dalam modal buat pindah tab,
// tanpa perlu tutup modal dulu.
// ==================================================
const TAB_ORDER = {
    calc: ['dca', 'converter', 'average'],
    edu: ['quiz', 'glossary']
};

function getCurrentActiveTool() {
    const activePanel = document.querySelector('.tool-panel.active');
    return activePanel ? activePanel.id.replace('tool-', '') : null;
}

function setupToolSwipe() {
    const box = document.getElementById('toolModalBox');
    if (!box) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    box.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
    }, { passive: true });

    box.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Cuma dianggap swipe kalau gerakannya jelas mendatar
        // (bukan scroll vertikal biasa) dan cukup jauh.
        if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;

        const currentTool = getCurrentActiveTool();
        if (!currentTool) return;
        const group = TOOL_GROUPS[currentTool];
        if (!group) return;

        const order = TAB_ORDER[group];
        const idx = order.indexOf(currentTool);
        if (idx === -1) return;

        if (deltaX < 0 && idx < order.length - 1) {
            switchToolTab(order[idx + 1]); // swipe kiri -> tab berikutnya
        } else if (deltaX > 0 && idx > 0) {
            switchToolTab(order[idx - 1]); // swipe kanan -> tab sebelumnya
        }
    }, { passive: true });
}

// ==================================================
// TOMBOL KEMBALI KE ATAS
// ==================================================
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    if (window.scrollY > 500) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
    }
});

// ==================================================
// BACKGROUND MUSIC TOGGLE
// (ikon tombol selalu ikut kondisi asli, bukan hardcode)
// ==================================================
function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    if (audio.paused) {
        audio.play().catch(() => {});
    } else {
        audio.pause();
    }
}

function updateMusicButtonIcon() {
    const audio = document.getElementById('bgMusic');
    const btn = document.querySelector('.music-btn');
    if (!audio || !btn) return;
    btn.textContent = audio.paused ? '🔇' : '🔊';
}

// ==================================================
// FAQ ACCORDION
// ==================================================
function toggleFaqSection() {
    const list = document.getElementById('faqList');
    const subtitle = document.querySelector('.faq-subtitle');
    if (!list) return;
    const isHidden = list.style.display === 'none' || list.style.display === '';
    list.style.display = isHidden ? 'flex' : 'none';
    if (subtitle) {
        subtitle.textContent = isHidden
            ? 'Pertanyaan yang sering ditanyakan pemula (klik untuk sembunyikan)'
            : 'Pertanyaan yang sering ditanyakan pemula (klik untuk lihat)';
    }
}

function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    if (item) item.classList.toggle('open');
}

// ==================================================
// LEARNING PATH: status "Tandai Selesai" per materi
// Disimpan di localStorage browser (per-perangkat saja,
// tidak perlu backend/spreadsheet).
// ==================================================
const LEARNING_PROGRESS_KEY = 'kapazzLearningProgress';

function getLearningProgress() {
    try {
        const raw = localStorage.getItem(LEARNING_PROGRESS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveLearningProgress(progress) {
    try {
        localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
        // localStorage penuh/diblokir — abaikan, tidak fatal
    }
}

function markMaterialOpened(anchor) {
    const item = anchor.closest('.learning-item');
    if (!item) return;
    const id = item.dataset.materialId;
    if (!id) return;

    const progress = getLearningProgress();
    if (progress[id]) return; // sudah tercatat selesai, tidak perlu apa-apa lagi

    progress[id] = true;
    saveLearningProgress(progress);

    applyLearningItemState(item, true);
    updateLearningProgressUI();
}

function applyLearningItemState(item, isDone) {
    item.classList.toggle('done', isDone);
}

function restoreLearningProgress() {
    const items = document.querySelectorAll('.learning-item');
    if (items.length === 0) return;

    const progress = getLearningProgress();
    items.forEach(item => {
        const id = item.dataset.materialId;
        applyLearningItemState(item, !!progress[id]);
    });
    updateLearningProgressUI();
}

function updateLearningProgressUI() {
    const items = document.querySelectorAll('.learning-item');
    const total = items.length;
    if (total === 0) return;

    const doneCount = document.querySelectorAll('.learning-item.done').length;
    const text = document.getElementById('learningProgressText');
    const fill = document.getElementById('learningProgressFill');

    if (text) text.textContent = doneCount + ' dari ' + total + ' materi selesai';
    if (fill) fill.style.width = Math.round((doneCount / total) * 100) + '%';

    const certBtn = document.getElementById('certOpenBtn');
    if (certBtn) certBtn.style.display = (doneCount >= total) ? 'block' : 'none';
}

// ==================================================
// SERTIFIKAT BELAJAR
// Digambar sepenuhnya lewat Canvas 2D API (tanpa
// library eksternal, tanpa asset gambar dari luar).
// Cuma MEMBACA status Learning Path, tidak menulis
// apapun ke localStorage-nya.
// ==================================================

function openCertModal() {
    const backdrop = document.getElementById('certModalBackdrop');
    const box = document.getElementById('certModalBox');
    if (!backdrop) return;

    showCertForm();

    box.classList.remove('anim-fade-scale');
    void box.offsetWidth;
    box.classList.add('anim-fade-scale');

    backdrop.classList.add('open');
    document.body.classList.add('modal-open');

    const input = document.getElementById('certNameInput');
    if (input) setTimeout(() => input.focus(), 150);
}

function closeCertModal() {
    const backdrop = document.getElementById('certModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
}

function closeCertModalOnBackdrop(event) {
    if (event.target.id === 'certModalBackdrop') closeCertModal();
}

function showCertForm() {
    const formView = document.getElementById('certFormView');
    const previewView = document.getElementById('certPreviewView');
    if (formView) formView.style.display = 'block';
    if (previewView) previewView.style.display = 'none';
}

// Helper: tulis teks dengan jarak antar-huruf manual (letter-spacing
// versi Canvas2D, supaya kompatibel di semua browser tanpa bergantung
// pada properti ctx.letterSpacing yang belum didukung semua browser).
function drawSpacedText(ctx, text, centerX, y, spacing) {
    const widths = [...text].map(ch => ctx.measureText(ch).width);
    const totalWidth = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
    let x = centerX - totalWidth / 2;
    const align = ctx.textAlign;
    ctx.textAlign = 'left';
    [...text].forEach((ch, i) => {
        ctx.fillText(ch, x, y);
        x += widths[i] + spacing;
    });
    ctx.textAlign = align;
}

// Helper: gambar persegi dengan sudut membulat (fallback manual,
// tidak bergantung pada ctx.roundRect yang belum ada di semua browser).
function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Helper: bungkus teks body jadi beberapa baris supaya tidak
// keluar dari lebar maksimum yang ditentukan.
function wrapCenteredText(ctx, text, centerX, startY, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let y = startY;
    const lines = [];
    words.forEach(word => {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    });
    if (line) lines.push(line);
    lines.forEach(l => {
        ctx.fillText(l, centerX, y);
        y += lineHeight;
    });
    return y;
}

function generateCertificate() {
    const input = document.getElementById('certNameInput');
    let name = input ? input.value.trim() : '';

    if (!name) {
        alert('Masukkan nama dulu untuk membuat sertifikat.');
        return;
    }
    if (name.length > 30) name = name.slice(0, 30).trim();

    const canvas = document.getElementById('certCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const ORANGE = '#f7931a';
    const ORANGE_LIGHT = '#ffb347';

    // ---------- BACKGROUND ----------
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1c1c22');
    bg.addColorStop(1, '#0a0a0d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ---------- BORDER GANDA ----------
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 18, 18, W - 36, H - 36, 10);
    ctx.stroke();

    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, 38, 38, W - 76, H - 76, 14);
    ctx.stroke();

    ctx.textAlign = 'center';

    // ---------- HEADER ----------
    ctx.fillStyle = ORANGE;
    ctx.font = '700 56px Georgia, "Times New Roman", serif';
    ctx.fillText('₿', W / 2, 118);

    ctx.fillStyle = ORANGE;
    ctx.font = '700 22px Arial, sans-serif';
    drawSpacedText(ctx, 'KAPAZZ BITCOIN', W / 2, 155, 6);

    // ---------- JUDUL ----------
    ctx.fillStyle = '#f5f1e8';
    ctx.font = '700 46px Georgia, "Times New Roman", serif';
    ctx.fillText('SERTIFIKAT PENYELESAIAN', W / 2, 232);

    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 70, 254);
    ctx.lineTo(W / 2 + 70, 254);
    ctx.stroke();

    // ---------- SUB-TEKS ----------
    ctx.fillStyle = '#cfcfd6';
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText('Dengan bangga diberikan kepada', W / 2, 300);

    // ---------- NAMA PENERIMA (auto-shrink) ----------
    let nameFontSize = 68;
    const maxNameWidth = W - 220;
    ctx.font = '700 ' + nameFontSize + 'px Georgia, "Times New Roman", serif';
    while (ctx.measureText(name).width > maxNameWidth && nameFontSize > 28) {
        nameFontSize -= 2;
        ctx.font = '700 ' + nameFontSize + 'px Georgia, "Times New Roman", serif';
    }
    ctx.fillStyle = ORANGE_LIGHT;
    ctx.fillText(name, W / 2, 385);

    // ---------- BODY TEXT ----------
    ctx.fillStyle = '#e4e4e8';
    ctx.font = '20px Arial, sans-serif';
    const bodyText = 'telah berhasil menyelesaikan seluruh 8 materi pembelajaran Bitcoin dalam program ' +
        'Kapazz Bitcoin Journey, mencakup Self-Custody, UTXO & Fee, Privasi & Keamanan, Lightning Network, ' +
        'BIP, Mining, dan On-Chain Analysis.';
    wrapCenteredText(ctx, bodyText, W / 2, 450, W - 320, 30);

    // ---------- FOOTER ----------
    const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#9a9aa2';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('Diterbitkan pada ' + tanggal, 90, H - 80);

    ctx.textAlign = 'right';
    ctx.fillStyle = ORANGE;
    ctx.font = '700 16px Arial, sans-serif';
    ctx.fillText('kapazz09.github.io', W - 150, H - 80);
    const linkWidth = ctx.measureText('kapazz09.github.io').width;
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W - 150 - linkWidth, H - 74);
    ctx.lineTo(W - 150, H - 74);
    ctx.stroke();

    // ---------- STEMPEL / SEAL ----------
    const sealX = W - 150;
    const sealY = H - 150;
    ctx.textAlign = 'center';

    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(247,147,26,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = ORANGE;
    ctx.font = '700 34px Georgia, serif';
    ctx.fillText('₿', sealX, sealY + 12);

    // ---------- TAMPILKAN PREVIEW ----------
    const formView = document.getElementById('certFormView');
    const previewView = document.getElementById('certPreviewView');
    if (formView) formView.style.display = 'none';
    if (previewView) previewView.style.display = 'block';

    const downloadBtn = document.getElementById('certDownloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const safeName = name.replace(/[^a-zA-Z0-9\u00C0-\u00FF]/g, '') || 'saya';
            const link = document.createElement('a');
            link.download = 'sertifikat-kapazz-bitcoin-' + safeName + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
    }
}

// ==================================================
// ABOUT ME: BACA SELENGKAPNYA TOGGLE
// (fungsi toggleAboutMore sekarang ada di about-translations.js,
// supaya label tombol ikut bahasa yang lagi aktif)
// ==================================================

// ==================================================
// INISIALISASI SAAT HALAMAN SELESAI DIMUAT
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    const extra = document.getElementById('aboutExtra');
    if (extra) extra.style.display = 'none';

    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    const bgAudio = document.getElementById('bgMusic');
    if (bgAudio) {
        bgAudio.addEventListener('play', updateMusicButtonIcon);
        bgAudio.addEventListener('pause', updateMusicButtonIcon);
    }
    updateMusicButtonIcon();

    setupToolSwipe();
    restoreLearningProgress();

    if (window.lucide) {
        lucide.createIcons();
    }

    if (typeof BitcoinTools !== 'undefined') {
        BitcoinTools.init();
    }
});

// ==================================================
// TUTUP MODAL (tool / crypto) DENGAN TOMBOL Esc
// ==================================================
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const toolBackdrop = document.getElementById('toolModalBackdrop');
    const cryptoBackdrop = document.getElementById('cryptoModalBackdrop');
    if (toolBackdrop && toolBackdrop.classList.contains('open')) closeToolModal();
    if (cryptoBackdrop && cryptoBackdrop.classList.contains('open')) closeCryptoModal();
});

