// ==================================================
// SERTIFIKAT: GAMBAR DI CANVAS (desain "Bitcoin Journey Certificate of Achievement")
// Kanvas 1478x1064. Semua elemen statis (logo, judul, laurel, label, daftar
// materi, "SCAN TO VERIFY") sudah ada di template gambar; kode ini hanya
// menuliskan elemen dinamis: nama, skor ujian, nilai akhir, tanggal terbit,
// Certificate ID, dan QR verifikasi.
// Template : assets/certificate/certificate-template.webp
// Font     : assets/fonts/ (self-host, didaftarkan lewat @font-face di css/style.css)
// QR       : js/vendor/qrcode.js (qrcode-generator, MIT)
// ==================================================
const CERT_W = 1478;
const CERT_H = 1064;
const CERT_TEMPLATE_SRC = 'assets/certificate/certificate-template.webp';
const CERT_VERIFY_BASE = 'https://kapazz09.github.io/verify/';
const CERT_TOTAL_QUESTIONS = 21;

const CERT_FONT_SERIF = '"Merriweather", Georgia, serif';
const CERT_FONT_SANS = '"Noto Sans", Arial, sans-serif';

const CERT_MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
    'Agustus', 'September', 'Oktober', 'November', 'Desember'];

let certTemplateImg = null;
let certAssetsPromise = null;

// "10 Oktober 2026" (nama bulan ditulis sendiri, tidak bergantung data locale browser)
function formatTanggalIndonesia(date) {
    return date.getDate() + ' ' + CERT_MONTHS_ID[date.getMonth()] + ' ' + date.getFullYear();
}

function certVerifyUrl(id) {
    return CERT_VERIFY_BASE + '?id=' + encodeURIComponent(id);
}

// Nilai akhir = skor/21*100, satu desimal, tanpa tanda % (contoh "85.7", "100.0")
function certFinalScore(score) {
    return (score / CERT_TOTAL_QUESTIONS * 100).toFixed(1);
}

// Muat template + font. Dipanggil SEBELUM Certificate ID disimpan ke server,
// supaya kegagalan memuat aset tidak menghabiskan ID. Gagal -> promise ditolak
// dan percobaan berikutnya mengulang dari awal.
function loadCertificateAssets() {
    if (certAssetsPromise) return certAssetsPromise;

    const imgReady = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('template'));
        img.src = CERT_TEMPLATE_SRC;
    });

    const fontSpecs = ['700 76px "Merriweather"', '500 17px "Noto Sans"'];
    const fontsReady = (document.fonts && document.fonts.load)
        ? Promise.all(fontSpecs.map(spec => document.fonts.load(spec).then(faces => {
            if (!faces || !faces.length) throw new Error('font');
        })))
        : Promise.resolve();

    certAssetsPromise = Promise.all([imgReady, fontsReady]).then(results => {
        certTemplateImg = results[0];
        return true;
    }).catch(err => {
        certAssetsPromise = null;
        throw err;
    });
    return certAssetsPromise;
}

// Kecilkan font sampai lebar teks <= maxWidth (tidak lebih kecil dari minSize)
function certFitFontSize(ctx, text, weight, startSize, minSize, maxWidth, family) {
    let size = startSize;
    ctx.font = weight + ' ' + size + 'px ' + family;
    while (ctx.measureText(text).width > maxWidth && size > minSize) {
        size -= 0.5;
        ctx.font = weight + ' ' + size + 'px ' + family;
    }
    return size;
}

// NAMA: rata tengah x=740, gradasi emas vertikal + glow oranye halus, maks 440px
// (di antara dua laurel, x 520-960). Ukuran font mengecil otomatis; di bawah
// ±44px tetap mengecil sampai muat (nama 30 karakter tidak mungkin muat di
// 440px pada 44px); sebagai jaring pengaman terakhir teks dipipihkan horizontal.
// Jarak antar-huruf ±2px (proporsional dengan ukuran font), sesuai desain acuan.
function certDrawName(ctx, name) {
    const MAX_W = 440;
    const CX = 740;
    const SPACING_RATIO = 0.027;
    const chars = [...name];
    const nativeSpacing = ('letterSpacing' in ctx);

    // Lebar visual teks pada ukuran tertentu (tanpa spasi sisa di ujung)
    const measure = (size) => {
        ctx.font = '700 ' + size + 'px ' + CERT_FONT_SERIF;
        const sp = size * SPACING_RATIO;
        if (nativeSpacing) {
            ctx.letterSpacing = sp + 'px';
            const w = ctx.measureText(name).width - sp;
            ctx.letterSpacing = '0px';
            return w;
        }
        return chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0) + sp * (chars.length - 1);
    };

    let size = 75;
    let width = measure(size);
    while (width > MAX_W && size > 24) {
        size -= 1;
        width = measure(size);
    }
    const squeeze = width > MAX_W ? MAX_W / width : 1;
    const spacing = size * SPACING_RATIO;

    ctx.font = '700 ' + size + 'px ' + CERT_FONT_SERIF;
    const cap = ctx.measureText('H').actualBoundingBoxAscent;
    const baseline = Math.round(478.5 + cap / 2);   // tengah huruf kapital tetap di y=478.5

    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.translate(CX, baseline);
    ctx.scale(squeeze, 1);

    // Gradasi dibuat DI DALAM sistem koordinat yang sudah digeser: y=-cap (atas huruf) .. 0 (baseline)
    const grad = ctx.createLinearGradient(0, -cap, 0, 0);
    grad.addColorStop(0, '#F6A321');
    grad.addColorStop(0.5, '#F69614');
    grad.addColorStop(1, '#F28F0E');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(246,150,20,0.2)';
    ctx.shadowBlur = 12;

    if (nativeSpacing) {
        ctx.letterSpacing = spacing + 'px';
        ctx.fillText(name, -width / 2, 0);
        ctx.letterSpacing = '0px';
    } else {
        let x = -width / 2;
        chars.forEach(ch => {
            ctx.fillText(ch, x, 0);
            x += ctx.measureText(ch).width + spacing;
        });
    }
    ctx.restore();
}

// Teks dengan jarak antar-huruf manual (tidak bergantung ctx.letterSpacing)
function certDrawSpacedText(ctx, text, x, y, spacing) {
    let cx = x;
    for (const ch of text) {
        ctx.fillText(ch, cx, y);
        cx += ctx.measureText(ch).width + spacing;
    }
}

function certRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// QR verifikasi: modul digambar sendiri (bilangan bulat, tanpa smoothing) supaya
// tajam. Persegi putih berpusat di (1350.5, 874.5) menutup kotak putih template.
function certDrawQr(ctx, url) {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const QUIET = 4;
    let mod = 3;
    if ((count + QUIET * 2) * mod > 146) mod = 2;   // jaga jarak dari teks di atas/bawah QR
    const size = (count + QUIET * 2) * mod;
    const x0 = Math.round(1350.5 - size / 2);
    const y0 = Math.round(874.5 - size / 2);

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    certRoundedRect(ctx, x0, y0, size, size, 4);
    ctx.fill();

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000000';
    for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
                ctx.fillRect(x0 + (QUIET + c) * mod, y0 + (QUIET + r) * mod, mod, mod);
            }
        }
    }
    ctx.restore();
}

// Gambar sertifikat lengkap. Aset harus sudah dimuat (loadCertificateAssets).
function drawCertificate(canvas, name, tanggal, certId, score) {
    if (!certTemplateImg) throw new Error('Aset sertifikat belum dimuat');
    canvas.width = CERT_W;
    canvas.height = CERT_H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CERT_W, CERT_H);
    ctx.drawImage(certTemplateImg, 0, 0, CERT_W, CERT_H);

    // a) NAMA
    certDrawName(ctx, name);

    // b) SKOR UJIAN dan c) NILAI AKHIR (serif tebal, putih keabuan)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#F2F3F4';
    ctx.font = '700 40px ' + CERT_FONT_SERIF;
    ctx.fillText(score + '/' + CERT_TOTAL_QUESTIONS, 785, 695);
    ctx.fillText(certFinalScore(score), 1109, 695);
    ctx.restore();

    // d) TANGGAL TERBIT: rata kiri x=93, maks 205px (garis pemisah vertikal di x≈314)
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#EBECEE';
    certFitFontSize(ctx, tanggal, '700', 23.5, 14, 205, CERT_FONT_SERIF);
    ctx.fillText(tanggal, 93, 978);
    ctx.restore();

    // e) CERTIFICATE ID
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#D5D7DA';
    ctx.font = '500 18px ' + CERT_FONT_SANS;
    certDrawSpacedText(ctx, certId, 354, 976, 0.5);
    ctx.restore();

    // f) QR
    certDrawQr(ctx, certVerifyUrl(certId));
}
