// ==================================================
// LIVE BTC PRICE (header ticker)
// ==================================================
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr&include_24hr_change=true')
    .then(response => response.json())
    .then(data => {
        const price = data.bitcoin.usd.toLocaleString('en-US');
        const priceIdr = Math.round(data.bitcoin.idr).toLocaleString('id-ID');
        const change = data.bitcoin.usd_24h_change;

        document.getElementById('btc-price').textContent = '$' + price + ' / Rp' + priceIdr;

        const changeEl = document.getElementById('btc-change');
        const sign = change >= 0 ? '+' : '';
        changeEl.textContent = sign + change.toFixed(1) + '% (24h)';
        changeEl.className = change >= 0 ? 'btc-change positive' : 'btc-change negative';
    })
    .catch(error => {
        document.getElementById('btc-price').textContent = 'N/A';
    });


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
// QR CODE TOGGLE (Fuel the Mission section)
// ==================================================
function toggleQR(coin) {
    const addresses = {
        btc: 'bc1qrm2295j3zhqaxx48evmgwmxnnypc66uzs4ej5x',
        eth: '0xa3b67598Bba5cbD8C519dC8f98EeB5A454EFa137',
        usdt: '0xa3b67598Bba5cbD8C519dC8f98EeB5A454EFa137',
        bnb: '0xa3b67598Bba5cbD8C519dC8f98EeB5A454EFa137',
        xrp: 'rhKT1k4EbfqcCKLDqtFjTJojgDm7m1HiGj',
        sol: 'F5fWxfQqv9FWGHhbVEfnZE94GwL5gJdEv71hdkaeaa8U',
        lightning: 'kapazz09@blink.sv'
    };

    const allCoins = Object.keys(addresses);
    const clickedBox = document.getElementById('qr-' + coin);
    const wasOpen = clickedBox.innerHTML !== '';

    allCoins.forEach(c => {
        const box = document.getElementById('qr-' + c);
        const detail = document.getElementById('detail-' + c);
        const logo = box.parentElement.querySelector('.qr-logo');
        box.innerHTML = '';
        detail.style.display = 'none';
        logo.style.display = 'none';
    });

    if (!wasOpen) {
        new QRCode(clickedBox, addresses[coin]);
        document.getElementById('detail-' + coin).style.display = 'block';
        clickedBox.parentElement.querySelector('.qr-logo').style.display = 'block';

        // Scroll otomatis ke QR yang baru dibuka (sama seperti perilaku toolkit)
        clickedBox.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
// BACKGROUND MUSIC TOGGLE
// ==================================================
function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

// ==================================================
// BITCOIN TOOLKIT: SHOW/HIDE TOOL PANEL
// ==================================================
function showTool(tool, element) {
    document.querySelectorAll('.tool-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    element.classList.add('active');

    const current = document.querySelector('.tool-panel.active');
    if (current) {
        current.classList.remove('active');
    }

    const next = document.getElementById('tool-' + tool);
    if (next) {
        next.classList.add('active');
    }

    document.querySelector('.tool-display').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ==================================================
// ABOUT ME: BACA SELENGKAPNYA TOGGLE
// ==================================================
function toggleAboutMore(btn) {
    const extra = document.getElementById('aboutExtra');
    const isHidden = extra.style.display === 'none' || extra.style.display === '';
    extra.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? 'Tutup' : 'Baca Selengkapnya';
}

// ==================================================
// INISIALISASI SAAT HALAMAN SELESAI DIMUAT
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    const extra = document.getElementById('aboutExtra');
    if (extra) extra.style.display = 'none';

    if (window.lucide) {
        lucide.createIcons();
    }

    if (typeof BitcoinTools !== 'undefined') {
        BitcoinTools.init();
    }
});
