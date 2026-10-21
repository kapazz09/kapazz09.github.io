// ==================================================
// UJIAN AKHIR (gerbang sebelum Sertifikat)
// Sistem terpisah dari Bitcoin Quiz (tidak memakai logic/state-nya).
//
// Soal TIDAK ada di file statis. Soal diundi dan DINILAI di server (Apps Script,
// sheet "Soal"): browser hanya menerima teks pertanyaan + pilihan (sudah diacak)
// dan mengirim balik indeks pilihan; kunci jawaban & penjelasan tidak pernah
// sampai ke browser.
//
// Alur: tombol "Ikuti Ujian Akhir" (8/8 materi) -> layar pembuka (aturan +
// nilai terakhir) -> "Menyiapkan soal..." (startExam) -> 21 soal tanpa feedback
// -> "Memeriksa jawaban..." (submitExam) -> layar hasil (skor + status).
// Lulus -> hak membuat sertifikat + certToken dari server, HANYA hidup di memori JS
// (certRightActive / certRightTokenValue). Reload / tutup modal = hak hilang.
// Skor terakhir disimpan di localStorage 'kapazzExamLastResult'.
// Kecepatan: ujian berikutnya diminta di latar belakang (prefetch) supaya tombol
// "Mulai Ujian" / "Coba Lagi" terasa instan dan Apps Script tidak cold start.
// Pengaman penutupan tidak sengaja ada di bawah.
// ==================================================
const EXAM_TOTAL = 21;          // jumlah soal tiap ujian (simbolis "21 juta BTC")
const EXAM_PASS_MIN = 16;       // minimal benar untuk lulus (16 dari 21)
const EXAM_LAST_RESULT_KEY = 'kapazzExamLastResult';
const EXAM_REQUEST_TIMEOUT = 25000;               // ms (cold start Apps Script bisa beberapa detik)
const EXAM_PREFETCH_MAX_AGE = 20 * 60 * 1000;     // ms: ujian siap pakai maksimal 20 menit
const EXAM_CERT_TOKEN_REGEX = /^[0-9a-f]{64}$/;

let examState = null;
let examLoadToken = 0;          // naik tiap batal/tutup, supaya balasan server yang terlambat diabaikan

// ---- Ujian siap pakai (prefetch), HANYA di memori ----
let examPrefetched = null;      // { data: {examId, questions}, at: waktu diterima }
let examPrefetchPromise = null;
let examPrefetchScheduled = false;

// ---- Hak membuat sertifikat (HANYA di memori, bukan localStorage) ----
let certRightActive = false;     // lulus ujian & sertifikat belum berhasil dibuat
let certPendingDownload = false; // sertifikat sudah dibuat tapi belum diunduh
let certExamScore = null;        // skor ujian yang BARU SAJA lulus (dicetak di sertifikat; memori saja)
let certRightTokenValue = null;  // certToken dari server (memori saja)

// ---- Pengaman: history (tombol back) + beforeunload ----
let examGuardsOn = false;
let examConfirmOpen = false;

function examEscape(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ==================================================
// KOMUNIKASI DENGAN SERVER (Apps Script, RATING_API_URL di js/ratings.js)
// ==================================================
function examFetchJson(url, options) {
    if (typeof RATING_API_URL === 'undefined') {
        return Promise.reject(new Error('API belum siap'));
    }
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), EXAM_REQUEST_TIMEOUT) : null;
    const opts = Object.assign({}, options || {});
    if (controller) opts.signal = controller.signal;
    return fetch(url, opts)
        .then(res => res.json())
        .finally(() => { if (timer) clearTimeout(timer); });
}

function examIsValidStart(data) {
    if (!data || data.status !== 'success') return false;
    if (typeof data.examId !== 'string' || !data.examId) return false;
    if (!Array.isArray(data.questions) || data.questions.length !== EXAM_TOTAL) return false;
    return data.questions.every(q => q && typeof q.q === 'string' && q.q &&
        Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 3 &&
        q.options.every(o => typeof o === 'string' && o));
}

// Minta satu ujian baru. Resolve: { examId, questions: [{q, options:[teks]}] }.
function examRequestFromServer() {
    if (typeof RATING_API_URL === 'undefined') {
        return Promise.reject(new Error('API belum siap'));
    }
    return examFetchJson(RATING_API_URL + '?action=startExam&_t=' + Date.now()).then(data => {
        if (!examIsValidStart(data)) {
            // Pesan server (mis. "bank soal tidak lengkap ...") hanya untuk pemilik situs, lewat console
            throw new Error((data && data.error) ? data.error : 'Respons soal tidak valid');
        }
        return { examId: data.examId, questions: data.questions };
    });
}

function examPrefetchFresh() {
    return !!(examPrefetched && (Date.now() - examPrefetched.at) < EXAM_PREFETCH_MAX_AGE);
}

// Siapkan ujian berikutnya di latar belakang; gagal = diam (nanti diminta langsung saat Mulai)
function examPrefetchNow() {
    if (examPrefetchFresh()) return Promise.resolve(examPrefetched.data);
    if (examPrefetchPromise) return examPrefetchPromise;
    examPrefetchPromise = examRequestFromServer().then(data => {
        examPrefetched = { data: data, at: Date.now() };
        return data;
    }).catch(err => {
        examPrefetched = null;
        console.warn('Prefetch ujian gagal:', err && err.message);
        return null;
    }).finally(() => {
        examPrefetchPromise = null;
    });
    return examPrefetchPromise;
}

// Dipanggil js/script.js saat progress 8/8 (tombol "Ikuti Ujian Akhir" tampil).
// Tidak dipanggil untuk pengunjung yang belum 8/8.
function examPrefetchIfReady() {
    if (examPrefetchScheduled || examPrefetchFresh() || examPrefetchPromise) return;
    examPrefetchScheduled = true;
    const run = () => {
        examPrefetchScheduled = false;
        examPrefetchNow();
    };
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(run, { timeout: 4000 });
    } else {
        setTimeout(run, 1500);
    }
}

// ==================================================
// NILAI TERAKHIR (localStorage)
// ==================================================
function loadLastExamResult() {
    try {
        const raw = localStorage.getItem(EXAM_LAST_RESULT_KEY);
        if (!raw) return null;
        const r = JSON.parse(raw);
        if (r && typeof r.score === 'number' && typeof r.total === 'number' && typeof r.passed === 'boolean') return r;
    } catch (e) {
        // data rusak -> anggap belum pernah ujian
    }
    return null;
}

function saveLastExamResult(score, total, passed) {
    try {
        localStorage.setItem(EXAM_LAST_RESULT_KEY, JSON.stringify({
            score: score,
            total: total,
            passed: passed,
            date: new Date().toISOString()
        }));
    } catch (e) {
        // localStorage diblokir — tidak fatal
    }
}

// ==================================================
// TAMPILAN
// ==================================================
function setExamView(html) {
    const view = document.getElementById('examView');
    const box = document.getElementById('examModalBox');
    if (view) view.innerHTML = html;
    if (box) box.scrollTop = 0;
}

// Layar pembuka: nilai terakhir (kalau ada) + aturan + tombol Mulai
function showExamIntro() {
    examState = null;
    examLoadToken++;
    const total = EXAM_TOTAL;
    const last = loadLastExamResult();

    const banner = last
        ? '<div class="exam-last ' + (last.passed ? 'exam-last--pass' : 'exam-last--fail') + '">' +
        'Nilai terakhir: ' + last.score + '/' + last.total + ' (' + (last.passed ? 'Lulus' : 'Belum lulus') + ')</div>'
        : '';

    setExamView(
        '<h3 class="exam-title">📝 Ujian Akhir</h3>' +
        banner +
        '<ul class="exam-rules">' +
        '<li>Ujian terdiri dari <strong>' + total + ' soal</strong>.</li>' +
        '<li>Lulus jika minimal <strong>' + EXAM_PASS_MIN + ' soal benar</strong>.</li>' +
        '<li>Tidak ada feedback benar/salah selama ujian.</li>' +
        '<li>Hasil hanya berupa skor, tanpa kunci jawaban.</li>' +
        '</ul>' +
        '<p class="exam-cert-warning">🎓 Sertifikat hanya bisa dibuat langsung setelah lulus. ' +
        'Kalau ditutup sebelum dibuat, kamu perlu mengulang ujian.</p>' +
        '<button type="button" class="calculate-btn exam-start-btn" onclick="beginExam()">Mulai Ujian</button>'
    );
}

// Layar memuat (menyiapkan soal / memeriksa jawaban)
function showExamLoading(message) {
    setExamView(
        '<h3 class="exam-title">📝 Ujian Akhir</h3>' +
        '<div class="exam-loading" role="status" aria-live="polite">' +
        '<span class="exam-spinner" aria-hidden="true"></span>' +
        '<p class="exam-loading-text">' + examEscape(message) + '</p>' +
        '</div>'
    );
}

// Layar error + tombol aksi. secondaryHTML opsional (mis. tombol Kembali).
function showExamError(message, retryLabel, retryCall, secondaryHTML) {
    setExamView(
        '<h3 class="exam-title">📝 Ujian Akhir</h3>' +
        '<div class="exam-error" role="alert">' +
        '<p class="exam-error-msg">' + examEscape(message) + '</p>' +
        '<div class="exam-actions">' +
        '<button type="button" class="calculate-btn exam-action-btn" onclick="' + retryCall + '">' + retryLabel + '</button>' +
        (secondaryHTML || '') +
        '</div>' +
        '</div>'
    );
}

// "Mulai Ujian" / "Coba Lagi" / "Mulai Ulang": pakai ujian siap pakai (umur < 20 menit)
// kalau ada; kalau belum ada atau sudah tua, minta yang baru ke server.
function beginExam() {
    if (examState && examState.loading) return;   // cegah klik ganda
    const token = ++examLoadToken;
    examState = { loading: true, inProgress: false };

    if (examPrefetchFresh()) {
        startExamWithData(examPrefetched.data);
        return;
    }
    examPrefetched = null;   // buang yang sudah tua

    showExamLoading('Menyiapkan soal...');
    const request = examPrefetchPromise
        ? examPrefetchPromise.then(data => data || examRequestFromServer())   // ikut prefetch yang sedang jalan
        : examRequestFromServer();

    request.then(data => {
        if (token !== examLoadToken) {
            // Modal ditutup/dibatalkan saat memuat: simpan sebagai ujian siap pakai
            examPrefetched = { data: data, at: Date.now() };
            return;
        }
        startExamWithData(data);
    }, err => {
        console.error('Gagal memuat soal ujian:', err && err.message);
        if (token !== examLoadToken) return;
        examState = null;
        showExamError('Soal belum bisa dimuat. Periksa koneksi internetmu lalu coba lagi.',
            '🔄 Coba Lagi', 'beginExam()',
            '<button type="button" class="exam-secondary-btn" onclick="showExamIntro()">Kembali</button>');
    });
}

function startExamWithData(data) {
    if (examPrefetched && examPrefetched.data === data) examPrefetched = null;   // sekali pakai
    examState = {
        examId: data.examId,
        questions: data.questions,
        index: 0,
        picked: [],
        selected: null,
        inProgress: true,
        submitting: false
    };
    renderExamQuestion();
}

function renderExamQuestion() {
    const s = examState;
    const total = s.questions.length;
    const current = s.questions[s.index];
    const isLast = s.index === total - 1;

    let optionsHTML = '';
    current.options.forEach((text, pos) => {
        optionsHTML += '<button type="button" class="exam-option" role="radio" aria-checked="false" ' +
            'data-pos="' + pos + '" onclick="selectExamOption(' + pos + ')">' +
            '<span class="exam-option-dot" aria-hidden="true"></span>' +
            '<span class="exam-option-text">' + examEscape(text) + '</span></button>';
    });

    setExamView(
        '<h3 class="exam-title">📝 Ujian Akhir</h3>' +
        '<p class="exam-meta">Lulus jika minimal ' + EXAM_PASS_MIN + ' dari ' + total + ' soal benar. ' +
        'Tidak ada jawaban yang ditampilkan — hasil akhir hanya berupa skor.</p>' +
        '<div class="exam-progress">' +
        '<p class="exam-progress-text">Soal ' + (s.index + 1) + ' dari ' + total + '</p>' +
        '<div class="exam-progress-bar"><div class="exam-progress-fill" style="width:' +
        Math.round(((s.index + 1) / total) * 100) + '%"></div></div>' +
        '</div>' +
        '<p class="exam-question">' + examEscape(current.q) + '</p>' +
        '<div class="exam-options" role="radiogroup" aria-label="Pilihan jawaban">' + optionsHTML + '</div>' +
        '<button type="button" class="calculate-btn exam-next-btn" id="examNextBtn" disabled ' +
        'onclick="nextExamQuestion()">' + (isLast ? 'Selesai &amp; Kumpulkan ✓' : 'Lanjut →') + '</button>'
    );
}

function selectExamOption(pos) {
    if (!examState || !examState.inProgress || examState.submitting) return;
    examState.selected = pos;

    document.querySelectorAll('#examView .exam-option').forEach(btn => {
        const isSel = Number(btn.dataset.pos) === pos;
        btn.classList.toggle('selected', isSel);
        btn.setAttribute('aria-checked', isSel ? 'true' : 'false');
    });
    const next = document.getElementById('examNextBtn');
    if (next) next.disabled = false;
}

function nextExamQuestion() {
    const s = examState;
    if (!s || !s.inProgress || s.submitting || s.selected === null) return;

    // Yang disimpan: indeks pilihan pada urutan yang diterima dari server
    s.picked[s.index] = s.selected;
    s.selected = null;
    s.index++;

    if (s.index >= s.questions.length) {
        submitExamAnswers();
    } else {
        renderExamQuestion();
    }
}

// Kirim semua jawaban ke server untuk dinilai. Gagal -> jawaban TETAP tersimpan di
// examState dan bisa dikirim ulang (server mengembalikan hasil yang sama untuk examId yang sama).
function submitExamAnswers() {
    const s = examState;
    if (!s || !s.inProgress || s.submitting) return;
    // Semua soal wajib terjawab sebelum dikirim
    for (let i = 0; i < s.questions.length; i++) {
        if (!Number.isInteger(s.picked[i])) {
            showExamError('Masih ada soal yang belum dijawab.', 'Tutup', 'closeExamModal()');
            return;
        }
    }

    s.submitting = true;
    showExamLoading('Memeriksa jawaban...');

    examFetchJson(RATING_API_URL + '?action=submitExam', {
        method: 'POST',
        // text/plain (bawaan) = "simple request", tidak memicu preflight CORS di Apps Script
        body: JSON.stringify({ examId: s.examId, answers: s.picked.slice(0, s.questions.length) })
    }).then(data => {
        if (examState !== s) return;   // modal sudah ditutup
        s.submitting = false;
        handleExamSubmitResult(s, data);
    }, err => {
        console.error('Gagal mengirim jawaban ujian:', err && err.message);
        if (examState !== s) return;
        s.submitting = false;
        showExamSubmitError();
    });
}

function showExamSubmitError() {
    showExamError('Gagal mengirim jawaban. Periksa koneksi internetmu lalu coba lagi. Jawabanmu tidak hilang.',
        '🔄 Kirim Ulang', 'submitExamAnswers()');
}

function showExamExpired() {
    examState = null;
    showExamError('Sesi ujian berakhir, mulai ulang.', '🔄 Mulai Ulang', 'beginExam()');
}

function handleExamSubmitResult(s, data) {
    if (data && data.status === 'expired') {
        showExamExpired();
        return;
    }
    const valid = data && data.status === 'success' &&
        Number.isInteger(data.score) && data.score >= 0 && data.score <= EXAM_TOTAL &&
        data.total === EXAM_TOTAL && typeof data.passed === 'boolean' &&
        (!data.passed || EXAM_CERT_TOKEN_REGEX.test(String(data.certToken || '')));
    if (!valid) {
        showExamSubmitError();
        return;
    }
    finishExam(s, data);
}

// Layar hasil: HANYA skor + status. Tidak ada review, kunci jawaban,
// penanda soal salah, atau petunjuk materi lemah.
function finishExam(s, data) {
    s.inProgress = false;

    const total = data.total;
    const score = data.score;
    const passed = data.passed;

    saveLastExamResult(score, total, passed);

    if (passed) {
        // Hak membuat sertifikat + token dari server: hanya di memori. Aktifkan pengaman penutupan.
        certRightActive = true;
        certPendingDownload = false;
        certExamScore = score;
        certRightTokenValue = data.certToken;
        addExamGuards();

        setExamView(
            '<h3 class="exam-title">📝 Hasil Ujian Akhir</h3>' +
            '<div class="exam-result exam-result--pass">' +
            '<p class="exam-score">' + score + ' dari ' + total + ' benar</p>' +
            '<p class="exam-result-msg">🎉 Selamat, kamu lulus! Skor: ' + score + '/' + total + '</p>' +
            '<div class="exam-actions">' +
            '<button type="button" class="calculate-btn exam-action-btn" onclick="startCertificateFromExam()">🎓 Buat Sertifikat</button>' +
            '</div>' +
            '<p class="exam-cert-note">Sertifikat hanya bisa dibuat sekarang.</p>' +
            '</div>'
        );
    } else {
        setExamView(
            '<h3 class="exam-title">📝 Hasil Ujian Akhir</h3>' +
            '<div class="exam-result exam-result--fail">' +
            '<p class="exam-score">' + score + ' dari ' + total + ' benar</p>' +
            '<p class="exam-result-msg">Belum lulus. Skormu ' + score + ' dari ' + total + ', minimal ' + EXAM_PASS_MIN +
            '. Pelajari ulang materinya, lalu coba lagi.</p>' +
            '<div class="exam-actions">' +
            '<button type="button" class="calculate-btn exam-action-btn" onclick="beginExam()">🔄 Coba Lagi</button>' +
            '<button type="button" class="exam-secondary-btn" onclick="examBackToMaterials()">📚 Kembali ke Materi</button>' +
            '</div>' +
            '</div>'
        );
        // Siapkan ujian berikutnya di latar belakang untuk tombol "Coba Lagi"
        examPrefetchNow();
    }
}

// ==================================================
// BUKA / TUTUP MODAL UJIAN
// ==================================================
function openExamModal() {
    const backdrop = document.getElementById('examModalBackdrop');
    const box = document.getElementById('examModalBox');
    if (!backdrop || !box) return;

    showExamIntro();

    box.classList.remove('anim-fade-scale');
    void box.offsetWidth;
    box.classList.add('anim-fade-scale');

    backdrop.classList.add('open');
    document.body.classList.add('modal-open');
}

function forceCloseExamModal() {
    const backdrop = document.getElementById('examModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    if (!document.querySelector('.tool-modal-backdrop.open')) document.body.classList.remove('modal-open');
    examState = null;
    examLoadToken++;   // batalkan permintaan yang masih berjalan
}

// Tombol Tutup (✕) pada modal ujian.
function closeExamModal() {
    // Layar hasil LULUS: hak sertifikat masih aktif -> wajib konfirmasi
    if (certRightActive) {
        confirmCloseWithRightActive();
        return;
    }
    // Ujian berjalan dan sudah ada jawaban -> konfirmasi
    const s = examState;
    if (s && s.inProgress && (s.index > 0 || s.selected !== null)) {
        examConfirm('Keluar dari ujian? Jawabanmu sejauh ini akan hilang.', 'Ya, keluar', forceCloseExamModal);
        return;
    }
    forceCloseExamModal();
}

// Klik area gelap: hanya menutup di layar pembuka/hasil GAGAL.
// Saat ujian berjalan atau hak sertifikat aktif -> diabaikan.
function closeExamModalOnBackdrop(event) {
    if (event.target.id !== 'examModalBackdrop') return;
    if (certRightActive) return;
    if (examState && examState.inProgress) return;
    forceCloseExamModal();
}

function examBackToMaterials() {
    forceCloseExamModal();
    const list = document.getElementById('learningList');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Tombol "🎓 Buat Sertifikat" di layar hasil LULUS -> alur sertifikat yang sudah ada.
// Hak sertifikat TETAP aktif (belum terpakai) dan pengaman tetap menyala.
function startCertificateFromExam() {
    if (!certRightActive) return;
    forceCloseExamModal();
    if (typeof openCertModal === 'function') openCertModal();
}

// ==================================================
// HAK SERTIFIKAT: HOOK DARI js/script.js (alur sertifikat)
// ==================================================
function certRightIsActive() {
    return certRightActive;
}

// Skor ujian yang baru lulus, untuk dicetak di sertifikat (null kalau hak tidak aktif)
function certRightScore() {
    return certRightActive ? certExamScore : null;
}

// certToken dari server untuk saveCertificate (null kalau hak tidak aktif). Hanya di memori.
function certRightToken() {
    return certRightActive ? certRightTokenValue : null;
}

// Server menolak token (kedaluwarsa / sudah dipakai): hak hilang, pengaman dilepas.
function examOnCertTokenInvalid() {
    certRightActive = false;
    certExamScore = null;
    certRightTokenValue = null;
    removeExamGuards();
}

// Dipanggil setelah sertifikat BERHASIL digambar DAN Certificate ID tersimpan di server.
// Sejak saat ini hak terpakai: pengaman penutupan (a) tidak berlaku lagi.
function onCertificateIssued() {
    certRightActive = false;
    certExamScore = null;
    certRightTokenValue = null;
    certPendingDownload = true;
    removeExamGuards();
}

function onCertificateDownloaded() {
    certPendingDownload = false;
}

// Dipanggil closeCertModal(). Return true kalau penutupan dicegat (dialog ditampilkan).
function requestCertClose() {
    if (certRightActive) {
        confirmCloseWithRightActive();
        return true;
    }
    if (certPendingDownload) {
        examConfirm('Sertifikat belum diunduh. Simpan Certificate ID atau link verifikasimu untuk mengunduhnya lagi nanti. Tutup?',
            'Ya, tutup', function () {
                certPendingDownload = false;
                if (typeof closeCertModal === 'function') closeCertModal(true);
            });
        return true;
    }
    return false;
}

function confirmCloseWithRightActive() {
    examConfirm('Kalau ditutup, kamu harus ujian ulang untuk dapat sertifikat. Yakin?', 'Ya, tutup', function () {
        certRightActive = false;
        certExamScore = null;
        certRightTokenValue = null;
        removeExamGuards();
        forceCloseExamModal();
        if (typeof closeCertModal === 'function') closeCertModal(true);
    });
}

// ==================================================
// DIALOG KONFIRMASI (menggantikan confirm() bawaan supaya proporsional di mobile)
// ==================================================
function examConfirm(message, yesLabel, onYes) {
    const backdrop = document.getElementById('examConfirmBackdrop');
    const msg = document.getElementById('examConfirmMsg');
    const yes = document.getElementById('examConfirmYes');
    const no = document.getElementById('examConfirmNo');
    if (!backdrop || !msg || !yes || !no) return;

    msg.textContent = message;
    yes.textContent = yesLabel;
    examConfirmOpen = true;
    backdrop.classList.add('open');

    const close = () => {
        examConfirmOpen = false;
        backdrop.classList.remove('open');
        yes.onclick = null;
        no.onclick = null;
        backdrop.onclick = null;
    };
    yes.onclick = () => { close(); onYes(); };
    no.onclick = close;
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
    setTimeout(() => no.focus(), 50);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && examConfirmOpen) {
        const no = document.getElementById('examConfirmNo');
        if (no) no.click();
    }
});

// ==================================================
// PENGAMAN: TOMBOL BACK + RELOAD/TUTUP TAB selama hak sertifikat aktif
// ==================================================
function onExamPopState() {
    if (!examGuardsOn) return;
    // Browser sudah mundur 1 langkah: pasang lagi entri penjaga, lalu tanya user
    history.pushState({ kapazzExamGuard: true }, '');
    if (!examConfirmOpen) confirmCloseWithRightActive();
}

function onExamBeforeUnload(e) {
    if (!examGuardsOn) return;
    e.preventDefault();
    e.returnValue = '';
}

function addExamGuards() {
    if (examGuardsOn) return;
    examGuardsOn = true;
    history.pushState({ kapazzExamGuard: true }, '');
    window.addEventListener('popstate', onExamPopState);
    window.addEventListener('beforeunload', onExamBeforeUnload);
}

function removeExamGuards() {
    if (!examGuardsOn) return;
    examGuardsOn = false;
    window.removeEventListener('popstate', onExamPopState);
    window.removeEventListener('beforeunload', onExamBeforeUnload);
    // buang entri penjaga supaya tombol back berikutnya berfungsi normal
    if (history.state && history.state.kapazzExamGuard) history.back();
}
