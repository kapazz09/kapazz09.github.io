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
    }
};

function openCryptoModal(coin) {
    const data = CRYPTO_DATA[coin];
    if (!data) return;

    document.getElementById('cryptoModalLogo').src = data.logo;

    const qrBox = document.getElementById('cryptoModalQR');
    qrBox.innerHTML = '';
    new QRCode(qrBox, data.address);

    document.getElementById('cryptoModalDetail').innerHTML =
        data.label + '<br><span class="copy-address" onclick="copyAddress(this)" data-address="' +
        data.address + '">' + data.address + ' <span class="copy-icon">📋</span></span>';

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

