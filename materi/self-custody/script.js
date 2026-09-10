/*==================================================
    MATERI: SELF-CUSTODY & COLD WALLET — SCRIPT
==================================================*/

/*------------------------------------------------
    READING PROGRESS BAR
    Terisi sesuai persentase scroll user di halaman.
------------------------------------------------*/
function updateReadingProgress() {
    const fill = document.getElementById("readingProgressFill");
    if (!fill) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

    fill.style.width = percent + "%";
}

/*------------------------------------------------
    DATA CONTOH WALLET (khusus materi ini)
    icon: hanya diisi untuk hot wallet, filenya nanti
    disimpan di assets/wallet-icons/<nama>.png — kalau
    file belum ada / gagal dimuat, popup otomatis pakai
    fallback lingkaran huruf inisial (lihat renderPopupIcon).
------------------------------------------------*/
const WALLET_DATA = {
    "trust-wallet": {
        name: "Trust Wallet",
        type: "hot",
        icon: "assets/wallet-icons/trust-wallet.png",
        desc: "Wallet non-custodial multi-koin yang cukup populer, jadi bisa dipakai buat Bitcoin on-chain sekaligus aset kripto lain dalam satu aplikasi.",
        meta: "Platform: iOS, Android, ekstensi browser",
        features: ["Mendukung banyak koin & token, bukan cuma Bitcoin", "Ada DApp browser bawaan", "Fitur staking untuk koin tertentu"],
        note: "Cocok kalau kamu juga memegang aset kripto lain selain Bitcoin."
    },
    metamask: {
        name: "MetaMask",
        type: "hot",
        icon: "assets/wallet-icons/metamask.png",
        desc: "Wallet non-custodial paling populer buat ekosistem Ethereum dan jaringan kompatibel EVM lainnya (BSC, Polygon, Arbitrum, dll). Penting dicatat: MetaMask TIDAK mendukung Bitcoin on-chain asli — kalau mau pegang \"BTC\" di sini, itu biasanya versi wrapped token (misalnya WBTC) di jaringan EVM, bukan Bitcoin jaringan utama.",
        meta: "Platform: iOS, Android, ekstensi browser",
        features: ["Non-custodial, private key tersimpan lokal di perangkat", "Standar dompet untuk berinteraksi dengan DApp & smart contract EVM", "Tidak native untuk BTC on-chain — hanya token wrapped di jaringan EVM"],
        note: "Cocok untuk aktivitas di ekosistem Ethereum/EVM, bukan untuk menyimpan Bitcoin murni."
    },
    "bitget-wallet": {
        name: "Bitget Wallet",
        type: "hot",
        icon: "assets/wallet-icons/bitget-wallet.png",
        desc: "Wallet multi-chain yang mendukung Bitcoin on-chain dan puluhan jaringan lain dalam satu aplikasi. Di Indonesia, Bitget Wallet juga punya fitur pembayaran QRIS langsung dari saldo kripto di dalam aplikasi — jadi kamu bisa bayar merchant yang menerima QRIS memakai saldo USDT tanpa perlu cairkan dulu ke rekening bank.",
        meta: "Platform: iOS, Android, ekstensi browser",
        features: ["Mendukung Bitcoin on-chain & banyak jaringan lain", "Fitur bayar QRIS langsung pakai saldo USDT (khusus pengguna Indonesia)", "Ada DApp browser & fitur swap bawaan"],
        note: "Cocok untuk yang mau satu aplikasi buat pegang Bitcoin sekaligus belanja harian pakai QRIS."
    },
    electrum: {
        name: "Electrum (Desktop)",
        type: "hot",
        icon: "assets/wallet-icons/electrum.png",
        desc: "Salah satu wallet Bitcoin tertua yang masih aktif dipakai, ringan, dan sudah teruji bertahun-tahun.",
        meta: "Platform: Windows, Mac, Linux",
        features: ["Ringan dan cepat", "Sudah ada sejak 2011, battle-tested", "Kompatibel dengan banyak hardware wallet (Ledger, Trezor, Coldcard, dll)"],
        note: "Cocok untuk pengguna desktop yang mau kontrol penuh dan sering pakai hardware wallet."
    },
    blink: {
        name: "Blink Wallet",
        type: "hot",
        icon: "assets/wallet-icons/blink-wallet.png",
        desc: "Wallet Lightning Network yang bersifat custodial — private key-mu dikelola oleh pihak Blink, mirip pengalaman pakai e-wallet biasa: tinggal install, langsung bisa kirim/terima Bitcoin lewat Lightning tanpa perlu atur channel sendiri.",
        meta: "Platform: iOS, Android — Lightning Network (Custodial)",
        features: ["Custodial — private key dipegang Blink, bukan kamu sendiri", "Setup instan, tanpa perlu buka channel Lightning manual", "Praktis untuk transaksi Lightning sehari-hari dalam jumlah kecil"],
        note: "Cocok untuk coba-coba Lightning dengan cepat, tapi ingat: karena custodial, ini bukan self-custody sesuai prinsip di materi ini — jangan simpan dana besar di sini."
    },
    phoenix: {
        name: "Phoenix Wallet",
        type: "hot",
        icon: "assets/wallet-icons/phoenix-wallet.png",
        desc: "Wallet Lightning Network non-custodial — kamu tetap pegang kendali penuh atas private key, tapi rumitnya membuka dan mengelola channel Lightning ditangani otomatis di belakang layar oleh aplikasinya.",
        meta: "Platform: iOS, Android — Lightning Network (Non-Custodial)",
        features: ["Non-custodial — private key sepenuhnya di tanganmu", "Manajemen channel Lightning otomatis, tidak perlu ribet manual", "Dikembangkan oleh tim ACINQ, salah satu kontributor inti Lightning Network"],
        note: "Cocok untuk yang mau pakai Lightning tapi tetap pegang prinsip self-custody."
    },
    ledger: {
        name: "Ledger",
        type: "cold",
        desc: "Hardware wallet paling populer di pasaran, tersedia dalam beberapa seri seperti Nano S Plus dan Nano X.",
        meta: "Koneksi: USB, Bluetooth (khusus seri Nano X)",
        features: ["Pakai chip secure element khusus", "Dukung ratusan koin lewat aplikasi Ledger Live", "Ada seri dengan koneksi Bluetooth"],
        note: "Cocok untuk yang mau hardware wallet mainstream dengan ekosistem aplikasi lengkap.",
        images: [
            { series: "Nano S Plus", src: "assets/wallet-images/ledger-nano-s-plus.png" },
            { series: "Nano X", src: "assets/wallet-images/ledger-nano-x.png" },
            { series: "Stax", src: "assets/wallet-images/ledger-stax.png" }
        ]
    },
    trezor: {
        name: "Trezor",
        type: "cold",
        desc: "Hardware wallet open-source pertama di dunia, dikelola lewat aplikasi Trezor Suite.",
        meta: "Koneksi: USB",
        features: ["Firmware open-source", "Beberapa model punya layar sentuh", "Bisa tambah passphrase custom untuk keamanan ekstra"],
        note: "Cocok untuk yang mengutamakan transparansi open-source.",
        images: [
            { series: "Model One", src: "assets/wallet-images/trezor-model-one.png" },
            { series: "Model T", src: "assets/wallet-images/trezor-model-t.png" },
            { series: "Safe 7", src: "assets/wallet-images/trezor-safe-7.png" }
        ]
    },
    bitbox: {
        name: "BitBox",
        type: "cold",
        desc: "Hardware wallet asal Swiss (BitBox02) yang fokus pada desain simpel dan minimalis.",
        meta: "Koneksi: USB",
        features: ["Desain ringkas dan minimalis", "Ada varian khusus Bitcoin-only", "Backup dilakukan lewat microSD"],
        note: "Cocok untuk yang mau pengalaman simpel tanpa banyak koin lain.",
        images: [
            { series: "BitBox02 (Multi-edition)", src: "assets/wallet-images/bitbox02-multi.png" },
            { series: "BitBox02 (Bitcoin-only)", src: "assets/wallet-images/bitbox02-btc-only.png" }
        ]
    },
    coldcard: {
        name: "Coldcard",
        type: "cold",
        desc: "Hardware wallet air-gapped favorit komunitas Bitcoin maksimalis, transaksi ditandatangani lewat microSD atau QR code.",
        meta: "Koneksi: Air-gapped (microSD/QR), USB hanya opsional untuk daya",
        features: ["Bisa dipakai sepenuhnya air-gapped (tanpa USB sama sekali)", "Dukung setup multisig tingkat lanjut", "Open-source dan fokus Bitcoin-only"],
        note: "Cocok untuk yang mengutamakan keamanan maksimal dan tidak keberatan sedikit lebih ribet.",
        images: [
            { series: "Mk4", src: "assets/wallet-images/coldcard-mk4.png" },
            { series: "Q", src: "assets/wallet-images/coldcard-q.png" }
        ]
    },
    keystone: {
        name: "Keystone",
        type: "cold",
        desc: "Hardware wallet air-gapped dengan layar sentuh besar, semua transfer data lewat QR code.",
        meta: "Koneksi: Air-gapped (QR code)",
        features: ["Layar besar dan touchscreen", "Sepenuhnya air-gapped lewat QR code", "Open-source, dukung multisig"],
        note: "Cocok untuk yang mau pengalaman air-gapped dengan tampilan lebih modern.",
        images: [
            { series: "Keystone Pro", src: "assets/wallet-images/keystone-pro.png" },
            { series: "Keystone 3 Pro", src: "assets/wallet-images/keystone-3-pro.png" }
        ]
    },
    safepal: {
        name: "SafePal",
        type: "cold",
        desc: "Hardware wallet air-gapped dengan harga lebih terjangkau, cocok buat yang baru mulai coba cold storage.",
        meta: "Koneksi: Air-gapped (QR code)",
        features: ["Harga relatif terjangkau", "Air-gapped lewat QR code", "Dukung banyak koin & token"],
        note: "Cocok untuk yang baru mulai coba cold wallet dengan budget terbatas.",
        images: [
            { series: "S1", src: "assets/wallet-images/safepal-s1.png" },
            { series: "X1 Pro", src: "assets/wallet-images/safepal-x1-pro.png" }
        ]
    }
};

/*------------------------------------------------
    POPUP KECIL (REUSABLE)
    showPopup(data) adalah fungsi inti — dipakai lewat 2
    pemanggil: openPopup(title, text) untuk kasus simpel
    (istilah glossary & detail diagram custody), dan
    openWalletPopup(key) untuk kartu contoh wallet yang
    kontennya lebih lengkap (ikon/platform/fitur/catatan).
    Pola ini dipakai ulang di materi berikutnya — cukup
    salin fungsi-fungsi ini apa adanya.
------------------------------------------------*/
function showPopup(data) {
    const backdrop = document.getElementById("popupBackdrop");
    const box = document.getElementById("popupBox");
    const titleEl = document.getElementById("popupTitle");
    const textEl = document.getElementById("popupText");
    const iconWrap = document.getElementById("popupIconWrap");
    const iconImg = document.getElementById("popupIcon");
    const iconFallback = document.getElementById("popupIconFallback");
    const metaEl = document.getElementById("popupMeta");
    const featuresEl = document.getElementById("popupFeatures");
    const noteEl = document.getElementById("popupNote");
    if (!backdrop || !titleEl || !textEl) return;

    titleEl.textContent = data.title || "";
    textEl.textContent = data.text || "";

    // Ikon (hanya dipakai kartu hot wallet). Kalau gambar gagal dimuat
    // (belum diupload / path salah), otomatis fallback ke huruf inisial.
    if (data.icon) {
        iconWrap.style.display = "flex";
        iconImg.style.display = "block";
        iconFallback.style.display = "none";
        iconImg.src = data.icon;
        iconImg.alt = data.title || "";
        iconImg.onerror = () => {
            iconImg.style.display = "none";
            iconFallback.style.display = "flex";
            iconFallback.textContent = (data.title || "?").trim().charAt(0).toUpperCase();
        };
    } else {
        iconWrap.style.display = "none";
    }

    if (data.meta) {
        metaEl.style.display = "block";
        metaEl.textContent = data.meta;
    } else {
        metaEl.style.display = "none";
    }

    if (data.features && data.features.length) {
        featuresEl.style.display = "block";
        featuresEl.innerHTML = data.features.map(f => "<li>" + f + "</li>").join("");
    } else {
        featuresEl.style.display = "none";
        featuresEl.innerHTML = "";
    }

    if (data.note) {
        noteEl.style.display = "block";
        noteEl.textContent = data.note;
    } else {
        noteEl.style.display = "none";
    }

    setupWalletGallery(data.images);

    box.classList.remove("anim-fade-scale");
    void box.offsetWidth;
    box.classList.add("anim-fade-scale");

    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
}

function openPopup(title, text) {
    showPopup({ title, text });
}

function openWalletPopup(key) {
    const w = WALLET_DATA[key];
    if (!w) return;
    showPopup({
        title: w.name,
        text: w.desc,
        icon: w.type === "hot" ? w.icon : null,
        meta: w.meta,
        features: w.features,
        note: w.note,
        images: w.images
    });
}

/*------------------------------------------------
    GALERI CONTOH GAMBAR SERI (khusus popup cold wallet)
    Tombol "Lihat Contoh Gambar" toggle buka/tutup galeri;
    panah kiri/kanan pindah antar seri produk. Kalau
    gambar belum ada di folder assets (belum diupload
    user), otomatis tampil teks fallback "Gambar belum
    tersedia" alih-alih gambar rusak.
------------------------------------------------*/
let currentGalleryImages = [];
let currentGalleryIndex = 0;

function setupWalletGallery(images) {
    const toggleBtn = document.getElementById("popupGalleryToggle");
    const gallery = document.getElementById("popupGallery");
    if (!toggleBtn || !gallery) return;

    // Reset state tiap kali popup baru dibuka
    gallery.classList.remove("open");
    toggleBtn.classList.remove("active");
    toggleBtn.innerHTML = '<i data-lucide="images"></i> Lihat Contoh Gambar';
    currentGalleryImages = (images && images.length) ? images : [];
    currentGalleryIndex = 0;

    if (!currentGalleryImages.length) {
        toggleBtn.style.display = "none";
        return;
    }

    toggleBtn.style.display = "flex";
    renderGallerySlide();

    if (typeof lucide !== "undefined") lucide.createIcons();
}

function renderGallerySlide() {
    const seriesEl = document.getElementById("popupGallerySeries");
    const imgEl = document.getElementById("popupGalleryImage");
    const imgFallback = document.getElementById("popupGalleryImageFallback");
    const counterEl = document.getElementById("popupGalleryCounter");
    const prevBtn = document.getElementById("popupGalleryPrev");
    const nextBtn = document.getElementById("popupGalleryNext");
    if (!seriesEl || !imgEl || !currentGalleryImages.length) return;

    const item = currentGalleryImages[currentGalleryIndex];
    seriesEl.textContent = item.series;
    counterEl.textContent = (currentGalleryIndex + 1) + " / " + currentGalleryImages.length;

    imgEl.style.display = "block";
    imgFallback.style.display = "none";
    imgEl.src = item.src;
    imgEl.alt = item.series;
    imgEl.onerror = () => {
        imgEl.style.display = "none";
        imgFallback.style.display = "flex";
    };

    prevBtn.disabled = currentGalleryIndex === 0;
    nextBtn.disabled = currentGalleryIndex === currentGalleryImages.length - 1;
}

function initWalletGalleryControls() {
    const toggleBtn = document.getElementById("popupGalleryToggle");
    const gallery = document.getElementById("popupGallery");
    const prevBtn = document.getElementById("popupGalleryPrev");
    const nextBtn = document.getElementById("popupGalleryNext");
    if (!toggleBtn || !gallery || !prevBtn || !nextBtn) return;

    toggleBtn.addEventListener("click", () => {
        const willOpen = !gallery.classList.contains("open");
        gallery.classList.toggle("open", willOpen);
        toggleBtn.classList.toggle("active", willOpen);
        toggleBtn.innerHTML = willOpen
            ? '<i data-lucide="images"></i> Sembunyikan Gambar'
            : '<i data-lucide="images"></i> Lihat Contoh Gambar';
        if (typeof lucide !== "undefined") lucide.createIcons();
    });

    prevBtn.addEventListener("click", () => {
        if (currentGalleryIndex > 0) {
            currentGalleryIndex--;
            renderGallerySlide();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentGalleryIndex < currentGalleryImages.length - 1) {
            currentGalleryIndex++;
            renderGallerySlide();
        }
    });
}

function closePopup() {
    const backdrop = document.getElementById("popupBackdrop");
    if (backdrop) backdrop.classList.remove("open");
    document.body.style.overflow = "";
}

function closePopupOnBackdrop(event) {
    if (event.target.id === "popupBackdrop") closePopup();
}

// Istilah teknis dalam paragraf (.glossary-term[data-term]) —
// datanya diambil dari glossaryData (glossary-data.js).
function initGlossaryPopups() {
    document.querySelectorAll(".glossary-term[data-term]").forEach(el => {
        el.addEventListener("click", () => {
            const key = el.dataset.term;
            const def = (typeof glossaryData !== "undefined") ? glossaryData[key] : null;
            if (def) {
                openPopup(el.textContent, def);
            }
        });
    });
}

// Kotak diagram / elemen apa pun dengan data-popup-title +
// data-popup-text — dipakai untuk diagram custodial vs self-custody.
function initDiagramPopups() {
    document.querySelectorAll("[data-popup-title][data-popup-text]").forEach(el => {
        el.addEventListener("click", () => {
            openPopup(el.dataset.popupTitle, el.dataset.popupText);
        });
    });
}

// Kartu contoh wallet (.wallet-card[data-wallet]) — buka popup lengkap
// lewat WALLET_DATA di atas.
function initWalletCardPopups() {
    document.querySelectorAll(".wallet-card[data-wallet]").forEach(el => {
        el.addEventListener("click", () => {
            openWalletPopup(el.dataset.wallet);
        });
    });
}

/*------------------------------------------------
    GRADIENT BAR HOT <-> COLD (Section 2)
    Klik/tap titik pada bar untuk menampilkan
    keterangan risiko yang sesuai.
------------------------------------------------*/
function initTempGradientBar() {
    const hotspots = document.querySelectorAll(".temp-hotspot");
    const display = document.getElementById("tempRiskDisplay");
    if (!hotspots.length || !display) return;

    hotspots.forEach(spot => {
        const show = () => {
            hotspots.forEach(s => s.classList.remove("active"));
            spot.classList.add("active");
            display.textContent = spot.dataset.risk;
        };
        spot.addEventListener("mouseenter", show);
        spot.addEventListener("click", show);
        spot.addEventListener("focus", show);
    });
}

/*------------------------------------------------
    ANIMASI ALUR AIR-GAPPED (Section 3)
    Highlight tiap kotak & panah berurutan saat tombol
    "Lihat Animasi Alur" diklik, mensimulasikan alur data
    transaksi berpindah dari HP -> QR -> Wallet -> QR ->
    Broadcast. Di mobile, diagram ini adalah strip yang
    bisa discroll horizontal (scroll-snap) — saat animasi
    berjalan, kotak yang sedang aktif otomatis di-scroll
    ke tengah supaya pemain animasi tetap terlihat tanpa
    perlu geser manual, dan posisi kotak tidak pernah
    berubah/reflow (cuma highlight & scroll posisi).
------------------------------------------------*/
function initFlowAnimation() {
    const btn = document.getElementById("animateFlowBtn");
    const diagram = document.getElementById("flowDiagram");
    if (!btn || !diagram) return;

    const steps = Array.from(diagram.querySelectorAll(".flow-step"));
    const arrows = Array.from(diagram.querySelectorAll(".flow-arrow"));
    const stepDelay = 950;
    let playing = false;

    btn.addEventListener("click", () => {
        if (playing) return;
        playing = true;
        btn.disabled = true;
        btn.textContent = "Memutar animasi...";

        steps.forEach(s => s.classList.remove("active", "signing"));
        arrows.forEach(a => a.classList.remove("active"));

        steps.forEach((step, i) => {
            setTimeout(() => {
                step.classList.add("active");
                step.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                if (i > 0 && arrows[i - 1]) arrows[i - 1].classList.add("active");
                // Efek pulse "menandatangani" khusus di kotak Wallet Air-Gapped (step ke-3)
                if (step.dataset.step === "2") {
                    step.classList.add("signing");
                }
            }, i * stepDelay);
        });

        setTimeout(() => {
            playing = false;
            btn.disabled = false;
            btn.textContent = "▶ Lihat Animasi Alur";
        }, steps.length * stepDelay + 400);
    });
}

/*------------------------------------------------
    ACCORDION TIER KEAMANAN (Section 4)
    Reusable pola: header dengan data-tier-target
    (berisi id elemen body) di-toggle class "open"
    pada .tier-item induknya.
------------------------------------------------*/
function initAccordion() {
    document.querySelectorAll(".tier-header[data-tier-target]").forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".tier-item");
            if (!item) return;
            const willOpen = !item.classList.contains("open");
            item.classList.toggle("open", willOpen);
            header.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });
    });
}

/*------------------------------------------------
    MINI-QUIZ CHECKPOINT (Section 9)
    Kuis Benar/Salah super ringkas, tanpa skor/badge/
    confetti — cukup feedback per soal + rekap di akhir.
------------------------------------------------*/
const MINI_QUIZ_DATA = [
    {
        statement: "Menyimpan seed phrase dalam bentuk foto di galeri HP atau catatan digital/cloud storage itu cukup aman asal HP-nya terkunci PIN.",
        answer: false,
        explain: "Foto di galeri atau catatan cloud gampang ikut kebobol kalau HP diretas, disinkronkan otomatis, atau akun cloud-nya bocor. Seed phrase idealnya sepenuhnya offline, misalnya di metal backup."
    },
    {
        statement: "Cukup punya satu salinan backup seed phrase, di satu lokasi saja, asal disimpan dengan hati-hati.",
        answer: false,
        explain: "Satu lokasi berarti satu titik kegagalan — kebakaran, banjir, atau kehilangan itu satu kejadian saja bisa menghapus semuanya. Sebar ke beberapa lokasi terpisah."
    },
    {
        statement: "Kalau seed phrase sudah dicatat dengan rapi, tidak perlu lagi menguji apakah backup itu benar-benar bisa dipakai untuk recovery.",
        answer: false,
        explain: "Tanpa recovery test, kesalahan urutan/ejaan kata atau plat yang rusak baru ketahuan saat kamu benar-benar butuh dana itu — biasanya sudah terlambat."
    },
    {
        statement: "Membeli hardware wallet bekas atau dari penjual tidak resmi tidak masalah, yang penting harganya lebih murah.",
        answer: false,
        explain: "Perangkat bekas/tidak resmi berisiko sudah dimodifikasi atau seed phrase-nya sudah diketahui penjual sebelumnya. Selalu beli baru dari sumber resmi."
    },
    {
        statement: "Passphrase boleh ditulis di plat metal yang sama dengan seed phrase, biar tidak lupa dan gampang dicari.",
        answer: false,
        explain: "Itu menghilangkan seluruh manfaat passphrase — begitu satu plat itu ditemukan, wallet tersembunyi ikut terbuka. Simpan terpisah dari seed phrase."
    }
];

let miniQuizIndex = 0;
let miniQuizScore = 0;
let miniQuizAnswered = false;

function renderMiniQuiz() {
    const card = document.getElementById("miniQuizCard");
    if (!card) return;

    if (miniQuizIndex >= MINI_QUIZ_DATA.length) {
        renderMiniQuizRecap(card);
        return;
    }

    const item = MINI_QUIZ_DATA[miniQuizIndex];
    miniQuizAnswered = false;

    card.innerHTML =
        '<p class="mini-quiz-progress">Soal ' + (miniQuizIndex + 1) + ' dari ' + MINI_QUIZ_DATA.length + '</p>' +
        '<p class="mini-quiz-statement">' + item.statement + '</p>' +
        '<div class="mini-quiz-options">' +
        '<button type="button" class="mini-quiz-option" data-answer="true">✅ Benar</button>' +
        '<button type="button" class="mini-quiz-option" data-answer="false">❌ Salah</button>' +
        '</div>' +
        '<p class="mini-quiz-feedback" id="miniQuizFeedback"></p>';

    card.querySelectorAll(".mini-quiz-option").forEach(btn => {
        btn.addEventListener("click", () => {
            if (miniQuizAnswered) return;
            miniQuizAnswered = true;

            const chosen = btn.dataset.answer === "true";
            const correct = chosen === item.answer;
            if (correct) miniQuizScore++;

            card.querySelectorAll(".mini-quiz-option").forEach(b => {
                b.disabled = true;
                const isRight = (b.dataset.answer === "true") === item.answer;
                if (isRight) b.classList.add("mini-quiz-option--correct");
                else if (b === btn) b.classList.add("mini-quiz-option--wrong");
            });

            const feedback = document.getElementById("miniQuizFeedback");
            if (feedback) {
                feedback.textContent = (correct ? "Tepat! " : "Kurang tepat. ") + item.explain;
                feedback.classList.add("show");
            }

            const nextLabel = (miniQuizIndex + 1 >= MINI_QUIZ_DATA.length) ? "Lihat Rekap →" : "Lanjut →";
            const nextBtn = document.createElement("button");
            nextBtn.type = "button";
            nextBtn.className = "mini-quiz-next-btn";
            nextBtn.textContent = nextLabel;
            nextBtn.addEventListener("click", () => {
                miniQuizIndex++;
                renderMiniQuiz();
            });
            card.appendChild(nextBtn);
        });
    });
}

function renderMiniQuizRecap(card) {
    const recapItems = MINI_QUIZ_DATA.map((item, i) =>
        '<li><strong>' + (i + 1) + '.</strong> ' + item.explain + '</li>'
    ).join("");

    card.innerHTML =
        '<h3 class="mini-quiz-recap-title">Selesai! Skor kamu: ' + miniQuizScore + ' / ' + MINI_QUIZ_DATA.length + '</h3>' +
        '<p class="mini-quiz-recap-intro">Rekap kenapa kelima hal tadi termasuk kesalahan umum pemula:</p>' +
        '<ul class="mini-quiz-recap-list">' + recapItems + '</ul>' +
        '<button type="button" class="mini-quiz-next-btn" id="miniQuizRestartBtn">Ulangi Kuis</button>';

    const restartBtn = document.getElementById("miniQuizRestartBtn");
    if (restartBtn) {
        restartBtn.addEventListener("click", () => {
            miniQuizIndex = 0;
            miniQuizScore = 0;
            renderMiniQuiz();
        });
    }
}

function initMiniQuiz() {
    if (!document.getElementById("miniQuizCard")) return;
    renderMiniQuiz();
}

/*------------------------------------------------
    INIT
------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") lucide.createIcons();

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
    window.addEventListener("load", updateReadingProgress);

    initGlossaryPopups();
    initDiagramPopups();
    initWalletCardPopups();
    initWalletGalleryControls();
    initTempGradientBar();
    initFlowAnimation();
    initAccordion();
    initMiniQuiz();
});
