/*==================================================
    UJI DIRI: BISAKAH KAMU KENALI PENIPUAN?
    Game keputusan singkat, session-only (tanpa localStorage).
==================================================*/

const SCENARIOS = [
    {
        prompt: "Kamu dapat pesan WhatsApp dari nomor yang mengaku \u201cTim Support Wallet\u201d. Mereka bilang akunmu terdeteksi mencurigakan dan minta kamu klik link untuk \u201cverifikasi seed phrase\u201d supaya dana tidak dibekukan.",
        options: [
            {
                label: "Klik link dan masukkan seed phrase untuk verifikasi cepat.",
                correct: false,
                feedback: "⚠️ Ini phishing klasik. Wallet resmi TIDAK PERNAH meminta seed phrase lewat chat, link, atau alasan apapun. Begitu kamu masukkan seed phrase di sana, dana kamu langsung bisa diambil."
            },
            {
                label: "Abaikan pesan itu, jangan klik apapun, dan verifikasi langsung lewat aplikasi wallet resmi kalau ragu.",
                correct: true,
                feedback: "✅ Tepat! Seed phrase adalah satu-satunya kunci ke dana kamu. Kalau ada yang memintanya lewat chat/link, itu 100% tanda bahaya."
            }
        ]
    },
    {
        prompt: "Seseorang di grup Telegram menunjukkan bukti screenshot profit fantastis, dan menawarkan \u201cinvestasi\u201d yang menjanjikan Bitcoin-mu berlipat ganda dalam 24 jam, katanya pakai \u201cbot trading rahasia\u201d.",
        options: [
            {
                label: "Ikut coba dengan jumlah kecil dulu, toh cuma sedikit.",
                correct: false,
                feedback: "⚠️ Skema \u201cuntung pasti dalam waktu singkat\u201d adalah red flag klasik penipuan (sering disebut skema Ponzi/pump scam). \u201cJumlah kecil dulu\u201d sering jadi jebakan supaya kamu percaya sebelum diminta setor lebih besar."
            },
            {
                label: "Tolak tawaran itu — tidak ada instrumen keuangan sah yang menjamin profit pasti dalam waktu sangat singkat.",
                correct: true,
                feedback: "✅ Betul. Kalau ada yang menjanjikan untung besar dan pasti dalam waktu singkat, itu nyaris selalu skema penipuan — Bitcoin sendiri sangat fluktuatif, tidak ada yang bisa menjamin kenaikan pasti."
            }
        ]
    },
    {
        prompt: "Sebuah akun media sosial (mengaku terverifikasi, pakai foto tokoh terkenal) mengadakan \u201cgiveaway\u201d: kirim 0.01 BTC ke alamat mereka, nanti dikirim balik 0.1 BTC sebagai hadiah — cuma untuk 100 orang pertama.",
        options: [
            {
                label: "Buru-buru kirim 0.01 BTC sebelum kuota 100 orang habis.",
                correct: false,
                feedback: "⚠️ Giveaway \u201ckirim koin dapat lebih banyak\u201d adalah salah satu penipuan crypto paling umum dan lama. Begitu kamu kirim, tidak ada yang pernah dikirim balik."
            },
            {
                label: "Abaikan — akun/giveaway seperti ini tidak pernah beneran mengembalikan dana.",
                correct: true,
                feedback: "✅ Tepat sekali. Aturan sederhana: kalau harus \u201ckirim dulu untuk dapat lebih banyak\u201d, itu selalu penipuan, tanpa pengecualian."
            }
        ]
    },
    {
        prompt: "Teman baru kenal di forum menawarkan hardware wallet \u201csudah di-setup dan siap pakai\u201d dengan harga jauh lebih murah dari toko resmi — katanya biar kamu \u201ctinggal pakai saja, gak perlu ribet setup sendiri\u201d.",
        options: [
            {
                label: "Beli karena lebih murah dan katanya lebih praktis.",
                correct: false,
                feedback: "⚠️ Hardware wallet yang \u201csudah di-setup orang lain\u201d berarti orang itu tahu seed phrase-nya. Begitu kamu isi dana ke situ, dia bisa mencurinya kapan saja. Selalu beli baru & segel utuh dari toko resmi, setup sendiri dari nol."
            },
            {
                label: "Tolak — beli hanya dari toko resmi, dan setup sendiri dari awal.",
                correct: true,
                feedback: "✅ Benar. Prinsip self-custody cuma berlaku kalau KAMU yang generate seed phrase-nya sendiri, bukan orang lain."
            }
        ]
    },
    {
        prompt: "Kamu lagi buka Currency Converter, tiba-tiba muncul pop-up \u201cWallet Anda Terdeteksi Vulnerable! Download Aplikasi Pengaman Wallet Sekarang\u201d dengan tombol download mencolok, dari sumber yang bukan Play Store/App Store resmi.",
        options: [
            {
                label: "Download aplikasi itu karena kelihatan resmi dan mendesak.",
                correct: false,
                feedback: "⚠️ Pop-up mendesak yang minta install APK di luar app store resmi adalah pola malware/software wallet palsu klasik. Aplikasi resmi TIDAK PERNAH muncul lewat pop-up di website seperti ini."
            },
            {
                label: "Tutup pop-up itu, jangan download apapun dari luar app store resmi.",
                correct: true,
                feedback: "✅ Tepat. Kalau ragu soal keamanan wallet, cek langsung lewat aplikasi resmi yang sudah terpasang — bukan lewat pop-up yang mendesak."
            }
        ]
    }
];

let playOrder = [];
let currentStep = 0;
let correctCount = 0;
let answered = false;

function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function initGame(shuffle) {
    const baseOrder = SCENARIOS.map((_, i) => i);
    playOrder = shuffle ? shuffleArray(baseOrder) : baseOrder;
    currentStep = 0;
    correctCount = 0;
    renderScenario();
}

function renderScenario() {
    const stage = document.getElementById('gameStage');
    if (!stage) return;

    const scenarioIdx = playOrder[currentStep];
    const scenario = SCENARIOS[scenarioIdx];
    answered = false;

    const optionsHtml = scenario.options.map((opt, i) =>
        '<button type="button" class="scenario-option" data-index="' + i + '">' + opt.label + '</button>'
    ).join('');

    stage.innerHTML =
        '<div class="scenario-card card-enter">' +
        '<p class="scenario-progress">Skenario ' + (currentStep + 1) + ' dari ' + SCENARIOS.length + '</p>' +
        '<p class="scenario-text">' + scenario.prompt + '</p>' +
        '<div class="scenario-options" id="scenarioOptions">' + optionsHtml + '</div>' +
        '<div class="scenario-feedback" id="scenarioFeedback"></div>' +
        '</div>';

    stage.querySelectorAll('.scenario-option').forEach(btn => {
        btn.addEventListener('click', () => selectOption(scenarioIdx, Number(btn.dataset.index)));
    });
}

function selectOption(scenarioIdx, optionIdx) {
    if (answered) return;
    answered = true;

    const scenario = SCENARIOS[scenarioIdx];
    const chosen = scenario.options[optionIdx];
    if (chosen.correct) correctCount++;

    const optionButtons = document.querySelectorAll('.scenario-option');
    optionButtons.forEach((btn, i) => {
        btn.disabled = true;
        const opt = scenario.options[i];
        if (opt.correct) {
            btn.classList.add('scenario-option--correct');
        } else if (i === optionIdx) {
            btn.classList.add('scenario-option--wrong');
        }
    });

    const feedbackEl = document.getElementById('scenarioFeedback');
    if (feedbackEl) {
        const isLast = (currentStep + 1 >= SCENARIOS.length);
        feedbackEl.innerHTML =
            '<p class="feedback-text ' + (chosen.correct ? 'feedback-text--good' : 'feedback-text--bad') + '">' +
            chosen.feedback + '</p>' +
            '<button type="button" class="next-scenario-btn" id="nextScenarioBtn">' +
            (isLast ? 'Lihat Hasil →' : 'Skenario Berikutnya →') +
            '</button>';
        feedbackEl.classList.add('show');

        const nextBtn = document.getElementById('nextScenarioBtn');
        if (nextBtn) nextBtn.addEventListener('click', nextStep);
    }
}

function nextStep() {
    currentStep++;
    if (currentStep >= SCENARIOS.length) {
        renderSummary();
    } else {
        renderScenario();
    }
}

function renderSummary() {
    const stage = document.getElementById('gameStage');
    if (!stage) return;

    const total = SCENARIOS.length;
    let message;
    let showLink = false;

    if (correctCount === total) {
        message = "🎉 Sempurna! Insting keamananmu udah tajam banget.";
    } else if (correctCount >= 3) {
        message = "👍 Bagus, tapi tetap waspada — sedikit lagi sempurna.";
    } else {
        message = "⚠️ Yuk pelajari lagi materi Privasi & Keamanan supaya makin waspada.";
        showLink = true;
    }

    stage.innerHTML =
        '<div class="summary-card card-enter">' +
        '<p class="summary-score">Kamu berhasil menghindari <strong>' + correctCount + ' dari ' + total +
        '</strong> skenario penipuan!</p>' +
        '<p class="summary-message">' + message + '</p>' +
        (showLink ? '<a href="../materi/privasi-keamanan/index.html" class="summary-link">📖 Pelajari Materi Privasi & Keamanan</a>' : '') +
        '<div class="summary-actions">' +
        '<button type="button" class="retry-btn" id="retryBtn">🔄 Coba Lagi</button>' +
        '<a href="../index.html" class="home-btn-link">← Kembali ke Beranda</a>' +
        '</div>' +
        '</div>';

    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) retryBtn.addEventListener('click', () => initGame(true));
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initGame(false);
});
