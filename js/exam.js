// ==================================================
// UJIAN AKHIR (gerbang sebelum Sertifikat)
// Sistem terpisah dari Bitcoin Quiz (tidak memakai logic/state-nya).
// Bank soal: js/exam-questions.js (field "explanation" disimpan tapi
// TIDAK ditampilkan di mana pun — tidak ada review jawaban).
//
// Alur: tombol "Ikuti Ujian Akhir" (8/8 materi) -> layar pembuka (aturan +
// nilai terakhir) -> 21 soal tanpa feedback -> layar hasil (skor + status).
// Lulus -> hak membuat sertifikat yang HANYA hidup di memori JS (certRightActive).
// Reload / tutup modal = hak hilang. Skor terakhir disimpan di localStorage
// 'kapazzExamLastResult'. Pengaman penutupan tidak sengaja ada di bawah.
// ==================================================
// Ujian SELALU menanyakan SEMUA soal di bank (21 soal, simbolis "21 juta BTC").
// Yang diacak hanya URUTAN soal (dan urutan pilihan, kecuali soal Benar/Salah).
const EXAM_PASS_MIN = 16;       // minimal benar untuk lulus (16 dari 21)
const EXAM_SHUFFLE_OPTIONS = true;
const EXAM_LAST_RESULT_KEY = 'kapazzExamLastResult';

let examState = null;

// ---- Hak membuat sertifikat (HANYA di memori, bukan localStorage) ----
let certRightActive = false;     // lulus ujian & sertifikat belum berhasil dibuat
let certPendingDownload = false; // sertifikat sudah dibuat tapi belum diunduh

// ---- Pengaman: history (tombol back) + beforeunload ----
let examGuardsOn = false;
let examConfirmOpen = false;

function examShuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a;
}

function examEscape(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Ambil SEMUA soal dari bank, lalu acak urutannya (shuffle seluruh array).
function buildExamQuestions() {
    return examShuffle(EXAM_QUESTIONS).map(q => {
        const isTrueFalse = q.options.length === 2 && q.options[0] === 'Benar' && q.options[1] === 'Salah';
        let order = q.options.map((text, idx) => ({ text: text, idx: idx }));
        if (EXAM_SHUFFLE_OPTIONS && !isTrueFalse) order = examShuffle(order);
        return { q: q.q, answer: q.answer, options: order };
    });
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
    const total = EXAM_QUESTIONS.length;
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
        '<button type="button" class="calculate-btn exam-start-btn" onclick="startExam()">Mulai Ujian</button>'
    );
}

function startExam() {
    examState = {
        questions: buildExamQuestions(),
        index: 0,
        picked: [],
        selected: null,
        inProgress: true
    };
    renderExamQuestion();
}

function renderExamQuestion() {
    const s = examState;
    const total = s.questions.length;
    const current = s.questions[s.index];
    const isLast = s.index === total - 1;

    let optionsHTML = '';
    current.options.forEach((opt, pos) => {
        optionsHTML += '<button type="button" class="exam-option" role="radio" aria-checked="false" ' +
            'data-pos="' + pos + '" onclick="selectExamOption(' + pos + ')">' +
            '<span class="exam-option-dot" aria-hidden="true"></span>' +
            '<span class="exam-option-text">' + examEscape(opt.text) + '</span></button>';
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
    if (!examState || !examState.inProgress) return;
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
    if (!s || !s.inProgress || s.selected === null) return;

    const current = s.questions[s.index];
    s.picked[s.index] = current.options[s.selected].idx;
    s.selected = null;
    s.index++;

    if (s.index >= s.questions.length) {
        finishExam();
    } else {
        renderExamQuestion();
    }
}

// Layar hasil: HANYA skor + status. Tidak ada review, kunci jawaban,
// penanda soal salah, atau petunjuk materi lemah.
function finishExam() {
    const s = examState;
    s.inProgress = false;

    const total = s.questions.length;
    let score = 0;
    s.questions.forEach((q, i) => {
        if (s.picked[i] === q.answer) score++;
    });
    const passed = score >= EXAM_PASS_MIN;

    saveLastExamResult(score, total, passed);

    if (passed) {
        // Hak membuat sertifikat: hanya di memori. Aktifkan pengaman penutupan.
        certRightActive = true;
        certPendingDownload = false;
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
            '<button type="button" class="calculate-btn exam-action-btn" onclick="startExam()">🔄 Coba Lagi</button>' +
            '<button type="button" class="exam-secondary-btn" onclick="examBackToMaterials()">📚 Kembali ke Materi</button>' +
            '</div>' +
            '</div>'
        );
    }
}

// ==================================================
// BUKA / TUTUP MODAL UJIAN
// ==================================================
function openExamModal() {
    const backdrop = document.getElementById('examModalBackdrop');
    const box = document.getElementById('examModalBox');
    if (!backdrop || typeof EXAM_QUESTIONS === 'undefined') return;

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

// Dipanggil setelah sertifikat BERHASIL digambar DAN Certificate ID tersimpan di server.
// Sejak saat ini hak terpakai: pengaman penutupan (a) tidak berlaku lagi.
function onCertificateIssued() {
    certRightActive = false;
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
        examConfirm('Sertifikat belum diunduh. Kalau ditutup, kamu harus ujian ulang untuk membuatnya lagi. Tutup?',
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
