/*==================================================
    MATERI: LIGHTNING NETWORK — SCRIPT
==================================================*/

/*------------------------------------------------
    READING PROGRESS BAR
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
    DATA CONTOH WALLET LIGHTNING (khusus materi ini)
    icon: filenya disimpan di assets/wallet-icons/<nama>.png
    — kalau file belum ada / gagal dimuat, popup otomatis
    pakai fallback lingkaran huruf inisial.
------------------------------------------------*/
const WALLET_DATA = {
    "wallet-of-satoshi": {
        name: "Wallet of Satoshi",
        type: "custodial",
        icon: "assets/wallet-icons/wallet-of-satoshi.png",
        desc: "Wallet Lightning custodial yang paling sering direkomendasikan untuk pemula karena super simpel — tinggal install, langsung bisa kirim/terima Bitcoin lewat Lightning tanpa setup apa pun.",
        meta: "Platform: iOS, Android — Lightning Network (Custodial)",
        features: ["Custodial — private key & channel dipegang penyedia, bukan kamu sendiri", "Setup paling instan di antara wallet Lightning lain", "Tidak perlu paham teknis channel sama sekali"],
        note: "Cocok untuk coba-coba Lightning pertama kali, tapi ingat: karena custodial, jangan simpan dana besar di sini."
    },
    strike: {
        name: "Strike",
        type: "custodial",
        icon: "assets/wallet-icons/strike.png",
        desc: "Wallet Lightning custodial yang juga punya fitur kirim uang lintas mata uang (mis. USD) lewat jaringan Lightning di belakang layar, populer di beberapa negara untuk remitansi.",
        meta: "Platform: iOS, Android",
        features: ["Custodial — dikelola penuh oleh Strike", "Ada fitur konversi & kirim ke mata uang fiat", "Mudah dipakai untuk pembayaran lintas negara"],
        note: "Cocok untuk kebutuhan kirim uang praktis, bukan untuk penyimpanan jangka panjang."
    },
    blink: {
        name: "Blink Wallet",
        type: "custodial",
        icon: "assets/wallet-icons/blink-wallet.png",
        desc: "Wallet Lightning Network yang bersifat custodial — private key-mu dikelola oleh pihak Blink, mirip pengalaman pakai e-wallet biasa: tinggal install, langsung bisa kirim/terima Bitcoin lewat Lightning tanpa perlu atur channel sendiri.",
        meta: "Platform: iOS, Android — Lightning Network (Custodial)",
        features: ["Custodial — private key dipegang Blink, bukan kamu sendiri", "Setup instan, tanpa perlu buka channel Lightning manual", "Praktis untuk transaksi Lightning sehari-hari dalam jumlah kecil"],
        note: "Cocok untuk coba-coba Lightning dengan cepat, tapi ingat: karena custodial, ini bukan self-custody sesuai prinsip di materi ini — jangan simpan dana besar di sini."
    },
    phoenix: {
        name: "Phoenix Wallet",
        type: "noncustodial",
        icon: "assets/wallet-icons/phoenix-wallet.png",
        desc: "Wallet Lightning Network non-custodial — kamu tetap pegang kendali penuh atas private key, tapi rumitnya membuka dan mengelola channel Lightning ditangani otomatis di belakang layar oleh aplikasinya.",
        meta: "Platform: iOS, Android — Lightning Network (Non-Custodial)",
        features: ["Non-custodial — private key sepenuhnya di tanganmu", "Manajemen channel Lightning otomatis, tidak perlu ribet manual", "Dikembangkan oleh tim ACINQ, salah satu kontributor inti Lightning Network"],
        note: "Cocok untuk yang mau pakai Lightning tapi tetap pegang prinsip self-custody."
    },
    zeus: {
        name: "Zeus",
        type: "noncustodial",
        icon: "assets/wallet-icons/zeus.png",
        desc: "Wallet non-custodial yang berfungsi sebagai remote control untuk node Lightning milikmu sendiri, cocok untuk yang sudah atau ingin menjalankan node sendiri (mis. lewat LND atau Core Lightning).",
        meta: "Platform: iOS, Android",
        features: ["Non-custodial, terhubung ke node Lightning milikmu sendiri", "Mendukung beberapa backend node populer", "Kontrol penuh sampai level node"],
        note: "Cocok untuk pengguna yang lebih teknis dan sudah familiar menjalankan node Lightning sendiri."
    },
    breez: {
        name: "Breez",
        type: "noncustodial",
        icon: "assets/wallet-icons/breez.png",
        desc: "Wallet non-custodial dengan node Lightning bawaan di dalam aplikasinya sendiri, didesain supaya pemakaiannya semudah wallet biasa tanpa perlu mengelola node secara manual.",
        meta: "Platform: iOS, Android",
        features: ["Non-custodial dengan node Lightning bawaan", "Channel dikelola otomatis di balik layar", "Mendukung integrasi pembayaran konten & streaming sats"],
        note: "Cocok untuk yang mau non-custodial dengan pengalaman pakai yang mulus seperti wallet custodial."
    },
    bluewallet: {
        name: "BlueWallet",
        type: "noncustodial",
        icon: "assets/wallet-icons/bluewallet.png",
        desc: "Wallet Bitcoin open-source yang ringan, mendukung Lightning Network lewat koneksi ke LNDHub atau node milikmu sendiri.",
        meta: "Platform: iOS, Android",
        features: ["Open-source", "Mendukung Lightning lewat LNDHub", "Ada fitur multisig vault & watch-only wallet"],
        note: "Cocok untuk yang sudah kenal BlueWallet dari sisi on-chain dan mau lanjut coba Lightning."
    }
};

/*------------------------------------------------
    POPUP KECIL (REUSABLE — sama persis dengan materi
    sebelumnya, dipakai untuk istilah glossary, semua
    elemen data-popup-title/data-popup-text di halaman
    ini (titik timeline, kotak layer, kartu perbandingan),
    dan kartu contoh wallet lewat openWalletPopup()).
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

    // Ikon (dipakai kartu contoh wallet). Kalau gambar gagal dimuat
    // (belum diupload / path salah), otomatis fallback ke huruf inisial.
    if (data.icon && iconWrap && iconImg && iconFallback) {
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
    } else if (iconWrap) {
        iconWrap.style.display = "none";
    }

    if (data.meta && metaEl) {
        metaEl.style.display = "block";
        metaEl.textContent = data.meta;
    } else if (metaEl) {
        metaEl.style.display = "none";
    }

    if (data.features && data.features.length && featuresEl) {
        featuresEl.style.display = "block";
        featuresEl.innerHTML = data.features.map(f => "<li>" + f + "</li>").join("");
    } else if (featuresEl) {
        featuresEl.style.display = "none";
        featuresEl.innerHTML = "";
    }

    if (data.note && noteEl) {
        noteEl.style.display = "block";
        noteEl.textContent = data.note;
    } else if (noteEl) {
        noteEl.style.display = "none";
    }

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
        icon: w.icon,
        meta: w.meta,
        features: w.features,
        note: w.note
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

// Istilah teknis dalam paragraf (.glossary-term[data-term]).
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

// Elemen apa pun dengan data-popup-title + data-popup-text — dipakai
// untuk titik timeline, kotak layer, dan kartu perbandingan.
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
    SECTION 3 — SIMULASI CHANNEL LIGHTNING INTERAKTIF
    Simulasi nyata: klik "Kirim" berkali-kali memindahkan
    saldo antar 2 pihak secara off-chain (tanpa refresh
    halaman/blockchain), sampai saldo Kamu habis. Tombol
    "Tutup Channel" mengunci hasil akhirnya.
------------------------------------------------*/
function initChannelSim() {
    const sim = document.getElementById("channelSim");
    if (!sim) return;

    const AMOUNT = 0.005;
    let kamuBalance = 0.02;
    let tokoBalance = 0.00;
    let closed = false;

    const kamuEl = document.getElementById("channelKamuBalance");
    const tokoEl = document.getElementById("channelTokoBalance");
    const sendBtn = document.getElementById("channelSendBtn");
    const closeBtn = document.getElementById("channelCloseBtn");
    const statusEl = document.getElementById("channelSimStatus");
    const arrowEl = document.getElementById("channelFlowArrow");

    function formatBTC(n) {
        return n.toFixed(3) + " BTC";
    }

    function render() {
        kamuEl.textContent = formatBTC(kamuBalance);
        tokoEl.textContent = formatBTC(tokoBalance);
        sendBtn.disabled = closed || kamuBalance < AMOUNT - 1e-9;
    }

    sendBtn.addEventListener("click", () => {
        if (closed || kamuBalance < AMOUNT - 1e-9) return;

        kamuBalance = Math.max(0, kamuBalance - AMOUNT);
        tokoBalance = tokoBalance + AMOUNT;
        render();

        statusEl.classList.remove("is-closed");
        statusEl.textContent = "Transaksi off-chain terkirim instan — tidak menyentuh blockchain sama sekali.";

        if (arrowEl) {
            arrowEl.classList.remove("pulse");
            void arrowEl.offsetWidth;
            arrowEl.classList.add("pulse");
        }

        if (kamuBalance < AMOUNT - 1e-9) {
            statusEl.textContent += " Saldo Kamu di channel ini sudah habis.";
        }
    });

    closeBtn.addEventListener("click", () => {
        if (closed) return;
        closed = true;
        sendBtn.disabled = true;
        closeBtn.disabled = true;
        statusEl.classList.add("is-closed");
        statusEl.textContent = "Channel ditutup. Saldo akhir dicatat 1 kali ke blockchain: Kamu: " +
            formatBTC(kamuBalance) + ", Toko Online: " + formatBTC(tokoBalance) + ".";
    });

    render();
}

/*------------------------------------------------
    SECTION 8 — MINI-QUIZ CHECKPOINT (pilihan ganda, 1 soal)
------------------------------------------------*/
const MINI_QUIZ_MCQ = {
    statement: "Kamu baru pertama kali coba Lightning, cuma mau kirim beberapa ribu rupiah buat coba-coba. Wallet apa yang paling masuk akal dipakai duluan?",
    options: [
        { text: "Non-custodial langsung, biar terbiasa kelola channel sendiri sejak awal", correct: false },
        { text: "Custodial dulu untuk coba-coba, baru pindah ke non-custodial begitu mulai serius menyimpan/bertransaksi rutin", correct: true },
        { text: "Tidak perlu pakai wallet Lightning sama sekali", correct: false }
    ],
    explain: "Custodial (mis. Wallet of Satoshi, Strike) paling mudah untuk coba-coba jumlah kecil tanpa setup ribet. Begitu mulai serius menyimpan atau bertransaksi rutin dalam jumlah berarti, pindah ke wallet non-custodial (mis. Phoenix, Zeus, Breez) supaya kendali penuh ada di tanganmu sendiri — sama seperti prinsip self-custody di materi sebelumnya."
};

function initMiniQuiz() {
    const card = document.getElementById("miniQuizCard");
    if (!card) return;

    const item = MINI_QUIZ_MCQ;
    let answered = false;

    card.innerHTML =
        '<p class="mini-quiz-statement">' + item.statement + '</p>' +
        '<div class="mini-quiz-mcq-options"></div>' +
        '<p class="mini-quiz-feedback" id="miniQuizFeedback">' + item.explain + '</p>';

    const optionsWrap = card.querySelector(".mini-quiz-mcq-options");
    item.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mini-quiz-mcq-option";
        btn.textContent = opt.text;
        btn.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            optionsWrap.querySelectorAll(".mini-quiz-mcq-option").forEach((b, j) => {
                b.disabled = true;
                if (item.options[j].correct) b.classList.add("mini-quiz-mcq-option--correct");
                else if (b === btn) b.classList.add("mini-quiz-mcq-option--wrong");
            });

            const feedback = document.getElementById("miniQuizFeedback");
            if (feedback) feedback.classList.add("show");
        });
        optionsWrap.appendChild(btn);
    });
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
    initChannelSim();
    initMiniQuiz();
});
