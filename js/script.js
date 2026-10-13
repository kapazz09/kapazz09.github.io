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

// Support My Journey: buka/tutup bagian "Crypto Lainnya" (default tertutup).
// Tinggi panel dihitung dari isi aslinya supaya transisi slide halus di ukuran layar apapun.
function toggleMoreCrypto(btn) {
    const panel = document.getElementById('supportMorePanel');
    if (!panel) return;
    const willOpen = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

    if (willOpen) {
        panel.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        const done = () => {
            panel.removeEventListener('transitionend', done);
            if (panel.classList.contains('open')) panel.style.maxHeight = 'none';
        };
        panel.addEventListener('transitionend', done);
    } else {
        // dari "none" ke tinggi nyata dulu, baru ke 0, supaya animasi tutup tetap halus
        panel.style.maxHeight = panel.scrollHeight + 'px';
        void panel.offsetHeight;
        panel.classList.remove('open');
        panel.style.maxHeight = '0px';
    }
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

    // 8/8 materi -> SELALU tombol "Ikuti Ujian Akhir" (js/exam.js).
    // Sertifikat hanya bisa dibuat tepat setelah lulus ujian, tidak ada tombol permanen.
    const examBtn = document.getElementById('examOpenBtn');
    if (examBtn) examBtn.style.display = (doneCount >= total) ? 'block' : 'none';

    updateContinueLearningButton(Array.from(items), doneCount, total);
}

// Tombol "Lanjutkan dari [Materi] ->" -- cuma tampil kalau progress > 0
// dan < total (sudah mulai, tapi belum tuntas semua). Materi berikutnya
// diambil dari urutan asli daftar #learningList di HTML (data-material-id
// pertama yang belum .done), jadi otomatis selalu sinkron dengan urutan
// resmi tanpa perlu daftar terpisah yang bisa basi.
function updateContinueLearningButton(items, doneCount, total) {
    const btn = document.getElementById('continueLearningBtn');
    if (!btn) return;

    if (doneCount === 0 || doneCount >= total) {
        btn.style.display = 'none';
        return;
    }

    const nextItem = items.find(li => !li.classList.contains('done'));
    const link = nextItem ? nextItem.querySelector('a') : null;
    if (!link) {
        btn.style.display = 'none';
        return;
    }

    const textEl = btn.querySelector('.continue-learning-text');
    if (textEl) textEl.textContent = 'Lanjutkan dari ' + link.textContent.trim() + ' →';
    btn.href = link.getAttribute('href');
    btn.target = link.getAttribute('target') || '_self';
    btn.style.display = 'flex';
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
    certRetryId = null;
    certHasFailed = false;
    clearCertError();
    setCertGenerating(false);

    box.classList.remove('anim-fade-scale');
    void box.offsetWidth;
    box.classList.add('anim-fade-scale');

    backdrop.classList.add('open');
    document.body.classList.add('modal-open');

    const input = document.getElementById('certNameInput');
    if (input) setTimeout(() => input.focus(), 150);
}

// force=true dipakai setelah user mengonfirmasi (lihat requestCertClose di js/exam.js).
// Selama hak sertifikat aktif / sertifikat belum diunduh, penutupan dicegat dan
// dialog konfirmasi yang tampil.
function closeCertModal(force) {
    if (!force && typeof requestCertClose === 'function' && requestCertClose()) return;
    const backdrop = document.getElementById('certModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    if (!document.querySelector('.tool-modal-backdrop.open')) document.body.classList.remove('modal-open');
}

function closeCertModalOnBackdrop(event) {
    if (event.target.id !== 'certModalBackdrop') return;
    // Pengaman: selama hak sertifikat belum terpakai, tap di luar modal diabaikan
    if (typeof certRightIsActive === 'function' && certRightIsActive()) return;
    closeCertModal();
}

function showCertForm() {
    const formView = document.getElementById('certFormView');
    const previewView = document.getElementById('certPreviewView');
    if (formView) formView.style.display = 'block';
    if (previewView) previewView.style.display = 'none';
}

// ---------- VERIFIKASI SERTIFIKAT: Certificate ID + simpan ke server ----------
// Format ID: KAPAZZ-BTC-{YYYYMMDD}-{4 karakter acak: A-Z tanpa I/O + angka 2-9}.
// Disimpan ke sheet "Certificates" lewat Web App Apps Script yang sama
// dengan rating & komentar (RATING_API_URL di ratings.js), action=saveCertificate.
const CERT_MAX_ATTEMPTS = 3;
const CERT_TOTAL_MODULES = 8;
let certGenerating = false;

function makeCertificateId(ymd) {
    // Tanpa 0, O, 1, I supaya ID mudah dibaca/diketik (32 karakter -> acak merata tanpa bias)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const buf = new Uint32Array(4);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(buf);
    } else {
        for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 4294967296);
    }
    let rand = '';
    for (let i = 0; i < 4; i++) rand += chars[buf[i] % chars.length];
    return 'KAPAZZ-BTC-' + ymd + '-' + rand;
}

function saveCertificateToServer(id, name, tanggal, score) {
    if (typeof RATING_API_URL === 'undefined') {
        return Promise.reject(new Error('API belum siap'));
    }
    const url = RATING_API_URL + '?action=saveCertificate' +
        '&id=' + encodeURIComponent(id) +
        '&nama=' + encodeURIComponent(name) +
        '&tanggalTerbit=' + encodeURIComponent(tanggal) +
        '&jumlahModul=' + CERT_TOTAL_MODULES +
        '&skor=' + encodeURIComponent(score);

    // Batas waktu 15 detik supaya tidak menggantung selamanya kalau koneksi buruk
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 15000) : null;

    return fetch(url, controller ? { signal: controller.signal } : undefined)
        .then(res => res.json())
        .then(data => (data && data.status) ? data.status : 'error')
        .finally(() => { if (timer) clearTimeout(timer); });
}

// Status alur generate (untuk fitur "Coba Lagi" kalau penyimpanan gagal)
let certRetryId = null;     // ID dari percobaan gagal (dipakai ulang kecuali server balas "duplicate")
let certHasFailed = false;

function setCertGenerating(isBusy) {
    certGenerating = isBusy;
    const btn = document.getElementById('certGenerateBtn');
    if (!btn) return;
    btn.disabled = isBusy;
    btn.textContent = isBusy ? 'Menyimpan...' : (certHasFailed ? '🔄 Coba Lagi' : 'Generate Sertifikat');
}

function showCertError(message) {
    const el = document.getElementById('certError');
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
}

function clearCertError() {
    const el = document.getElementById('certError');
    if (!el) return;
    el.textContent = '';
    el.style.display = 'none';
}

function copyTextFallback(text, onDone) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (ok) onDone(); else alert('Salin manual Certificate ID ini: ' + text);
}

// Salin teks (ID atau link verifikasi) + umpan balik di tombol
function copyCertificateText(text, btn, label) {
    const done = () => {
        btn.textContent = '✓ Tersalin';
        setTimeout(() => { btn.textContent = label; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => copyTextFallback(text, done));
    } else {
        copyTextFallback(text, done);
    }
}

function generateCertificate() {
    if (certGenerating) return;

    // Sertifikat hanya bisa dibuat selama hak dari lulus ujian masih aktif (js/exam.js)
    if (typeof certRightIsActive === 'function' && !certRightIsActive()) {
        showCertError('Sertifikat hanya bisa dibuat langsung setelah lulus Ujian Akhir. Ikuti ujian lagi untuk membuatnya.');
        return;
    }

    // Skor yang dicetak = skor ujian yang BARU SAJA lulus (dari memori, bukan localStorage)
    const score = (typeof certRightScore === 'function') ? certRightScore() : null;
    if (!Number.isInteger(score) || score < 16 || score > CERT_TOTAL_QUESTIONS) {
        showCertError('Skor ujian tidak valid. Ikuti ujian lagi untuk membuat sertifikat.');
        return;
    }

    const input = document.getElementById('certNameInput');
    let name = input ? input.value.trim() : '';

    if (!name) {
        alert('Masukkan nama dulu untuk membuat sertifikat.');
        return;
    }
    if (name.length > 30) name = name.slice(0, 30).trim();

    const now = new Date();
    const tanggal = formatTanggalIndonesia(now);
    const ymd = now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');

    clearCertError();
    setCertGenerating(true);

    // Simpan ID ke server DULU; sertifikat baru digambar kalau berhasil.
    // Kalau server balas "duplicate", acak ulang 4 karakter dan coba lagi (maks 3x).
    // Setelah gagal koneksi, ID yang sama dipakai ulang di percobaan berikutnya.
    let lastId = null;
    let lastStatus = 'network';
    const attempt = (n) => {
        const certId = (n === 1 && certRetryId) ? certRetryId : makeCertificateId(ymd);
        lastId = certId;
        return saveCertificateToServer(certId, name, tanggal, score).then(status => {
            lastStatus = status;
            if (status === 'success') return certId;
            if (status === 'duplicate' && n < CERT_MAX_ATTEMPTS) return attempt(n + 1);
            throw new Error(status);
        });
    };

    // Template + font dimuat DULU (sebelum ID disimpan), supaya gagal muat tidak menghabiskan ID.
    loadCertificateAssets().then(() => {
        return attempt(1).then(certId => {
            certRetryId = null;
            certHasFailed = false;
            setCertGenerating(false);
            renderCertificate(name, tanggal, certId, score);
        }, () => {
            // Hak TIDAK hilang, nama di kolom input tetap ada
            certRetryId = (lastStatus === 'duplicate') ? null : lastId;
            certHasFailed = true;
            setCertGenerating(false);
            showCertError('Gagal menyimpan sertifikat ke server. Periksa koneksi internetmu lalu tekan "Coba Lagi".');
        });
    }, () => {
        certHasFailed = true;
        setCertGenerating(false);
        showCertError('Gagal memuat desain sertifikat. Periksa koneksi internetmu lalu tekan "Coba Lagi".');
    });
}

// Gambar sertifikat (js/certificate.js) lalu tampilkan preview + tombol salin/unduh.
function renderCertificate(name, tanggal, certId, score) {
    const canvas = document.getElementById('certCanvas');
    if (!canvas || !canvas.getContext) return;
    drawCertificate(canvas, name, tanggal, certId, score);

    // ---------- TAMPILKAN PREVIEW ----------
    const formView = document.getElementById('certFormView');
    const previewView = document.getElementById('certPreviewView');
    if (formView) formView.style.display = 'none';
    if (previewView) previewView.style.display = 'block';

    const idText = document.getElementById('certIdText');
    if (idText) idText.textContent = certId;
    const copyBtn = document.getElementById('certIdCopyBtn');
    if (copyBtn) {
        copyBtn.textContent = '📋 Salin';
        copyBtn.onclick = () => copyCertificateText(certId, copyBtn, '📋 Salin');
    }
    const linkBtn = document.getElementById('certLinkCopyBtn');
    if (linkBtn) {
        linkBtn.textContent = '🔗 Salin Link Verifikasi';
        linkBtn.onclick = () => copyCertificateText(certVerifyUrl(certId), linkBtn, '🔗 Salin Link Verifikasi');
    }

    const downloadBtn = document.getElementById('certDownloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const safeName = name.replace(/[^a-zA-Z0-9\u00C0-\u00FF]/g, '') || 'saya';
            const link = document.createElement('a');
            link.download = 'sertifikat-kapazz-bitcoin-' + safeName + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (typeof onCertificateDownloaded === 'function') onCertificateDownloaded();
        };
    }

    // Sertifikat sudah digambar DAN ID tersimpan di server -> hak membuat sertifikat terpakai
    if (typeof onCertificateIssued === 'function') onCertificateIssued();
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
    const quickNavBackdrop = document.getElementById('quickNavBackdrop');
    if (toolBackdrop && toolBackdrop.classList.contains('open')) closeToolModal();
    if (cryptoBackdrop && cryptoBackdrop.classList.contains('open')) closeCryptoModal();
    if (quickNavBackdrop && quickNavBackdrop.classList.contains('open')) closeQuickNav();
});

// ==================================================
// TOMBOL MELAYANG: NAVIGASI CEPAT + SEARCH
// Index pencarian dibangun dari elemen yang SUDAH ADA di
// halaman (tool-icon, glossaryData, daftar materi, FAQ) --
// bukan daftar terpisah -- supaya otomatis selalu sinkron
// tanpa perlu diupdate manual tiap ada tool/materi/FAQ baru.
// ==================================================
let quickNavIndexCache = null;

function escapeHtmlLite(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}

function buildQuickNavSearchIndex() {
    const index = [];

    // TOOLS (10 tool di Bitcoin Toolkit)
    document.querySelectorAll('.toolkit-icons .tool-icon').forEach(el => {
        const name = (el.querySelector('span')?.textContent || '').trim();
        const desc = (el.querySelector('.tool-desc')?.textContent || '').trim();
        if (!name) return;
        index.push({
            type: 'tool',
            title: name,
            subtitle: desc,
            action: () => { closeQuickNav(); el.click(); }
        });
    });

    // GLOSSARY (dari BitcoinTools.glossaryData yang sudah ada di glossary.js)
    if (typeof BitcoinTools !== 'undefined' && Array.isArray(BitcoinTools.glossaryData)) {
        const glossaryIcon = document.querySelector('.tool-icon[data-tool="glossary"]');
        BitcoinTools.glossaryData.forEach(item => {
            index.push({
                type: 'glossary',
                title: item.term,
                subtitle: item.def,
                action: () => {
                    closeQuickNav();
                    if (glossaryIcon) glossaryIcon.click();
                    setTimeout(() => {
                        const searchInput = document.getElementById('glossarySearch');
                        if (searchInput) {
                            searchInput.value = item.term;
                            searchInput.dispatchEvent(new Event('input'));
                        }
                    }, 80);
                }
            });
        });
    }

    // MATERI (8 materi belajar, urutan & link diambil langsung dari #learningList)
    document.querySelectorAll('#learningList .learning-item a').forEach(a => {
        const title = a.textContent.trim();
        if (!title) return;
        index.push({
            type: 'materi',
            title: title,
            subtitle: 'Materi belajar',
            action: () => { closeQuickNav(); a.click(); }
        });
    });

    // FAQ (pertanyaan yang sudah ada di section FAQ)
    document.querySelectorAll('.faq-item').forEach(item => {
        const q = (item.querySelector('.faq-question span')?.textContent || '').trim();
        if (!q) return;
        index.push({
            type: 'faq',
            title: q,
            subtitle: '',
            action: () => {
                closeQuickNav();
                const list = document.getElementById('faqList');
                if (list && (list.style.display === 'none' || list.style.display === '')) {
                    toggleFaqSection();
                }
                item.classList.add('open');
                setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
            }
        });
    });

    return index;
}

function getQuickNavIndex() {
    if (!quickNavIndexCache) quickNavIndexCache = buildQuickNavSearchIndex();
    return quickNavIndexCache;
}

const QUICK_NAV_TYPE_META = {
    tool: { icon: '🧰', label: 'Tool' },
    glossary: { icon: '📖', label: 'Glossary' },
    materi: { icon: '📚', label: 'Materi' },
    faq: { icon: '❓', label: 'FAQ' }
};

function renderQuickNavResults(query) {
    const resultsEl = document.getElementById('quickNavResults');
    if (!resultsEl) return;

    const q = query.trim().toLowerCase();
    if (!q) {
        resultsEl.classList.remove('show');
        resultsEl.innerHTML = '';
        return;
    }

    const matches = getQuickNavIndex()
        .filter(item =>
            item.title.toLowerCase().includes(q) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q))
        )
        .slice(0, 20);

    resultsEl.classList.add('show');

    if (matches.length === 0) {
        resultsEl.innerHTML = '<p class="quick-nav-no-result">Tidak ditemukan.</p>';
        return;
    }

    resultsEl.innerHTML = matches.map((item, i) => {
        const meta = QUICK_NAV_TYPE_META[item.type];
        const subtitleText = item.subtitle ? (meta.label + ' — ' + item.subtitle) : meta.label;
        return '<button type="button" class="quick-nav-result-item" data-result-index="' + i + '">' +
            '<span class="quick-nav-result-icon">' + meta.icon + '</span>' +
            '<span class="quick-nav-result-text">' +
            '<strong>' + escapeHtmlLite(item.title) + '</strong>' +
            '<small>' + escapeHtmlLite(subtitleText) + '</small>' +
            '</span>' +
            '</button>';
    }).join('');

    resultsEl.querySelectorAll('.quick-nav-result-item').forEach((btn, i) => {
        btn.addEventListener('click', () => matches[i].action());
    });
}

function openQuickNav() {
    const backdrop = document.getElementById('quickNavBackdrop');
    const panel = document.getElementById('quickNavPanel');
    if (!backdrop || !panel) return;

    panel.classList.remove('anim-fade-scale');
    void panel.offsetWidth;
    panel.classList.add('anim-fade-scale');

    backdrop.classList.add('open');
    document.body.classList.add('modal-open');

    const input = document.getElementById('quickNavSearchInput');
    if (input) {
        input.value = '';
        renderQuickNavResults('');
        setTimeout(() => input.focus(), 150);
    }
}

function closeQuickNav() {
    const backdrop = document.getElementById('quickNavBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
}

function closeQuickNavOnBackdrop(event) {
    if (event.target.id === 'quickNavBackdrop') closeQuickNav();
}

function quickNavScrollTo(selector) {
    closeQuickNav();
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('quickNavSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderQuickNavResults(e.target.value));
    }
});

